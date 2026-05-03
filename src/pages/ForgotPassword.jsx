import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [submitted, setSubmitted] = useState(false);

  const API_URL = "https://mexicatradingbackend.onrender.com";

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
    <div className="relative flex items-center justify-center min-h-screen bg-[#080c18] text-white overflow-hidden px-4">

      {/* AMBIENT BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full top-[-150px] left-[-150px]" />
        <div className="absolute w-[400px] h-[400px] bg-teal-400/8 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* BACK TO LOGIN */}
      <Link
        to="/login"
        className="absolute top-6 left-6 text-white/30 hover:text-white/70 text-sm transition flex items-center gap-1"
      >
        ← Back to Login
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 p-10 rounded-3xl shadow-2xl">

          {/* HEADER */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-2xl">
              🔐
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Forgot Password?</h2>
            <p className="text-white/40 text-sm mt-2">
              Enter your email address and we'll send you a secure link to reset your password.
            </p>
          </div>

          {/* MESSAGE */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mb-6 p-4 rounded-xl text-sm text-center font-medium border ${
                  messageType === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* EMAIL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 transition-all text-sm placeholder:text-white/25"
                  />
                </div>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all font-semibold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-5xl">📬</div>
              <p className="text-white/60 text-sm leading-relaxed">
                Check your inbox! If an account exists with that email, you'll receive a reset link within a few minutes. The link expires in <strong className="text-white">15 minutes</strong>.
              </p>
              <button
                onClick={() => { setSubmitted(false); setMessage(""); setEmail(""); }}
                className="text-emerald-400 text-sm hover:underline"
              >
                Try a different email
              </button>
            </div>
          )}

          {/* DIVIDER */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-white/20 text-xs">remembered it?</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <Link
            to="/login"
            className="block text-center py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition text-sm text-white/60 hover:text-white font-medium"
          >
            Back to Sign In
          </Link>
        </div>

        {/* TRUST BADGES */}
        <div className="flex items-center justify-center gap-6 mt-6 text-white/20 text-xs">
          <span>🔒 SSL Secured</span>
          <span>·</span>
          <span>⏱ Expires in 15 min</span>
          <span>·</span>
          <span>🛡️ Data Protected</span>
        </div>
      </motion.div>
    </div>
  );
}
