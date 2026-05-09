import { useState } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Phone, Globe, ArrowRight, Eye, EyeOff, CheckCircle, AlertTriangle, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

// Countries with flag, name, and dial code
const COUNTRIES = [
  { name: "United States", code: "US", flag: "🇺🇸", dial: "+1" },
  { name: "United Kingdom", code: "GB", flag: "🇬🇧", dial: "+44" },
  { name: "Canada", code: "CA", flag: "🇨🇦", dial: "+1" },
  { name: "Australia", code: "AU", flag: "🇦🇺", dial: "+61" },
  { name: "Germany", code: "DE", flag: "🇩🇪", dial: "+49" },
  { name: "France", code: "FR", flag: "🇫🇷", dial: "+33" },
  { name: "Spain", code: "ES", flag: "🇪🇸", dial: "+34" },
  { name: "Italy", code: "IT", flag: "🇮🇹", dial: "+39" },
  { name: "Netherlands", code: "NL", flag: "🇳🇱", dial: "+31" },
  { name: "Switzerland", code: "CH", flag: "🇨🇭", dial: "+41" },
  { name: "Mexico", code: "MX", flag: "🇲🇽", dial: "+52" },
  { name: "Brazil", code: "BR", flag: "🇧🇷", dial: "+55" },
  { name: "Argentina", code: "AR", flag: "🇦🇷", dial: "+54" },
  { name: "Chile", code: "CL", flag: "🇨🇱", dial: "+56" },
  { name: "Colombia", code: "CO", flag: "🇨🇴", dial: "+57" },
  { name: "Peru", code: "PE", flag: "🇵🇪", dial: "+51" },
  { name: "Nigeria", code: "NG", flag: "🇳🇬", dial: "+234" },
  { name: "South Africa", code: "ZA", flag: "🇿🇦", dial: "+27" },
  { name: "Kenya", code: "KE", flag: "🇰🇪", dial: "+254" },
  { name: "Ghana", code: "GH", flag: "🇬🇭", dial: "+233" },
  { name: "Egypt", code: "EG", flag: "🇪🇬", dial: "+20" },
  { name: "Morocco", code: "MA", flag: "🇲🇦", dial: "+212" },
  { name: "Senegal", code: "SN", flag: "🇸🇳", dial: "+221" },
  { name: "Tanzania", code: "TZ", flag: "🇹🇿", dial: "+255" },
  { name: "Uganda", code: "UG", flag: "🇺🇬", dial: "+256" },
  { name: "United Arab Emirates", code: "AE", flag: "🇦🇪", dial: "+971" },
  { name: "Saudi Arabia", code: "SA", flag: "🇸🇦", dial: "+966" },
  { name: "Qatar", code: "QA", flag: "🇶🇦", dial: "+974" },
  { name: "Kuwait", code: "KW", flag: "🇰🇼", dial: "+965" },
  { name: "Bahrain", code: "BH", flag: "🇧🇭", dial: "+973" },
  { name: "Oman", code: "OM", flag: "🇴🇲", dial: "+968" },
  { name: "Jordan", code: "JO", flag: "🇯🇴", dial: "+962" },
  { name: "Lebanon", code: "LB", flag: "🇱🇧", dial: "+961" },
  { name: "Turkey", code: "TR", flag: "🇹🇷", dial: "+90" },
  { name: "India", code: "IN", flag: "🇮🇳", dial: "+91" },
  { name: "Pakistan", code: "PK", flag: "🇵🇰", dial: "+92" },
  { name: "Bangladesh", code: "BD", flag: "🇧🇩", dial: "+880" },
  { name: "Sri Lanka", code: "LK", flag: "🇱🇰", dial: "+94" },
  { name: "Philippines", code: "PH", flag: "🇵🇭", dial: "+63" },
  { name: "Indonesia", code: "ID", flag: "🇮🇩", dial: "+62" },
  { name: "Vietnam", code: "VN", flag: "🇻🇳", dial: "+84" },
  { name: "Thailand", code: "TH", flag: "🇹🇭", dial: "+66" },
  { name: "Malaysia", code: "MY", flag: "🇲🇾", dial: "+60" },
  { name: "Singapore", code: "SG", flag: "🇸🇬", dial: "+65" },
  { name: "Hong Kong", code: "HK", flag: "🇭🇰", dial: "+852" },
  { name: "Japan", code: "JP", flag: "🇯🇵", dial: "+81" },
  { name: "South Korea", code: "KR", flag: "🇰🇷", dial: "+82" },
  { name: "China", code: "CN", flag: "🇨🇳", dial: "+86" },
  { name: "Taiwan", code: "TW", flag: "🇹🇼", dial: "+886" },
  { name: "Russia", code: "RU", flag: "🇷🇺", dial: "+7" },
  { name: "Ukraine", code: "UA", flag: "🇺🇦", dial: "+380" },
  { name: "Poland", code: "PL", flag: "🇵🇱", dial: "+48" },
  { name: "Romania", code: "RO", flag: "🇷🇴", dial: "+40" },
  { name: "Czech Republic", code: "CZ", flag: "🇨🇿", dial: "+420" },
  { name: "Greece", code: "GR", flag: "🇬🇷", dial: "+30" },
  { name: "Sweden", code: "SE", flag: "🇸🇪", dial: "+46" },
  { name: "Norway", code: "NO", flag: "🇳🇴", dial: "+47" },
  { name: "Denmark", code: "DK", flag: "🇩🇰", dial: "+45" },
  { name: "Finland", code: "FI", flag: "🇫🇮", dial: "+358" },
  { name: "Belgium", code: "BE", flag: "🇧🇪", dial: "+32" },
  { name: "Austria", code: "AT", flag: "🇦🇹", dial: "+43" },
  { name: "Portugal", code: "PT", flag: "🇵🇹", dial: "+351" },
  { name: "Ireland", code: "IE", flag: "🇮🇪", dial: "+353" },
  { name: "New Zealand", code: "NZ", flag: "🇳🇿", dial: "+64" },
  { name: "Israel", code: "IL", flag: "🇮🇱", dial: "+972" },
];

