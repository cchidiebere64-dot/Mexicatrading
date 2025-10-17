// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Deposit from "./pages/Deposit";
import Plans from "./pages/Plans";
import Withdraw from "./pages/Withdraw";

export default function App() {
  // Replace this with your actual auth logic
  const isLoggedIn = false; // e.g., from context or state

  return (
    <Router>
      <Navbar />

      <div className="pt-16"> {/* Push content below fixed navbar */}
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/plans" element={<Plans />} />

          {/* PROTECTED ROUTES */}
          <Route
            path="/dashboard"
            element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/deposit"
            element={isLoggedIn ? <Deposit /> : <Navigate to="/login" />}
          />
          <Route
            path="/withdraw"
            element={isLoggedIn ? <Withdraw /> : <Navigate to="/login" />}
          />

          {/* CATCH-ALL: redirect unknown routes to Home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}
