import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { T, ThemeStyles, Button, Spinner, Banner, inputStyle } from "./system.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com";
const c = T.color;

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });

      if (res.data?.token && (res.data?.isAdmin || res.data?.role === "admin")) {
        sessionStorage.setItem("adminToken", res.data.token);
        sessionStorage.setItem("token", res.data.token);
        sessionStorage.setItem("user", JSON.stringify({
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          isAdmin: true,
        }));
        navigate("/admin");
      } else {
        setError("Access denied. Admin credentials required.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ui min-h-screen flex items-center justify-center px-4 py-16"
      style={{ background: c.ink, color: c.text }}>
      <ThemeStyles />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .5, ease: [.22, 1, .36, 1] }}
        className="w-full" style={{ maxWidth: 380 }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: T.space.xl }}>
          <div className="flex items-center gap-2" style={{ marginBottom: T.space.lg }}>
            <ShieldCheck size={15} style={{ color: c.brass }} />
            <span className="mono" style={{
              fontSize: T.size.micro, letterSpacing: ".24em",
              textTransform: "uppercase", color: c.brass,
            }}>
              Restricted access
            </span>
          </div>

          <h1 className="display" style={{ fontSize: 34, lineHeight: 1.05 }}>
            Administrator
          </h1>
          <p style={{ fontSize: T.size.sm, color: c.text3, marginTop: 10, lineHeight: 1.7 }}>
            This area manages member funds. Sign in with your administrator account.
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: T.space.lg }}>
            <Banner tone="loss" title={error} />
          </div>
        )}

        <form onSubmit={handleLogin}>

          <div style={{ marginBottom: T.space.md }}>
            <p className="eyebrow" style={{ marginBottom: 6 }}>Email</p>
            <div style={{ position: "relative" }}>
              <Mail size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.text4 }} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mexicatrading.com"
                required autoFocus autoComplete="username"
                style={{ ...inputStyle, paddingLeft: 38 }} />
            </div>
          </div>

          <div style={{ marginBottom: T.space.lg }}>
            <p className="eyebrow" style={{ marginBottom: 6 }}>Password</p>
            <div style={{ position: "relative" }}>
              <Lock size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.text4 }} />
              <input type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required autoComplete="current-password"
                style={{ ...inputStyle, paddingLeft: 38, paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: c.text4, padding: 4 }}>
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <Button type="submit" full disabled={loading}
            style={{ opacity: loading ? .6 : 1 }}
            icon={loading ? <Spinner size={13} tone="#fff" /> : null}>
            {loading ? "Verifying" : "Sign in"}
            {!loading && <ArrowRight size={13} />}
          </Button>
        </form>

        {/* ── Security note ── */}
        <div style={{
          border: `1px solid ${c.line}`, borderLeft: `2px solid ${c.brass}`,
          padding: T.space.lg, marginTop: T.space.xl,
        }}>
          <p className="eyebrow" style={{ marginBottom: 8 }}>Protected</p>
          <p style={{ fontSize: T.size.xs, color: c.text3, lineHeight: 1.7 }}>
            Five failed attempts lock the account for 30 minutes. Sign-ins from an unfamiliar
            device or network trigger an email alert.
          </p>
        </div>

        <div style={{ marginTop: T.space.xl, textAlign: "center" }}>
          <Link to="/" className="mono"
            style={{ fontSize: T.size.tiny, letterSpacing: ".16em", textTransform: "uppercase", color: c.text4 }}>
            ← Back to site
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
