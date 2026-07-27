import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Search, TrendingUp } from "lucide-react";
import { T, ThemeStyles, Button, Spinner, StatusPill, EmptyState, inputStyle } from "./system.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com";
const c = T.color;

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

  const daysLeftOf = (endDate) => {
    const diff = new Date(endDate) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const progressOf = (createdAt, endDate) => {
    const total = new Date(endDate) - new Date(createdAt);
    const elapsed = Date.now() - new Date(createdAt);
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  };

  const active = investments.filter(i => i.status === "active").length;
  const completed = investments.filter(i => i.status === "completed").length;
  const totalInvested = investments.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const totalProfit = investments.reduce((s, i) => s + (Number(i.profit) || 0), 0);

  const money = (v) => Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });

  if (loading) return (
    <div className="ui flex flex-col items-center justify-center gap-4" style={{ height: 260 }}>
      <ThemeStyles />
      <Spinner size={26} />
      <p className="mono" style={{ fontSize: T.size.xs, letterSpacing: ".2em", textTransform: "uppercase", color: c.text3 }}>
        Loading
      </p>
    </div>
  );

  return (
    <div className="ui" style={{ color: c.text }}>
      <ThemeStyles />

      {/* ── Header ── */}
      <div className="flex items-end justify-between gap-3" style={{ marginBottom: T.space.xl }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 6 }}>Portfolio</p>
          <h1 className="display" style={{ fontSize: T.size.xl, lineHeight: 1.1 }}>Investments</h1>
          <p className="mono" style={{ fontSize: T.size.xs, color: c.text3, marginTop: 6 }}>
            {investments.length} records
          </p>
        </div>
        <button onClick={fetchInvestments} aria-label="Refresh"
          className="flex items-center justify-center shrink-0"
          style={{ width: 36, height: 36, background: c.fill, border: `1px solid ${c.line}`, color: c.text3 }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {/* ── Totals ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4" style={{ border: `1px solid ${c.line}`, marginBottom: T.space.xl }}>
        {[
          ["Active", String(active), c.gain],
          ["Completed", String(completed), c.text2],
          ["Invested", `$${money(totalInvested)}`, c.text],
          ["Profit paid", `+$${money(totalProfit)}`, c.gain],
        ].map(([label, value, tone], i) => (
          <div key={i} style={{
            padding: T.space.lg,
            borderLeft: i % 2 === 1 ? `1px solid ${c.line}` : "none",
            borderTop: i > 1 ? `1px solid ${c.line}` : "none",
          }} className="sm:border-l sm:border-t-0">
            <p className="eyebrow" style={{ marginBottom: 8 }}>{label}</p>
            <p className="mono tabular" style={{ fontSize: T.size.base, color: tone }}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div style={{ position: "relative", marginBottom: T.space.md }}>
        <Search size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.text4 }} />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by user, email or plan"
          style={{ ...inputStyle, paddingLeft: 36 }} />
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex" style={{ borderBottom: `1px solid ${c.line}`, marginBottom: T.space.xl }}>
        {[["all", "All"], ["active", "Active"], ["completed", "Completed"]].map(([val, label]) => {
          const on = filter === val;
          return (
            <button key={val} onClick={() => setFilter(val)}
              className="mono"
              style={{
                padding: "11px 16px",
                fontSize: T.size.tiny,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: on ? c.gain : c.text3,
                borderBottom: `2px solid ${on ? c.gain : "transparent"}`,
                marginBottom: -1,
                transition: "color .2s",
              }}>
              {label}
            </button>
          );
        })}
      </div>

      {/* ── List ── */}
      {filtered.length === 0 ? (
        <EmptyState icon={<TrendingUp size={20} />} title="No investments found"
          text="Try a different filter or search term." />
      ) : (
        <div style={{ border: `1px solid ${c.line}` }}>
          {filtered.map((inv, i) => {
            const daysLeft = daysLeftOf(inv.endDate);
            const progress = progressOf(inv.createdAt, inv.endDate);
            const isActive = inv.status === "active";
            const matured = isActive && daysLeft === 0;

            return (
              <motion.div key={inv._id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, .3) }}
                style={{
                  padding: T.space.lg,
                  borderBottom: i < filtered.length - 1 ? `1px solid ${c.lineSoft}` : "none",
                  borderLeft: `2px solid ${matured ? c.brass : isActive ? c.gain : "transparent"}`,
                  opacity: isActive ? 1 : .65,
                }}>

                {/* top row */}
                <div className="flex items-start justify-between gap-3" style={{ marginBottom: T.space.md }}>
                  <div style={{ minWidth: 0 }}>
                    <p className="truncate" style={{ fontSize: T.size.sm, color: c.text }}>
                      {inv.user?.name || "Unknown user"}
                    </p>
                    <p className="mono truncate" style={{ fontSize: T.size.tiny, color: c.text4, marginTop: 2 }}>
                      {inv.user?.email || "—"}
                    </p>
                  </div>
                  <StatusPill tone={matured ? "brass" : isActive ? "gain" : "neutral"}>
                    {matured ? "Matured" : isActive ? "Active" : "Completed"}
                  </StatusPill>
                </div>

                {/* figures */}
                <div className="grid grid-cols-2 sm:grid-cols-4"
                  style={{ borderTop: `1px solid ${c.lineSoft}`, paddingTop: T.space.md, gap: T.space.md }}>
                  {[
                    ["Plan", inv.plan, c.text2],
                    ["Invested", `$${money(inv.amount)}`, c.text],
                    ["Profit", `+$${money(inv.profit)}`, c.gain],
                    [isActive ? "Days left" : "Ended",
                      isActive ? (matured ? "Matured" : `${daysLeft}`) : fmtDate(inv.endDate),
                      matured ? c.brass : c.text2],
                  ].map(([label, value, tone], j) => (
                    <div key={j}>
                      <p className="eyebrow" style={{ marginBottom: 4 }}>{label}</p>
                      <p className="mono tabular truncate" style={{ fontSize: T.size.xs, color: tone }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* progress */}
                {isActive && (
                  <div style={{ marginTop: T.space.md }}>
                    <div className="flex items-baseline justify-between" style={{ marginBottom: 5 }}>
                      <span className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".16em", textTransform: "uppercase", color: c.text4 }}>
                        Progress
                      </span>
                      <span className="mono tabular" style={{ fontSize: T.size.tiny, color: c.text3 }}>{progress}%</span>
                    </div>
                    <div style={{ height: 2, background: c.line }}>
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                        transition={{ duration: .8, ease: "easeOut" }}
                        style={{ height: "100%", background: matured ? c.brass : c.gain }} />
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
