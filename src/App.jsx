import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PageLoader from "./components/PageLoader.jsx";

// User pages
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Deposit from "./pages/Deposit.jsx";
import Plans from "./pages/Plans.jsx";
import Withdraw from "./pages/Withdraw.jsx";

// Admin pages
import AdminLayout from "./pages/AdminLayout.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboardHome from "./pages/AdminDashboardHome.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminPlans from "./pages/AdminPlans.jsx";
import ActivePlans from "./pages/ActivePlans.jsx";
import AdminDeposits from "./pages/AdminDeposits.jsx";
import AdminWithdrawals from "./pages/AdminWithdrawals.jsx";
import AdminCreditUser from "./pages/AdminCreditUser.jsx";
import AdminWallets from "./pages/AdminWallets.jsx";

// PWA Install Banner
// import InstallBanner from "./components/InstallBanner.jsx";

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
  const token = sessionStorage.getItem("token");
  const adminToken = sessionStorage.getItem("adminToken");

  return (
    <Router>
      {!window.location.pathname.startsWith("/admin") && <Navbar />}
      {/* <InstallBanner /> */}

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

