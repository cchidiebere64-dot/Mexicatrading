import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import axios from "axios";

const API_URL = "https://mexicatradingbackend.onrender.com";

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error
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
    const res = await axios.get(`${API_URL}/api/auth/verify-email?token=${token}`);
    if (res.status === 200) {
      setStatus("success");
      setTimeout(() => navigate("/login?verified=true"), 3000);
    }
  } catch (err) {
    // ✅ If error is 400 but account was already verified — still show success
    if (err.response?.status === 400 &&
        err.response?.data?.message?.includes("Invalid or expired")) {
      setStatus("error");
      setMessage("This verification link has expired or already been used. Please log in or request a new link.");
    } else {
      setStatus("error");
      setMessage(
        err.response?.data?.message ||
        "This verification link has expired or is invalid. Please request a new one."
      );
    }
  }
};

    verify();
  }, [location.search, navigate]);

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#080c18] text-white px-4">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[600px] h-[600px] bg-emerald-500/8 blur-[150px] rounded-full top-[-150px] left-[-150px]" />
        <div className="absolute w-[400px] h-[400px] bg-teal-400/6 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md">

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 p-10 rounded-3xl shadow-2xl text-center">

          {/* ── LOADING ──────────────────────────────────────────────────── */}
          {status === "loading" && (
            <div className="flex flex-col items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Loader size={36} className="text-emerald-400 animate-spin" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Verifying your email...</h2>
                <p className="text-white/40 text-sm">Please wait a moment.</p>
              </div>
            </div>
          )}

          {/* ── SUCCESS ──────────────────────────────────────────────────── */}
          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-5">

              <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle size={40} className="text-emerald-400" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
                <p className="text-white/50 text-sm leading-relaxed">
                  Your email has been verified successfully. Your account is now fully activated.
                </p>
              </div>

              <div className="w-full p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
                <p className="text-emerald-400/80 text-sm">
                  ✅ Redirecting you to login in a few seconds...
                </p>
              </div>

              <button
                onClick={() => navigate("/login?verified=true")}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition-all font-semibold text-sm text-white">
                Go to Login Now
              </button>
            </motion.div>
          )}

          {/* ── ERROR ────────────────────────────────────────────────────── */}
          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-5">

              <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <XCircle size={40} className="text-red-400" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
                <p className="text-white/50 text-sm leading-relaxed">{message}</p>
              </div>

              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition-all font-semibold text-sm text-white">
                  Go to Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="w-full py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition text-sm text-white/60 hover:text-white font-medium">
                  Create New Account
                </button>
              </div>
            </motion.div>
          )}

        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          MexicaTrading — Your Wealth. Multiplied.
        </p>
      </motion.div>
    </div>
  );
}
