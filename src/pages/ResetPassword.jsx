import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function ResetPassword() {
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
  const API_URL = "https://mexicatradingbackend.onrender.com";

  const token = searchParams.get("token");
  const id = searchParams.get("id");

  // Check if token and id exist in URL
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
      const res = await axios.post(`${API_URL}/api/auth/reset-password`, {
        token,
        id,
        password,
      });

      setMessage(res.data.message);
      setMessageType("success");
      setSuccess(true);

      // Auto redirect to login after 3 seconds
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
        "This reset link is invalid or has expired. Please request a new one."
      );
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
              🔑
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Reset Your Password</h2>
            <p className="text-white/40 text-sm mt-2">
              Enter your new password below. Make sure it's strong and secure.
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

          {success ? (
            <div className="text-center space-y-4">
              <div className="text-5xl">✅</div>
              <p className="text-white/60 text-sm leading-relaxed">
                Your password has been reset successfully! You will be redirected to the login page in a moment.
              </p>
              <Link
                to="/login"
                className="block text-center py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition text-sm font-semibold shadow-xl shadow-emerald-500/20"
              >
                Go to Login →
              </Link>
            </div>
          ) : tokenValid ? (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* NEW PASSWORD */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                  New Password
                </label>
                <div className="relative group">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-11 py-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 transition-all text-sm placeholder:text-white/25"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                  Confirm New Password
                </label>
                <div className="relative group">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-11 py-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 transition-all text-sm placeholder:text-white/25"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Password strength hint */}
              <p className="text-white/25 text-xs">
                Password must be at least 6 characters long.
              </p>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all font-semibold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-5xl">❌</div>
              <p className="text-white/60 text-sm leading-relaxed">
                This reset link is invalid or has expired. Please request a new password reset link.
              </p>
              <Link
                to="/forgot-password"
                className="block text-center py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition text-sm font-semibold shadow-xl shadow-emerald-500/20"
              >
                Request New Link →
              </Link>
            </div>
          )}

          {!success && tokenValid && (
            <>
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
            </>
          )}
        </div>

        {/* TRUST BADGES */}
        <div className="flex items-center justify-center gap-6 mt-6 text-white/20 text-xs">
          <span>🔒 SSL Secured</span>
          <span>·</span>
          <span>🛡️ Data Protected</span>
        </div>
      </motion.div>
    </div>
  );
}
