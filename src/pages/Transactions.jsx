import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Receipt, RefreshCw } from "lucide-react";
import { T, PageShell, EmptyState, Spinner, StatusPill, Button } from "./system.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com";
const c = T.color;

const statusTone = (s) =>
  s === "approved" ? "gain" : s === "pending" ? "brass" : s === "rejected" ? "loss" : "neutral";

export default function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTransactions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/transactions`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (res.ok) setTransactions(Array.isArray(data) ? data : []);
      else setError(data?.message || "Couldn't load your transactions.");
    } catch (err) {
      console.error("Failed to fetch transactions", err);
      setError("Couldn't load your transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const money = (v) =>
    Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <PageShell width={680}>

      <button onClick={() => navigate(-1)}
        className="mono flex items-center gap-2"
        style={{ fontSize: T.size.tiny, letterSpacing: ".14em", textTransform: "uppercase", color: c.text3, marginBottom: T.space.lg }}>
        <ArrowLeft size={12} /> Back
      </button>

      <div className="flex items-end justify-between gap-3" style={{ marginBottom: T.space.xl }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 6 }}>Investment record</p>
          <h1 className="display" style={{ fontSize: T.size.xxl, lineHeight: 1.05 }}>Transactions</h1>
          <p className="mono" style={{ fontSize: T.size.xs, color: c.text3, marginTop: 8 }}>
            {transactions.length} {transactions.length === 1 ? "entry" : "entries"}
          </p>
        </div>
        <button onClick={fetchTransactions} aria-label="Refresh"
          className="flex items-center justify-center shrink-0"
          style={{ width: 36, height: 36, background: c.fill, border: `1px solid ${c.line}`, color: c.text3 }}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center" style={{ padding: T.space.xxxl }}>
          <Spinner size={26} />
        </div>
      ) : error ? (
        <div style={{ border: `1px solid ${c.line}`, borderLeft: `2px solid ${c.loss}`, padding: T.space.xl }}>
          <p style={{ fontSize: T.size.sm, color: c.loss, marginBottom: T.space.lg }}>{error}</p>
          <Button variant="outline" onClick={fetchTransactions}>Try again</Button>
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={<Receipt size={20} />}
          title="No transactions yet"
          text="Your investments will be recorded here once you start a plan."
          action={{ label: "Browse plans", onClick: () => navigate("/plans") }}
        />
      ) : (
        <div style={{ border: `1px solid ${c.line}` }}>
          {/* header row */}
          <div className="flex items-center justify-between"
            style={{ padding: `10px ${T.space.lg}px`, borderBottom: `1px solid ${c.line}`, background: c.fill }}>
            <span className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".2em", textTransform: "uppercase", color: c.text4 }}>
              Plan
            </span>
            <span className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".2em", textTransform: "uppercase", color: c.text4 }}>
              Amount
            </span>
          </div>

          {transactions.map((tx, i) => (
            <div key={tx._id || i}
              className="flex items-center justify-between gap-3"
              style={{
                padding: T.space.lg,
                borderBottom: i < transactions.length - 1 ? `1px solid ${c.lineSoft}` : "none",
              }}>
              <div style={{ minWidth: 0 }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: T.size.sm, color: c.text }}>{tx.plan || "—"}</span>
                  <StatusPill tone={statusTone(tx.status)}>{tx.status}</StatusPill>
                </div>
                <p className="mono" style={{ fontSize: T.size.tiny, color: c.text4 }}>
                  {fmtDate(tx.createdAt)}
                </p>
              </div>
              <span className="mono tabular shrink-0" style={{ fontSize: T.size.sm, color: c.text }}>
                ${money(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: T.size.xs, color: c.text4, marginTop: T.space.lg, lineHeight: 1.7 }}>
        Looking for deposits, withdrawals and referral commission?{" "}
        <button onClick={() => navigate("/history")} style={{ color: c.gain, textDecoration: "underline" }}>
          View your full history
        </button>
      </p>
    </PageShell>
  );
}
