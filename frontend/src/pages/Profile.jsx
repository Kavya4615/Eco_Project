import { Box, Card, CardContent, Typography, Avatar, Button } from "@mui/material";
import { getCurrentUser, logoutUser } from "../utils/auth";
import { useNavigate } from "react-router-dom";

function Profile() {
  const user = getCurrentUser();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
      <Card sx={{ width: 500 }}>
        <CardContent sx={{ textAlign: "center" }}>
          <Avatar
            src={user.profilePic}
            sx={{ width: 100, height: 100, mx: "auto", mb: 2 }}
          />

          <Typography variant="h5">{user.name}</Typography>
          <Typography color="text.secondary">{user.email}</Typography>

          <Box sx={{ mt: 3, textAlign: "left" }}>
            <Typography>📞 {user.phone}</Typography>
            <Typography>🏙 {user.city}</Typography>
            <Typography>🗺 {user.state}</Typography>
            <Typography>🌍 {user.country}</Typography>
          </Box>

          <Button
            variant="contained"
            color="error"
            fullWidth
            sx={{ mt: 3 }}
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