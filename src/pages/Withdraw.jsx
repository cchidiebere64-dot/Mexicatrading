import { useState, useEffect } from "react";
import axios from "axios";
import {
  DollarSign, Wallet, ChevronDown, AlertTriangle, TrendingUp,
  ShieldCheck, Clock, Plus, Trash2, Check, Lock, ArrowLeft, X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  T, PageShell, Panel, Button, Field, inputStyle,
  LedgerRow, Banner, EmptyState, Spinner, StatusPill,
} from "./system.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com";
const c = T.color;

const METHODS = [
  { value: "USDT", label: "USDT (TRC20)", desc: "Tether on TRON network" },
  { value: "TON",  label: "TON Wallet",   desc: "Transfer via TON blockchain" },
  { value: "BTC",  label: "Bitcoin",      desc: "BTC network" },
  { value: "ETH",  label: "Ethereum",     desc: "ERC20 network" },
  { value: "Bank", label: "Bank Transfer", desc: "Direct bank account transfer" },
];

export default function Withdraw() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const [step, setStep] = useState("form"); // form | review | pin
  const [wallets, setWallets] = useState([]);
  const [hasPin, setHasPin] = useState(false);
  const [cooldownHours, setCooldownHours] = useState(24);
  const [fees, setFees] = useState({ DEFAULT: 1 });
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "", code: "" });

  // add-wallet sheet
  const [addOpen, setAddOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newMethod, setNewMethod] = useState("USDT");
  const [newAddress, setNewAddress] = useState("");
  const [confirmAddress, setConfirmAddress] = useState("");
  const [methodOpen, setMethodOpen] = useState(false);
  const [addBusy, setAddBusy] = useState(false);
  const [addErr, setAddErr] = useState("");

  // pin sheet
  const [pinOpen, setPinOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinBusy, setPinBusy] = useState(false);
  const [pinErr, setPinErr] = useState("");

  const loadWallets = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/wallets`, auth);
      setWallets(res.data.wallets || []);
      setHasPin(!!res.data.hasPin);
      setCooldownHours(res.data.cooldownHours || 24);
    } catch (err) {
      console.error("Load wallets failed", err);
    }
  };

  const loadFees = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/withdrawals/fees`, auth);
      if (res.data?.fees) setFees(res.data.fees);
    } catch { /* fall back to default */ }
  };

  useEffect(() => {
    (async () => {
      await Promise.all([loadWallets(), loadFees()]);
      setBooting(false);
    })();
  }, []);

  const feeFor = (m) => (fees[m] !== undefined ? fees[m] : fees.DEFAULT ?? 1);
  const fee = selectedWallet ? feeFor(selectedWallet.method) : 0;
  const amt = parseFloat(amount) || 0;
  const net = Math.max(0, +(amt - fee).toFixed(2));
  const money = (v) => Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const shortAddr = (a) => (a && a.length > 16 ? `${a.slice(0, 8)}…${a.slice(-6)}` : a);

  /* ── add a saved address ── */
  const addWallet = async () => {
    setAddErr("");
    if (!newAddress.trim()) return setAddErr("Enter your wallet address.");
    if (newAddress.trim() !== confirmAddress.trim())
      return setAddErr("The two addresses don't match. Check carefully.");
    setAddBusy(true);
    try {
      const res = await axios.post(`${API_URL}/api/wallets`,
        { label: newLabel, method: newMethod, address: newAddress.trim() }, auth);
      setMessage({ text: res.data.message, type: "success", code: "" });
      setAddOpen(false);
      setNewLabel(""); setNewAddress(""); setConfirmAddress("");
      loadWallets();
    } catch (err) {
      setAddErr(err.response?.data?.message || "Couldn't save that address.");
    } finally {
      setAddBusy(false);
    }
  };

  const removeWallet = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/wallets/${id}`, auth);
      if (selectedWallet?._id === id) setSelectedWallet(null);
      loadWallets();
    } catch {
      setMessage({ text: "Couldn't remove that address.", type: "error", code: "" });
    }
  };

  /* ── set / change PIN ── */
  const savePin = async () => {
    setPinErr("");
    if (!/^\d{4,6}$/.test(newPin)) return setPinErr("Your PIN must be 4 to 6 digits.");
    if (newPin !== confirmPin) return setPinErr("The PINs don't match.");
    setPinBusy(true);
    try {
      const res = await axios.post(`${API_URL}/api/wallets/pin`,
        { currentPin: currentPin || undefined, newPin }, auth);
      setMessage({ text: res.data.message, type: "success", code: "" });
      setPinOpen(false);
      setCurrentPin(""); setNewPin(""); setConfirmPin("");
      loadWallets();
    } catch (err) {
      setPinErr(err.response?.data?.message || "Couldn't save your PIN.");
    } finally {
      setPinBusy(false);
    }
  };

  /* ── continue to review ── */
  const goReview = (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "", code: "" });
    if (!selectedWallet) return setMessage({ text: "Choose a withdrawal address.", type: "error", code: "" });
    if (!selectedWallet.isReady)
      return setMessage({ text: `That address becomes available in about ${selectedWallet.hoursLeft} hour(s).`, type: "error", code: "" });
    if (!amt || amt <= 0) return setMessage({ text: "Enter a valid amount.", type: "error", code: "" });
    if (amt <= fee) return setMessage({ text: `Amount must be more than the $${fee} network fee.`, type: "error", code: "" });
    if (!hasPin) { setPinOpen(true); return; }
    setStep("review");
  };

  /* ── submit ── */
  const submit = async () => {
    setLoading(true);
    setMessage({ text: "", type: "", code: "" });
    try {
      const res = await axios.post(`${API_URL}/api/withdrawals`,
        {
          amount: amt,
          method: selectedWallet.method,
          details: selectedWallet.address,
          walletId: selectedWallet._id,
          pin,
        }, auth);
      setMessage({ text: res.data.message || "Withdrawal request submitted.", type: "success", code: "" });
      setStep("form");
      setAmount(""); setPin(""); setSelectedWallet(null);
    } catch (err) {
      const code = err.response?.data?.code || "";
      const msg = err.response?.data?.message || "Withdrawal failed. Please try again.";
      setMessage({ text: msg, type: "error", code });
      if (code === "PIN_INCORRECT") { setPin(""); setStep("pin"); }
      else if (code) setStep("form");
    } finally {
      setLoading(false);
    }
  };

  const clearMsg = () => setMessage({ text: "", type: "", code: "" });

  /* ══════════ special states ══════════ */
  const renderSpecial = () => {
    const code = message.code;

    const map = {
      NO_BALANCE: {
        label: "No funds", title: "Nothing to withdraw yet",
        text: "Make your first deposit to start investing and growing your balance.",
        action: { label: "Make a deposit", onClick: () => navigate("/deposit") },
      },
      NO_INVESTMENT: {
        label: "Not invested", title: "Invest before withdrawing",
        text: "You have a balance but haven't invested yet. Choose a plan, earn your profit, then withdraw.",
        steps: ["Choose an investment plan", "Wait for the plan to mature", "Withdraw principal plus profit"],
        action: { label: "Browse plans", onClick: () => navigate("/plans") },
      },
      INSUFFICIENT_BALANCE: {
        label: "Balance", title: "Insufficient balance", text: message.text,
        action: { label: "Make a deposit", onClick: () => navigate("/deposit") },
        secondary: { label: "Try another amount", onClick: clearMsg },
      },
      FROZEN: {
        label: "Suspended", title: "Withdrawals suspended", text: message.text, tone: "loss",
        link: { href: "mailto:support@mexicatrading.com", label: "Contact support" },
      },
      KYC_REQUIRED: {
        label: "Verification", title: "Identity verification required", text: message.text,
        steps: ["A government-issued ID (passport or national ID)", "A selfie holding your ID", "Approval usually within 24 hours"],
        action: { label: "Verify identity", onClick: () => navigate("/kyc") },
        secondary: { label: "Withdraw a smaller amount", onClick: clearMsg },
      },
      KYC_PENDING: {
        label: "Under review", title: "Verification in progress",
        text: "Your documents are being reviewed, usually within 24 hours. We'll email you once approved.",
        tone: "brass",
      },
      KYC_REJECTED: {
        label: "Rejected", title: "Verification rejected", tone: "loss",
        text: "Your documents were rejected. Please resubmit clear photos of your ID and selfie.",
        action: { label: "Resubmit documents", onClick: () => navigate("/kyc") },
      },
      NO_PIN: {
        label: "Security", title: "Set up your withdrawal PIN", text: message.text,
        action: { label: "Create PIN", onClick: () => { clearMsg(); setPinOpen(true); } },
      },
      WALLET_COOLDOWN: {
        label: "Security hold", title: "Address not ready yet", text: message.text, tone: "brass",
        secondary: { label: "Back", onClick: clearMsg },
      },
    };

    const s = map[code] || {
      label: "Failed", title: "Withdrawal failed", text: message.text, tone: "loss",
      action: { label: "Try again", onClick: clearMsg },
    };
    const fg = { loss: c.loss, brass: c.brass }[s.tone] || c.gain;

    return (
      <Panel>
        <p className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".24em", textTransform: "uppercase", color: fg, marginBottom: 8 }}>
          {s.label}
        </p>
        <h2 className="display" style={{ fontSize: T.size.xl, marginBottom: 10 }}>{s.title}</h2>
        <p style={{ fontSize: T.size.sm, color: c.text2, lineHeight: 1.7 }}>{s.text}</p>

        {s.steps && (
          <div style={{ marginTop: T.space.xl, borderTop: `1px solid ${c.line}` }}>
            {s.steps.map((step, i) => (
              <div key={i} className="flex gap-3" style={{ padding: "12px 0", borderBottom: `1px solid ${c.lineSoft}` }}>
                <span className="mono tabular" style={{ fontSize: T.size.xs, color: fg, minWidth: 16 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontSize: T.size.sm, color: c.text2 }}>{step}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: T.space.xl, display: "flex", flexDirection: "column", gap: 8 }}>
          {s.action && <Button full onClick={s.action.onClick}>{s.action.label}</Button>}
          {s.link && (
            <a href={s.link.href} className="mono"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", padding: "14px 22px",
                fontSize: T.size.tiny, letterSpacing: ".14em", textTransform: "uppercase",
                border: `1px solid rgba(180,85,63,.4)`, color: c.loss,
              }}>
              {s.link.label}
            </a>
          )}
          {s.secondary && <Button variant="quiet" full onClick={s.secondary.onClick}>{s.secondary.label}</Button>}
        </div>
      </Panel>
    );
  };

  const sheetWrap = {
    background: c.panel,
    border: `1px solid ${c.line}`,
    maxHeight: "90vh",
    overflowY: "auto",
  };

  return (
    <PageShell width={560}>

      {/* ── Header ── */}
      <div style={{ marginBottom: T.space.xl }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Cash out</p>
        <h1 className="display" style={{ fontSize: T.size.xxl, lineHeight: 1.05 }}>
          {t("withdraw.title", "Withdraw")}
        </h1>
        <p style={{ fontSize: T.size.sm, color: c.text3, marginTop: 8 }}>
          {t("withdraw.subtitle", "Send funds to a saved address. Processed within 24 hours.")}
        </p>
      </div>

      {booting ? (
        <Panel>
          <div className="flex justify-center" style={{ padding: T.space.xxl }}><Spinner size={26} /></div>
        </Panel>
      ) : message.code ? (
        renderSpecial()
      ) : (
        <>
          {message.text && (
            <div style={{ marginBottom: T.space.lg }}>
              <Banner tone={message.type === "success" ? "gain" : "loss"} title={message.text} />
            </div>
          )}

          {/* ════════ STEP 1 — FORM ════════ */}
          {step === "form" && (
            <form onSubmit={goReview}>

              {/* Saved addresses */}
              <div className="flex items-end justify-between" style={{ marginBottom: T.space.md }}>
                <div>
                  <p className="eyebrow" style={{ marginBottom: 4 }}>Destination</p>
                  <h3 className="display" style={{ fontSize: T.size.lg }}>Saved addresses</h3>
                </div>
                <button type="button" onClick={() => setAddOpen(true)}
                  className="mono flex items-center gap-1"
                  style={{ fontSize: T.size.tiny, letterSpacing: ".14em", textTransform: "uppercase", color: c.gain }}>
                  <Plus size={12} /> Add
                </button>
              </div>

              {wallets.length === 0 ? (
                <EmptyState
                  icon={<Wallet size={20} />}
                  title="No saved addresses"
                  text="For your security, withdrawals only go to addresses you've saved in advance."
                  action={{ label: "Add your first address", onClick: () => setAddOpen(true) }}
                />
              ) : (
                <div style={{ border: `1px solid ${c.line}` }}>
                  {wallets.map((w, i) => {
                    const active = selectedWallet?._id === w._id;
                    return (
                      <div key={w._id}
                        onClick={() => w.isReady && setSelectedWallet(w)}
                        className={w.isReady ? "hover-fill" : ""}
                        style={{
                          padding: T.space.lg,
                          borderBottom: i < wallets.length - 1 ? `1px solid ${c.lineSoft}` : "none",
                          borderLeft: active ? `2px solid ${c.gain}` : "2px solid transparent",
                          background: active ? "rgba(63,143,95,.07)" : "transparent",
                          opacity: w.isReady ? 1 : 0.5,
                          cursor: w.isReady ? "pointer" : "not-allowed",
                          transition: "background .2s",
                        }}>
                        <div className="flex items-start justify-between gap-3">
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                              <span style={{ fontSize: T.size.sm, color: c.text }} className="truncate">{w.label}</span>
                              <StatusPill tone={active ? "gain" : "neutral"}>{w.method}</StatusPill>
                              {active && <Check size={13} style={{ color: c.gain, flexShrink: 0 }} />}
                            </div>
                            <p className="mono truncate" style={{ fontSize: T.size.tiny, color: c.text4 }}>
                              {shortAddr(w.address)}
                            </p>
                            {!w.isReady && (
                              <p className="mono flex items-center gap-1" style={{ fontSize: T.size.tiny, color: c.brass, marginTop: 6 }}>
                                <Clock size={9} /> Security hold — available in ~{w.hoursLeft}h
                              </p>
                            )}
                          </div>
                          <button type="button" onClick={(e) => { e.stopPropagation(); removeWallet(w._id); }}
                            aria-label="Remove address"
                            className="w-8 h-8 flex items-center justify-center shrink-0"
                            style={{ background: c.fill, color: c.text4 }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Amount */}
              <div style={{ marginTop: T.space.xl }}>
                <Field label={t("withdraw.amount", "Amount")}>
                  <div style={{ position: "relative" }}>
                    <span className="mono" style={{
                      position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                      color: c.text3, fontSize: T.size.base,
                    }}>$</span>
                    <input type="number" inputMode="decimal" value={amount}
                      onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required
                      className="mono tabular"
                      style={{ ...inputStyle, paddingLeft: 30, fontSize: T.size.lg }}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(63,143,95,.5)")}
                      onBlur={(e) => (e.target.style.borderColor = c.line)} />
                  </div>
                </Field>
              </div>

              {/* Fee preview */}
              {selectedWallet && amt > 0 && (
                <div style={{ border: `1px solid ${c.line}`, padding: T.space.lg, marginBottom: T.space.lg }}>
                  <LedgerRow label="Amount" value={`$${money(amt)}`} />
                  <LedgerRow label={`Network fee · ${selectedWallet.method}`} value={`−$${money(fee)}`} />
                  <LedgerRow label="You receive" value={`$${money(net)}`} accent={c.gain} last />
                  <p style={{ fontSize: T.size.tiny, color: c.text4, marginTop: 10, lineHeight: 1.6 }}>
                    MexicaTrading charges no withdrawal fee. This is the blockchain network cost only.
                  </p>
                </div>
              )}

              <div style={{ marginBottom: T.space.lg }}>
                <Banner tone="brass" title="Crypto transfers cannot be reversed"
                  text="Check your address carefully — funds sent to a wrong address are lost permanently." />
              </div>

              <Button type="submit" full>Continue</Button>

              <button type="button" onClick={() => setPinOpen(true)}
                className="mono w-full flex items-center justify-center gap-2"
                style={{ marginTop: T.space.md, fontSize: T.size.tiny, letterSpacing: ".12em", textTransform: "uppercase", color: c.text4, padding: 8 }}>
                <Lock size={11} /> {hasPin ? "Change withdrawal PIN" : "Set up withdrawal PIN"}
              </button>
            </form>
          )}

          {/* ════════ STEP 2 — REVIEW ════════ */}
          {step === "review" && selectedWallet && (
            <>
              <button onClick={() => setStep("form")}
                className="mono flex items-center gap-2"
                style={{ fontSize: T.size.tiny, letterSpacing: ".14em", textTransform: "uppercase", color: c.text3, marginBottom: T.space.lg }}>
                <ArrowLeft size={12} /> Back
              </button>

              <Panel>
                <p className="eyebrow" style={{ marginBottom: 8 }}>You will receive</p>
                <p className="display tabular" style={{ fontSize: 42, color: c.gain, lineHeight: 1, marginBottom: T.space.xl }}>
                  ${money(net)}
                </p>

                <div style={{ borderTop: `1px solid ${c.line}` }}>
                  <LedgerRow label="Amount" value={`$${money(amt)}`} />
                  <LedgerRow label="Network fee" value={`−$${money(fee)}`} />
                  <LedgerRow label="Method" value={selectedWallet.method} />
                  <LedgerRow label="Destination" value={selectedWallet.label} last />
                </div>

                <div style={{ marginTop: T.space.lg, paddingTop: T.space.lg, borderTop: `1px solid ${c.line}` }}>
                  <p className="eyebrow" style={{ marginBottom: 8 }}>Address</p>
                  <p className="mono" style={{ fontSize: T.size.xs, color: c.text2, wordBreak: "break-all", lineHeight: 1.8 }}>
                    {selectedWallet.address}
                  </p>
                </div>
              </Panel>

              <div style={{ marginTop: T.space.lg, marginBottom: T.space.lg }}>
                <Banner tone="brass" title="Check the address before confirming"
                  text="Compare the first and last characters against your wallet. This cannot be undone." />
              </div>

              <Button full onClick={() => setStep("pin")}>Confirm details</Button>
            </>
          )}

          {/* ════════ STEP 3 — PIN ════════ */}
          {step === "pin" && (
            <>
              <button onClick={() => setStep("review")}
                className="mono flex items-center gap-2"
                style={{ fontSize: T.size.tiny, letterSpacing: ".14em", textTransform: "uppercase", color: c.text3, marginBottom: T.space.lg }}>
                <ArrowLeft size={12} /> Back
              </button>

              <Panel>
                <p className="eyebrow" style={{ marginBottom: 8 }}>Authorise</p>
                <h2 className="display" style={{ fontSize: T.size.xl, marginBottom: 6 }}>Enter your PIN</h2>
                <p style={{ fontSize: T.size.sm, color: c.text3, marginBottom: T.space.xl }}>
                  Confirming <span className="mono tabular" style={{ color: c.gain }}>${money(net)}</span> to {selectedWallet?.label}
                </p>

                <input type="password" inputMode="numeric" maxLength={6} value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="••••"
                  className="mono tabular"
                  style={{ ...inputStyle, textAlign: "center", fontSize: 26, letterSpacing: ".5em", padding: "18px 14px" }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(63,143,95,.5)")}
                  onBlur={(e) => (e.target.style.borderColor = c.line)} />

                <Button full onClick={submit} disabled={loading || pin.length < 4}
                  style={{ marginTop: T.space.lg, opacity: loading || pin.length < 4 ? .5 : 1 }}
                  icon={loading ? <Spinner size={13} tone="#fff" /> : null}>
                  {loading ? "Submitting" : "Submit withdrawal"}
                </Button>
              </Panel>
            </>
          )}
        </>
      )}

      {/* ── Trust strip ── */}
      <div className="flex items-center justify-center gap-5 mono"
        style={{ marginTop: T.space.xl, fontSize: T.size.micro, letterSpacing: ".14em", textTransform: "uppercase", color: c.text4 }}>
        <span>PIN protected</span>
        <span>·</span>
        <span>Saved addresses only</span>
        <span>·</span>
        <span>24h processing</span>
      </div>

      {/* ════════ ADD ADDRESS SHEET ════════ */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(8,9,11,.86)" }}>
          <div className="absolute inset-0" onClick={() => setAddOpen(false)} />
          <div className="relative w-full sm:max-w-md z-10" style={sheetWrap}>

            <div className="flex items-center justify-between" style={{ padding: T.space.xl, borderBottom: `1px solid ${c.line}` }}>
              <div>
                <p className="eyebrow" style={{ marginBottom: 4 }}>New destination</p>
                <h3 className="display" style={{ fontSize: T.size.lg }}>Add address</h3>
              </div>
              <button onClick={() => setAddOpen(false)} className="w-8 h-8 flex items-center justify-center"
                style={{ background: c.fill, color: c.text3 }}>
                <X size={14} />
              </button>
            </div>

            <div style={{ padding: T.space.xl }}>
              {addErr && (
                <div style={{ marginBottom: T.space.lg }}>
                  <Banner tone="loss" title={addErr} />
                </div>
              )}

              <Field label="Label">
                <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. My Binance USDT" style={inputStyle} />
              </Field>

              <Field label="Network">
                <div style={{ position: "relative" }}>
                  <button type="button" onClick={() => setMethodOpen(!methodOpen)}
                    className="w-full flex items-center justify-between" style={{ ...inputStyle, textAlign: "left" }}>
                    <span style={{ fontSize: T.size.sm }}>{METHODS.find(m => m.value === newMethod)?.label}</span>
                    <ChevronDown size={15} style={{ color: c.text4, transform: methodOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                  </button>
                  {methodOpen && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20, background: c.panelAlt, border: `1px solid ${c.line}`, marginTop: 2 }}>
                      {METHODS.map((m, i) => (
                        <button key={m.value} type="button"
                          onClick={() => { setNewMethod(m.value); setMethodOpen(false); }}
                          className="w-full text-left hover-fill"
                          style={{
                            padding: T.space.md,
                            borderBottom: i < METHODS.length - 1 ? `1px solid ${c.lineSoft}` : "none",
                            background: newMethod === m.value ? "rgba(63,143,95,.08)" : "transparent",
                          }}>
                          <p style={{ fontSize: T.size.sm, color: newMethod === m.value ? c.gain : c.text }}>{m.label}</p>
                          <p style={{ fontSize: T.size.tiny, color: c.text4, marginTop: 2 }}>{m.desc}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Field>

              <Field label="Address">
                <input value={newAddress} onChange={(e) => setNewAddress(e.target.value)}
                  placeholder={newMethod === "Bank" ? "Account number" : "Paste your wallet address"}
                  className="mono" style={{ ...inputStyle, fontSize: T.size.xs }} />
              </Field>

              <Field label="Confirm address"
                hint={newAddress && confirmAddress && newAddress.trim() === confirmAddress.trim() ? "Addresses match" : "Paste it a second time"}>
                <input value={confirmAddress} onChange={(e) => setConfirmAddress(e.target.value)}
                  placeholder="Paste it again"
                  className="mono" style={{ ...inputStyle, fontSize: T.size.xs }} />
              </Field>

              <div style={{ marginBottom: T.space.lg }}>
                <Banner tone="brass" title={`${cooldownHours}-hour security hold`}
                  text="New addresses can't be used for withdrawals until the hold clears. This protects your funds if your account is compromised." />
              </div>

              <Button full onClick={addWallet} disabled={addBusy}
                icon={addBusy ? <Spinner size={13} tone="#fff" /> : null}>
                {addBusy ? "Saving" : "Save address"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ PIN SHEET ════════ */}
      {pinOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(8,9,11,.86)" }}>
          <div className="absolute inset-0" onClick={() => setPinOpen(false)} />
          <div className="relative w-full sm:max-w-sm z-10" style={sheetWrap}>

            <div className="flex items-center justify-between" style={{ padding: T.space.xl, borderBottom: `1px solid ${c.line}` }}>
              <div>
                <p className="eyebrow" style={{ marginBottom: 4 }}>Security</p>
                <h3 className="display" style={{ fontSize: T.size.lg }}>{hasPin ? "Change PIN" : "Set PIN"}</h3>
              </div>
              <button onClick={() => setPinOpen(false)} className="w-8 h-8 flex items-center justify-center"
                style={{ background: c.fill, color: c.text3 }}>
                <X size={14} />
              </button>
            </div>

            <div style={{ padding: T.space.xl }}>
              <p style={{ fontSize: T.size.xs, color: c.text3, lineHeight: 1.7, marginBottom: T.space.lg }}>
                Your PIN is required for every withdrawal. Choose 4–6 digits you'll remember. Our team will never ask you for it.
              </p>

              {pinErr && (
                <div style={{ marginBottom: T.space.lg }}>
                  <Banner tone="loss" title={pinErr} />
                </div>
              )}

              {hasPin && (
                <Field label="Current PIN">
                  <input type="password" inputMode="numeric" maxLength={6} value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
                    className="mono" style={{ ...inputStyle, textAlign: "center", letterSpacing: ".3em" }} />
                </Field>
              )}

              <Field label="New PIN">
                <input type="password" inputMode="numeric" maxLength={6} value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="4–6 digits"
                  className="mono" style={{ ...inputStyle, textAlign: "center", letterSpacing: ".3em" }} />
              </Field>

              <Field label="Confirm PIN">
                <input type="password" inputMode="numeric" maxLength={6} value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                  className="mono" style={{ ...inputStyle, textAlign: "center", letterSpacing: ".3em" }} />
              </Field>

              <Button full onClick={savePin} disabled={pinBusy}
                icon={pinBusy ? <Spinner size={13} tone="#fff" /> : null}>
                {pinBusy ? "Saving" : "Save PIN"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
