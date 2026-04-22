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
  IconButton,
  Snackbar,
  Alert,
  Grid,
  Tooltip as MuiTooltip,
  Switch,
  FormControlLabel
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import DirectionsIcon from "@mui/icons-material/Directions";
import NavigationIcon from "@mui/icons-material/Navigation";
import {
  LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, ResponsiveContainer, AreaChart, Area
} from "recharts";
import { useTheme as useMuiTheme } from "@mui/material/styles";

import { useState, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import CloseIcon from "@mui/icons-material/Close";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import { useLocation as useRouterLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap, Popup, Polygon, useMapEvents, Polyline } from "react-leaflet";
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

function ChangeView({ center, zoom, ticket }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { animate: true, duration: 1.5 });
    }
  }, [center, zoom, map, ticket]);
  return null;
}

function MapClickPinpoint({ setPosition, fetchAQI, setLocation, routeMode, setRoutePoints }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (routeMode) {
        setRoutePoints(prev => {
          if (!prev.start) return { start: [lat, lng], end: null };
          if (!prev.end) return { ...prev, end: [lat, lng] };
          return { start: [lat, lng], end: null }; // Reset if both exist
        });
      } else {
        setPosition([lat, lng]);
        setLocation(`Lat: ${lat.toFixed(4)}, Lon: ${lng.toFixed(4)}`);
        fetchAQI(lat, lng);
      }
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
import { getCurrentUser } from "../utils/auth";

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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [historyData, setHistoryData] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [routeMode, setRouteMode] = useState(false);
  const [routePoints, setRoutePoints] = useState({ start: null, end: null });
  const [routeAQI, setRouteAQI] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [viewTicket, setViewTicket] = useState(0);
  const [geoError, setGeoError] = useState(null);
  const muiTheme = useMuiTheme();
  const isDark = muiTheme.palette.mode === "dark";

  useEffect(() => {
    if (aqiData && aqiData.aqi > 200) {
      setSnackbarOpen(true);
    }
  }, [aqiData]);

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
      }
    }
  };

  const triggerNotification = (aqi, category) => {
    if (notificationsEnabled && aqi > 200) {
      new Notification("EcoAir: Dangerous AQI Alert!", {
        body: `AQI has reached ${aqi} (${category}). Please wear a mask!`,
        icon: "/vite.svg"
      });
    }
  };

  const calculateRouteAQI = async () => {
    if (!routePoints.start || !routePoints.end) return;
    setLoading(true);
    setRoutePath([]);
    try {
      const start = routePoints.start;
      const end = routePoints.end;
      
      // 1. Fetch Actual Road Routes from OSRM
      // We request 'alternatives=true' to find multiple ways and pick the cleanest
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&alternatives=true`;
      const osrmRes = await fetch(osrmUrl);
      const osrmData = await osrmRes.json();

      if (!osrmData.routes || osrmData.routes.length === 0) {
        throw new Error("No road route found");
      }

      // 2. Evaluate each road route for AQI
      const evaluatedRoutes = await Promise.all(osrmData.routes.map(async (route) => {
        const coords = route.geometry.coordinates.map(c => [c[1], c[0]]); // [lat, lon]
        
        // Sample ~10 points along the road to get average AQI
        const step = Math.max(1, Math.floor(coords.length / 10));
        const samplePoints = [];
        for (let i = 0; i < coords.length; i += step) {
          samplePoints.push(coords[i]);
        }

        const aqiResults = await Promise.all(samplePoints.map(async ([lat, lon]) => {
          try {
            const aqiRes = await fetch(`http://localhost:5000/aqi?lat=${lat}&lon=${lon}`);
            const data = await aqiRes.json();
            return data.aqi || 0;
          } catch (e) {
            console.error("Point AQI fetch failed:", e);
            return 0;
          }
        }));

        const totalAQI = aqiResults.reduce((sum, val) => sum + val, 0);
        const validSamples = aqiResults.filter(val => val > 0).length;
        const avgAQI = validSamples > 0 ? Math.round(totalAQI / validSamples) : 100;


        return {
          path: coords,
          avgAQI: avgAQI,
          distance: route.distance,
          duration: route.duration
        };
      }));

      // 3. Select the "Eco-Route" (Lowest Average AQI)
      evaluatedRoutes.sort((a, b) => a.avgAQI - b.avgAQI);
      const bestRoute = evaluatedRoutes[0];

      setRoutePath(bestRoute.path);
      setRouteAQI(bestRoute.avgAQI);
      
    } catch (err) {
      console.error("Routing error:", err);
      // Fallback to straight line if OSRM fails
      setRoutePath([routePoints.start, routePoints.end]);
      setRouteAQI(100);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (routePoints.start && routePoints.end) {
      calculateRouteAQI();
    }
  }, [routePoints]);

  const fetchAQI = async (lat, lon) => {
    try {
      setLoading(true);
      const user = getCurrentUser();
      const healthParam = user?.health_condition ? `&healthCondition=${user.health_condition}` : '';
      const res = await fetch(`http://localhost:5000/aqi?lat=${lat}&lon=${lon}${healthParam}`);
      const data = await res.json();
      setAqiData(data);
      
      if (data.aqi > 200) {
        triggerNotification(data.aqi, data.category);
      }
      // Fetch 30-day history in background
      fetch(`http://localhost:5000/aqi/history?lat=${lat}&lon=${lon}`)
        .then(r => r.json())
        .then(h => { if (h.history) setHistoryData(h.history); })
        .catch(e => console.error('History fetch error:', e));
    } catch (err) {
      console.error(err);
      setAqiData({ aqi: Math.floor(Math.random() * 150) + 50, pm25: "N/A", category: "Offline Fallback" });
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
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const newPos = [latitude, longitude];
        setPosition(newPos);
        setViewTicket(prev => prev + 1);
        setLocation("Your Location");
        await fetchAQI(latitude, longitude);
        setLoading(false);
      }, (err) => {
        console.error("Geolocation error:", err);
        setLoading(false);
        setGeoError(err.code === 1 ? "Location permission denied. Please enable it in browser settings." : "Unable to retrieve location.");
        // Fallback to cached context data or center of India
        const fallbackPos = contextCoords || [20.5937, 78.9629];
        setPosition(fallbackPos);
        setViewTicket(prev => prev + 1);
        if (contextCoords) {
          setLocation(contextName || "Last Known Location");
          setAqiData(contextAQI);
        }
      });
    } else if (contextCoords) {
      setPosition(contextCoords);
      setViewTicket(prev => prev + 1);
      setLocation(contextName || "Your Location");
      setAqiData(contextAQI);
      setLoading(false);
    } else {
      setLoading(false);
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
        >          <ChangeView center={position} zoom={10} ticket={viewTicket} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Polygon
            positions={fullWorldAndIndiaMask}
            pathOptions={{ fillColor: "#f0f2f5", fillOpacity: 1, stroke: true, color: "#78909c", weight: 2 }}
          />
          <MapClickPinpoint 
            setPosition={setPosition} 
            fetchAQI={fetchAQI} 
            setLocation={setLocation} 
            routeMode={routeMode}
            setRoutePoints={setRoutePoints}
          />
          {routePoints.start && <Marker position={routePoints.start}><Popup>Start Point</Popup></Marker>}
          {routePoints.end && <Marker position={routePoints.end}><Popup>End Point</Popup></Marker>}
          {routePath.length > 1 && (
            <Polyline 
              positions={routePath} 
              pathOptions={{ color: getAQIColor(routeAQI || 100), weight: 6, opacity: 0.8 }} 
            >
              <Popup>
                <strong>Optimal Eco-Route</strong><br />
                Average AQI: {routeAQI}<br />
                Status: {routeAQI <= 100 ? "Healthy Path" : "Polluted Path"}
              </Popup>
            </Polyline>
          )}
          {!routeMode && (
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
          )}
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
              maxHeight: "85vh",
              overflowY: "auto",
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
                <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Card sx={{ borderRadius: 3, overflow: "hidden", width: "100%" }}>
                    <Box sx={{ p: 2, bgcolor: color, color: "white", display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          AQI: {aqiData.aqi} {aqiData.category ? `(${aqiData.category})` : ""}
                        </Typography>
                      </Box>
                      {aqiData.pm25 !== undefined && (
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          PM2.5: {aqiData.pm25} µg/m³
                        </Typography>
                      )}
                    </Box>
                  </Card>
                  
                  {aqiData.health_recommendation && (
                    <Alert severity={aqiData.aqi > 150 ? "error" : aqiData.aqi > 100 ? "warning" : "success"} sx={{ borderRadius: 2 }}>
                      <strong>Health Advice:</strong> {aqiData.health_recommendation}
                    </Alert>
                  )}

                  {historyData && historyData.length > 0 && (
                    <Card sx={{ borderRadius: 2 }}>
                      <CardContent sx={{ p: 1.5, pb: "12px !important" }}>
                        <Typography variant="subtitle2" fontWeight="bold" mb={1}>30-Day AQI History</Typography>
                        <Box sx={{ width: "100%", height: 140 }}>
                          <ResponsiveContainer>
                            <AreaChart data={historyData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                              <XAxis dataKey="date" tick={{fontSize: 8}} interval={4} angle={-30} textAnchor="end" height={35} />
                              <YAxis width={30} tick={{fontSize: 10}} />
                              <RechartsTooltip
                                contentStyle={{fontSize: "12px", borderRadius: "8px", color: "#000"}}
                                formatter={(value, name) => [value, name === 'aqi' ? 'AQI' : 'PM2.5']}
                                labelFormatter={(label) => `Date: ${label}`}
                              />
                              <Area type="monotone" dataKey="aqi" stroke="#7c4dff" fill="#ede7f6" strokeWidth={2} name="AQI" />
                              <Area type="monotone" dataKey="pm25" stroke="#00bcd4" fill="#e0f7fa" strokeWidth={1.5} name="PM2.5" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardContent>
                    </Card>
                  )}
                  
                  {routeMode && (
                    <Card sx={{ borderRadius: 2, bgcolor: "rgba(33, 150, 243, 0.05)", border: "1px dashed #2196f3" }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DirectionsIcon fontSize="small" /> Route Air Quality
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {!routePoints.start ? "Click on map to set Start point" : 
                             !routePoints.end ? "Click on map to set End point" : 
                             `Corridor Average AQI: ${routeAQI || "..."}`}
                          </Typography>
                          {routeAQI && (
                            <Typography variant="caption" sx={{ color: getAQIColor(routeAQI), fontWeight: 'bold', mt: 0.5, display: 'block' }}>
                              Status: {routeAQI <= 100 ? "Safe Route" : "Polluted Corridor"}
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  )}
                </Box>
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

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: '100%', fontWeight: "bold" }}>
          Warning: AQI has crossed 200 in this area!
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!geoError} 
        autoHideDuration={6000} 
        onClose={() => setGeoError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setGeoError(null)} severity="warning" sx={{ width: '100%' }}>
          {geoError}
        </Alert>
      </Snackbar>

      {/* Map Controls */}
      <Box sx={{ position: "absolute", bottom: 40, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <MuiTooltip title="Enable AQI Alerts" placement="left">
          <IconButton 
            onClick={notificationsEnabled ? () => setNotificationsEnabled(false) : requestNotificationPermission}
            sx={{ 
              bgcolor: notificationsEnabled ? "#d32f2f" : "white", 
              color: notificationsEnabled ? "white" : "#d32f2f",
              boxShadow: 3,
              '&:hover': { bgcolor: notificationsEnabled ? "#b71c1c" : "#f5f5f5" }
            }}
          >
            <NotificationsActiveIcon />
          </IconButton>
        </MuiTooltip>

        <MuiTooltip title={routeMode ? "Exit Route Planner" : "Route Air Quality Planner"} placement="left">
          <IconButton 
            onClick={() => {
              setRouteMode(!routeMode);
              if (!routeMode) {
                setRoutePoints({ start: null, end: null });
                setRouteAQI(null);
              }
            }}
            sx={{ 
              bgcolor: routeMode ? "#2196f3" : "white", 
              color: routeMode ? "white" : "#2196f3",
              boxShadow: 3,
              '&:hover': { bgcolor: routeMode ? "#1976d2" : "#f5f5f5" }
            }}
          >
            <NavigationIcon sx={{ transform: 'rotate(45deg)' }} />
          </IconButton>
        </MuiTooltip>
      </Box>
    </Box>
  );
}

export default NearMe;