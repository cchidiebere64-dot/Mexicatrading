import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Wallet, TrendingUp, ArrowDownCircle, ArrowUpCircle,
  BadgeCheck, Calendar, ChevronRight, BarChart2, Clock,
  RefreshCw, X, Gift, Copy, Check, MessageSquare,
  Sparkles, ArrowUpRight, ArrowDownRight, Eye, EyeOff,
} from "lucide-react";
import LanguageSelector from "../components/LanguageSelector.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com";
const REFRESH_INTERVAL = 30000;

// ── Verified Badge — Twitter/Instagram-style blue checkmark ─────────────────
function VerifiedBadge({ size = 16, className = "" }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
      <defs>
        <linearGradient id="verifiedGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <path
        fill="url(#verifiedGrad)"
        d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484z"
      />
      <path fill="#fff" d="M9 11.74l2.21 2.21 4.79-5.6 1.5 1.28-6.07 7.1L7.5 13.27z" />
    </svg>
  );
}

// ── CountUp animation ────────────────────────────────────────────────────────
function CountUp({ end, prefix = "", duration = 1200, decimals = 0 }) {
  const [value, setValue] = useState(0);
  const prevEnd = useRef(0);
  useEffect(() => {
    const startVal = prevEnd.current;
    prevEnd.current = end;
    let start = startVal;
    const diff = end - startVal;
    if (diff === 0) { setValue(end); return; }
    const step = diff / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if ((step > 0 && start >= end) || (step < 0 && start <= end)) {
        setValue(end); clearInterval(timer);
      } else { setValue(start); }
    }, 16);
    return () => clearInterval(timer);
  }, [end]);
  return <span>{prefix}{value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>;
}

// ── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ profitPercent }) {
  const isPositive = profitPercent >= 0;
  const points = [];
  for (let i = 0; i < 30; i++) {
    const x = (i / 29) * 100;
    const noise = Math.sin(i * 0.5) * 8 + Math.cos(i * 0.3) * 5;
    const trend = isPositive ? (i / 30) * 30 : -(i / 30) * 20;
    points.push(`${x},${50 - trend + noise}`);
  }
  const color = isPositive ? "#10b981" : "#ef4444";
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points={`0,100 ${points.join(" ")} 100,100`} fill="url(#sparkGrad)" />
    </svg>
  );
}

// ── Detect country ───────────────────────────────────────────────────────────
async function detectCountry() {
  try {
    const r = await fetch("https://ipwho.is/"); const d = await r.json();
    if (d.success && d.country) return { country: d.country, flag: d.country_code };
  } catch {}
  try {
    const r = await fetch("https://ip-api.com/json/?fields=status,country,countryCode"); const d = await r.json();
    if (d.status === "success") return { country: d.country, flag: d.countryCode };
  } catch {}
  try {
    const locale = navigator.language || "en-US";
    const regionCode = locale.split("-")[1] || "US";
    const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
    return { country: regionNames.of(regionCode), flag: regionCode };
  } catch {}
  return { country: "", flag: "" };
}

const flagEmoji = (code) => !code ? "🌍" : code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt()));

// ── Popup state helpers ─────────────────────────────────────────────────────
const planKey = (p) => `reinvest_shown_${p.plan}_${p.endDate}`;
const wasShown = (p) => localStorage.getItem(planKey(p)) === "true";
const markShown = (p) => localStorage.setItem(planKey(p), "true");

