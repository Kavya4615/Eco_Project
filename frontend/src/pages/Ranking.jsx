import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import { useState, useEffect } from "react";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

/* AQI color logic */
function getAQIColor(aqi) {
  if (aqi <= 50) return "success";
  if (aqi <= 100) return "warning";
  if (aqi <= 150) return "warning";
  if (aqi <= 200) return "error";
  if (aqi <= 300) return "secondary";
  return "error";
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

function Ranking() {
  const { rankingData, rankLastUpdated } = useLocationData();
  
  // Data is syncing if the initial fetch hasn't completed yet
  const loading = !rankLastUpdated;

  const sortedCities = [...rankingData].sort((a, b) => {
    if (a.aqi === "-") return 1;
    if (b.aqi === "-") return -1;
    return b.aqi - a.aqi;
  });

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", px: { xs: 2, md: 3 }, py: { xs: 3, md: 5 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <EmojiEventsIcon sx={{ fontSize: { xs: 28, md: 36 }, color: "#f7971e" }} />
        <Typography variant="h4" sx={{ fontSize: { xs: "1.3rem", sm: "1.6rem", md: "2.125rem" } }}>
          Live Air Quality Ranking
        </Typography>
      </Box>

      <Typography color="text.secondary" sx={{ mb: { xs: 2, md: 4 }, ml: 0.5, fontSize: { xs: "0.85rem", md: "1rem" } }}>
        Cities ranked by live Air Quality Index (AQI) from the ML model
        {loading && <Box component="span" sx={{ color: "#f7971e", fontWeight: "bold", ml: 1 }}>⚡ Syncing Data...</Box>}
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          overflow: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Table sx={{ minWidth: { xs: 400, md: "auto" } }}>
          <TableHead>
            <TableRow
              sx={{
                background: "linear-gradient(135deg, #1a1a2e, #16213e)",
              }}
            >
              <TableCell sx={{ color: "white", fontWeight: 700, fontSize: { xs: "0.75rem", md: "0.9rem" }, px: { xs: 1, md: 2 } }}>
                Rank
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 700, fontSize: { xs: "0.75rem", md: "0.9rem" }, px: { xs: 1, md: 2 } }}>
                City
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 700, fontSize: { xs: "0.75rem", md: "0.9rem" }, px: { xs: 1, md: 2 } }}>
                AQI
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 700, fontSize: { xs: "0.75rem", md: "0.9rem" }, px: { xs: 1, md: 2 } }}>
                Status
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedCities.map((row, index) => (
              <TableRow
                key={row.city}
                sx={{
                  backgroundColor:
                    index % 2 === 0
                      ? "rgba(46, 125, 50, 0.02)"
                      : "white",
                  transition: "background-color 0.2s",
                  "&:hover": {
                    backgroundColor: "rgba(46,125,50,0.06)",
                  },
                }}
              >
                <TableCell>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      background:
                        index === 0
                          ? "linear-gradient(135deg, #f7971e, #ffd200)"
                          : index === 1
                          ? "linear-gradient(135deg, #bbb, #ddd)"
                          : index === 2
                          ? "linear-gradient(135deg, #cd7f32, #e8a84c)"
                          : "rgba(0,0,0,0.06)",
                      color: index < 3 ? "white" : "#666",
                    }}
                  >
                    {index + 1}
                  </Box>
                </TableCell>

                <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  {row.city}
                </TableCell>

                <TableCell sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
                  {row.aqi}
                </TableCell>

                <TableCell>
                  {row.aqi !== "-" ? (
                    <Chip
                      label={getAQILabel(row.aqi)}
                      color={getAQIColor(row.aqi)}
                      variant="filled"
                      size="small"
                      sx={{ fontWeight: 600, minWidth: 100 }}
                    />
                  ) : (
                    <Chip label="Loading" size="small" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default Ranking;