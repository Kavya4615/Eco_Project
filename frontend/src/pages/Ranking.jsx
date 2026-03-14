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

/* AQI color logic */
function getAQIColor(aqi) {
  if (aqi <= 50) return "success";
  if (aqi <= 100) return "warning";
  if (aqi <= 150) return "warning";
  if (aqi <= 200) return "error";
  if (aqi <= 300) return "secondary";
  return "error";
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
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Live Air Quality Ranking
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Cities ranked by Air Quality Index (AQI)
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>City</TableCell>
              <TableCell>AQI</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedCities.map((row, index) => (
              <TableRow key={row.city}>
                <TableCell>{index + 1}</TableCell>

                <TableCell>{row.city}</TableCell>

                <TableCell>{row.aqi}</TableCell>

                <TableCell>
                  <Chip
                    label={row.aqi}
                    color={getAQIColor(row.aqi)}
                    variant="filled"
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