// ── Reinvest Popup ──────────────────────────────────────────────────────────
function ReinvestPopup({ plans, onDismiss }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const totalProfit = plans.reduce((s, p) => s + (parseFloat(p.profit) || 0), 0);
  const totalAmount = plans.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const latest = plans[plans.length - 1];

  const act = (action) => {
    plans.forEach(markShown);
    onDismiss();
    if (action === "reinvest") navigate("/plans");
    if (action === "withdraw") navigate("/withdraw");
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}>
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#0d1525] to-[#0a1120] border border-emerald-500/30 rounded-3xl p-6 shadow-2xl">
        <button onClick={() => act("dismiss")}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition">
          <X size={14} />
        </button>
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-4xl mb-4">🏆</div>
          <h2 className="text-xl font-bold text-white mb-1">{t("dashboard.investmentMatured")}</h2>
          <p className="text-white/50 text-sm">
            <strong className="text-white">{latest?.plan}</strong> {t("dashboard.planHasCompleted")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white/[0.04] border border-white/8 rounded-2xl p-4 text-center">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-1">{t("dashboard.invested")}</p>
            <p className="text-white font-bold text-lg">${totalAmount.toLocaleString()}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 text-center">
            <p className="text-emerald-400/70 text-xs uppercase tracking-widest mb-1">{t("dashboard.profitEarned")}</p>
            <p className="text-emerald-400 font-bold text-lg">+${totalProfit.toLocaleString()}</p>
          </div>
        </div>
        <p className="text-white/50 text-sm leading-relaxed mb-5 text-center">💡 {t("dashboard.fundsReady")}</p>
        <div className="space-y-2">
          <button onClick={() => act("reinvest")}
            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 transition font-bold text-sm text-white shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2">
            <TrendingUp size={16} /> {t("dashboard.reinvestNow")}
          </button>
          <button onClick={() => act("withdraw")}
            className="w-full py-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition text-sm text-white/60 hover:text-white font-medium">
            {t("dashboard.withdrawProfits")}
          </button>
          <button onClick={() => act("dismiss")} className="w-full py-2.5 text-white/25 hover:text-white/50 transition text-xs">
            {t("dashboard.remindLater")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── KYC Modal ───────────────────────────────────────────────────────────────
function KYCModal({ kyc, onClose }) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}>
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#0d1525] to-[#0a1120] border border-white/10 rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition">
          <X size={14} />
        </button>
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
            {kyc?.status === "approved"
              ? <VerifiedBadge size={36} />
              : <span className="text-3xl">{kyc?.status === "pending" ? "⏳" : "❌"}</span>}
          </div>
          <h2 className="text-lg font-bold text-white">{t("kyc.title")}</h2>
          <span className={`mt-1 text-xs px-3 py-1 rounded-full font-semibold ${
            kyc?.status === "approved" ? "bg-emerald-500/15 text-emerald-400"
            : kyc?.status === "pending" ? "bg-yellow-500/15 text-yellow-400"
            : "bg-red-500/15 text-red-400"
          }`}>
            {kyc?.status === "approved" ? t("dashboard.kycVerified")
             : kyc?.status === "pending" ? t("dashboard.kycUnderReview")
             : t("dashboard.kycRejected2")}
          </span>
        </div>
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/8">
            <p className="text-white/30 text-xs uppercase tracking-widest mb-1">{t("kyc.documentType")}</p>
            <p className="text-white text-sm font-semibold capitalize">{kyc?.idType?.replace("_", " ") || "—"}</p>
          </div>
          {kyc?.status === "approved" && kyc?.reviewedAt && (
            <div className="p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
              <p className="text-emerald-400/60 text-xs uppercase tracking-widest mb-1">{t("dashboard.approvedOn")}</p>
              <p className="text-emerald-400 text-sm font-semibold">
                {new Date(kyc.reviewedAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          )}
          {kyc?.status === "rejected" && kyc?.rejectionReason && (
            <div className="p-3 rounded-xl bg-red-500/8 border border-red-500/20">
              <p className="text-red-400/60 text-xs uppercase tracking-widest mb-1">{t("dashboard.rejectionReason")}</p>
              <p className="text-red-400 text-sm">{kyc.rejectionReason}</p>
            </div>
          )}
          {kyc?.idFrontImage && <img src={kyc.idFrontImage} alt="ID" className="w-full rounded-xl border border-white/10 max-h-40 object-cover" />}
          {kyc?.selfieImage && <img src={kyc.selfieImage} alt="Selfie" className="w-full rounded-xl border border-white/10 max-h-40 object-cover" />}
        </div>
        <button onClick={onClose}
          className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-white text-sm font-semibold transition mt-4">
          {t("dashboard.close")}
        </button>
      </div>
    </div>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // ── Translation shortcuts (clean code, full i18n) ─────────────────────────
  const L = {
    morning: t("dashboard.goodMorning"),
    afternoon: t("dashboard.goodAfternoon"),
    evening: t("dashboard.goodEvening"),
    balance: t("dashboard.totalBalance"),
    invested: t("dashboard.totalInvested"),
    withdrawn: t("dashboard.totalWithdrawn"),
    profit: t("dashboard.totalProfit"),
    activePlans: t("dashboard.activePlans"),
    overallReturn: t("dashboard.overallReturn"),
    deposit: t("dashboard.deposit"),
    invest: t("dashboard.invest"),
    withdraw: t("dashboard.withdraw"),
    messages: t("dashboard.messages"),
    referralProgram: t("dashboard.referralProgram"),
    referralDesc: t("dashboard.referralProgramDesc"),
    referrals: t("dashboard.referrals"),
    earned: t("dashboard.earned"),
    rate: t("dashboard.rate"),
    yourLink: t("dashboard.yourReferralLink"),
    shareNote: t("dashboard.shareReferralNote"),
    copy: t("dashboard.copy"),
    copied: t("dashboard.copied"),
    liveMarket: t("dashboard.liveMarket"),
    live: t("dashboard.live"),
    addPlan: t("dashboard.addPlan"),
    completedPlans: t("dashboard.completedPlans"),
    recentActivities: t("dashboard.recentActivities"),
    noActivePlans: t("dashboard.noActivePlans"),
    noActiveDesc: t("dashboard.noActivePlansDesc"),
    browsePlans: t("dashboard.browsePlans"),
    noCompleted: t("dashboard.noCompletedPlans"),
    noCompletedDesc: t("dashboard.noCompletedPlansDesc"),
    noTransactions: t("dashboard.noTransactions"),
    noTxDesc: t("dashboard.noTransactionsDesc"),
    location: t("dashboard.location"),
    detecting: t("dashboard.detecting"),
    memberSince: t("dashboard.memberSince"),
    accountStatus: t("dashboard.accountStatus"),
    verified: t("dashboard.verified"),
    overallRoi: t("dashboard.overallRoi"),
    invest_label: t("dashboard.invested"),
    profit_label: t("dashboard.profit"),
    roi: t("dashboard.roi"),
    active: t("dashboard.active"),
    done: t("dashboard.done"),
    daysRemaining: t("dashboard.daysRemaining"),
    planCompleted: t("dashboard.planCompleted"),
    endsOn: t("dashboard.endsOn"),
    tapToReinvest: t("dashboard.tapToReinvest"),
    emailVerifyTitle: t("dashboard.emailVerifyTitle"),
    emailVerifyDesc: t("dashboard.emailVerifyDesc"),
    resendEmail: t("dashboard.resendEmail"),
    sending: t("dashboard.sending"),
    kycInviteTitle: t("dashboard.kycInviteTitle"),
    kycInviteDesc: t("dashboard.kycInviteDesc"),
    kycPendingTitle: t("dashboard.kycPendingTitle"),
    kycPendingDesc: t("dashboard.kycPendingDesc"),
    kycRejectedTitle: t("dashboard.kycRejectedTitle"),
    kycRejectedDesc: t("dashboard.kycRejectedDesc"),
    plansCompleted: t("dashboard.plansCompleted"),
    planCompleted1: t("dashboard.planCompleted1"),
    tapToSeeEarnings: t("dashboard.tapToSeeEarnings"),
    balanceCredited: t("dashboard.balanceCredited"),
    balanceDeducted: t("dashboard.balanceDeducted"),
    verificationSent: t("dashboard.verificationEmailSent"),
    failedToResend: t("dashboard.failedToResend"),
    welcomeBack: t("dashboard.welcomeBack"),
    heroSub: t("home.heroSub"),
    loading: t("common.loading"),
    error: t("common.error"),
    retry: t("common.retry"),
  };

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resending, setResending] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [location, setLocation] = useState({ country: "", flag: "" });
  const [notification, setNotification] = useState(null);
  const [showReinvest, setShowReinvest] = useState(false);
  const [reinvestPlans, setReinvestPlans] = useState([]);
  const [copied, setCopied] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [kycData, setKycData] = useState(null);
  const [hideBalance, setHideBalance] = useState(false);
  const prevBalance = useRef(null);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return L.morning;
    if (h < 17) return L.afternoon;
    return L.evening;
  };

  const copyReferral = () => {
    if (!data?.referralCode) return;
    navigator.clipboard.writeText(`https://mexicatrading.com/register?ref=${data.referralCode}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const resendVerification = async () => {
    if (resending) return;
    setResending(true);
    try {
      await axios.post(`${API_URL}/api/auth/resend-verification`, {}, { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } });
      setNotification({ type: "credit", message: `✅ ${L.verificationSent}` });
    } catch (err) {
      setNotification({ type: "debit", message: err.response?.data?.message || L.failedToResend });
    } finally {
      setResending(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const openKYC = async () => {
    const status = data?.kyc?.status;
    if (!status || status === "none") { navigate("/kyc"); return; }
    try {
      const res = await axios.get(`${API_URL}/api/user/kyc-status`, { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } });
      setKycData(res.data.kyc);
      setShowKYCModal(true);
    } catch { navigate("/kyc"); }
  };

  const fetchData = useCallback(async (silent = false) => {
    const token = sessionStorage.getItem("token");
    if (!token) return navigate("/login");
    if (!silent) setRefreshing(true);
    try {
      const res = await axios.get(`${API_URL}/api/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
      const newData = res.data;
      if (prevBalance.current !== null && newData.balance !== prevBalance.current) {
        const diff = newData.balance - prevBalance.current;
        setNotification({
          type: diff > 0 ? "credit" : "debit",
          message: diff > 0 ? `+$${diff.toLocaleString()} ${L.balanceCredited}` : `$${Math.abs(diff).toLocaleString()} ${L.balanceDeducted}`,
        });
        setTimeout(() => setNotification(null), 5000);
      }
      prevBalance.current = newData.balance;
      setData(newData);
      setLastUpdated(new Date());
      const completedPlans = (newData.plans || []).filter(p => p.status?.toLowerCase().trim() === "completed");
      const newlyCompleted = completedPlans.filter(p => !wasShown(p));
      if (newlyCompleted.length > 0) {
        setTimeout(() => { setReinvestPlans(newlyCompleted); setShowReinvest(true); }, 1500);
      }
    } catch {
      if (!silent) setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate, L]);

  useEffect(() => { fetchData(false); detectCountry().then(setLocation); }, []);
  useEffect(() => {
    const i = setInterval(() => fetchData(true), REFRESH_INTERVAL);
    return () => clearInterval(i);
  }, [fetchData]);
  useEffect(() => {
    const onFocus = () => fetchData(true);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchData]);

  // TradingView
  useEffect(() => {
    if (!data) return;
    const t = setTimeout(() => {
      const c = document.getElementById("tradingview-widget");
      if (!c || c.childElementCount > 0) return;
      const s = document.createElement("script");
      s.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      s.async = true;
      s.innerHTML = JSON.stringify({
        autosize: true, symbol: "BINANCE:BTCUSDT", interval: "15",
        timezone: "Etc/UTC", theme: "dark", style: "1", locale: "en",
        allow_symbol_change: true, calendar: false,
        support_host: "https://www.tradingview.com",
      });
      c.appendChild(s);
    }, 100);
    return () => clearTimeout(t);
  }, [data]);

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#080c18] text-white gap-4">
      <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
      <p className="text-white/40 text-sm animate-pulse">{L.loading}</p>
    </div>
  );
  if (!data) return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#080c18] text-white gap-4">
      <p className="text-red-400 text-sm">{L.error}</p>
      <button onClick={() => fetchData(false)}
        className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm hover:bg-emerald-500/25 transition">
        {L.retry}
      </button>
    </div>
  );

  // ── Computations ──────────────────────────────────────────────────────────
  const plans = (data.plans || []).filter(p => p.status?.toLowerCase().trim() === "active");
  const completed = (data.plans || []).filter(p => p.status?.toLowerCase().trim() === "completed");
  const history = data.history || [];
  const totalInvested = [...plans, ...completed].reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const totalProfit = [...plans, ...completed].reduce((s, p) => s + (parseFloat(p.profit) || 0), 0);
  const totalWithdrawn = data.totalWithdrawn || 0;
  const balance = parseFloat(data.balance) || 0;
  const profitPercent = totalInvested > 0 ? ((totalProfit / totalInvested) * 100) : 0;
  const memberSince = data.createdAt ? new Date(data.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "—";
  const referralLink = data.referralCode ? `mexicatrading.com/register?ref=${data.referralCode}` : "";
  const referralEarnings = data.referralEarnings || 0;
  const totalReferrals = (data.referrals || []).length;
  const unreadMessages = data.unreadMessages || 0;
  const kycStatus = data?.kyc?.status || "none";
  const kycInvited = data?.kycInvited || false;
  const isVerified = kycStatus === "approved";
  const showKYCBadge = kycStatus !== "none";
  const showKYCInvite = kycInvited && kycStatus === "none";

  const maskBalance = (val) => hideBalance ? "••••••" : `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen bg-[#080c18] text-white pb-16 font-sans">

      {showReinvest && reinvestPlans.length > 0 && <ReinvestPopup plans={reinvestPlans} onDismiss={() => setShowReinvest(false)} />}
      {showKYCModal && kycData && <KYCModal kyc={kycData} onClose={() => setShowKYCModal(false)} />}

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[700px] h-[700px] bg-emerald-500/8 blur-[180px] rounded-full top-[-200px] left-[-200px]" />
        <div className="absolute w-[500px] h-[500px] bg-teal-400/6 blur-[140px] rounded-full bottom-[-100px] right-[-100px]" />
        <div className="absolute w-[400px] h-[400px] bg-blue-500/4 blur-[140px] rounded-full top-[40%] left-[40%]" />
        <div className="absolute inset-0 opacity-[0.018]" style={{ backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[999] px-5 py-3 rounded-2xl shadow-2xl border text-sm font-semibold flex items-center gap-2 backdrop-blur-xl ${
          notification.type === "credit" ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "bg-red-500/20 border-red-500/40 text-red-400"
        }`}>
          {notification.type === "credit" ? <ArrowDownCircle size={16} /> : <ArrowUpCircle size={16} />}
          {notification.message}
        </div>
      )}

      <div className="ticker-fixed">
        <div className="ticker-text">{L.welcomeBack} {data.name}! — {L.heroSub} — MexicaTrading</div>
      </div>

      <main className="relative z-10 pt-20 px-4 max-w-5xl mx-auto space-y-5">

        {/* GREETING ROW */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-white font-bold text-lg shrink-0">
              {data.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white/40 text-xs">{greeting()}</p>
              <h2 className="text-lg font-bold flex items-center gap-1.5 truncate">
                <span className="truncate">{data.name}</span>
                {isVerified && <VerifiedBadge size={16} className="shrink-0" />}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => fetchData(false)} disabled={refreshing}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition">
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            </button>
            <button onClick={() => navigate("/messages")}
              className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition">
              <MessageSquare size={14} />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </button>
            <LanguageSelector />
          </div>
        </div>

        {/* KYC status pill — clickable */}
        {showKYCBadge && (
          <button onClick={openKYC}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition w-fit ${
              kycStatus === "approved" ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/15"
              : kycStatus === "pending" ? "bg-yellow-500/10 border-yellow-500/25 text-yellow-400 hover:bg-yellow-500/15"
              : "bg-red-500/10 border-red-500/25 text-red-400 hover:bg-red-500/15"
            }`}>
            {kycStatus === "approved" ? <VerifiedBadge size={13} /> : <BadgeCheck size={13} />}
            {kycStatus === "approved" ? "Verified Account" : kycStatus === "pending" ? "Verification Pending" : "Verification Rejected"}
            <ChevronRight size={11} />
          </button>
        )}

        {/* Email verification banner */}
        {!data.isVerified && (
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-yellow-500/30 bg-yellow-500/8">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-yellow-500/15 border border-yellow-500/25 flex items-center justify-center text-base shrink-0">📧</div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-white truncate">{L.emailVerifyTitle}</p>
                <p className="text-yellow-400/70 text-[11px] mt-0.5 truncate">{L.emailVerifyDesc}</p>
              </div>
            </div>
            <button onClick={resendVerification} disabled={resending}
              className="text-[11px] px-3 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30 transition font-semibold whitespace-nowrap flex items-center gap-1.5 disabled:opacity-70 shrink-0">
              {resending
                ? <><span className="w-3 h-3 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" /> {L.sending}</>
                : L.resendEmail}
            </button>
          </div>
        )}

        {/* KYC invite banner */}
        {showKYCInvite && (
          <div onClick={() => navigate("/kyc")}
            className="cursor-pointer flex items-center justify-between p-3.5 rounded-2xl border border-purple-500/30 bg-purple-500/8 hover:bg-purple-500/12 transition">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-base shrink-0">🪪</div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-white truncate">{L.kycInviteTitle}</p>
                <p className="text-purple-400/70 text-[11px] mt-0.5 truncate">{L.kycInviteDesc}</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-purple-400 shrink-0" />
          </div>
        )}

        {/* KYC pending/rejected banner */}
        {(kycStatus === "pending" || kycStatus === "rejected") && (
          <div onClick={openKYC}
            className={`cursor-pointer flex items-center justify-between p-3.5 rounded-2xl border transition ${
              kycStatus === "pending"
                ? "border-yellow-500/30 bg-yellow-500/8 hover:bg-yellow-500/12"
                : "border-red-500/30 bg-red-500/8 hover:bg-red-500/12"
            }`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${
                kycStatus === "pending" ? "bg-yellow-500/15 border border-yellow-500/25" : "bg-red-500/15 border border-red-500/25"
              }`}>
                {kycStatus === "pending" ? "⏳" : "❌"}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-white truncate">
                  {kycStatus === "pending" ? L.kycPendingTitle : L.kycRejectedTitle}
                </p>
                <p className={`text-[11px] mt-0.5 truncate ${kycStatus === "pending" ? "text-yellow-400/70" : "text-red-400/70"}`}>
                  {kycStatus === "pending" ? L.kycPendingDesc : L.kycRejectedDesc}
                </p>
              </div>
            </div>
            <ChevronRight size={16} className={kycStatus === "pending" ? "text-yellow-400" : "text-red-400"} />
          </div>
        )}

        {/* Reinvest banner */}
        {completed.length > 0 && completed.every(wasShown) && (
          <div onClick={() => { setReinvestPlans(completed); setShowReinvest(true); }}
            className="cursor-pointer flex items-center justify-between p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/8 hover:bg-emerald-500/12 transition">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-base shrink-0">🏆</div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-white truncate">
                  {completed.length} {completed.length > 1 ? L.plansCompleted : L.planCompleted1}
                </p>
                <p className="text-emerald-400/70 text-[11px] mt-0.5 truncate">{L.tapToSeeEarnings}</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-emerald-400 shrink-0" />
          </div>
        )}

        {/* PORTFOLIO HERO CARD */}
        <div className="relative rounded-3xl overflow-hidden border border-white/8 bg-gradient-to-br from-[#0d1525] via-[#0a1120] to-[#0d1525] p-6">
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <p className="text-white/40 text-xs uppercase tracking-widest">{L.balance}</p>
                <button onClick={() => setHideBalance(!hideBalance)} className="text-white/30 hover:text-white transition">
                  {hideBalance ? <EyeOff size={11} /> : <Eye size={11} />}
                </button>
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                profitPercent >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
              }`}>
                {profitPercent >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                {profitPercent.toFixed(2)}%
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-1">
              {hideBalance ? "••••••" : <CountUp end={balance} prefix="$" decimals={2} />}
            </h1>
            <p className="text-white/40 text-xs flex items-center gap-1">
              <Sparkles size={10} className="text-emerald-400" />
              {L.profit}: <span className="text-emerald-400 font-semibold">+${totalProfit.toLocaleString()}</span>
              <span className="text-white/20 mx-1">·</span>
              {L.overallReturn}
            </p>
            <div className="h-14 mt-4 -mx-1">
              <Sparkline profitPercent={profitPercent} />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/8">
              <div>
                <p className="text-white/35 text-[10px] uppercase tracking-widest mb-1">{L.invested}</p>
                <p className="text-blue-400 font-bold text-sm">{maskBalance(totalInvested)}</p>
              </div>
              <div>
                <p className="text-white/35 text-[10px] uppercase tracking-widest mb-1">{L.withdrawn}</p>
                <p className="text-purple-400 font-bold text-sm">{maskBalance(totalWithdrawn)}</p>
              </div>
              <div>
                <p className="text-white/35 text-[10px] uppercase tracking-widest mb-1">{L.activePlans}</p>
                <p className="text-emerald-400 font-bold text-sm">{plans.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-4 gap-2.5">
          {[
            { icon: <ArrowDownCircle size={18} />, label: L.deposit, path: "/deposit", color: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/25" },
            { icon: <TrendingUp size={18} />,      label: L.invest,  path: "/plans",   color: "from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/25" },
            { icon: <ArrowUpCircle size={18} />,   label: L.withdraw,path: "/withdraw",color: "from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/25" },
            { icon: <MessageSquare size={18} />,   label: L.messages,path: "/messages",color: "from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/25", badge: unreadMessages },
          ].map((action, i) => (
            <button key={i} onClick={() => navigate(action.path)}
              className={`relative aspect-[4/3] rounded-2xl border bg-gradient-to-br ${action.color} hover:scale-[1.02] transition flex flex-col items-center justify-center gap-1.5 group`}>
              <div className="opacity-90 group-hover:scale-110 transition-transform">{action.icon}</div>
              <p className="text-xs font-semibold opacity-90">{action.label}</p>
              {action.badge > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {action.badge > 9 ? "9+" : action.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* REFERRAL CARD */}
        {data.referralCode && (
          <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-white/[0.02] to-teal-500/5 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                <Gift size={16} className="text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-sm">{L.referralProgram}</h3>
                <p className="text-emerald-400/70 text-xs mt-0.5">{L.referralDesc}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/8 text-center">
                <p className="text-white/35 text-[10px] uppercase tracking-widest mb-1">{L.referrals}</p>
                <p className="text-white font-bold">{totalReferrals}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-emerald-400/60 text-[10px] uppercase tracking-widest mb-1">{L.earned}</p>
                <p className="text-emerald-400 font-bold">${referralEarnings.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/8 text-center">
                <p className="text-white/35 text-[10px] uppercase tracking-widest mb-1">{L.rate}</p>
                <p className="text-white font-bold">5%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 font-mono truncate">
                {referralLink}
              </div>
              <button onClick={copyReferral}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold text-xs transition whitespace-nowrap ${
                  copied ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400" : "bg-emerald-500 hover:bg-emerald-400 text-white"
                }`}>
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? L.copied : L.copy}
              </button>
            </div>
          </div>
        )}

        {/* LIVE CHART */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">{L.liveMarket}</h3>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {L.live}
            </div>
          </div>
          <div className="rounded-3xl border border-white/8 overflow-hidden h-[380px]">
            <div id="tradingview-widget" style={{ height: "100%", width: "100%" }} />
          </div>
        </section>

        {/* ACTIVE PLANS */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">{L.activePlans}</h3>
            {plans.length > 0 && (
              <button onClick={() => navigate("/plans")} className="text-xs text-emerald-400 flex items-center gap-1 hover:gap-2 transition">
                {L.addPlan} <ChevronRight size={12} />
              </button>
            )}
          </div>
          {plans.length ? (
            <div className="flex gap-3 overflow-x-auto py-1 snap-x snap-mandatory pb-2">
              {plans.map((p, i) => {
                const start = new Date(p.createdAt);
                const end = new Date(p.endDate);
                const totalDays = p.duration;
                const daysPassed = Math.min(totalDays, Math.floor((Date.now() - start) / 86400000));
                const progress = Math.round((daysPassed / totalDays) * 100);
                const daysLeft = Math.max(0, Math.ceil((end - new Date()) / 86400000));
                const roi = p.amount > 0 ? ((p.profit / p.amount) * 100).toFixed(1) : "0.0";
                return (
                  <div key={i} className="min-w-[260px] flex-shrink-0 snap-start rounded-2xl border border-white/8 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-4 flex flex-col gap-3 hover:border-emerald-500/30 transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm">{p.plan}</h4>
                        <p className="text-white/30 text-[10px] mt-0.5">{L.endsOn} {end.toLocaleDateString()}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${progress < 100 ? "bg-emerald-500/15 text-emerald-400" : "bg-green-500/15 text-green-400"}`}>
                        {progress < 100 ? L.active : L.done}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 shrink-0">
                        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15" stroke="#ffffff10" strokeWidth="3" fill="none" />
                          <circle cx="18" cy="18" r="15" stroke="#10b981" strokeWidth="3" fill="none"
                            strokeDasharray={2 * Math.PI * 15}
                            strokeDashoffset={2 * Math.PI * 15 - (2 * Math.PI * 15 * progress) / 100}
                            strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.2s ease-out" }} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-emerald-400">{progress}%</div>
                      </div>
                      <div className="flex flex-col gap-1 text-xs flex-1">
                        <div className="flex justify-between">
                          <span className="text-white/35">{L.invest_label}</span>
                          <span className="font-semibold">${parseFloat(p.amount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/35">{L.profit_label}</span>
                          <span className="font-semibold text-emerald-400">+${parseFloat(p.profit).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/35">{L.roi}</span>
                          <span className="font-semibold text-teal-400">{roi}%</span>
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 text-[10px] border-t border-white/5 pt-2 ${progress < 100 ? "text-white/40" : "text-green-400"}`}>
                      {progress < 100 ? <><Clock size={10} /> {daysLeft} {L.daysRemaining}</> : <><BadgeCheck size={10} /> {L.planCompleted}</>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 rounded-3xl border border-white/8 bg-white/[0.02] text-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <TrendingUp size={20} className="text-emerald-400 opacity-60" />
              </div>
              <p className="text-white font-semibold text-sm">{L.noActivePlans}</p>
              <p className="text-white/30 text-xs max-w-xs">{L.noActiveDesc}</p>
              <button onClick={() => navigate("/plans")} className="mt-1 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs hover:bg-emerald-500/25 transition font-semibold">
                {L.browsePlans}
              </button>
            </div>
          )}
        </section>

        {/* COMPLETED PLANS */}
        {completed.length > 0 && (
          <section>
            <h3 className="text-sm font-bold text-white mb-3">{L.completedPlans}</h3>
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {completed.map((p, i) => (
                <div key={i} onClick={() => { setReinvestPlans([p]); setShowReinvest(true); }}
                  className="cursor-pointer flex items-center justify-between p-3 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-emerald-500/30 hover:bg-emerald-500/5 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                      <BadgeCheck size={15} className="text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-xs">{p.plan}</p>
                      <p className="text-white/30 text-[11px]">{L.invest_label} ${parseFloat(p.amount).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold text-xs">+${parseFloat(p.profit).toLocaleString()}</p>
                    <p className="text-emerald-400/50 text-[10px]">{L.tapToReinvest}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* RECENT ACTIVITIES */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">{L.recentActivities}</h3>
          </div>
          {history.length ? (
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {history.map((h, i) => {
                const isDeposit = h.action === "Deposit";
                return (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-white/15 transition">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDeposit ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                        {isDeposit ? <ArrowDownCircle size={15} className="text-emerald-400" /> : <ArrowUpCircle size={15} className="text-red-400" />}
                      </div>
                      <div>
                        <p className="font-semibold text-xs">{isDeposit ? L.deposit : L.withdraw}</p>
                        <p className="text-white/30 text-[11px]">{new Date(h.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p>
                      </div>
                    </div>
                    <p className={`font-bold text-xs ${isDeposit ? "text-emerald-400" : "text-red-400"}`}>
                      {isDeposit ? "+" : "-"}${parseFloat(h.amount ?? 0).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 rounded-3xl border border-white/8 bg-white/[0.02] text-center gap-2">
              <Wallet size={20} className="text-white/20" />
              <p className="text-white font-semibold text-sm">{L.noTransactions}</p>
              <p className="text-white/30 text-xs">{L.noTxDesc}</p>
            </div>
          )}
        </section>

        {/* ACCOUNT INFO */}
        <section className="rounded-3xl border border-white/8 bg-white/[0.02] p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-base">
              {flagEmoji(location.flag)}
            </div>
            <div className="min-w-0">
              <p className="text-white/30 text-[10px] uppercase tracking-widest">{L.location}</p>
              <p className="font-semibold text-xs truncate">{location.country || L.detecting}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Calendar size={14} className="text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-white/30 text-[10px] uppercase tracking-widest">{L.memberSince}</p>
              <p className="font-semibold text-xs truncate">{memberSince}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              {isVerified ? <VerifiedBadge size={14} /> : <BadgeCheck size={14} className="text-emerald-400" />}
            </div>
            <div className="min-w-0">
              <p className="text-white/30 text-[10px] uppercase tracking-widest">{L.accountStatus}</p>
              <p className="font-semibold text-xs text-emerald-400">{L.verified}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <BarChart2 size={14} className="text-purple-400" />
            </div>
            <div className="min-w-0">
              <p className="text-white/30 text-[10px] uppercase tracking-widest">{L.overallRoi}</p>
              <p className="font-semibold text-xs text-purple-400">{profitPercent.toFixed(2)}%</p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
