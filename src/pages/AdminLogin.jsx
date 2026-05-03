import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const API_URL = "https://mexicatradingbackend.onrender.com";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

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
    <div className="relative flex items-center justify-center min-h-screen bg-[#080c18] text-white overflow-hidden px-4">

      {/* AMBIENT BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full top-[-150px] left-[-200px]" />
        <div className="absolute w-[400px] h-[400px] bg-blue-500/8 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />
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
        {/* CARD */}
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 p-10 rounded-3xl shadow-2xl">

          {/* HEADER */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
              <ShieldCheck size={28} className="text-emerald-400" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium tracking-widest uppercase mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Admin Access Only
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-1">Admin Portal</h2>
            <p className="text-white/40 text-sm">MexicaTrading Operations Center</p>
          </div>

          {/* ERROR */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 p-3 rounded-xl"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                Admin Email
              </label>
              <div className="relative group">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type="email"
                  placeholder="Enter admin email"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 transition-all text-sm placeholder:text-white/25"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                Password
              </label>
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter admin password"
                  className="w-full pl-11 pr-11 py-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 transition-all text-sm placeholder:text-white/25"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all font-semibold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Access Admin Panel
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* SECURITY NOTE */}
        <div className="flex items-center justify-center gap-2 mt-6 text-white/20 text-xs">
          <ShieldCheck size={12} />
          <span>Restricted access — authorized personnel only</span>
        </div>
      </motion.div>
    </div>
  );
}
