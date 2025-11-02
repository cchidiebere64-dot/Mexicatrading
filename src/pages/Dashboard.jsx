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

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Load TradingView Chart
  useEffect(() => {
    const widget = document.getElementById("tradingview");
    if (!widget) return;
    widget.innerHTML = "";

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
    });

    widget.appendChild(script);
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

  // Filter plans
  const plans = (data.plans || []).filter((p) => p.status === "active");
  const completed = (data.plans || []).filter((p) => p.status === "completed");
  const history = data.history || [];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white font-medium pb-10">
      {/* NAVBAR */}
      <header className="fixed w-full top-0 z-20 backdrop-blur-lg bg-white/5 border-b border-white/10 px-5 py-3">
        <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
          MexicaTrading Dashboard
        </h1>
      </header>

      <main className="pt-20 px-4 max-w-5xl mx-auto space-y-8 animate-fade-in">
        <h2 className="text-xl font-semibold">
          Welcome back, <span className="text-emerald-400">{data.name}</span>
        </h2>

        {/* LIVE TRADING CHART */}
        <section>
          <h3 className="text-sm font-bold mb-2">📈 Live Market Chart</h3>
          <div
            id="tradingview"
            className="rounded-xl border border-white/10 h-[380px] shadow-glow"
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
              className="p-5 rounded-xl border border-white/10 backdrop-blur-lg bg-white/5"
            >
              <div className="flex justify-between items-center">
                <span>{stat.label}</span>
                <span className="text-emerald-400">{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/deposit")}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600"
          >
            <ArrowDownCircle size={16} /> Deposit
          </button>
          <button
            onClick={() => navigate("/plans")}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600"
          >
            <TrendingUp size={16} /> Plans
          </button>
          <button
            onClick={() => navigate("/withdraw")}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600"
          >
            <ArrowUpCircle size={16} /> Withdraw
          </button>
        </div>

        {/* ACTIVE PLANS */}
        <section>
          <h3 className="text-lg font-semibold mt-6 mb-2">📊 Active Plans</h3>
          {plans.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plans.map((p, i) => {
                const end = new Date(p.endDate);
                const daysLeft = Math.max(0, Math.ceil((end - Date.now()) / 86400000));
                return (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-lg"
                  >
                    <h4 className="text-emerald-400 font-bold text-lg">{p.plan}</h4>
                    <p>Invested: ${p.amount}</p>
                    <p>
                      Profit: <span className="text-emerald-300">${p.profit}</span>
                    </p>
                    <p className="text-xs opacity-70">Ends {end.toDateString()}</p>
                    <p className="mt-2 font-semibold">
                      {daysLeft > 0 ? `🔥 ${daysLeft} days left` : "✅ Complete"}
                    </p>
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
          <h3 className="text-lg font-semibold mt-6 mb-2">✅ Completed Plans</h3>
          {completed.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {completed.map((p, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-green-500/20 bg-white/5 backdrop-blur-lg opacity-75"
                >
                  <h4 className="text-emerald-400 font-bold">{p.plan}</h4>
                  <p>Invested: ${p.amount}</p>
                  <p>
                    Profit Earned: <span className="text-emerald-300">${p.profit}</span>
                  </p>
                  <p className="text-xs opacity-70">
                    Ended: {new Date(p.endDate).toDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="opacity-60">No completed plans</p>
          )}
        </section>

        {/* RECENT ACTIVITY */}
        <section>
          <h3 className="text-lg font-semibold mt-6 mb-2">📜 Recent Activity</h3>
          {history.length ? (
            <div className="space-y-2">
              {history.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10"
                >
                  <span>{item.action}</span>
                  <span>{item.date ? new Date(item.date).toLocaleDateString() : "N/A"}</span>
                  <span
                    className={item.action === "Deposit" ? "text-emerald-400" : "text-red-400"}
                  >
                    ${item.amount ?? 0}
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
