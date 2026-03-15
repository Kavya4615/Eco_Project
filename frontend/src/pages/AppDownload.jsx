import { Box, Typography, Card, CardContent, Button } from "@mui/material";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import AndroidIcon from "@mui/icons-material/Android";
import AppleIcon from "@mui/icons-material/Apple";

function AppDownload() {
  return (
    <Box sx={{ maxWidth: 700, mx: "auto", px: 3, py: 5 }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 5 }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            mx: "auto",
            mb: 2,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #2e7d32, #00c853)",
            boxShadow: "0 8px 30px rgba(46,125,50,0.3)",
          }}
        >
          <PhoneAndroidIcon sx={{ color: "white", fontSize: 40 }} />
        </Box>

        <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
          Air Quality App
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 450, mx: "auto" }}>
          Download our mobile app to monitor air quality on the go and receive real-time alerts.
        </Typography>
      </Box>

      {/* Download cards */}
      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center" }}>
        <Card
          sx={{
            flex: "1 1 280px",
            maxWidth: 320,
            borderRadius: 4,
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-6px)",
              boxShadow: "0 12px 36px rgba(0,0,0,0.1)",
            },
          }}
        >
          <CardContent sx={{ textAlign: "center", p: 4 }}>
            <AndroidIcon sx={{ fontSize: 64, color: "#43e97b", mb: 2 }} />
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
              Android
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Available for Android 8.0 and above
            </Typography>
            <Button
              variant="contained"
              fullWidth
              sx={{
                background: "linear-gradient(135deg, #2e7d32, #00c853)",
                "&:hover": {
                  background: "linear-gradient(135deg, #1b5e20, #00a844)",
                },
              }}
            >
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card
          sx={{
            flex: "1 1 280px",
            maxWidth: 320,
            borderRadius: 4,
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-6px)",
              boxShadow: "0 12px 36px rgba(0,0,0,0.1)",
            },
          }}
        >
          <CardContent sx={{ textAlign: "center", p: 4 }}>
            <AppleIcon sx={{ fontSize: 64, color: "#333", mb: 2 }} />
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
              iOS
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Available for iOS 14.0 and above
            </Typography>
            <Button
              variant="outlined"
              fullWidth
              sx={{
                borderColor: "#333",
                color: "#333",
                "&:hover": {
                  borderColor: "#111",
                  backgroundColor: "rgba(0,0,0,0.04)",
                },
              }}
            >
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default AppDownload;