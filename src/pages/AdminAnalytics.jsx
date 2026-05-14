import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Users, DollarSign, TrendingUp, TrendingDown, Activity, Crown,
  RefreshCw, ArrowUp, ArrowDown, Clock, CheckCircle, AlertCircle,
  ShieldCheck, Wallet, Gift, ChevronRight, BarChart3, PieChart,
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";

const API_URL = "https://mexicatradingbackend.onrender.com/api";

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const token = sessionStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    try {
      const res = await axios.get(`${API_URL}/admin/analytics`, { headers });
      setData(res.data);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
      <p className="text-white/30 text-sm animate-pulse">Loading analytics...</p>
    </div>
  );

  if (!data) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <AlertCircle size={32} className="text-red-400" />
      <p className="text-white/50 text-sm">Failed to load analytics data</p>
      <button onClick={() => fetchData()} className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm">
        Retry
      </button>
    </div>
  );

  const COLORS = ["#10b981", "#3b82f6", "#a855f7", "#f59e0b", "#ef4444"];

  // Stat cards data
  const stats = [
    {
      label: "Total Users",
      value: data.totalUsers || 0,
      change: data.userGrowth || 0,
      icon: Users,
      color: "blue",
      prefix: "",
    },
    {
      label: "Total Deposits",
      value: `$${(data.totalDeposits || 0).toLocaleString()}`,
      change: data.depositGrowth || 0,
      icon: ArrowDown,
      color: "emerald",
      prefix: "",
    },
    {
      label: "Total Withdrawals",
      value: `$${(data.totalWithdrawals || 0).toLocaleString()}`,
      change: data.withdrawalGrowth || 0,
      icon: ArrowUp,
      color: "amber",
      prefix: "",
    },
    {
      label: "Active Plans",
      value: data.activePlans || 0,
      change: data.activePlansGrowth || 0,
      icon: Activity,
      color: "purple",
      prefix: "",
    },
  ];

  // Action items
  const actions = [
    { label: "Pending KYC", value: data.pendingKYC || 0, color: "yellow", route: "/admin/kyc" },
    { label: "Pending Deposits", value: data.pendingDeposits || 0, color: "blue", route: "/admin/deposits" },
    { label: "Pending Withdrawals", value: data.pendingWithdrawals || 0, color: "amber", route: "/admin/withdrawals" },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 size={20} className="text-emerald-400" /> Analytics Overview
          </h1>
          <p className="text-white/30 text-xs mt-0.5">Real-time business insights · Last updated just now</p>
        </div>
        <button onClick={() => fetchData(true)} disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white text-sm transition-all">
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Action Items Banner */}
      {(data.pendingKYC + data.pendingDeposits + data.pendingWithdrawals) > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {actions.filter(a => a.value > 0).map(a => (
            <button key={a.label} onClick={() => navigate(a.route)}
              className={`p-4 rounded-2xl bg-${a.color}-500/10 border border-${a.color}-500/25 hover:bg-${a.color}-500/15 transition flex items-center justify-between group`}>
              <div className="text-left">
                <p className="text-white/50 text-xs uppercase tracking-widest font-bold mb-1">{a.label}</p>
                <p className={`text-${a.color}-400 text-2xl font-bold`}>{a.value}</p>
              </div>
              <ChevronRight size={18} className={`text-${a.color}-400 group-hover:translate-x-1 transition`} />
            </button>
          ))}
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-4 rounded-2xl bg-white/[0.03] border border-white/8">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/15 border border-${stat.color}-500/20 flex items-center justify-center`}>
                <stat.icon size={16} className={`text-${stat.color}-400`} />
              </div>
              {stat.change !== 0 && (
                <div className={`flex items-center gap-1 text-xs font-bold ${stat.change > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {stat.change > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {Math.abs(stat.change)}%
                </div>
              )}
            </div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">{stat.label}</p>
            <p className="text-white text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* User Growth Chart */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-bold text-sm">User Growth</h3>
              <p className="text-white/30 text-xs">Last 30 days</p>
            </div>
            <Users size={16} className="text-blue-400" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.userGrowthData || []}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="date" stroke="#ffffff30" fontSize={10} />
              <YAxis stroke="#ffffff30" fontSize={10} />
              <Tooltip contentStyle={{ background: "#0e1422", border: "1px solid #ffffff10", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} fill="url(#userGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Deposits vs Withdrawals */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-bold text-sm">Cash Flow</h3>
              <p className="text-white/30 text-xs">Deposits vs Withdrawals</p>
            </div>
            <Wallet size={16} className="text-emerald-400" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.cashFlowData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="date" stroke="#ffffff30" fontSize={10} />
              <YAxis stroke="#ffffff30" fontSize={10} />
              <Tooltip contentStyle={{ background: "#0e1422", border: "1px solid #ffffff10", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="deposits" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="withdrawals" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-white/50">Deposits</span></span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /><span className="text-white/50">Withdrawals</span></span>
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-bold text-sm">Plan Distribution</h3>
              <p className="text-white/30 text-xs">Active investments by plan</p>
            </div>
            <PieChart size={16} className="text-purple-400" />
          </div>
          {data.planDistribution && data.planDistribution.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <RePieChart>
                  <Pie data={data.planDistribution} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={3}>
                    {data.planDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0e1422", border: "1px solid #ffffff10", borderRadius: 12, fontSize: 12 }} />
                </RePieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {data.planDistribution.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-white/70 flex-1 truncate">{p.name}</span>
                    <span className="text-white font-bold">{p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-white/30 text-xs text-center py-12">No active plans yet</p>
          )}
        </div>

        {/* Top Investors */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-bold text-sm">Top Investors</h3>
              <p className="text-white/30 text-xs">Highest invested users</p>
            </div>
            <Crown size={16} className="text-amber-400" />
          </div>
          {data.topInvestors && data.topInvestors.length > 0 ? (
            <div className="space-y-2">
              {data.topInvestors.slice(0, 5).map((u, i) => (
                <div key={u._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    i === 0 ? "bg-amber-500/20 text-amber-400" :
                    i === 1 ? "bg-white/15 text-white/70" :
                    i === 2 ? "bg-orange-500/20 text-orange-400" :
                    "bg-white/5 text-white/50"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{u.name}</p>
                    <p className="text-white/30 text-[10px] truncate">{u.email}</p>
                  </div>
                  <p className="text-emerald-400 text-sm font-bold">${(u.totalInvested || 0).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/30 text-xs text-center py-12">No investors yet</p>
          )}
        </div>

      </div>

      {/* Recent Activity Feed */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-bold text-sm">Recent Activity</h3>
            <p className="text-white/30 text-xs">Latest transactions across the platform</p>
          </div>
          <Activity size={16} className="text-emerald-400" />
        </div>
        {data.recentActivity && data.recentActivity.length > 0 ? (
          <div className="divide-y divide-white/5">
            {data.recentActivity.slice(0, 10).map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  a.action === "Deposit" ? "bg-emerald-500/15 text-emerald-400" :
                  a.action === "Withdrawal" ? "bg-amber-500/15 text-amber-400" :
                  a.action === "Profit" ? "bg-blue-500/15 text-blue-400" :
                  "bg-purple-500/15 text-purple-400"
                }`}>
                  {a.action === "Deposit" ? <ArrowDown size={12} /> :
                    a.action === "Withdrawal" ? <ArrowUp size={12} /> :
                    a.action === "Profit" ? <TrendingUp size={12} /> :
                    <Activity size={12} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate">
                    {a.user} · {a.action}
                  </p>
                  <p className="text-white/30 text-[10px]">{new Date(a.date).toLocaleString()}</p>
                </div>
                <p className={`text-sm font-bold ${
                  a.action === "Deposit" || a.action === "Profit" ? "text-emerald-400" :
                  a.action === "Withdrawal" ? "text-amber-400" : "text-white"
                }`}>
                  {a.action === "Withdrawal" ? "-" : "+"}${(a.amount || 0).toLocaleString()}
                </p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  a.status === "approved" ? "bg-emerald-500/15 text-emerald-400" :
                  a.status === "pending" ? "bg-yellow-500/15 text-yellow-400" :
                  "bg-red-500/15 text-red-400"
                }`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/30 text-xs text-center py-12">No activity yet</p>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15">
          <CheckCircle size={14} className="text-emerald-400 mb-2" />
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">Verified Users</p>
          <p className="text-emerald-400 text-lg font-bold">{data.verifiedUsers || 0}</p>
        </div>
        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/15">
          <ShieldCheck size={14} className="text-blue-400 mb-2" />
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">KYC Approved</p>
          <p className="text-blue-400 text-lg font-bold">{data.kycApproved || 0}</p>
        </div>
        <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/15">
          <Gift size={14} className="text-purple-400 mb-2" />
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">Total Referrals</p>
          <p className="text-purple-400 text-lg font-bold">{data.totalReferrals || 0}</p>
        </div>
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15">
          <DollarSign size={14} className="text-amber-400 mb-2" />
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">Total Profit Paid</p>
          <p className="text-amber-400 text-lg font-bold">${(data.totalProfitPaid || 0).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
