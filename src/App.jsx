import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Deposit from "./pages/Deposit";
import Plans from "./pages/Plans";
import Withdraw from "./pages/Withdraw";

export default function App() {
  const token = sessionStorage.getItem("token"); // check if user is logged in

  return (
    <Router>
      <Navbar />

      <div className="pt-16"> {/* push content below fixed navbar */}
        <Routes>
  {/* Public routes */}
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />  {/* Added */}
  <Route path="/plans" element={<Plans />} />

  {/* Protected routes */}
  <Route
    path="/dashboard"
    element={token ? <Dashboard /> : <Navigate to="/login" />}
  />
  <Route
    path="/deposit"
    element={token ? <Deposit /> : <Navigate to="/login" />}
  />
  <Route
    path="/withdraw"
    element={token ? <Withdraw /> : <Navigate to="/login" />}
  />

  {/* Catch-all redirects to Home */}
  <Route path="*" element={<Navigate to="/" />} />
</Routes>
