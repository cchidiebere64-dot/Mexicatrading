import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownCircle, RefreshCw, Search, Check, X,
  Clock, CheckCircle, XCircle, Filter,
} from "lucide-react";

const API_URL = "https://mexicatradingbackend.onrender.com";

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState({ text: "", type: "" });

  const token = sessionStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/deposits`, { headers });
      if (!res.ok) throw new Error("Failed to fetch deposits");
      const data = await res.json();
      setDeposits(data);
      setFiltered(data);
    } catch (err) {
      console.error("Error fetching deposits:", err);
      showMessage("Failed to load deposits.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeposits(); }, []);

  useEffect(() => {
    let result = deposits;
    if (filter !== "all") result = result.filter(d => d.status === filter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(d =>
        d.user?.name?.toLowerCase().includes(q) ||
        d.user?.email?.toLowerCase().includes(q) ||
        d.method?.toLowerCase().includes(q) ||
        d.txid?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, filter, deposits]);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      const res = await fetch(`${API_URL}/api/admin/deposits/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setDeposits(prev =>
        prev.map(d => d._id === id ? { ...d, status: action === "approve" ? "approved" : "rejected" } : d)
      );
      showMessage(data.message || `Deposit ${action === "approve" ? "approved" : "rejected"} successfully.`);
    } catch (err) {
      showMessage(err.message || "Action failed.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const pending = deposits.filter(d => d.status === "pending").length;
  const approved = deposits.filter(d => d.status === "approved").length;
  const rejected = deposits.filter(d => d.status === "rejected").length;

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-white/30 text-sm animate-pulse">Loading deposits...</p>
      </div>
    );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Deposits</h1>
          <p className="text-white/30 text-xs mt-0.5">{deposits.length} total deposit requests</p>
        </div>
        <button onClick={fetchDeposits} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white text-sm transition-all">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending", value: pending, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", icon: <Clock size={16} className="text-yellow-400" /> },
          { label: "Approved", value: approved, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: <CheckCircle size={16} className="text-emerald-400" /> },
          { label: "Rejected", value: rejected, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: <XCircle size={16} className="text-red-400" /> },
        ].map((s, i) => (
          <div key={i} className={`p-4 rounded-2xl border ${s.bg} flex items-center justify-between`}>
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
            {s.icon}
          </div>
        ))}
      </div>

      {/* Message */}
      <AnimatePresence>
        {message.text && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`p-4 rounded-xl text-sm text-center font-medium border ${message.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search + Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
          <input type="text" placeholder="Search by user, method, TxID..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 text-sm placeholder:text-white/25 text-white" />
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3">
          <Filter size={14} className="text-white/25" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent text-white/60 text-sm outline-none py-2 pr-2">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Deposits List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-white/8 bg-white/[0.02] text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <ArrowDownCircle size={20} className="text-white/20" />
          </div>
          <p className="text-white/40 text-sm">No deposits found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d, i) => (
            <motion.div
              key={d._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="p-5 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-white/15 transition-all"
            >
              <div className="flex items-start justify-between flex-wrap gap-4">

                {/* Left — User Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                    {d.user?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{d.user?.name || "Unknown"}</p>
                    <p className="text-white/30 text-xs">{d.user?.email || "—"}</p>
                  </div>
                </div>

                {/* Right — Status Badge */}
                <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                  d.status === "pending" ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25"
                  : d.status === "approved" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                  : "bg-red-500/15 text-red-400 border border-red-500/25"
                }`}>
                  {d.status === "pending" ? "⏳ Pending" : d.status === "approved" ? "✅ Approved" : "❌ Rejected"}
                </span>
              </div>

              {/* Details Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/8">
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Amount</p>
                  <p className="text-emerald-400 font-bold">${Number(d.amount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Method</p>
                  <p className="text-white text-sm font-medium">{d.method || "—"}</p>
                </div>
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-1">TxID</p>
                  <p className="text-white/50 text-xs font-mono truncate">{d.txid || "—"}</p>
                </div>
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Date</p>
                  <p className="text-white/50 text-xs">
                    {d.createdAt ? new Date(d.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              {d.status === "pending" && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleAction(d._id, "approve")}
                    disabled={actionLoading === d._id + "approve"}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/25 transition-all disabled:opacity-50"
                  >
                    {actionLoading === d._id + "approve" ? (
                      <span className="w-3.5 h-3.5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                    ) : <Check size={14} />}
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(d._id, "reject")}
                    disabled={actionLoading === d._id + "reject"}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/15 border border-red-500/25 text-red-400 text-sm font-semibold hover:bg-red-500/25 transition-all disabled:opacity-50"
                  >
                    {actionLoading === d._id + "reject" ? (
                      <span className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                    ) : <X size={14} />}
                    Reject
                  </button>
                </div>
              )}
              {d.status !== "pending" && (
                <p className="text-white/20 text-xs mt-4">Processed — no further action required</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
