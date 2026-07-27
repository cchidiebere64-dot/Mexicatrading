import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { T, ThemeStyles, Button, Spinner } from "./system.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com";
const c = T.color;

export default function VerifyEmail() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = new URLSearchParams(location.search).get("token");
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. Please check your email and try again.");
      return;
    }
    const verify = async () => {
      try {
        await axios.get(`${API_URL}/api/auth/verify-email?token=${token}`);
        setStatus("success");
        setTimeout(() => navigate("/login?verified=true"), 3000);
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "This verification link has expired or is invalid. Please request a new one.");
      }
    };
    verify();
  }, [location.search, navigate]);

  return (
    <div className="ui min-h-screen flex items-center justify-center px-4" style={{ background: c.ink, color: c.text }}>
      <ThemeStyles />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}
        className="w-full" style={{ maxWidth: 400 }}>

        {/* ── LOADING ── */}
        {status === "loading" && (
          <div style={{ border: `1px solid ${c.line}`, padding: T.space.xxl }}>
            <p className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".24em", textTransform: "uppercase", color: c.text3, marginBottom: T.space.lg }}>
              Verifying
            </p>
            <div className="flex items-center gap-3">
              <Spinner size={18} />
              <p style={{ fontSize: T.size.sm, color: c.text2 }}>
                {t("auth.pleaseWait", "Checking your link…")}
              </p>
            </div>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {status === "success" && (
          <>
            <div style={{ background: c.paper, color: c.paperInk }}>
              <div style={{ height: 3, background: c.gain }} />
              <div style={{ padding: T.space.xxl }}>
                <div className="flex items-start justify-between" style={{ marginBottom: T.space.lg }}>
                  <p className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(14,16,19,.5)" }}>
                    Verified
                  </p>
                  <Check size={20} style={{ color: c.gainDeep }} />
                </div>
                <h1 className="display" style={{ fontSize: 32, lineHeight: 1.05, marginBottom: T.space.md }}>
                  Email confirmed
                </h1>
                <p style={{ fontSize: T.size.sm, color: "rgba(14,16,19,.6)", lineHeight: 1.7 }}>
                  Your account is active. You'll be taken to sign in shortly.
                </p>
              </div>
            </div>
            <Button full onClick={() => navigate("/login?verified=true")} style={{ marginTop: T.space.lg }}>
              Sign in now
            </Button>
          </>
        )}

        {/* ── ERROR ── */}
        {status === "error" && (
          <>
            <div style={{ border: `1px solid ${c.line}`, borderLeft: `2px solid ${c.loss}`, padding: T.space.xxl }}>
              <div className="flex items-start justify-between" style={{ marginBottom: T.space.lg }}>
                <p className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".24em", textTransform: "uppercase", color: c.loss }}>
                  Link problem
                </p>
                <X size={18} style={{ color: c.loss }} />
              </div>
              <h1 className="display" style={{ fontSize: 30, lineHeight: 1.05, marginBottom: T.space.md }}>
                Verification failed
              </h1>
              <p style={{ fontSize: T.size.sm, color: c.text3, lineHeight: 1.7 }}>{message}</p>
            </div>

            <div style={{ marginTop: T.space.lg, display: "flex", flexDirection: "column", gap: 8 }}>
              <Button full onClick={() => navigate("/login")}>Go to sign in</Button>
              <Button variant="quiet" full onClick={() => navigate("/register")}>Create a new account</Button>
            </div>
          </>
        )}

        <p className="mono" style={{
          fontSize: T.size.micro, letterSpacing: ".18em", textTransform: "uppercase",
          color: c.text4, textAlign: "center", marginTop: T.space.xl,
        }}>
          MexicaTrading
        </p>
      </motion.div>
    </div>
  );
}
