import { Box } from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";

function getAQIColor(aqi) {
  if (aqi <= 50) return "green";
  if (aqi <= 100) return "yellow";
  if (aqi <= 150) return "orange";
  if (aqi <= 200) return "red";
  if (aqi <= 300) return "purple";
  return "maroon";
}

function Map() {

  const position = [11.6643, 78.1460]

  const indiaBounds = [
    [6, 68],
    [37, 97]
  ]

  const [aqiData, setAqiData] = useState(null)

  useEffect(() => {

    const fetchAQI = async () => {

      const res = await fetch(
        `http://localhost:5000/aqi?lat=${position[0]}&lon=${position[1]}`
      )

      const data = await res.json()

      setAqiData(data)

    }

    fetchAQI()

  }, [])

  const color = aqiData ? getAQIColor(aqiData.aqi) : "blue"

  const icon = L.divIcon({
    html: `<div style="
    background:${color};
    width:20px;
    height:20px;
    border-radius:50%;
    border:3px solid white;"></div>`
  })

  return (
    <Box sx={{ height: "100vh" }}>

      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        minZoom={5}
        maxBounds={indiaBounds}
        maxBoundsViscosity={1}
        style={{ height: "100%" }}
      >

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap
        />

        <Marker position={position} icon={icon}>
          <Popup>
            AQI: {aqiData?.aqi ?? "Loading"}
          </Popup>
        </Marker>

      </MapContainer>

    </Box>
  )
}

export default Map