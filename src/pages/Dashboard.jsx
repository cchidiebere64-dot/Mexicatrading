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

    if (!token) {
      console.warn("🚫 No token found — redirecting to login...");
      navigate("/login");
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      console.error("❌ Dashboard fetch failed:", err.response?.data || err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ✅ Proper TradingView Chart Embed (reliable method)
 useEffect(() => {
  const container = document.getElementById("tradingview_advanced_chart");

  // Clean previous chart if any (important when React re-renders)
  if (container) container.innerHTML = "";

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
    hide_top_toolbar: false,
    allow_symbol_change: true,
    hide_legend: false,
  });

  if (container) container.appendChild(script);
}, []); // ✅ Only run once


  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 text-sm">
        Loading your dashboard...
      </div>
    );

  if (!data)
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-sm">
        Failed to load dashboard (check console for details)
      </div>
    );

  const plans = data.plans || [];
  const history = data.history || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm">
      {/* NAVBAR */}
      <header className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 shadow-sm fixed w-full top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-green-400" />
          <h1 className="text-sm font-bold text-emerald-600 tracking-wide">
            MexicaTrading
          </h1>
        </div>
      </header>

      {/* MAIN DASHBOARD CONTENT */}
      <main className="pt-16 p-4 max-w-5xl mx-auto space-y-6">

        {/* ✅ Live Trading Chart */}
        <section className="mt-6">
          <h3 className="text-sm font-bold mb-2">📈 Live Market Chart</h3>
          <div
            id="tradingview_advanced_chart"
            className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-2"
            style={{ height: "400px" }}
          >
            {/* The chart will be embedded here */}
          </div>
        </section>

        {/* Welcome */}
        <h2 className="text-base font-semibold mb-2">
          👋 Welcome, <span className="text-emerald-500">{data.name}</span>
        </h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-md shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium">Balance</h3>
              <Wallet size={14} className="text-emerald-500" />
            </div>
            <p className="text-lg font-bold mt-2 text-emerald-600">
              ${data.balance ?? 0}
            </p>
          </div>

          <div className="p-3 bg-white dark:bg-gray-800 rounded-md shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium">Active Plans</h3>
              <TrendingUp size={14} className="text-emerald-500" />
            </div>
            <p className="text-lg font-bold mt-2">{plans.length}</p>
          </div>

          <div className="p-3 bg-white dark:bg-gray-800 rounded-md shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium">Transactions</h3>
              <ArrowUpCircle size={14} className="text-emerald-500" />
            </div>
            <p className="text-lg font-bold mt-2">{history.length}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate("/deposit")}
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs shadow"
          >
            <ArrowDownCircle size={14} /> Deposit
          </button>

          <button
            onClick={() => navigate("/plans")}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs shadow"
          >
            <TrendingUp size={14} /> Plans
          </button>

          <button
            onClick={() => navigate("/withdraw")}
            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs shadow"
          >
            <ArrowUpCircle size={14} /> Withdraw
          </button>
        </div>

        {/* Active Plans */}
        <section>
          <h3 className="text-sm font-bold mb-2">📊 Active Plans</h3>
          {plans.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plans.map((plan, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm"
                >
                  <h4 className="text-sm font-semibold mb-1">
                    {plan.name || "Unnamed Plan"}
                  </h4>
                  <p className="text-xs text-gray-500">
                    Invested: ${plan.invested ?? 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    Profit: ${plan.profit ?? 0}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-xs">No active plans found</p>
          )}
        </section>

        {/* Recent Activity */}
        <section>
          <h3 className="text-sm font-bold mb-2">📜 Recent Activity</h3>
          {history.length > 0 ? (
            <div className="space-y-1">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm text-xs"
                >
                  <span>{item.action || "Unknown"}</span>
                  <span>
                    {item.date
                      ? new Date(item.date).toLocaleDateString()
                      : "N/A"}
                  </span>
                  <span
                    className={
                      item.action === "Deposit"
                        ? "text-emerald-500"
                        : "text-red-500"
                    }
                  >
                    ${item.amount ?? 0}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-xs">No recent activity yet</p>
          )}
        </section>
      </main>
    </div>
  );
}

