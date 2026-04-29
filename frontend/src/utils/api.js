// Dynamically resolve the backend API base URL.
// When accessed from localhost (desktop), use localhost:5000.
// When accessed from another device (phone via IP), use the same host IP on port 5000.
const API_BASE = `http://${window.location.hostname}:5000`;

export default API_BASE;
