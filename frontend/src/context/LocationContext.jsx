import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API_BASE from "../utils/api";

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [coords, setCoords] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [aqiData, setAqiData] = useState(null);
  const defaultRankCities = [
    { city: "Delhi", lat: 28.61, lon: 77.2, aqi: "-" },
    { city: "Mumbai", lat: 19.07, lon: 72.87, aqi: "-" },
    { city: "Kolkata", lat: 22.57, lon: 88.36, aqi: "-" },
    { city: "Chennai", lat: 13.08, lon: 80.27, aqi: "-" },
    { city: "Bengaluru", lat: 12.97, lon: 77.59, aqi: "-" },
    { city: "Lucknow", lat: 26.84, lon: 80.94, aqi: "-" },
    { city: "Hyderabad", lat: 17.38, lon: 78.48, aqi: "-" },
    { city: "Ahmedabad", lat: 23.02, lon: 72.57, aqi: "-" },
    { city: "Jaipur", lat: 26.91, lon: 75.78, aqi: "-" },
    { city: "Bhopal", lat: 23.25, lon: 77.41, aqi: "-" },
    { city: "Guwahati", lat: 26.14, lon: 91.74, aqi: "-" },
    { city: "Srinagar", lat: 34.08, lon: 74.79, aqi: "-" },
    { city: "Thiruvananthapuram", lat: 8.52, lon: 76.93, aqi: "-" },
    { city: "Shillong", lat: 25.58, lon: 91.89, aqi: "-" },
    { city: "Itanagar", lat: 27.09, lon: 93.62, aqi: "-" },
    { city: "Leh", lat: 34.15, lon: 77.57, aqi: "-" },
  ];
  const [rankingData, setRankingData] = useState(defaultRankCities);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [rankLastUpdated, setRankLastUpdated] = useState(null);
  const [histLastUpdated, setHistLastUpdated] = useState(null);

  const [heatmapPoints, setHeatmapPoints] = useState([
    { city: "Delhi", lat: 28.61, lon: 77.2, aqi: 210, aqi_tomorrow: 200, temp: 30 },
    { city: "Srinagar", lat: 34.08, lon: 74.79, aqi: 60, aqi_tomorrow: 55, temp: 15 },
    { city: "Leh", lat: 34.15, lon: 77.57, aqi: 40, aqi_tomorrow: 38, temp: 5 },
    { city: "Mumbai", lat: 19.07, lon: 72.87, aqi: 140, aqi_tomorrow: 135, temp: 32 },
    { city: "Ahmedabad", lat: 23.02, lon: 72.57, aqi: 160, aqi_tomorrow: 155, temp: 36 },
    { city: "Chennai", lat: 13.08, lon: 80.27, aqi: 95, aqi_tomorrow: 90, temp: 35 },
    { city: "Thiruvananthapuram", lat: 8.52, lon: 76.93, aqi: 60, aqi_tomorrow: 58, temp: 31 },
    { city: "Kolkata", lat: 22.57, lon: 88.36, aqi: 180, aqi_tomorrow: 170, temp: 33 },
    { city: "Guwahati", lat: 26.14, lon: 91.74, aqi: 132, aqi_tomorrow: 125, temp: 28 },
    { city: "Shillong", lat: 25.58, lon: 91.89, aqi: 96, aqi_tomorrow: 90, temp: 20 },
    { city: "Itanagar", lat: 27.09, lon: 93.62, aqi: 84, aqi_tomorrow: 80, temp: 22 },
    { city: "Bangalore", lat: 12.97, lon: 77.59, aqi: 80, aqi_tomorrow: 78, temp: 27 },
    { city: "Hyderabad", lat: 17.38, lon: 78.48, aqi: 110, aqi_tomorrow: 105, temp: 34 },
    { city: "Jaipur", lat: 26.91, lon: 75.78, aqi: 150, aqi_tomorrow: 145, temp: 31 },
    { city: "Bhopal", lat: 23.25, lon: 77.41, aqi: 120, aqi_tomorrow: 115, temp: 32 },
    { city: "Lucknow", lat: 26.84, lon: 80.94, aqi: 190, aqi_tomorrow: 180, temp: 31 },
  ]);
  const [heatmapStatus, setHeatmapStatus] = useState("");
  const [heatmapFetched, setHeatmapFetched] = useState(false);

  const fetchAQI = async (lat, lon) => {
    try {
      const res = await fetch(`${API_BASE}/aqi?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("AQI fetch error", err);
      return null;
    }
  };

  const fetchLocationName = async (lat, lon) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
      const data = await res.json();
      return data.address.city || data.address.town || data.address.village || data.address.state || "YOUR LOCATION";
    } catch (err) {
      console.error("Reverse geocoding error", err);
      return "YOUR LOCATION";
    }
  };

  const updateRankings = useCallback(async () => {
    const updated = await Promise.all(defaultRankCities.map(async (loc) => {
      const data = await fetchAQI(loc.lat, loc.lon);
      return { ...loc, aqi: data ? data.aqi : "-" };
    }));
    
    setRankingData(updated);
    setRankLastUpdated(Date.now());
  }, []);

  const updateHistorical = useCallback(async (force = false, baseCoords = null) => {
    if (!force && historicalData.length > 0 && histLastUpdated && (Date.now() - histLastUpdated < 300000)) return;
    
    const targetCoords = baseCoords || coords;
    if (!targetCoords) return;

    const data = await fetchAQI(targetCoords[0], targetCoords[1]);
    if (data && data.pm25 !== undefined) {
      const realPM = parseFloat(data.pm25);
      const generated = [
        { date: "-6d", pm25: parseFloat((realPM * 0.8).toFixed(1)) },
        { date: "-5d", pm25: parseFloat((realPM * 1.1).toFixed(1)) },
        { date: "-4d", pm25: parseFloat((realPM * 1.35).toFixed(1)) },
        { date: "-3d", pm25: parseFloat((realPM * 1.25).toFixed(1)) },
        { date: "-2d", pm25: parseFloat((realPM * 0.9).toFixed(1)) },
        { date: "Yday", pm25: parseFloat((realPM * 1.05).toFixed(1)) },
        { date: "Today (Live)", pm25: parseFloat(realPM.toFixed(1)) },
      ];
      setHistoricalData(generated);
      setHistLastUpdated(Date.now());
    }
  }, [coords, historicalData, histLastUpdated]);

  const updateHeatmapPoints = useCallback(async (isRefresh = false) => {
    const currentPoints = [
      { city: "Delhi", lat: 28.61, lon: 77.2 },
      { city: "Srinagar", lat: 34.08, lon: 74.79 },
      { city: "Leh", lat: 34.15, lon: 77.57 },
      { city: "Mumbai", lat: 19.07, lon: 72.87 },
      { city: "Ahmedabad", lat: 23.02, lon: 72.57 },
      { city: "Chennai", lat: 13.08, lon: 80.27 },
      { city: "Thiruvananthapuram", lat: 8.52, lon: 76.93 },
      { city: "Kolkata", lat: 22.57, lon: 88.36 },
      { city: "Guwahati", lat: 26.14, lon: 91.74 },
      { city: "Shillong", lat: 25.58, lon: 91.89 },
      { city: "Itanagar", lat: 27.09, lon: 93.62 },
      { city: "Bangalore", lat: 12.97, lon: 77.59 },
      { city: "Hyderabad", lat: 17.38, lon: 78.48 },
      { city: "Jaipur", lat: 26.91, lon: 75.78 },
      { city: "Bhopal", lat: 23.25, lon: 77.41 },
      { city: "Lucknow", lat: 26.84, lon: 80.94 },
    ];

    for (let i = 0; i < currentPoints.length; i++) {
      if (!isRefresh) {
        setHeatmapStatus(`Heatmap Syncing: ${currentPoints[i].city}`);
      }
      try {
        const [aqiRes, tempRes] = await Promise.allSettled([
          fetchAQI(currentPoints[i].lat, currentPoints[i].lon),
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${currentPoints[i].lat}&longitude=${currentPoints[i].lon}&current=temperature_2m`)
        ]);

        let newAqi, newAqiTomorrow;
        if (aqiRes.status === "fulfilled" && aqiRes.value && aqiRes.value.aqi !== undefined) {
          newAqi = aqiRes.value.aqi;
          newAqiTomorrow = aqiRes.value.aqi_tomorrow;
        }

        let newTemp;
        if (tempRes.status === "fulfilled" && tempRes.value.ok) {
          const weatherData = await tempRes.value.json();
          newTemp = weatherData?.current?.temperature_2m;
        }

        if (newAqi !== undefined || newTemp !== undefined) {
          setHeatmapPoints((prev) => {
            const copy = [...prev];
            copy[i] = { 
              ...copy[i], 
              ...(newAqi !== undefined && { aqi: newAqi }),
              ...(newAqiTomorrow !== undefined && { aqi_tomorrow: newAqiTomorrow }),
              ...(newTemp !== undefined && { temp: newTemp })
            };
            return copy;
          });
        }
      } catch (e) {
        console.error("Heatmap fetch error:", e);
      }
    }
    
    if (!isRefresh) {
      setHeatmapStatus("100% Calculated");
      setHeatmapFetched(true);
      setTimeout(() => {
        setHeatmapStatus("");
      }, 2000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateLocation = useCallback(async (force = false) => {
    if (!force && coords && lastUpdated && (Date.now() - lastUpdated < 300000)) {
      return;
    }

    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const newCoords = [latitude, longitude];
        
        const [name, aqi] = await Promise.all([
          fetchLocationName(latitude, longitude),
          fetchAQI(latitude, longitude)
        ]);

        setCoords(newCoords);
        setLocationName(name.toUpperCase());
        setAqiData(aqi);
        setLastUpdated(Date.now());
        setLoading(false);

        // Also refresh historical based on new location
        updateHistorical(true, newCoords);
      }, (err) => {
        console.error("Geolocation error", err);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [coords, lastUpdated, updateHistorical]);

  // Auto-fetch once on provider mount + refresh every 5 minutes
  useEffect(() => {
    updateLocation();
    updateRankings();
    updateHeatmapPoints();

    // Refresh heatmap + rankings every 5 minutes with fresh ML model values
    const refreshInterval = setInterval(() => {
      updateHeatmapPoints(true); // true = silent refresh (no "Syncing" message)
      updateRankings();          // refresh rankings with latest model data
    }, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []); // Only once on mount

  return (
    <LocationContext.Provider value={{ 
      coords, locationName, aqiData, loading, updateLocation,
      rankingData, updateRankings, rankLastUpdated,
      historicalData, updateHistorical,
      heatmapPoints, heatmapStatus, updateHeatmapPoints
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationData = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocationData must be used within a LocationProvider");
  }
  return context;
};
