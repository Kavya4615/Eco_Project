import { Box, Typography, Card, CardContent, Chip } from "@mui/material";
import { motion } from "framer-motion";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import MasksIcon from "@mui/icons-material/Masks";
import WindowIcon from "@mui/icons-material/Window";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import ElderlyIcon from "@mui/icons-material/Elderly";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import ParkIcon from "@mui/icons-material/Park";

function getHealthAdvice(aqi) {
  if (!aqi && aqi !== 0) return null;

  const activities = [
    {
      label: "Running Outdoors",
      icon: <DirectionsRunIcon />,
      safe: aqi <= 100,
      warn: aqi > 100 && aqi <= 150,
    },
    {
      label: "Cycling",
      icon: <DirectionsBikeIcon />,
      safe: aqi <= 100,
      warn: aqi > 100 && aqi <= 150,
    },
    {
      label: "Open Windows",
      icon: <WindowIcon />,
      safe: aqi <= 50,
      warn: aqi > 50 && aqi <= 100,
    },
    {
      label: "Park Outing",
      icon: <ParkIcon />,
      safe: aqi <= 100,
      warn: aqi > 100 && aqi <= 150,
    },
    {
      label: "Indoor Yoga",
      icon: <SelfImprovementIcon />,
      safe: aqi <= 200,
      warn: aqi > 200 && aqi <= 300,
    },
    {
      label: "Kids Outdoor Play",
      icon: <ChildCareIcon />,
      safe: aqi <= 50,
      warn: aqi > 50 && aqi <= 100,
    },
    {
      label: "Elderly Walk",
      icon: <ElderlyIcon />,
      safe: aqi <= 50,
      warn: aqi > 50 && aqi <= 100,
    },
    {
      label: "Wear Mask",
      icon: <MasksIcon />,
      safe: aqi > 150, 
      warn: aqi > 100 && aqi <= 150,
      invertLogic: true,
    },
  ];

  return activities;
}

function getOverallMessage(aqi) {
  if (aqi <= 50) return { text: "Air is Fresh! Enjoy outdoor activities freely.", color: "#4caf50", bg: "rgba(76,175,80,0.08)" };
  if (aqi <= 100) return { text: "Moderate air. Sensitive groups should limit prolonged outdoor exertion.", color: "#ff9800", bg: "rgba(255,152,0,0.08)" };
  if (aqi <= 150) return { text: "Unhealthy for sensitive groups. Reduce heavy outdoor activities.", color: "#ff5722", bg: "rgba(255,87,34,0.08)" };
  if (aqi <= 200) return { text: "Unhealthy air! Limit outdoor exposure. Wear a mask outside.", color: "#f44336", bg: "rgba(244,67,54,0.08)" };
  if (aqi <= 300) return { text: "Very Unhealthy! Avoid all outdoor activities. Stay indoors.", color: "#9c27b0", bg: "rgba(156,39,176,0.08)" };
  return { text: "HAZARDOUS! Do not go outside. Seal windows and run air purifiers.", color: "#800000", bg: "rgba(128,0,0,0.08)" };
}

export default function HealthAdvisor({ aqi }) {
  const activities = getHealthAdvice(aqi);
  const message = aqi != null ? getOverallMessage(aqi) : null;

  if (!activities) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.05}
      style={{
        position: "absolute",
        bottom: 20,
        left: 20,
        zIndex: 1000,
        cursor: "grab",
      }}
      whileDrag={{ cursor: "grabbing", scale: 1.02 }}
    >
      <Card
        sx={{
          width: { xs: 280, md: 310 },
          borderRadius: 3,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          border: "1px solid rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        {/* Drag Handle */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 0.5, opacity: 0.2 }}>
          <DragHandleIcon fontSize="small" />
        </Box>

        <CardContent sx={{ p: "4px 16px 16px 16px" }}>
          {/* Header */}
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 800,
              fontSize: "0.85rem",
              letterSpacing: 0.8,
              mb: 1,
              background: "linear-gradient(135deg, #2e7d32, #00c853)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            🏃 HEALTH & ACTIVITY ADVISOR
          </Typography>

          {/* Overall message banner */}
          {message && (
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                mb: 1.5,
                backgroundColor: message.bg,
                border: `1px solid ${message.color}25`,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, color: message.color, fontSize: "0.78rem", lineHeight: 1.4 }}>
                {message.text}
              </Typography>
            </Box>
          )}

          {/* Activity Grid */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
            {activities.map((act) => {
              let status, statusColor, statusBg;

              if (act.invertLogic) {
                // For protections (Mask): green/orange means "Do this", grey/green means "Optional"
                if (act.safe) {
                  status = "Required";
                  statusColor = "#2e7d32"; // Green - do this!
                  statusBg = "rgba(46,125,50,0.1)";
                } else if (act.warn) {
                  status = "Suggested";
                  statusColor = "#ed6c02"; // Orange
                  statusBg = "rgba(237,108,2,0.1)";
                } else {
                  status = "Not Needed";
                  statusColor = "#4caf50";
                  statusBg = "rgba(76,175,80,0.1)";
                }
              } else {
                if (act.safe) {
                  status = "Safe";
                  statusColor = "#4caf50";
                  statusBg = "rgba(76,175,80,0.1)";
                } else if (act.warn) {
                  status = "Caution";
                  statusColor = "#ff9800";
                  statusBg = "rgba(255,152,0,0.1)";
                } else {
                  status = "Avoid";
                  statusColor = "#f44336";
                  statusBg = "rgba(244,67,54,0.1)";
                }
              }

              return (
                <Chip
                  key={act.label}
                  icon={
                    <Box sx={{ color: statusColor, display: "flex", alignItems: "center", "& svg": { fontSize: 16 } }}>
                      {act.icon}
                    </Box>
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: "#333" }}>
                        {act.label}
                      </Typography>
                      <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: statusColor }}>
                        {["Safe", "Not Needed", "Required"].includes(status) ? "✅" : status === "Caution" || status === "Suggested" ? "⚠️" : "❌"}
                      </Typography>
                    </Box>
                  }
                  size="small"
                  sx={{
                    backgroundColor: statusBg,
                    border: `1px solid ${statusColor}30`,
                    height: 30,
                    "& .MuiChip-icon": { ml: 0.5 },
                  }}
                />
              );
            })}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}
