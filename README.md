# 🌿 EcoAir — Real-Time AQI Prediction for India

> A full-stack web application that predicts **PM2.5 and Air Quality Index (AQI)** across India using a **LightGBM machine learning model**, powered by satellite AOD data from Google Earth Engine and real-time weather data.

---

## ✨ Features

- 🔐 **User Authentication** — Secure Register and Login system with profile persistence using SQLite.
- 📍 **Air Quality Near Me** — Auto-detects your location and instantly shows ML-predicted AQI & PM2.5.
- 📈 **Tomorrow's Forecast** — Visualize predictive PM2.5 and AQI values for both today and tomorrow.
- 🗺️ **Interactive Map** — Click anywhere on India's map to get a real-time AQI prediction for that pinpoint.
- 🔥 **Real-Time Pollutants** — Detailed monitoring of PM10, NO2, CO, and O3 levels.
- 🏥 **Health Personalization** — Tailored health advice based on user profiles (Normal, Asthmatic, Elderly).
- 🗺️ **Road-Aware Route Planner** — Plan the healthiest route using actual road networks (OSRM) to find the least-polluted corridor. Features manual text searching, coordinate entry, and automatic map bounding.
- 🔔 **AQI Notifications** — Real-time browser alerts when air quality crosses dangerous thresholds (200+).

---

## 🏗️ Architecture

```
Eco_Project/
└── frontend/
    ├── predict_aqi_new.py          # 🐍 Flask backend — serves all API endpoints
    ├── users.db                    # 🗄️ SQLite database for user accounts
    ├── india_aqi_lightgbm_gpu_model.txt  # 🤖 Trained LightGBM model
    ├── key.json                    # 🔐 Google Earth Engine credentials (NOT in git)
    ├── src/
    │   ├── pages/
    │   │   ├── NearMe.jsx          # Dashboard with Map, Forecast, and History
    │   │   ├── Login.jsx           # User Login
    │   │   ├── Register.jsx        # User Registration
    │   │   ├── Profile.jsx         # User Profile & Settings
    │   │   └── Map.jsx             # Interactive Map Explorer
    │   └── context/
    │       └── LocationContext.jsx # Global location & AQI state
    └── package.json
```

### How the Prediction Works

```
Browser (lat, lon)
      │
      ▼
Flask API (predict_aqi_new.py)
      │
      ├─► Google Earth Engine → Satellite AOD data (with mock fallback)
      ├─► Open-Meteo API      → Real-time & Historical Weather data
      │
      ▼
LightGBM Model (india_aqi_lightgbm_gpu_model.txt)
      │
      ▼
PM2.5 (µg/m³) → Converted to Indian NAQI Standard
      │
      ▼
JSON Response → React Dashboard (Recharts / Leaflet)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **Python** 3.9+
- A **Google Earth Engine** service account (optional fallback implemented)

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

**Start the Flask server:**

```bash
python predict_aqi_new.py
```

The backend will start on **http://localhost:5000**.

---

### 3. Set Up the React Frontend

Open a **new terminal**:

```bash
cd Eco_Project/frontend
npm install
npm run dev
```

The app will open at **http://localhost:5173**

---

## 🔌 API Reference

### `GET /aqi?lat={lat}&lon={lon}`
Predicts current AQI, 7-day forecast, and health recommendations.



### `GET /aqi/region?lat_min={..}&lat_max={..}&lon_min={..}&lon_max={..}`
Returns spatial AQI data across a bounding box for trend analysis.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Material UI |
| Maps | Leaflet, React-Leaflet |
| Charts | Recharts |
| Backend | Python, Flask, SQLite |
| ML Model | LightGBM |
| Data | Open-Meteo API, MODIS Satellite, Nominatim, OSRM |
| Alerts | Browser Notification API |

---

## ⚠️ Important Notes

1. **Database Persistence** — User accounts are stored locally in `users.db`. Restarting the host will not delete your account.
2. **Resilient Data Fetching** — The app includes fallbacks for Earth Engine to ensure 100% uptime even if satellite credentials are missing.

---

## 👩‍💻 Author

**Kavya** — [Mann3012](https://github.com/Mann3012)

---

## 📄 License

This project is for educational and research purposes.

