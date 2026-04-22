import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid
} from "@mui/material";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell
} from "recharts";

import { useState, useEffect } from "react";
import TimelineIcon from "@mui/icons-material/Timeline";
import { useLocationData } from "../context/LocationContext";

/* Custom tooltip */
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          background: "rgba(26,26,46,0.92)",
          backdropFilter: "blur(8px)",
          borderRadius: 2,
          px: 2,
          py: 1.2,
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem" }}>
          {label}
        </Typography>
        <Typography variant="body1" sx={{ color: label === 'Today' ? '#f44336' : '#ff9800', fontWeight: 700 }}>
          PM2.5: {payload[0].value} µg/m³
        </Typography>
      </Box>
    );
  }
  return null;
}

function Historical() {
  const { coords, aqiData, updateLocation } = useLocationData();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!aqiData && coords) {
      setLoading(true);
      updateLocation().then(() => setLoading(false));
    }
  }, [aqiData, coords, updateLocation]);

  const chartData = aqiData ? [
    { name: "Today", pm25: aqiData.pm25 || 0 },
    { name: "Tomorrow", pm25: aqiData.pm25_tomorrow || 0 }
  ] : [];

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", px: 3, py: 5 }}>

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <TimelineIcon sx={{ fontSize: 36, color: "#f44336" }} />
        <Typography variant="h4">
          PM2.5 Forecast Data
        </Typography>
      </Box>

      <Typography color="text.secondary" sx={{ mb: 4, ml: 0.5 }}>
        Model-predicted PM2.5 values for your location
        {loading && <Box component="span" sx={{ color: "#f44336", fontWeight: "bold", ml: 1 }}>⚡ Syncing your location...</Box>}
      </Typography>

      {aqiData ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 4, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", height: "100%" }}>
               <CardContent sx={{ p: 4, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>Today's average PM2.5</Typography>
                  <Typography variant="h2" sx={{ fontWeight: 800, color: "#f44336" }}>{aqiData.pm25} <Typography component="span" variant="h6">µg/m³</Typography></Typography>
               </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 4, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", height: "100%" }}>
               <CardContent sx={{ p: 4, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>Tomorrow's predicted PM2.5</Typography>
                  <Typography variant="h2" sx={{ fontWeight: 800, color: "#ff9800" }}>{aqiData.pm25_tomorrow !== undefined ? aqiData.pm25_tomorrow : "N/A"} <Typography component="span" variant="h6">µg/m³</Typography></Typography>
               </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 4, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", mt: 2 }}>
              <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="name" tick={{ fontSize: 14, fontWeight: "bold", fill: "#888" }} axisLine={{ stroke: "rgba(0,0,0,0.1)" }} />
                    <YAxis unit=" µg" tick={{ fontSize: 12, fill: "#888" }} axisLine={{ stroke: "rgba(0,0,0,0.1)" }} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(0,0,0,0.02)'}} />
                    <Bar dataKey="pm25" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "#f44336" : "#ff9800"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Typography>Loading model data...</Typography>
      )}

    </Box>
  );
}

export default Historical;