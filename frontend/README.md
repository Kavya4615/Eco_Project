# 🌿 EcoAir — Real-Time AQI Prediction for India

> A full-stack web application that predicts **PM2.5 and Air Quality Index (AQI)** across India using a **LightGBM machine learning model**, powered by satellite AOD data from Google Earth Engine and real-time weather data.

---

## ✨ Features

- 📍 **Air Quality Near Me** — Auto-detects your location and instantly shows ML-predicted AQI & PM2.5
- 🗺️ **Interactive Map** — Click anywhere on India's map to get a real-time AQI prediction for that pinpoint
- 🔥 **Live Heatmap** — Color-coded AQI heatmap across all of India, interpolated from model anchor nodes
- 🏆 **Live City Rankings** — Real-time AQI ranking for major Indian cities, all from the model
- 📊 **Historical PM2.5 Graph** — Trend chart anchored to your live predicted PM2.5 value
- 🌡️ **Cursor Weather Tracker** — Hover over any point on map to see live temperature + AQI

---

## 🏗️ Architecture

```
Eco_Project/
└── frontend/
    ├── predict_aqi.py              # 🐍 Flask backend — serves /aqi endpoint
    ├── india_aqi_lightgbm_gpu_model.txt  # 🤖 Trained LightGBM model
    ├── key.json                    # 🔐 Google Earth Engine credentials (NOT in git)
    ├── src/
    │   ├── pages/
    │   │   ├── NearMe.jsx          # Air Quality Near Me
    │   │   ├── Map.jsx             # Main map with AQI card
    │   │   ├── LiveMap.jsx         # Heatmap + cursor tracker
    │   │   ├── Ranking.jsx         # City AQI rankings
    │   │   └── Historical.jsx      # PM2.5 trend chart
    │   └── components/
    │       └── Navbar.jsx
    └── package.json
```

### How the Prediction Works

```
Browser (lat, lon)
      │
      ▼
Flask /aqi endpoint (predict_aqi.py)
      │
      ├─► Google Earth Engine → Satellite AOD data
      ├─► Open-Meteo API      → Weather features (temp, humidity, wind...)
      │
      ▼
LightGBM Model (india_aqi_lightgbm_gpu_model.txt)
      │
      ▼
PM2.5 (µg/m³) → Converted to Indian NAQI AQI
      │
      ▼
JSON Response → React Frontend
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **Python** 3.9+
- A **Google Earth Engine** service account with a `key.json` credentials file
- Google Earth Engine access must be enabled for your project

---

### 1. Clone the Repository

```bash
git clone https://github.com/Mann3012/Eco_Project.git
cd Eco_Project/frontend
```

---

### 2. Set Up the Python Backend

**Create and activate a virtual environment:**

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

**Install dependencies:**

```bash
pip install flask flask-cors lightgbm earthengine-api pandas numpy requests scikit-learn scipy
```

**Add your Google Earth Engine credentials:**

Place your service account `key.json` file inside the `frontend/` directory.  
> ⚠️ This file is in `.gitignore` and must **never** be committed to git.

To get your `key.json`:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a Service Account under your Earth Engine project
3. Download the JSON key file and rename it `key.json`
4. Register the service account at [earthengine.google.com](https://signup.earthengine.google.com/#!/service_accounts)

**Start the Flask server:**

```bash
python predict_aqi.py
```

The backend will start on **http://localhost:5000**. You should see:
```
* Running on http://127.0.0.1:5000
```

---

### 3. Set Up the React Frontend

Open a **new terminal** (keep the Python server running):

```bash
cd Eco_Project/frontend
npm install
npm run dev
```

The app will open at **http://localhost:5173**

---

## 🔌 API Reference

### `GET /aqi`

Predicts PM2.5 and AQI for a given latitude/longitude.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `lat` | float | Latitude (India range: 6.4 – 35.6) |
| `lon` | float | Longitude (India range: 68.1 – 97.4) |

**Example Request:**
```
GET http://localhost:5000/aqi?lat=28.61&lon=77.20
```

**Example Response:**
```json
{
  "aqi": 187,
  "pm25": 72.4,
  "category": "Unhealthy",
  "aod": 0.43,
  "aod_method": "MODIS Terra interpolated"
}
```

**AQI Categories (Indian NAQI Standard):**

| AQI Range | Category | Color |
|-----------|----------|-------|
| 0 – 50 | Good | 🟢 Green |
| 51 – 100 | Moderate | 🟡 Yellow |
| 101 – 150 | Unhealthy for Sensitive Groups | 🟠 Orange |
| 151 – 200 | Unhealthy | 🔴 Red |
| 201 – 300 | Very Unhealthy | 🟣 Purple |
| 300+ | Hazardous | 🟤 Maroon |

---

## 🤖 Model Details

- **Algorithm:** LightGBM (Light Gradient Boosting Machine)
- **Target:** PM2.5 concentration (µg/m³)
- **Input Features:**
  - Aerosol Optical Depth (AOD) from MODIS Terra/Aqua satellite
  - Temperature, Humidity, Wind Speed, Wind Direction
  - Boundary Layer Height, Surface Pressure
  - Latitude, Longitude, Day of Year, Hour
- **Post-processing:** PM2.5 → AQI using Indian NAQI breakpoints

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Material UI |
| Maps | Leaflet, React-Leaflet |
| Charts | Recharts |
| Backend | Python, Flask, Flask-CORS |
| ML Model | LightGBM |
| Satellite Data | Google Earth Engine (MODIS AOD) |
| Weather Data | Open-Meteo API |

---

## ⚠️ Important Notes

1. **`key.json` is secret** — never commit it. It's already in `.gitignore`.
2. **Both servers must run simultaneously** — Flask on port 5000, Vite on port 5173.
3. **Earth Engine quota** — Each prediction makes API calls to Google Earth Engine. Heavy usage may hit quotas.
4. **First prediction is slow** (~10–20 seconds) as it fetches satellite data. Subsequent calls may be faster.

---

## 📁 .gitignore

The following are excluded from version control:

```
node_modules/
dist/
venv/
__pycache__/
key.json        ← Your GEE credentials
.env
```

---

## 👩‍💻 Author

**Kavya** — [Mann3012](https://github.com/Mann3012)

---

## 📄 License

This project is for educational and research purposes.
