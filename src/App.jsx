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
import AdminUsers from "./pages/AdminUsers";
import AdminPlans from "./pages/AdminPlans";
import AdminDeposits from "./pages/AdminDeposits";
import AdminWithdrawals from "./pages/AdminWithdrawals";
import AdminLayout from "./pages/AdminLayout";
import AdminDashboardHome from "./pages/AdminDashboardHome";





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
  const token = sessionStorage.getItem("token"); // normal user
  const adminToken = sessionStorage.getItem("adminToken"); // admin

  return (
    <Router>
      <Navbar />

      <PageWrapper>
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
  element={adminToken ? <AdminLayout /> : <Navigate to="/login" />}
/>
<Route path="/admin" element={adminToken ? <AdminLayout /> : <Navigate to="/login" />}>
  <Route index element={<AdminDashboardHome />} />
  <Route path="users" element={<AdminUsers />} />
  <Route path="plans" element={<AdminPlans />} />
  <Route path="deposits" element={<AdminDeposits />} />
  <Route path="withdrawals" element={<AdminWithdrawals />} />
</Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
           </Routes>
  </div>
</PageWrapper>

    </Router>
  );
}




