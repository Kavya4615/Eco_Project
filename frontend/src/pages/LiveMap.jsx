import { Box, Typography } from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";

function getAQIColor(aqi) {
  if (aqi <= 50) return "green"
  if (aqi <= 100) return "yellow"
  if (aqi <= 150) return "orange"
  if (aqi <= 200) return "red"
  if (aqi <= 300) return "purple"
  return "maroon"
}

function LiveMap() {

  const indiaBounds = [
    [6, 68],
    [37, 97]
  ]

  const [locations] = useState([
    { city: "Delhi", lat: 28.61, lon: 77.20, aqi: 210 },
    { city: "Mumbai", lat: 19.07, lon: 72.87, aqi: 140 },
    { city: "Chennai", lat: 13.08, lon: 80.27, aqi: 95 },
    { city: "Kolkata", lat: 22.57, lon: 88.36, aqi: 180 }
  ])

  return (

    <Box sx={{ height: "100vh" }}>

      <Typography variant="h4" sx={{ p: 2 }}>
        Live Air Quality Map
      </Typography>

      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        minZoom={5}
        maxBounds={indiaBounds}
        maxBoundsViscosity={1}
        style={{ height: "90%" }}
      >

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap
        />

        {locations.map((loc, i) => {

          const color = getAQIColor(loc.aqi)

          const icon = L.divIcon({
            html: `<div style="
            background:${color};
            width:18px;
            height:18px;
            border-radius:50%;
            border:3px solid white;"></div>`
          })

          return (
            <Marker key={i} position={[loc.lat, loc.lon]} icon={icon}>
              <Popup>
                <strong>{loc.city}</strong>
                <br />
                AQI: {loc.aqi}
              </Popup>
            </Marker>
          )

        })}

      </MapContainer>

    </Box>
  )
}

export default LiveMap