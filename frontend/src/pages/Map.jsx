import { Box, Typography, Card, CardContent, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const indiaBounds = [
  [6.0, 68.2],
  [35.6, 97.8],
];
const worldMaskRing = [
  [-85, -180],
  [-85, 180],
  [85, 180],
  [85, -180],
];
const indiaPolygon = [
  [35.49401, 77.837451], [34.321936, 78.912269], [33.506198, 78.811086], [32.994395, 79.208892], [32.48378, 79.176129], [32.618164, 78.458446], [31.515906, 78.738894], [30.882715, 79.721367], [30.183481, 81.111256], [29.729865, 80.476721], [28.79447, 80.088425], [28.416095, 81.057203], [27.925479, 81.999987], [27.364506, 83.304249], [27.234901, 84.675018], [26.726198, 85.251779], [26.630985, 86.024393], [26.397898, 87.227472], [26.414615, 88.060238], [26.810405, 88.174804], [27.445819, 88.043133], [27.876542, 88.120441], [28.086865, 88.730326], [27.299316, 88.814248], [27.098966, 88.835643], [26.719403, 89.744528], [26.875724, 90.373275], [26.808648, 91.217513], [26.83831, 92.033484], [27.452614, 92.103712], [27.771742, 91.696657], [27.896876, 92.503119], [28.640629, 93.413348], [29.277438, 94.56599], [29.031717, 95.404802], [29.452802, 96.117679], [28.83098, 96.586591], [28.411031, 96.248833], [28.261583, 97.327114], [27.882536, 97.402561], [27.699059, 97.051989], [27.083774, 97.133999], [27.264589, 96.419366], [26.573572, 95.124768], [26.001307, 95.155153], [25.162495, 94.603249], [24.675238, 94.552658], [23.850741, 94.106742], [24.078556, 93.325188], [23.043658, 93.286327], [22.703111, 93.060294], [22.27846, 93.166128], [22.041239, 92.672721], [23.627499, 92.146035], [23.624346, 91.869928], [22.985264, 91.706475], [23.503527, 91.158963], [24.072639, 91.46773], [24.130414, 91.915093], [24.976693, 92.376202], [25.147432, 91.799596], [25.132601, 90.872211], [25.26975, 89.920693], [25.965082, 89.832481], [26.014407, 89.355094], [26.446526, 88.563049], [25.768066, 88.209789], [25.238692, 88.931554], [24.866079, 88.306373], [24.501657, 88.084422], [24.233715, 88.69994], [23.631142, 88.52977], [22.879146, 88.876312], [22.055708, 89.031961], [21.690588, 88.888766], [21.703172, 88.208497], [21.495562, 86.975704], [20.743308, 87.033169], [20.151638, 86.499351], [19.478579, 85.060266], [18.30201, 83.941006], [17.671221, 83.189217], [17.016636, 82.192792], [16.556664, 82.191242], [16.310219, 81.692719], [15.951972, 80.791999], [15.899185, 80.324896], [15.136415, 80.025069], [13.835771, 80.233274], [13.006261, 80.286294], [12.056215, 79.862547], [10.357275, 79.857999], [10.308854, 79.340512], [9.546136, 78.885345], [9.216544, 79.18972], [8.933047, 78.277941], [8.252959, 77.941165], [7.965535, 77.539898], [8.899276, 76.592979], [10.29963, 76.130061], [11.308251, 75.746467], [11.781245, 75.396101], [12.741936, 74.864816], [13.992583, 74.616717], [14.617222, 74.443859], [15.990652, 73.534199], [17.92857, 73.119909], [19.208234, 72.820909], [20.419503, 72.824475], [21.356009, 72.630533], [20.757441, 71.175273], [20.877331, 70.470459], [22.089298, 69.16413], [22.450775, 69.644928], [22.84318, 69.349597], [23.691965, 68.176645], [24.359134, 68.842599], [24.356524, 71.04324], [25.215102, 70.844699], [25.722229, 70.282873], [26.491872, 70.168927], [26.940966, 69.514393], [27.989196, 70.616496], [27.91318, 71.777666], [28.961592, 72.823752], [29.976413, 73.450638], [30.979815, 74.42138], [31.692639, 74.405929], [32.271105, 75.258642], [32.7649, 74.451559], [33.441473, 74.104294], [34.317699, 73.749948], [34.748887, 74.240203], [34.504923, 75.757061], [34.653544, 76.871722], [35.49401, 77.837451],
];

function getAQIColor(aqi) {
  if (aqi <= 50) return "#4caf50";
  if (aqi <= 100) return "#ffeb3b";
  if (aqi <= 150) return "#ff9800";
  if (aqi <= 200) return "#f44336";
  if (aqi <= 300) return "#9c27b0";
  return "#800000";
}

function getAQILabel(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy (SG)";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

function estimateAQI(lat, lon, points) {
  const weighted = points.reduce(
    (acc, loc) => {
      const dx = lat - loc.lat;
      const dy = lon - loc.lon;
      const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 0.18);
      const weight = 1 / (distance * distance);
      acc.value += loc.aqi * weight;
      acc.weight += weight;
      return acc;
    },
    { value: 0, weight: 0 }
  );
  return Math.round(weighted.value / weighted.weight);
}

function isPointInPolygon(lat, lon, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1];
    const yi = polygon[i][0];
    const xj = polygon[j][1];
    const yj = polygon[j][0];
    const intersects =
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function MapView() {
  const position = [11.6643, 78.1460];
  const [aqiData, setAqiData] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  useEffect(() => {
    const fetchAQI = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/aqi?lat=${position[0]}&lon=${position[1]}`
        );
        if (!res.ok) throw new Error("Backend not reachable");
        const data = await res.json();
        setAqiData(data);
      } catch (err) {
        console.error("AQI Data Fetch Error:", err);
        // Fallback for demo if backend is missing
        setAqiData({
          aqi: 56,
          pm25: 14.2,
          city: "Salem (Mock)"
        });
      }
    };
    fetchAQI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const color = aqiData ? getAQIColor(aqiData.aqi) : "#2196f3";
  const points = [
    { city: "Delhi", lat: 28.61, lon: 77.2, aqi: 210 },
    { city: "Mumbai", lat: 19.07, lon: 72.87, aqi: 140 },
    { city: "Kolkata", lat: 22.57, lon: 88.36, aqi: 180 },
    { city: "Chennai", lat: 13.08, lon: 80.27, aqi: 95 },
    { city: "Bengaluru", lat: 12.97, lon: 77.59, aqi: 88 },
    { city: "Guwahati", lat: 26.14, lon: 91.74, aqi: 132 },
    { city: "Shillong", lat: 25.58, lon: 91.89, aqi: 96 },
    { city: "Itanagar", lat: 27.09, lon: 93.62, aqi: 84 },
    { city: "Salem", lat: position[0], lon: position[1], aqi: aqiData?.aqi ?? 110 },
  ];
  const heatmapPoints = [];
  for (let lat = indiaBounds[0][0]; lat <= indiaBounds[1][0]; lat += 0.62) {
    for (let lon = indiaBounds[0][1]; lon <= indiaBounds[1][1]; lon += 0.62) {
      heatmapPoints.push({
        key: `${lat.toFixed(2)}-${lon.toFixed(2)}`,
        lat,
        lon,
        aqi: estimateAQI(lat, lon, points),
      });
    }
  }
  const indiaOnlyHeatPoints = heatmapPoints.filter((pt) =>
    isPointInPolygon(pt.lat, pt.lon, indiaPolygon)
  );
  const maskOuterRing = worldMaskRing;

  return (
    <Box sx={{ position: "relative", height: "calc(100vh - 64px)" }}>
      <Box style={{ height: "100%", width: "100%" }}>
        <MapContainer
          bounds={indiaBounds}
          boundsOptions={{ padding: [20, 20] }}
          minZoom={4}
          maxBounds={indiaBounds}
          maxBoundsViscosity={1.0}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            noWrap
            bounds={indiaBounds}
          />
          <Polygon
            positions={[maskOuterRing, indiaPolygon]}
            pathOptions={{ fillColor: "#5bb8ff", fillOpacity: 1, stroke: false }}
          />
          {showHeatmap
            ? indiaOnlyHeatPoints.flatMap((pt) => ([
                <Circle
                  key={`${pt.key}-outer`}
                  center={[pt.lat, pt.lon]}
                  radius={76000}
                  pathOptions={{
                    color: getAQIColor(pt.aqi),
                    fillColor: getAQIColor(pt.aqi),
                    fillOpacity: 0.08,
                    weight: 0,
                  }}
                />,
                <Circle
                  key={`${pt.key}-core`}
                  center={[pt.lat, pt.lon]}
                  radius={42000}
                  pathOptions={{
                    color: getAQIColor(pt.aqi),
                    fillColor: getAQIColor(pt.aqi),
                    fillOpacity: 0.14,
                    weight: 0,
                  }}
                />,
              ]))
            : (
              <Marker position={position}>
                <Popup>
                  <strong>{aqiData?.city || "Selected Location"}</strong><br />
                  AQI: {aqiData?.aqi} — {getAQILabel(aqiData?.aqi)}
                </Popup>
              </Marker>
            )}
        </MapContainer>
      </Box>

      {/* Floating info card */}
      {aqiData && (
        <Card
          sx={{
            position: "absolute",
            top: 20,
            right: 20,
            zIndex: 1000,
            width: 260,
            borderRadius: 3,
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" sx={{ color: "#999", fontWeight: 500, letterSpacing: 1 }}>
              CURRENT AQI
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: color,
                my: 0.5,
              }}
            >
              {aqiData.aqi}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {getAQILabel(aqiData.aqi)} • PM2.5: {aqiData.pm25}
            </Typography>
            <Button
              variant={showHeatmap ? "contained" : "outlined"}
              size="small"
              fullWidth
              onClick={() => setShowHeatmap((prev) => !prev)}
              sx={{ mb: 1, textTransform: "none", fontWeight: 700 }}
            >
              {showHeatmap ? "Heatmap: ON" : "Heatmap: OFF"}
            </Button>
            <Button
              component={Link}
              to="/near-me"
              variant="contained"
              size="small"
              fullWidth
              sx={{
                mt: 1,
                background: "linear-gradient(135deg, #2e7d32, #00c853)",
                "&:hover": {
                  background: "linear-gradient(135deg, #1b5e20, #00a844)",
                },
              }}
            >
              Search Other Cities
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default MapView;