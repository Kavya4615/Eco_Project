import { Box, Typography, IconButton, Slider, Chip } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useState, useEffect, useRef, useCallback } from "react";

// Generate 24-hour labels starting from the current hour
function getHourLabels() {
  const now = new Date();
  const currentHour = now.getHours();
  const labels = [];
  for (let i = 0; i < 24; i++) {
    const hour = (currentHour + i) % 24;
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    labels.push({
      index: i,
      hour,
      label: `${displayHour}${period}`,
      isNow: i === 0,
      isTomorrow: (currentHour + i) >= 24,
    });
  }
  return labels;
}

export default function TimelapseControl({ baseLocations, onTimeChange }) {
  const [hourIndex, setHourIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);
  const hourLabels = useRef(getHourLabels()).current;

  const applyTimeShift = useCallback((index) => {
    if (!baseLocations || baseLocations.length === 0) return;

    const target = hourLabels[index];

    // Use real ML model values only — no hardcoded multipliers
    const shifted = baseLocations.map((loc) => ({
      ...loc,
      // Tomorrow hours → use ML-predicted aqi_tomorrow
      // Today hours → use current aqi from ML model
      aqi: target.isTomorrow && loc.aqi_tomorrow
        ? loc.aqi_tomorrow
        : loc.aqi,
    }));

    onTimeChange(shifted, target);
  }, [baseLocations, hourLabels, onTimeChange]);

  useEffect(() => {
    applyTimeShift(hourIndex);
  }, [hourIndex, applyTimeShift]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setHourIndex((prev) => {
          if (prev >= 23) {
            setIsPlaying(false);
            return 23;
          }
          return prev + 1;
        });
      }, 1200);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying]);

  const currentLabel = hourLabels[hourIndex];

  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1100,
        width: { xs: "92%", md: "70%", lg: "60%" },
        maxWidth: 800,
      }}
    >
      <Box
        sx={{
          background: "rgba(15, 17, 23, 0.92)",
          backdropFilter: "blur(20px)",
          borderRadius: 4,
          px: { xs: 2, md: 3 },
          py: 1.5,
          boxShadow: "0 12px 48px rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Top row: Title + Time badge */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccessTimeIcon sx={{ color: "#4facfe", fontSize: 18 }} />
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255,255,255,0.6)",
                fontWeight: 700,
                letterSpacing: 1.5,
                fontSize: "0.68rem",
              }}
            >
              AQI FORECAST TIMELINE
            </Typography>
          </Box>
          <Chip
            label={
              currentLabel.isNow
                ? `Now (${currentLabel.label})`
                : currentLabel.isTomorrow
                ? `Tomorrow ${currentLabel.label}`
                : `Today ${currentLabel.label}`
            }
            size="small"
            sx={{
              backgroundColor: currentLabel.isNow
                ? "rgba(76,175,80,0.2)"
                : currentLabel.isTomorrow
                ? "rgba(79,172,254,0.2)"
                : "rgba(255,152,0,0.2)",
              color: currentLabel.isNow
                ? "#4caf50"
                : currentLabel.isTomorrow
                ? "#4facfe"
                : "#ff9800",
              fontWeight: 700,
              fontSize: "0.72rem",
              border: `1px solid ${
                currentLabel.isNow
                  ? "rgba(76,175,80,0.3)"
                  : currentLabel.isTomorrow
                  ? "rgba(79,172,254,0.3)"
                  : "rgba(255,152,0,0.3)"
              }`,
            }}
          />
        </Box>

        {/* Controls row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, md: 1.5 } }}>
          {/* Prev button */}
          <IconButton
            size="small"
            onClick={() => { setIsPlaying(false); setHourIndex(Math.max(0, hourIndex - 1)); }}
            disabled={hourIndex === 0}
            sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: "white" }, "&.Mui-disabled": { color: "rgba(255,255,255,0.15)" } }}
          >
            <SkipPreviousIcon fontSize="small" />
          </IconButton>

          {/* Play / Pause */}
          <IconButton
            onClick={() => {
              if (hourIndex >= 23) setHourIndex(0);
              setIsPlaying(!isPlaying);
            }}
            sx={{
              background: isPlaying
                ? "linear-gradient(135deg, #f44336, #ff5722)"
                : "linear-gradient(135deg, #4facfe, #00f2fe)",
              color: "white",
              width: 36,
              height: 36,
              boxShadow: isPlaying
                ? "0 4px 16px rgba(244,67,54,0.4)"
                : "0 4px 16px rgba(79,172,254,0.4)",
              "&:hover": {
                background: isPlaying
                  ? "linear-gradient(135deg, #d32f2f, #f44336)"
                  : "linear-gradient(135deg, #3d8bfd, #00d4fe)",
              },
            }}
          >
            {isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
          </IconButton>

          {/* Next button */}
          <IconButton
            size="small"
            onClick={() => { setIsPlaying(false); setHourIndex(Math.min(23, hourIndex + 1)); }}
            disabled={hourIndex === 23}
            sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: "white" }, "&.Mui-disabled": { color: "rgba(255,255,255,0.15)" } }}
          >
            <SkipNextIcon fontSize="small" />
          </IconButton>

          {/* Slider */}
          <Slider
            value={hourIndex}
            onChange={(_, val) => { setIsPlaying(false); setHourIndex(val); }}
            min={0}
            max={23}
            step={1}
            sx={{
              flex: 1,
              mx: 1,
              color: "#4facfe",
              height: 4,
              "& .MuiSlider-thumb": {
                width: 14,
                height: 14,
                backgroundColor: "#fff",
                boxShadow: "0 0 10px rgba(79,172,254,0.6)",
                "&:hover": { boxShadow: "0 0 16px rgba(79,172,254,0.8)" },
              },
              "& .MuiSlider-track": {
                background: "linear-gradient(90deg, #4facfe, #00f2fe)",
                border: "none",
              },
              "& .MuiSlider-rail": {
                backgroundColor: "rgba(255,255,255,0.12)",
              },
            }}
          />

          {/* Hour markers */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.3, ml: 1 }}>
            {[0, 6, 12, 18, 23].map((idx) => (
              <Typography
                key={idx}
                variant="caption"
                onClick={() => { setIsPlaying(false); setHourIndex(idx); }}
                sx={{
                  color: hourIndex === idx ? "#4facfe" : "rgba(255,255,255,0.35)",
                  fontWeight: hourIndex === idx ? 700 : 400,
                  fontSize: "0.65rem",
                  cursor: "pointer",
                  px: 0.5,
                  borderRadius: 1,
                  transition: "all 0.2s",
                  "&:hover": { color: "#4facfe", backgroundColor: "rgba(79,172,254,0.1)" },
                }}
              >
                {hourLabels[idx]?.label}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
