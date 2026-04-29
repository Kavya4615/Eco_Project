import { Box, Typography, Link as MuiLink, IconButton } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import GitHubIcon from "@mui/icons-material/GitHub";
import FavoriteIcon from "@mui/icons-material/Favorite";

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        color: "rgba(255,255,255,0.7)",
        py: { xs: 3, md: 4 },
        px: { xs: 2, md: 3 },
        mt: "auto",
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: { xs: "center", md: "center" },
          gap: { xs: 2, md: 3 },
          textAlign: { xs: "center", md: "left" },
        }}
      >
        {/* Brand */}
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "white",
              mb: 0.5,
            }}
          >
            🌿 EcoAir
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.6 }}>
            Real-time air quality monitoring
          </Typography>
        </Box>

        {/* Links */}
        <Box sx={{ display: "flex", gap: { xs: 2, md: 3 }, flexWrap: "wrap", justifyContent: "center" }}>
          <MuiLink component={RouterLink} to="/" sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "#43e97b" }, transition: "0.2s", fontSize: { xs: "0.85rem", md: "1rem" } }}>
            Home
          </MuiLink>
          <MuiLink component={RouterLink} to="/near-me" sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "#43e97b" }, transition: "0.2s", fontSize: { xs: "0.85rem", md: "1rem" } }}>
            Near Me
          </MuiLink>
          <MuiLink component={RouterLink} to="/ranking" sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "#43e97b" }, transition: "0.2s", fontSize: { xs: "0.85rem", md: "1rem" } }}>
            Rankings
          </MuiLink>
          <MuiLink component={RouterLink} to="/live-map" sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "#43e97b" }, transition: "0.2s", fontSize: { xs: "0.85rem", md: "1rem" } }}>
            Live Map
          </MuiLink>
        </Box>

        {/* Social */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton sx={{ color: "rgba(255,255,255,0.6)", "&:hover": { color: "#43e97b" } }}>
            <GitHubIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Copyright */}
      <Box sx={{ maxWidth: 1200, mx: "auto", mt: 3, pt: 2, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <Typography
          variant="body2"
          textAlign="center"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5,
            opacity: 0.5,
          }}
        >
          Made with <FavoriteIcon sx={{ fontSize: 14, color: "#f44336" }} /> for the environment
        </Typography>
      </Box>
    </Box>
  );
}

export default Footer;
