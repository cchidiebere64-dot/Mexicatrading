import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Users, TrendingUp, ArrowDownCircle, ArrowUpCircle,
  Activity, Clock, RefreshCw,
} from "lucide-react";

const API_URL = "https://mexicatradingbackend.onrender.com";

function StatCard({ label, value, icon, color, prefix = "", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-5 rounded-2xl border border-white/8 bg-white/[0.03] hover:border-white/15 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-white">
        {prefix}{typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </motion.div>
  );
}

export default function AdminDashboardHome() {
  const [stats, setStats] = useState({
    users: 0, plans: 0, deposits: 0, withdrawals: 0,
    pendingDeposits: 0, pendingWithdrawals: 0, recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const adminToken = sessionStorage.getItem("adminToken");
      if (!adminToken) throw new Error("Admin not logged in");

      const res = await axios.get(`${API_URL}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      setStats({
        users: res.data.users || 0,
        plans: res.data.plans || 0,
        deposits: res.data.deposits || 0,
        withdrawals: res.data.withdrawals || 0,
        pendingDeposits: res.data.pendingDeposits || 0,
        pendingWithdrawals: res.data.pendingWithdrawals || 0,
        recentActivity: Array.isArray(res.data.recentActivity) ? res.data.recentActivity : [],
      });
      setError("");
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError("Failed to load dashboard data. Please refresh.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-white/30 text-sm animate-pulse">Loading dashboard...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-400 text-sm">{error}</p>
        <button onClick={fetchStats} className="px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm hover:bg-emerald-500/30 transition">
          Retry
        </button>
      </div>
    );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Overview</h1>
          <p className="text-white/30 text-xs mt-0.5">Real-time platform statistics</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white text-sm transition-all"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.users} icon={<Users size={16} className="text-blue-400" />} color="bg-blue-500/10 border border-blue-500/20" delay={0} />
        <StatCard label="Active Plans" value={stats.plans} icon={<TrendingUp size={16} className="text-emerald-400" />} color="bg-emerald-500/10 border border-emerald-500/20" delay={0.1} />
        <StatCard label="Total Deposits" value={stats.deposits} prefix="$" icon={<ArrowDownCircle size={16} className="text-green-400" />} color="bg-green-500/10 border border-green-500/20" delay={0.2} />
        <StatCard label="Total Withdrawals" value={stats.withdrawals} prefix="$" icon={<ArrowUpCircle size={16} className="text-red-400" />} color="bg-red-500/10 border border-red-500/20" delay={0.3} />
      </div>

      {/* PENDING ALERTS */}
      {(stats.pendingDeposits > 0 || stats.pendingWithdrawals > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.pendingDeposits > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/5">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/25 flex items-center justify-center">
                <ArrowDownCircle size={18} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-yellow-400 font-semibold text-sm">{stats.pendingDeposits} Pending Deposit{stats.pendingDeposits !== 1 ? "s" : ""}</p>
                <p className="text-white/30 text-xs">Awaiting your approval</p>
              </div>
            </motion.div>
          )}
          {stats.pendingWithdrawals > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-4 rounded-2xl border border-orange-500/20 bg-orange-500/5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center">
                <ArrowUpCircle size={18} className="text-orange-400" />
              </div>
              <div>
                <p className="text-orange-400 font-semibold text-sm">{stats.pendingWithdrawals} Pending Withdrawal{stats.pendingWithdrawals !== 1 ? "s" : ""}</p>
                <p className="text-white/30 text-xs">Awaiting your approval</p>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* RECENT ACTIVITY */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest">Recent Activity</h2>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </div>
        </div>

        {!stats.recentActivity || stats.recentActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-white/8 bg-white/[0.02] text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Activity size={20} className="text-white/20" />
            </div>
            <p className="text-white/40 text-sm">No recent activity yet</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/8 overflow-hidden">
            <div className="grid grid-cols-4 px-4 py-3 bg-white/[0.03] border-b border-white/8">
              {["User", "Action", "Details", "Time"].map((h) => (
                <p key={h} className="text-white/30 text-xs font-semibold uppercase tracking-widest">{h}</p>
              ))}
            </div>
            <div className="divide-y divide-white/5">
              {stats.recentActivity.map((activity, i) => (
                <motion.div
                  key={activity._id || i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="grid grid-cols-4 px-4 py-3.5 hover:bg-white/[0.02] transition-all items-center"
                >
                  <p className="text-white text-sm font-medium truncate">{activity?.user?.name || "Unknown"}</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold w-fit ${
                    activity?.action?.includes("Deposit") ? "bg-emerald-500/15 text-emerald-400"
                    : activity?.action?.includes("Withdrawal") ? "bg-red-500/15 text-red-400"
                    : "bg-blue-500/15 text-blue-400"
                  }`}>
                    {activity?.action || "N/A"}
                  </span>
                  <p className="text-white/40 text-xs truncate pr-4">{activity?.details || "—"}</p>
                  <div className="flex items-center gap-1.5 text-white/30 text-xs">
                    <Clock size={11} />
                    {activity?.createdAt
                      ? new Date(activity.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
