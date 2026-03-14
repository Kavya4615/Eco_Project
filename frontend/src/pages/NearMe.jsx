import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
} from "@mui/material";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";

/* Move map when location changes */
function ChangeMapView({ position }) {
  const map = useMap();
  map.setView(position, 10);
  return null;
}

function getAQIColor(aqi) {
  if (aqi <= 50) return "green";
  if (aqi <= 100) return "yellow";
  if (aqi <= 150) return "orange";
  if (aqi <= 200) return "red";
  if (aqi <= 300) return "purple";
  return "maroon";
}

function NearMe() {
  const [location, setLocation] = useState("");
  const [position, setPosition] = useState([20.5937, 78.9629]);
  const [aqiData, setAqiData] = useState(null);

  const indiaBounds = [
    [6, 68],
    [37, 97]
  ];

  const searchLocation = async () => {
    const geoResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${location}`
    );

    const geoData = await geoResponse.json();

    if (!geoData.length) return;

    const lat = parseFloat(geoData[0].lat);
    const lon = parseFloat(geoData[0].lon);

    setPosition([lat, lon]);

    try {
      const res = await fetch(
        `http://localhost:5000/aqi?lat=${lat}&lon=${lon}`
      );

      const data = await res.json();
      setAqiData(data);
    } catch (err) {
      console.log(err);
    }
  };

  const color = aqiData ? getAQIColor(aqiData.aqi) : "blue";

  const icon = L.divIcon({
    html: `<div style="
      background:${color};
      width:20px;
      height:20px;
      border-radius:50%;
      border:3px solid white;"></div>`
  });

  return (
    <Box sx={{ p: 4 }}>
      <Card sx={{ maxWidth: 600, mx: "auto", mb: 3 }}>
        <CardContent>

          <Typography variant="h5">
            Air Quality Near Me
          </Typography>

          <TextField
            fullWidth
            placeholder="Enter city"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />

          <Button
            variant="contained"
            fullWidth
            onClick={searchLocation}
          >
            Show on Map
          </Button>

        </CardContent>
      </Card>

      <Box sx={{ height: "500px" }}>
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          minZoom={5}
          maxBounds={indiaBounds}
          maxBoundsViscosity={1}
          style={{ height: "100%", width: "100%" }}
        >

          <ChangeMapView position={position} />

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            noWrap
          />

          <Marker position={position} icon={icon}>
            <Popup>
              {location}
              <br />
              AQI: {aqiData?.aqi ?? "Loading"}
            </Popup>
          </Marker>

        </MapContainer>
      </Box>
    </Box>
  );
}

export default NearMe;