import ee
import pandas as pd
import numpy as np
import requests
import lightgbm as lgb
from scipy.interpolate import UnivariateSpline
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta, timezone

# =========================
# Initialize Earth Engine
# =========================
# =========================
# Initialize Earth Engine (Service Account - Hardcoded)
# =========================
import ee

SERVICE_ACCOUNT = "aqi-backend@aqi-predict-488017.iam.gserviceaccount.com"
KEY_PATH = "key.json"   # Keep this file in same folder as script

try:
    credentials = ee.ServiceAccountCredentials(SERVICE_ACCOUNT, KEY_PATH)
    ee.Initialize(credentials)
    print("✅ Earth Engine initialized with Service Account")
except Exception as e:
    print("❌ Service Account failed, falling back to manual auth...")
    ee.Authenticate()
    ee.Initialize()

# =========================
# Load Model
# =========================
# Ensure the model file is in the same directory as this script
model = lgb.Booster(model_file="india_aqi_lightgbm_gpu_model.txt")

features = [
    'Latitude', 'Longitude', 'AOD',
    'Temp_2m_C', 'Humidity_Percent',
    'Wind_Speed_10m_kmh', 'Wind_Dir_10m',
    'Precipitation_mm', 'Pressure_MSL_hPa',
    'Cloud_Cover_Percent'
]

# =========================
# 1. AOD Retrieval & Interpolation
# =========================
def get_gapless_aod(lat, lon, lookback_days=365):
    """
    Implements the spatiotemporal gap-filling algorithm to estimate AOD for the current day.
    """
    target_point = ee.Geometry.Point([lon, lat])
    region = target_point.buffer(15000).bounds()

    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=lookback_days)

    collection = ee.ImageCollection('MODIS/061/MCD19A2_GRANULES') \
        .filterBounds(region) \
        .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')) \
        .select('Optical_Depth_055')

    ee_start_date = ee.Date(start_date.strftime('%Y-%m-%d'))
    days_list = ee.List.sequence(0, lookback_days)

    def daily_mosaic(day_offset):
        current_date = ee_start_date.advance(day_offset, 'day')
        daily_col = collection.filterDate(current_date, current_date.advance(1, 'day'))
        mosaic = daily_col.mean().set('system:time_start', current_date.millis())
        return mosaic

    daily_collection = ee.ImageCollection.fromImages(days_list.map(daily_mosaic))

    try:
        ts_data = daily_collection.getRegion(region, scale=5000).getInfo()
    except Exception as e:
        return {'status': 'error', 'message': f'Earth Engine API error: {e}'}

    if not ts_data or len(ts_data) <= 1:
        return {'status': 'error', 'message': 'No historical data found to build interpolation model.'}

    header = ts_data[0]
    df = pd.DataFrame(ts_data[1:], columns=header)
    df = df.dropna(subset=['Optical_Depth_055'])

    if df.empty:
        return {'status': 'error', 'message': 'No valid AOD data in the region over the lookback period.'}

    df['Optical_Depth_055'] = df['Optical_Depth_055'] * 0.001
    df['datetime'] = pd.to_datetime(df['time'], unit='ms')
    df['day_of_year'] = df['datetime'].dt.dayofyear
    df['date_str'] = df['datetime'].dt.strftime('%Y-%m-%d')

    df['distance'] = np.sqrt((df['latitude'] - lat) ** 2 + (df['longitude'] - lon) ** 2)
    target_coords = df.loc[df['distance'].idxmin()][['latitude', 'longitude']]
    target_lat, target_lon = target_coords['latitude'], target_coords['longitude']

    target_df = df[(df['latitude'] == target_lat) & (df['longitude'] == target_lon)].copy()
    neighbors_df = df[(df['latitude'] != target_lat) | (df['longitude'] != target_lon)].copy()

    today_str = end_date.strftime('%Y-%m-%d')
    today_doy = end_date.timetuple().tm_yday

    # STEP 1: Direct Observation
    target_today = target_df[target_df['date_str'] == today_str]
    if not target_today.empty:
        return {
            'status': 'success',
            'aod': round(target_today['Optical_Depth_055'].values[0], 4),
            'method': 'Direct Observation (No Interpolation)',
            'timestamp_utc': target_today['datetime'].dt.strftime('%Y-%m-%d %H:%M:%S').values[0]
        }

    # STEP 2: Temporal Spline
    if len(target_df) < 10:
        return {'status': 'error', 'message': 'Not enough historical data at target to fit temporal spline.'}

    trend_data = target_df.groupby('day_of_year')['Optical_Depth_055'].mean().reset_index()
    trend_data = trend_data.sort_values('day_of_year')
    spline = UnivariateSpline(trend_data['day_of_year'], trend_data['Optical_Depth_055'], s=0.5)
    target_trend_today = float(spline(today_doy))

    # STEP 3: Spatial Interpolation
    neighbors_today = neighbors_df[neighbors_df['date_str'] == today_str]

    if neighbors_today.empty:
        return {
            'status': 'success',
            'aod': max(0, round(target_trend_today, 4)),
            'method': 'Temporal Spline Only (Regional Cloud Cover)',
            'timestamp_utc': end_date.strftime('%Y-%m-%d %H:%M:%S')
        }

    best_correlation = -1
    best_neighbor_pred = None

    target_ts = target_df.groupby('date_str')['Optical_Depth_055'].mean()
    unique_neighbors = neighbors_today[['latitude', 'longitude']].drop_duplicates()

    for _, neighbor in unique_neighbors.iterrows():
        n_lat, n_lon = neighbor['latitude'], neighbor['longitude']
        n_df = neighbors_df[(neighbors_df['latitude'] == n_lat) & (neighbors_df['longitude'] == n_lon)]
        n_ts = n_df.groupby('date_str')['Optical_Depth_055'].mean()

        aligned = pd.concat([target_ts, n_ts], axis=1, join='inner').dropna()
        if len(aligned) > 5:
            corr = np.corrcoef(aligned.iloc[:, 0], aligned.iloc[:, 1])[0, 1]

            if corr > best_correlation:
                best_correlation = corr
                X = aligned.iloc[:, 1].values.reshape(-1, 1)
                y = aligned.iloc[:, 0].values
                regression_model = LinearRegression().fit(X, y)
                n_val_today = neighbors_today[(neighbors_today['latitude'] == n_lat) &
                                              (neighbors_today['longitude'] == n_lon)]['Optical_Depth_055'].values[0]
                best_neighbor_pred = regression_model.predict([[n_val_today]])[0]

    # STEP 4: Reconstruct Final AOD
    if best_neighbor_pred is not None:
        final_aod = best_neighbor_pred
        method = 'Spatiotemporal Fitting (ICW)'
    else:
        final_aod = target_trend_today
        method = 'Temporal Spline Only (Insufficient neighbor correlation)'

    return {
        'status': 'success',
        'aod': max(0, round(final_aod, 4)),
        'method': method,
        'timestamp_utc': end_date.strftime('%Y-%m-%d %H:%M:%S')
    }

