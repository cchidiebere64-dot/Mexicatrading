import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowRight, Check, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { T, ThemeStyles, Button, Spinner, Banner, inputStyle } from "./system.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com";
const c = T.color;

export default function ResetPassword() {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const id = searchParams.get("id");

  useEffect(() => {
    if (!token || !id) {
      setTokenValid(false);
      setMessage("This reset link is invalid or missing required information.");
      setMessageType("error");
    }
  }, [token, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setMessageType("error");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match. Please try again.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${API_URL}/api/auth/reset-password`, { token, id, password });
      setMessage(res.data.message);
      setMessageType("success");
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || "This reset link is invalid or has expired.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const match = confirmPassword.length > 0 && password === confirmPassword;
  const field = (valid) => ({
    ...inputStyle,
    paddingLeft: 38,
    paddingRight: 44,
    borderColor: valid ? "rgba(63,143,95,.4)" : c.line,
    background: valid ? "rgba(63,143,95,.04)" : c.fill,
  });

  return (
    <div className="ui min-h-screen flex items-center justify-center px-4 py-16"
      style={{ background: c.ink, color: c.text }}>
      <ThemeStyles />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .5, ease: [.22, 1, .36, 1] }}
        className="w-full" style={{ maxWidth: 400 }}>

        {/* ═══ SUCCESS ═══ */}
        {success ? (
          <>
            <div style={{ background: c.paper, color: c.paperInk }}>
              <div style={{ height: 3, background: c.gain }} />
              <div style={{ padding: T.space.xxl }}>
                <div className="flex items-start justify-between" style={{ marginBottom: T.space.lg }}>
                  <p className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(14,16,19,.5)" }}>
                    Password changed
                  </p>
                  <Check size={20} style={{ color: c.gainDeep }} />
                </div>
                <h1 className="display" style={{ fontSize: 30, lineHeight: 1.05, marginBottom: T.space.md }}>
                  You're all set
                </h1>
                <p style={{ fontSize: T.size.sm, color: "rgba(14,16,19,.6)", lineHeight: 1.7 }}>
                  {t("reset.success", "Your password has been updated. You'll be taken to sign in shortly.")}
                </p>
              </div>
            </div>

            <Button full onClick={() => navigate("/login")} style={{ marginTop: T.space.lg }}>
              {t("auth.signIn", "Sign in")} <ArrowRight size={13} />
            </Button>
          </>

        /* ═══ BAD LINK ═══ */
        ) : !tokenValid ? (
          <>
            <div style={{ border: `1px solid ${c.line}`, borderLeft: `2px solid ${c.loss}`, padding: T.space.xxl }}>
              <div className="flex items-start justify-between" style={{ marginBottom: T.space.lg }}>
                <p className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".24em", textTransform: "uppercase", color: c.loss }}>
                  Link problem
                </p>
                <AlertTriangle size={17} style={{ color: c.loss }} />
              </div>
              <h1 className="display" style={{ fontSize: 28, lineHeight: 1.05, marginBottom: T.space.md }}>
                This link won't work
              </h1>
              <p style={{ fontSize: T.size.sm, color: c.text3, lineHeight: 1.7 }}>
                It's either invalid or has expired. Reset links are valid for one hour — request a fresh one and try again.
              </p>
            </div>

            <div style={{ marginTop: T.space.lg, display: "flex", flexDirection: "column", gap: 8 }}>
              <Link to="/forgot-password" className="mono block text-center"
                style={{
                  padding: "14px 0", fontSize: T.size.tiny, letterSpacing: ".14em", textTransform: "uppercase",
                  background: c.gain, color: "#fff",
                }}>
                Request a new link
              </Link>
              <Button variant="quiet" full onClick={() => navigate("/login")}>
                Back to sign in
              </Button>
            </div>
          </>

        /* ═══ FORM ═══ */
        ) : (
          <>
            <div style={{ marginBottom: T.space.xl }}>
              <p className="eyebrow" style={{ marginBottom: 8 }}>Account recovery</p>
              <h1 className="display" style={{ fontSize: 36, lineHeight: 1.02 }}>
                {t("reset.title", "Set a new password")}
              </h1>
              <p style={{ fontSize: T.size.sm, color: c.text3, marginTop: 10, lineHeight: 1.6 }}>
                {t("reset.desc", "Choose a password you haven't used here before.")}
              </p>
            </div>

            {message && (
              <div style={{ marginBottom: T.space.lg }}>
                <Banner tone={messageType === "success" ? "gain" : "loss"} title={message} />
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <div style={{ marginBottom: T.space.md }}>
                <p className="eyebrow" style={{ marginBottom: 6 }}>{t("reset.newPassword", "New password")}</p>
                <div style={{ position: "relative" }}>
                  <Lock size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.text4 }} />
                  <input type={showPassword ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)} required
                    placeholder="At least 6 characters"
                    style={field(password.length >= 6)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: c.text4, padding: 4 }}>
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: T.space.md }}>
                <p className="eyebrow" style={{ marginBottom: 6 }}>{t("reset.confirmPassword", "Confirm password")}</p>
                <div style={{ position: "relative" }}>
                  <Lock size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.text4 }} />
                  <input type={showConfirm ? "text" : "password"} value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} required
                    placeholder="Repeat it"
                    style={field(match)} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: c.text4, padding: 4 }}>
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <p className="flex items-center gap-1.5" style={{
                    fontSize: T.size.xs, marginTop: 6,
                    color: match ? c.gain : c.loss,
                  }}>
                    {match
                      ? <><Check size={11} /> Passwords match</>
                      : <><AlertTriangle size={11} /> Passwords don't match yet</>}
                  </p>
                )}
              </div>

              <Button type="submit" full disabled={loading}
                style={{ marginTop: T.space.lg, opacity: loading ? .6 : 1 }}
                icon={loading ? <Spinner size={13} tone="#fff" /> : null}>
                {loading ? t("reset.submitting", "Updating") : t("reset.submit", "Update password")}
                {!loading && <ArrowRight size={13} />}
              </Button>
            </form>

            <div style={{ marginTop: T.space.xxl }}>
              <div className="flex items-center gap-3" style={{ marginBottom: T.space.lg }}>
                <div style={{ flex: 1, borderBottom: `1px solid ${c.line}` }} />
                <span className="mono" style={{ fontSize: T.size.tiny, letterSpacing: ".16em", textTransform: "uppercase", color: c.text4 }}>
                  {t("forgot.remembered", "Remembered it")}
                </span>
                <div style={{ flex: 1, borderBottom: `1px solid ${c.line}` }} />
              </div>
              <Button variant="quiet" full onClick={() => navigate("/login")}>
                {t("auth.signIn", "Sign in")}
              </Button>
            </div>
          </>
        )}

        <div className="flex items-center justify-center gap-5 mono"
          style={{ marginTop: T.space.xl, fontSize: T.size.micro, letterSpacing: ".14em", textTransform: "uppercase", color: c.text4 }}>
          <span>SSL secured</span>
          <span>·</span>
          <span>Data protected</span>
        </div>
      </motion.div>
    </div>
  );
}
