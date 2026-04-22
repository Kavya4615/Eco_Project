import { Box, Typography, Card, Chip, Button } from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import { useMemo, useRef, useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  Polygon,
  useMapEvents,
} from "react-leaflet";
import { fullWorldAndIndiaMask } from "../data/indiaMask";
import "leaflet/dist/leaflet.css";

const indiaBounds = [
  [6.4626999, 68.1097], // Southwest (near Kanyakumari/Gujarat)
  [35.6, 97.8], // Include Northeast till Arunachal end
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

function isWithinIndiaBounds(lat, lon) {
  return (
    lat >= indiaBounds[0][0] &&
    lat <= indiaBounds[1][0] &&
    lon >= indiaBounds[0][1] &&
    lon <= indiaBounds[1][1]
  );
}

function estimateAQI(lat, lon, locations) {
  const weighted = locations.reduce(
    (acc, loc) => {
      const dx = lat - loc.lat;
      const dy = lon - loc.lon;
      const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 0.15);
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

function CursorTemperatureTracker({ onHover, locations }) {
  const lastFetchRef = useRef(0);

  useMapEvents({
    async mousemove(e) {
      const { lat, lng } = e.latlng;
      if (!isWithinIndiaBounds(lat, lng) || !isPointInPolygon(lat, lng, indiaPolygon)) {
        onHover(null);
        return;
      }

      const now = Date.now();
      // Throttle API calls while moving mouse continuously
      if (now - lastFetchRef.current < 450) return;
      lastFetchRef.current = now;

      onHover({
        lat,
        lon: lng,
        loading: true,
        error: null,
      });

      try {
        const [weatherRes, aqiRes] = await Promise.allSettled([
          fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m`
          ),
          fetch(`http://localhost:5000/aqi?lat=${lat}&lon=${lng}`),
        ]);

        let tempValue;
        if (weatherRes.status === "fulfilled" && weatherRes.value.ok) {
          const weatherData = await weatherRes.value.json();
          tempValue = weatherData?.current?.temperature_2m;
        }

        let aqiValue;
        if (aqiRes.status === "fulfilled" && aqiRes.value.ok) {
          const aqiData = await aqiRes.value.json();
          aqiValue = aqiData?.aqi;
        }
        if (aqiValue === undefined || aqiValue === null) {
          aqiValue = estimateAQI(lat, lng, locations);
        }

        onHover({
          lat,
          lon: lng,
          temp: tempValue,
          aqi: aqiValue,
          loading: false,
          error: null,
          updatedAt: new Date().toLocaleTimeString(),
        });
      } catch (error) {
        onHover({
          lat,
          lon: lng,
          loading: false,
          error: "Unable to load temperature right now",
          aqi: estimateAQI(lat, lng, locations),
        });
      }
    },
    mouseout() {
      onHover(null);
    },
  });

  return null;
}

function LiveMap() {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [hoverWeather, setHoverWeather] = useState(null);

  const [locations, setLocations] = useState([
    { city: "Delhi", lat: 28.61, lon: 77.2, aqi: 210 },
    { city: "Mumbai", lat: 19.07, lon: 72.87, aqi: 140 },
    { city: "Chennai", lat: 13.08, lon: 80.27, aqi: 95 },
    { city: "Kolkata", lat: 22.57, lon: 88.36, aqi: 180 },
    { city: "Guwahati", lat: 26.14, lon: 91.74, aqi: 132 },
    { city: "Shillong", lat: 25.58, lon: 91.89, aqi: 96 },
    { city: "Itanagar", lat: 27.09, lon: 93.62, aqi: 84 },
    { city: "Bangalore", lat: 12.97, lon: 77.59, aqi: 80 },
    { city: "Hyderabad", lat: 17.38, lon: 78.48, aqi: 110 },
    { city: "Jaipur", lat: 26.91, lon: 75.78, aqi: 150 },
    { city: "Bhopal", lat: 23.25, lon: 77.41, aqi: 120 },
    { city: "Lucknow", lat: 26.84, lon: 80.94, aqi: 190 },
  ]);

  const [loadingMsg, setLoadingMsg] = useState("");

  useEffect(() => {
    let active = true;
    const fetchAnchors = async () => {
      for (let i = 0; i < locations.length; i++) {
        if (!active) break;
        setLoadingMsg(`Calculating real-time heatmap node ${i + 1}/${locations.length} (${locations[i].city})`);
        try {
          const res = await fetch(`http://localhost:5000/aqi?lat=${locations[i].lat}&lon=${locations[i].lon}`);
          const data = await res.json();
          if (data && data.aqi !== undefined) {
             setLocations((prev) => {
               const copy = [...prev];
               copy[i] = { ...copy[i], aqi: data.aqi };
               return copy;
             });
          }
        } catch (e) {
          console.error(e);
        }
      }
      if (active) setLoadingMsg("100% Calculated");
      setTimeout(() => {
        if (active) setLoadingMsg("");
      }, 2000);
    };
    fetchAnchors();
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const maskOuterRing = useMemo(() => worldMaskRing, []);
  const heatmapPoints = useMemo(() => {
    const points = [];
    const latStep = 0.62;
    const lonStep = 0.62;
    for (let lat = indiaBounds[0][0]; lat <= indiaBounds[1][0]; lat += latStep) {
      for (let lon = indiaBounds[0][1]; lon <= indiaBounds[1][1]; lon += lonStep) {
        points.push({
          key: `${lat.toFixed(2)}-${lon.toFixed(2)}`,
          lat,
          lon,
          aqi: estimateAQI(lat, lon, locations),
        });
      }
    }
    return points.filter((pt) => isPointInPolygon(pt.lat, pt.lon, indiaPolygon));
  }, [locations]);

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
          {loadingMsg && (
            <Typography variant="body2" sx={{ ml: 0.5, color: "#ff9800", fontWeight: 700, mt: 0.5 }}>
              ⚡ {loadingMsg}... (Map will morph automatically)
            </Typography>
          )}
        </Box>

        <Button
          variant={showHeatmap ? "contained" : "outlined"}
          startIcon={showHeatmap ? <WhatshotIcon /> : <ThermostatIcon />}
          onClick={() => setShowHeatmap((prev) => !prev)}
          sx={{
            borderRadius: 999,
            px: 2.25,
            fontWeight: 700,
            textTransform: "none",
            minWidth: 180,
            alignSelf: { xs: "stretch", md: "auto" },
          }}
        >
          {showHeatmap ? "Heatmap: ON" : "Heatmap: OFF"}
        </Button>

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
            bounds={indiaBounds}
            boundsOptions={{ padding: [20, 20] }}
            minZoom={4}
            maxBounds={indiaBounds}
            maxBoundsViscosity={1.0}
            worldCopyJump={false}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
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

            {showHeatmap
              ? heatmapPoints.flatMap((pt) => ([
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

            {!showHeatmap && (
              <CursorTemperatureTracker onHover={setHoverWeather} locations={locations} />
            )}
          </MapContainer>
        </Box>
      </Card>

      {!showHeatmap && (
        <Card
          sx={{
            position: "fixed",
            bottom: 20,
            left: 20,
            zIndex: 1100,
            px: 1.5,
            py: 1,
            borderRadius: 2,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            maxWidth: 330,
          }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 0.6 }}>
            CURSOR WEATHER (INDIA)
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.4 }}>
            {hoverWeather
              ? `Lat ${hoverWeather.lat.toFixed(3)}, Lon ${hoverWeather.lon.toFixed(3)}`
              : "Move your cursor on the map to see temperature and AQI"}
          </Typography>
          {hoverWeather?.loading ? (
            <Typography variant="body2" sx={{ fontWeight: 700, color: "#1976d2" }}>
              Loading temperature and AQI...
            </Typography>
          ) : hoverWeather?.error ? (
            <Typography variant="body2" sx={{ fontWeight: 700, color: "#d32f2f" }}>
              {hoverWeather.error}
            </Typography>
          ) : hoverWeather?.temp !== undefined || hoverWeather?.aqi !== undefined ? (
            <>
              {hoverWeather?.temp !== undefined && (
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#2e7d32" }}>
                  Temperature: {hoverWeather.temp} deg C
                </Typography>
              )}
              {hoverWeather?.aqi !== undefined && (
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: getAQIColor(hoverWeather.aqi) }}
                >
                  AQI: {hoverWeather.aqi} - {getAQILabel(hoverWeather.aqi)}
                </Typography>
              )}
              {hoverWeather.updatedAt && (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Updated {hoverWeather.updatedAt}
                </Typography>
              )}
            </>
          ) : null}
        </Card>
      )}
    </Box>
  );
}

export default LiveMap;