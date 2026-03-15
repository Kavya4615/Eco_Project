import { Box, Card, CardContent, Typography, Avatar, Button, Divider } from "@mui/material";
import { getCurrentUser, logoutUser } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import MapIcon from "@mui/icons-material/Map";
import PublicIcon from "@mui/icons-material/Public";
import LogoutIcon from "@mui/icons-material/Logout";

function Profile() {
  const user = getCurrentUser();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  const infoRow = (icon, label, value) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.2 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(46,125,50,0.08)",
          color: "#2e7d32",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" sx={{ color: "#999", fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {value || "—"}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", px: 3, py: 5 }}>
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        {/* Header banner */}
        <Box
          sx={{
            height: 120,
            background: "linear-gradient(135deg, #2e7d32, #00c853, #43e97b)",
            position: "relative",
          }}
        />

        <CardContent sx={{ textAlign: "center", mt: -6 }}>
          <Avatar
            src={user.profilePic}
            sx={{
              width: 96,
              height: 96,
              mx: "auto",
              mb: 2,
              border: "4px solid white",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
          />

          <Typography variant="h5" fontWeight={700}>
            {user.name}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {user.email}
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ textAlign: "left", px: 1 }}>
            {infoRow(<PhoneIcon fontSize="small" />, "Phone", user.phone)}
            {infoRow(<LocationCityIcon fontSize="small" />, "City", user.city)}
            {infoRow(<MapIcon fontSize="small" />, "State", user.state)}
            {infoRow(<PublicIcon fontSize="small" />, "Country", user.country)}
          </Box>

          <Button
            variant="contained"
            fullWidth
            startIcon={<LogoutIcon />}
            sx={{
              mt: 3,
              py: 1.2,
              background: "linear-gradient(135deg, #d32f2f, #f44336)",
              boxShadow: "0 4px 14px rgba(211,47,47,0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #b71c1c, #d32f2f)",
              },
            }}
            onClick={() => {
              logoutUser();
              navigate("/login");
            }}
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Profile;