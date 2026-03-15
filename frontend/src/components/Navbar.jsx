import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MenuIcon from "@mui/icons-material/Menu";
import AirIcon from "@mui/icons-material/Air";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { getCurrentUser, logoutUser } from "../utils/auth";
import { useThemeMode } from "../context/ThemeContext";

function Navbar() {
  const user = getCurrentUser();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { mode, toggleTheme } = useThemeMode();
  const isDark = mode === "dark";

  // Mobile drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Air Quality dropdown
  const [aqAnchorEl, setAqAnchorEl] = useState(null);
  const aqOpen = Boolean(aqAnchorEl);

  const handleAqOpen = (event) => {
    setAqAnchorEl(event.currentTarget);
  };

  const handleAqClose = () => {
    setAqAnchorEl(null);
  };

  // Profile dropdown
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const profileOpen = Boolean(profileAnchorEl);

  const handleProfileOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const isActive = (path) => location.pathname === path;

  const navLinkStyle = (path) => ({
    color: isActive(path) ? "#2e7d32" : (isDark ? "#ccc" : "#444"),
    fontWeight: isActive(path) ? 700 : 500,
    position: "relative",
    borderRadius: "8px",
    px: 2,
    py: 0.8,
    transition: "all 0.2s",
    "&::after": isActive(path)
      ? {
          content: '""',
          position: "absolute",
          bottom: 2,
          left: "50%",
          transform: "translateX(-50%)",
          width: "60%",
          height: "3px",
          borderRadius: "2px",
          background: "linear-gradient(90deg, #43e97b, #38f9d7)",
        }
      : {},
    "&:hover": {
      backgroundColor: "rgba(46, 125, 50, 0.06)",
      color: "#2e7d32",
    },
  });

  /* ── Mobile Drawer ── */
  const mobileLinks = [
    { label: "Home", to: "/" },
    { label: "Map", to: "/map" },
    { label: "Live Map", to: "/live-map" },
    { label: "Air Quality Near Me", to: "/near-me" },
    { label: "Live Rankings", to: "/ranking" },
    { label: "Historical Data", to: "/historical" },
    { label: "API", to: "/api" },
    { label: "App Download", to: "/app-download" },
  ];

  const drawer = (
    <Box sx={{ width: 280, pt: 2 }}>
      <Box sx={{ px: 2, pb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <AirIcon sx={{ color: "#2e7d32", fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#2e7d32" }}>
          EcoAir
        </Typography>
      </Box>
      <Divider />
      <List>
        {mobileLinks.map((link) => (
          <ListItem
            key={link.to}
            component={Link}
            to={link.to}
            onClick={() => setDrawerOpen(false)}
            sx={{
              borderRadius: 2,
              mx: 1,
              mb: 0.5,
              backgroundColor: isActive(link.to) ? "rgba(46,125,50,0.08)" : "transparent",
              color: isActive(link.to) ? "#2e7d32" : "#444",
              fontWeight: isActive(link.to) ? 600 : 400,
              "&:hover": { backgroundColor: "rgba(46,125,50,0.06)" },
            }}
          >
            <ListItemText primary={link.label} />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ mt: 1 }} />
      {user ? (
        <List>
          <ListItem component={Link} to="/profile" onClick={() => setDrawerOpen(false)}>
            <ListItemText primary="Profile" />
          </ListItem>
          <ListItem
            onClick={() => {
              logoutUser();
              window.location.reload();
            }}
            sx={{ cursor: "pointer" }}
          >
            <ListItemText primary="Logout" sx={{ color: "#d32f2f" }} />
          </ListItem>
        </List>
      ) : (
        <Box sx={{ p: 2, display: "flex", gap: 1 }}>
          <Button component={Link} to="/login" variant="outlined" fullWidth onClick={() => setDrawerOpen(false)}>
            Login
          </Button>
          <Button component={Link} to="/register" variant="contained" fullWidth onClick={() => setDrawerOpen(false)}>
            Sign Up
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: isDark ? "rgba(15, 17, 23, 0.9)" : "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0, 0, 0, 0.06)",
          color: isDark ? "#e0e0e0" : "#1a1a2e",
        }}
      >
        <Toolbar
          sx={{
            maxWidth: 1200,
            width: "100%",
            mx: "auto",
            minHeight: { xs: 56, md: 64 },
          }}
        >
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 1, color: isDark ? "#e0e0e0" : "#1a1a2e" }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mr: 3,
              textDecoration: "none",
            }}
          >
            <AirIcon
              sx={{
                color: "#2e7d32",
                fontSize: 30,
                filter: "drop-shadow(0 2px 4px rgba(46,125,50,0.3))",
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #2e7d32, #00c853)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px",
              }}
            >
              EcoAir
            </Typography>
          </Box>

          {/* Desktop Nav */}
          {!isMobile && (
            <>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <Button component={Link} to="/" sx={navLinkStyle("/")}>
                  Home
                </Button>

                <Button component={Link} to="/map" sx={navLinkStyle("/map")}>
                  Map
                </Button>
                
                <Button component={Link} to="/live-map" sx={navLinkStyle("/live-map")}>
                  Live Map
                </Button>
              </Box>

              {/* Air Quality Dropdown */}
              <Box sx={{ ml: 2 }}>
                <Button
                  onClick={handleAqOpen}
                  endIcon={
                    <KeyboardArrowDownIcon
                      sx={{
                        transition: "0.2s",
                        transform: aqOpen ? "rotate(180deg)" : "rotate(0)",
                      }}
                    />
                  }
                  sx={{
                    background: "linear-gradient(135deg, #2e7d32, #00c853)",
                    color: "white",
                    borderRadius: "24px",
                    px: 3,
                    py: 0.8,
                    fontSize: "0.875rem",
                    boxShadow: "0 4px 14px rgba(46, 125, 50, 0.3)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #1b5e20, #00a844)",
                      boxShadow: "0 6px 20px rgba(46, 125, 50, 0.4)",
                    },
                  }}
                >
                  Air Quality Data
                </Button>

                <Menu
                  anchorEl={aqAnchorEl}
                  open={aqOpen}
                  onClose={handleAqClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      borderRadius: 3,
                      boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                      border: "1px solid rgba(0,0,0,0.05)",
                      minWidth: 220,
                    },
                  }}
                >
                  <MenuItem component={Link} to="/near-me" onClick={handleAqClose} sx={{ py: 1.2, borderRadius: 1, mx: 0.5 }}>
                    🌍 Air Quality Near Me
                  </MenuItem>

                  <MenuItem component={Link} to="/ranking" onClick={handleAqClose} sx={{ py: 1.2, borderRadius: 1, mx: 0.5 }}>
                    🏆 Live Air Quality Ranking
                  </MenuItem>

                  <MenuItem component={Link} to="/near-me" onClick={handleAqClose} sx={{ py: 1.2, borderRadius: 1, mx: 0.5 }}>
                    🌍 Air Quality Near Me
                  </MenuItem>

                  <MenuItem component={Link} to="/historical" onClick={handleAqClose} sx={{ py: 1.2, borderRadius: 1, mx: 0.5 }}>
                    📊 Historical PM 2.5 Data
                  </MenuItem>

                  <MenuItem component={Link} to="/api" onClick={handleAqClose} sx={{ py: 1.2, borderRadius: 1, mx: 0.5 }}>
                    ⚡ Air Quality API
                  </MenuItem>

                  <MenuItem component={Link} to="/app-download" onClick={handleAqClose} sx={{ py: 1.2, borderRadius: 1, mx: 0.5 }}>
                    📱 Air Quality App
                  </MenuItem>
                </Menu>
              </Box>

              {/* Spacer */}
              <Box sx={{ flexGrow: 1 }} />

              {/* Auth / Profile */}
              {user ? (
                <>
                  <Avatar
                    src={user.profilePic}
                    onClick={handleProfileOpen}
                    sx={{
                      cursor: "pointer",
                      width: 38,
                      height: 38,
                      border: "2px solid #e0e0e0",
                      transition: "0.2s",
                      "&:hover": {
                        border: "2px solid #2e7d32",
                        boxShadow: "0 0 0 3px rgba(46,125,50,0.15)",
                      },
                    }}
                  />

                  <Menu
                    anchorEl={profileAnchorEl}
                    open={profileOpen}
                    onClose={handleProfileClose}
                    PaperProps={{
                      sx: {
                        mt: 1,
                        borderRadius: 3,
                        boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                        minWidth: 160,
                      },
                    }}
                  >
                    <MenuItem
                      component={Link}
                      to="/profile"
                      onClick={handleProfileClose}
                      sx={{ py: 1.2 }}
                    >
                      Profile
                    </MenuItem>

                    <MenuItem
                      onClick={() => {
                        logoutUser();
                        window.location.reload();
                      }}
                      sx={{ py: 1.2, color: "#d32f2f" }}
                    >
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    component={Link}
                    to="/login"
                    variant="outlined"
                    sx={{
                      borderColor: "#2e7d32",
                      color: "#2e7d32",
                      "&:hover": {
                        borderColor: "#1b5e20",
                        backgroundColor: "rgba(46,125,50,0.04)",
                      },
                    }}
                  >
                    Login
                  </Button>

                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                  >
                    Sign Up
                  </Button>
                </Box>
              )}
            </>
          )}

          {/* Dark mode toggle (desktop) */}
          {!isMobile && (
            <IconButton
              onClick={toggleTheme}
              sx={{
                ml: 1.5,
                color: isDark ? "#ffd54f" : "#555",
                transition: "0.3s",
                "&:hover": {
                  backgroundColor: isDark ? "rgba(255,213,79,0.1)" : "rgba(0,0,0,0.06)",
                },
              }}
            >
              {isDark ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          )}

          {/* Mobile: right side */}
          {isMobile && (
            <>
              <Box sx={{ flexGrow: 1 }} />

              <IconButton
                onClick={toggleTheme}
                sx={{ color: isDark ? "#ffd54f" : "#555", mr: 1 }}
              >
                {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </IconButton>

              {user ? (
                <Avatar
                  src={user.profilePic}
                  onClick={handleProfileOpen}
                  sx={{
                    cursor: "pointer",
                    width: 34,
                    height: 34,
                    border: "2px solid #e0e0e0",
                  }}
                />
              ) : (
                <Button component={Link} to="/login" variant="outlined" size="small">
                  Login
                </Button>
              )}
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default Navbar;