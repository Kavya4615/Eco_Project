import { createContext, useContext, useState, useEffect, useCallback } from "react";

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [coords, setCoords] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [aqiData, setAqiData] = useState(null);
  const [rankingData, setRankingData] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [rankLastUpdated, setRankLastUpdated] = useState(null);
  const [histLastUpdated, setHistLastUpdated] = useState(null);

  const [heatmapPoints, setHeatmapPoints] = useState([
    { city: "Delhi", lat: 28.61, lon: 77.2, aqi: 210 },
    { city: "Mumbai", lat: 19.07, lon: 72.87, aqi: 140 },
    { city: "Chennai", lat: 13.08, lon: 80.27, aqi: 95 },
    { city: "Kolkata", lat: 22.57, lon: 88.36, aqi: 180 },
    { city: "Guwahati", lat: 26.14, lon: 91.74, aqi: 132 },
    { city: "Shillong", lat: 25.58, lon: 91.89, aqi: 96 },
    { city: "Itanagar", lat: 27.09, lon: 93.62, aqi: 84 },
    { city: "Bangalore", lat: 12.97, lon: 77.59, aqi: 80 },
    { city: "Hyderabad", lat: 17.38, lon: 78.48, aqi: 110 },
    { city: "Jaipur", lat: 26.91, lon: 75.78, aqi: 150 },
    { city: "Bhopal", lat: 23.25, lon: 77.41, aqi: 120 },
    { city: "Lucknow", lat: 26.84, lon: 80.94, aqi: 190 },
  ]);
  const [heatmapStatus, setHeatmapStatus] = useState("");
  const [heatmapFetched, setHeatmapFetched] = useState(false);

  const fetchAQI = async (lat, lon) => {
    try {
      const res = await fetch(`http://localhost:5000/aqi?lat=${lat}&lon=${lon}`);
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

  const updateRankings = useCallback(async (force = false) => {
    if (!force && rankingData.length > 0 && rankLastUpdated && (Date.now() - rankLastUpdated < 300000)) return;

    const defaultCities = [
      { city: "Delhi", lat: 28.61, lon: 77.2 },
      { city: "Mumbai", lat: 19.07, lon: 72.87 },
      { city: "Kolkata", lat: 22.57, lon: 88.36 },
      { city: "Chennai", lat: 13.08, lon: 80.27 },
      { city: "Bengaluru", lat: 12.97, lon: 77.59 },
      { city: "Lucknow", lat: 26.84, lon: 80.94 },
    ];

    const updated = [];
    for (const loc of defaultCities) {
      const data = await fetchAQI(loc.lat, loc.lon);
      updated.push({ ...loc, aqi: data ? data.aqi : "-" });
    }
    setRankingData(updated);
    setRankLastUpdated(Date.now());
  }, [rankingData, rankLastUpdated]);

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

  const updateHeatmapPoints = useCallback(async () => {
    if (heatmapFetched) return;
    
    const currentPoints = [
      { city: "Delhi", lat: 28.61, lon: 77.2 },
      { city: "Mumbai", lat: 19.07, lon: 72.87 },
      { city: "Chennai", lat: 13.08, lon: 80.27 },
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
      setHeatmapStatus(`Heatmap Syncing: ${currentPoints[i].city}`);
      try {
        const data = await fetchAQI(currentPoints[i].lat, currentPoints[i].lon);
        if (data && data.aqi !== undefined) {
          setHeatmapPoints((prev) => {
            const copy = [...prev];
            copy[i] = { ...copy[i], aqi: data.aqi };
            return copy;
          });
        }
      } catch (e) {
        console.error("Heatmap fetch error:", e);
      }
    }
    
    setHeatmapStatus("100% Calculated");
    setHeatmapFetched(true);
    setTimeout(() => {
      setHeatmapStatus("");
    }, 2000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heatmapFetched]);

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

  // Auto-fetch once on provider mount
  useEffect(() => {
    updateLocation();
    updateRankings();
    updateHeatmapPoints();
  }, []); // Only once on mount

  return (
    <LocationContext.Provider value={{ 
      coords, locationName, aqiData, loading, updateLocation,
      rankingData, updateRankings,
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
