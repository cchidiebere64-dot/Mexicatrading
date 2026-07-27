import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { T, ThemeStyles, Button, Spinner, Banner, inputStyle } from "../pages/system.jsx";

const c = T.color;

export default function LockScreen({ onUnlock }) {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const unlock = async () => {
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://mexicatradingbackend.onrender.com/api/auth/reauth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        onUnlock();
      } else {
        setError("Incorrect password. Please try again.");
        setPassword("");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") unlock();
  };

  return (
    <div className="ui"
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(14,16,19,.97)",
        backdropFilter: "blur(18px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, color: c.text,
      }}>
      <ThemeStyles />

      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .45, ease: [.22, 1, .36, 1] }}
        style={{ width: "100%", maxWidth: 360 }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: T.space.xl }}>
          <div className="flex items-center gap-2" style={{ marginBottom: T.space.lg }}>
            <Lock size={14} style={{ color: c.gain }} />
            <span className="mono" style={{
              fontSize: T.size.micro, letterSpacing: ".24em",
              textTransform: "uppercase", color: c.gain,
            }}>
              Session locked
            </span>
          </div>

          <h1 className="display" style={{ fontSize: 32, lineHeight: 1.05 }}>
            {user?.name ? `Welcome back, ${user.name.split(" ")[0]}` : "Welcome back"}
          </h1>
          <p style={{ fontSize: T.size.sm, color: c.text3, marginTop: 10, lineHeight: 1.7 }}>
            Enter your password to continue. Your session was locked for security.
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: T.space.lg }}>
            <Banner tone="loss" title={error} />
          </div>
        )}

        {/* ── Password ── */}
        <div style={{ marginBottom: T.space.lg }}>
          <p className="eyebrow" style={{ marginBottom: 6 }}>Password</p>
          <div style={{ position: "relative" }}>
            <Lock size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.text4 }} />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setError(""); setPassword(e.target.value); }}
              onKeyDown={handleKeyDown}
              placeholder="••••••••"
              autoFocus
              autoComplete="current-password"
              style={{ ...inputStyle, paddingLeft: 38, paddingRight: 44 }} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: c.text4, padding: 4 }}>
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <Button full onClick={unlock} disabled={loading}
          style={{ opacity: loading ? .6 : 1 }}
          icon={loading ? <Spinner size={13} tone="#fff" /> : null}>
          {loading ? "Unlocking" : "Unlock"}
          {!loading && <ArrowRight size={13} />}
        </Button>

        {/* ── Identity ── */}
        {user?.email && (
          <div style={{
            border: `1px solid ${c.line}`, padding: T.space.lg, marginTop: T.space.xl,
          }}>
            <p className="eyebrow" style={{ marginBottom: 6 }}>Signed in as</p>
            <p className="mono truncate" style={{ fontSize: T.size.xs, color: c.text2 }}>
              {user.email}
            </p>
          </div>
        )}

        <p className="mono" style={{
          fontSize: T.size.micro, letterSpacing: ".16em", textTransform: "uppercase",
          color: c.text4, textAlign: "center", marginTop: T.space.xl,
        }}>
          MexicaTrading
        </p>
      </motion.div>
    </div>
  );
}
