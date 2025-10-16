import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Deposit from "./pages/Deposit";
import Plans from "./pages/Plans";
import Withdraw from "./pages/Withdraw";
import AdminDashboard from "./pages/AdminDashboard";

// 🔒 Simple route protection for logged-in users
const PrivateRoute = ({ children }) => {
  const token = sessionStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

// 🔒 Simple protection for admin only (assuming role stored in session)
const AdminRoute = ({ children }) => {
  const role = sessionStorage.getItem("role"); // "admin" or "user"
  return role === "admin" ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/deposit"
          element={
            <PrivateRoute>
              <Deposit />
            </PrivateRoute>
          }
        />
        <Route
          path="/plans"
          element={
            <PrivateRoute>
              <Plans />
            </PrivateRoute>
          }
        />
        <Route
          path="/withdraw"
          element={
            <PrivateRoute>
              <Withdraw />
            </PrivateRoute>
          }
        />

        {/* Admin Route */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}
