import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Button,
  Grid,
} from "@mui/material";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import BarChartIcon from "@mui/icons-material/BarChart";
import MapIcon from "@mui/icons-material/Map";
import TimelineIcon from "@mui/icons-material/Timeline";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

const features = [
  {
    icon: <MyLocationIcon sx={{ fontSize: 40, color: "#43e97b" }} />,
    title: "Air Quality Near Me",
    desc: "Check real-time pollution levels at your exact location.",
    to: "/near-me",
  },
  {
    icon: <MapIcon sx={{ fontSize: 40, color: "#4facfe" }} />,
    title: "Live AQI Map",
    desc: "Interactive map with color-coded AQI markers across India.",
    to: "/live-map",
  },
  {
    icon: <BarChartIcon sx={{ fontSize: 40, color: "#f7971e" }} />,
    title: "City Rankings",
    desc: "See which cities have the best and worst air quality.",
    to: "/ranking",
  },
  {
    icon: <TimelineIcon sx={{ fontSize: 40, color: "#f44336" }} />,
    title: "Historical Trends",
    desc: "Analyze PM2.5 pollution trends over time.",
    to: "/historical",
  },
];

import { useLocationData } from "../context/LocationContext";

function Home() {
  const { coords, locationName: homeLocName, aqiData: homeAQI, updateLocation } = useLocationData();
  const muiTheme = useMuiTheme();
  const isDark = muiTheme.palette.mode === "dark";

  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate('/near-me', { state: { initialSearch: searchQuery.trim() } });
    } else {
      navigate('/near-me');
    }
  };

  return (
    <Box>
      {/* ═══ HERO SECTION ═══ */}
      <Box
        sx={{
          minHeight: { xs: "80vh", md: "92vh" },
          width: "100%",
          backgroundImage:
            "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: { xs: "scroll", md: "fixed" },
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Gradient overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.7) 60%, rgba(26,26,46,0.95) 100%)",
          }}
        />

        {/* Content */}
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            maxWidth: 720,
            px: { xs: 2, md: 3 },
            width: "100%",
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: "#43e97b",
              fontWeight: 700,
              letterSpacing: 3,
              fontSize: "0.85rem",
              mb: 2,
              display: "block",
            }}
          >
            REAL-TIME MONITORING
          </Typography>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              color: "white",
              mb: 2,
              lineHeight: 1.15,
              textShadow: "0 4px 30px rgba(0,0,0,0.4)",
              fontSize: { xs: "2rem", sm: "2.75rem", md: "3.5rem" },
            }}
          >
            Explore Your{" "}
            <Box
              component="span"
              sx={{
                background: "linear-gradient(135deg, #43e97b, #38f9d7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Air Quality
            </Box>
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "rgba(255,255,255,0.8)",
              mb: 4,
              fontWeight: 400,
              lineHeight: 1.6,
              fontSize: { xs: "0.95rem", md: "1.15rem" },
            }}
          >
            Monitor pollution levels, discover cleaner locations,
            and track air quality in real time across India.
          </Typography>

          {/* Search bar */}
          <TextField
            fullWidth
            placeholder="Search your city (e.g. Delhi, Mumbai)..."
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            sx={{
              maxWidth: 540,
              backgroundColor: isDark ? "rgba(26, 29, 40, 0.85)" : "rgba(255,255,255,0.95)",
              backdropFilter: isDark ? "blur(16px)" : "none",
              borderRadius: 4,
              boxShadow: isDark ? "0 8px 40px rgba(0,0,0,0.6)" : "0 8px 40px rgba(0,0,0,0.3)",
              border: isDark ? "1px solid rgba(255,255,255,0.15)" : "none",
              "& .MuiOutlinedInput-root": {
                borderRadius: 4,
                py: 0.5,
                color: isDark ? "white" : "#1a1a2e",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: isDark ? "#4facfe" : "#2e7d32" }} />
                </InputAdornment>
              ),
            }}
          />

          {/* CTA buttons */}
          <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              onClick={handleSearch}
              variant="contained"
              size="large"
              sx={{
                background: "linear-gradient(135deg, #43e97b, #38f9d7)",
                color: "#1a1a2e",
                fontWeight: 700,
                px: 4,
                py: 1.3,
                boxShadow: "0 6px 25px rgba(67,233,123,0.35)",
                "&:hover": {
                  background: "linear-gradient(135deg, #38d96e, #2ee8c6)",
                  boxShadow: "0 8px 30px rgba(67,233,123,0.45)",
                },
              }}
            >
              Check Air Near Me
            </Button>
            <Button
              component={Link}
              to="/live-map"
              variant="outlined"
              size="large"
              sx={{
                borderColor: "rgba(255,255,255,0.5)",
                color: "white",
                px: 4,
                py: 1.3,
                "&:hover": {
                  borderColor: "#43e97b",
                  color: "#43e97b",
                  backgroundColor: "rgba(67,233,123,0.08)",
                },
              }}
            >
              View Live Map
            </Button>
          </Box>
        </Box>

        {/* Floating AQI Card */}
        <Card
          sx={{
            position: "absolute",
            bottom: { xs: 12, md: 60 },
            left: { xs: 12, md: 60 },
            width: { xs: 160, sm: 200, md: 280 },
            borderRadius: { xs: 3, md: 4 },
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
            transition: "transform 0.3s ease",
            zIndex: 3,
            color: "white",
            "&:hover": {
              transform: { xs: "none", md: "translateY(-6px)" },
            },
          }}
        >
          <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
            <Typography
              variant="subtitle2"
              sx={{ opacity: 0.7, fontWeight: 500, letterSpacing: 1, fontSize: { xs: "0.65rem", md: "0.875rem" } }}
            >
              {homeLocName}
            </Typography>

            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #f7971e, #ffd200)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                my: 0.5,
                fontSize: { xs: "1.6rem", sm: "2.2rem", md: "3rem" },
              }}
            >
              {homeAQI ? homeAQI.aqi : "--"}
            </Typography>

            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              {homeAQI ? homeAQI.category : "Loading quality..."}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* ═══ FEATURES SECTION ═══ */}
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          px: 3,
          background: isDark
            ? "linear-gradient(180deg, #1a1a2e 0%, #0f1117 15%)"
            : "linear-gradient(180deg, #1a1a2e 0%, #f8faf9 15%)",
        }}
      >
        <Box sx={{ maxWidth: 1100, mx: "auto", textAlign: "center" }}>
          <Typography
            variant="overline"
            sx={{
              color: "#2e7d32",
              fontWeight: 700,
              letterSpacing: 3,
              fontSize: "0.8rem",
            }}
          >
            FEATURES
          </Typography>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mt: 1,
              mb: 2,
              fontSize: { xs: "1.8rem", md: "2.5rem" },
            }}
          >
            Everything You Need to{" "}
            <Box
              component="span"
              sx={{
                background: "linear-gradient(135deg, #2e7d32, #00c853)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Breathe Better
            </Box>
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto", mb: 6, fontSize: "1.05rem" }}
          >
            Monitor, analyze, and understand the air around you with our comprehensive tools.
          </Typography>

          <Grid container spacing={3}>
            {features.map((f) => (
              <Grid item xs={12} sm={6} md={3} key={f.title}>
                <Card
                  component={Link}
                  to={f.to}
                  sx={{
                    height: "100%",
                    textAlign: "center",
                    p: 3,
                    cursor: "pointer",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 16px 48px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        width: 72,
                        height: 72,
                        mx: "auto",
                        mb: 2,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(46,125,50,0.06)",
                      }}
                    >
                      {f.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {f.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {f.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box> {/* This closes the Features section Box */}

      {/* ═══ MAP PREVIEW SECTION ═══ */}
      <Box
        sx={{
          py: { xs: 5, md: 10 },
          px: { xs: 2, md: 3 },
          backgroundColor: isDark ? "#0f1117" : "#fff",
        }}
      >
        <Box sx={{ maxWidth: 1100, mx: "auto" }}>
          <Grid container spacing={{ xs: 3, md: 6 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="overline" sx={{ color: "#2e7d32", fontWeight: 700, letterSpacing: 3 }}>
                LIVE PREVIEW
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, mb: 3, fontSize: { xs: "1.6rem", sm: "2rem", md: "3rem" } }}>
                Visualize Air Quality <br />
                <Box component="span" sx={{ color: "#2e7d32" }}>On the Map</Box>
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 4, fontSize: "1.1rem" }}>
                Our interactive map provides real-time insights into pollution levels across the country.
                Easily identify safe zones and areas with high pollution.
              </Typography>
              <Button
                component={Link}
                to="/live-map"
                variant="contained"
                size="large"
                startIcon={<MapIcon />}
                sx={{
                  background: "linear-gradient(135deg, #2e7d32, #00c853)",
                  px: 4,
                  py: 1.5,
                  borderRadius: "12px",
                  boxShadow: "0 8px 24px rgba(46,125,50,0.25)",
                }}
              >
                Open Interactive Map
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: { xs: 3, md: 6 },
                  overflow: "hidden",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                  height: { xs: 250, sm: 300, md: 400 },
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: "100%",
                    background: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage: "url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      opacity: 0.8,
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.2)",
                      backdropFilter: "blur(2px)",
                    }}
                  />
                  <Button
                    component={Link}
                    to="/live-map"
                    variant="contained"
                    sx={{
                      zIndex: 2,
                      backgroundColor: "white",
                      color: "#1a1a2e",
                      fontWeight: 700,
                      "&:hover": { backgroundColor: "#f0f0f0" },
                    }}
                  >
                    Click to View Map
                  </Button>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}

export default Home;