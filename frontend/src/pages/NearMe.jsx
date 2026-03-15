import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Card,
  CardContent,
  InputAdornment,
  Fade,
  CircularProgress
} from "@mui/material";
import { useTheme as useMuiTheme } from "@mui/material/styles";

import { useState, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import { useLocation as useRouterLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap, Popup } from "react-leaflet";
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

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { animate: true, duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

function getAQIColor(aqi) {
  if (aqi <= 50) return "#4caf50";
  if (aqi <= 100) return "#ffeb3b";
  if (aqi <= 150) return "#ff9800";
  if (aqi <= 200) return "#f44336";
  if (aqi <= 300) return "#9c27b0";
  return "#800000";
}

function NearMe() {
  const routerLoc = useRouterLocation();
  const initialSearch = routerLoc.state?.initialSearch || "";

  const [location, setLocation] = useState(initialSearch);
  const [position, setPosition] = useState([20.5937, 78.9629]);
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const muiTheme = useMuiTheme();
  const isDark = muiTheme.palette.mode === "dark";

  const fetchAQI = async (lat, lon) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/aqi?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      setAqiData(data);
    } catch (err) {
      console.error(err);
      setAqiData({ aqi: Math.floor(Math.random() * 150) + 50 }); // Mock fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!location.trim()) return;
    try {
      setLoading(true);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const newPos = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        setPosition(newPos);
        fetchAQI(newPos[0], newPos[1]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = [pos.coords.latitude, pos.coords.longitude];
          setPosition(newPos);
          setLocation("Your Location");
          fetchAQI(newPos[0], newPos[1]);
          setLoading(false);
        },
        () => setLoading(false)
      );
    }
  };

  useEffect(() => {
    if (initialSearch) {
      handleSearch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const color = aqiData ? getAQIColor(aqiData.aqi) : "#2196f3";

  return (
    <Box sx={{ position: "relative", height: "calc(100vh - 64px)", width: "100%" }}>
      <Box style={{ height: "100%", width: "100%" }}>
        <MapContainer 
          center={position} 
          zoom={5} 
          minZoom={4}
          maxBounds={indiaBounds}
          maxBoundsViscosity={1.0}
          style={{ height: "100%", width: "100%" }} 
          zoomControl={false}
        >          <ChangeView center={position} zoom={10} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              AQI: {aqiData?.aqi || "..."}
            </Popup>
          </Marker>
        </MapContainer>
      </Box>

      <Box
        sx={{
          position: "absolute",
          top: 24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          width: { xs: "90%", sm: "500px" },
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 2,
            borderRadius: 4,
            background: isDark ? "rgba(26, 29, 40, 0.95)" : "rgba(255,255,255,0.95)",
            backdropFilter: "blur(12px)",
          }}
        >
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search area..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button variant="contained" onClick={handleSearch} sx={{ background: "linear-gradient(135deg, #2e7d32, #00c853)" }}>
              Search
            </Button>
          </Box>
          <Button
            fullWidth
            startIcon={<MyLocationIcon />}
            onClick={useCurrentLocation}
            sx={{ mt: 1, borderRadius: 2 }}
          >
            My Location
          </Button>

          {aqiData && !loading && (
            <Fade in={true}>
              <Card sx={{ mt: 2, borderRadius: 3, overflow: "hidden" }}>
                <Box sx={{ p: 2, bgcolor: color, color: "white" }}>
                  <Typography variant="h6">AQI: {aqiData.aqi}</Typography>
                </Box>
              </Card>
            </Fade>
          )}

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default NearMe;