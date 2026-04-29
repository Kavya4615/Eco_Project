import { Box, Card, CardContent, Typography, Avatar, Button, Divider, IconButton, CircularProgress } from "@mui/material";
import { getCurrentUser, logoutUser } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import MapIcon from "@mui/icons-material/Map";
import PublicIcon from "@mui/icons-material/Public";
import LogoutIcon from "@mui/icons-material/Logout";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import API_BASE from "../utils/api";

function Profile() {
  const [user, setUser] = useState(getCurrentUser());
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      setUploading(true);
      try {
        const res = await fetch(`${API_BASE}/auth/upload-profile-pic`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, profilePic: base64String }),
        });
        const data = await res.json();
        if (data.success) {
          const updatedUser = { ...user, profilePic: base64String };
          localStorage.setItem("currentUser", JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };


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
    <Box sx={{ maxWidth: 600, mx: "auto", px: { xs: 2, md: 3 }, py: { xs: 3, md: 5 } }}>
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
          <Box sx={{ position: "relative", width: 96, mx: "auto", mb: 2 }}>
            <Avatar
              src={user.profilePic}
              sx={{
                width: 96,
                height: 96,
                border: "4px solid white",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              }}
            />
            {uploading && (
              <CircularProgress
                size={96}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  zIndex: 1,
                  color: "#00c853"
                }}
              />
            )}
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="label"
              sx={{
                position: "absolute",
                bottom: -5,
                right: -5,
                backgroundColor: "white",
                boxShadow: 1,
                "&:hover": { backgroundColor: "#f0f0f0" },
              }}
            >
              <input hidden accept="image/*" type="file" onChange={handleUpload} />
              <PhotoCamera fontSize="small" />
            </IconButton>
          </Box>

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
            {infoRow(<MedicalServicesIcon fontSize="small" />, "Health Profile", user.health_condition)}
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