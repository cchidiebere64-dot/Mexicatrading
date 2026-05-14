import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, Globe, Lock, Eye, EyeOff, Bell, BellOff,
  ShieldCheck, ShieldAlert, ShieldX, Calendar, Copy, Check,
  LogOut, Trash2, ChevronRight, ArrowLeft, AlertTriangle,
  CheckCircle, Save, Settings as SettingsIcon,
  Key, Gift, Activity,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const API_URL = "https://mexicatradingbackend.onrender.com/api";

const VerifiedBadge = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="vbgrad" x1="0" y1="0" x2="24" y2="24">
        <stop stopColor="#10b981" />
        <stop offset="1" stopColor="#3b82f6" />
      </linearGradient>
    </defs>
    <path d="M12 2L13.91 4.18L16.55 3.5L17.05 6.18L19.5 7.5L18.32 9.91L19.5 12.5L17.05 13.82L16.55 16.5L13.91 15.82L12 18L10.09 15.82L7.45 16.5L6.95 13.82L4.5 12.5L5.68 9.91L4.5 7.5L6.95 6.18L7.45 3.5L10.09 4.18L12 2Z" fill="url(#vbgrad)"/>
    <path d="M9 11.5L11 13.5L15 9.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function UserSettings() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState("main");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({ name: "", phone: "", country: "" });
  const [pwd, setPwd] = useState({ current: "", new: "", confirm: "" });
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showCfm, setShowCfm] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [copiedRef, setCopiedRef] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [delText, setDelText] = useState("");

  const showMsg = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_URL}/user/me`, { headers });
        setUser(res.data);
        setProfile({
          name: res.data.name || "",
          phone: res.data.phone || "",
          country: res.data.country || "",
        });
        setEmailNotifs(res.data.preferences?.emailNotifications !== false);
      } catch {
        showMsg("Failed to load settings", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/user/profile`, profile, { headers });
      setUser({ ...user, ...profile });
      showMsg("Profile updated successfully!");
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to update", "error");
    } finally {
      setSaving(false);
    }
  };

  const changePwd = async () => {
    if (!pwd.current || !pwd.new || !pwd.confirm) return showMsg("Fill all password fields", "error");
    if (pwd.new.length < 6) return showMsg("Password must be at least 6 characters", "error");
    if (pwd.new !== pwd.confirm) return showMsg("Passwords do not match", "error");
    setSaving(true);
    try {
      await axios.put(`${API_URL}/user/change-password`, {
        currentPassword: pwd.current, newPassword: pwd.new,
      }, { headers });
      showMsg("Password updated successfully!");
      setPwd({ current: "", new: "", confirm: "" });
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to update password", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleNotifs = async () => {
    const v = !emailNotifs;
    setEmailNotifs(v);
    try {
      await axios.put(`${API_URL}/user/preferences`, { emailNotifications: v }, { headers });
      showMsg(v ? "Notifications enabled" : "Notifications disabled");
    } catch {
      setEmailNotifs(!v);
      showMsg("Failed to update", "error");
    }
  };

  const changeLang = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    showMsg(`Language changed`);
  };

  const copyRef = () => {
    navigator.clipboard.writeText(`https://mexicatrading.com/register?ref=${user.referralCode}`);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const logout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const deleteAcct = async () => {
    if (delText !== "DELETE") return showMsg("Type DELETE to confirm", "error");
    setSaving(true);
    try {
      await axios.delete(`${API_URL}/user/account`, { headers });
      sessionStorage.clear();
      navigate("/");
    } catch {
      showMsg("Failed to delete account", "error");
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#080c18] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
      <p className="text-white/30 text-sm animate-pulse">Loading...</p>
    </div>
  );

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "—";
  const kycStatus = user?.kyc?.status || "none";
  const kycVerified = user?.isKYCVerified || kycStatus === "approved";
  const kycInfo = kycVerified ? { text: "Verified", color: "emerald" } :
    kycStatus === "pending" ? { text: "Pending Review", color: "yellow" } :
    kycStatus === "rejected" ? { text: "Rejected", color: "red" } :
    { text: "Not Submitted", color: "gray" };

  const MsgBanner = () => (
    <AnimatePresence>
      {message.text && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className={`p-3 rounded-xl text-sm text-center font-medium border ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
          {message.text}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const Header = ({ title, subtitle, back = "main" }) => (
    <div className="sticky top-0 z-20 backdrop-blur-xl bg-[#080c18]/80 border-b border-white/5 px-4 py-4 flex items-center gap-3">
      <button onClick={() => back === "exit" ? navigate("/dashboard") : setSection(back)}
        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition">
        <ArrowLeft size={18} />
      </button>
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-white/30 text-xs">{subtitle}</p>
      </div>
    </div>
  );

  // ===== MAIN MENU =====
  if (section === "main") return (
    <div className="min-h-screen bg-[#080c18] text-white pb-32">
      <Header title="Settings" subtitle="Manage your account" back="exit" />
      <div className="px-4 py-5 space-y-4 max-w-2xl mx-auto">

        {/* Profile Hero */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-2xl">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              {kycVerified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#080c18] flex items-center justify-center">
                  <VerifiedBadge size={20} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-bold text-white truncate">{user?.name}</h2>
                {kycVerified && <VerifiedBadge size={14} />}
              </div>
              <p className="text-white/40 text-xs truncate">{user?.email}</p>
              <div className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider
                ${kycVerified ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400" :
                  kycStatus === "pending" ? "bg-yellow-500/10 border border-yellow-500/25 text-yellow-400" :
                  kycStatus === "rejected" ? "bg-red-500/10 border border-red-500/25 text-red-400" :
                  "bg-white/5 border border-white/10 text-white/40"}`}>
                {kycVerified ? <ShieldCheck size={9} /> :
                  kycStatus === "pending" ? <ShieldAlert size={9} /> :
                  kycStatus === "rejected" ? <ShieldX size={9} /> :
                  <ShieldAlert size={9} />}
                {kycInfo.text}
              </div>
            </div>
          </div>
        </div>

        <MsgBanner />

        <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold px-2 pt-1">Account</p>

        {[
          { id: "profile", icon: User, color: "blue", title: "Profile", sub: "Name, phone, country" },
          { id: "security", icon: Lock, color: "purple", title: "Security", sub: "Password, KYC verification" },
          { id: "preferences", icon: SettingsIcon, color: "amber", title: "Preferences", sub: "Language, notifications" },
          { id: "account", icon: Activity, color: "emerald", title: "Account Info", sub: "Referral code, statistics" },
        ].map(item => (
          <button key={item.id} onClick={() => setSection(item.id)}
            className="w-full p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/8 transition flex items-center gap-3 group">
            <div className={`w-10 h-10 rounded-xl bg-${item.color}-500/15 border border-${item.color}-500/20 flex items-center justify-center shrink-0`}>
              <item.icon size={16} className={`text-${item.color}-400`} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-semibold text-sm">{item.title}</p>
              <p className="text-white/40 text-xs">{item.sub}</p>
            </div>
            <ChevronRight size={16} className="text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition" />
          </button>
        ))}

        <div className="pt-3">
          <button onClick={logout}
            className="w-full p-4 rounded-2xl bg-red-500/8 hover:bg-red-500/15 border border-red-500/20 transition flex items-center justify-center gap-2 text-red-400 font-semibold text-sm">
            <LogOut size={15} /> Logout
          </button>
        </div>

        <div className="pt-6 text-center">
          <p className="text-white/20 text-xs">MexicaTrading · v1.0</p>
          <p className="text-white/15 text-[10px] mt-1">© 2026 All rights reserved</p>
        </div>
      </div>
    </div>
  );

  // ===== PROFILE =====
  if (section === "profile") return (
    <div className="min-h-screen bg-[#080c18] text-white pb-32">
      <Header title="Profile" subtitle="Update your information" />
      <div className="px-4 py-5 space-y-4 max-w-2xl mx-auto">
        <MsgBanner />

        <div>
          <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-2 block">Full Name</label>
          <div className="relative">
            <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/50 text-sm text-white" />
          </div>
        </div>

        <div>
          <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-2 block">Email Address</label>
          <div className="relative">
            <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="email" value={user?.email || ""} disabled
              className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-white/[0.02] border border-white/8 text-sm text-white/50 cursor-not-allowed" />
            {user?.isVerified && <CheckCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400" />}
          </div>
          <p className="text-white/25 text-[11px] mt-1.5 ml-1">Email cannot be changed for security reasons</p>
        </div>

        <div>
          <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-2 block">Phone Number</label>
          <div className="relative">
            <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+1 555 123 4567"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/50 text-sm text-white placeholder:text-white/25" />
          </div>
        </div>

        <div>
          <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-2 block">Country</label>
          <div className="relative">
            <Globe size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="text" value={profile.country} onChange={(e) => setProfile({ ...profile, country: e.target.value })} placeholder="Your country"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/50 text-sm text-white placeholder:text-white/25" />
          </div>
        </div>

        <button onClick={saveProfile} disabled={saving}
          className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 transition font-bold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 mt-4">
          {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : <><Save size={15} /> Save Changes</>}
        </button>
      </div>
    </div>
  );

  // ===== SECURITY =====
  if (section === "security") return (
    <div className="min-h-screen bg-[#080c18] text-white pb-32">
      <Header title="Security" subtitle="Password & verification" />
      <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto">
        <MsgBanner />

        {/* KYC Card */}
        <div className={`p-5 rounded-2xl border ${
          kycVerified ? "bg-emerald-500/8 border-emerald-500/25" :
          kycStatus === "pending" ? "bg-yellow-500/8 border-yellow-500/25" :
          kycStatus === "rejected" ? "bg-red-500/8 border-red-500/25" :
          "bg-white/[0.03] border-white/10"
        }`}>
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              kycVerified ? "bg-emerald-500/20" :
              kycStatus === "pending" ? "bg-yellow-500/20" :
              kycStatus === "rejected" ? "bg-red-500/20" : "bg-white/10"
            }`}>
              {kycVerified ? <ShieldCheck size={18} className="text-emerald-400" /> :
                kycStatus === "pending" ? <ShieldAlert size={18} className="text-yellow-400" /> :
                kycStatus === "rejected" ? <ShieldX size={18} className="text-red-400" /> :
                <ShieldAlert size={18} className="text-white/50" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-white font-bold text-sm">KYC Verification</p>
                {kycVerified && <VerifiedBadge size={14} />}
              </div>
              <p className="text-white/50 text-xs">Identity verification status</p>
            </div>
          </div>
          <p className={`text-sm font-semibold mb-3 ${
            kycVerified ? "text-emerald-400" :
            kycStatus === "pending" ? "text-yellow-400" :
            kycStatus === "rejected" ? "text-red-400" : "text-white/50"
          }`}>{kycInfo.text}</p>
          {!kycVerified && (
            <button onClick={() => navigate("/kyc")}
              className="w-full py-2.5 rounded-xl bg-white/8 hover:bg-white/15 transition text-sm font-semibold text-white">
              {kycStatus === "rejected" ? "Resubmit Documents" : kycStatus === "pending" ? "View Status" : "Verify Identity"}
            </button>
          )}
        </div>

        {/* Password */}
        <div>
          <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold px-1 mb-3">Change Password</p>
          <div className="space-y-3">
            {[
              { val: pwd.current, set: (v) => setPwd({ ...pwd, current: v }), show: showCur, setShow: setShowCur, ph: "Current password" },
              { val: pwd.new, set: (v) => setPwd({ ...pwd, new: v }), show: showNew, setShow: setShowNew, ph: "New password (min 6 characters)" },
              { val: pwd.confirm, set: (v) => setPwd({ ...pwd, confirm: v }), show: showCfm, setShow: setShowCfm, ph: "Confirm new password" },
            ].map((f, i) => (
              <div key={i} className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type={f.show ? "text" : "password"} value={f.val} onChange={(e) => f.set(e.target.value)} placeholder={f.ph}
                  className="w-full pl-11 pr-11 py-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/50 text-sm text-white placeholder:text-white/25" />
                <button type="button" onClick={() => f.setShow(!f.show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {f.show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            ))}

            {pwd.confirm && (
              <p className={`text-xs flex items-center gap-1 ml-1 ${pwd.new === pwd.confirm ? "text-emerald-400" : "text-red-400"}`}>
                {pwd.new === pwd.confirm ? <><CheckCircle size={11} /> Passwords match</> : <><AlertTriangle size={11} /> Passwords do not match</>}
              </p>
            )}

            <button onClick={changePwd} disabled={saving}
              className="w-full py-3.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/25 text-purple-400 disabled:opacity-50 transition font-bold text-sm flex items-center justify-center gap-2 mt-2">
              {saving ? <><span className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />Updating...</> : <><Key size={15} /> Update Password</>}
            </button>
          </div>
        </div>

        {user?.lastLogin && (
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/8">
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-2">Last Login</p>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Activity size={14} className="text-emerald-400" />
              {new Date(user.lastLogin).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ===== PREFERENCES =====
  if (section === "preferences") {
    const langs = [
      { code: "en", name: "English", flag: "🇺🇸" },
      { code: "es", name: "Español", flag: "🇪🇸" },
      { code: "es-MX", name: "Español (MX)", flag: "🇲🇽" },
      { code: "fr", name: "Français", flag: "🇫🇷" },
      { code: "de", name: "Deutsch", flag: "🇩🇪" },
      { code: "pt", name: "Português", flag: "🇧🇷" },
      { code: "ar", name: "العربية", flag: "🇸🇦" },
      { code: "ru", name: "Русский", flag: "🇷🇺" },
      { code: "zh", name: "中文", flag: "🇨🇳" },
    ];
    return (
      <div className="min-h-screen bg-[#080c18] text-white pb-32">
        <Header title="Preferences" subtitle="Customize your experience" />
        <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto">
          <MsgBanner />

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                  {emailNotifs ? <Bell size={15} className="text-blue-400" /> : <BellOff size={15} className="text-white/40" />}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Email Notifications</p>
                  <p className="text-white/40 text-xs">Receive updates via email</p>
                </div>
              </div>
              <button onClick={toggleNotifs} className={`relative w-12 h-7 rounded-full transition ${emailNotifs ? "bg-emerald-500" : "bg-white/10"}`}>
                <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-transform ${emailNotifs ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
          </div>

          <div>
            <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold px-1 mb-3">Language</p>
            <div className="grid grid-cols-2 gap-2">
              {langs.map(l => (
                <button key={l.code} onClick={() => changeLang(l.code)}
                  className={`p-3 rounded-xl border transition flex items-center gap-2.5 text-left ${
                    i18n.language === l.code ? "bg-emerald-500/15 border-emerald-500/30" : "bg-white/[0.03] border-white/8 hover:bg-white/[0.06]"
                  }`}>
                  <span className="text-xl leading-none">{l.flag}</span>
                  <span className={`text-sm font-semibold flex-1 truncate ${i18n.language === l.code ? "text-emerald-400" : "text-white"}`}>{l.name}</span>
                  {i18n.language === l.code && <CheckCircle size={14} className="text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== ACCOUNT INFO =====
  if (section === "account") return (
    <div className="min-h-screen bg-[#080c18] text-white pb-32">
      <Header title="Account Info" subtitle="Your account details" />
      <div className="px-4 py-5 space-y-4 max-w-2xl mx-auto">
        <MsgBanner />

        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/5 border border-emerald-500/25">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Gift size={16} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Your Referral Code</p>
              <p className="text-emerald-400/70 text-xs">Earn 5% commission per referral</p>
            </div>
          </div>
          <div className="bg-black/30 rounded-xl p-3 mb-3">
            <p className="text-emerald-400 font-mono font-bold text-center text-lg tracking-wide">{user?.referralCode || "—"}</p>
          </div>
          <button onClick={copyRef}
            className="w-full py-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/25 text-emerald-400 transition font-semibold text-sm flex items-center justify-center gap-2">
            {copiedRef ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Referral Link</>}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/8">
            <Calendar size={14} className="text-white/40 mb-2" />
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">Member Since</p>
            <p className="text-white text-sm font-semibold">{fmtDate(user?.createdAt)}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/8">
            <Gift size={14} className="text-white/40 mb-2" />
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">Referrals</p>
            <p className="text-emerald-400 text-sm font-bold">{user?.referrals?.length || 0} users</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/8">
            <Activity size={14} className="text-white/40 mb-2" />
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">Total Invested</p>
            <p className="text-white text-sm font-bold">${parseFloat(user?.totalInvested || 0).toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/8">
            <CheckCircle size={14} className="text-emerald-400 mb-2" />
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">Total Profit</p>
            <p className="text-emerald-400 text-sm font-bold">+${parseFloat(user?.totalProfit || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="pt-6">
          <p className="text-red-400/60 text-[10px] uppercase tracking-widest font-bold px-1 mb-3">Danger Zone</p>
          {!confirmDel ? (
            <button onClick={() => setConfirmDel(true)}
              className="w-full p-4 rounded-2xl bg-red-500/8 hover:bg-red-500/15 border border-red-500/20 transition flex items-center gap-3">
              <Trash2 size={15} className="text-red-400" />
              <div className="text-left flex-1">
                <p className="text-red-400 font-semibold text-sm">Delete Account</p>
                <p className="text-red-400/50 text-xs">Permanently remove your account</p>
              </div>
            </button>
          ) : (
            <div className="p-4 rounded-2xl border border-red-500/30 bg-red-500/10 space-y-3">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle size={15} />
                <p className="text-sm font-bold">Are you absolutely sure?</p>
              </div>
              <p className="text-white/60 text-xs leading-relaxed">
                This action cannot be undone. All your data including investments, history, and referrals will be permanently deleted.
              </p>
              <input type="text" value={delText} onChange={(e) => setDelText(e.target.value)} placeholder="Type DELETE to confirm"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-red-500/30 outline-none focus:border-red-500 text-sm text-white placeholder:text-white/30" />
              <div className="grid grid-cols-2 gap-2">
                <button onClick={deleteAcct} disabled={saving || delText !== "DELETE"}
                  className="py-3 rounded-xl bg-red-500 hover:bg-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition text-white text-sm font-bold">
                  {saving ? "Deleting..." : "Yes, Delete"}
                </button>
                <button onClick={() => { setConfirmDel(false); setDelText(""); }}
                  className="py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-white/60 text-sm font-semibold">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return null;
}
