// Dynamically resolve the backend API base URL.
//
// LOCAL DEV:  Frontend on localhost:5173 → API on localhost:5000
// MOBILE DEV: Frontend on 192.168.x.x:5173 → API on 192.168.x.x:5000
// PRODUCTION: Uses VITE_API_URL environment variable (set during build)

const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

export default API_BASE;
