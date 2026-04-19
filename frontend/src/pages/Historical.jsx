import {
  Box,
  Typography,
  Card,
  CardContent,
} from "@mui/material";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
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
        <Typography variant="body1" sx={{ color: "#f44336", fontWeight: 700 }}>
          PM2.5: {payload[0].value} µg/m³
        </Typography>
      </Box>
    );
  }
  return null;
}

function Historical() {
  const { coords, historicalData: data, updateHistorical } = useLocationData();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data.length === 0 && coords) {
      setLoading(true);
      updateHistorical().then(() => setLoading(false));
    }
  }, [data, coords, updateHistorical]);

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", px: 3, py: 5 }}>

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <TimelineIcon sx={{ fontSize: 36, color: "#f44336" }} />
        <Typography variant="h4">
          Historical PM2.5 Data
        </Typography>
      </Box>

      <Typography color="text.secondary" sx={{ mb: 4, ml: 0.5 }}>
        Historical pollution trend anchored to your live ML-predicted PM2.5 value
        {loading && <Box component="span" sx={{ color: "#f44336", fontWeight: "bold", ml: 1 }}>⚡ Syncing your location...</Box>}
      </Typography>

      <Card
        sx={{
          borderRadius: 4,
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>

          <ResponsiveContainer width="100%" height={420}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="pmGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f44336" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f44336" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(0,0,0,0.06)"
              />

              <XAxis
                dataKey="date"
                tick={{ fill: "#888", fontSize: 13 }}
                axisLine={{ stroke: "rgba(0,0,0,0.1)" }}
              />

              <YAxis
                tick={{ fill: "#888", fontSize: 13 }}
                axisLine={{ stroke: "rgba(0,0,0,0.1)" }}
                unit=" µg"
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="pm25"
                stroke="#f44336"
                strokeWidth={3}
                fill="url(#pmGradient)"
                dot={{
                  r: 5,
                  fill: "#f44336",
                  stroke: "white",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 8,
                  fill: "#f44336",
                  stroke: "white",
                  strokeWidth: 3,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>

        </CardContent>
      </Card>

    </Box>
  );
}

export default Historical;