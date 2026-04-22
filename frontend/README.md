# 🌿 EcoAir — Real-Time AQI Prediction for India

> A full-stack web application that predicts **PM2.5 and Air Quality Index (AQI)** across India using a **LightGBM machine learning model**, powered by satellite AOD data from Google Earth Engine and real-time weather data.

---

## ✨ Features

- 📍 **Air Quality Near Me** — Auto-detects your location and instantly shows ML-predicted AQI & PM2.5.
- 🏥 **Health Advisory System** — Get personalized, actionable safety advice (e.g., "Wear N95", "Close Windows") based on current air quality levels.
- 🛡️ **User Accounts** — Persistent login/register system powered by **Supabase**.
- 🗺️ **Interactive Map** — Click anywhere on India's map to get a real-time AQI prediction for that pinpoint.
- 🔥 **Live Heatmap** — Color-coded AQI heatmap across all of India, interpolated from model anchor nodes.
- 🏆 **Live City Rankings** — Real-time AQI ranking for major Indian cities.
- 📊 **Historical PM2.5 Graph** — Trend chart anchored to your live predicted PM2.5 value.

---

## 🛣️ Green Routing (Eco-Route Planner)

The **Green Routing** feature helps users find the healthiest path between two points by prioritizing air quality over just distance or time.

### How it Works:
1.  **Multi-Path Retrieval**: When a user selects a Start and End point, the app queries the **OSRM (Open Source Routing Machine)** API with `alternatives=true`. This retrieves several valid road paths based on standard Dijkstra algorithms.
2.  **Spatiotemporal Sampling**: For each candidate route, the system extracts the road geometry and **samples 10 equidistant coordinates** along the path.
3.  **ML Pollution Analysis**: For each sampled coordinate, a request is made to the **LightGBM Backend**. The model predicts the AQI for that specific road segment using satellite AOD and current weather.
4.  **Optimal Selection**: The frontend calculates the **Average AQI** for every alternative route. It then sorts the routes and highlights the one with the lowest total pollution "cost."
5.  **Visual Guidance**: The cleanest path is rendered on the map as a dynamic **Polyline**, color-coded by its health status (Green for healthy, Red for polluted).

---

## 🏗️ Architecture

```
Eco_Project/
└── frontend/
    ├── predict_aqi_new.py              # 🐍 Flask backend — serves /aqi endpoint
    ├── india_aqi_lightgbm_gpu_model.txt  # 🤖 Trained LightGBM model
    ├── key.json                        # 🔐 Google Earth Engine credentials
    ├── .env                            # 🌐 Supabase & App environment variables
    ├── src/
    │   ├── pages/
    │   │   ├── NearMe.jsx          # AQI Near Me + Health Advice
    │   │   ├── Profile.jsx         # User management & Health Profile
    │   │   └── ...
    └── ...
```

---

## 🚀 Getting Started

### 1. Set Up Environment Variables
Create a `.env` file in the `frontend/` directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Start Backend
```bash
cd frontend
python predict_aqi_new.py
```

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔌 API Reference

### `GET /aqi`

**Example Response:**
```json
{
  "aqi": 120,
  "pm25": 45,
  "category": "Moderate",
  "health_recommendation": "Sensitive groups should reduce prolonged outdoor exertion."
}
```

---

## 🚦 AQI Standards & Health Advice

| Category | Range | Actionable Advice (Example) |
|----------|-------|-----------------------------|
| **Good** | 0-50 | Enjoy your usual outdoor activities. |
| **Satisfactory** | 51-100 | Minor breathing discomfort to sensitive people. |
| **Moderate** | 101-200 | Limit outdoor exertion for people with heart/lung disease. |
| **Poor** | 201-300 | Avoid prolonged outdoor exposure. Wear a mask. |
| **Very Poor** | 301-400 | Everyone should limit outdoor exertion. |
| **Severe** | 400+ | Extreme risk. Stay indoors and use air purifiers. |

---

## 👩‍💻 Author

**Kavya** — [Mann3012](https://github.com/Mann3012)
