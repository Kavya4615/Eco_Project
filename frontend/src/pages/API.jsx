import { Box, Typography, Card, CardContent, Button } from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useState } from "react";

function API() {
  const [copied, setCopied] = useState(false);

  const exampleUrl = "http://localhost:5000/aqi?lat=28.61&lon=77.20";

  const handleCopy = () => {
    navigator.clipboard.writeText(exampleUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", px: 3, py: 5 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <CodeIcon sx={{ fontSize: 36, color: "#7c4dff" }} />
        <Typography variant="h4">Air Quality API</Typography>
      </Box>

      <Typography color="text.secondary" sx={{ mb: 4, ml: 0.5 }}>
        Integrate real-time AQI data into your own applications
      </Typography>

      {/* Endpoint card */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            📡 Endpoint
          </Typography>

          <Box
            sx={{
              background: "#1a1a2e",
              borderRadius: 2,
              p: 2.5,
              fontFamily: "'Courier New', monospace",
              color: "#43e97b",
              fontSize: "0.95rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              overflowX: "auto",
            }}
          >
            <code>GET /aqi?lat=&#123;latitude&#125;&lon=&#123;longitude&#125;</code>
            <Button
              size="small"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopy}
              sx={{ color: "#aaa", fontSize: "0.75rem", ml: 2, minWidth: "auto" }}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Example card */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            📋 Example Request
          </Typography>
          <Box
            sx={{
              background: "#f5f5f5",
              borderRadius: 2,
              p: 2,
              fontFamily: "'Courier New', monospace",
              fontSize: "0.9rem",
              color: "#333",
              wordBreak: "break-all",
            }}
          >
            {exampleUrl}
          </Box>
        </CardContent>
      </Card>

      {/* Response card */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            📦 Example Response
          </Typography>
          <Box
            sx={{
              background: "#1a1a2e",
              borderRadius: 2,
              p: 2.5,
              fontFamily: "'Courier New', monospace",
              color: "#38f9d7",
              fontSize: "0.9rem",
              lineHeight: 1.8,
            }}
          >
            <pre style={{ margin: 0 }}>
{`{
  "aqi": 120,
  "pm25": 45
}`}
            </pre>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default API;