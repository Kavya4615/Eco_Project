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

import { useState, useEffect, useMemo } from "react";
import SearchIcon from "@mui/icons-material/Search";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import CloseIcon from "@mui/icons-material/Close";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import { useLocation as useRouterLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap, Popup, Polygon, useMapEvents, Polyline, Circle } from "react-leaflet";
import { motion } from "framer-motion";
import { fullWorldAndIndiaMask } from "../data/indiaMask";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import HealthAdvisor from "../components/HealthAdvisor";

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

const indiaPolygon = [
  [35.49401, 77.837451], [34.321936, 78.912269], [33.506198, 78.811086], [32.994395, 79.208892], [32.48378, 79.176129], [32.618164, 78.458446], [31.515906, 78.738894], [30.882715, 79.721367], [30.183481, 81.111256], [29.729865, 80.476721], [28.79447, 80.088425], [28.416095, 81.057203], [27.925479, 81.999987], [27.364506, 83.304249], [27.234901, 84.675018], [26.726198, 85.251779], [26.630985, 86.024393], [26.397898, 87.227472], [26.414615, 88.060238], [26.810405, 88.174804], [27.445819, 88.043133], [27.876542, 88.120441], [28.086865, 88.730326], [27.299316, 88.814248], [27.098966, 88.835643], [26.719403, 89.744528], [26.875724, 90.373275], [26.808648, 91.217513], [26.83831, 92.033484], [27.452614, 92.103712], [27.771742, 91.696657], [27.896876, 92.503119], [28.640629, 93.413348], [29.277438, 94.56599], [29.031717, 95.404802], [29.452802, 96.117679], [28.83098, 96.586591], [28.411031, 96.248833], [28.261583, 97.327114], [27.882536, 97.402561], [27.699059, 97.051989], [27.083774, 97.133999], [27.264589, 96.419366], [26.573572, 95.124768], [26.001307, 95.155153], [25.162495, 94.603249], [24.675238, 94.552658], [23.850741, 94.106742], [24.078556, 93.325188], [23.043658, 93.286327], [22.703111, 93.060294], [22.27846, 93.166128], [22.041239, 92.672721], [23.627499, 92.146035], [23.624346, 91.869928], [22.985264, 91.706475], [23.503527, 91.158963], [24.072639, 91.46773], [24.130414, 91.915093], [24.976693, 92.376202], [25.147432, 91.799596], [25.132601, 90.872211], [25.26975, 89.920693], [25.965082, 89.832481], [26.014407, 89.355094], [26.446526, 88.563049], [25.768066, 88.209789], [25.238692, 88.931554], [24.866079, 88.306373], [24.501657, 88.084422], [24.233715, 88.69994], [23.631142, 88.52977], [22.879146, 88.876312], [22.055708, 89.031961], [21.690588, 88.888766], [21.703172, 88.208497], [21.495562, 86.975704], [20.743308, 87.033169], [20.151638, 86.499351], [19.478579, 85.060266], [18.30201, 83.941006], [17.671221, 83.189217], [17.016636, 82.192792], [16.556664, 82.191242], [16.310219, 81.692719], [15.951972, 80.791999], [15.899185, 80.324896], [15.136415, 80.025069], [13.835771, 80.233274], [13.006261, 80.286294], [12.056215, 79.862547], [10.357275, 79.857999], [10.308854, 79.340512], [9.546136, 78.885345], [9.216544, 79.18972], [8.933047, 78.277941], [8.252959, 77.941165], [7.965535, 77.539898], [8.899276, 76.592979], [10.29963, 76.130061], [11.308251, 75.746467], [11.781245, 75.396101], [12.741936, 74.864816], [13.992583, 74.616717], [14.617222, 74.443859], [15.990652, 73.534199], [17.92857, 73.119909], [19.208234, 72.820909], [20.419503, 72.824475], [21.356009, 72.630533], [20.757441, 71.175273], [20.877331, 70.470459], [22.089298, 69.16413], [22.450775, 69.644928], [22.84318, 69.349597], [23.691965, 68.176645], [24.359134, 68.842599], [24.356524, 71.04324], [25.215102, 70.844699], [25.722229, 70.282873], [26.491872, 70.168927], [26.940966, 69.514393], [27.989196, 70.616496], [27.91318, 71.777666], [28.961592, 72.823752], [29.976413, 73.450638], [30.979815, 74.42138], [31.692639, 74.405929], [32.271105, 75.258642], [32.7649, 74.451559], [33.441473, 74.104294], [34.317699, 73.749948], [34.748887, 74.240203], [34.504923, 75.757061], [34.653544, 76.871722], [35.49401, 77.837451],
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

function FitRouteBounds({ routePath }) {
  const map = useMap();
  useEffect(() => {
    if (routePath && routePath.length > 1) {
      const bounds = L.latLngBounds(routePath);
      map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.5 });
    }
  }, [routePath, map]);
  return null;
}

