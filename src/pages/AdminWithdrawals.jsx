import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpCircle, RefreshCw, Search, Check, X, Copy } from "lucide-react";
import { T, ThemeStyles, Button, Spinner, StatusPill, EmptyState, Banner, inputStyle } from "./system.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com";
const c = T.color;

/* details is stored as:
   "<address> | Label: <label> | Network fee: $1 | Send: $499"
   Older records are just the raw address. Parse defensively. */
const parseDetails = (raw = "") => {
  const parts = String(raw).split("|").map(s => s.trim());
  const out = { address: parts[0] || "—", label: "", fee: "", send: "" };
  parts.slice(1).forEach(p => {
    const [k, ...rest] = p.split(":");
    const v = rest.join(":").trim();
    const key = (k || "").trim().toLowerCase();
    if (key === "label") out.label = v;
    if (key === "network fee") out.fee = v;
    if (key === "send") out.send = v;
  });
  return out;
};

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [copied, setCopied] = useState(null);

  const token = sessionStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/withdrawals`, { headers });
      if (!res.ok) throw new Error("Failed to fetch withdrawals");
      const data = await res.json();
      setWithdrawals(data);
      setFiltered(data);
    } catch (err) {
      showMessage("Failed to load withdrawals.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWithdrawals(); }, []);

  useEffect(() => {
    let result = withdrawals;
    if (filter !== "all") result = result.filter(w => w.status === filter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(w =>
        w.user?.name?.toLowerCase().includes(q) ||
        w.user?.email?.toLowerCase().includes(q) ||
        w.method?.toLowerCase().includes(q) ||
        w.details?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, filter, withdrawals]);

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      const res = await fetch(`${API_URL}/api/withdrawals/${id}`, {
        method: "PUT", headers,
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setWithdrawals(prev => prev.map(w => w._id === id
        ? { ...w, status: action === "approve" ? "approved" : "rejected" } : w));
      showMessage(`Withdrawal ${action === "approve" ? "approved" : "rejected"}.`);
    } catch (err) {
      showMessage(err.message || "Action failed.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const copyAddress = async (id, addr) => {
    try {
      await navigator.clipboard.writeText(addr);
      setCopied(id);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      showMessage("Couldn't copy.", "error");
    }
  };

  const pending = withdrawals.filter(w => w.status === "pending").length;
  const approved = withdrawals.filter(w => w.status === "approved").length;
  const rejected = withdrawals.filter(w => w.status === "rejected").length;
  const pendingValue = withdrawals
    .filter(w => w.status === "pending")
    .reduce((s, w) => s + (Number(w.amount) || 0), 0);

  const money = (v) => Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const tone = (s) => s === "approved" ? "gain" : s === "pending" ? "brass" : "loss";

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
          <p className="eyebrow" style={{ marginBottom: 6 }}>Payouts</p>
          <h1 className="display" style={{ fontSize: T.size.xl, lineHeight: 1.1 }}>Withdrawals</h1>
          <p className="mono" style={{ fontSize: T.size.xs, color: c.text3, marginTop: 6 }}>
            {withdrawals.length} requests
          </p>
        </div>
        <button onClick={fetchWithdrawals} aria-label="Refresh"
          className="flex items-center justify-center shrink-0"
          style={{ width: 36, height: 36, background: c.fill, border: `1px solid ${c.line}`, color: c.text3 }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {/* ── Totals ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4" style={{ border: `1px solid ${c.line}`, marginBottom: T.space.xl }}>
        {[
          ["Awaiting you", String(pending), pending > 0 ? c.brass : c.text2],
          ["Pending value", `$${money(pendingValue)}`, pending > 0 ? c.brass : c.text2],
          ["Approved", String(approved), c.gain],
          ["Rejected", String(rejected), c.text2],
        ].map(([label, value, col], i) => (
          <div key={i} style={{
            padding: T.space.lg,
            borderLeft: i % 2 === 1 ? `1px solid ${c.line}` : "none",
            borderTop: i > 1 ? `1px solid ${c.line}` : "none",
          }} className="sm:border-l sm:border-t-0">
            <p className="eyebrow" style={{ marginBottom: 8 }}>{label}</p>
            <p className="mono tabular" style={{ fontSize: T.size.base, color: col }}>{value}</p>
          </div>
        ))}
      </div>

      {message.text && (
        <div style={{ marginBottom: T.space.lg }}>
          <Banner tone={message.type === "success" ? "gain" : "loss"} title={message.text} />
        </div>
      )}

      {/* ── Search ── */}
      <div style={{ position: "relative", marginBottom: T.space.md }}>
        <Search size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.text4 }} />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by user, method or address"
          style={{ ...inputStyle, paddingLeft: 36 }} />
      </div>

      {/* ── Filters ── */}
      <div className="flex overflow-x-auto" style={{ borderBottom: `1px solid ${c.line}`, marginBottom: T.space.xl, scrollbarWidth: "none" }}>
        {[["all", "All"], ["pending", "Pending"], ["approved", "Approved"], ["rejected", "Rejected"]].map(([val, label]) => {
          const on = filter === val;
          return (
            <button key={val} onClick={() => setFilter(val)}
              className="mono shrink-0"
              style={{
                padding: "11px 16px", fontSize: T.size.tiny,
                letterSpacing: ".14em", textTransform: "uppercase",
                color: on ? c.gain : c.text3,
                borderBottom: `2px solid ${on ? c.gain : "transparent"}`,
                marginBottom: -1, transition: "color .2s",
              }}>
              {label}
            </button>
          );
        })}
      </div>

      {/* ── List ── */}
      {filtered.length === 0 ? (
        <EmptyState icon={<ArrowUpCircle size={20} />} title="No withdrawals found"
          text="Try a different filter or search term." />
      ) : (
        <div style={{ border: `1px solid ${c.line}` }}>
          {filtered.map((w, i) => {
            const d = parseDetails(w.details);
            const isPending = w.status === "pending";
            return (
              <motion.div key={w._id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, .3) }}
                style={{
                  padding: T.space.lg,
                  borderBottom: i < filtered.length - 1 ? `1px solid ${c.lineSoft}` : "none",
                  borderLeft: `2px solid ${isPending ? c.brass : "transparent"}`,
                  opacity: isPending ? 1 : .7,
                }}>

                {/* user + status */}
                <div className="flex items-start justify-between gap-3" style={{ marginBottom: T.space.md }}>
                  <div style={{ minWidth: 0 }}>
                    <p className="truncate" style={{ fontSize: T.size.sm, color: c.text }}>
                      {w.user?.name || "Unknown user"}
                    </p>
                    <p className="mono truncate" style={{ fontSize: T.size.tiny, color: c.text4, marginTop: 2 }}>
                      {w.user?.email || "—"}
                    </p>
                  </div>
                  <StatusPill tone={tone(w.status)}>{w.status}</StatusPill>
                </div>

                {/* the number that matters */}
                <div className="flex items-baseline justify-between"
                  style={{ borderTop: `1px solid ${c.lineSoft}`, paddingTop: T.space.md, marginBottom: T.space.md }}>
                  <div>
                    <p className="eyebrow" style={{ marginBottom: 4 }}>
                      {d.send ? "Send this amount" : "Amount"}
                    </p>
                    <p className="mono tabular" style={{ fontSize: 22, color: isPending ? c.brass : c.text }}>
                      {d.send || `$${money(w.amount)}`}
                    </p>
                  </div>
                  <div className="text-right">
                    {d.send && (
                      <p className="mono tabular" style={{ fontSize: T.size.tiny, color: c.text4 }}>
                        Requested ${money(w.amount)}{d.fee ? ` · fee ${d.fee}` : ""}
                      </p>
                    )}
                    <p className="mono" style={{ fontSize: T.size.tiny, color: c.text3, marginTop: 4 }}>
                      {w.method || "—"} · {fmtDate(w.createdAt)}
                    </p>
                  </div>
                </div>

                {/* destination */}
                <div style={{ border: `1px solid ${c.line}`, padding: T.space.md, marginBottom: isPending ? T.space.md : 0 }}>
                  <div className="flex items-center justify-between gap-2" style={{ marginBottom: 6 }}>
                    <p className="eyebrow">{d.label ? `Destination · ${d.label}` : "Destination"}</p>
                    <button onClick={() => copyAddress(w._id, d.address)}
                      aria-label="Copy address"
                      className="flex items-center justify-center shrink-0"
                      style={{ width: 26, height: 26, background: c.fill, color: copied === w._id ? c.gain : c.text4 }}>
                      {copied === w._id ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                  <p className="mono" style={{ fontSize: T.size.tiny, color: c.text2, wordBreak: "break-all", lineHeight: 1.6 }}>
                    {d.address}
                  </p>
                </div>

                {/* actions */}
                {isPending ? (
                  <div className="flex" style={{ gap: 8 }}>
                    <Button variant="primary" onClick={() => handleAction(w._id, "approve")}
                      disabled={actionLoading === w._id + "approve"}
                      style={{ flex: 1 }}
                      icon={actionLoading === w._id + "approve"
                        ? <Spinner size={12} tone="#fff" /> : <Check size={13} />}>
                      Approve
                    </Button>
                    <Button variant="danger" onClick={() => handleAction(w._id, "reject")}
                      disabled={actionLoading === w._id + "reject"}
                      style={{ flex: 1 }}
                      icon={actionLoading === w._id + "reject"
                        ? <Spinner size={12} tone={c.loss} /> : <X size={13} />}>
                      Reject
                    </Button>
                  </div>
                ) : (
                  <p className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".14em", textTransform: "uppercase", color: c.text4 }}>
                    Processed — no action needed
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
