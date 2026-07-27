import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft, RefreshCw, Receipt, Search,
  ArrowDownToLine, ArrowUpFromLine, TrendingUp, Users, Gift, Plus, Minus,
} from "lucide-react";
import {
  T, PageShell, Panel, Button, EmptyState, Spinner, StatusPill, inputStyle,
} from "./system.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com";
const c = T.color;

/* Money in = gain, money out = loss. Icons stay quiet; the sign carries meaning. */
const KIND = {
  Deposit:    { icon: ArrowDownToLine,  dir: "in",  label: "Deposit" },
  Withdrawal: { icon: ArrowUpFromLine,  dir: "out", label: "Withdrawal" },
  Profit:     { icon: TrendingUp,       dir: "in",  label: "Profit" },
  Referral:   { icon: Users,            dir: "in",  label: "Referral" },
  Bonus:      { icon: Gift,             dir: "in",  label: "Bonus" },
  Credit:     { icon: Plus,             dir: "in",  label: "Credit" },
  Debit:      { icon: Minus,            dir: "out", label: "Debit" },
};

const FILTERS = ["All", "Deposit", "Withdrawal", "Profit", "Referral", "Bonus"];

const statusTone = (s) =>
  s === "approved" ? "gain" : s === "pending" ? "brass" : s === "rejected" ? "loss" : "neutral";

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

  const money = (n) =>
    Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });

  const fmtTime = (d) =>
    new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  /* Group entries by day — a ledger is read by date */
  const grouped = filtered.reduce((acc, h) => {
    const key = fmtDate(h.date);
    (acc[key] = acc[key] || []).push(h);
    return acc;
  }, {});

  const count = totals?.count ?? history.length;

  return (
    <PageShell width={720}>

      {/* ── Back ── */}
      <button onClick={() => navigate(-1)}
        className="mono flex items-center gap-2"
        style={{ fontSize: T.size.tiny, letterSpacing: ".14em", textTransform: "uppercase", color: c.text3, marginBottom: T.space.lg }}>
        <ArrowLeft size={12} /> Back
      </button>

      {/* ── Header ── */}
      <div className="flex items-end justify-between gap-3" style={{ marginBottom: T.space.xl }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 6 }}>Account ledger</p>
          <h1 className="display" style={{ fontSize: T.size.xxl, lineHeight: 1.05 }}>History</h1>
          <p className="mono" style={{ fontSize: T.size.xs, color: c.text3, marginTop: 8 }}>
            {count} {count === 1 ? "entry" : "entries"}
          </p>
        </div>
        <button onClick={fetchHistory} aria-label="Refresh"
          className="w-9 h-9 flex items-center justify-center shrink-0"
          style={{ background: c.fill, border: `1px solid ${c.line}`, color: c.text3 }}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* ── Totals — the statement summary ── */}
      {totals && (
        <div className="grid grid-cols-2 sm:grid-cols-4" style={{ border: `1px solid ${c.line}`, marginBottom: T.space.xl }}>
          {[
            ["Balance", totals.balance, c.text],
            ["Deposited", totals.deposited, c.text2],
            ["Withdrawn", totals.withdrawn, c.text2],
            ["Referral", totals.referral, c.gain],
          ].map(([label, val, tone], i) => (
            <div key={i}
              style={{
                padding: T.space.lg,
                borderLeft: i % 2 === 1 ? `1px solid ${c.line}` : "none",
                borderTop: i > 1 ? `1px solid ${c.line}` : "none",
              }}
              className="sm:border-l sm:border-t-0">
              <p className="eyebrow" style={{ marginBottom: 8 }}>{label}</p>
              <p className="mono tabular" style={{ fontSize: T.size.base, color: tone }}>${money(val)}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Search ── */}
      <div style={{ position: "relative", marginBottom: T.space.md }}>
        <Search size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.text4 }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search amount, method or note"
          style={{ ...inputStyle, paddingLeft: 36 }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(63,143,95,.5)")}
          onBlur={(e) => (e.target.style.borderColor = c.line)} />
      </div>

      {/* ── Filters ── */}
      <div className="flex overflow-x-auto" style={{ borderBottom: `1px solid ${c.line}`, marginBottom: T.space.xl, scrollbarWidth: "none" }}>
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <button key={f} onClick={() => setFilter(f)}
              className="mono shrink-0"
              style={{
                padding: "12px 16px",
                fontSize: T.size.tiny,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: active ? c.gain : c.text3,
                borderBottom: `2px solid ${active ? c.gain : "transparent"}`,
                marginBottom: -1,
                transition: "color .2s",
              }}>
              {f}
            </button>
          );
        })}
      </div>

      {/* ── Body ── */}
      {loading ? (
        <div className="flex justify-center" style={{ padding: T.space.xxxl }}><Spinner size={26} /></div>
      ) : error ? (
        <Panel>
          <p style={{ fontSize: T.size.sm, color: c.loss, marginBottom: T.space.lg }}>{error}</p>
          <Button variant="outline" onClick={fetchHistory}>Try again</Button>
        </Panel>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Receipt size={20} />}
          title={history.length === 0 ? "No entries yet" : "Nothing matches"}
          text={history.length === 0
            ? "Your deposits, withdrawals, profits and referral commission will be recorded here."
            : "Try a different filter or search term."}
        />
      ) : (
        <div>
          {Object.entries(grouped).map(([day, entries]) => (
            <div key={day} style={{ marginBottom: T.space.xl }}>

              {/* Date rule */}
              <div className="flex items-center gap-3" style={{ marginBottom: T.space.sm }}>
                <span className="mono" style={{ fontSize: T.size.tiny, letterSpacing: ".18em", textTransform: "uppercase", color: c.text3 }}>
                  {day}
                </span>
                <div style={{ flex: 1, borderBottom: `1px solid ${c.lineSoft}` }} />
              </div>

              <div style={{ border: `1px solid ${c.line}` }}>
                {entries.map((h, i) => {
                  const k = KIND[h.action] || { icon: Receipt, dir: "in", label: h.action };
                  const Icon = k.icon;
                  const isIn = k.dir === "in";
                  return (
                    <div key={h._id || i}
                      style={{
                        padding: T.space.lg,
                        borderBottom: i < entries.length - 1 ? `1px solid ${c.lineSoft}` : "none",
                      }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3" style={{ minWidth: 0 }}>
                          <Icon size={15} style={{ color: c.text4, flexShrink: 0, marginTop: 3 }} />
                          <div style={{ minWidth: 0 }}>
                            <div className="flex items-center gap-2" style={{ marginBottom: 3 }}>
                              <span style={{ fontSize: T.size.sm, color: c.text }}>{k.label}</span>
                              <StatusPill tone={statusTone(h.status)}>{h.status}</StatusPill>
                            </div>
                            <p className="mono" style={{ fontSize: T.size.tiny, color: c.text4 }}>
                              {fmtTime(h.date)}{h.method ? ` · ${h.method}` : ""}
                            </p>
                          </div>
                        </div>

                        <span className="mono tabular shrink-0"
                          style={{ fontSize: T.size.sm, color: isIn ? c.gain : c.loss }}>
                          {isIn ? "+" : "−"}${money(h.amount)}
                        </span>
                      </div>

                      {h.note && (
                        <p style={{
                          fontSize: T.size.xs, color: c.text3, lineHeight: 1.6,
                          marginTop: 10, paddingTop: 10, borderTop: `1px solid ${c.lineSoft}`,
                        }}>
                          {h.note}
                        </p>
                      )}

                      {h.txid && (
                        <p className="mono" style={{ fontSize: T.size.micro, color: c.text4, marginTop: 6, wordBreak: "break-all" }}>
                          TXID {h.txid}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
