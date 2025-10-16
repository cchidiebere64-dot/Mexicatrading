import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Wallet,
  BarChart3,
  Clock,
  LogOut,
  Layers,
  Activity,
  User,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const API_URL = "https://mexicatradingbackend.onrender.com";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      console.warn("No token found — redirecting to login...");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      console.error("Dashboard fetch failed:", err.response?.data || err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;
  if (!data)
    return (
      <p className="text-center mt-10 text-red-500">
        ❌ Failed to load dashboard (check console)
      </p>
    );

  const plans = data.plans || [];
  const history = data.history || [];

  // Create dummy chart data from history (optional)
  const chartData = history.slice(0, 10).map((item, idx) => ({
    name: item.date ? new Date(item.date).toLocaleDateString() : `#${idx + 1}`,
    amount: item.amount ?? 0,
  }));

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-emerald-600 text-white flex flex-col justify-between p-6">
        <div>
          <h1 className="text-2xl font-bold mb-8 text-center">💹 MexicaTrading</h1>
          <nav className="space-y-4">
            <NavItem icon={<BarChart3 />} label="Dashboard" active />
            <NavItem icon={<Layers />} label="Plans" />
            <NavItem icon={<Wallet />} label="Deposit" />
            <NavItem icon={<Activity />} label="Withdraw" />
            <NavItem icon={<Clock />} label="History" />
            <NavItem icon={<User />} label="Profile" />
          </nav>
        </div>
        <button className="flex items-center gap-2 text-white/80 hover:text-white mt-6">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-emerald-600">
              Welcome, {data.name || "User"} 👋
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Here’s an overview of your investment performance.
            </p>
          </div>
        </header>

        {/* Balance Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <DashboardCard
            icon={<Wallet className="text-emerald-600" />}
            label="Total Balance"
            value={`$${data.balance?.toLocaleString() || 0}`}
          />
          <DashboardCard
            icon={<Layers className="text-blue-500" />}
            label="Active Plans"
            value={plans.length}
          />
          <DashboardCard
            icon={<Activity className="text-orange-500" />}
            label="Recent Transactions"
            value={history.length}
          />
        </section>

        {/* Chart Section */}
        {history.length > 0 && (
          <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="text-emerald-600" /> Activity Overview
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Active Plans */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow mb-8">
          <h3 className="text-xl font-semibold mb-4">📊 Active Plans</h3>
          {plans.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {plans.map((plan, idx) => (
                <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <h4 className="font-bold text-emerald-600">{plan.name || "Unnamed Plan"}</h4>
                  <p>Invested: ${plan.invested ?? 0}</p>
                  <p>Profit: ${plan.profit ?? 0}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No active plans found</p>
          )}
        </section>

        {/* Recent Activity */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
          <h3 className="text-xl font-semibold mb-4">📜 Recent Activity</h3>
          {history.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {history.map((item, idx) => (
                <div key={idx} className="flex justify-between py-2 text-sm">
                  <span>{item.action || "Unknown"}</span>
                  <span>{item.date ? new Date(item.date).toLocaleDateString() : "N/A"}</span>
                  <span
                    className={
                      item.action === "Deposit" ? "text-emerald-500" : "text-red-500"
                    }
                  >
                    ${item.amount ?? 0}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p>No recent activity yet</p>
          )}
        </section>
      </main>
    </div>
  );
}

/* ─────────────── Components ─────────────── */

function NavItem({ icon, label, active }) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition ${
        active
          ? "bg-white/20 font-semibold"
          : "hover:bg-white/10 text-white/80"
      }`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}

function DashboardCard({ icon, label, value }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">{icon}</div>
    </div>
  );
}
