Project Structure
src/
 ├── components/
 │   └── Navbar.jsx
 │
 ├── pages/
 │   ├── Home.jsx
 │   ├── Map.jsx
 │   ├── LiveMap.jsx
 │   ├── NearMe.jsx
 │   ├── Ranking.jsx
 │   ├── Historical.jsx
 │   ├── Login.jsx
 │   ├── Register.jsx
 │   └── Profile.jsx
 │
 ├── utils/
 │   └── auth.js
 │
 ├── App.jsx
 └── main.jsx

Required Packages

Before running the project, ensure the following are installed:

Node.js (version 18 or higher recommended)

npm (comes with Node.js)

Git

Check installation:

node -v
npm -v
git --version

The project depends on the following main packages:

npm install @mui/material @mui/icons-material
npm install react-router-dom
npm install react-leaflet leaflet
npm install recharts



Frontend Integration Points
1. AQI State Storage

File: src/pages/NearMe.jsx
Line: 27

const [aqiData, setAqiData] = useState(null);

This state stores the AQI data returned from the backend.

2. Backend API Request

File: src/pages/NearMe.jsx
Lines: 53–60

const aqiResponse = await fetch(
  `http://localhost:5000/aqi?lat=${lat}&lon=${lon}`
);

const aqiResult = await aqiResponse.json();

setAqiData(aqiResult);

This sends the selected coordinates to the backend ML service.

3. AQI Color Logic

File: src/pages/NearMe.jsx
Lines: 17–24

function getAQIColor(aqi) {
  if (aqi <= 50) return "green";
  if (aqi <= 100) return "yellow";
  if (aqi <= 150) return "orange";
  if (aqi <= 200) return "red";
  if (aqi <= 300) return "purple";
  return "maroon";
}

The AQI value determines the marker color on the map.


Backend Requirements

The frontend map needs AQI data from a backend service that runs the ML model.

To make the frontend work, the backend must provide one API endpoint that receives latitude and longitude and returns predicted AQI values.

Integration is implemented in:

src/pages/Map.jsx

Relevant lines:

Line ~23–35 → Backend API request

Line ~7–14 → AQI color logic

Line ~47–55 → Marker displaying AQI data

Required API Endpoint
GET /aqi

Example request sent by the frontend:

http://localhost:5000/aqi?lat=11.6643&lon=78.1460
Query Parameters
Parameter	Type	Description
lat	float	Latitude of the location
lon	float	Longitude of the location
Expected Response Format

The backend must return JSON in this format:

{
  "aqi": 120,
  "pm25": 45
}
Field	Type	Description
aqi	number	Predicted Air Quality Index
pm25	number	PM2.5 concentration
Backend Workflow

When the frontend sends:

/aqi?lat=<latitude>&lon=<longitude>

the backend should:

Receive latitude and longitude.

Run the ML model using these values.

Return the prediction as JSON.

Example flow:

Frontend → GET /aqi?lat=11.66&lon=78.14
          ↓
Backend receives coordinates
          ↓
ML model predicts AQI
          ↓
Backend returns JSON response



