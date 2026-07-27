import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Wallet, TrendingUp, ArrowDownCircle, ArrowUpCircle,
  BadgeCheck, Calendar, ChevronRight, BarChart2, Clock,
  RefreshCw, X, Gift, Copy, Check, MessageSquare,
  ArrowUpRight, ArrowDownRight, Eye, EyeOff, Receipt,
} from "lucide-react";
import LanguageSelector from "../components/LanguageSelector.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com";
const REFRESH_INTERVAL = 30000;

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS — "Ledger"
   ink      #0E1013   base, warm-neutral rather than blue-black
   panel    #16191E   raised surfaces
   paper    #EDE9E1   the printed statement (signature element)
   gain     #3F8F5F   deeper than neon; used only for real gains
   loss     #B4553F   muted rust
   brass    #C08A3E   premium accents, used sparingly
───────────────────────────────────────────────────────────── */

// ── Verified Badge ──────────────────────────────────────────────────────────
function VerifiedBadge({ size = 16, className = "" }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
      <path
        fill="#3F8F5F"
        d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484z"
      />
      <path fill="#fff" d="M9 11.74l2.21 2.21 4.79-5.6 1.5 1.28-6.07 7.1L7.5 13.27z" />
    </svg>
  );
}

// ── CountUp ─────────────────────────────────────────────────────────────────
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