export default function Register() {
  const { t } = useTranslation();
  const API_URL = "https://mexicatradingbackend.onrender.com";
  const navigate = useNavigate();
  const location = useLocation();
  const refCode = new URLSearchParams(location.search).get("ref") || "";

  const [form, setForm] = useState({
    name: "", email: "", phoneNumber: "",
    password: "", confirmPassword: "", referralCode: refCode,
  });
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.dial.includes(countrySearch)
  );

  const handleSelectCountry = (country) => {
    setSelectedCountry(country);
    setCountryDropdownOpen(false);
    setCountrySearch("");
    setError("");
  };

  // Validate phone number — basic check that it's the right length for the country
  const validatePhone = () => {
    if (!form.phoneNumber.trim()) return "Phone number is required.";
    if (!selectedCountry) return "Please select your country first.";

    const digits = form.phoneNumber.replace(/\D/g, "");
    // Most country phone numbers are 7-15 digits (after country code)
    if (digits.length < 6 || digits.length > 15) {
      return `Please enter a valid phone number for ${selectedCountry.name}.`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError(t("auth.nameRequired", "Full name is required."));
    if (!form.email.trim()) return setError(t("auth.emailRequired", "Email is required."));
    if (!selectedCountry) return setError(t("auth.countryRequired", "Please select your country."));

    const phoneError = validatePhone();
    if (phoneError) return setError(phoneError);

    if (form.password.length < 6) {
      return setError(t("auth.passwordTooShort", "Password must be at least 6 characters."));
    }
    if (form.password !== form.confirmPassword) {
      return setError(t("auth.passwordsDoNotMatch", "Passwords do not match."));
    }
    if (!agreedToTerms) {
      return setError(t("auth.mustAgreeTerms", "You must agree to the Terms and Privacy Policy."));
    }

    // Combine country code + phone number
    const fullPhone = `${selectedCountry.dial} ${form.phoneNumber.trim()}`;

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        name: form.name,
        email: form.email,
        phone: fullPhone,
        country: selectedCountry.name,
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

      <Link to="/" className="absolute top-6 left-6 text-white/30 hover:text-white/70 text-sm transition flex items-center gap-1 z-10">
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

                  {/* Country selector */}
                  <div className="relative">
                    <button type="button" onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                      className="w-full flex items-center justify-between pl-4 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 transition text-sm text-left">
                      {selectedCountry ? (
                        <span className="flex items-center gap-2 text-white">
                          <span className="text-base">{selectedCountry.flag}</span>
                          <span>{selectedCountry.name}</span>
                          <span className="text-emerald-400 font-semibold ml-1">{selectedCountry.dial}</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-white/25">
                          <Globe size={15} />
                          {t("auth.selectCountry", "Select Your Country")}
                        </span>
                      )}
                      <ChevronDown size={15} className={`text-white/40 transition ${countryDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {countryDropdownOpen && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full mt-2 left-0 right-0 z-50 bg-[#0e1422] border border-white/10 rounded-2xl shadow-2xl max-h-72 overflow-hidden flex flex-col">
                        <div className="p-3 border-b border-white/8">
                          <input type="text" placeholder={t("auth.searchCountry", "Search country...")}
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 text-xs text-white placeholder:text-white/30" autoFocus />
                        </div>
                        <div className="overflow-y-auto flex-1">
                          {filteredCountries.length === 0 ? (
                            <p className="text-white/30 text-xs text-center py-4">{t("auth.noCountryFound", "No country found")}</p>
                          ) : (
                            filteredCountries.map(c => (
                              <button key={c.code} type="button" onClick={() => handleSelectCountry(c)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-emerald-500/10 transition text-left ${selectedCountry?.code === c.code ? "bg-emerald-500/10" : ""}`}>
                                <span className="text-lg">{c.flag}</span>
                                <span className="text-white flex-1 truncate">{c.name}</span>
                                <span className="text-emerald-400/70 text-xs font-mono">{c.dial}</span>
                              </button>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Phone — country code prefix + number */}
                  <div className="relative">
                    <div className="flex gap-2">
                      <div className="px-3 py-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5 shrink-0 min-w-[80px]">
                        {selectedCountry ? (
                          <>
                            <span className="text-base">{selectedCountry.flag}</span>
                            <span className="text-emerald-400 text-sm font-semibold">{selectedCountry.dial}</span>
                          </>
                        ) : (
                          <span className="text-white/25 text-xs">+--</span>
                        )}
                      </div>
                      <div className="relative group flex-1">
                        <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-emerald-400 transition" />
                        <input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange}
                          placeholder={selectedCountry ? t("auth.enterPhoneNumber", "Phone number") : t("auth.selectCountryFirst", "Select country first")}
                          disabled={!selectedCountry} required
                          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 focus:bg-white/8 transition text-sm placeholder:text-white/25 disabled:opacity-50 disabled:cursor-not-allowed" />
                      </div>
                    </div>
                    {selectedCountry && form.phoneNumber && (
                      <p className="text-white/25 text-[11px] mt-1.5">
                        📞 {t("auth.willBeSavedAs", "Will be saved as:")} <span className="text-emerald-400 font-mono">{selectedCountry.dial} {form.phoneNumber}</span>
                      </p>
                    )}
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

                  {/* Referral */}
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
