import {
  Box,
  Typography,
  Card,
  CardContent,
} from "@mui/material";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { useState } from "react";

function Historical() {

  // Temporary data (replace with backend later)
  const [data] = useState([
    { date: "Mon", pm25: 40 },
    { date: "Tue", pm25: 55 },
    { date: "Wed", pm25: 80 },
    { date: "Thu", pm25: 65 },
    { date: "Fri", pm25: 90 },
    { date: "Sat", pm25: 70 },
    { date: "Sun", pm25: 50 },
  ]);

  return (
    <Box sx={{ p: 4 }}>

      <Typography variant="h4" gutterBottom>
        Historical PM2.5 Data
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        View historical pollution trends.
      </Typography>

      <Card>
        <CardContent>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="pm25"
                stroke="#f44336"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>

        </CardContent>
      </Card>

    </Box>
  );
}

export default Historical;