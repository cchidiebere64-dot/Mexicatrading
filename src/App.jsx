import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PageLoader from "./components/PageLoader";

// User pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Deposit from "./pages/Deposit";
import Plans from "./pages/Plans";
import Withdraw from "./pages/Withdraw";

// Admin pages
import AdminLayout from "./pages/AdminLayout";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboardHome from "./pages/AdminDashboardHome";
import AdminUsers from "./pages/AdminUsers";
import AdminPlans from "./pages/AdminPlans";
import ActivePlans from "./pages/ActivePlans";
import AdminDeposits from "./pages/AdminDeposits";
import AdminWithdrawals from "./pages/AdminWithdrawals";
import AdminCreditUser from "./pages/AdminCreditUser";
import AdminWallets from "./pages/AdminWallets";

// PWA Install Banner
import InstallBanner from "./components/InstallBanner";

// 🔥 Wake server
const API_URL = "https://mexicatradingbackend.onrender.com";
function useWakeServer() {
  useEffect(() => {
    fetch(API_URL + "/")
      .catch(() => console.log("Server waking up..."));
  }, []);
}

function PageWrapper({ children }) {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <>
      {loading && <PageLoader />}
      {children}
    </>
  );
}

export default function App() {
  useWakeServer();

  const token = sessionStorage.getItem("token");
  const adminToken = sessionStorage.getItem("adminToken");

  return (
    <Router>
      {!window.location.pathname.startsWith("/admin") && <Navbar />}
      
      {/* PWA install prompt */}
      <InstallBanner />

      <PageWrapper>
        <div className="pt-16">
          <Routes>
            {/* USER ROUTES */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/plans" element={<Plans />} />

            {/* Protected user routes */}
            <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/deposit" element={token ? <Deposit /> : <Navigate to="/login" />} />
            <Route path="/withdraw" element={token ? <Withdraw /> : <Navigate to="/login" />} />

            {/* ADMIN ROUTES */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={adminToken ? <AdminLayout /> : <Navigate to="/admin/login" />}>
              <Route index element={<AdminDashboardHome />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="plans" element={<AdminPlans />} />
              <Route path="active-plans" element={<ActivePlans />} />
              <Route path="deposits" element={<AdminDeposits />} />
              <Route path="withdrawals" element={<AdminWithdrawals />} />
              <Route path="credit-user" element={<AdminCreditUser />} />
              <Route path="wallets" element={<AdminWallets />} />
            </Route>

            {/* DEFAULT */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </PageWrapper>
    </Router>
  );
}
