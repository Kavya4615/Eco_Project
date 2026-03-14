import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Map from "./pages/Map";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

import NearMe from "./pages/NearMe";
import Ranking from "./pages/Ranking";
import LiveMap from "./pages/LiveMap";
import Historical from "./pages/Historical";
import API from "./pages/API";
import AppDownload from "./pages/AppDownload";

import { getCurrentUser } from "./utils/auth";

function Layout() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/near-me" element={<NearMe />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/live-map" element={<LiveMap />} />
        <Route path="/historical" element={<Historical />} />
        <Route path="/api" element={<API />} />
        <Route path="/app-download" element={<AppDownload />} />

        {/* Protected */}
        <Route
          path="/map"
          element={
            getCurrentUser() ? (
              <Map />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/profile"
          element={
            getCurrentUser() ? (
              <Profile />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;