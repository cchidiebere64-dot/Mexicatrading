import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownCircle, RefreshCw, Search, Check, X, Copy } from "lucide-react";
import { T, ThemeStyles, Button, Spinner, StatusPill, EmptyState, Banner, inputStyle } from "./system.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com";
const c = T.color;

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState([]);
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

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/deposits`, { headers });
      if (!res.ok) throw new Error("Failed to fetch deposits");
      const data = await res.json();
      setDeposits(data);
      setFiltered(data);
    } catch (err) {
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

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      const res = await fetch(`${API_URL}/api/admin/deposits/${id}`, {
        method: "PUT", headers,
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDeposits(prev => prev.map(d => d._id === id
        ? { ...d, status: action === "approve" ? "approved" : "rejected" } : d));
      showMessage(
        action === "approve"
          ? "Deposit approved — balance credited and referral commission paid."
          : "Deposit rejected."
      );
    } catch (err) {
      showMessage(err.message || "Action failed.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const copyTxid = async (id, txid) => {
    try {
      await navigator.clipboard.writeText(txid);
      setCopied(id);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      showMessage("Couldn't copy.", "error");
    }
  };

  const pending = deposits.filter(d => d.status === "pending").length;
  const approved = deposits.filter(d => d.status === "approved").length;
  const rejected = deposits.filter(d => d.status === "rejected").length;
  const pendingValue = deposits
    .filter(d => d.status === "pending")
    .reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const approvedValue = deposits
    .filter(d => d.status === "approved")
    .reduce((s, d) => s + (Number(d.amount) || 0), 0);

  const money = (v) => Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const fmtTime = (d) => d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
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
          <p className="eyebrow" style={{ marginBottom: 6 }}>Incoming</p>
          <h1 className="display" style={{ fontSize: T.size.xl, lineHeight: 1.1 }}>Deposits</h1>
          <p className="mono" style={{ fontSize: T.size.xs, color: c.text3, marginTop: 6 }}>
            {deposits.length} requests
          </p>
        </div>
        <button onClick={fetchDeposits} aria-label="Refresh"
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
          ["Total credited", `$${money(approvedValue)}`, c.gain],
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
          placeholder="Search by user, method or transaction ID"
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
        <EmptyState icon={<ArrowDownCircle size={20} />} title="No deposits found"
          text="Try a different filter or search term." />
      ) : (
        <div style={{ border: `1px solid ${c.line}` }}>
          {filtered.map((d, i) => {
            const isPending = d.status === "pending";
            return (
              <motion.div key={d._id}
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
                      {d.user?.name || "Unknown user"}
                    </p>
                    <p className="mono truncate" style={{ fontSize: T.size.tiny, color: c.text4, marginTop: 2 }}>
                      {d.user?.email || "—"}
                    </p>
                  </div>
                  <StatusPill tone={tone(d.status)}>{d.status}</StatusPill>
                </div>

                {/* amount */}
                <div className="flex items-baseline justify-between"
                  style={{ borderTop: `1px solid ${c.lineSoft}`, paddingTop: T.space.md, marginBottom: d.txid ? T.space.md : 0 }}>
                  <div>
                    <p className="eyebrow" style={{ marginBottom: 4 }}>Amount to credit</p>
                    <p className="mono tabular" style={{ fontSize: 22, color: isPending ? c.brass : c.gain }}>
                      ${money(d.amount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="mono" style={{ fontSize: T.size.tiny, color: c.text3 }}>
                      {d.method || "—"}
                    </p>
                    <p className="mono" style={{ fontSize: T.size.tiny, color: c.text4, marginTop: 4 }}>
                      {fmtDate(d.createdAt)} · {fmtTime(d.createdAt)}
                    </p>
                  </div>
                </div>

                {/* txid */}
                {d.txid && (
                  <div style={{ border: `1px solid ${c.line}`, padding: T.space.md, marginBottom: isPending ? T.space.md : 0 }}>
                    <div className="flex items-center justify-between gap-2" style={{ marginBottom: 6 }}>
                      <p className="eyebrow">Transaction reference</p>
                      <button onClick={() => copyTxid(d._id, d.txid)}
                        aria-label="Copy reference"
                        className="flex items-center justify-center shrink-0"
                        style={{ width: 26, height: 26, background: c.fill, color: copied === d._id ? c.gain : c.text4 }}>
                        {copied === d._id ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                    <p className="mono" style={{ fontSize: T.size.tiny, color: c.text2, wordBreak: "break-all", lineHeight: 1.6 }}>
                      {d.txid}
                    </p>
                  </div>
                )}

                {/* actions */}
                {isPending ? (
                  <>
                    <div className="flex" style={{ gap: 8 }}>
                      <Button variant="primary" onClick={() => handleAction(d._id, "approve")}
                        disabled={actionLoading === d._id + "approve"}
                        style={{ flex: 1 }}
                        icon={actionLoading === d._id + "approve"
                          ? <Spinner size={12} tone="#fff" /> : <Check size={13} />}>
                        Approve
                      </Button>
                      <Button variant="danger" onClick={() => handleAction(d._id, "reject")}
                        disabled={actionLoading === d._id + "reject"}
                        style={{ flex: 1 }}
                        icon={actionLoading === d._id + "reject"
                          ? <Spinner size={12} tone={c.loss} /> : <X size={13} />}>
                        Reject
                      </Button>
                    </div>
                    <p style={{ fontSize: T.size.tiny, color: c.text4, marginTop: 10, lineHeight: 1.6 }}>
                      Confirm the payment landed before approving. Approving credits the balance and pays
                      referral commission — it can't be undone from here.
                    </p>
                  </>
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
