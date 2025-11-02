import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Wallet,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import TradingViewWidget from "react-tradingview-widget";

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
    } catch (err) {
      console.error("Dashboard fetch error:", err.response?.data || err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
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

  const activePlans = (data.plans || []).filter((p) => p.status === "active");
  const completedPlans = (data.plans || []).filter((p) => p.status === "completed");
  const history = data.history || [];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white font-medium pb-10">

      {/* NAVBAR */}
      <header className="fixed w-full top-0 z-20 backdrop-blur-lg bg-white/5 border-b border-white/10 px-5 py-3">
        <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
          MexicaTrading Dashboard
        </h1>
      </header>

      <main className="pt-20 px-4 max-w-6xl mx-auto space-y-8">

        {/* Welcome */}
        <h2 className="text-xl font-semibold">
          Welcome back, <span className="text-emerald-400">{data.name}</span>
        </h2>

        {/* LIVE TRADINGVIEW CHART */}
        <section className="rounded-xl border border-white/10 h-[400px] shadow-glow overflow-hidden">
          <TradingViewWidget
            symbol="BINANCE:BTCUSDT"
            theme="dark"
            locale="en"
            autosize
            interval="15"
          />
        </section>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Balance", value: `$${data.balance}`, icon: <Wallet /> },
            { label: "Active Plans", value: activePlans.length, icon: <TrendingUp /> },
            { label: "Transactions", value: history.length, icon: <ArrowUpCircle /> },
          ].map((stat, i) => (
            <div key={i} className="crypto-card p-5 rounded-xl border border-white/10 backdrop-blur-lg bg-white/5">
              <div className="flex justify-between items-center text-xs font-medium">
                {stat.label} <span className="text-emerald-400">{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate("/deposit")} className="btn-primary flex items-center gap-2">
            <ArrowDownCircle size={16} /> Deposit
          </button>
          <button onClick={() => navigate("/plans")} className="btn-primary flex items-center gap-2">
            <TrendingUp size={16} /> Plans
          </button>
          <button onClick={() => navigate("/withdraw")} className="btn-primary flex items-center gap-2">
            <ArrowUpCircle size={16} /> Withdraw
          </button>
        </div>

        {/* Active Plans */}
        <section>
          <h3 className="section-title">Active Plans</h3>
          {activePlans.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activePlans.map((plan, i) => {
                const end = new Date(plan.endDate);
                const daysLeft = Math.max(0, Math.ceil((end - Date.now()) / 86400000));
                return (
                  <div key={i} className="crypto-card p-4 rounded-xl border border-white/10 backdrop-blur-lg bg-white/5">
                    <h4 className="font-bold text-lg text-emerald-400">{plan.plan}</h4>
                    <p>Invested: ${plan.amount}</p>
                    <p>Profit: <span className="text-emerald-300">${plan.profit}</span></p>
                    <p className="text-xs opacity-70">Ends {end.toDateString()}</p>
                    <p className="mt-2 font-semibold">{daysLeft > 0 ? `🔥 ${daysLeft} days left` : "✅ Complete"}</p>
                  </div>
                );
              })}
            </div>
          ) : <p className="opacity-60">No active plans</p>}
        </section>

        {/* Completed Plans */}
        <section>
          <h3 className="section-title">Completed Plans</h3>
          {completedPlans.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {completedPlans.map((plan, i) => (
                <div key={i} className="crypto-card p-4 rounded-xl border border-green-500/20 opacity-75 backdrop-blur-lg bg-white/5">
                  <h4 className="font-bold text-emerald-400">{plan.plan}</h4>
                  <p>Invested: ${plan.amount}</p>
                  <p>Profit Earned: <span className="text-emerald-300">${plan.profit}</span></p>
                  <p className="text-xs opacity-70">Ended: {new Date(plan.endDate).toDateString()}</p>
                  <p className="mt-1 font-semibold text-emerald-500">✅ Completed & Paid</p>
                </div>
              ))}
            </div>
          ) : <p className="opacity-60">No completed plans</p>}
        </section>

        {/* Recent Activities */}
        <section>
          <h3 className="section-title">Recent Activity</h3>
          {history.length ? (
            <div className="space-y-2">
              {history.map((item, i) => (
                <div key={i} className="crypto-card flex justify-between p-3 rounded-xl border border-white/10 backdrop-blur-lg bg-white/5 text-xs">
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