function MapClickPinpoint({ setPosition, fetchAQI, setLocation, routeMode, setRoutePoints, setStartInput, setEndInput, disabled, setRoutePath, setRouteAQI }) {
  useMapEvents({
    click(e) {
      if (disabled) return;
      const { lat, lng } = e.latlng;
      if (routeMode) {
        setRoutePoints(prev => {
          if (!prev.start) {
            if (setStartInput) setStartInput(`Lat: ${lat.toFixed(4)}, Lon: ${lng.toFixed(4)}`);
            return { start: [lat, lng], end: null };
          }
          if (!prev.end) {
            if (setEndInput) setEndInput(`Lat: ${lat.toFixed(4)}, Lon: ${lng.toFixed(4)}`);
            return { ...prev, end: [lat, lng] };
          }
          if (setStartInput) setStartInput(`Lat: ${lat.toFixed(4)}, Lon: ${lng.toFixed(4)}`);
          if (setEndInput) setEndInput("");
          return { start: [lat, lng], end: null }; // Reset if both exist
        });
      } else {
        setPosition([lat, lng]);
        setLocation(`Lat: ${lat.toFixed(4)}, Lon: ${lng.toFixed(4)}`);
        fetchAQI(lat, lng);
        
        // Clear route states if any leftover path exists
        if (setRoutePoints) setRoutePoints({ start: null, end: null });
        if (setStartInput) setStartInput("");
        if (setEndInput) setEndInput("");
        if (setRoutePath) setRoutePath([]);
        if (setRouteAQI) setRouteAQI(null);
      }
    },
  });
  return null;
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

import { useLocationData } from "../context/LocationContext";
import { getCurrentUser } from "../utils/auth";

function NearMe() {
  const routerLoc = useRouterLocation();
  const navigate = useNavigate();
  const initialSearch = routerLoc.state?.initialSearch || "";
  const openRoutePlanner = routerLoc.state?.openRoutePlanner || false;
  const { coords: contextCoords, locationName: contextName, aqiData: contextAQI, updateLocation, heatmapPoints } = useLocationData();

  const [location, setLocation] = useState(initialSearch);
  const [position, setPosition] = useState([20.5937, 78.9629]);
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [historyData, setHistoryData] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [routeMode, setRouteMode] = useState(openRoutePlanner);
  const [routePoints, setRoutePoints] = useState({ start: null, end: null });
  const [routeAQI, setRouteAQI] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [viewTicket, setViewTicket] = useState(0);
  const [geoError, setGeoError] = useState(null);
  const muiTheme = useMuiTheme();
  const isDark = muiTheme.palette.mode === "dark";

  const interpolatedHeatmapPoints = useMemo(() => {
    const arr = [];
    if (!heatmapPoints || heatmapPoints.length === 0) return arr;
    for (let lat = indiaBounds[0][0]; lat <= indiaBounds[1][0]; lat += 0.62) {
      for (let lon = indiaBounds[0][1]; lon <= indiaBounds[1][1]; lon += 0.62) {
        arr.push({
          key: `${lat.toFixed(2)}-${lon.toFixed(2)}`,
          lat,
          lon,
          aqi: estimateAQI(lat, lon, heatmapPoints),
        });
      }
    }
    return arr.filter((pt) => isPointInPolygon(pt.lat, pt.lon, indiaPolygon));
  }, [heatmapPoints]);

  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");

  const geocodeAndSetPoint = async (query, type) => {
    if (!query.trim()) return;
    const coordMatch = query.match(/lat:?\s*([+-]?\d+\.?\d*)\s*,\s*lon:?\s*([+-]?\d+\.?\d*)/i);
    if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lon = parseFloat(coordMatch[2]);
        setRoutePoints(prev => ({ ...prev, [type]: [lat, lon] }));
        if (type === 'start') setStartInput(`Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`);
        if (type === 'end') setEndInput(`Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`);
        return;
    }
    try {
      setLoading(true);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        setRoutePoints(prev => ({ ...prev, [type]: coords }));
        if (type === 'start') setStartInput(query);
        if (type === 'end') setEndInput(query);
      } else {
        setError(`Could not find ${type} location`);
      }
    } catch (err) {
      setError(`Failed to search ${type} location`);
    } finally {
      setLoading(false);
    }
  };

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
      
      // Check if the input is a coordinate format like "Lat: 13.7858, Lon: 79.1386"
      const coordMatch = location.match(/lat:?\s*([+-]?\d+\.?\d*)\s*,\s*lon:?\s*([+-]?\d+\.?\d*)/i);
      if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lon = parseFloat(coordMatch[2]);
        
        // Check if within India rough bounds
        if (lat >= indiaBounds[0][0] && lat <= indiaBounds[1][0] && 
            lon >= indiaBounds[0][1] && lon <= indiaBounds[1][1]) {
           setPosition([lat, lon]);
           fetchAQI(lat, lon);
           setLoading(false);
           return;
        } else {
           setError("Coordinates are outside India.");
           setAqiData(null);
           setLoading(false);
           return;
        }
      }

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
    } else if (routerLoc.state?.skipAutoLocate) {
      // Don't auto-locate if we specifically came to search other cities
      // Just stay at the default position (center of India)
      return;
    } else if (contextCoords) {
      // Use cached context data
      setPosition(contextCoords);
      setLocation(contextName || "Your Location");
      setAqiData(contextAQI);
      setViewTicket(prev => prev + 1);
    } else {
      // Fallback: trigger update if context is empty
      updateLocation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextCoords, initialSearch, routerLoc.key, routerLoc.state?.skipAutoLocate]);

  const color = aqiData ? getAQIColor(aqiData.aqi) : "#2196f3";

  return (
    <Box sx={{ position: "relative", height: "calc(100vh - 64px)", width: "100%" }}>
      {/* Floating Heatmap Toggle (Sticky) */}
      <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: "100%", pointerEvents: "none", zIndex: 1000 }}>
        <Box sx={{ position: "sticky", top: 110, pt: 1, pl: 10, display: "flex", justifyContent: "flex-start", pointerEvents: "auto" }}>
          <Button
            variant={showHeatmap ? "contained" : "outlined"}
            startIcon={<WhatshotIcon />}
            onClick={() => setShowHeatmap((prev) => !prev)}
            sx={{
              borderRadius: 8,
              px: 3,
              py: 1,
              backgroundColor: showHeatmap ? "#f44336" : "rgba(255,255,255,0.95)",
              color: showHeatmap ? "white" : "#f44336",
              fontWeight: 800,
              backdropFilter: "blur(8px)",
              boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
              border: "1px solid rgba(244,67,54,0.3)",
              "&:hover": {
                backgroundColor: showHeatmap ? "#d32f2f" : "white",
              }
            }}
          >
            {showHeatmap ? "AQI Heatmap: ON" : "AQI Heatmap: OFF"}
          </Button>
        </Box>
      </Box>

      <Box style={{ height: "100%", width: "100%" }}>
        <MapContainer 
          center={position} 
          zoom={5} 
          minZoom={4}
          maxBounds={indiaBounds}
          maxBoundsViscosity={1.0}
          style={{ height: "100%", width: "100%" }} 
        >
          <ChangeView center={position} zoom={10} ticket={viewTicket} />
          {routeMode && <FitRouteBounds routePath={routePath} />}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            noWrap
            bounds={indiaBounds}
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
            setStartInput={setStartInput}
            setEndInput={setEndInput}
            disabled={false}
            setRoutePath={setRoutePath}
            setRouteAQI={setRouteAQI}
          />
          {showHeatmap && interpolatedHeatmapPoints
            ? interpolatedHeatmapPoints.flatMap((pt) => ([
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
            : null}
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
                    <strong>Today's average AQI:</strong> {aqiData.aqi}<br />
                    <strong>PM2.5:</strong> {aqiData.pm25} µg/m³
                    {aqiData.aqi_tomorrow !== undefined && (
                      <>
                        <br /><strong>Tomorrow's predicted AQI:</strong> {aqiData.aqi_tomorrow}
                      </>
                    )}
                  </>
                ) : "Loading..."}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </Box>

      {/* Search Panel Overlay */}
      {!routeMode && (
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
              onClick={() => navigate('/map')}
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
                          Today's average AQI: {aqiData.aqi} {aqiData.category ? `(${aqiData.category})` : ""}
                        </Typography>
                      </Box>
                      {aqiData.pm25 !== undefined && (
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          PM2.5: {aqiData.pm25} µg/m³
                        </Typography>
                      )}
                      {aqiData.aqi_tomorrow !== undefined && (
                        <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid rgba(255,255,255,0.3)" }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Tomorrow's predicted AQI: {aqiData.aqi_tomorrow} {aqiData.category_tomorrow ? `(${aqiData.category_tomorrow})` : ""}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Card>
                  
                  {aqiData.health_recommendation && (
                    <Alert severity={aqiData.aqi > 150 ? "error" : aqiData.aqi > 100 ? "warning" : "success"} sx={{ borderRadius: 2 }}>
                      <strong>Health Advice:</strong> {aqiData.health_recommendation}
                    </Alert>
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
      )}

      {/* Standalone Route Planner Overlay */}
      {routeMode && (
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
            maxWidth: "400px",
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
              border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(33, 150, 243, 0.5)",
              boxShadow: "0 8px 32px rgba(33, 150, 243, 0.2)",
            }}
          >
            {/* Drag Handle UI */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5, opacity: 0.3 }}>
              <DragHandleIcon fontSize="small" />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DirectionsIcon /> Route Air Quality
              </Typography>
              <IconButton
                size="small"
                onClick={() => {
                  setRouteMode(false);
                  setRoutePoints({ start: null, end: null });
                  setRouteAQI(null);
                  setRoutePath([]);
                  setStartInput("");
                  setEndInput("");
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <TextField 
                size="small" 
                placeholder="Type start & hit Enter, or click map" 
                value={startInput} 
                onChange={e => setStartInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && geocodeAndSetPoint(startInput, 'start')}
              />
              <TextField 
                size="small" 
                placeholder="Type end & hit Enter, or click map" 
                value={endInput} 
                onChange={e => setEndInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && geocodeAndSetPoint(endInput, 'end')}
              />
              <Button 
                variant="contained" 
                size="small" 
                fullWidth 
                onClick={async () => {
                  if (startInput && !routePoints.start) await geocodeAndSetPoint(startInput, 'start');
                  if (endInput && !routePoints.end) await geocodeAndSetPoint(endInput, 'end');
                  
                  if (startInput && endInput && routePoints.start && routePoints.end) {
                    calculateRouteAQI();
                  }
                }}
                sx={{ mt: 0.5, bgcolor: "#2196f3", color: "white", fontWeight: "bold" }}
              >
                Calculate Optimal Route
              </Button>
              
              {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                  <CircularProgress size={20} />
                </Box>
              )}

              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, textAlign: "center" }}>
                {!routePoints.start ? "Waiting for Start point..." : 
                 !routePoints.end ? "Waiting for End point..." : 
                 `Corridor Average AQI: ${routeAQI || "..."}`}
              </Typography>
              {routeAQI && (
                <Typography variant="subtitle2" sx={{ color: getAQIColor(routeAQI), fontWeight: 'bold', textAlign: "center", display: 'block' }}>
                  Status: {routeAQI <= 100 ? "Safe Route" : "Polluted Corridor"}
                </Typography>
              )}
            </Box>
          </Paper>
        </motion.div>
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

      {/* Health & Activity Advisor */}
      {aqiData && <HealthAdvisor aqi={aqiData.aqi} />}

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
              const newMode = !routeMode;
              setRouteMode(newMode);
              if (!newMode) {
                setRoutePoints({ start: null, end: null });
                setRouteAQI(null);
                setRoutePath([]);
                setStartInput("");
                setEndInput("");
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