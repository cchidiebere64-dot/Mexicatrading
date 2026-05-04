import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, CheckCircle, RefreshCw, Search, Clock, TrendingUp, Filter } from "lucide-react";

const API_URL = "https://mexicatradingbackend.onrender.com";

export default function ActivePlans() {
  const [investments, setInvestments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const token = sessionStorage.getItem("adminToken");

  const fetchInvestments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/investments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setInvestments(Array.isArray(data) ? data : []);
      setFiltered(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch investments error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvestments(); }, []);

  useEffect(() => {
    let result = investments;
    if (filter !== "all") result = result.filter(i => i.status === filter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i =>
        i.plan?.toLowerCase().includes(q) ||
        i.user?.name?.toLowerCase().includes(q) ||
        i.user?.email?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, filter, investments]);

  const calculateDaysLeft = (endDate) => {
    const diff = new Date(endDate) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const calculateProgress = (createdAt, endDate) => {
    const total = new Date(endDate) - new Date(createdAt);
    const elapsed = Date.now() - new Date(createdAt);
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  };

  const active = investments.filter(i => i.status === "active").length;
  const completed = investments.filter(i => i.status === "completed").length;

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-white/30 text-sm animate-pulse">Loading investments...</p>
      </div>
    );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Active Plans</h1>
          <p className="text-white/30 text-xs mt-0.5">{investments.length} total investment records</p>
        </div>
        <button onClick={fetchInvestments} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white text-sm transition-all">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl border bg-emerald-500/10 border-emerald-500/20 flex items-center justify-between">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest">Active</p>
            <p className="text-emerald-400 text-2xl font-bold mt-1">{active}</p>
          </div>
          <Activity size={18} className="text-emerald-400" />
        </div>
        <div className="p-4 rounded-2xl border bg-blue-500/10 border-blue-500/20 flex items-center justify-between">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest">Completed</p>
            <p className="text-blue-400 text-2xl font-bold mt-1">{completed}</p>
          </div>
          <CheckCircle size={18} className="text-blue-400" />
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
          <input type="text" placeholder="Search by user or plan..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 text-sm placeholder:text-white/25 text-white" />
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3">
          <Filter size={14} className="text-white/25" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-transparent text-white/60 text-sm outline-none py-2 pr-2">
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Investments List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-white/8 bg-white/[0.02] text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <TrendingUp size={20} className="text-white/20" />
          </div>
          <p className="text-white/40 text-sm">No investments found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inv, i) => {
            const daysLeft = calculateDaysLeft(inv.endDate);
            const progress = calculateProgress(inv.createdAt, inv.endDate);
            const isActive = inv.status === "active";

            return (
              <motion.div key={inv._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className={`p-5 rounded-2xl border transition-all ${isActive ? "border-white/8 bg-white/[0.02] hover:border-emerald-500/20" : "border-white/5 bg-white/[0.01] opacity-75"}`}>

                <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                  {/* User Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                      {inv.user?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{inv.user?.name || "Unknown"}</p>
                      <p className="text-white/30 text-xs">{inv.user?.email || "—"}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                    isActive ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                    : "bg-blue-500/15 text-blue-400 border border-blue-500/25"
                  }`}>
                    {isActive ? "🟢 Active" : "✅ Completed"}
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Plan</p>
                    <p className="text-white font-semibold text-sm">{inv.plan}</p>
                  </div>
                  <div>
                    <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Invested</p>
                    <p className="text-white font-semibold text-sm">${Number(inv.amount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Profit</p>
                    <p className="text-emerald-400 font-bold text-sm">+${Number(inv.profit).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-white/30 text-xs uppercase tracking-widest mb-1">
                      {isActive ? "Days Left" : "Completed On"}
                    </p>
                    {isActive ? (
                      <div className="flex items-center gap-1.5 text-sm">
                        <Clock size={13} className={daysLeft === 0 ? "text-red-400" : "text-white/50"} />
                        <span className={daysLeft === 0 ? "text-red-400 font-semibold" : "text-white font-semibold"}>
                          {daysLeft === 0 ? "Matured" : `${daysLeft} days`}
                        </span>
                      </div>
                    ) : (
                      <p className="text-white/50 text-sm">{new Date(inv.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {isActive && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-white/30">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
                        }
