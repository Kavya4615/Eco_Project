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
  CircularProgress,
  IconButton
} from "@mui/material";
import { useTheme as useMuiTheme } from "@mui/material/styles";

import { useState, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import CloseIcon from "@mui/icons-material/Close";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import { useLocation as useRouterLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap, Popup, Polygon, useMapEvents } from "react-leaflet";
import { motion } from "framer-motion";
import { fullWorldAndIndiaMask } from "../data/indiaMask";
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

function MapClickPinpoint({ setPosition, fetchAQI, setLocation }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      setLocation(`Lat: ${lat.toFixed(4)}, Lon: ${lng.toFixed(4)}`);
      fetchAQI(lat, lng);
    },
  });
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

import { useLocationData } from "../context/LocationContext";

function NearMe() {
  const routerLoc = useRouterLocation();
  const initialSearch = routerLoc.state?.initialSearch || "";
  const { coords: contextCoords, locationName: contextName, aqiData: contextAQI, updateLocation } = useLocationData();

  const [location, setLocation] = useState(initialSearch);
  const [position, setPosition] = useState([20.5937, 78.9629]);
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSearchPanel, setShowSearchPanel] = useState(true);
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
      setAqiData({ aqi: Math.floor(Math.random() * 150) + 50, pm25: "N/A", category: "Offline Fallback" }); // Mock fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!location.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&q=${encodeURIComponent(location)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const newPos = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        setPosition(newPos);
        fetchAQI(newPos[0], newPos[1]);
      } else {
        setError("Place not found in India");
        setAqiData(null);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to search location");
      setAqiData(null);
    } finally {
      setLoading(false);
    }
  };

  const useCurrentLocation = () => {
    if (contextCoords) {
      setPosition(contextCoords);
      setLocation(contextName || "Your Location");
      setAqiData(contextAQI);
    } else {
      updateLocation(true);
    }
  };

  useEffect(() => {
    if (initialSearch) {
      handleSearch();
    } else if (contextCoords) {
      // Use cached context data
      setPosition(contextCoords);
      setLocation(contextName || "Your Location");
      setAqiData(contextAQI);
    } else {
      // Fallback: trigger update if context is empty
      updateLocation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextCoords, initialSearch]);

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
          <Polygon
            positions={fullWorldAndIndiaMask}
            pathOptions={{ fillColor: "#f0f2f5", fillOpacity: 1, stroke: true, color: "#78909c", weight: 2 }}
          />
          <MapClickPinpoint setPosition={setPosition} fetchAQI={fetchAQI} setLocation={setLocation} />
          <Marker position={position}>
            <Popup>
              {aqiData ? (
                <>
                  <strong>AQI:</strong> {aqiData.aqi}<br />
                  <strong>PM2.5:</strong> {aqiData.pm25} µg/m³
                </>
              ) : "Loading..."}
            </Popup>
          </Marker>
        </MapContainer>
      </Box>

      {showSearchPanel ? (
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0.1}
          style={{
            position: "absolute",
            top: 24,
            left: "50%",
            zIndex: 1000,
            x: "-50%",
            width: "90%",
            maxWidth: "500px",
            cursor: "grab",
          }}
          whileDrag={{ cursor: "grabbing", scale: 1.02 }}
        >
          <Paper
            elevation={6}
            sx={{
              p: 2,
              pt: 1,
              borderRadius: 4,
              position: "relative",
              width: "100%",
              background: isDark ? "rgba(26, 29, 40, 0.95)" : "rgba(255,255,255,0.95)",
              backdropFilter: "blur(12px)",
              border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.05)",
            }}
          >
            {/* Drag Handle UI */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5, opacity: 0.3 }}>
              <DragHandleIcon fontSize="small" />
            </Box>

            <IconButton
              size="small"
              onClick={() => setShowSearchPanel(false)}
              sx={{ position: "absolute", top: 8, right: 8 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search area..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                InputProps={{
                  endAdornment: location ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => { setLocation(""); setAqiData(null); setError(null); }}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />
              <Button variant="contained" onClick={handleSearch} sx={{ background: "linear-gradient(135deg, #2e7d32, #00c853)" }}>
                Search
              </Button>
            </Box>
            {error && (
              <Typography variant="body2" color="error" sx={{ mt: 1, ml: 0.5, fontWeight: 500 }}>
                {error}
              </Typography>
            )}
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
                <Card sx={{ mt: 2, borderRadius: 3, overflow: "hidden", width: "100%" }}>
                  <Box sx={{ p: 2, bgcolor: color, color: "white", display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      AQI: {aqiData.aqi} {aqiData.category ? `(${aqiData.category})` : ""}
                    </Typography>
                    {aqiData.pm25 !== undefined && (
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        PM2.5: {aqiData.pm25} µg/m³
                      </Typography>
                    )}
                    {aqiData.aod !== undefined && (
                      <Typography variant="caption" sx={{ opacity: 0.85, mt: 0.5, lineHeight: 1.2 }}>
                        AOD: {aqiData.aod} <br/> Source: {aqiData.aod_method}
                      </Typography>
                    )}
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
        </motion.div>
      ) : (
        <Box
          sx={{
            position: "absolute",
            top: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <Button
            variant="contained"
            onClick={() => setShowSearchPanel(true)}
            sx={{ borderRadius: 8, px: 3, py: 1.5, boxShadow: 3, background: "linear-gradient(135deg, #2e7d32, #00c853)", fontWeight: 'bold' }}
            startIcon={<SearchIcon />}
          >
            Open Search
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default NearMe;