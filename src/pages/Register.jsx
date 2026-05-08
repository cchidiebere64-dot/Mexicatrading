import { useState } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Phone, Globe, ArrowRight, Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

// Top 50 countries — most likely investor regions
const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Spain", "Italy", "Netherlands", "Switzerland",
  "Mexico", "Brazil", "Argentina", "Chile", "Colombia", "Peru",
  "Nigeria", "South Africa", "Kenya", "Ghana", "Egypt", "Morocco",
  "United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait", "Turkey",
  "India", "Pakistan", "Bangladesh", "Philippines", "Indonesia", "Vietnam",
  "Thailand", "Malaysia", "Singapore", "Hong Kong", "Japan", "South Korea",
  "China", "Russia", "Ukraine", "Poland", "Romania", "Sweden", "Norway",
  "Denmark", "Finland", "Belgium", "Austria", "Portugal", "Ireland",
  "New Zealand", "Israel", "Other",
];

export default function Register() {
  const { t } = useTranslation();
  const API_URL = "https://mexicatradingbackend.onrender.com";
  const navigate = useNavigate();
  const location = useLocation();
  const refCode = new URLSearchParams(location.search).get("ref") || "";

  const [form, setForm] = useState({
    name: "", email: "", phone: "", country: "",
    password: "", confirmPassword: "", referralCode: refCode,
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (form.password.length < 6) {
      setError(t("auth.passwordTooShort", "Password must be at least 6 characters."));
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError(t("auth.passwordsDoNotMatch", "Passwords do not match."));
      return;
    }
    if (!form.phone.trim()) {
      setError(t("auth.phoneRequired", "Phone number is required."));
      return;
    }
    if (!form.country) {
      setError(t("auth.countryRequired", "Please select your country."));
      return;
    }
    if (!agreedToTerms) {
      setError(t("auth.mustAgreeTerms", "You must agree to the Terms and Privacy Policy."));
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        country: form.country,
        password: form.password,
        referralCode: form.referralCode,
      });
      if (res.data.token) {
        sessionStorage.setItem("token", res.data.token);
        setSuccess(true);
        setTimeout(() => navigate("/login"), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || t("auth.registrationFailed", "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#080c18] text-white overflow-hidden px-4 py-12">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full top-[-150px] left-[-150px]" />
        <div className="absolute w-[400px] h-[400px] bg-teal-400/8 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      </div>

      <Link to="/" className="absolute top-6 left-6 text-white/30 hover:text-white/70 text-sm transition flex items-center gap-1">
        ← MexicaTrading
      </Link>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative w-full max-w-md">
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl">

          <AnimatePresence>
            {success ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center gap-5 py-6">
                <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle size={40} className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{t("auth.accountCreated", "Account Created!")}</h2>
                  <p className="text-white/50 text-sm leading-relaxed">{t("auth.verificationSentTo", "We sent a verification email to")}</p>
                  <p className="text-emerald-400 font-semibold text-sm mt-1">{form.email}</p>
                </div>
                <div className="w-full p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
                  <p className="text-white/60 text-sm leading-relaxed">
                    📧 {t("auth.checkInboxAndClick", "Please check your inbox and click the verification link to activate your account before logging in.")}
                  </p>
                </div>
                <p className="text-white/25 text-xs">{t("auth.redirectingToLogin", "Redirecting to login in a few seconds...")}</p>
                <button onClick={() => navigate("/login")}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition-all font-semibold text-sm text-white flex items-center justify-center gap-2">
                  {t("auth.goToLogin", "Go to Login")} <ArrowRight size={16} />
                </button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }}>

                {/* Referral banner */}
                {refCode && (
                  <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs text-center">
                    🎁 {t("auth.referralApplied", "Referral code applied")} — <strong>{refCode}</strong>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium tracking-widest uppercase mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {t("auth.secureRegister", "Secure Registration")}
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight mb-1">{t("auth.createAccountTitle", "Create Your Account")}</h2>
                  <p className="text-white/40 text-sm">{t("auth.joinDesc", "Join thousands of investors growing their wealth.")}</p>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-4 flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                    <AlertTriangle size={13} className="shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">

                  {/* Full Name */}
                  <div className="relative group">
                    <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-emerald-400 transition" />
                    <input type="text" name="name" value={form.name} onChange={handleChange}
                      placeholder={t("auth.fullName", "Full Name")} required
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 focus:bg-white/8 transition text-sm placeholder:text-white/25" />
                  </div>

                  {/* Email */}
                  <div className="relative group">
                    <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-emerald-400 transition" />
                    <input type="email" name="email" value={form.email} onChange={handleChange}
                      placeholder={t("auth.email", "Email Address")} required
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 focus:bg-white/8 transition text-sm placeholder:text-white/25" />
                  </div>

                  {/* Phone */}
                  <div className="relative group">
                    <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-emerald-400 transition" />
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                      placeholder={t("auth.phoneNumber", "Phone Number (e.g. +1 555 123 4567)")} required
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 focus:bg-white/8 transition text-sm placeholder:text-white/25" />
                  </div>

                  {/* Country */}
                  <div className="relative group">
                    <Globe size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-emerald-400 transition pointer-events-none z-10" />
                    <select name="country" value={form.country} onChange={handleChange} required
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 focus:bg-white/8 transition text-sm appearance-none cursor-pointer"
                      style={{ color: form.country ? "white" : "rgba(255,255,255,0.25)" }}>
                      <option value="" disabled style={{ color: "#666", background: "#0e1422" }}>
                        {t("auth.selectCountry", "Select Your Country")}
                      </option>
                      {COUNTRIES.map(c => (
                        <option key={c} value={c} style={{ color: "white", background: "#0e1422" }}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Password */}
                  <div className="relative group">
                    <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-emerald-400 transition" />
                    <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange}
                      placeholder={t("auth.password", "Password (min 6 characters)")} required minLength={6}
                      className="w-full pl-11 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 focus:bg-white/8 transition text-sm placeholder:text-white/25" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Confirm Password */}
                  <div className="relative group">
                    <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-emerald-400 transition" />
                    <input type={showConfirm ? "text" : "password"} name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                      placeholder={t("auth.confirmPassword", "Confirm Password")} required minLength={6}
                      className="w-full pl-11 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 focus:bg-white/8 transition text-sm placeholder:text-white/25" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition">
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Match indicator */}
                  {form.confirmPassword && (
                    <p className={`text-xs flex items-center gap-1 ${
                      form.password === form.confirmPassword ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {form.password === form.confirmPassword
                        ? <><CheckCircle size={11} /> {t("auth.passwordsMatch", "Passwords match")}</>
                        : <><AlertTriangle size={11} /> {t("auth.passwordsDoNotMatch", "Passwords do not match")}</>}
                    </p>
                  )}

                  {/* Referral code (only if no URL ref) */}
                  {!refCode && (
                    <input type="text" name="referralCode" value={form.referralCode} onChange={handleChange}
                      placeholder={t("auth.referralCode", "Referral Code (Optional)")}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 transition text-sm placeholder:text-white/25" />
                  )}

                  {/* Terms checkbox */}
                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/8 cursor-pointer hover:bg-white/[0.05] transition">
                    <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded accent-emerald-500 cursor-pointer shrink-0" />
                    <span className="text-white/50 text-xs leading-relaxed">
                      {t("auth.termsAgree", "I agree to the")}{" "}
                      <Link to="/terms" target="_blank" className="text-emerald-400 hover:underline font-semibold">{t("auth.termsLink", "Terms of Service")}</Link>
                      {" "}{t("auth.and", "and")}{" "}
                      <Link to="/privacy" target="_blank" className="text-emerald-400 hover:underline font-semibold">{t("auth.privacyLink", "Privacy Policy")}</Link>
                    </span>
                  </label>

                  {/* Submit */}
                  <button type="submit" disabled={loading || !agreedToTerms}
                    className="group w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2">
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t("auth.registering", "Creating Account...")}</>
                    ) : (
                      <>{t("auth.register", "Create Account")}<ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                </form>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-white/8" />
                  <span className="text-white/20 text-xs">{t("auth.alreadyHave", "Already have an account?")}</span>
                  <div className="flex-1 h-px bg-white/8" />
                </div>

                <button onClick={() => navigate("/login")}
                  className="w-full py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition text-sm text-white/60 hover:text-white font-medium">
                  {t("auth.signIn", "Sign In")}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-4 mt-5 text-white/20 text-xs">
          <span>🔒 {t("common.sslSecured", "SSL Secured")}</span>
          <span>·</span>
          <span>🛡️ {t("common.dataProtected", "Data Protected")}</span>
          <span>·</span>
          <span>⚡ {t("common.instantAccess", "Instant Access")}</span>
        </div>
      </motion.div>
    </div>
  );
}
