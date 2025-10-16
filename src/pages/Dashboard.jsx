import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Wallet, TrendingUp, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

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

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading your dashboard...
      </div>
    );

  if (!data)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Failed to load dashboard (check console for details)
      </div>
    );

  const plans = data.plans || [];
  const history = data.history || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* NAVBAR */}
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 shadow-md">
        <div className="flex items-center space-x-3">
          {/* Placeholder logo */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-green-400" />
          <h1 className="text-2xl font-bold text-emerald-600">
            MESICA Trading
          </h1>
        </div>
      </header>

      {/* MAIN DASHBOARD CONTENT */}
      <main className="p-6 max-w-6xl mx-auto">
        {/* Welcome Section */}
        <h2 className="text-3xl font-bold mb-6">
          👋 Welcome back, <span className="text-emerald-500">{data.name}</span>
        </h2>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Current Balance</h3>
              <Wallet className="text-emerald-500" />
            </div>
            <p className="text-3xl font-bold mt-4 text-emerald-600">
              ${data.balance ?? 0}
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Active Plans</h3>
              <TrendingUp className="text-emerald-500" />
            </div>
            <p className="text-3xl font-bold mt-4">{plans.length}</p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Total Transactions</h3>
              <ArrowUpCircle className="text-emerald-500" />
            </div>
            <p className="text-3xl font-bold mt-4">{history.length}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-10">
          <button
            onClick={() => navigate("/deposit")}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg shadow transition"
          >
            <ArrowDownCircle size={18} />
            Deposit
          </button>

          <button
            onClick={() => navigate("/plans")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow transition"
          >
            <TrendingUp size={18} />
            Plans
          </button>

          <button
            onClick={() => navigate("/withdraw")}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow transition"
          >
            <ArrowUpCircle size={18} />
            Withdraw
          </button>
        </div>

        {/* Plans Section */}
        <section className="mb-10">
          <h3 className="text-2xl font-bold mb-4">📊 Active Plans</h3>
          {plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((plan, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition"
                >
                  <h4 className="text-xl font-semibold mb-2">
                    {plan.name || "Unnamed Plan"}
                  </h4>
                  <p>Invested: ${plan.invested ?? 0}</p>
                  <p>Profit: ${plan.profit ?? 0}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No active plans found</p>
          )}
        </section>

        {/* Recent Activity */}
        <section>
          <h3 className="text-2xl font-bold mb-4">📜 Recent Activity</h3>
          {history.length > 0 ? (
            <div className="space-y-2">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
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
            <p className="text-gray-500">No recent activity yet</p>
          )}
        </section>
      </main>
    </div>
  );
}
