import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowDownToLine, ArrowUpFromLine, TrendingUp,
  Users, Gift, Plus, Minus, RefreshCw, Receipt, Search,
} from "lucide-react";

const API_URL = "https://mexicatradingbackend.onrender.com";

/* Visual style per action type */
const STYLES = {
  Deposit:    { icon: ArrowDownToLine, color: "#10b981", sign: "+", label: "Deposit" },
  Withdrawal: { icon: ArrowUpFromLine, color: "#f59e0b", sign: "−", label: "Withdrawal" },
  Profit:     { icon: TrendingUp,      color: "#14b8a6", sign: "+", label: "Profit" },
  Referral:   { icon: Users,           color: "#a855f7", sign: "+", label: "Referral" },
  Bonus:      { icon: Gift,            color: "#3b82f6", sign: "+", label: "Bonus" },
  Credit:     { icon: Plus,            color: "#10b981", sign: "+", label: "Credit" },
  Debit:      { icon: Minus,           color: "#f43f5e", sign: "−", label: "Debit" },
};

const FILTERS = ["All", "Deposit", "Withdrawal", "Profit", "Referral", "Bonus"];

const statusStyle = (s) => ({
  approved: { bg: "rgba(16,185,129,.12)", bd: "rgba(16,185,129,.3)", tx: "#10b981" },
  pending:  { bg: "rgba(245,158,11,.12)", bd: "rgba(245,158,11,.3)", tx: "#f59e0b" },
  rejected: { bg: "rgba(244,63,94,.12)",  bd: "rgba(244,63,94,.3)",  tx: "#f43f5e" },
}[s] || { bg: "rgba(255,255,255,.06)", bd: "rgba(255,255,255,.12)", tx: "rgba(255,255,255,.5)" });

