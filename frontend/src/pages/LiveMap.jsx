import { Box, Typography, Card, Chip } from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
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
  [6.4626999, 68.1097], // Southwest (near Kanyakumari/Gujarat)
  [35.5133, 97.3954], // Northeast (near Kashmir/Arunachal)
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

function LiveMap() {
  const position = [20.5937, 78.9629]; // India center

  const locations = [
    { city: "Delhi", lat: 28.61, lon: 77.20, aqi: 210 },
    { city: "Mumbai", lat: 19.07, lon: 72.87, aqi: 140 },
    { city: "Chennai", lat: 13.08, lon: 80.27, aqi: 95 },
    { city: "Kolkata", lat: 22.57, lon: 88.36, aqi: 180 }
  ];

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 4 }, py: { xs: 2, md: 4 } }}>
      {/* Header & Controls Row */}
      <Box 
        sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" }, 
          justifyContent: "space-between",
          gap: 2, 
          mb: 3 
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
            <MapIcon sx={{ fontSize: 32, color: "#4facfe" }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Live Air Quality Map
            </Typography>
          </Box>
          <Typography color="text.secondary" sx={{ ml: 0.5 }}>
            Real-time AQI tracking across major Indian cities
          </Typography>
        </Box>

        {/* Legend */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {[
            { label: "Good (0–50)", color: "#4caf50" },
            { label: "Moderate (51–100)", color: "#ffeb3b" },
            { label: "Unhealthy SG (101–150)", color: "#ff9800" },
            { label: "Unhealthy (151–200)", color: "#f44336" },
            { label: "Very Unhealthy (201–300)", color: "#9c27b0" },
          ].map((item) => (
            <Chip
              key={item.label}
              label={item.label}
              size="small"
              sx={{
                backgroundColor: `${item.color}18`,
                color: item.color === "#ffeb3b" ? "#a08600" : item.color,
                border: `1px solid ${item.color}40`,
                fontWeight: 600,
                fontSize: "0.7rem",
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Map Content */}
      <Card
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
          border: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <Box sx={{ height: "82vh", width: "100%" }}>
          <MapContainer 
            center={position} 
            zoom={5} 
            minZoom={4}
            maxBounds={indiaBounds}
            maxBoundsViscosity={1.0}
            scrollWheelZoom={true} 
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map((loc, i) => (
              <Marker key={i} position={[loc.lat, loc.lon]}>
                <Popup>
                  <Box sx={{ p: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{loc.city}</Typography>
                    <Typography variant="body2" sx={{ color: getAQIColor(loc.aqi), fontWeight: 700 }}>
                      AQI: {loc.aqi} — {getAQILabel(loc.aqi)}
                    </Typography>
                  </Box>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Box>
      </Card>
    </Box>
  );
}

export default LiveMap;