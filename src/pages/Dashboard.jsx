import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Wallet, TrendingUp, ArrowDownCircle, ArrowUpCircle,
  BadgeCheck, Globe, Calendar, ChevronRight,
  Activity, DollarSign, BarChart2, Clock, RefreshCw, X,
} from "lucide-react";
import LanguageSelector from "../components/LanguageSelector.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com";
const REFRESH_INTERVAL = 30000;
const REINVEST_REMINDER_INTERVAL = 5 * 60 * 1000;

// ── Animated count-up ─────────────────────────────────────────────────────────
function CountUp({ end, prefix = "", duration = 1200 }) {
  const [value, setValue] = useState(0);
  const prevEnd = useRef(0);
  useEffect(() => {
    const startVal = prevEnd.current;
    prevEnd.current = end;
    let start = startVal;
    const diff = end - startVal;
    if (diff === 0) return;
    const step = diff / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if ((step > 0 && start >= end) || (step < 0 && start <= end)) {
        setValue(end); clearInterval(timer);
      } else { setValue(Math.floor(start)); }
    }, 16);
    return () => clearInterval(timer);
  }, [end]);
  return <span>{prefix}{value.toLocaleString()}</span>;
}

// ── Flag emoji ────────────────────────────────────────────────────────────────
function flagEmoji(code) {
  if (!code) return "🌍";
  return code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt()));
}

// ── Detect country ────────────────────────────────────────────────────────────
async function detectCountry() {
  try {
    const res = await fetch("https://ipwho.is/");
    const d = await res.json();
    if (d.success && d.country) return { country: d.country, flag: d.country_code };
  } catch {}
  try {
    const res = await fetch("https://ip-api.com/json/?fields=status,country,countryCode");
    const d = await res.json();
    if (d.status === "success" && d.country) return { country: d.country, flag: d.countryCode };
  } catch {}
  try {
    const res = await fetch("https://freeipapi.com/api/json");
    const d = await res.json();
    if (d.countryName) return { country: d.countryName, flag: d.countryCode };
  } catch {}
  try {
    const locale = navigator.language || navigator.languages?.[0] || "en-US";
    const regionCode = locale.split("-")[1] || "US";
    const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
    const countryName = regionNames.of(regionCode);
    return { country: countryName, flag: regionCode };
  } catch {}
  return { country: "", flag: "" };
}

