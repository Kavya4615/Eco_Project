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
import { useState } from "react";
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

function Ranking() {
  // temporary data (replace with backend later)
  const [cities] = useState([
    { city: "Delhi", aqi: 220 },
    { city: "Beijing", aqi: 190 },
    { city: "Mumbai", aqi: 140 },
    { city: "Los Angeles", aqi: 110 },
    { city: "London", aqi: 80 },
    { city: "Sydney", aqi: 45 },
  ]);

  const sortedCities = [...cities].sort((a, b) => b.aqi - a.aqi);

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", px: 3, py: 5 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <EmojiEventsIcon sx={{ fontSize: 36, color: "#f7971e" }} />
        <Typography variant="h4">
          Live Air Quality Ranking
        </Typography>
      </Box>

      <Typography color="text.secondary" sx={{ mb: 4, ml: 0.5 }}>
        Cities ranked by Air Quality Index (AQI) — higher is worse
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                background: "linear-gradient(135deg, #1a1a2e, #16213e)",
              }}
            >
              <TableCell sx={{ color: "white", fontWeight: 700, fontSize: "0.9rem" }}>
                Rank
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 700, fontSize: "0.9rem" }}>
                City
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 700, fontSize: "0.9rem" }}>
                AQI
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 700, fontSize: "0.9rem" }}>
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
                  <Chip
                    label={getAQILabel(row.aqi)}
                    color={getAQIColor(row.aqi)}
                    variant="filled"
                    size="small"
                    sx={{ fontWeight: 600, minWidth: 100 }}
                  />
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