import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";

// User pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Deposit from "./pages/Deposit";
import Plans from "./pages/Plans";
import Withdraw from "./pages/Withdraw";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminDeposits from "./pages/admin/AdminDeposits";
import AdminWithdrawals from "./pages/admin/AdminWithdrawals";

export default function App() {
  const token = sessionStorage.getItem("token"); // normal user
  const adminToken = sessionStorage.getItem("adminToken"); // admin

  return (
    <Router>
      <Navbar />

      <div className="pt-16">
        <Routes>
          {/* Public user routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/plans" element={<Plans />} />

          {/* Protected user routes */}
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

          {/* Protected admin routes */}
          <Route
            path="/admin"
            element={adminToken ? <AdminDashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin/users"
            element={adminToken ? <AdminUsers /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin/plans"
            element={adminToken ? <AdminPlans /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin/deposits"
            element={adminToken ? <AdminDeposits /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin/withdrawals"
            element={adminToken ? <AdminWithdrawals /> : <Navigate to="/login" />}
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
