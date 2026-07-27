import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, Globe, Lock, Eye, EyeOff,
  ShieldCheck, Copy, Check, LogOut, Trash2, ChevronRight, ArrowLeft,
  AlertTriangle, Save, Settings as SettingsIcon, Key, Gift, Activity,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { T, ThemeStyles, Button, Banner, Spinner, inputStyle, LedgerRow } from "./system.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com/api";
const c = T.color;

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
      showMsg("Profile updated");
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
      showMsg("Password updated");
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
    showMsg("Language changed");
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
    <div className="ui min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: c.ink }}>
      <ThemeStyles />
      <Spinner size={26} />
      <p className="mono" style={{ fontSize: T.size.xs, letterSpacing: ".2em", textTransform: "uppercase", color: c.text3 }}>
        Loading
      </p>
    </div>
  );

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "—";
  const kycStatus = user?.kyc?.status || "none";
  const kycVerified = user?.isKYCVerified || kycStatus === "approved";
  const kycLabel = kycVerified ? "Verified"
    : kycStatus === "pending" ? "Pending review"
    : kycStatus === "rejected" ? "Rejected"
    : "Not submitted";
  const kycTone = kycVerified ? c.gain : kycStatus === "pending" ? c.brass : kycStatus === "rejected" ? c.loss : c.text3;

  const money = (v) => Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const Shell = ({ title, eyebrow, back, children }) => (
    <div className="ui min-h-screen pb-24" style={{ background: c.ink, color: c.text }}>
      <ThemeStyles />

      <div style={{
        position: "sticky", top: 0, zIndex: 20,
        background: "rgba(14,16,19,.96)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${c.line}`,
      }}>
        <div className="mx-auto flex items-center gap-3" style={{ maxWidth: 640, padding: "16px 20px" }}>
          <button onClick={() => back === "exit" ? navigate("/dashboard") : setSection(back)}
            aria-label="Back"
            className="flex items-center justify-center shrink-0"
            style={{ width: 34, height: 34, border: `1px solid ${c.line}`, background: c.fill, color: c.text2 }}>
            <ArrowLeft size={15} />
          </button>
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="display" style={{ fontSize: T.size.xl, lineHeight: 1.1 }}>{title}</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto" style={{ maxWidth: 640, padding: "24px 20px" }}>
        {message.text && (
          <div style={{ marginBottom: T.space.lg }}>
            <Banner tone={message.type === "success" ? "gain" : "loss"} title={message.text} />
          </div>
        )}
        {children}
      </div>
    </div>
  );

  const labelStyle = { marginBottom: 6 };

  /* ═══════════ MAIN ═══════════ */
  if (section === "main") return (
    <Shell title="Settings" eyebrow="Account" back="exit">

      {/* Identity card */}
      <div style={{ border: `1px solid ${c.line}`, padding: T.space.xl, marginBottom: T.space.xl }}>
        <div className="flex items-start justify-between gap-4">
          <div style={{ minWidth: 0 }}>
            <p className="eyebrow" style={{ marginBottom: 8 }}>Signed in as</p>
            <h2 className="display truncate" style={{ fontSize: 26, lineHeight: 1.1 }}>{user?.name}</h2>
            <p className="mono truncate" style={{ fontSize: T.size.xs, color: c.text3, marginTop: 6 }}>{user?.email}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="eyebrow" style={{ marginBottom: 8 }}>Verification</p>
            <p className="mono" style={{ fontSize: T.size.xs, letterSpacing: ".12em", textTransform: "uppercase", color: kycTone }}>
              {kycLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div style={{ border: `1px solid ${c.line}` }}>
        {[
          { id: "profile",     icon: User,          title: "Profile",      sub: "Name, phone, country" },
          { id: "security",    icon: Lock,          title: "Security",     sub: "Password and verification" },
          { id: "preferences", icon: SettingsIcon,  title: "Preferences",  sub: "Language and notifications" },
          { id: "account",     icon: Activity,      title: "Account",      sub: "Referral code and statistics" },
        ].map((item, i, arr) => (
          <button key={item.id} onClick={() => setSection(item.id)}
            className="w-full text-left hover-fill flex items-center gap-3"
            style={{
              padding: T.space.lg,
              borderBottom: i < arr.length - 1 ? `1px solid ${c.lineSoft}` : "none",
              transition: "background .2s",
            }}>
            <item.icon size={15} style={{ color: c.text3, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: T.size.sm, color: c.text }}>{item.title}</p>
              <p style={{ fontSize: T.size.xs, color: c.text4, marginTop: 2 }}>{item.sub}</p>
            </div>
            <ChevronRight size={14} style={{ color: c.text4, flexShrink: 0 }} />
          </button>
        ))}
      </div>

      <Button variant="danger" full onClick={logout} icon={<LogOut size={13} />} style={{ marginTop: T.space.xl }}>
        Sign out
      </Button>

      <p className="mono" style={{
        fontSize: T.size.micro, letterSpacing: ".18em", textTransform: "uppercase",
        color: c.text4, textAlign: "center", marginTop: T.space.xxl,
      }}>
        MexicaTrading · v1.0
      </p>
    </Shell>
  );

  /* ═══════════ PROFILE ═══════════ */
  if (section === "profile") return (
    <Shell title="Profile" eyebrow="Your details" back="main">

      <div style={{ marginBottom: T.space.lg }}>
        <p className="eyebrow" style={labelStyle}>Full name</p>
        <div style={{ position: "relative" }}>
          <User size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.text4 }} />
          <input type="text" value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            style={{ ...inputStyle, paddingLeft: 38 }} />
        </div>
      </div>

      <div style={{ marginBottom: T.space.lg }}>
        <p className="eyebrow" style={labelStyle}>Email address</p>
        <div style={{ position: "relative" }}>
          <Mail size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.text4 }} />
          <input type="email" value={user?.email || ""} disabled
            style={{ ...inputStyle, paddingLeft: 38, color: c.text4, cursor: "not-allowed", background: "rgba(255,255,255,.02)" }} />
          {user?.isVerified && <Check size={14} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: c.gain }} />}
        </div>
        <p style={{ fontSize: T.size.xs, color: c.text4, marginTop: 6 }}>
          Email can't be changed for security reasons.
        </p>
      </div>

      <div style={{ marginBottom: T.space.lg }}>
        <p className="eyebrow" style={labelStyle}>Phone number</p>
        <div style={{ position: "relative" }}>
          <Phone size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.text4 }} />
          <input type="tel" value={profile.phone} placeholder="+27 65 261 1261"
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            style={{ ...inputStyle, paddingLeft: 38 }} />
        </div>
      </div>

      <div style={{ marginBottom: T.space.xl }}>
        <p className="eyebrow" style={labelStyle}>Country</p>
        <div style={{ position: "relative" }}>
          <Globe size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.text4 }} />
          <input type="text" value={profile.country} placeholder="Your country"
            onChange={(e) => setProfile({ ...profile, country: e.target.value })}
            style={{ ...inputStyle, paddingLeft: 38 }} />
        </div>
      </div>

      <Button full onClick={saveProfile} disabled={saving}
        icon={saving ? <Spinner size={13} tone="#fff" /> : <Save size={13} />}>
        {saving ? "Saving" : "Save changes"}
      </Button>
    </Shell>
  );

  /* ═══════════ SECURITY ═══════════ */
  if (section === "security") return (
    <Shell title="Security" eyebrow="Protection" back="main">

      {/* KYC */}
      <div style={{
        border: `1px solid ${c.line}`, borderLeft: `2px solid ${kycTone}`,
        padding: T.space.xl, marginBottom: T.space.xl,
      }}>
        <div className="flex items-start justify-between gap-3" style={{ marginBottom: T.space.md }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: 6 }}>Identity verification</p>
            <p className="mono" style={{ fontSize: T.size.sm, letterSpacing: ".1em", textTransform: "uppercase", color: kycTone }}>
              {kycLabel}
            </p>
          </div>
          <ShieldCheck size={17} style={{ color: kycTone, flexShrink: 0 }} />
        </div>
        <p style={{ fontSize: T.size.xs, color: c.text3, lineHeight: 1.7, marginBottom: kycVerified ? 0 : T.space.lg }}>
          {kycVerified
            ? "Your identity is confirmed. Withdrawal limits are lifted."
            : "Verification is required to withdraw larger amounts."}
        </p>
        {!kycVerified && (
          <Button variant="outline" full onClick={() => navigate("/kyc")}>
            {kycStatus === "rejected" ? "Resubmit documents" : kycStatus === "pending" ? "View status" : "Verify identity"}
          </Button>
        )}
      </div>

      {/* Password */}
      <p className="eyebrow" style={{ marginBottom: T.space.md }}>Change password</p>
      {[
        { val: pwd.current, set: (v) => setPwd({ ...pwd, current: v }), show: showCur, setShow: setShowCur, ph: "Current password", label: "Current" },
        { val: pwd.new,     set: (v) => setPwd({ ...pwd, new: v }),     show: showNew, setShow: setShowNew, ph: "At least 6 characters", label: "New" },
        { val: pwd.confirm, set: (v) => setPwd({ ...pwd, confirm: v }), show: showCfm, setShow: setShowCfm, ph: "Repeat new password", label: "Confirm" },
      ].map((f, i) => (
        <div key={i} style={{ marginBottom: T.space.md }}>
          <div style={{ position: "relative" }}>
            <Lock size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.text4 }} />
            <input type={f.show ? "text" : "password"} value={f.val} placeholder={f.ph}
              onChange={(e) => f.set(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 38, paddingRight: 44 }} />
            <button type="button" onClick={() => f.setShow(!f.show)}
              aria-label={f.show ? "Hide" : "Show"}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: c.text4, padding: 4 }}>
              {f.show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      ))}

      {pwd.confirm && (
        <p className="flex items-center gap-1.5" style={{
          fontSize: T.size.xs, marginBottom: T.space.md,
          color: pwd.new === pwd.confirm ? c.gain : c.loss,
        }}>
          {pwd.new === pwd.confirm
            ? <><Check size={11} /> Passwords match</>
            : <><AlertTriangle size={11} /> Passwords do not match</>}
        </p>
      )}

      <Button variant="outline" full onClick={changePwd} disabled={saving}
        icon={saving ? <Spinner size={13} /> : <Key size={13} />}>
        {saving ? "Updating" : "Update password"}
      </Button>

      {user?.lastLogin && (
        <div style={{ border: `1px solid ${c.line}`, padding: T.space.lg, marginTop: T.space.xl }}>
          <p className="eyebrow" style={{ marginBottom: 8 }}>Last sign-in</p>
          <p className="mono" style={{ fontSize: T.size.xs, color: c.text2 }}>
            {new Date(user.lastLogin).toLocaleString()}
          </p>
          {user?.lastLoginDevice && (
            <p className="mono" style={{ fontSize: T.size.tiny, color: c.text4, marginTop: 4 }}>
              {user.lastLoginDevice}
            </p>
          )}
        </div>
      )}
    </Shell>
  );

  /* ═══════════ PREFERENCES ═══════════ */
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
      <Shell title="Preferences" eyebrow="Customise" back="main">

        {/* Notifications */}
        <div className="flex items-center justify-between gap-4"
          style={{ border: `1px solid ${c.line}`, padding: T.space.lg, marginBottom: T.space.xl }}>
          <div>
            <p style={{ fontSize: T.size.sm, color: c.text }}>Email notifications</p>
            <p style={{ fontSize: T.size.xs, color: c.text4, marginTop: 2 }}>Deposits, withdrawals and security alerts</p>
          </div>
          <button onClick={toggleNotifs} aria-label="Toggle notifications"
            style={{
              position: "relative", width: 44, height: 24, flexShrink: 0,
              background: emailNotifs ? c.gain : "rgba(255,255,255,.1)",
              transition: "background .2s",
            }}>
            <span style={{
              position: "absolute", top: 3, left: emailNotifs ? 23 : 3,
              width: 18, height: 18, background: "#fff", transition: "left .2s",
            }} />
          </button>
        </div>

        {/* Language */}
        <p className="eyebrow" style={{ marginBottom: T.space.md }}>Language</p>
        <div style={{ border: `1px solid ${c.line}` }}>
          {langs.map((l, i) => {
            const active = i18n.language === l.code;
            return (
              <button key={l.code} onClick={() => changeLang(l.code)}
                className="w-full text-left hover-fill flex items-center gap-3"
                style={{
                  padding: `12px ${T.space.lg}px`,
                  borderBottom: i < langs.length - 1 ? `1px solid ${c.lineSoft}` : "none",
                  borderLeft: `2px solid ${active ? c.gain : "transparent"}`,
                  background: active ? "rgba(63,143,95,.06)" : "transparent",
                }}>
                <span style={{ fontSize: 16, lineHeight: 1 }}>{l.flag}</span>
                <span style={{ flex: 1, fontSize: T.size.sm, color: active ? c.gain : c.text2 }}>{l.name}</span>
                {active && <Check size={13} style={{ color: c.gain }} />}
              </button>
            );
          })}
        </div>
      </Shell>
    );
  }

  /* ═══════════ ACCOUNT ═══════════ */
  if (section === "account") return (
    <Shell title="Account" eyebrow="Overview" back="main">

      {/* Referral */}
      <div style={{ border: `1px solid ${c.line}`, borderLeft: `2px solid ${c.gain}`, padding: T.space.xl, marginBottom: T.space.xl }}>
        <div className="flex items-start justify-between" style={{ marginBottom: T.space.lg }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: 6 }}>Referral code</p>
            <p className="mono" style={{ fontSize: 22, letterSpacing: ".12em", color: c.gain }}>
              {user?.referralCode || "—"}
            </p>
          </div>
          <Gift size={16} style={{ color: c.gain, flexShrink: 0 }} />
        </div>
        <p style={{ fontSize: T.size.xs, color: c.text3, lineHeight: 1.7, marginBottom: T.space.lg }}>
          You earn 5% when someone you refer makes a deposit, and 2% from their referrals.
        </p>
        <Button variant={copiedRef ? "outline" : "primary"} full onClick={copyRef}
          icon={copiedRef ? <Check size={13} /> : <Copy size={13} />}>
          {copiedRef ? "Copied" : "Copy referral link"}
        </Button>
      </div>

      {/* Stats */}
      <div style={{ border: `1px solid ${c.line}`, padding: `0 ${T.space.lg}px`, marginBottom: T.space.xl }}>
        <LedgerRow label="Member since" value={fmtDate(user?.createdAt)} />
        <LedgerRow label="Referrals" value={`${user?.referrals?.length || 0}`} />
        <LedgerRow label="Total invested" value={`$${money(user?.totalInvested)}`} />
        <LedgerRow label="Total profit" value={`+$${money(user?.totalProfit)}`} accent={c.gain} />
        <LedgerRow label="Referral earnings" value={`$${money(user?.referralEarnings)}`} accent={c.gain} last />
      </div>

      {/* Danger */}
      <p className="mono" style={{
        fontSize: T.size.micro, letterSpacing: ".24em", textTransform: "uppercase",
        color: c.loss, marginBottom: T.space.md,
      }}>
        Danger zone
      </p>

      {!confirmDel ? (
        <button onClick={() => setConfirmDel(true)}
          className="w-full text-left flex items-center gap-3"
          style={{ border: `1px solid rgba(180,85,63,.25)`, padding: T.space.lg }}>
          <Trash2 size={15} style={{ color: c.loss, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: T.size.sm, color: c.loss }}>Delete account</p>
            <p style={{ fontSize: T.size.xs, color: c.text4, marginTop: 2 }}>Permanently remove your account and data</p>
          </div>
        </button>
      ) : (
        <div style={{ border: `1px solid rgba(180,85,63,.35)`, background: "rgba(180,85,63,.05)", padding: T.space.lg }}>
          <p style={{ fontSize: T.size.sm, color: c.loss, marginBottom: 8 }}>Are you absolutely sure?</p>
          <p style={{ fontSize: T.size.xs, color: c.text3, lineHeight: 1.7, marginBottom: T.space.lg }}>
            This cannot be undone. Your investments, history and referral records will be permanently deleted.
            Withdraw any remaining balance first.
          </p>
          <input type="text" value={delText} onChange={(e) => setDelText(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="mono"
            style={{ ...inputStyle, borderColor: "rgba(180,85,63,.35)", marginBottom: T.space.md }} />
          <div className="grid grid-cols-2" style={{ gap: 8 }}>
            <Button variant="danger" onClick={deleteAcct}
              disabled={saving || delText !== "DELETE"}
              style={{ opacity: (saving || delText !== "DELETE") ? .4 : 1 }}>
              {saving ? "Deleting" : "Delete"}
            </Button>
            <Button variant="quiet" onClick={() => { setConfirmDel(false); setDelText(""); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Shell>
  );

  return null;
}
