import ee
import pandas as pd
import numpy as np
import requests
import lightgbm as lgb
from scipy.interpolate import UnivariateSpline
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta, timezone
from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback

# =========================
# Initialize Earth Engine
# =========================
try:
    # Using the new initialization project from predict_aqi_new
    ee.Initialize(project='aqi-predict-488017')
    print("✅ Earth Engine initialized with project: aqi-predict-488017")
except Exception as e:
    print(f"❌ Standard Initialize failed: {e}")
    # Fallback to Service Account if needed, based on old script
    SERVICE_ACCOUNT = "aqi-backend@aqi-predict-488017.iam.gserviceaccount.com"
    KEY_PATH = "key.json"
    try:
        credentials = ee.ServiceAccountCredentials(SERVICE_ACCOUNT, KEY_PATH)
        ee.Initialize(credentials)
        print("✅ Earth Engine initialized with Service Account fallback")
    except Exception as fallback_e:
        print(f"❌ Fallback also failed: {fallback_e}")

# =========================
# Load Model
# =========================
model = lgb.Booster(model_file="india_aqi_lightgbm_gpu_model.txt")

features = [
    'Latitude', 'Longitude', 'AOD',
    'Temp_2m_C', 'Humidity_Percent',
    'Wind_Speed_10m_kmh', 'Wind_Dir_10m',
    'Precipitation_mm', 'Pressure_MSL_hPa',
    'Cloud_Cover_Percent'
]

# =========================
# 1. AOD Retrieval & Interpolation (New Logic)
# =========================
def get_gapless_aod(lat, lon, lookback_days=365):
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
    tomorrow_doy = (end_date + timedelta(days=1)).timetuple().tm_yday

    # STEP 1: Temporal Spline
    if len(target_df) < 10:
        return {'status': 'error', 'message': 'Not enough historical data at target to fit temporal spline.'}

    trend_data = target_df.groupby('day_of_year')['Optical_Depth_055'].mean().reset_index()
    trend_data = trend_data.sort_values('day_of_year')
    spline = UnivariateSpline(trend_data['day_of_year'], trend_data['Optical_Depth_055'], s=0.5)

    target_trend_today = float(spline(today_doy))
    target_trend_tomorrow = float(spline(tomorrow_doy))

    # STEP 2: Direct Observation
    target_today = target_df[target_df['date_str'] == today_str]
    if not target_today.empty:
        return {
            'status': 'success',
            'aod_today': round(target_today['Optical_Depth_055'].values[0], 4),
            'aod_tomorrow': round(target_trend_tomorrow, 4),
            'method': 'Direct Observation (Today) / Temporal Spline (Tomorrow)',
            'timestamp_utc': target_today['datetime'].dt.strftime('%Y-%m-%d %H:%M:%S').values[0]
        }

    # STEP 3: Spatial Interpolation
    neighbors_today = neighbors_df[neighbors_df['date_str'] == today_str]
    if neighbors_today.empty:
        return {
            'status': 'success',
            'aod_today': max(0, round(target_trend_today, 4)),
            'aod_tomorrow': max(0, round(target_trend_tomorrow, 4)),
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
        final_aod_today = best_neighbor_pred
        method = 'Spatiotemporal Fitting (Today) / Temporal Spline (Tomorrow)'
    else:
        final_aod_today = target_trend_today
        method = 'Temporal Spline Only (Insufficient neighbor correlation)'

    return {
        'status': 'success',
        'aod_today': max(0, round(final_aod_today, 4)),
        'aod_tomorrow': max(0, round(target_trend_tomorrow, 4)),
        'method': method,
        'timestamp_utc': end_date.strftime('%Y-%m-%d %H:%M:%S')
    }

# =========================
# 2. Weather Fetching (New Logic)
# =========================
def get_daily_weather(lat, lon):
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}"
        f"&hourly=temperature_2m,relative_humidity_2m,precipitation,"
        f"wind_speed_10m,wind_direction_10m,pressure_msl,cloud_cover"
        f"&forecast_days=2"
    )

    response = requests.get(url).json()
    hourly = response["hourly"]

    def calculate_daily_avg(start_idx, end_idx):
        return {
            "Temp_2m_C": sum(hourly["temperature_2m"][start_idx:end_idx]) / 24,
            "Humidity_Percent": sum(hourly["relative_humidity_2m"][start_idx:end_idx]) / 24,
            "Wind_Speed_10m_kmh": sum(hourly["wind_speed_10m"][start_idx:end_idx]) / 24,
            "Wind_Dir_10m": sum(hourly["wind_direction_10m"][start_idx:end_idx]) / 24,
            "Precipitation_mm": sum(hourly["precipitation"][start_idx:end_idx]) / 24,
            "Pressure_MSL_hPa": sum(hourly["pressure_msl"][start_idx:end_idx]) / 24,
            "Cloud_Cover_Percent": sum(hourly["cloud_cover"][start_idx:end_idx]) / 24
        }

    return calculate_daily_avg(0, 24), calculate_daily_avg(24, 48)