// ── Sparkline — a plotted line, not a gradient blob ─────────────────────────
function Sparkline({ profitPercent }) {
  const isPositive = profitPercent >= 0;
  const points = [];
  for (let i = 0; i < 30; i++) {
    const x = (i / 29) * 100;
    const noise = Math.sin(i * 0.5) * 7 + Math.cos(i * 0.3) * 4;
    const trend = isPositive ? (i / 30) * 26 : -(i / 30) * 18;
    points.push(`${x},${50 - trend + noise}`);
  }
  const color = isPositive ? "#3F8F5F" : "#B4553F";
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
      {[25, 50, 75].map((y) => (
        <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(14,16,19,.07)" strokeWidth="0.4" />
      ))}
      <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Detect country ──────────────────────────────────────────────────────────
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4" style={{ background: "rgba(8,9,11,.86)" }}>
      <div className="relative w-full max-w-sm" style={{ background: "#16191E", border: "1px solid rgba(192,138,62,.35)" }}>
        <div className="h-1" style={{ background: "#C08A3E" }} />
        <button onClick={() => act("dismiss")}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/35 hover:text-white transition"
          style={{ background: "rgba(255,255,255,.05)" }}>
          <X size={14} />
        </button>

        <div className="p-7">
          <p className="mono text-[10px] tracking-[.22em] uppercase mb-3" style={{ color: "#C08A3E" }}>Plan matured</p>
          <h2 className="display text-2xl text-white mb-1.5">{t("dashboard.investmentMatured")}</h2>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,.45)" }}>
            <span className="text-white/85">{latest?.plan}</span> {t("dashboard.planHasCompleted")}
          </p>

          <div className="mb-6" style={{ borderTop: "1px solid rgba(255,255,255,.09)" }}>
            <LedgerLine label={t("dashboard.invested")} value={`$${totalAmount.toLocaleString()}`} />
            <LedgerLine label={t("dashboard.profitEarned")} value={`+$${totalProfit.toLocaleString()}`} accent="#3F8F5F" />
          </div>

          <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,.5)" }}>
            {t("dashboard.fundsReady")}
          </p>

          <div className="space-y-2">
            <button onClick={() => act("reinvest")}
              className="w-full py-3.5 font-semibold text-sm text-white flex items-center justify-center gap-2 transition"
              style={{ background: "#3F8F5F" }}>
              <TrendingUp size={15} /> {t("dashboard.reinvestNow")}
            </button>
            <button onClick={() => act("withdraw")}
              className="w-full py-3 text-sm transition"
              style={{ border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.6)" }}>
              {t("dashboard.withdrawProfits")}
            </button>
            <button onClick={() => act("dismiss")} className="w-full py-2 text-xs" style={{ color: "rgba(255,255,255,.25)" }}>
              {t("dashboard.remindLater")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── KYC Modal ───────────────────────────────────────────────────────────────
function KYCModal({ kyc, onClose }) {
  const { t } = useTranslation();
  const tone =
    kyc?.status === "approved" ? { c: "#3F8F5F", label: t("dashboard.kycVerified") }
    : kyc?.status === "pending" ? { c: "#C08A3E", label: t("dashboard.kycUnderReview") }
    : { c: "#B4553F", label: t("dashboard.kycRejected2") };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4" style={{ background: "rgba(8,9,11,.86)" }}>
      <div className="relative w-full max-w-sm max-h-[85vh] overflow-y-auto" style={{ background: "#16191E", border: "1px solid rgba(255,255,255,.1)" }}>
        <div className="h-1" style={{ background: tone.c }} />
        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/35 hover:text-white transition"
          style={{ background: "rgba(255,255,255,.05)" }}>
          <X size={14} />
        </button>

        <div className="p-7">
          <p className="mono text-[10px] tracking-[.22em] uppercase mb-3" style={{ color: tone.c }}>{tone.label}</p>
          <h2 className="display text-2xl text-white mb-6">{t("kyc.title")}</h2>

          <div style={{ borderTop: "1px solid rgba(255,255,255,.09)" }}>
            <LedgerLine label={t("kyc.documentType")} value={kyc?.idType?.replace("_", " ") || "—"} />
            {kyc?.status === "approved" && kyc?.reviewedAt && (
              <LedgerLine label={t("dashboard.approvedOn")}
                value={new Date(kyc.reviewedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                accent="#3F8F5F" />
            )}
          </div>

          {kyc?.status === "rejected" && kyc?.rejectionReason && (
            <div className="mt-4 p-4" style={{ background: "rgba(180,85,63,.08)", border: "1px solid rgba(180,85,63,.25)" }}>
              <p className="mono text-[10px] tracking-[.18em] uppercase mb-1.5" style={{ color: "#B4553F" }}>{t("dashboard.rejectionReason")}</p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,.7)" }}>{kyc.rejectionReason}</p>
            </div>
          )}

          <div className="space-y-2 mt-4">
            {kyc?.idFrontImage && <img src={kyc.idFrontImage} alt="ID" className="w-full max-h-40 object-cover" style={{ border: "1px solid rgba(255,255,255,.1)" }} />}
            {kyc?.selfieImage && <img src={kyc.selfieImage} alt="Selfie" className="w-full max-h-40 object-cover" style={{ border: "1px solid rgba(255,255,255,.1)" }} />}
          </div>

          <button onClick={onClose}
            className="w-full py-3 mt-5 text-sm transition"
            style={{ border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.55)" }}>
            {t("dashboard.close")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Ledger row: label left, figure right, hairline between ── */
function LedgerLine({ label, value, accent, small }) {
  return (
    <div className="flex items-baseline justify-between py-3" style={{ borderBottom: "1px solid rgba(255,255,255,.07)" }}>
      <span className={`${small ? "text-[11px]" : "text-xs"}`} style={{ color: "rgba(255,255,255,.4)" }}>{label}</span>
      <span className="mono text-sm tabular" style={{ color: accent || "rgba(255,255,255,.9)" }}>{value}</span>
    </div>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const L = {
    morning: t("dashboard.goodMorning", "Good morning"),
    afternoon: t("dashboard.goodAfternoon", "Good afternoon"),
    evening: t("dashboard.goodEvening", "Good evening"),
    balance: t("dashboard.totalBalance", "Total Balance"),
    invested: t("dashboard.totalInvested", "Total Invested"),
    withdrawn: t("dashboard.totalWithdrawn", "Total Withdrawn"),
    profit: t("dashboard.totalProfit", "Total Profit"),
    activePlans: t("dashboard.activePlans", "Active Plans"),
    overallReturn: t("dashboard.overallReturn", "overall return"),
    deposit: t("dashboard.deposit", "Deposit"),
    invest: t("dashboard.invest", "Invest"),
    withdraw: t("dashboard.withdraw", "Withdraw"),
    messages: t("dashboard.messages", "Messages"),
    referralProgram: t("dashboard.referralProgram", "Referral Program"),
    referralDesc: t("dashboard.referralProgramDesc", "Earn 5% commission on every friend you refer"),
    referrals: t("dashboard.referrals", "Referrals"),
    earned: t("dashboard.earned", "Earned"),
    rate: t("dashboard.rate", "Rate"),
    copy: t("dashboard.copy", "Copy"),
    copied: t("dashboard.copied", "Copied!"),
    liveMarket: t("dashboard.liveMarket", "Live Market"),
    live: t("dashboard.live", "LIVE"),
    addPlan: t("dashboard.addPlan", "Add Plan"),
    completedPlans: t("dashboard.completedPlans", "Completed Plans"),
    recentActivities: t("dashboard.recentActivities", "Recent Activities"),
    noActivePlans: t("dashboard.noActivePlans", "No Active Plans Yet"),
    noActiveDesc: t("dashboard.noActivePlansDesc", "Start growing your wealth by choosing an investment plan tailored for you."),
    browsePlans: t("dashboard.browsePlans", "Browse Plans →"),
    noTransactions: t("dashboard.noTransactions", "No Transactions Yet"),
    noTxDesc: t("dashboard.noTransactionsDesc", "Your deposits, withdrawals and activity history will show up here."),
    location: t("dashboard.location", "Location"),
    detecting: t("dashboard.detecting", "Detecting..."),
    memberSince: t("dashboard.memberSince", "Member since"),
    accountStatus: t("dashboard.accountStatus", "Account Status"),
    verified: t("dashboard.verified", "Verified"),
    overallRoi: t("dashboard.overallRoi", "Overall ROI"),
    invest_label: t("dashboard.invested", "Invested"),
    profit_label: t("dashboard.profit", "Profit"),
    roi: t("dashboard.roi", "ROI"),
    active: t("dashboard.active", "Active"),
    done: t("dashboard.done", "Done"),
    daysRemaining: t("dashboard.daysRemaining", "days remaining"),
    planCompleted: t("dashboard.planCompleted", "Plan completed"),
    endsOn: t("dashboard.endsOn", "Ends"),
    tapToReinvest: t("dashboard.tapToReinvest", "Tap to reinvest →"),
    emailVerifyTitle: t("dashboard.emailVerifyTitle", "Please verify your email address"),
    emailVerifyDesc: t("dashboard.emailVerifyDesc", "Check your inbox for the verification link we sent you"),
    resendEmail: t("dashboard.resendEmail", "Resend Email"),
    sending: t("dashboard.sending", "Sending..."),
    kycInviteTitle: t("dashboard.kycInviteTitle", "You've been invited to verify your identity"),
    kycInviteDesc: t("dashboard.kycInviteDesc", "Complete KYC verification for a better and more secure experience"),
    kycPendingTitle: t("dashboard.kycPendingTitle", "KYC Under Review"),
    kycPendingDesc: t("dashboard.kycPendingDesc", "Your documents are being reviewed — tap to track progress"),
    kycRejectedTitle: t("dashboard.kycRejectedTitle", "KYC Verification Rejected"),
    kycRejectedDesc: t("dashboard.kycRejectedDesc", "Your documents were rejected — tap to resubmit"),
    plansCompleted: t("dashboard.plansCompleted", "Plans Completed"),
    planCompleted1: t("dashboard.planCompleted1", "Plan Completed"),
    tapToSeeEarnings: t("dashboard.tapToSeeEarnings", "Tap to see completed plans"),
    balanceCredited: t("dashboard.balanceCredited", "has been credited to your account!"),
    balanceDeducted: t("dashboard.balanceDeducted", "has been deducted from your account."),
    verificationSent: t("dashboard.verificationEmailSent", "Verification email sent! Please check your inbox."),
    failedToResend: t("dashboard.failedToResend", "Failed to resend. Please try again."),
    welcomeBack: t("dashboard.welcomeBack", "Welcome back"),
    heroSub: t("home.heroSub", "A professional-grade investment platform built for those who take their financial future seriously."),
    loading: t("common.loading", "Loading..."),
    error: t("common.error", "Error loading data. Please refresh."),
    retry: t("common.retry", "Retry"),
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

  const styleBlock = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=Archivo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
      .display { font-family:'Fraunces',Georgia,serif; font-optical-sizing:auto; letter-spacing:-.01em; }
      .mono    { font-family:'IBM Plex Mono',ui-monospace,monospace; }
      .tabular { font-variant-numeric: tabular-nums; }
      .rule    { border-bottom:1px solid rgba(255,255,255,.07); }
      @media (prefers-reduced-motion: reduce) { * { animation:none !important; transition:none !important; } }
    `}</style>
  );

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen gap-4" style={{ background: "#0E1013", fontFamily: "'Archivo',system-ui,sans-serif" }}>
      {styleBlock}
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,.15)", borderTopColor: "#3F8F5F" }} />
      <p className="mono text-[11px] tracking-[.2em] uppercase" style={{ color: "rgba(255,255,255,.3)" }}>{L.loading}</p>
    </div>
  );

  if (!data) return (
    <div className="flex flex-col justify-center items-center h-screen gap-4 px-6 text-center" style={{ background: "#0E1013", fontFamily: "'Archivo',system-ui,sans-serif" }}>
      {styleBlock}
      <p className="text-sm" style={{ color: "#B4553F" }}>{L.error}</p>
      <button onClick={() => fetchData(false)}
        className="px-5 py-2.5 text-sm transition"
        style={{ border: "1px solid rgba(63,143,95,.4)", color: "#3F8F5F" }}>
        {L.retry}
      </button>
    </div>
  );

  // ── Computations (unchanged) ──────────────────────────────────────────────
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

  const money = (v) => v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const maskBalance = (val) => hideBalance ? "••••••" : `$${money(val)}`;

  const iconBtn = {
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(255,255,255,.09)",
    color: "rgba(255,255,255,.45)",
  };

  return (
    <div className="min-h-screen pb-16" style={{ background: "#0E1013", color: "#fff", fontFamily: "'Archivo',system-ui,sans-serif" }}>
      {styleBlock}

      {showReinvest && reinvestPlans.length > 0 && <ReinvestPopup plans={reinvestPlans} onDismiss={() => setShowReinvest(false)} />}
      {showKYCModal && kycData && <KYCModal kyc={kycData} onClose={() => setShowKYCModal(false)} />}

      {/* Balance-change notification */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[999] px-5 py-3 text-sm flex items-center gap-2.5"
          style={{
            background: "#16191E",
            border: `1px solid ${notification.type === "credit" ? "rgba(63,143,95,.45)" : "rgba(180,85,63,.45)"}`,
            color: notification.type === "credit" ? "#3F8F5F" : "#B4553F",
          }}>
          {notification.type === "credit" ? <ArrowDownCircle size={15} /> : <ArrowUpCircle size={15} />}
          {notification.message}
        </div>
      )}

      <div className="ticker-fixed">
        <div className="ticker-text">{L.welcomeBack} {data.name}! — {L.heroSub} — MexicaTrading</div>
      </div>

      <main className="relative pt-20 px-4 max-w-4xl mx-auto">

        {/* ══ HEADER ══ */}
        <div className="flex items-center justify-between gap-3 py-5 rule">
          <div className="min-w-0">
            <p className="mono text-[10px] tracking-[.22em] uppercase mb-1" style={{ color: "rgba(255,255,255,.32)" }}>
              {greeting()}
            </p>
            <h2 className="display text-xl font-light flex items-center gap-2 truncate">
              <span className="truncate">{data.name}</span>
              {isVerified && <VerifiedBadge size={15} className="shrink-0" />}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => fetchData(false)} disabled={refreshing} aria-label="Refresh"
              className="w-9 h-9 flex items-center justify-center transition hover:text-white" style={iconBtn}>
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            </button>

            <button onClick={() => navigate("/history")} aria-label="Transaction history"
              className="w-9 h-9 flex items-center justify-center transition hover:text-white" style={iconBtn}>
              <Receipt size={14} />
            </button>

            <button onClick={() => navigate("/messages")} aria-label="Messages"
              className="relative w-9 h-9 flex items-center justify-center transition hover:text-white" style={iconBtn}>
              <MessageSquare size={14} />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 mono text-[9px] font-semibold flex items-center justify-center"
                  style={{ background: "#B4553F", color: "#fff" }}>
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </button>
            <LanguageSelector />
          </div>
        </div>

        {/* KYC pill */}
        {showKYCBadge && (
          <button onClick={openKYC}
            className="mt-5 flex items-center gap-2 px-3 py-1.5 mono text-[10px] tracking-[.14em] uppercase transition w-fit"
            style={{
              border: `1px solid ${kycStatus === "approved" ? "rgba(63,143,95,.35)" : kycStatus === "pending" ? "rgba(192,138,62,.35)" : "rgba(180,85,63,.35)"}`,
              color: kycStatus === "approved" ? "#3F8F5F" : kycStatus === "pending" ? "#C08A3E" : "#B4553F",
            }}>
            <BadgeCheck size={12} />
            {kycStatus === "approved" ? "Verified account" : kycStatus === "pending" ? "Verification pending" : "Verification rejected"}
            <ChevronRight size={11} />
          </button>
        )}

        {/* Email verification banner */}
        {!data.isVerified && (
          <div className="mt-5 flex items-center justify-between gap-3 p-4" style={{ background: "rgba(192,138,62,.07)", borderLeft: "2px solid #C08A3E" }}>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{L.emailVerifyTitle}</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,.45)" }}>{L.emailVerifyDesc}</p>
            </div>
            <button onClick={resendVerification} disabled={resending}
              className="mono text-[10px] tracking-[.12em] uppercase px-3 py-2 shrink-0 transition disabled:opacity-60"
              style={{ border: "1px solid rgba(192,138,62,.4)", color: "#C08A3E" }}>
              {resending ? L.sending : L.resendEmail}
            </button>
          </div>
        )}

        {/* KYC invite */}
        {showKYCInvite && (
          <button onClick={() => navigate("/kyc")}
            className="mt-3 w-full text-left flex items-center justify-between gap-3 p-4 transition"
            style={{ background: "rgba(192,138,62,.07)", borderLeft: "2px solid #C08A3E" }}>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{L.kycInviteTitle}</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,.45)" }}>{L.kycInviteDesc}</p>
            </div>
            <ChevronRight size={16} style={{ color: "#C08A3E" }} className="shrink-0" />
          </button>
        )}

        {/* KYC pending / rejected */}
        {(kycStatus === "pending" || kycStatus === "rejected") && (
          <button onClick={openKYC}
            className="mt-3 w-full text-left flex items-center justify-between gap-3 p-4 transition"
            style={{
              background: kycStatus === "pending" ? "rgba(192,138,62,.07)" : "rgba(180,85,63,.07)",
              borderLeft: `2px solid ${kycStatus === "pending" ? "#C08A3E" : "#B4553F"}`,
            }}>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {kycStatus === "pending" ? L.kycPendingTitle : L.kycRejectedTitle}
              </p>
              <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,.45)" }}>
                {kycStatus === "pending" ? L.kycPendingDesc : L.kycRejectedDesc}
              </p>
            </div>
            <ChevronRight size={16} className="shrink-0" style={{ color: kycStatus === "pending" ? "#C08A3E" : "#B4553F" }} />
          </button>
        )}

        {/* Matured plans */}
        {completed.length > 0 && completed.every(wasShown) && (
          <button onClick={() => { setReinvestPlans(completed); setShowReinvest(true); }}
            className="mt-3 w-full text-left flex items-center justify-between gap-3 p-4 transition"
            style={{ background: "rgba(63,143,95,.07)", borderLeft: "2px solid #3F8F5F" }}>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {completed.length} {completed.length > 1 ? L.plansCompleted : L.planCompleted1}
              </p>
              <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,.45)" }}>{L.tapToSeeEarnings}</p>
            </div>
            <ChevronRight size={16} style={{ color: "#3F8F5F" }} className="shrink-0" />
          </button>
        )}

        {/* ══ THE STATEMENT — signature element ══ */}
        <div className="mt-6 relative" style={{ background: "#EDE9E1", color: "#0E1013" }}>
          {/* torn-edge cue */}
          <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "#3F8F5F" }} />

          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="mono text-[10px] tracking-[.24em] uppercase" style={{ color: "rgba(14,16,19,.5)" }}>
                  {L.balance}
                </p>
                <p className="mono text-[10px] mt-1" style={{ color: "rgba(14,16,19,.35)" }}>
                  {lastUpdated ? `as of ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}
                </p>
              </div>
              <button onClick={() => setHideBalance(!hideBalance)} aria-label="Toggle balance visibility"
                className="p-1.5 transition" style={{ color: "rgba(14,16,19,.4)" }}>
                {hideBalance ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            <h1 className="display tabular font-light leading-none mb-4"
              style={{ fontSize: "clamp(38px,11vw,60px)", color: "#0E1013" }}>
              {hideBalance ? "••••••" : <CountUp end={balance} prefix="$" decimals={2} />}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <span className="mono text-xs tabular flex items-center gap-1 px-2 py-1"
                style={{
                  background: profitPercent >= 0 ? "rgba(63,143,95,.14)" : "rgba(180,85,63,.14)",
                  color: profitPercent >= 0 ? "#2F6E48" : "#8F3F2E",
                }}>
                {profitPercent >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                {profitPercent.toFixed(2)}%
              </span>
              <span className="text-xs" style={{ color: "rgba(14,16,19,.5)" }}>
                {L.profit} <span className="mono tabular" style={{ color: "#2F6E48" }}>+${money(totalProfit)}</span>
              </span>
            </div>

            <div className="h-12 -mx-1 mb-6">
              <Sparkline profitPercent={profitPercent} />
            </div>

            {/* Ledger totals */}
            <div style={{ borderTop: "1px solid rgba(14,16,19,.14)" }}>
              {[
                [L.invested, maskBalance(totalInvested)],
                [L.withdrawn, maskBalance(totalWithdrawn)],
                [L.activePlans, String(plans.length)],
              ].map(([label, value], i) => (
                <div key={i} className="flex items-baseline justify-between py-2.5"
                  style={{ borderBottom: i < 2 ? "1px solid rgba(14,16,19,.09)" : "none" }}>
                  <span className="text-xs" style={{ color: "rgba(14,16,19,.5)" }}>{label}</span>
                  <span className="mono text-sm tabular" style={{ color: "#0E1013" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ ACTIONS ══ */}
        <div className="grid grid-cols-3 mt-6" style={{ border: "1px solid rgba(255,255,255,.09)" }}>
          {[
            { icon: <ArrowDownCircle size={17} />, label: L.deposit, path: "/deposit" },
            { icon: <TrendingUp size={17} />,      label: L.invest,  path: "/plans" },
            { icon: <ArrowUpCircle size={17} />,   label: L.withdraw,path: "/withdraw" },
            /* ── Messages quick action — commented out (icon lives in the header) ──
            { icon: <MessageSquare size={17} />,   label: L.messages,path: "/messages", badge: unreadMessages },
            */
          ].map((action, i) => (
            <button key={i} onClick={() => navigate(action.path)}
              className="relative py-6 flex flex-col items-center justify-center gap-2 transition hover:bg-white/[0.03]"
              style={{ borderLeft: i > 0 ? "1px solid rgba(255,255,255,.09)" : "none", color: "rgba(255,255,255,.75)" }}>
              {action.icon}
              <span className="mono text-[10px] tracking-[.14em] uppercase">{action.label}</span>
              {action.badge > 0 && (
                <span className="absolute top-3 right-3 w-4 h-4 mono text-[9px] flex items-center justify-center"
                  style={{ background: "#B4553F", color: "#fff" }}>
                  {action.badge > 9 ? "9+" : action.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══ REFERRAL ══ */}
        {data.referralCode && (
          <section className="mt-8">
            <SectionHead label="Referrals" title={L.referralProgram} />
            <div className="p-5" style={{ background: "#16191E", border: "1px solid rgba(255,255,255,.08)" }}>
              <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,.45)" }}>{L.referralDesc}</p>

              <div className="grid grid-cols-3 mb-5" style={{ borderTop: "1px solid rgba(255,255,255,.08)", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
                {[
                  [L.referrals, String(totalReferrals), null],
                  [L.earned, `$${money(referralEarnings)}`, "#3F8F5F"],
                  [L.rate, "5%", "#C08A3E"],
                ].map(([label, value, accent], i) => (
                  <div key={i} className="py-4 text-center" style={{ borderLeft: i > 0 ? "1px solid rgba(255,255,255,.08)" : "none" }}>
                    <p className="mono text-[9px] tracking-[.18em] uppercase mb-1.5" style={{ color: "rgba(255,255,255,.32)" }}>{label}</p>
                    <p className="mono text-base tabular" style={{ color: accent || "#fff" }}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-stretch gap-0">
                <div className="flex-1 px-3 py-3 mono text-[11px] truncate"
                  style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.09)", color: "rgba(255,255,255,.55)" }}>
                  {referralLink}
                </div>
                <button onClick={copyReferral}
                  className="px-4 mono text-[10px] tracking-[.14em] uppercase flex items-center gap-1.5 transition"
                  style={{
                    background: copied ? "rgba(63,143,95,.15)" : "#3F8F5F",
                    color: copied ? "#3F8F5F" : "#fff",
                    border: copied ? "1px solid rgba(63,143,95,.4)" : "1px solid #3F8F5F",
                  }}>
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? L.copied : L.copy}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ══ MARKET ══ */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <SectionHead label="Market" title={L.liveMarket} inline />
            <span className="mono text-[10px] tracking-[.16em] uppercase flex items-center gap-1.5" style={{ color: "#3F8F5F" }}>
              <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: "#3F8F5F" }} />
              {L.live}
            </span>
          </div>
          <div style={{ border: "1px solid rgba(255,255,255,.08)", height: 360 }}>
            <div id="tradingview-widget" style={{ height: "100%", width: "100%" }} />
          </div>
        </section>

        {/* ══ ACTIVE PLANS ══ */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <SectionHead label="Portfolio" title={L.activePlans} inline />
            {plans.length > 0 && (
              <button onClick={() => navigate("/plans")}
                className="mono text-[10px] tracking-[.14em] uppercase flex items-center gap-1 transition" style={{ color: "#3F8F5F" }}>
                {L.addPlan} <ChevronRight size={11} />
              </button>
            )}
          </div>

          {plans.length ? (
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
              {plans.map((p, i) => {
                const start = new Date(p.createdAt);
                const end = new Date(p.endDate);
                const totalDays = p.duration;
                const daysPassed = Math.min(totalDays, Math.floor((Date.now() - start) / 86400000));
                const progress = Math.round((daysPassed / totalDays) * 100);
                const daysLeft = Math.max(0, Math.ceil((end - new Date()) / 86400000));
                const roi = p.amount > 0 ? ((p.profit / p.amount) * 100).toFixed(1) : "0.0";
                return (
                  <div key={i} className="min-w-[262px] shrink-0 snap-start p-5"
                    style={{ background: "#16191E", border: "1px solid rgba(255,255,255,.08)" }}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="display text-lg font-light text-white">{p.plan}</h4>
                        <p className="mono text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,.3)" }}>
                          {L.endsOn} {end.toLocaleDateString()}
                        </p>
                      </div>
                      <span className="mono text-[9px] tracking-[.16em] uppercase px-2 py-1"
                        style={{
                          background: progress < 100 ? "rgba(63,143,95,.12)" : "rgba(192,138,62,.12)",
                          color: progress < 100 ? "#3F8F5F" : "#C08A3E",
                        }}>
                        {progress < 100 ? L.active : L.done}
                      </span>
                    </div>

                    {/* progress as a ruled bar, not a donut */}
                    <div className="mb-4">
                      <div className="flex items-baseline justify-between mb-1.5">
                        <span className="mono text-[10px]" style={{ color: "rgba(255,255,255,.35)" }}>{progress}%</span>
                        <span className="mono text-[10px]" style={{ color: "rgba(255,255,255,.35)" }}>
                          {progress < 100 ? `${daysLeft} ${L.daysRemaining}` : L.planCompleted}
                        </span>
                      </div>
                      <div className="h-[3px]" style={{ background: "rgba(255,255,255,.08)" }}>
                        <div className="h-full transition-all duration-700" style={{ width: `${progress}%`, background: "#3F8F5F" }} />
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid rgba(255,255,255,.07)" }}>
                      <LedgerLine small label={L.invest_label} value={`$${parseFloat(p.amount).toLocaleString()}`} />
                      <LedgerLine small label={L.profit_label} value={`+$${parseFloat(p.profit).toLocaleString()}`} accent="#3F8F5F" />
                      <LedgerLine small label={L.roi} value={`${roi}%`} accent="#C08A3E" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={<TrendingUp size={20} />} title={L.noActivePlans} text={L.noActiveDesc}
              action={{ label: L.browsePlans, onClick: () => navigate("/plans") }} />
          )}
        </section>

        {/* ══ COMPLETED ══ */}
        {completed.length > 0 && (
          <section className="mt-8">
            <SectionHead label="Closed" title={L.completedPlans} />
            <div style={{ border: "1px solid rgba(255,255,255,.08)" }}>
              {completed.map((p, i) => (
                <button key={i} onClick={() => { setReinvestPlans([p]); setShowReinvest(true); }}
                  className="w-full text-left flex items-center justify-between px-5 py-4 transition hover:bg-white/[0.03]"
                  style={{ borderBottom: i < completed.length - 1 ? "1px solid rgba(255,255,255,.07)" : "none" }}>
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{p.plan}</p>
                    <p className="mono text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,.32)" }}>
                      {L.invest_label} ${parseFloat(p.amount).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="mono text-sm tabular" style={{ color: "#3F8F5F" }}>+${parseFloat(p.profit).toLocaleString()}</p>
                    <p className="mono text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,.28)" }}>{L.tapToReinvest}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ══ RECENT ACTIVITY ══ */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <SectionHead label="Ledger" title={L.recentActivities} inline />
            <button onClick={() => navigate("/history")}
              className="mono text-[10px] tracking-[.14em] uppercase flex items-center gap-1 transition" style={{ color: "rgba(255,255,255,.4)" }}>
              All <ChevronRight size={11} />
            </button>
          </div>

          {history.length ? (
            <div style={{ border: "1px solid rgba(255,255,255,.08)" }}>
              {history.slice(0, 6).map((h, i, arr) => {
                const isIn = h.action === "Deposit" || h.action === "Profit" || h.action === "Referral" || h.action === "Bonus" || h.action === "Credit";
                return (
                  <div key={i} className="flex items-center justify-between px-5 py-4"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,.07)" : "none" }}>
                    <div className="min-w-0">
                      <p className="text-sm text-white">{h.action}</p>
                      <p className="mono text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,.3)" }}>
                        {new Date(h.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <p className="mono text-sm tabular shrink-0 ml-3" style={{ color: isIn ? "#3F8F5F" : "#B4553F" }}>
                      {isIn ? "+" : "−"}${parseFloat(h.amount ?? 0).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={<Wallet size={20} />} title={L.noTransactions} text={L.noTxDesc} />
          )}
        </section>

        {/* ══ ACCOUNT ══ */}
        <section className="mt-8">
          <SectionHead label="Account" title="Details" />
          <div className="grid grid-cols-2" style={{ border: "1px solid rgba(255,255,255,.08)" }}>
            {[
              [L.location, location.country || L.detecting, flagEmoji(location.flag)],
              [L.memberSince, memberSince, <Calendar size={13} key="c" />],
              [L.accountStatus, isVerified ? L.verified : "Unverified", <BadgeCheck size={13} key="b" />],
              [L.overallRoi, `${profitPercent.toFixed(2)}%`, <BarChart2 size={13} key="r" />],
            ].map(([label, value, icon], i) => (
              <div key={i} className="p-4"
                style={{
                  borderLeft: i % 2 === 1 ? "1px solid rgba(255,255,255,.08)" : "none",
                  borderTop: i > 1 ? "1px solid rgba(255,255,255,.08)" : "none",
                }}>
                <p className="mono text-[9px] tracking-[.18em] uppercase mb-2 flex items-center gap-1.5" style={{ color: "rgba(255,255,255,.3)" }}>
                  <span style={{ color: "rgba(255,255,255,.35)" }}>{icon}</span> {label}
                </p>
                <p className="text-sm truncate" style={{ color: "rgba(255,255,255,.85)" }}>{value}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

/* ── Section heading: small caps eyebrow + serif title ── */
function SectionHead({ label, title, inline }) {
  return (
    <div className={inline ? "" : "mb-3"}>
      <p className="mono text-[9px] tracking-[.24em] uppercase mb-1" style={{ color: "rgba(255,255,255,.3)" }}>{label}</p>
      <h3 className="display text-lg font-light text-white">{title}</h3>
    </div>
  );
}

function EmptyState({ icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 gap-2"
      style={{ border: "1px solid rgba(255,255,255,.08)" }}>
      <div style={{ color: "rgba(255,255,255,.2)" }}>{icon}</div>
      <p className="display text-base text-white mt-1">{title}</p>
      <p className="text-xs max-w-xs" style={{ color: "rgba(255,255,255,.35)" }}>{text}</p>
      {action && (
        <button onClick={action.onClick}
          className="mt-3 px-5 py-2.5 mono text-[10px] tracking-[.14em] uppercase transition"
          style={{ border: "1px solid rgba(63,143,95,.4)", color: "#3F8F5F" }}>
          {action.label}
        </button>
      )}
    </div>
  );
}