// ── Reinvest Popup Component ──────────────────────────────────────────────────
function ReinvestPopup({ completedPlans, onReinvest, onDismiss }) {
  const navigate = useNavigate();
  const totalProfit = completedPlans.reduce((s, p) => s + (parseFloat(p.profit) || 0), 0);
  const totalAmount = completedPlans.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const latestPlan = completedPlans[completedPlans.length - 1];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
      <div className="relative w-full max-w-sm bg-[#0d1221] border border-emerald-500/30 rounded-3xl p-6 shadow-2xl"
        style={{ animation: "scale-in 0.4s ease forwards" }}>

        {/* Close button */}
        <button onClick={onDismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
          <X size={14} />
        </button>

        {/* Trophy icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-4xl mb-4"
            style={{ animation: "float 3s ease-in-out infinite" }}>
            🏆
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Investment Matured!</h2>
          <p className="text-white/50 text-sm">
            Your <strong className="text-white">{latestPlan?.plan}</strong> plan has completed
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/[0.04] border border-white/8 rounded-2xl p-4 text-center">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Invested</p>
            <p className="text-white font-bold text-lg">${totalAmount.toLocaleString()}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
            <p className="text-emerald-400/70 text-xs uppercase tracking-widest mb-1">Profit Earned</p>
            <p className="text-emerald-400 font-bold text-lg">+${totalProfit.toLocaleString()}</p>
          </div>
        </div>

        {/* Message */}
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-4 mb-5 text-center">
          <p className="text-white/60 text-sm leading-relaxed">
            💡 Your funds are ready! Reinvest now to keep growing your wealth or withdraw your profits.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => { onDismiss(); navigate("/plans"); }}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition-all font-bold text-sm text-white shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2">
            <TrendingUp size={16} />
            Reinvest Now
          </button>
          <button
            onClick={() => { onDismiss(); navigate("/withdraw"); }}
            className="w-full py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition text-sm text-white/60 hover:text-white font-medium">
            Withdraw Profits
          </button>
          <button onClick={onDismiss}
            className="w-full py-2.5 text-white/25 hover:text-white/50 transition text-xs">
            Remind me later
          </button>
        </div>

        {/* Pulsing dot */}
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [location, setLocation] = useState({ country: "", flag: "" });
  const [notification, setNotification] = useState(null);
  const [showReinvest, setShowReinvest] = useState(false);
  const prevBalance = useRef(null);
  const reinvestTimerRef = useRef(null);
  const navigate = useNavigate();

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t("dashboard.goodMorning");
    if (h < 17) return t("dashboard.goodAfternoon");
    return t("dashboard.goodEvening");
  };

  // ── Resend verification email ─────────────────────────────────────────────
  const handleResendVerification = async () => {
    const token = sessionStorage.getItem("token");
    try {
      await axios.post(`${API_URL}/api/auth/resend-verification`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Verification email sent! Please check your inbox.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to resend. Please try again.");
    }
  };

  // ── Show reinvest popup if user has completed plans ───────────────────────
  const triggerReinvestPopup = useCallback((completedPlans) => {
    if (completedPlans.length > 0) {
      setShowReinvest(true);
    }
  }, []);

  // ── Setup recurring reminder every 5 minutes ─────────────────────────────
  const setupReinvestReminder = useCallback((completedPlans) => {
    if (reinvestTimerRef.current) clearInterval(reinvestTimerRef.current);
    if (completedPlans.length > 0) {
      reinvestTimerRef.current = setInterval(() => {
        setShowReinvest(true);
      }, REINVEST_REMINDER_INTERVAL);
    }
  }, []);

  const fetchDashboard = useCallback(async (silent = false) => {
    const token = sessionStorage.getItem("token");
    if (!token) return navigate("/login");
    if (!silent) setRefreshing(true);
    try {
      const res = await axios.get(`${API_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newData = res.data;

      // Balance change notification
      if (prevBalance.current !== null && newData.balance !== prevBalance.current) {
        const diff = newData.balance - prevBalance.current;
        if (diff > 0) {
          setNotification({ type: "credit", message: `+$${diff.toLocaleString()} has been credited to your account!` });
        } else {
          setNotification({ type: "debit", message: `$${Math.abs(diff).toLocaleString()} has been deducted from your account.` });
        }
        setTimeout(() => setNotification(null), 5000);
      }

      prevBalance.current = newData.balance;
      setData(newData);
      setLastUpdated(new Date());

      // ── Check for completed plans and trigger reinvest popup ─────────────
      const completedPlans = (newData.plans || []).filter(p => p.status?.toLowerCase().trim() === "completed");
      if (completedPlans.length > 0) {
        setTimeout(() => triggerReinvestPopup(completedPlans), 1500);
        setupReinvestReminder(completedPlans);
      }

    } catch {
      if (!silent) setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate, triggerReinvestPopup, setupReinvestReminder]);

  // Initial load
  useEffect(() => {
    fetchDashboard(false);
    detectCountry().then(setLocation);
  }, [fetchDashboard]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => fetchDashboard(true), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  // Refresh on tab focus
  useEffect(() => {
    const handleFocus = () => fetchDashboard(true);
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchDashboard]);

  // Cleanup reminder on unmount
  useEffect(() => {
    return () => {
      if (reinvestTimerRef.current) clearInterval(reinvestTimerRef.current);
    };
  }, []);

  // TradingView chart
  useEffect(() => {
    if (!data) return;
    const timeout = setTimeout(() => {
      const container = document.getElementById("tradingview-widget");
      if (!container || container.childElementCount > 0) return;
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        autosize: true, symbol: "BINANCE:BTCUSDT", interval: "15",
        timezone: "Etc/UTC", theme: "dark", style: "1", locale: "en",
        allow_symbol_change: true, calendar: false,
        support_host: "https://www.tradingview.com",
      });
      container.appendChild(script);
    }, 100);
    return () => clearTimeout(timeout);
  }, [data]);

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#080c18] text-white gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-white/40 text-sm animate-pulse">{t("common.loading")}</p>
      </div>
    );

  if (!data)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#080c18] text-white gap-4">
        <p className="text-red-400 text-sm">{t("common.error")}</p>
        <button onClick={() => fetchDashboard(false)}
          className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm hover:bg-emerald-500/25 transition-all">
          {t("common.retry")}
        </button>
      </div>
    );

  const plans = (data.plans || []).filter(p => p.status?.toLowerCase().trim() === "active");
  const completed = (data.plans || []).filter(p => p.status?.toLowerCase().trim() === "completed");
  const history = data.history || [];
  const totalInvested = [...plans, ...completed].reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const totalProfit = [...plans, ...completed].reduce((s, p) => s + (parseFloat(p.profit) || 0), 0);
  const totalWithdrawn = data.totalWithdrawn || 0;
  const profitPercent = totalInvested > 0 ? ((totalProfit / totalInvested) * 100).toFixed(1) : "0.0";
  const memberSince = data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "N/A";

  return (
    <div className="min-h-screen bg-[#080c18] text-white font-medium pb-16">

      {/* ── REINVEST POPUP ────────────────────────────────────────────────── */}
      {showReinvest && completed.length > 0 && (
        <ReinvestPopup
          completedPlans={completed}
          onDismiss={() => setShowReinvest(false)}
        />
      )}

      {/* AMBIENT BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[600px] h-[600px] bg-emerald-500/8 blur-[150px] rounded-full top-[-150px] left-[-150px]" />
        <div className="absolute w-[400px] h-[400px] bg-teal-400/6 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      </div>

      {/* BALANCE CHANGE NOTIFICATION TOAST */}
      {notification && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[999] px-5 py-3 rounded-2xl shadow-2xl border text-sm font-semibold flex items-center gap-2 ${
          notification.type === "credit"
            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
            : "bg-red-500/20 border-red-500/40 text-red-400"
        }`}>
          {notification.type === "credit" ? <ArrowDownCircle size={16} /> : <ArrowUpCircle size={16} />}
          {notification.message}
        </div>
      )}

      {/* TICKER */}
      <div className="ticker-fixed">
        <div className="ticker-text">
          Welcome {data.name}! — Invest and grow your wealth today. — Start by choosing a plan. — Withdraw profits anytime — MexicaTrading is here for your financial success.
        </div>
      </div>

      <main className="relative z-10 pt-20 px-4 max-w-5xl mx-auto space-y-6 animate-fade-in">

        {/* ── GREETING ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest">{getGreeting()}</p>
            <h2 className="text-2xl font-bold mt-0.5">
              {data.name} <span className="text-emerald-400">👋</span>
            </h2>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-3 text-xs text-white/30 flex-wrap">
              {location.country && (
                <span className="flex items-center gap-1.5">
                  <Globe size={12} />
                  {flagEmoji(location.flag)} {location.country}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar size={12} />
                {t("dashboard.memberSince")} {memberSince}
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400/70">
                <BadgeCheck size={12} />
                {t("dashboard.verified")}
              </span>
              {lastUpdated && (
                <span className="flex items-center gap-1 text-white/20">
                  <RefreshCw size={10} />
                  {lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
            <button onClick={() => fetchDashboard(false)} disabled={refreshing}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            </button>
            <LanguageSelector />
          </div>
        </div>

        {/* ── EMAIL VERIFICATION BANNER ─────────────────────────────────────── */}
        {data && !data.isVerified && (
          <div className="flex items-center justify-between p-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/25 flex items-center justify-center text-xl">
                📧
              </div>
              <div>
                <p className="font-bold text-sm text-white">
                  Please verify your email address
                </p>
                <p className="text-yellow-400/70 text-xs mt-0.5">
                  Check your inbox for the verification link we sent you
                </p>
              </div>
            </div>
            <button
              onClick={handleResendVerification}
              className="text-xs px-3 py-1.5 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30 transition-all font-semibold whitespace-nowrap">
              Resend Email
            </button>
          </div>
        )}

        {/* ── REINVEST BANNER — shows when completed plans exist ───────────── */}
        {completed.length > 0 && (
          <div
            onClick={() => setShowReinvest(true)}
            className="cursor-pointer flex items-center justify-between p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/8 hover:bg-emerald-500/12 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-xl">
                🏆
              </div>
              <div>
                <p className="font-bold text-sm text-white">
                  {completed.length} plan{completed.length > 1 ? "s" : ""} completed — Ready to reinvest?
                </p>
                <p className="text-emerald-400/70 text-xs mt-0.5">
                  Tap to see your earnings and reinvest options
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <ChevronRight size={16} className="text-emerald-400" />
            </div>
          </div>
        )}

        {/* ── HERO PORTFOLIO CARD ───────────────────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden border border-white/8 bg-gradient-to-br from-emerald-500/10 via-white/[0.03] to-teal-500/5 p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { label: t("dashboard.totalBalance"), value: parseFloat(data.balance) || 0, prefix: "$", color: "text-white" },
              { label: t("dashboard.totalInvested"), value: totalInvested, prefix: "$", color: "text-blue-400" },
              { label: t("dashboard.totalProfit"), value: totalProfit, prefix: "$", color: "text-emerald-400" },
              { label: t("dashboard.totalWithdrawn"), value: totalWithdrawn, prefix: "$", color: "text-purple-400" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col gap-1">
                <p className="text-white/35 text-xs uppercase tracking-widest">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>
                  <CountUp end={s.value} prefix={s.prefix} />
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-5 border-t border-white/8 flex items-center justify-between flex-wrap gap-2">
            <div className={`flex items-center gap-1.5 text-sm font-semibold ${parseFloat(profitPercent) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              <TrendingUp size={14} />
              {profitPercent}% {t("dashboard.overallReturn")}
            </div>
            <span className="text-white/20 text-xs">
              {plans.length} {t("dashboard.activePlans")} · {completed.length} {t("dashboard.completedPlans")}
            </span>
          </div>
        </div>

        {/* ── STAT CARDS ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: t("dashboard.totalBalance"), value: `$${parseFloat(data.balance || 0).toLocaleString()}`, icon: <Wallet size={18} />, color: "text-white" },
            { label: t("dashboard.activePlans"), value: plans.length, icon: <Activity size={18} />, color: "text-blue-400" },
            { label: "Transactions", value: history.length, icon: <BarChart2 size={18} />, color: "text-purple-400" },
            { label: t("dashboard.totalProfit"), value: `$${totalProfit.toLocaleString()}`, icon: <DollarSign size={18} />, color: "text-emerald-400" },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-2xl border border-white/8 bg-white/[0.03] flex flex-col gap-3 hover:border-white/15 transition-all">
              <div className="flex justify-between items-start">
                <p className="text-white/35 text-xs uppercase tracking-widest">{stat.label}</p>
                <span className={`${stat.color} opacity-60`}>{stat.icon}</span>
              </div>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ── ACTION BUTTONS ────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate("/deposit")} className="btn-primary">
            <ArrowDownCircle size={16} /> {t("dashboard.deposit")}
          </button>
          <button onClick={() => navigate("/plans")} className="btn-primary">
            <TrendingUp size={16} /> {t("dashboard.plans")}
          </button>
          <button onClick={() => navigate("/withdraw")} className="btn-primary">
            <ArrowUpCircle size={16} /> {t("dashboard.withdraw")}
          </button>
        </div>

        {/* ── LIVE CHART ────────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest">{t("dashboard.liveMarket")}</h3>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </div>
          </div>
          <div className="rounded-2xl border border-white/8 overflow-hidden h-[420px]">
            <div id="tradingview-widget" style={{ height: "100%", width: "100%" }} />
          </div>
        </section>

        {/* ── ACTIVE PLANS ──────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest">{t("dashboard.activePlans")}</h3>
            {plans.length > 0 && (
              <button onClick={() => navigate("/plans")} className="text-xs text-emerald-400 flex items-center gap-1 hover:gap-2 transition-all">
                Add Plan <ChevronRight size={12} />
              </button>
            )}
          </div>

          {plans.length ? (
            <div className="flex gap-4 overflow-x-auto py-1 scroll-smooth snap-x snap-mandatory scrollbar-thin scrollbar-thumb-emerald-400/30 scrollbar-track-transparent">
              {plans.map((p, i) => {
                const start = new Date(p.createdAt);
                const end = new Date(p.endDate);
                const totalDays = p.duration;
                const daysPassed = Math.min(totalDays, Math.floor((Date.now() - start) / 86400000));
                const progress = Math.round((daysPassed / totalDays) * 100);
                const daysLeft = Math.max(0, Math.ceil((new Date(p.endDate) - new Date()) / (1000 * 60 * 60 * 24)));
                const roi = p.amount > 0 ? ((p.profit / p.amount) * 100).toFixed(1) : "0.0";
                return (
                  <div key={i} className="min-w-[270px] flex-shrink-0 snap-start rounded-2xl border border-white/8 bg-white/[0.03] p-5 flex flex-col gap-4 hover:border-emerald-500/30 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white">{p.plan}</h4>
                        <p className="text-white/30 text-xs mt-0.5">Ends {end.toDateString()}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${progress < 100 ? "bg-emerald-500/15 text-emerald-400" : "bg-green-500/15 text-green-400"}`}>
                        {progress < 100 ? t("dashboard.active") : t("dashboard.done")}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 shrink-0">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15" stroke="#ffffff08" strokeWidth="3" fill="none" />
                          <circle cx="18" cy="18" r="15" stroke="#10b981" strokeWidth="3" fill="none"
                            strokeDasharray={2 * Math.PI * 15}
                            strokeDashoffset={2 * Math.PI * 15 - (2 * Math.PI * 15 * progress) / 100}
                            strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.2s ease-out" }} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-emerald-400">{progress}%</div>
                      </div>
                      <div className="flex flex-col gap-1.5 text-sm">
                        <div className="flex justify-between gap-6">
                          <span className="text-white/35 text-xs">{t("dashboard.invested")}</span>
                          <span className="font-semibold">${parseFloat(p.amount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between gap-6">
                          <span className="text-white/35 text-xs">{t("dashboard.profit")}</span>
                          <span className="font-semibold text-emerald-400">${parseFloat(p.profit).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between gap-6">
                          <span className="text-white/35 text-xs">{t("dashboard.roi")}</span>
                          <span className="font-semibold text-teal-400">{roi}%</span>
                        </div>
                      </div>
                    </div>
                    {progress < 100 ? (
                      <div className="flex items-center gap-2 text-xs text-white/40 border-t border-white/5 pt-3">
                        <Clock size={11} />
                        <span>{daysLeft} {t("dashboard.daysRemaining")}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-green-400 border-t border-white/5 pt-3">
                        <BadgeCheck size={11} />
                        <span>{t("dashboard.planCompleted")}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-white/8 bg-white/[0.02] text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <TrendingUp size={24} className="text-emerald-400 opacity-60" />
              </div>
              <p className="text-white font-semibold">{t("dashboard.noActivePlans")}</p>
              <p className="text-white/30 text-sm max-w-xs">{t("dashboard.noActivePlansDesc")}</p>
              <button onClick={() => navigate("/plans")} className="mt-1 px-5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm hover:bg-emerald-500/25 transition-all">
                {t("dashboard.browsePlans")}
              </button>
            </div>
          )}
        </section>

        {/* ── COMPLETED PLANS ───────────────────────────────────────────────── */}
        <section>
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">{t("dashboard.completedPlans")}</h3>
          {completed.length ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-emerald-400/30 scrollbar-track-transparent">
              {completed.map((p, i) => (
                <div key={i}
                  onClick={() => setShowReinvest(true)}
                  className="cursor-pointer flex items-center justify-between p-4 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                      <BadgeCheck size={16} className="text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{p.plan}</p>
                      <p className="text-white/30 text-xs">{t("dashboard.invested")} ${parseFloat(p.amount).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold text-sm">+${parseFloat(p.profit).toLocaleString()}</p>
                    <p className="text-emerald-400/50 text-xs font-medium">Tap to reinvest →</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-white/8 bg-white/[0.02] text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <ArrowUpCircle size={24} className="text-emerald-400 opacity-60" />
              </div>
              <p className="text-white font-semibold">{t("dashboard.noCompletedPlans")}</p>
              <p className="text-white/30 text-sm max-w-xs">{t("dashboard.noCompletedPlansDesc")}</p>
            </div>
          )}
        </section>

        {/* ── RECENT ACTIVITIES ─────────────────────────────────────────────── */}
        <section>
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">{t("dashboard.recentActivities")}</h3>
          {history.length ? (
            <div className="space-y-2">
              {history.map((h, i) => {
                const isDeposit = h.action === "Deposit";
                return (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-white/15 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDeposit ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                        {isDeposit ? <ArrowDownCircle size={16} className="text-emerald-400" /> : <ArrowUpCircle size={16} className="text-red-400" />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{h.action}</p>
                        <p className="text-white/30 text-xs">{new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                      </div>
                    </div>
                    <p className={`font-bold text-sm ${isDeposit ? "text-emerald-400" : "text-red-400"}`}>
                      {isDeposit ? "+" : "-"}${parseFloat(h.amount ?? 0).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-white/8 bg-white/[0.02] text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Wallet size={24} className="text-emerald-400 opacity-60" />
              </div>
              <p className="text-white font-semibold">{t("dashboard.noTransactions")}</p>
              <p className="text-white/30 text-sm max-w-xs">{t("dashboard.noTransactionsDesc")}</p>
              <button onClick={() => navigate("/deposit")} className="mt-1 px-5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm hover:bg-emerald-500/25 transition-all">
                {t("dashboard.makeFirstDeposit")}
              </button>
            </div>
          )}
        </section>

        {/* ── ACCOUNT INFO ──────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 flex flex-wrap gap-5">
          <div className="flex items-center gap-3 flex-1 min-w-[180px]">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg">
              {flagEmoji(location.flag)}
            </div>
            <div>
              <p className="text-white/30 text-xs uppercase tracking-widest">{t("dashboard.location")}</p>
              <p className="font-semibold text-sm mt-0.5">
                {location.country && location.country !== "Unknown" ? location.country : "Detecting..."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-1 min-w-[180px]">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Calendar size={16} className="text-blue-400" />
            </div>
            <div>
              <p className="text-white/30 text-xs uppercase tracking-widest">{t("dashboard.memberSince")}</p>
              <p className="font-semibold text-sm mt-0.5">{memberSince}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-1 min-w-[180px]">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <BadgeCheck size={16} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-white/30 text-xs uppercase tracking-widest">{t("dashboard.accountStatus")}</p>
              <p className="font-semibold text-sm mt-0.5 text-emerald-400">{t("dashboard.verified")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-1 min-w-[180px]">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <BarChart2 size={16} className="text-purple-400" />
            </div>
            <div>
              <p className="text-white/30 text-xs uppercase tracking-widest">{t("dashboard.overallRoi")}</p>
              <p className="font-semibold text-sm mt-0.5 text-purple-400">{profitPercent}%</p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