# =========================
# 3. PM2.5 to Indian NAQI
# =========================
def calculate_indian_aqi(pm25):
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
            aqi = ((i_high - i_low) / (c_high - c_low)) * (pm25 - c_low) + i_low
            return round(aqi), cat
    if pm25 > 250:
        return 500, "Severe (Off-chart)"
    return 0, "Unknown"

# =========================
# FLASK BACKEND
# =========================
app = Flask(__name__)
CORS(app)

@app.route('/aqi', methods=['GET'])
def get_aqi_endpoint():
    try:
        lat_str = request.args.get('lat')
        lon_str = request.args.get('lon')
        
        if not lat_str or not lon_str:
            return jsonify({'error': 'Missing lat or lon parameters'}), 400
            
        lat = float(lat_str)
        lon = float(lon_str)

        print(f"\n[GET /aqi] Fetching for Lat: {lat}, Lon: {lon}")
        
        # 1. Fetch satellite data (including tomorrow projection)
        aod_data = get_gapless_aod(lat, lon)
        if aod_data['status'] == 'error':
            print(f"❌ Aborting: {aod_data['message']}")
            return jsonify({'error': aod_data['message']}), 500
            
        aod_today = aod_data['aod_today']
        aod_tomorrow = aod_data['aod_tomorrow']
        aod_method = aod_data['method']
        aod_time = aod_data['timestamp_utc']

        # 2. Fetch daily weather averages
        weather_today, weather_tomorrow = get_daily_weather(lat, lon)

        # 3. Predict Today
        row_today = pd.DataFrame([{"Latitude": lat, "Longitude": lon, "AOD": aod_today, **weather_today}])[features]
        pm25_today = max(0.0, model.predict(row_today)[0])
        aqi_today, cat_today = calculate_indian_aqi(pm25_today)

        # 4. Predict Tomorrow (Forecast)
        row_tomorrow = pd.DataFrame([{"Latitude": lat, "Longitude": lon, "AOD": aod_tomorrow, **weather_tomorrow}])[features]
        pm25_tomorrow = max(0.0, model.predict(row_tomorrow)[0])
        aqi_tomorrow, cat_tomorrow = calculate_indian_aqi(pm25_tomorrow)
        
        print(f"✅ Prediction Complete -> Today AQI: {aqi_today}, Tomorrow AQI: {aqi_tomorrow}")

        # Return response compatible with existing frontend + added forecast data
        return jsonify({
            'aqi': aqi_today,
            'pm25': round(pm25_today, 2),
            'category': cat_today,
            'aod': aod_today,
            'aod_method': aod_method,
            'aod_time': aod_time,
            'forecast': {
                'tomorrow_aqi': aqi_tomorrow,
                'tomorrow_pm25': round(pm25_tomorrow, 2),
                'tomorrow_category': cat_tomorrow,
                'tomorrow_aod': aod_tomorrow
            }
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    print("\n==== Satellite-Based India Daily AQI Forecaster Backend Starting ====\n")
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)