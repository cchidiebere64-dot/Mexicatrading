import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import PageLoader from "./components/PageLoader.jsx";
import LockScreen from "./components/LockScreen.jsx";
import NetworkStatus from "./components/NetworkStatus.jsx"; // ✅ NEW
import WhatsAppButton from "./components/WhatsAppButton.jsx"; // ✅ NEW
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import Terms from "./pages/Terms.jsx";
import Privacy from "./pages/Privacy.jsx";
import KYC from "./pages/KYC.jsx";


// User pages
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Deposit from "./pages/Deposit.jsx";
import Plans from "./pages/Plans.jsx";
import Withdraw from "./pages/Withdraw.jsx";
import Messages from "./pages/Messages.jsx";
import UserSettings from "./pages/UserSettings";

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
import AdminKYC from "./pages/AdminKYC.jsx";
import AdminBroadcast from "./pages/AdminBroadcast.jsx";
import AdminAnalytics from "./pages/AdminAnalytics";


const LOCK_TIMEOUT_MS = 30000;

const EXEMPT_PATHS = [
  "/",
  "/login",
  "/register",
  "/admin/login",
  "/verify-email",
  "/terms",
  "/privacy",
  "/forgot-password",
  "/reset-password",
];

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

function AppInner() {
  const location = useLocation();
  const token = sessionStorage.getItem("token");
  const adminToken = sessionStorage.getItem("adminToken");

  const [locked, setLocked] = useState(
    sessionStorage.getItem("locked") === "true"
  );

  const [hasVisitedDashboard, setHasVisitedDashboard] = useState(
    sessionStorage.getItem("hasVisitedDashboard") === "true"
  );

  const blurTimeRef = useRef(null);

  // ── SECURITY: Disable right-click ────────────────────────────────────────
  useEffect(() => {
    const disableRightClick = (e) => e.preventDefault();
    document.addEventListener("contextmenu", disableRightClick);
    return () => document.removeEventListener("contextmenu", disableRightClick);
  }, []);

  // ── SECURITY: Disable text selection ─────────────────────────────────────
  useEffect(() => {
    const disableSelect = (e) => e.preventDefault();
    document.addEventListener("selectstart", disableSelect);
    return () => document.removeEventListener("selectstart", disableSelect);
  }, []);

  // ── SECURITY: Disable copy/cut ────────────────────────────────────────────
  useEffect(() => {
    const disableCopy = (e) => e.preventDefault();
    document.addEventListener("copy", disableCopy);
    document.addEventListener("cut", disableCopy);
    return () => {
      document.removeEventListener("copy", disableCopy);
      document.removeEventListener("cut", disableCopy);
    };
  }, []);

  // ── SECURITY: Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S ─────────────────
  useEffect(() => {
    const disableDevTools = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
        (e.ctrlKey && ["U", "S", "u", "s"].includes(e.key))
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", disableDevTools);
    return () => document.removeEventListener("keydown", disableDevTools);
  }, []);

  // ── SECURITY: Disable drag ────────────────────────────────────────────────
  useEffect(() => {
    const disableDrag = (e) => e.preventDefault();
    document.addEventListener("dragstart", disableDrag);
    return () => document.removeEventListener("dragstart", disableDrag);
  }, []);

  // ── Mark dashboard as visited ─────────────────────────────────────────────
  useEffect(() => {
    if (
      location.pathname === "/dashboard" ||
      location.pathname.startsWith("/admin")
    ) {
      sessionStorage.setItem("hasVisitedDashboard", "true");
      setHasVisitedDashboard(true);
    }
  }, [location.pathname]);

  // ── Lock app helper ───────────────────────────────────────────────────────
  const lockApp = () => {
    sessionStorage.setItem("locked", "true");
    setLocked(true);
  };

  // ── Unlock helper ─────────────────────────────────────────────────────────
  const handleUnlock = () => {
    sessionStorage.removeItem("locked");
    setLocked(false);
    blurTimeRef.current = null;
  };

  // ── Clear lock on exempt pages ────────────────────────────────────────────
  useEffect(() => {
    if (EXEMPT_PATHS.includes(location.pathname)) {
      sessionStorage.removeItem("locked");
      setLocked(false);
    }
  }, [location.pathname]);

  // ── Desktop: blur/focus lock logic ───────────────────────────────────────
  useEffect(() => {
    const isExempt = EXEMPT_PATHS.includes(location.pathname);

    const handleBlur = () => {
      blurTimeRef.current = Date.now();
    };

    const handleFocus = () => {
      if (!blurTimeRef.current) return;
      const awayMs = Date.now() - blurTimeRef.current;
      blurTimeRef.current = null;
      const hasToken =
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("adminToken");
      const visited = sessionStorage.getItem("hasVisitedDashboard") === "true";
      if (hasToken && visited && awayMs >= LOCK_TIMEOUT_MS && !isExempt) {
        lockApp();
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [location.pathname]);

  // ── Mobile: visibilitychange lock logic ──────────────────────────────────
  useEffect(() => {
    const isExempt = EXEMPT_PATHS.includes(location.pathname);

    const handleVisibility = () => {
      if (document.hidden) {
        blurTimeRef.current = Date.now();
      } else {
        if (!blurTimeRef.current) return;
        const awayMs = Date.now() - blurTimeRef.current;
        blurTimeRef.current = null;
        const hasToken =
          sessionStorage.getItem("token") ||
          sessionStorage.getItem("adminToken");
        const visited =
          sessionStorage.getItem("hasVisitedDashboard") === "true";
        if (hasToken && visited && awayMs >= LOCK_TIMEOUT_MS && !isExempt) {
          lockApp();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [location.pathname]);

  const isExemptPage = EXEMPT_PATHS.includes(location.pathname);
  const shouldShowLock =
    locked && !isExemptPage && (token || adminToken) && hasVisitedDashboard;

  // Hide WhatsApp button on admin pages and while the lock screen is showing
  const isAdminPage = location.pathname.startsWith("/admin");
  const showWhatsApp = !isAdminPage && !shouldShowLock;

  return (
    <>
      {/* ✅ NEW: Real-time network status banner */}
      <NetworkStatus />

      {!location.pathname.startsWith("/admin") && <Navbar />}

      {shouldShowLock && <LockScreen onUnlock={handleUnlock} />}

      <PageWrapper>
        <div className="pt-16">
          <Routes>

            {/* ── PUBLIC ROUTES ─────────────────────────────────────────── */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/messages" element={token ? <Messages /> : <Navigate to="/login" />} />
            <Route path="/kyc" element={token ? <KYC /> : <Navigate to="/login" />} />
            <Route path="/settings" element={<UserSettings />} />

            {/* ── PROTECTED USER ROUTES ─────────────────────────────────── */}
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

            {/* ── ADMIN ROUTES ──────────────────────────────────────────── */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                adminToken ? <AdminLayout /> : <Navigate to="/admin/login" />
              }
            >
              <Route index element={<AdminDashboardHome />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="plans" element={<AdminPlans />} />
              <Route path="active-plans" element={<ActivePlans />} />
              <Route path="deposits" element={<AdminDeposits />} />
              <Route path="withdrawals" element={<AdminWithdrawals />} />
              <Route path="credit-user" element={<AdminCreditUser />} />
              <Route path="wallets" element={<AdminWallets />} />
              <Route path="kyc" element={<AdminKYC />} />
              <Route path="broadcast" element={<AdminBroadcast />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />

            </Route>

            {/* ── DEFAULT ───────────────────────────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </div>
      </PageWrapper>

      {/* ✅ NEW: Floating WhatsApp support button (all non-admin pages) */}
      {showWhatsApp && <WhatsAppButton />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  );
}
