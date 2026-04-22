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
import sqlite3
import hashlib
import re
import os
import csv
from io import StringIO
from flask import Response
import tempfile


# =========================
# Initialize Earth Engine
# =========================
try:
    # Using the new initialization project from predict_aqi_new
    ee.Initialize(project='aqi-predict-488017')
    print("Earth Engine initialized with project: aqi-predict-488017")
except Exception as e:
    print(f"Standard Initialize failed: {e}")
    # Fallback to Service Account if needed, based on old script
    SERVICE_ACCOUNT = "aqi-backend@aqi-predict-488017.iam.gserviceaccount.com"
    KEY_PATH = "key.json"
    try:
        credentials = ee.ServiceAccountCredentials(SERVICE_ACCOUNT, KEY_PATH)
        ee.Initialize(credentials)
        print("Earth Engine initialized with Service Account fallback")
    except Exception as fallback_e:
        print(f"Fallback also failed: {fallback_e}")

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
    try:
        print("DEBUG: Inside get_gapless_aod, creating target_point")
        target_point = ee.Geometry.Point([lon, lat])
        print("DEBUG: target_point created")
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

        ts_data = daily_collection.getRegion(region, scale=5000).getInfo()

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
    except Exception as e:
        return {'status': 'error', 'message': f'Earth Engine API error: {e}'}

# =========================
# 2. Weather Fetching (New Logic)
# =========================

# Removed get_detailed_pollutants and forecast_7d as per user request


# =========================
# 3. PM2.5 to Indian NAQI
# =========================
def calculate_indian_aqi(pm25):
    pm25 = float(pm25)
    print(f"DEBUG: Calculating AQI for PM2.5 = {pm25}")
    
    if pm25 < 0:
        return 0, "Good"
    elif pm25 <= 30:
        aqi = (50 / 30) * pm25
    elif pm25 <= 60:
        aqi = ((100 - 51) / (60 - 31)) * (pm25 - 31) + 51
    elif pm25 <= 90:
        aqi = ((200 - 101) / (90 - 61)) * (pm25 - 61) + 101
    elif pm25 <= 120:
        aqi = ((300 - 201) / (120 - 91)) * (pm25 - 91) + 201
    elif pm25 <= 250:
        aqi = ((400 - 301) / (250 - 121)) * (pm25 - 121) + 301
    else:
        aqi = ((500 - 401) / (500 - 251)) * (pm25 - 251) + 401
        
    category = "Unknown"
    if aqi <= 50: category = "Good"
    elif aqi <= 100: category = "Satisfactory"
    elif aqi <= 200: category = "Moderate"
    elif aqi <= 300: category = "Poor"
    elif aqi <= 400: category = "Very Poor"
    else: category = "Severe"
    
    final_aqi = min(500, max(0, round(aqi)))
    print(f"DEBUG: Result -> AQI: {final_aqi}, Category: {category}")
    return final_aqi, category

# =========================
# DATABASE SETUP
# =========================
DB_PATH = os.path.join(os.path.dirname(__file__), "users.db")

