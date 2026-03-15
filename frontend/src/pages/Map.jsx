import { Box, Typography, Card, CardContent, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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
  [6.4626999, 68.1097],
  [35.5133, 97.3954],
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

function MapView() {
  const position = [11.6643, 78.1460];
  const [aqiData, setAqiData] = useState(null);

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

  return (
    <Box sx={{ position: "relative", height: "calc(100vh - 64px)" }}>
      <Box style={{ height: "100%", width: "100%" }}>
        <MapContainer 
          center={position} 
          zoom={13} 
          minZoom={4}
          maxBounds={indiaBounds}
          maxBoundsViscosity={1.0}
          style={{ height: "100%", width: "100%" }}
        >          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              <strong>{aqiData?.city || "Selected Location"}</strong><br />
              AQI: {aqiData?.aqi} — {getAQILabel(aqiData?.aqi)}
            </Popup>
          </Marker>
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