# =========================
# 2. Weather Fetching
# =========================
def get_weather(lat, lon):
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}"
        f"&current=temperature_2m,relative_humidity_2m,precipitation,"
        f"wind_speed_10m,wind_direction_10m,pressure_msl,cloud_cover"
    )

    response = requests.get(url).json()
    current = response["current"]

    return {
        "Temp_2m_C": current["temperature_2m"],
        "Humidity_Percent": current["relative_humidity_2m"],
        "Wind_Speed_10m_kmh": current["wind_speed_10m"],
        "Wind_Dir_10m": current["wind_direction_10m"],
        "Precipitation_mm": current["precipitation"],
        "Pressure_MSL_hPa": current["pressure_msl"],
        "Cloud_Cover_Percent": current["cloud_cover"]
    }

# =========================
# 3. PM2.5 to Indian NAQI
# =========================
def calculate_indian_aqi(pm25):
    """
    Converts PM2.5 concentration to Indian National Air Quality Index (NAQI).
    """
    # Breakpoints: (C_low, C_high, I_low, I_high, Category)
    breakpoints = [
        (0.0, 30.0, 0, 50, "Good"),
        (30.1, 60.0, 51, 100, "Satisfactory"),
        (60.1, 90.0, 101, 200, "Moderate"),
        (90.1, 120.0, 201, 300, "Poor"),
        (120.1, 250.0, 301, 400, "Very Poor"),
        (250.1, 9999.9, 401, 500, "Severe")
    ]

    for (c_low, c_high, i_low, i_high, cat) in breakpoints:
        if c_low <= pm25 <= c_high:
            # Piecewise linear interpolation formula
            aqi = ((i_high - i_low) / (c_high - c_low)) * (pm25 - c_low) + i_low
            return round(aqi), cat

    # Fallback if PM2.5 is off the chart
    if pm25 > 250:
        return 500, "Severe (Off-chart)"
    return 0, "Unknown"

# =========================
# MAIN EXECUTION
# =========================
if __name__ == "__main__":
    print("\n==== Satellite-Based India AQI Predictor ====\n")

    try:
        lat = float(input("Enter Latitude (e.g., 21.1747): "))
        lon = float(input("Enter Longitude (e.g., 81.3473): "))
    except ValueError:
        print("Invalid input. Defaulting to Bhilai coordinates...")
        lat, lon = 21.1747, 81.3473

    print("\n[1/3] Fetching satellite data and interpolating AOD...")
    aod_data = get_gapless_aod(lat, lon)

    if aod_data['status'] == 'error':
        print(f"\n❌ Aborting: {aod_data['message']}")
    else:
        aod_val = aod_data['aod']
        aod_method = aod_data['method']
        aod_time = aod_data['timestamp_utc'] # Extracted the timestamp here!

        print(f"✅ AOD Acquired: {aod_val} (Method: {aod_method})")

        print("[2/3] Fetching current weather conditions...")
        weather = get_weather(lat, lon)
        print("✅ Weather Data Acquired")

        print("[3/3] Running LightGBM PM2.5 Prediction...")
        row = {
            "Latitude": lat,
            "Longitude": lon,
            "AOD": aod_val,
            **weather
        }

        df = pd.DataFrame([row])[features]
        pm25_pred = model.predict(df)[0]

        # Ensure PM2.5 isn't negative due to model extrapolation
        pm25_pred = max(0.0, pm25_pred)

        print("✅ PM2.5 Prediction Complete")

        # Convert PM2.5 to Indian AQI
        aqi_score, aqi_category = calculate_indian_aqi(pm25_pred)

        # =========================
        # Final Output Dashboard
        # =========================
        print("\n==============================================")
        print("             AQI PREDICTION REPORT              ")
        print("==============================================")
        print(f"Location:           {lat}, {lon}")
        print(f"AOD Value:          {aod_val}")
        print(f"AOD Source:         {aod_method}")
        print(f"Observation Time:   {aod_time} UTC") # Added it to the dashboard here!
        print("----------------------------------------------")
        print(f"Predicted PM2.5:    {round(pm25_pred, 2)} µg/m³")
        print(f"Indian NAQI:        {aqi_score}")
        print(f"Category:           {aqi_category}")
        print("==============================================")