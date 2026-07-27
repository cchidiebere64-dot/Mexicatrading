import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { X, AlertTriangle, Check, ArrowLeft, Clock, TrendingUp } from "lucide-react";
import {
  T, PageShell, Panel, Button, Field, inputStyle,
  LedgerRow, Banner, EmptyState, Spinner, StatusPill,
} from "./system.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com";
const c = T.color;

/* Tier notes. Matched by plan name — plans themselves come from your admin. */
const TIER_NOTE = {
  starter: "A place to begin. No pressure, no minimum barrier.",
  basic:   "For investors building a steady habit.",
  premium: "Our most chosen plan.",
  elite:   "For investors who already know what they want.",
  vip:     "Reserved for serious capital.",
};

export default function Plans() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const L = {
    days: t("common.days", "days"),
    min: t("plans.min", "Min"),
    max: t("plans.max", "Max"),
    returnLabel: t("plans.return", "return"),
    cancel: t("common.cancel", "Cancel"),
    processing: t("common.processing", "Processing"),
    insufficientBalance: t("common.insufficientBalance", "Insufficient balance"),
    depositFunds: t("common.depositFunds", "Deposit funds"),
    investmentSuccess: t("common.investmentSuccess", "Investment created successfully"),
    loading: t("common.loading", "Loading"),
    noPlans: t("common.noPlans", "No plans available"),
    noPlansDesc: t("common.noPlansDesc", "Investment plans will appear here once published."),
    enterValidAmount: t("plans.enterValidAmount", "Enter a valid amount."),
    minimumIs: t("plans.minimumIs", "Minimum is"),
    maximumIs: t("plans.maximumIs", "Maximum is"),
    transactionFailed: t("plans.transactionFailed", "Transaction failed. Please try again."),
    networkError: t("plans.networkError", "Network error. Please try again."),
    confirmInvestment: t("plans.confirmInvestment", "Confirm investment"),
    howMuch: t("plans.howMuch", "Amount to invest"),
    youWillEarn: t("plans.youWillEarn", "You will earn"),
  };

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [investAmount, setInvestAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [balanceCheck, setBalanceCheck] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${API_URL}/api/plans`);
        const data = await res.json();
        setPlans(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch plans:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const openModal = (plan) => {
    setActivePlan(plan);
    setInvestAmount(String(plan.minAmount));
    setAmountError("");
    setModalOpen(true);
    setMessage("");
    setBalanceCheck(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActivePlan(null);
    setInvestAmount("");
    setAmountError("");
    setBalanceCheck(null);
    setMessage("");
  };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setInvestAmount(val);
    setAmountError("");
    setBalanceCheck(null);
    setMessage("");
    const num = parseFloat(val);
    if (!val || isNaN(num)) {
      setAmountError(L.enterValidAmount);
    } else if (num < activePlan.minAmount) {
      setAmountError(`${L.minimumIs} $${Number(activePlan.minAmount).toLocaleString()}`);
    } else if (num > activePlan.maxAmount) {
      setAmountError(`${L.maximumIs} $${Number(activePlan.maxAmount).toLocaleString()}`);
    }
  };

  const handleConfirm = async () => {
    const amount = parseFloat(investAmount);
    if (!amount || isNaN(amount)) { setAmountError(L.enterValidAmount); return; }
    if (amount < activePlan.minAmount) { setAmountError(`${L.minimumIs} $${Number(activePlan.minAmount).toLocaleString()}`); return; }
    if (amount > activePlan.maxAmount) { setAmountError(`${L.maximumIs} $${Number(activePlan.maxAmount).toLocaleString()}`); return; }

    setConfirming(true);
    try {
      const token = sessionStorage.getItem("token");
      const profileRes = await fetch(`${API_URL}/api/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
      const profileData = await profileRes.json();
      const balance = profileData.balance || 0;
      if (balance < amount) { setBalanceCheck("insufficient"); setConfirming(false); return; }

      const res = await fetch(`${API_URL}/api/investments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: activePlan.name, amount }),
      });
      const data = await res.json();
      if (res.ok) {
        setBalanceCheck("success");
        setMessage(L.investmentSuccess);
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setMessage(data.message || L.transactionFailed);
      }
    } catch {
      setMessage(L.networkError);
    } finally {
      setConfirming(false);
    }
  };

  const estimatedProfit = () => {
    const amt = parseFloat(investAmount);
    if (!amt || isNaN(amt) || !activePlan) return null;
    return ((amt * activePlan.profitRate) / 100).toFixed(2);
  };

  const money = (v) => Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const noteFor = (name) => TIER_NOTE[(name || "").toLowerCase()] || "";

  if (loading) {
    return (
      <PageShell width={640}>
        <div className="flex flex-col items-center justify-center gap-4" style={{ padding: T.space.xxxl * 2 }}>
          <Spinner size={26} />
          <p className="mono" style={{ fontSize: T.size.xs, letterSpacing: ".2em", textTransform: "uppercase", color: c.text3 }}>
            {L.loading}
          </p>
        </div>
      </PageShell>
    );
  }

  const amt = parseFloat(investAmount) || 0;
  const profit = estimatedProfit();

  return (
    <PageShell width={640}>

      {/* ── Header ── */}
      <div style={{ marginBottom: T.space.xl }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Investment plans</p>
        <h1 className="display" style={{ fontSize: T.size.xxl, lineHeight: 1.05 }}>
          Choose your term
        </h1>
        <p style={{ fontSize: T.size.sm, color: c.text3, marginTop: 8, lineHeight: 1.7, maxWidth: 420 }}>
          Every plan returns your principal along with the profit at maturity. No hidden fees, no lock-in beyond the stated term.
        </p>
      </div>

      {/* ── Terms strip ── */}
      <div className="grid grid-cols-3" style={{ border: `1px solid ${c.line}`, marginBottom: T.space.xl }}>
        {[
          ["Principal", "Returned in full"],
          ["Profit", "Paid at maturity"],
          ["Withdrawals", "Within 24 hours"],
        ].map(([label, value], i) => (
          <div key={i} style={{ padding: T.space.lg, borderLeft: i > 0 ? `1px solid ${c.line}` : "none" }}>
            <p className="eyebrow" style={{ marginBottom: 6 }}>{label}</p>
            <p style={{ fontSize: T.size.xs, color: c.text2, lineHeight: 1.5 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Plans ── */}
      {plans.length === 0 ? (
        <EmptyState icon={<TrendingUp size={20} />} title={L.noPlans} text={L.noPlansDesc} />
      ) : (
        <div style={{ border: `1px solid ${c.line}` }}>
          {plans.map((plan, idx) => {
            const minProfit = Math.round((plan.minAmount * plan.profitRate) / 100);
            const note = noteFor(plan.name);
            return (
              <button key={plan._id} onClick={() => openModal(plan)}
                className="w-full text-left hover-fill"
                style={{
                  display: "block",
                  padding: T.space.xl,
                  borderBottom: idx < plans.length - 1 ? `1px solid ${c.line}` : "none",
                  transition: "background .2s",
                }}>

                <div className="flex items-start justify-between gap-4">
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="flex items-baseline gap-2.5" style={{ marginBottom: 4 }}>
                      <span className="mono tabular" style={{ fontSize: T.size.tiny, color: c.text4 }}>
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <h3 className="display" style={{ fontSize: T.size.xl, color: c.text }}>{plan.name}</h3>
                    </div>
                    {note && (
                      <p style={{ fontSize: T.size.xs, color: c.text3, marginBottom: 10, lineHeight: 1.6 }}>{note}</p>
                    )}
                    <p className="mono" style={{ fontSize: T.size.tiny, color: c.text4 }}>
                      ${Number(plan.minAmount).toLocaleString()} — ${Number(plan.maxAmount).toLocaleString()}
                      {"  ·  "}{plan.duration} {L.days}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="display tabular" style={{ fontSize: 30, color: c.gain, lineHeight: 1 }}>
                      {plan.profitRate}%
                    </p>
                    <p className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".16em", textTransform: "uppercase", color: c.text4, marginTop: 4 }}>
                      {L.returnLabel}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between"
                  style={{ marginTop: T.space.lg, paddingTop: T.space.md, borderTop: `1px solid ${c.lineSoft}` }}>
                  <span className="mono" style={{ fontSize: T.size.tiny, color: c.text3 }}>
                    ${Number(plan.minAmount).toLocaleString()} earns{" "}
                    <span className="tabular" style={{ color: c.gain }}>+${minProfit.toLocaleString()}</span>
                  </span>
                  <span className="mono" style={{ fontSize: T.size.tiny, letterSpacing: ".14em", textTransform: "uppercase", color: c.gain }}>
                    Invest →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <p style={{ fontSize: T.size.xs, color: c.text4, marginTop: T.space.lg, lineHeight: 1.7 }}>
        All investing carries risk. Only invest what you can afford, and read our terms before committing funds.
      </p>

      {/* ══════════ INVEST SHEET ══════════ */}
      {modalOpen && activePlan && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(8,9,11,.86)" }}>
          <div className="absolute inset-0" onClick={closeModal} />
          <div className="relative w-full sm:max-w-md z-10"
            style={{ background: c.panel, border: `1px solid ${c.line}`, maxHeight: "92vh", overflowY: "auto" }}>

            {/* header */}
            <div className="flex items-start justify-between"
              style={{ padding: T.space.xl, borderBottom: `1px solid ${c.line}` }}>
              <div>
                <p className="eyebrow" style={{ marginBottom: 4 }}>
                  {activePlan.duration} {L.days} · {activePlan.profitRate}% {L.returnLabel}
                </p>
                <h3 className="display" style={{ fontSize: T.size.xl }}>{activePlan.name}</h3>
              </div>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center shrink-0"
                style={{ background: c.fill, color: c.text3 }}>
                <X size={14} />
              </button>
            </div>

            <div style={{ padding: T.space.xl }}>

              {/* amount */}
              <Field label={L.howMuch}
                error={amountError}
                hint={`${L.min} $${Number(activePlan.minAmount).toLocaleString()}  ·  ${L.max} $${Number(activePlan.maxAmount).toLocaleString()}`}>
                <div style={{ position: "relative" }}>
                  <span className="mono" style={{
                    position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                    color: c.text3, fontSize: T.size.lg,
                  }}>$</span>
                  <input type="number" value={investAmount} onChange={handleAmountChange}
                    min={activePlan.minAmount} max={activePlan.maxAmount}
                    placeholder={`${activePlan.minAmount}`}
                    className="mono tabular"
                    style={{
                      ...inputStyle,
                      paddingLeft: 32,
                      fontSize: 22,
                      borderColor: amountError ? "rgba(180,85,63,.5)" : c.line,
                    }}
                    onFocus={(e) => { if (!amountError) e.target.style.borderColor = "rgba(63,143,95,.5)"; }}
                    onBlur={(e) => { e.target.style.borderColor = amountError ? "rgba(180,85,63,.5)" : c.line; }} />
                </div>
              </Field>

              {/* quick amounts */}
              <div className="grid grid-cols-3" style={{ border: `1px solid ${c.line}`, marginBottom: T.space.lg }}>
                {[
                  activePlan.minAmount,
                  Math.round((activePlan.minAmount + activePlan.maxAmount) / 2),
                  activePlan.maxAmount,
                ].map((v, i) => {
                  const active = parseFloat(investAmount) === v;
                  return (
                    <button key={i} type="button"
                      onClick={() => { setInvestAmount(String(v)); setAmountError(""); setBalanceCheck(null); setMessage(""); }}
                      className="mono tabular"
                      style={{
                        padding: "12px 4px",
                        fontSize: T.size.tiny,
                        borderLeft: i > 0 ? `1px solid ${c.line}` : "none",
                        background: active ? "rgba(63,143,95,.1)" : "transparent",
                        color: active ? c.gain : c.text3,
                        transition: "background .2s, color .2s",
                      }}>
                      ${Number(v).toLocaleString()}
                    </button>
                  );
                })}
              </div>

              {/* projection */}
              {profit && !amountError && (
                <div style={{ border: `1px solid ${c.line}`, padding: T.space.lg, marginBottom: T.space.lg }}>
                  <p className="eyebrow" style={{ marginBottom: 8 }}>{L.youWillEarn}</p>
                  <p className="display tabular" style={{ fontSize: 38, color: c.gain, lineHeight: 1, marginBottom: T.space.lg }}>
                    +${money(profit)}
                  </p>
                  <div style={{ borderTop: `1px solid ${c.lineSoft}` }}>
                    <LedgerRow label="Principal" value={`$${money(amt)}`} small />
                    <LedgerRow label="Profit" value={`+$${money(profit)}`} accent={c.gain} small />
                    <LedgerRow label="Returned at maturity" value={`$${money(amt + parseFloat(profit))}`} small last />
                  </div>
                  <p className="mono flex items-center gap-1.5" style={{ fontSize: T.size.tiny, color: c.text4, marginTop: 10 }}>
                    <Clock size={10} /> Matures in {activePlan.duration} {L.days}
                  </p>
                </div>
              )}

              {/* states */}
              {balanceCheck === "insufficient" && (
                <div style={{ marginBottom: T.space.lg }}>
                  <Banner tone="loss" title={L.insufficientBalance}
                    text="Top up your account to invest this amount." />
                </div>
              )}
              {balanceCheck === "success" && (
                <div style={{ marginBottom: T.space.lg }}>
                  <Banner tone="gain" title={message} text="Taking you to your dashboard…" />
                </div>
              )}
              {message && balanceCheck !== "success" && balanceCheck !== "insufficient" && (
                <div style={{ marginBottom: T.space.lg }}>
                  <Banner tone="loss" title={message} />
                </div>
              )}

              {/* actions */}
              <div className="flex gap-2">
                <Button variant="quiet" onClick={closeModal} style={{ flex: 1 }}>{L.cancel}</Button>
                {balanceCheck === "insufficient" ? (
                  <Button onClick={() => navigate("/deposit")} style={{ flex: 1 }}>{L.depositFunds}</Button>
                ) : (
                  <Button onClick={handleConfirm}
                    disabled={confirming || balanceCheck === "success" || !!amountError || !investAmount}
                    style={{ flex: 1, opacity: (confirming || balanceCheck === "success" || !!amountError || !investAmount) ? .5 : 1 }}
                    icon={confirming ? <Spinner size={13} tone="#fff" /> : null}>
                    {confirming ? L.processing : L.confirmInvestment}
                  </Button>
                )}
              </div>

              <p className="mono" style={{
                fontSize: T.size.micro, letterSpacing: ".14em", textTransform: "uppercase",
                color: c.text4, textAlign: "center", marginTop: T.space.lg,
              }}>
                Secured · Instant activation
              </p>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
