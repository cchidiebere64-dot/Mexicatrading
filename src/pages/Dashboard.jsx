import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";

export default function Dashboard() {
  const API_URL = "https://mexicatradingbackend.onrender.com";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch dashboard data
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
  }, []);

  // TradingView live chart embed
  useEffect(() => {
    const widgetContainer = document.getElementById("tradingview-widget");
    if (!widgetContainer) return;
    widgetContainer.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: "BINANCE:BTCUSDT",
      interval: "15",
      theme: "dark",
      style: "1",
      locale: "en",
      hide_top_toolbar: false,
      allow_symbol_change: true,
      hide_legend: false,
    });

    widgetContainer.appendChild(script);
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <div className="animate-pulse text-lg">Loading Dashboard...</div>
      </div>
    );

  if (!data)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error loading dashboard
      </div>
    );

 const plans = (data.plans || []).filter(
  (p) => p.status?.toLowerCase().trim() === "active"
);

const completed = (data.plans || []).filter(
  (p) => p.status?.toLowerCase().trim() === "completed"
);

const history = data.history || [];


  return (
    <div className="min-h-screen bg-[#0b0f19] text-white font-medium pb-10">
      {/* TOP NAV */}
      <header className="fixed w-full top-0 z-20 backdrop-blur-lg bg-white/5 border-b border-white/10 px-5 py-3">
        <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
          MexicaTrading Dashboard
        </h1>
      </header>

      {/* TICKER */}
      <div className="ticker-fixed">
        <div className="ticker-text">
          Welcome {data.name}! — Invest and grow your wealth today. — Start by
          choosing a plan. — Withdraw profits anytime — MexicaTrading is here
          for your financial success.
        </div>
      </div>

      <main className="pt-20 px-4 max-w-5xl mx-auto animate-fade-in space-y-8">
        {/* Welcome */}
        <h2 className="text-xl font-semibold">
          Welcome back, <span className="text-emerald-400">{data.name}</span>
        </h2>

        {/* LIVE CHART */}
        <section>
          <div
            id="tradingview-widget"
            className="rounded-xl border border-white/10 h-[400px] shadow-glow"
          />
        </section>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Balance", value: `$${data.balance}`, icon: <Wallet /> },
            { label: "Active Plans", value: plans.length, icon: <TrendingUp /> },
            { label: "Transactions", value: history.length, icon: <ArrowUpCircle /> },
          ].map((stat, i) => (
            <div
              key={i}
              className="crypto-card p-5 rounded-xl border border-white/10 backdrop-blur-lg bg-white/5"
            >
              <div className="flex justify-between">
                {stat.label} <span className="text-emerald-400">{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ACTION BUTTONS */}
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

{/* ACTIVE PLANS */}
<section>
  <h3 className="section-title">Active Plans</h3>
  {plans.length ? (
    <div className="flex gap-4 overflow-x-auto py-2 scroll-smooth snap-x snap-mandatory scrollbar-thin scrollbar-thumb-emerald-400 scrollbar-track-white/10">
      {plans.map((p, i) => {
        const start = new Date(p.createdAt);
        const end = new Date(p.endDate);
        const totalDays = p.duration;
        const daysPassed = Math.min(
          totalDays,
          Math.floor((Date.now() - start) / 86400000)
        );
        const progress = Math.round((daysPassed / totalDays) * 100);

        return (
          <div
            key={i}
            className="crypto-card min-w-[250px] p-4 bg-white/5 border border-white/10 rounded-xl flex-shrink-0 flex flex-col gap-3 snap-start"
          >
            {/* PROGRESS + ROTATING ARC */}
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="18" r="15" stroke="#0f1720" strokeWidth="4" fill="none" />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  stroke="#10b981"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 15}
                  strokeDashoffset={2 * Math.PI * 15 - (2 * Math.PI * 15 * progress) / 100}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1s ease-out" }}
                />
                <circle
                  className="spinner-arc"
                  cx="18"
                  cy="18"
                  r="15"
                  stroke="#a7f3d0"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="12 90"
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  transform="rotate(-90 18 18)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                {progress}%
              </div>
            </div>

            {/* PLAN DETAILS */}
            <h4 className="font-bold text-lg text-emerald-400">{p.plan}</h4>
            <p>Invested: ${p.amount}</p>
            <p>Profit: <span className="text-emerald-300">${p.profit}</span></p>
            <p className="text-xs opacity-70">Ends {end.toDateString()}</p>

            {progress < 100 ? (
              <p className="mt-1 text-emerald-400">
                🔥 {Math.max(
                  0,
                  Math.ceil((new Date(p.endDate) - new Date()) / (1000 * 60 * 60 * 24))
                )}{" "}
                days left
              </p>
            ) : (
              <p className="mt-1 text-green-400 font-bold">✅ Completed</p>
            )}
          </div>
        );
      })}
    </div>
  ) : (
    <p className="opacity-60">No active plans</p>
  )}
</section>


        {/* COMPLETED PLANS */}
<section>
  <h3 className="section-title">Completed Plans</h3>
  {completed.length ? (
    <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-emerald-400 scrollbar-track-white/10 scroll-smooth">
      {completed.map((p, i) => (
        <div
          key={i}
          className="crypto-card opacity-75 border-green-500/20 p-4 bg-white/5 rounded-xl flex flex-col gap-1"
        >
          <h4 className="font-bold text-lg text-emerald-400">{p.plan}</h4>
          <p>Invested: ${p.amount}</p>
          <p>Profit Earned: <span className="text-emerald-300">${p.profit}</span></p>
        </div>
      ))}
    </div>
  ) : (
    <p className="opacity-60">No completed plans</p>
  )}
</section>

        {/* RECENT ACTIVITIES */}
        <section>
          <h3 className="section-title">Recent Activities</h3>
          {history.length ? (
            <div className="space-y-2">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="crypto-card p-3 flex justify-between items-center bg-white/5 border border-white/10 rounded-xl"
                >
                  <span>{h.action}</span>
                  <span>{new Date(h.date).toLocaleDateString()}</span>
                  <span
                    className={
                      h.action === "Deposit" ? "text-emerald-400" : "text-red-500"
                    }
                  >
                    ${h.amount ?? 0}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="opacity-60">No recent activity</p>
          )}
        </section>
      </main>
    </div>
  );
}



