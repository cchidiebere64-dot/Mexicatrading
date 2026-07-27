import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Package, ArrowDownCircle, ArrowUpCircle,
  RefreshCw, Wrench, ChevronRight, X,
} from "lucide-react";
import { T, ThemeStyles, Button, Spinner, EmptyState, Banner, LedgerRow } from "./system.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com";
const c = T.color;

export default function AdminDashboardHome() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    users: 0, plans: 0, deposits: 0, withdrawals: 0,
    pendingDeposits: 0, pendingWithdrawals: 0, recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [fixLoading, setFixLoading] = useState(false);
  const [fixResult, setFixResult] = useState(null);
  const [confirmFix, setConfirmFix] = useState(false);

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

  const runFixStuckInvestments = async () => {
    setFixLoading(true);
    setFixResult(null);
    try {
      const adminToken = sessionStorage.getItem("adminToken");
      const res = await axios.post(
        `${API_URL}/api/admin/fix-stuck-investments`,
        {},
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      setFixResult(res.data);
      fetchStats();
    } catch (err) {
      console.error(err);
      setFixResult({ success: false, message: err.response?.data?.message || "Failed to run fix" });
    } finally {
      setFixLoading(false);
      setConfirmFix(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const num = (v) => Number(v || 0).toLocaleString();
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString(undefined, {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  }) : "—";

  const pendingTotal = stats.pendingDeposits + stats.pendingWithdrawals;

  if (loading) return (
    <div className="ui flex flex-col items-center justify-center gap-4" style={{ height: 260 }}>
      <ThemeStyles />
      <Spinner size={26} />
      <p className="mono" style={{ fontSize: T.size.xs, letterSpacing: ".2em", textTransform: "uppercase", color: c.text3 }}>
        Loading
      </p>
    </div>
  );

  if (error) return (
    <div className="ui" style={{ color: c.text }}>
      <ThemeStyles />
      <div style={{ border: `1px solid ${c.line}`, borderLeft: `2px solid ${c.loss}`, padding: T.space.xxl }}>
        <p className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".24em", textTransform: "uppercase", color: c.loss, marginBottom: 8 }}>
          Connection
        </p>
        <h2 className="display" style={{ fontSize: T.size.xl, marginBottom: 10 }}>Couldn't load the dashboard</h2>
        <p style={{ fontSize: T.size.sm, color: c.text3, lineHeight: 1.7, marginBottom: T.space.xl }}>{error}</p>
        <Button variant="outline" onClick={fetchStats}>Try again</Button>
      </div>
    </div>
  );

  return (
    <div className="ui" style={{ color: c.text }}>
      <ThemeStyles />

      {/* ── Header ── */}
      <div className="flex items-end justify-between gap-3" style={{ marginBottom: T.space.xl }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 6 }}>Overview</p>
          <h1 className="display" style={{ fontSize: T.size.xl, lineHeight: 1.1 }}>Dashboard</h1>
        </div>
        <button onClick={fetchStats} disabled={refreshing} aria-label="Refresh"
          className="flex items-center justify-center shrink-0"
          style={{ width: 36, height: 36, background: c.fill, border: `1px solid ${c.line}`, color: c.text3 }}>
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* ══ NEEDS YOU ══ */}
      <div style={{
        background: c.paper, color: c.paperInk, marginBottom: T.space.xl,
      }}>
        <div style={{ height: 3, background: pendingTotal > 0 ? "#A8752F" : "#2F6E48" }} />
        <div style={{ padding: T.space.xxl }}>
          <p className="mono" style={{
            fontSize: T.size.micro, letterSpacing: ".24em", textTransform: "uppercase",
            color: "rgba(14,16,19,.5)", marginBottom: 10,
          }}>
            Awaiting your action
          </p>

          {pendingTotal === 0 ? (
            <>
              <h2 className="display" style={{ fontSize: 30, lineHeight: 1.05, marginBottom: 8 }}>
                Nothing pending
              </h2>
              <p style={{ fontSize: T.size.sm, color: "rgba(14,16,19,.6)", lineHeight: 1.7 }}>
                All deposits and withdrawals are processed.
              </p>
            </>
          ) : (
            <>
              <h2 className="display tabular" style={{ fontSize: 44, lineHeight: 1, marginBottom: T.space.lg }}>
                {pendingTotal} {pendingTotal === 1 ? "request" : "requests"}
              </h2>

              <div style={{ borderTop: "1px solid rgba(14,16,19,.14)" }}>
                {[
                  ["Deposits to approve", stats.pendingDeposits, "/admin/deposits"],
                  ["Withdrawals to pay", stats.pendingWithdrawals, "/admin/withdrawals"],
                ].map(([label, value, path], i) => (
                  <button key={i} onClick={() => navigate(path)}
                    className="w-full flex items-center justify-between"
                    style={{
                      padding: "12px 0",
                      borderBottom: i === 0 ? "1px solid rgba(14,16,19,.09)" : "none",
                      textAlign: "left",
                    }}>
                    <span style={{ fontSize: T.size.sm, color: "rgba(14,16,19,.65)" }}>{label}</span>
                    <span className="flex items-center gap-2">
                      <span className="mono tabular" style={{
                        fontSize: T.size.base, fontWeight: 700,
                        color: value > 0 ? "#A8752F" : "rgba(14,16,19,.35)",
                      }}>
                        {value}
                      </span>
                      <ChevronRight size={13} style={{ color: "rgba(14,16,19,.35)" }} />
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ══ TOTALS ══ */}
      <p className="eyebrow" style={{ marginBottom: T.space.md }}>Platform</p>
      <div className="grid grid-cols-2 sm:grid-cols-4" style={{ border: `1px solid ${c.line}`, marginBottom: T.space.xl }}>
        {[
          ["Members", num(stats.users), Users, "/admin/users"],
          ["Plans", num(stats.plans), Package, "/admin/plans"],
          ["Deposits", num(stats.deposits), ArrowDownCircle, "/admin/deposits"],
          ["Withdrawals", num(stats.withdrawals), ArrowUpCircle, "/admin/withdrawals"],
        ].map(([label, value, Icon, path], i) => (
          <button key={i} onClick={() => navigate(path)}
            className="text-left hover-fill"
            style={{
              padding: T.space.lg,
              borderLeft: i % 2 === 1 ? `1px solid ${c.line}` : "none",
              borderTop: i > 1 ? `1px solid ${c.line}` : "none",
              transition: "background .2s",
            }}
            >
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <p className="eyebrow">{label}</p>
              <Icon size={12} style={{ color: c.text4 }} />
            </div>
            <p className="mono tabular" style={{ fontSize: T.size.lg, color: c.text }}>{value}</p>
          </button>
        ))}
      </div>

      {/* ══ RECENT ACTIVITY ══ */}
      <p className="eyebrow" style={{ marginBottom: T.space.md }}>Recent activity</p>
      {stats.recentActivity.length === 0 ? (
        <EmptyState icon={<RefreshCw size={20} />} title="No activity yet"
          text="Deposits, withdrawals and investments will appear here as they happen." />
      ) : (
        <div style={{ border: `1px solid ${c.line}`, marginBottom: T.space.xl }}>
          {stats.recentActivity.slice(0, 10).map((a, i, arr) => (
            <div key={i}
              className="flex items-center justify-between gap-3"
              style={{
                padding: T.space.lg,
                borderBottom: i < arr.length - 1 ? `1px solid ${c.lineSoft}` : "none",
              }}>
              <div style={{ minWidth: 0 }}>
                <p className="truncate" style={{ fontSize: T.size.sm, color: c.text }}>
                  {a.user || a.name || "Member"}
                </p>
                <p className="mono truncate" style={{ fontSize: T.size.tiny, color: c.text4, marginTop: 2 }}>
                  {a.action || a.type || "Activity"}{a.date ? ` · ${fmtDate(a.date)}` : ""}
                </p>
              </div>
              {a.amount != null && (
                <span className="mono tabular shrink-0" style={{ fontSize: T.size.sm, color: c.text2 }}>
                  ${Number(a.amount).toLocaleString()}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ══ MAINTENANCE ══ */}
      <p className="eyebrow" style={{ marginBottom: T.space.md }}>Maintenance</p>

      {fixResult && (
        <div style={{ marginBottom: T.space.md }}>
          <Banner tone={fixResult.success === false ? "loss" : "gain"}
            title={fixResult.message || "Done"}
            text={fixResult.fixed != null ? `${fixResult.fixed} investment(s) corrected` : undefined} />
        </div>
      )}

      <div style={{ border: `1px solid ${c.line}`, padding: T.space.lg }}>
        <div className="flex items-start gap-3" style={{ marginBottom: T.space.md }}>
          <Wrench size={15} style={{ color: c.text3, flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontSize: T.size.sm, color: c.text }}>Fix stuck investments</p>
            <p style={{ fontSize: T.size.xs, color: c.text4, marginTop: 3, lineHeight: 1.6 }}>
              Completes any investment that passed its maturity date without being closed by the cron job.
            </p>
          </div>
        </div>

        {!confirmFix ? (
          <Button variant="quiet" full onClick={() => setConfirmFix(true)}>
            Run the fix
          </Button>
        ) : (
          <div style={{ border: `1px solid rgba(192,138,62,.3)`, background: "rgba(192,138,62,.05)", padding: T.space.lg }}>
            <p style={{ fontSize: T.size.sm, color: c.brass, marginBottom: 8 }}>Run now?</p>
            <p style={{ fontSize: T.size.xs, color: c.text3, lineHeight: 1.7, marginBottom: T.space.lg }}>
              This credits matured investments to member balances. Safe to run, but it does move money —
              only run it if plans are genuinely stuck.
            </p>
            <div className="grid grid-cols-2" style={{ gap: 8 }}>
              <Button variant="quiet" onClick={() => setConfirmFix(false)}>Cancel</Button>
              <Button onClick={runFixStuckInvestments} disabled={fixLoading}
                icon={fixLoading ? <Spinner size={12} tone="#fff" /> : <Wrench size={12} />}>
                {fixLoading ? "Running" : "Run"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
