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

  useEffect(() => { fetchDashboard(); }, []);

  // TradingView chart setup
  useEffect(() => {
  const container = document.getElementById("tradingview");
  if (!container) return;

  container.innerHTML = ""; // clear previous

  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
  script.async = true;
  
  script.text = JSON.stringify({
    autosize: true,
    symbol: "BINANCE:BTCUSDT",
    interval: "15",
    timezone: "Etc/UTC",
    theme: "dark",
    style: "1",
    locale: "en",
    toolbar_bg: "#0b0f19",
    enable_publishing: false,
    allow_symbol_change: true
  });

  container.appendChild(script);
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

  const plans = data.plans.filter((p) => p.status === "active");
  const completed = data.plans.filter((p) => p.status === "completed");
  const history = data.history || [];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white font-medium pb-10">

      {/* Top Navbar */}
      <header className="fixed w-full top-0 z-20 backdrop-blur-lg bg-white/5 border-b border-white/10 px-5 py-3">
        <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
          MexicaTrading Dashboard
        </h1>
      </header>

      <main className="pt-20 px-4 max-w-6xl mx-auto animate-fade-in space-y-8">

        {/* Welcome */}
        <h2 className="text-xl font-semibold">
          Welcome back, <span className="text-emerald-400">{data.name}</span>
        </h2>

        {/* Live TradingView Chart */}
        <section>
          <h3 className="text-sm font-bold mb-2">📈 Live Market Chart</h3>
          <div id="tradingview" className="rounded-xl border border-white/10 h-[380px] shadow-glow" />
        </section>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[{
            label: "Balance",
            value: `$${data.balance}`,
            icon: <Wallet size={20} className="text-emerald-400"/>
          },
          {
            label: "Active Plans",
            value: plans.length,
            icon: <TrendingUp size={20} className="text-emerald-400"/>
          },
          {
            label: "Transactions",
            value: history.length,
            icon: <ArrowUpCircle size={20} className="text-emerald-400"/>
          }].map((stat, i) => (
            <div key={i} className="crypto-card p-5 rounded-xl border border-white/10 backdrop-blur-lg bg-white/5 hover:scale-105 transition-transform duration-300">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs">{stat.label}</span>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate("/deposit")} className="btn-primary flex items-center gap-2">
            <ArrowDownCircle size={16}/> Deposit
          </button>
          <button onClick={() => navigate("/plans")} className="btn-primary flex items-center gap-2">
            <TrendingUp size={16}/> Plans
          </button>
          <button onClick={() => navigate("/withdraw")} className="btn-primary flex items-center gap-2">
            <ArrowUpCircle size={16}/> Withdraw
          </button>
        </div>

        {/* Active Plans */}
        <section>
          <h3 className="section-title">Active Plans</h3>
          {plans.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plans.map((p, i) => {
                const end = new Date(p.endDate);
                const daysLeft = Math.max(0, Math.ceil((end - Date.now()) / 86400000));
                return (
                  <div key={i} className="crypto-card p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md hover:scale-105 transition-transform duration-300">
                    <h4 className="font-bold text-lg text-emerald-400">{p.plan}</h4>
                    <p>Invested: ${p.amount}</p>
                    <p>Profit: <span className="text-emerald-300">${p.profit}</span></p>
                    <p className="text-xs opacity-70">Ends {end.toDateString()}</p>
                    <p className="mt-2">{daysLeft > 0 ? `🔥 ${daysLeft} days left` : "✅ Complete"}</p>
                  </div>
                );
              })}
            </div>
          ) : <p className="opacity-60">No active plans</p>}
        </section>

        {/* Completed Plans */}
        <section>
          <h3 className="section-title">Completed Plans</h3>
          {completed.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {completed.map((p, i) => (
                <div key={i} className="crypto-card p-4 rounded-xl border border-green-500/20 bg-white/5 backdrop-blur-md opacity-75 hover:scale-105 transition-transform duration-300">
                  <h4 className="font-bold text-emerald-400">{p.plan}</h4>
                  <p>Invested: ${p.amount}</p>
                  <p>Profit Earned: <span className="text-emerald-300">${p.profit}</span></p>
                  <p className="text-xs opacity-70">Completed</p>
                </div>
              ))}
            </div>
          ) : <p className="opacity-60">No completed plans</p>}
        </section>

        {/* Recent Activity */}
        <section>
          <h3 className="section-title">📜 Recent Activity</h3>
          {history.length ? (
            <div className="space-y-1">
              {history.map((item, i) => (
                <div key={i} className="crypto-card flex justify-between items-center p-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-xs">
                  <span>{item.action || "Unknown"}</span>
                  <span>{item.date ? new Date(item.date).toLocaleDateString() : "N/A"}</span>
                  <span className={item.action === "Deposit" ? "text-emerald-400" : "text-red-400"}>
                    ${item.amount ?? 0}
                  </span>
                </div>
              ))}
            </div>
          ) : <p className="opacity-60">No recent activity</p>}
        </section>

      </main>
    </div>
  );
}

