import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { T, ThemeStyles, Button, Spinner, Banner, inputStyle } from "./system.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com";
const c = T.color;

export default function ForgotPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setMessage(res.data.message);
      setMessageType("success");
      setSubmitted(true);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ui min-h-screen flex items-center justify-center px-4 py-16"
      style={{ background: c.ink, color: c.text }}>
      <ThemeStyles />

      <Link to="/login" className="mono absolute flex items-center gap-2"
        style={{ top: 28, left: 24, fontSize: T.size.tiny, letterSpacing: ".16em", textTransform: "uppercase", color: c.text3 }}>
        ← <span className="display" style={{ fontSize: T.size.base, color: c.text }}>MexicaTrading</span>
      </Link>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .5, ease: [.22, 1, .36, 1] }}
        className="w-full" style={{ maxWidth: 400 }}>

        {/* ═══ SUBMITTED ═══ */}
        {submitted ? (
          <>
            <div style={{ background: c.paper, color: c.paperInk }}>
              <div style={{ height: 3, background: c.gain }} />
              <div style={{ padding: T.space.xxl }}>
                <div className="flex items-start justify-between" style={{ marginBottom: T.space.lg }}>
                  <p className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(14,16,19,.5)" }}>
                    Link sent
                  </p>
                  <Check size={20} style={{ color: c.gainDeep }} />
                </div>

                <h1 className="display" style={{ fontSize: 30, lineHeight: 1.05, marginBottom: T.space.md }}>
                  Check your inbox
                </h1>

                <p style={{ fontSize: T.size.sm, color: "rgba(14,16,19,.65)", lineHeight: 1.7, marginBottom: T.space.lg }}>
                  {t("forgot.checkInbox", "If an account exists for that address, we've sent a reset link.")}
                </p>

                <p className="mono" style={{
                  fontSize: T.size.xs, color: c.gainDeep, wordBreak: "break-all",
                  paddingTop: T.space.md, borderTop: "1px solid rgba(14,16,19,.12)",
                }}>
                  {email}
                </p>

                <p style={{ fontSize: T.size.xs, color: "rgba(14,16,19,.5)", lineHeight: 1.7, marginTop: T.space.lg }}>
                  The link is valid for one hour. If it hasn't arrived in a few minutes, check your spam folder.
                </p>
              </div>
            </div>

            <div style={{ marginTop: T.space.lg, display: "flex", flexDirection: "column", gap: 8 }}>
              <Button full onClick={() => navigate("/login")}>
                Back to sign in
              </Button>
              <Button variant="quiet" full
                onClick={() => { setSubmitted(false); setMessage(""); setEmail(""); }}>
                {t("forgot.tryDifferent", "Use a different email")}
              </Button>
            </div>
          </>

        /* ═══ FORM ═══ */
        ) : (
          <>
            <div style={{ marginBottom: T.space.xl }}>
              <p className="eyebrow" style={{ marginBottom: 8 }}>Account recovery</p>
              <h1 className="display" style={{ fontSize: 38, lineHeight: 1.02 }}>
                {t("forgot.title", "Forgot your password")}
              </h1>
              <p style={{ fontSize: T.size.sm, color: c.text3, marginTop: 10, lineHeight: 1.7 }}>
                {t("forgot.desc", "Enter your email and we'll send you a link to set a new one.")}
              </p>
            </div>

            {message && (
              <div style={{ marginBottom: T.space.lg }}>
                <Banner tone={messageType === "success" ? "gain" : "loss"} title={message} />
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: T.space.lg }}>
                <p className="eyebrow" style={{ marginBottom: 6 }}>{t("auth.email", "Email address")}</p>
                <div style={{ position: "relative" }}>
                  <Mail size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.text4 }} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" required autoFocus autoComplete="email"
                    style={{ ...inputStyle, paddingLeft: 38 }} />
                </div>
              </div>

              <Button type="submit" full disabled={loading}
                style={{ opacity: loading ? .6 : 1 }}
                icon={loading ? <Spinner size={13} tone="#fff" /> : null}>
                {loading ? t("forgot.sending", "Sending") : t("forgot.send", "Send reset link")}
                {!loading && <ArrowRight size={13} />}
              </Button>
            </form>

            <p style={{ fontSize: T.size.xs, color: c.text4, lineHeight: 1.7, marginTop: T.space.lg }}>
              For your security we send the same response whether or not an account exists for that address.
            </p>

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
          <span>Link valid 1 hour</span>
        </div>
      </motion.div>
    </div>
  );
}
