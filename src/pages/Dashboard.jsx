import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Wallet, TrendingUp, ArrowDownCircle, ArrowUpCircle,
  BadgeCheck, Globe, Calendar, ChevronRight,
  Activity, DollarSign, BarChart2, Clock,
} from "lucide-react";

// ── Animated number count-up ──────────────────────────────────────────────────
function CountUp({ end, prefix = "", duration = 1200 }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setValue(end); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end]);
  return <span>{prefix}{value.toLocaleString()}</span>;
}

// ── Greeting based on time of day ────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ── Detect country via IP ─────────────────────────────────────────────────────
async function detectCountry() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const d = await res.json();
    return { country: d.country_name, flag: d.country_code };
  } catch { return { country: "Unknown", flag: "" }; }
}

// ── Flag emoji from country code ──────────────────────────────────────────────
function flagEmoji(code) {
  if (!code) return "🌍";
  return code.toUpperCase().replace(/./g, c =>
    String.fromCodePoint(127397 + c.charCodeAt())
  );
}

export default function Dashboard() {
  const API_URL = "https://mexicatradingbackend.onrender.com";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState({ country: "", flag: "" });
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return navigate("/login");
    try {
      const res = await axios.get(`${API_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    detectCountry().then(setLocation);
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
        autosize: true,
        symbol: "BINANCE:BTCUSDT",
        interval: "15",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        allow_symbol_change: true,
        calendar: false,
        support_host: "https://www.tradingview.com",
      });
      container.appendChild(script);
    }, 100);
    return () => clearTimeout(timeout);
  }, [data]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#080c18] text-white gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-white/40 text-sm animate-pulse">Loading your portfolio...</p>
      </div>
    );

  if (!data)
    return (
      <div className="flex justify-center items-center h-screen bg-[#080c18] text-red-400 text-sm">
        Failed to load dashboard. Please refresh.
      </div>
    );

  // ── Derived data ──────────────────────────────────────────────────────────
  const plans = (data.plans || []).filter(p => p.status?.toLowerCase().trim() === "active");
  const completed = (data.plans || []).filter(p => p.status?.toLowerCase().trim() === "completed");
  const history = data.history || [];

  const totalInvested = [...plans, ...completed].reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const totalProfit = [...plans, ...completed].reduce((s, p) => s + (parseFloat(p.profit) || 0), 0);
  const totalWithdrawn = history.filter(h => h.action === "Withdrawal").reduce((s, h) => s + (parseFloat(h.amount) || 0), 0);
  const profitPercent = totalInvested > 0 ? ((totalProfit / totalInvested) * 100).toFixed(1) : "0.0";
  const memberSince = data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "N/A";

  return (
    <div className="min-h-screen bg-[#080c18] text-white font-medium pb-16">

      {/* AMBIENT BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[600px] h-[600px] bg-emerald-500/8 blur-[150px] rounded-full top-[-150px] left-[-150px]" />
        <div className="absolute w-[400px] h-[400px] bg-teal-400/6 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />
      </div>

      {/* TOP NAV */}
      <header className="fixed w-full top-0 z-20 backdrop-blur-xl bg-[#080c18]/80 border-b border-white/5 px-5 py-3 flex items-center justify-between">
        <h1 className="text-base font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent tracking-tight">
          MexicaTrading
        </h1>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </div>
      </header>

      {/* TICKER */}
      <div className="ticker-fixed">
        <div className="ticker-text">
          Welcome {data.name}! — Invest and grow your wealth today. — Start by choosing a plan. — Withdraw profits anytime — MexicaTrading is here for your financial success.
        </div>
      </div>

      <main className="relative z-10 pt-20 px-4 max-w-5xl mx-auto space-y-6 animate-fade-in">

        {/* ── GREETING + META ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest">{getGreeting()}</p>
            <h2 className="text-2xl font-bold mt-0.5">
              {data.name} <span className="text-emerald-400">👋</span>
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-white/30">
            {location.country && (
              <span className="flex items-center gap-1.5">
                <Globe size={12} />
                {flagEmoji(location.flag)} {location.country}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              Member since {memberSince}
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400/70">
              <BadgeCheck size={12} />
              Verified
            </span>
          </div>
        </div>

        {/* ── HERO PORTFOLIO CARD ──────────────────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden border border-white/8 bg-gradient-to-br from-emerald-500/10 via-white/[0.03] to-teal-500/5 p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { label: "Total Balance", value: parseFloat(data.balance) || 0, prefix: "$", color: "text-white" },
              { label: "Total Invested", value: totalInvested, prefix: "$", color: "text-blue-400" },
              { label: "Total Profit", value: totalProfit, prefix: "$", color: "text-emerald-400" },
              { label: "Total Withdrawn", value: totalWithdrawn, prefix: "$", color: "text-purple-400" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col gap-1">
                <p className="text-white/35 text-xs uppercase tracking-widest">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>
                  <CountUp end={s.value} prefix={s.prefix} />
                </p>
              </div>
            ))}
          </div>

          {/* Profit % indicator */}
          <div className="mt-5 pt-5 border-t border-white/8 flex items-center gap-3">
            <div className={`flex items-center gap-1.5 text-sm font-semibold ${parseFloat(profitPercent) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              <TrendingUp size={14} />
              {profitPercent}% overall return
            </div>
            <span className="text-white/20 text-xs">· {plans.length} active plan{plans.length !== 1 ? "s" : ""} · {completed.length} completed</span>
          </div>
        </div>

        {/* ── STAT CARDS ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Balance", value: `$${parseFloat(data.balance || 0).toLocaleString()}`, icon: <Wallet size={18} />, color: "text-white" },
            { label: "Active Plans", value: plans.length, icon: <Activity size={18} />, color: "text-blue-400" },
            { label: "Transactions", value: history.length, icon: <BarChart2 size={18} />, color: "text-purple-400" },
            { label: "Total Profit", value: `$${totalProfit.toLocaleString()}`, icon: <DollarSign size={18} />, color: "text-emerald-400" },
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

        {/* ── ACTION BUTTONS ───────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate("/deposit")} className="btn-primary">
            <ArrowDownCircle size={16} /> Deposit
          </button>
          <button onClick={() => navigate("/plans")} className="btn-primary">
            <TrendingUp size={16} /> Plans
          </button>
          <button onClick={() => navigate("/withdraw")} className="btn-primary">
            <ArrowUpCircle size={16} /> Withdraw
          </button>
        </div>

        {/* ── LIVE CHART ───────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest">Live Market</h3>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </div>
          </div>
          <div className="rounded-2xl border border-white/8 overflow-hidden h-[420px]">
            <div id="tradingview-widget" style={{ height: "100%", width: "100%" }} />
          </div>
        </section>

        {/* ── ACTIVE PLANS ─────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest">Active Plans</h3>
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

                    {/* Top row */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white">{p.plan}</h4>
                        <p className="text-white/30 text-xs mt-0.5">Ends {end.toDateString()}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${progress < 100 ? "bg-emerald-500/15 text-emerald-400" : "bg-green-500/15 text-green-400"}`}>
                        {progress < 100 ? "Active" : "Done"}
                      </span>
                    </div>

                    {/* Progress ring + stats */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 shrink-0">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15" stroke="#ffffff08" strokeWidth="3" fill="none" />
                          <circle
                            cx="18" cy="18" r="15"
                            stroke="#10b981" strokeWidth="3" fill="none"
                            strokeDasharray={2 * Math.PI * 15}
                            strokeDashoffset={2 * Math.PI * 15 - (2 * Math.PI * 15 * progress) / 100}
                            strokeLinecap="round"
                            style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-emerald-400">
                          {progress}%
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 text-sm">
                        <div className="flex justify-between gap-6">
                          <span className="text-white/35 text-xs">Invested</span>
                          <span className="font-semibold">${parseFloat(p.amount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between gap-6">
                          <span className="text-white/35 text-xs">Profit</span>
                          <span className="font-semibold text-emerald-400">${parseFloat(p.profit).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between gap-6">
                          <span className="text-white/35 text-xs">ROI</span>
                          <span className="font-semibold text-teal-400">{roi}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Days left */}
                    {progress < 100 ? (
                      <div className="flex items-center gap-2 text-xs text-white/40 border-t border-white/5 pt-3">
                        <Clock size={11} />
                        <span>{daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-green-400 border-t border-white/5 pt-3">
                        <BadgeCheck size={11} />
                        <span>Plan completed</span>
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
              <p className="text-white font-semibold">No Active Plans Yet</p>
              <p className="text-white/30 text-sm max-w-xs">Start growing your wealth by choosing an investment plan tailored for you.</p>
              <button onClick={() => navigate("/plans")} className="mt-1 px-5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm hover:bg-emerald-500/25 transition-all">
                Browse Plans →
              </button>
            </div>
          )}
        </section>

        {/* ── COMPLETED PLANS ──────────────────────────────────────────────── */}
        <section>
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">Completed Plans</h3>
          {completed.length ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-emerald-400/30 scrollbar-track-transparent">
              {completed.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-white/15 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                      <BadgeCheck size={16} className="text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{p.plan}</p>
                      <p className="text-white/30 text-xs">Invested ${parseFloat(p.amount).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold text-sm">+${parseFloat(p.profit).toLocaleString()}</p>
                    <p className="text-white/25 text-xs">Profit</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-white/8 bg-white/[0.02] text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <ArrowUpCircle size={24} className="text-emerald-400 opacity-60" />
              </div>
              <p className="text-white font-semibold">No Completed Plans Yet</p>
              <p className="text-white/30 text-sm max-w-xs">Your completed investments and earned profits will appear here.</p>
            </div>
          )}
        </section>

        {/* ── RECENT ACTIVITIES ────────────────────────────────────────────── */}
        <section>
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">Recent Activities</h3>
          {history.length ? (
            <div className="space-y-2">
              {history.map((h, i) => {
                const isDeposit = h.action === "Deposit";
                return (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-white/15 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDeposit ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                        {isDeposit
                          ? <ArrowDownCircle size={16} className="text-emerald-400" />
                          : <ArrowUpCircle size={16} className="text-red-400" />
                        }
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
              <p className="text-white font-semibold">No Transactions Yet</p>
              <p className="text-white/30 text-sm max-w-xs">Your deposits, withdrawals and activity history will show up here.</p>
              <button onClick={() => navigate("/deposit")} className="mt-1 px-5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm hover:bg-emerald-500/25 transition-all">
                Make First Deposit →
              </button>
            </div>
          )}
        </section>

        {/* ── ACCOUNT INFO ─────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 flex flex-wrap gap-5">
          <div className="flex items-center gap-3 flex-1 min-w-[180px]">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg">
              {flagEmoji(location.flag)}
            </div>
            <div>
              <p className="text-white/30 text-xs uppercase tracking-widest">Location</p>
              <p className="font-semibold text-sm mt-0.5">{location.country || "Detecting..."}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-1 min-w-[180px]">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Calendar size={16} className="text-blue-400" />
            </div>
            <div>
              <p className="text-white/30 text-xs uppercase tracking-widest">Member Since</p>
              <p className="font-semibold text-sm mt-0.5">{memberSince}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-1 min-w-[180px]">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <BadgeCheck size={16} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-white/30 text-xs uppercase tracking-widest">Account Status</p>
              <p className="font-semibold text-sm mt-0.5 text-emerald-400">Verified</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-1 min-w-[180px]">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <BarChart2 size={16} className="text-purple-400" />
            </div>
            <div>
              <p className="text-white/30 text-xs uppercase tracking-widest">Overall ROI</p>
              <p className="font-semibold text-sm mt-0.5 text-purple-400">{profitPercent}%</p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
