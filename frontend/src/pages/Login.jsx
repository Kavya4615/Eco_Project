import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Link,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginUser } from "../utils/auth";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AirIcon from "@mui/icons-material/Air";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    const user = await loginUser(form.email, form.password);
    setLoading(false);

    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      navigate("/");
    } else {
      alert("Invalid email or password");
    }
  };

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
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "rgba(46,125,50,0.08)",
          top: -150,
          right: -100,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "rgba(0,200,83,0.06)",
          bottom: -80,
          left: -60,
        }}
      />

      {/* Left side - branding (desktop) */}
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
          EcoAir
        </Typography>
        <Typography variant="h6" sx={{ color: "#555", fontWeight: 400, textAlign: "center", maxWidth: 350 }}>
          Monitor air quality, discover cleaner locations, live healthier.
        </Typography>
      </Box>

      {/* Right side - form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 3,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: 440,
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
              Welcome Back
            </Typography>
            <Typography textAlign="center" color="text.secondary" mb={3}>
              Sign in to continue monitoring air quality
            </Typography>

            <TextField
              label="Email"
              name="email"
              fullWidth
              margin="normal"
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: "#aaa" }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: "#aaa" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} size="small">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box textAlign="right" mt={1} mb={2}>
              <Link
                component={RouterLink}
                to="/reset-password"
                sx={{
                  color: "#2e7d32",
                  fontWeight: 500,
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Forgot Password?
              </Link>
            </Box>

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
              {loading ? "Signing in…" : "Sign In"}
            </Button>

            <Typography textAlign="center" mt={3} color="text.secondary">
              Don't have an account?{" "}
              <Link
                component={RouterLink}
                to="/register"
                sx={{
                  color: "#2e7d32",
                  fontWeight: 600,
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Create Account
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default Login;