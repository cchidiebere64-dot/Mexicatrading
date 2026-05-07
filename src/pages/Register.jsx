import { useState } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Register() {
  const { t } = useTranslation();
  const API_URL = "https://mexicatradingbackend.onrender.com";
  const navigate = useNavigate();
  const location = useLocation();

  // Detect referral code from URL
  const refCode = new URLSearchParams(location.search).get("ref") || "";

  const [form, setForm] = useState({ name: "", email: "", password: "", referralCode: refCode });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, form);
      if (res.data.token) {
        sessionStorage.setItem("token", res.data.token);
        setSuccess(true);
        setTimeout(() => navigate("/login"), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#080c18] text-white overflow-hidden px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full top-[-150px] left-[-150px]" />
        <div className="absolute w-[400px] h-[400px] bg-teal-400/8 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      </div>

      <Link to="/" className="absolute top-6 left-6 text-white/30 hover:text-white/70 text-sm transition flex items-center gap-1">
        ← MexicaTrading
      </Link>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative w-full max-w-md">
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 p-10 rounded-3xl shadow-2xl">

          <AnimatePresence>
            {success ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center gap-5 py-6">
                <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle size={40} className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{t("auth.accountCreated")}</h2>
                  <p className="text-white/50 text-sm leading-relaxed">{t("auth.verificationSentTo")}</p>
                  <p className="text-emerald-400 font-semibold text-sm mt-1">{form.email}</p>
                </div>
                <div className="w-full p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
                  <p className="text-white/60 text-sm leading-relaxed">
                    📧 {t("auth.checkInboxAndClick")}
                  </p>
                </div>
                <p className="text-white/25 text-xs">{t("auth.redirectingToLogin")}</p>
                <button onClick={() => navigate("/login")}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition-all font-semibold text-sm text-white flex items-center justify-center gap-2">
                  {t("auth.goToLogin")} <ArrowRight size={16} />
                </button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }}>

                {/* Referral banner */}
                {refCode && (
                  <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs text-center">
                    🎁 {t("auth.referralApplied")} — {t("auth.referralDesc")} <strong>{refCode}</strong>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium tracking-widest uppercase mb-5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {t("auth.secureRegister")}
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight mb-2">{t("auth.createAccountTitle")}</h2>
                  <p className="text-white/40 text-sm">{t("auth.joinDesc")}</p>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-6 text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative group">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-emerald-400 transition-colors" />
                    <input type="text" name="name" value={form.name} onChange={handleChange}
                      placeholder={t("auth.fullName")} required
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 focus:bg-white/8 transition-all text-sm placeholder:text-white/25" />
                  </div>

                  <div className="relative group">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-emerald-400 transition-colors" />
                    <input type="email" name="email" value={form.email} onChange={handleChange}
                      placeholder={t("auth.email")} required
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 focus:bg-white/8 transition-all text-sm placeholder:text-white/25" />
                  </div>

                  <div className="relative group">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-emerald-400 transition-colors" />
                    <input type={showPassword ? "text" : "password"} name="password"
                      value={form.password} onChange={handleChange}
                      placeholder={t("auth.password")} required
                      className="w-full pl-11 pr-11 py-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 focus:bg-white/8 transition-all text-sm placeholder:text-white/25" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Referral code input if no URL param */}
                  {!refCode && (
                    <input type="text" name="referralCode" value={form.referralCode} onChange={handleChange}
                      placeholder={t("auth.referralCode")}
                      className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 transition-all text-sm placeholder:text-white/25" />
                  )}

                  <p className="text-white/25 text-xs text-center px-2">
                    {t("auth.termsAgree")}{" "}
                    <Link to="/terms" className="text-emerald-400 hover:underline">{t("auth.termsLink")}</Link>
                    {" "}{t("auth.and")}{" "}
                    <Link to="/privacy" className="text-emerald-400 hover:underline">{t("auth.privacyLink")}</Link>
                  </p>

                  <button type="submit" disabled={loading}
                    className="group w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all font-semibold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2">
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t("auth.registering")}</>
                    ) : (
                      <>{t("auth.register")}<ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                </form>

                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-white/8" />
                  <span className="text-white/20 text-xs">{t("auth.alreadyHave")}</span>
                  <div className="flex-1 h-px bg-white/8" />
                </div>

                <button onClick={() => navigate("/login")}
                  className="w-full py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition text-sm text-white/60 hover:text-white font-medium">
                  {t("auth.signIn")}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-6 mt-6 text-white/20 text-xs">
          <span>🔒 {t("common.sslSecured")}</span>
          <span>·</span>
          <span>🛡️ {t("common.dataProtected")}</span>
          <span>·</span>
          <span>⚡ {t("common.instantAccess")}</span>
        </div>
      </motion.div>
    </div>
  );
}