def get_db():
    """Get a thread-safe SQLite connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Create the users table if it doesn't exist."""
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT    NOT NULL,
            email       TEXT    UNIQUE NOT NULL,
            password    TEXT    NOT NULL,
            phone       TEXT,
            city        TEXT,
            state       TEXT,
            country     TEXT,
            profile_pic TEXT,
            health_condition TEXT DEFAULT 'Normal',
            created_at  TEXT    DEFAULT (datetime('now'))
        )
    """)
    conn.commit()
    conn.close()
    print("SQLite database initialized:", DB_PATH)

def hash_password(password: str) -> str:
    """SHA-256 hash of the password."""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

# =========================
# FLASK BACKEND
# =========================
app = Flask(__name__)
CORS(app)

# -----------------------------------------------
# AUTH ENDPOINTS
# -----------------------------------------------

@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json(force=True)

    name     = (data.get('name') or '').strip()
    email    = (data.get('email') or '').strip().lower()
    password = (data.get('password') or '').strip()
    phone    = (data.get('phone') or '').strip()
    city     = (data.get('city') or '').strip()
    state    = (data.get('state') or '').strip()
    country  = (data.get('country') or '').strip()
    profile_pic = data.get('profilePic') or ''
    health_condition = data.get('healthCondition') or 'Normal'

    # Basic validation
    if not name:
        return jsonify({'success': False, 'message': 'Full name is required'}), 400
    if not email or not re.match(r'^[\w.+-]+@[\w-]+\.[\w.]+$', email):
        return jsonify({'success': False, 'message': 'A valid email is required'}), 400
    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters'}), 400

    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO users (name, email, password, phone, city, state, country, profile_pic, health_condition) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (name, email, hash_password(password), phone, city, state, country, profile_pic, health_condition)
        )
        conn.commit()
        print(f"New user registered: {email}")
        return jsonify({'success': True, 'message': 'Registration successful'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'message': 'Email already registered'}), 409
    finally:
        conn.close()


@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json(force=True)

    email    = (data.get('email') or '').strip().lower()
    password = (data.get('password') or '').strip()

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required'}), 400

    conn = get_db()
    try:
        user = conn.execute(
            "SELECT id, name, email, phone, city, state, country, profile_pic, health_condition, created_at "
            "FROM users WHERE email = ? AND password = ?",
            (email, hash_password(password))
        ).fetchone()

        if user is None:
            return jsonify({'success': False, 'message': 'Invalid email or password'}), 401

        user_dict = dict(user)
        user_dict['profilePic'] = user_dict.pop('profile_pic', '')
        print(f"User logged in: {email}")
        return jsonify({'success': True, 'user': user_dict}), 200
    finally:
        conn.close()


@app.route('/auth/user/<email>', methods=['GET'])
def get_user(email):
    conn = get_db()
    try:
        user = conn.execute(
            "SELECT id, name, email, phone, city, state, country, profile_pic, health_condition, created_at "
            "FROM users WHERE email = ?",
            (email.lower(),)
        ).fetchone()

        if user is None:
            return jsonify({'success': False, 'message': 'User not found'}), 404

        user_dict = dict(user)
        user_dict['profilePic'] = user_dict.pop('profile_pic', '')
        return jsonify({'success': True, 'user': user_dict}), 200
    finally:
        conn.close()

@app.route('/auth/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json(force=True)
    email = (data.get('email') or '').strip().lower()
    new_password = (data.get('newPassword') or '').strip()

    if not email or len(new_password) < 6:
        return jsonify({'success': False, 'message': 'Invalid email or password too short'}), 400

    conn = get_db()
    try:
        user = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if not user:
            return jsonify({'success': False, 'message': 'Email not found'}), 404
        
        conn.execute("UPDATE users SET password = ? WHERE email = ?", (hash_password(new_password), email))
        conn.commit()
        return jsonify({'success': True, 'message': 'Password reset successful'}), 200
    finally:
        conn.close()

@app.route('/auth/upload-profile-pic', methods=['POST'])
def upload_profile_pic():
    data = request.get_json(force=True)
    email = (data.get('email') or '').strip().lower()
    profile_pic = data.get('profilePic')

    if not email or not profile_pic:
        return jsonify({'success': False, 'message': 'Missing email or image data'}), 400

    conn = get_db()
    try:
        conn.execute("UPDATE users SET profile_pic = ? WHERE email = ?", (profile_pic, email))
        conn.commit()
        return jsonify({'success': True, 'message': 'Profile picture updated'}), 200
    finally:
        conn.close()


# Removed Favorites Endpoints

# -----------------------------------------------
# AQI ENDPOINT
# -----------------------------------------------

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
            print(f"Earth Engine error: {aod_data['message']}. Using mock AOD.")
            aod_today = 0.5
            aod_tomorrow = 0.5
            aod_method = "Mock Fallback (EE Not Authenticated)"
            aod_time = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
        else:
            aod_today = aod_data['aod_today']
            aod_tomorrow = aod_data['aod_tomorrow']
            aod_method = aod_data['method']
            aod_time = aod_data['timestamp_utc']

        # Weather fetching for today and tomorrow's prediction
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}"
            f"&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation,pressure_msl,cloud_cover"
            f"&forecast_days=2"
        )

        weather_res = requests.get(url).json()
        hourly = weather_res.get("hourly", {})
        
        def get_avg(key, default_val, start, end):
            data = hourly.get(key, [])
            if len(data) >= end:
                # filter out None values before summing
                valid_data = [x for x in data[start:end] if x is not None]
                if len(valid_data) > 0:
                    return sum(valid_data) / len(valid_data)
            return default_val

        weather_today = {
            "Temp_2m_C": get_avg("temperature_2m", 25, 0, 24),
            "Humidity_Percent": get_avg("relative_humidity_2m", 50, 0, 24),
            "Wind_Speed_10m_kmh": get_avg("wind_speed_10m", 10, 0, 24),
            "Wind_Dir_10m": get_avg("wind_direction_10m", 180, 0, 24),
            "Precipitation_mm": get_avg("precipitation", 0, 0, 24),
            "Pressure_MSL_hPa": get_avg("pressure_msl", 1010, 0, 24),
            "Cloud_Cover_Percent": get_avg("cloud_cover", 10, 0, 24)
        }
        
        weather_tomorrow = {
            "Temp_2m_C": get_avg("temperature_2m", 25, 24, 48),
            "Humidity_Percent": get_avg("relative_humidity_2m", 50, 24, 48),
            "Wind_Speed_10m_kmh": get_avg("wind_speed_10m", 10, 24, 48),
            "Wind_Dir_10m": get_avg("wind_direction_10m", 180, 24, 48),
            "Precipitation_mm": get_avg("precipitation", 0, 24, 48),
            "Pressure_MSL_hPa": get_avg("pressure_msl", 1010, 24, 48),
            "Cloud_Cover_Percent": get_avg("cloud_cover", 10, 24, 48)
        }

        row_df = pd.DataFrame([{"Latitude": lat, "Longitude": lon, "AOD": aod_today, **weather_today}])[features]
        pm25_today = max(0.0, model.predict(row_df)[0])
        aqi_today, cat_today = calculate_indian_aqi(pm25_today)
        
        row_df_tomorrow = pd.DataFrame([{"Latitude": lat, "Longitude": lon, "AOD": aod_tomorrow, **weather_tomorrow}])[features]
        pm25_tomorrow = max(0.0, model.predict(row_df_tomorrow)[0])
        aqi_tomorrow, cat_tomorrow = calculate_indian_aqi(pm25_tomorrow)

        # Simplified Health Recommendation
        health_condition = request.args.get('healthCondition') or 'Normal'
        health_rec = "Safe for outdoor activity."
        if aqi_today > 200:
            health_rec = "Air quality is poor. Wear a mask and limit outdoor activities."
        elif aqi_today > 150:
            health_rec = "Unhealthy air. Use an air purifier and avoid outdoor exercise."
        elif aqi_today > 100:
            if health_condition in ['Asthmatic', 'Elderly']:
                health_rec = f"Caution: As an {health_condition.lower()} person, stay indoors."
            else:
                health_rec = "Sensitive groups should reduce prolonged outdoor exertion."

        return jsonify({
            'aqi': aqi_today,
            'pm25': round(pm25_today, 2),
            'category': cat_today,
            'aqi_tomorrow': aqi_tomorrow,
            'pm25_tomorrow': round(pm25_tomorrow, 2),
            'category_tomorrow': cat_tomorrow,
            'aod': aod_today,
            'aod_method': aod_method,
            'aod_time': aod_time,
            'health_recommendation': health_rec
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/aqi/region', methods=['GET'])
def get_aqi_region():
    try:
        lat_min = float(request.args.get('lat_min', 20))
        lat_max = float(request.args.get('lat_max', 30))
        lon_min = float(request.args.get('lon_min', 70))
        lon_max = float(request.args.get('lon_max', 85))
        
        center_lat = (lat_min + lat_max) / 2
        center_lon = (lon_min + lon_max) / 2
        
        weather_7d = get_daily_weather(center_lat, center_lon)
        weather_today = weather_7d[0] if weather_7d else {"Temp_2m_C": 25, "Humidity_Percent": 50, "Wind_Speed_10m_kmh": 10, "Wind_Dir_10m": 180, "Precipitation_mm": 0, "Pressure_MSL_hPa": 1010, "Cloud_Cover_Percent": 10}
        aod_today = 0.5 
        
        points = []
        lat_step = float(request.args.get('step', 1.0))
        lon_step = float(request.args.get('step', 1.0))
        
        curr_lat = lat_min
        while curr_lat <= lat_max + 0.01:
            curr_lon = lon_min
            while curr_lon <= lon_max + 0.01:
                row_df = pd.DataFrame([{"Latitude": curr_lat, "Longitude": curr_lon, "AOD": aod_today, **weather_today}])[features]
                pm25_pred = max(0.0, model.predict(row_df)[0])
                aqi_pred, _ = calculate_indian_aqi(pm25_pred)
                points.append({"lat": round(curr_lat, 4), "lon": round(curr_lon, 4), "aqi": aqi_pred})
                curr_lon += lon_step
            curr_lat += lat_step
            
        return jsonify({"data": points})

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/aqi/history', methods=['GET'])
def get_aqi_history():
    try:
        lat = float(request.args.get('lat'))
        lon = float(request.args.get('lon'))
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        
        url = (
            f"https://air-quality-api.open-meteo.com/v1/air-quality?"
            f"latitude={lat}&longitude={lon}"
            f"&hourly=pm2_5"
            f"&start_date={start_date.strftime('%Y-%m-%d')}"
            f"&end_date={end_date.strftime('%Y-%m-%d')}"
        )
        
        response = requests.get(url).json()
        if "hourly" not in response:
            return jsonify({'error': 'No historical data available'}), 404
        
        hourly = response["hourly"]
        times = hourly.get("time", [])
        pm25_vals = hourly.get("pm2_5", [])
        
        # Aggregate to daily averages
        daily_data = {}
        for t, pm in zip(times, pm25_vals):
            day = t.split("T")[0]
            if pm is not None:
                if day not in daily_data:
                    daily_data[day] = []
                daily_data[day].append(pm)
        
        history = []
        for day in sorted(daily_data.keys()):
            avg_pm25 = sum(daily_data[day]) / len(daily_data[day])
            aqi_val, cat_val = calculate_indian_aqi(avg_pm25)
            history.append({
                "date": day,
                "pm25": round(avg_pm25, 2),
                "aqi": aqi_val,
                "category": cat_val
            })
        
        return jsonify({"history": history})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    print("\n==== Satellite-Based India Daily AQI Forecaster Backend Starting ====\n")
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)