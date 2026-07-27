import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Users, Activity, RefreshCw, ArrowUp, ArrowDown,
  ChevronRight, AlertCircle,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { T, ThemeStyles, Button, Spinner, EmptyState, LedgerRow } from "./system.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com/api";
const c = T.color;

/* Chart palette — semantic, not decorative */
const GAIN = "#3F8F5F";
const LOSS = "#B4553F";
const BRASS = "#C08A3E";
const GRID = "rgba(255,255,255,.06)";
const AXIS = "rgba(255,255,255,.28)";

function ChartTip({ active, payload, label, prefix = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: c.panelAlt, border: `1px solid ${c.line}`, padding: "10px 12px" }}>
      <p className="mono" style={{
        fontSize: T.size.micro, letterSpacing: ".16em", textTransform: "uppercase",
        color: c.text4, marginBottom: 6,
      }}>
        {label}
      </p>
      {payload.map((p, i) => (
        <p key={i} className="mono tabular" style={{ fontSize: T.size.xs, color: p.color }}>
          {p.name}: {prefix}{Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
}

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

  const money = (v) => Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
  const num = (v) => Number(v || 0).toLocaleString();

  if (loading) return (
    <div className="ui flex flex-col items-center justify-center gap-4" style={{ height: 260 }}>
      <ThemeStyles />
      <Spinner size={26} />
      <p className="mono" style={{ fontSize: T.size.xs, letterSpacing: ".2em", textTransform: "uppercase", color: c.text3 }}>
        Loading
      </p>
    </div>
  );

  if (!data) return (
    <div className="ui" style={{ color: c.text }}>
      <ThemeStyles />
      <div style={{ border: `1px solid ${c.line}`, borderLeft: `2px solid ${c.loss}`, padding: T.space.xxl }}>
        <AlertCircle size={20} style={{ color: c.loss, marginBottom: T.space.md }} />
        <h2 className="display" style={{ fontSize: T.size.xl, marginBottom: 10 }}>Couldn't load analytics</h2>
        <p style={{ fontSize: T.size.sm, color: c.text3, lineHeight: 1.7, marginBottom: T.space.xl }}>
          The server didn't return data. Try again in a moment.
        </p>
        <Button variant="outline" onClick={() => fetchData()}>Try again</Button>
      </div>
    </div>
  );

  const netFlow = (data.totalDeposits || 0) - (data.totalWithdrawals || 0);
  const pendingTotal = (data.pendingKYC || 0) + (data.pendingDeposits || 0) + (data.pendingWithdrawals || 0);

  const Delta = ({ v }) => {
    if (v == null || v === 0) return (
      <span className="mono" style={{ fontSize: T.size.tiny, color: c.text4 }}>—</span>
    );
    const up = v > 0;
    return (
      <span className="mono tabular flex items-center gap-1"
        style={{ fontSize: T.size.tiny, color: up ? GAIN : LOSS }}>
        {up ? <ArrowUp size={9} /> : <ArrowDown size={9} />}{Math.abs(v)}%
      </span>
    );
  };

  return (
    <div className="ui" style={{ color: c.text }}>
      <ThemeStyles />

      {/* ── Header ── */}
      <div className="flex items-end justify-between gap-3" style={{ marginBottom: T.space.xl }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 6 }}>Reporting</p>
          <h1 className="display" style={{ fontSize: T.size.xl, lineHeight: 1.1 }}>Analytics</h1>
          <p className="mono" style={{ fontSize: T.size.xs, color: c.text3, marginTop: 6 }}>
            Last 30 days
          </p>
        </div>
        <button onClick={() => fetchData(true)} disabled={refreshing} aria-label="Refresh"
          className="flex items-center justify-center shrink-0"
          style={{ width: 36, height: 36, background: c.fill, border: `1px solid ${c.line}`, color: c.text3 }}>
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* ══ NET POSITION — the headline number ══ */}
      <div style={{ background: c.paper, color: c.paperInk, marginBottom: T.space.xl }}>
        <div style={{ height: 3, background: netFlow >= 0 ? GAIN : LOSS }} />
        <div style={{ padding: T.space.xxl }}>
          <p className="mono" style={{
            fontSize: T.size.micro, letterSpacing: ".24em", textTransform: "uppercase",
            color: "rgba(14,16,19,.5)", marginBottom: 10,
          }}>
            Net position
          </p>
          <h2 className="display tabular" style={{ fontSize: 44, lineHeight: 1, marginBottom: T.space.lg }}>
            ${money(Math.abs(netFlow))}
            <span style={{ fontSize: 18, marginLeft: 8, color: "rgba(14,16,19,.45)" }}>
              {netFlow >= 0 ? "in" : "out"}
            </span>
          </h2>

          <div style={{ borderTop: "1px solid rgba(14,16,19,.14)" }}>
            <LedgerRow onPaper label="Deposits received" value={`$${money(data.totalDeposits)}`} accent="#2F6E48" />
            <LedgerRow onPaper label="Withdrawals paid" value={`$${money(data.totalWithdrawals)}`} accent="#8F3F2E" />
            <LedgerRow onPaper label="Profit credited" value={`$${money(data.totalProfitPaid)}`} last />
          </div>
        </div>
      </div>

      {/* ══ NEEDS ACTION ══ */}
      {pendingTotal > 0 && (
        <>
          <p className="eyebrow" style={{ marginBottom: T.space.md }}>Awaiting you</p>
          <div style={{ border: `1px solid ${c.line}`, marginBottom: T.space.xl }}>
            {[
              ["Verification", data.pendingKYC, "/admin/kyc"],
              ["Deposits", data.pendingDeposits, "/admin/deposits"],
              ["Withdrawals", data.pendingWithdrawals, "/admin/withdrawals"],
            ].filter(([, v]) => v > 0).map(([label, value, route], i, arr) => (
              <button key={label} onClick={() => navigate(route)}
                className="w-full flex items-center justify-between hover-fill"
                style={{
                  padding: T.space.lg,
                  borderBottom: i < arr.length - 1 ? `1px solid ${c.lineSoft}` : "none",
                  borderLeft: `2px solid ${BRASS}`,
                  textAlign: "left", transition: "background .2s",
                }}>
                <span style={{ fontSize: T.size.sm, color: c.text }}>{label}</span>
                <span className="flex items-center gap-2">
                  <span className="mono tabular" style={{ fontSize: T.size.base, color: BRASS }}>{value}</span>
                  <ChevronRight size={13} style={{ color: c.text4 }} />
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ══ KEY FIGURES ══ */}
      <p className="eyebrow" style={{ marginBottom: T.space.md }}>Key figures</p>
      <div className="grid grid-cols-2 sm:grid-cols-4" style={{ border: `1px solid ${c.line}`, marginBottom: T.space.xl }}>
        {[
          ["Members", num(data.totalUsers), data.userGrowth],
          ["Verified", num(data.verifiedUsers), null],
          ["Active plans", num(data.activePlans), data.activePlansGrowth],
          ["Referrals", num(data.totalReferrals), null],
        ].map(([label, value, delta], i) => (
          <div key={i} style={{
            padding: T.space.lg,
            borderLeft: i % 2 === 1 ? `1px solid ${c.line}` : "none",
            borderTop: i > 1 ? `1px solid ${c.line}` : "none",
          }} className="sm:border-l sm:border-t-0">
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <p className="eyebrow">{label}</p>
              {delta != null && <Delta v={delta} />}
            </div>
            <p className="mono tabular" style={{ fontSize: T.size.lg, color: c.text }}>{value}</p>
          </div>
        ))}
      </div>

      {/* ══ CASH FLOW ══ */}
      {Array.isArray(data.cashFlowData) && data.cashFlowData.length > 0 && (
        <>
          <div className="flex items-baseline justify-between" style={{ marginBottom: T.space.md }}>
            <p className="eyebrow">Cash flow · 14 days</p>
            <p className="mono flex items-center gap-3" style={{ fontSize: T.size.micro, color: c.text4 }}>
              <span className="flex items-center gap-1.5">
                <span style={{ width: 8, height: 2, background: GAIN, display: "inline-block" }} /> In
              </span>
              <span className="flex items-center gap-1.5">
                <span style={{ width: 8, height: 2, background: LOSS, display: "inline-block" }} /> Out
              </span>
            </p>
          </div>
          <div style={{ border: `1px solid ${c.line}`, padding: `${T.space.lg}px ${T.space.md}px ${T.space.md}px 0`, marginBottom: T.space.xl }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.cashFlowData} barGap={2}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="date" stroke={AXIS} tick={{ fontSize: 9, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} />
                <YAxis stroke={AXIS} tick={{ fontSize: 9, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} width={44} />
                <Tooltip content={<ChartTip prefix="$" />} cursor={{ fill: "rgba(255,255,255,.03)" }} />
                <Bar dataKey="deposits" name="In" fill={GAIN} />
                <Bar dataKey="withdrawals" name="Out" fill={LOSS} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* ══ MEMBER GROWTH ══ */}
      {Array.isArray(data.userGrowthData) && data.userGrowthData.length > 0 && (
        <>
          <p className="eyebrow" style={{ marginBottom: T.space.md }}>New members · 30 days</p>
          <div style={{ border: `1px solid ${c.line}`, padding: `${T.space.lg}px ${T.space.md}px ${T.space.md}px 0`, marginBottom: T.space.xl }}>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={data.userGrowthData}>
                <defs>
                  <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={GAIN} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={GAIN} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="date" stroke={AXIS} tick={{ fontSize: 9, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis stroke={AXIS} tick={{ fontSize: 9, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} width={30} allowDecimals={false} />
                <Tooltip content={<ChartTip />} cursor={{ stroke: GRID }} />
                <Area type="monotone" dataKey="users" name="Members" stroke={GAIN} strokeWidth={1.6} fill="url(#growthFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* ══ PLAN DISTRIBUTION ══ */}
      {Array.isArray(data.planDistribution) && data.planDistribution.length > 0 && (
        <>
          <p className="eyebrow" style={{ marginBottom: T.space.md }}>Active plans by tier</p>
          <div style={{ border: `1px solid ${c.line}`, marginBottom: T.space.xl }}>
            {(() => {
              const total = data.planDistribution.reduce((s, p) => s + (p.value || 0), 0) || 1;
              return data.planDistribution.map((p, i, arr) => {
                const pct = Math.round((p.value / total) * 100);
                return (
                  <div key={i} style={{
                    padding: T.space.lg,
                    borderBottom: i < arr.length - 1 ? `1px solid ${c.lineSoft}` : "none",
                  }}>
                    <div className="flex items-baseline justify-between" style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: T.size.sm, color: c.text }}>{p.name}</span>
                      <span className="mono tabular" style={{ fontSize: T.size.sm, color: c.text2 }}>
                        {p.value} <span style={{ color: c.text4 }}>· {pct}%</span>
                      </span>
                    </div>
                    <div style={{ height: 2, background: c.line }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: GAIN }} />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </>
      )}

      {/* ══ TOP INVESTORS ══ */}
      {Array.isArray(data.topInvestors) && data.topInvestors.length > 0 && (
        <>
          <p className="eyebrow" style={{ marginBottom: T.space.md }}>Largest investors</p>
          <div style={{ border: `1px solid ${c.line}`, marginBottom: T.space.xl }}>
            {data.topInvestors.map((u, i, arr) => (
              <div key={u._id || i}
                className="flex items-center justify-between gap-3"
                style={{
                  padding: T.space.lg,
                  borderBottom: i < arr.length - 1 ? `1px solid ${c.lineSoft}` : "none",
                }}>
                <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
                  <span className="mono tabular" style={{ fontSize: T.size.tiny, color: c.text4, minWidth: 18 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p className="truncate" style={{ fontSize: T.size.sm, color: c.text }}>{u.name}</p>
                    <p className="mono truncate" style={{ fontSize: T.size.tiny, color: c.text4, marginTop: 2 }}>
                      {u.email}
                    </p>
                  </div>
                </div>
                <span className="mono tabular shrink-0" style={{ fontSize: T.size.sm, color: GAIN }}>
                  ${money(u.totalInvested)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ══ RECENT ACTIVITY ══ */}
      <p className="eyebrow" style={{ marginBottom: T.space.md }}>Recent activity</p>
      {!Array.isArray(data.recentActivity) || data.recentActivity.length === 0 ? (
        <EmptyState icon={<Activity size={20} />} title="No activity yet"
          text="Transactions will appear here as members use the platform." />
      ) : (
        <div style={{ border: `1px solid ${c.line}` }}>
          {data.recentActivity.slice(0, 12).map((a, i, arr) => {
            const isIn = ["Deposit", "Profit", "Referral", "Bonus", "Credit"].includes(a.action);
            return (
              <div key={i}
                className="flex items-center justify-between gap-3"
                style={{
                  padding: T.space.lg,
                  borderBottom: i < arr.length - 1 ? `1px solid ${c.lineSoft}` : "none",
                }}>
                <div style={{ minWidth: 0 }}>
                  <p className="truncate" style={{ fontSize: T.size.sm, color: c.text }}>
                    {a.user || "Member"}
                  </p>
                  <p className="mono truncate" style={{ fontSize: T.size.tiny, color: c.text4, marginTop: 2 }}>
                    {a.action}{a.status ? ` · ${a.status}` : ""}
                    {a.date ? ` · ${new Date(a.date).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}` : ""}
                  </p>
                </div>
                {a.amount != null && (
                  <span className="mono tabular shrink-0" style={{ fontSize: T.size.sm, color: isIn ? GAIN : LOSS }}>
                    {isIn ? "+" : "−"}${money(a.amount)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
