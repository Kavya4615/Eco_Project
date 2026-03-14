import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

function Home() {
  return (
    <Box sx={{ height: "100vh", width: "100%", position: "relative" }}>

      {/* HERO SECTION */}
      <Box
        sx={{
          height: "100%",
          width: "100%",
          backgroundImage:
            "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* GRADIENT OVERLAY */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.75) 100%)",
          }}
        />

        {/* MAIN CONTENT */}
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            maxWidth: 700,
            px: 2,
          }}
        >
          <Typography
            variant="h2"
            fontWeight={700}
            color="white"
            gutterBottom
            sx={{
              letterSpacing: 1,
              textShadow: "0 5px 25px rgba(0,0,0,0.6)",
            }}
          >
            Explore Your Air Quality
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "rgba(255,255,255,0.9)",
              mb: 4,
            }}
          >
            Monitor pollution levels, discover cleaner locations,
            and track air quality in real time.
          </Typography>

          {/* SEARCH BAR */}
          <TextField
            fullWidth
            placeholder="Search your city (e.g. Delhi)..."
            variant="outlined"
            sx={{
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: 3,
              boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* AQI FLOATING CARD */}
        <Card
          sx={{
            position: "absolute",
            bottom: 60,
            left: 60,
            width: 320,
            borderRadius: 4,
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            transition: "transform 0.3s",
            "&:hover": {
              transform: "scale(1.05)",
            },
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Salem AQI
            </Typography>

            <Typography
              variant="h2"
              sx={{
                color: "#f4b400",
                fontWeight: 800,
                textShadow: "0 0 15px rgba(244,180,0,0.6)",
              }}
            >
              56
            </Typography>

            <Typography color="text.secondary">
              Moderate Air Quality
            </Typography>

            <Button
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 600,
                background:
                  "linear-gradient(45deg,#6a5cff,#7c4dff)",
                boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
                "&:hover": {
                  background:
                    "linear-gradient(45deg,#5a4cff,#6a3cff)",
                },
              }}
            >
              7-Day Forecast
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default Home;