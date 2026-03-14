import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { getCurrentUser, logoutUser } from "../utils/auth";

function Navbar() {
  const user = getCurrentUser();

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

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ backgroundColor: "white", color: "black" }}
    >
      <Toolbar sx={{ maxWidth: 1200, width: "100%", mx: "auto" }}>
        {/* Logo */}
        <Typography variant="h6" sx={{ fontWeight: 600, mr: 3 }}>
          AQI Project
        </Typography>

        {/* Navigation */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button component={Link} to="/" sx={{ color: "black" }}>
            Home
          </Button>

          <Button component={Link} to="/map" sx={{ color: "black" }}>
            Map
          </Button>
        </Box>

        {/* Air Quality Dropdown */}
        <Box sx={{ ml: 3 }}>
          <Button
            onClick={handleAqOpen}
            endIcon={<KeyboardArrowDownIcon />}
            sx={{
              backgroundColor: "black",
              color: "white",
              borderRadius: "20px",
              px: 3,
              textTransform: "none",
              "&:hover": { backgroundColor: "#333" },
            }}
          >
            Air Quality Data
          </Button>

          <Menu
            anchorEl={aqAnchorEl}
            open={aqOpen}
            onClose={handleAqClose}
          >
            <MenuItem component={Link} to="/near-me" onClick={handleAqClose}>
              Air Quality Near Me
            </MenuItem>

            <MenuItem component={Link} to="/ranking" onClick={handleAqClose}>
              Live Air Quality Ranking
            </MenuItem>

            <MenuItem component={Link} to="/live-map" onClick={handleAqClose}>
              Live Air Quality Map
            </MenuItem>

            <MenuItem component={Link} to="/historical" onClick={handleAqClose}>
              Historical PM 2.5 Data
            </MenuItem>

            <MenuItem component={Link} to="/api" onClick={handleAqClose}>
              Air Quality API
            </MenuItem>

            <MenuItem component={Link} to="/app-download" onClick={handleAqClose}>
              Air Quality App
            </MenuItem>
          </Menu>
        </Box>

        {/* Push right */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Auth / Profile */}
        {user ? (
          <>
            <Avatar
              src={user.profilePic}
              onClick={handleProfileOpen}
              sx={{ cursor: "pointer" }}
            />

            <Menu
              anchorEl={profileAnchorEl}
              open={profileOpen}
              onClose={handleProfileClose}
            >
              <MenuItem
                component={Link}
                to="/profile"
                onClick={handleProfileClose}
              >
                Profile
              </MenuItem>

              <MenuItem
                onClick={() => {
                  logoutUser();
                  window.location.reload();
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Button component={Link} to="/login" variant="outlined" sx={{ mr: 1 }}>
              Login
            </Button>

            <Button component={Link} to="/register" variant="contained">
              Sign Up
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;