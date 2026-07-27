import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Check, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { T, ThemeStyles, Button, Spinner, Banner, inputStyle } from "./system.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com";
const c = T.color;

/* ── Validation ── */
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isValidPass  = (v) => v.length >= 6;

/* ── Step marker: 01 Email / 02 Password. A real sequence, so it's numbered. ── */
function Steps({ step }) {
  const items = ["Email", "Password"];
  return (
    <div className="flex" style={{ borderTop: `1px solid ${c.line}`, borderBottom: `1px solid ${c.line}`, marginBottom: T.space.xl }}>
      {items.map((label, i) => {
        const state = step > i ? "done" : step === i ? "current" : "todo";
        const tone = state === "done" ? c.gain : state === "current" ? c.text : c.text4;
        return (
          <div key={i} className="flex items-center gap-2"
            style={{ flex: 1, padding: "12px 14px", borderLeft: i > 0 ? `1px solid ${c.line}` : "none" }}>
            <span className="mono tabular" style={{ fontSize: T.size.tiny, color: state === "done" ? c.gain : c.text4 }}>
              {state === "done" ? <Check size={11} /> : String(i + 1).padStart(2, "0")}
            </span>
            <span className="mono" style={{ fontSize: T.size.tiny, letterSpacing: ".16em", textTransform: "uppercase", color: tone }}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const verified = new URLSearchParams(location.search).get("verified");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showPassF, setShowPassF] = useState(false);
  const [fieldError, setFieldError] = useState("");

  const passRef = useRef(null);
  const bottomRef = useRef(null);

  const scroll = (d = 120) =>
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), d);

  /* Reveal the password field as soon as the email is valid */
  useEffect(() => {
    if (!showPassF && isValidEmail(email)) {
      setShowPassF(true);
      setTimeout(() => passRef.current?.focus(), 600);
      scroll();
    }
    if (showPassF && !isValidEmail(email)) setShowPassF(false);
  }, [email]);

  const nextFromEmail = () => {
    if (!isValidEmail(email)) return setFieldError("Enter a valid email address to continue.");
    setFieldError("");
    setShowPassF(true);
    setTimeout(() => passRef.current?.focus(), 600);
    scroll();
  };

  const step = isValidPass(password) ? 2 : isValidEmail(email) ? 1 : 0;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) return setError("Enter a valid email address.");
    if (!isValidPass(password)) return setError("Password must be at least 6 characters.");
    setLoading(true); setError("");
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password }, { timeout: 30000 });
      if (res.data?.token) {
        const userData = {
          _id: res.data._id, name: res.data.name,
          email: res.data.email, balance: res.data.balance,
          isAdmin: res.data.isAdmin || false,
        };
        sessionStorage.setItem("token", res.data.token);
        sessionStorage.setItem("user", JSON.stringify(userData));
        if (userData.isAdmin) {
          sessionStorage.setItem("adminToken", res.data.token);
          navigate("/admin");
        } else {
          navigate("/dashboard");
          setTimeout(() => window.location.reload(), 100);
        }
      } else {
        setError("Invalid response from server.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally { setLoading(false); }
  };

  const field = (valid) => ({
    ...inputStyle,
    paddingLeft: 38,
    borderColor: valid ? "rgba(63,143,95,.4)" : c.line,
    background: valid ? "rgba(63,143,95,.04)" : c.fill,
  });

  return (
    <div className="ui min-h-screen flex items-center justify-center px-4 py-16"
      style={{ background: c.ink, color: c.text }}>
      <ThemeStyles />

      {/* Back to site */}
      <Link to="/" className="mono absolute flex items-center gap-2"
        style={{ top: 28, left: 24, fontSize: T.size.tiny, letterSpacing: ".16em", textTransform: "uppercase", color: c.text3 }}>
        ← <span className="display" style={{ fontSize: T.size.base, color: c.text }}>MexicaTrading</span>
      </Link>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .5, ease: [.22, 1, .36, 1] }}
        className="w-full" style={{ maxWidth: 420 }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: T.space.xl }}>
          <p className="eyebrow" style={{ marginBottom: 8 }}>Account access</p>
          <h1 className="display" style={{ fontSize: 40, lineHeight: 1.02 }}>
            Welcome back
          </h1>
          <p style={{ fontSize: T.size.sm, color: c.text3, marginTop: 10 }}>
            {t("auth.signInDesc", "Sign in to continue to your account.")}
          </p>
        </div>

        {/* ── Steps ── */}
        <Steps step={step} />

        {/* ── Verified banner ── */}
        {verified === "true" && (
          <div style={{ marginBottom: T.space.lg }}>
            <Banner tone="gain" title={t("auth.emailVerifiedSuccess", "Email verified. You can sign in now.")} />
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div style={{ marginBottom: T.space.lg }}>
            <Banner tone="loss" title={error} />
          </div>
        )}

        <form onSubmit={handleLogin}>

          {/* ── EMAIL ── */}
          <div style={{ marginBottom: T.space.md }}>
            <p className="eyebrow" style={{ marginBottom: 6 }}>{t("auth.email", "Email")}</p>
            <div style={{ position: "relative" }}>
              <Mail size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.text4 }} />
              <input type="email" value={email}
                onChange={(e) => { setFieldError(""); setEmail(e.target.value); }}
                placeholder="you@example.com"
                required autoFocus autoComplete="username"
                style={field(isValidEmail(email))} />
              {isValidEmail(email) && (
                <Check size={14} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: c.gain }} />
              )}
            </div>

            {email.length > 0 && !isValidEmail(email) && (
              <p style={{ fontSize: T.size.xs, color: c.text4, marginTop: 6 }}>
                Enter your full email address
              </p>
            )}

            {!showPassF && (
              <>
                <Button type="button" variant="quiet" full onClick={nextFromEmail} style={{ marginTop: T.space.md }}>
                  Continue
                </Button>
                {fieldError && (
                  <p className="flex items-center gap-1.5" style={{ fontSize: T.size.xs, color: c.loss, marginTop: 8 }}>
                    <AlertTriangle size={11} /> {fieldError}
                  </p>
                )}
              </>
            )}
          </div>

          {/* ── PASSWORD ── */}
          <AnimatePresence>
            {showPassF && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: .45, ease: [.22, 1, .36, 1] }}>

                <div style={{ marginBottom: T.space.md }}>
                  <p className="eyebrow" style={{ marginBottom: 6 }}>{t("auth.password", "Password")}</p>
                  <div style={{ position: "relative" }}>
                    <Lock size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.text4 }} />
                    <input ref={passRef} type={showPass ? "text" : "password"}
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required autoComplete="current-password"
                      style={{ ...field(isValidPass(password)), paddingRight: 44 }} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      aria-label={showPass ? "Hide password" : "Show password"}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: c.text4, padding: 4 }}>
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {password.length > 0 && !isValidPass(password) && (
                    <p style={{ fontSize: T.size.xs, color: c.text4, marginTop: 6 }}>At least 6 characters</p>
                  )}
                </div>

                <div className="flex justify-end" style={{ marginBottom: T.space.lg }}>
                  <Link to="/forgot-password" className="mono"
                    style={{ fontSize: T.size.tiny, letterSpacing: ".14em", textTransform: "uppercase", color: c.text4 }}>
                    {t("auth.forgotPassword", "Forgot password")}
                  </Link>
                </div>

                <Button type="submit" full disabled={loading}
                  style={{ opacity: loading ? .6 : 1 }}
                  icon={loading ? <Spinner size={13} tone="#fff" /> : null}>
                  {loading ? t("auth.signingIn", "Signing in") : t("auth.signIn", "Sign in")}
                  {!loading && <ArrowRight size={13} />}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* ── Register ── */}
        <div style={{ marginTop: T.space.xxl }}>
          <div className="flex items-center gap-3" style={{ marginBottom: T.space.lg }}>
            <div style={{ flex: 1, borderBottom: `1px solid ${c.line}` }} />
            <span className="mono" style={{ fontSize: T.size.tiny, letterSpacing: ".16em", textTransform: "uppercase", color: c.text4 }}>
              {t("auth.newToMexica", "New here")}
            </span>
            <div style={{ flex: 1, borderBottom: `1px solid ${c.line}` }} />
          </div>
          <Button variant="quiet" full onClick={() => navigate("/register")}>
            {t("auth.createAccount", "Create an account")}
          </Button>
        </div>

        {/* ── Trust strip ── */}
        <div className="flex items-center justify-center gap-5 mono"
          style={{ marginTop: T.space.xl, fontSize: T.size.micro, letterSpacing: ".14em", textTransform: "uppercase", color: c.text4 }}>
          <span>SSL secured</span>
          <span>·</span>
          <span>Data protected</span>
        </div>

        <div ref={bottomRef} />
      </motion.div>
    </div>
  );
}
