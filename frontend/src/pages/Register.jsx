import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Grid,
  MenuItem,
} from "@mui/material";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../utils/auth";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import MapIcon from "@mui/icons-material/Map";
import PublicIcon from "@mui/icons-material/Public";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AirIcon from "@mui/icons-material/Air";

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    state: "",
    country: "",
    profilePic: "",
    healthCondition: "Normal",
  });

  const handleChange = (e) => {
    if (e.target.name === "profilePic") {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setForm({ ...form, profilePic: reader.result });
      };

      reader.readAsDataURL(file);
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const result = await registerUser(form);
    setLoading(false);

    if (!result.success) {
      alert(result.message);
      return;
    }

    alert("Registration successful!");
    navigate("/login");
  };

  const fieldIcon = (Icon) => ({
    startAdornment: (
      <InputAdornment position="start">
        <Icon sx={{ color: "#aaa", fontSize: 20 }} />
      </InputAdornment>
    ),
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 30%, #a5d6a7 70%, #81c784 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative circles */}
      <Box
        sx={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "rgba(46,125,50,0.08)",
          top: -100,
          left: -100,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "rgba(0,200,83,0.06)",
          bottom: -60,
          right: -60,
        }}
      />

      {/* Left branding (desktop) */}
      <Box
        sx={{
          flex: 1,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          px: 6,
          position: "relative",
          zIndex: 1,
        }}
      >
        <AirIcon sx={{ fontSize: 80, color: "#2e7d32", mb: 3, filter: "drop-shadow(0 4px 12px rgba(46,125,50,0.3))" }} />
        <Typography variant="h3" sx={{ fontWeight: 800, color: "#1a1a2e", mb: 1 }}>
          Join EcoAir
        </Typography>
        <Typography variant="h6" sx={{ color: "#555", fontWeight: 400, textAlign: "center", maxWidth: 350 }}>
          Create your account and start monitoring the air you breathe.
        </Typography>
      </Box>

      {/* Right form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 3,
          py: 4,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: 500,
            borderRadius: 4,
            boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
            border: "1px solid rgba(255,255,255,0.6)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Mobile logo */}
            <Box sx={{ display: { xs: "flex", md: "none" }, justifyContent: "center", mb: 2 }}>
              <AirIcon sx={{ fontSize: 40, color: "#2e7d32" }} />
            </Box>

            <Typography variant="h4" textAlign="center" mb={1} fontWeight={700}>
              Create Account
            </Typography>
            <Typography textAlign="center" color="text.secondary" mb={3}>
              Fill in your details to get started
            </Typography>

            <TextField
              name="name"
              label="Full Name"
              fullWidth
              margin="dense"
              onChange={handleChange}
              InputProps={fieldIcon(PersonIcon)}
            />

            <TextField
              name="email"
              label="Email Address"
              fullWidth
              margin="dense"
              onChange={handleChange}
              InputProps={fieldIcon(EmailIcon)}
            />

            <TextField
              name="password"
              label="Password"
              type="password"
              fullWidth
              margin="dense"
              onChange={handleChange}
              InputProps={fieldIcon(LockIcon)}
            />

            <TextField
              name="phone"
              label="Phone Number"
              fullWidth
              margin="dense"
              onChange={handleChange}
              InputProps={fieldIcon(PhoneIcon)}
            />

            <Grid container spacing={1.5} sx={{ mt: 0 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="city"
                  label="City"
                  fullWidth
                  margin="dense"
                  onChange={handleChange}
                  InputProps={fieldIcon(LocationCityIcon)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="state"
                  label="State"
                  fullWidth
                  margin="dense"
                  onChange={handleChange}
                  InputProps={fieldIcon(MapIcon)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="country"
                  label="Country"
                  fullWidth
                  margin="dense"
                  onChange={handleChange}
                  InputProps={fieldIcon(PublicIcon)}
                />
              </Grid>
            </Grid>

            <TextField
              name="healthCondition"
              label="Health Profile"
              select
              fullWidth
              margin="dense"
              value={form.healthCondition}
              onChange={handleChange}
              sx={{ mt: 1 }}
            >
              <MenuItem value="Normal">Normal (General Health)</MenuItem>
              <MenuItem value="Asthmatic">Asthmatic (Sensitive Respiratory)</MenuItem>
              <MenuItem value="Elderly">Elderly (Sensitive Group)</MenuItem>
            </TextField>

            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<CloudUploadIcon />}
              sx={{
                mt: 2,
                py: 1.2,
                borderStyle: "dashed",
                borderColor: "#c8e6c9",
                color: "#666",
                "&:hover": {
                  borderColor: "#2e7d32",
                  backgroundColor: "rgba(46,125,50,0.04)",
                },
              }}
            >
              {form.profilePic ? "✓ Photo Selected" : "Upload Profile Picture"}
              <input type="file" hidden name="profilePic" onChange={handleChange} />
            </Button>

            <Button
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.3,
                fontSize: "1rem",
                background: "linear-gradient(135deg, #2e7d32, #00c853)",
                boxShadow: "0 6px 20px rgba(46,125,50,0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #1b5e20, #00a844)",
                },
              }}
              onClick={handleSubmit}
            >
              {loading ? "Creating Account…" : "Create Account"}
            </Button>

            <Typography textAlign="center" mt={2} color="text.secondary">
              Already have an account?{" "}
              <Box
                component={Link}
                to="/login"
                sx={{
                  color: "#2e7d32",
                  fontWeight: 600,
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Sign In
              </Box>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default Register;