export default function History() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const [history, setHistory] = useState([]);
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_URL}/api/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data.history || []);
      setTotals(res.data.totals || res.data.summary || null);
    } catch (err) {
      console.error(err);
      setError("Couldn't load your history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const filtered = history.filter((h) => {
    const matchType = filter === "All" || h.action === filter;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      h.action?.toLowerCase().includes(q) ||
      h.method?.toLowerCase().includes(q) ||
      h.note?.toLowerCase().includes(q) ||
      String(h.amount).includes(q);
    return matchType && matchSearch;
  });

  const fmt = (n) =>
    Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fmtDate = (d) =>
    new Date(d).toLocaleString(undefined, {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit",
    });

  const count = totals?.count ?? history.length;

  return (
    <div className="min-h-screen bg-[#080c18] text-white pb-20" style={{ fontFamily: "'Montserrat',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Montserrat:wght@300;400;500;600;700&display=swap');
        :root{--em:#10b981;--teal:#14b8a6;}
        .serif{font-family:'Cormorant Garamond',serif;}
        .gradtext{background:linear-gradient(135deg,var(--em),var(--teal));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
        .grid-bg{background-image:linear-gradient(rgba(16,185,129,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,.03) 1px,transparent 1px);background-size:72px 72px;}
        .no-sb::-webkit-scrollbar{display:none;}
      `}</style>

      {/* background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[150px] top-[-140px] left-[-100px]" style={{ background: "rgba(16,185,129,.06)" }} />
        <div className="grid-bg absolute inset-0 opacity-40" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-20">

        {/* back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition mb-5">
          <ArrowLeft size={14} /> Back
        </button>

        {/* header */}
        <div className="flex items-end justify-between mb-7">
          <div>
            <h1 className="serif font-light" style={{ fontSize: "clamp(28px,6vw,44px)", lineHeight: 1.05 }}>
              Transaction <em className="gradtext" style={{ fontStyle: "italic" }}>History</em>
            </h1>
            <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,.4)" }}>
              {count} total record{count !== 1 ? "s" : ""}
            </p>
          </div>
          <button onClick={fetchHistory}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition shrink-0"
            style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.5)" }}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* totals */}
        {totals && (
          <div className="grid grid-cols-2 gap-3 mb-7">
            {[
              ["Balance", totals.balance, "#10b981"],
              ["Deposited", totals.deposited, "rgba(255,255,255,.85)"],
              ["Withdrawn", totals.withdrawn, "rgba(255,255,255,.85)"],
              ["Referral Earned", totals.referral, "#a855f7"],
            ].map(([label, val, col], i) => (
              <div key={i} className="p-4 rounded-2xl" style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)" }}>
                <p className="text-[10px] uppercase tracking-[.18em] mb-1.5" style={{ color: "rgba(255,255,255,.35)" }}>{label}</p>
                <p className="font-bold text-lg" style={{ color: col }}>${fmt(val)}</p>
              </div>
            ))}
          </div>
        )}

        {/* search */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,.25)" }} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search amount, method or note..."
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-white outline-none transition-all placeholder:text-white/25"
            style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}
          />
        </div>

        {/* filter tabs */}
        <div className="flex gap-2 overflow-x-auto no-sb pb-1 mb-6" style={{ scrollbarWidth: "none" }}>
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0"
              style={filter === f
                ? { background: "rgba(16,185,129,.15)", border: "1px solid rgba(16,185,129,.35)", color: "#10b981" }
                : { background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", color: "rgba(255,255,255,.45)" }}>
              {f}
            </button>
          ))}
        </div>

        {/* body */}
        {loading ? (
          <div className="flex justify-center py-14">
            <div className="w-9 h-9 border-4 rounded-full animate-spin" style={{ borderColor: "rgba(16,185,129,.25)", borderTopColor: "#10b981" }} />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-sm mb-4" style={{ color: "#f87171" }}>{error}</p>
            <button onClick={fetchHistory} className="px-6 py-2.5 rounded-xl text-xs font-semibold"
              style={{ background: "rgba(16,185,129,.15)", border: "1px solid rgba(16,185,129,.3)", color: "#10b981" }}>
              Try Again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Receipt size={30} style={{ color: "rgba(255,255,255,.15)" }} />
            <p className="text-sm" style={{ color: "rgba(255,255,255,.35)" }}>
              {history.length === 0 ? "No transactions yet" : "Nothing matches your filter"}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence initial={false}>
              {filtered.map((h, i) => {
                const s = STYLES[h.action] || { icon: Receipt, color: "#94a3b8", sign: "", label: h.action };
                const Icon = s.icon;
                const st = statusStyle(h.status);
                return (
                  <motion.div
                    key={h._id || i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.4) }}
                    className="p-4 rounded-2xl"
                    style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)" }}>

                    <div className="flex items-start gap-3.5">
                      {/* icon */}
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${s.color}14`, border: `1px solid ${s.color}44` }}>
                        <Icon size={18} style={{ color: s.color }} />
                      </div>

                      {/* middle */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <p className="text-sm font-semibold text-white">{s.label}</p>
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                            style={{ background: st.bg, border: `1px solid ${st.bd}`, color: st.tx }}>
                            {h.status}
                          </span>
                        </div>
                        {h.method && (
                          <p className="text-[11px] truncate" style={{ color: "rgba(255,255,255,.4)" }}>{h.method}</p>
                        )}
                        <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,.28)" }}>{fmtDate(h.date)}</p>
                      </div>

                      {/* amount */}
                      <div className="text-right shrink-0">
                        <p className="font-bold text-base whitespace-nowrap" style={{ color: s.color }}>
                          {s.sign}${fmt(h.amount)}
                        </p>
                      </div>
                    </div>

                    {/* note */}
                    {h.note && (
                      <p className="text-[11px] mt-3 pt-3 leading-relaxed"
                        style={{ borderTop: "1px solid rgba(255,255,255,.06)", color: "rgba(255,255,255,.42)" }}>
                        {h.note}
                      </p>
                    )}

                    {/* txid */}
                    {h.txid && (
                      <p className="text-[10px] mt-2 font-mono break-all" style={{ color: "rgba(255,255,255,.25)" }}>
                        TXID: {h.txid}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
