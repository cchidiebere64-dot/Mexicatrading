import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign, Wallet, ChevronDown, AlertTriangle, ArrowUpCircle, TrendingUp,
  ShieldCheck, Clock, Plus, Trash2, Check, Lock, ArrowLeft, KeyRound, X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const API_URL = "https://mexicatradingbackend.onrender.com";

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

  // add-wallet modal
  const [addOpen, setAddOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newMethod, setNewMethod] = useState("USDT");
  const [newAddress, setNewAddress] = useState("");
  const [confirmAddress, setConfirmAddress] = useState("");
  const [methodOpen, setMethodOpen] = useState(false);
  const [addBusy, setAddBusy] = useState(false);
  const [addErr, setAddErr] = useState("");

  // pin setup modal
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
    } catch {
      /* fall back to default */
    }
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

  const shortAddr = (a) => (a && a.length > 16 ? `${a.slice(0, 8)}…${a.slice(-6)}` : a);

  /* ── add a saved address ── */
  const addWallet = async () => {
    setAddErr("");
    if (!newAddress.trim()) return setAddErr("Please enter your wallet address.");
    if (newAddress.trim() !== confirmAddress.trim())
      return setAddErr("The two addresses don't match. Please check carefully.");
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
    } catch (err) {
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
    if (!selectedWallet) return setMessage({ text: "Please choose a withdrawal address.", type: "error", code: "" });
    if (!selectedWallet.isReady)
      return setMessage({ text: `This address becomes available in about ${selectedWallet.hoursLeft} hour(s).`, type: "error", code: "" });
    if (!amt || amt <= 0) return setMessage({ text: "Please enter a valid amount.", type: "error", code: "" });
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

  /* ══════════ special full-screen states ══════════ */
  const renderSpecialMessage = () => {
    const c = message.code;

    if (c === "NO_BALANCE") return (
      <Special emoji="💰" title="No Balance Yet"
        text="You don't have any balance yet. Make your first deposit to start investing and growing your wealth."
        action={{ label: "Make a Deposit", icon: <DollarSign size={16} />, onClick: () => navigate("/deposit"), cls: "bg-emerald-500 hover:bg-emerald-400" }} />
    );

    if (c === "NO_INVESTMENT") return (
      <Special emoji="📈" title="Invest First to Withdraw"
        text="You have a balance but haven't invested yet. Choose a plan, earn your profits, then withdraw your earnings!"
        extra={
          <div className="w-full p-4 rounded-xl bg-blue-500/8 border border-blue-500/20 text-left">
            <p className="text-blue-400 text-xs font-semibold mb-2">How it works:</p>
            <div className="space-y-1.5">
              <p className="text-white/50 text-xs">✅ Choose an investment plan</p>
              <p className="text-white/50 text-xs">✅ Wait for your plan to mature</p>
              <p className="text-white/50 text-xs">✅ Withdraw your principal + profit</p>
            </div>
          </div>
        }
        action={{ label: "Browse Investment Plans", icon: <TrendingUp size={16} />, onClick: () => navigate("/plans"), cls: "bg-blue-500 hover:bg-blue-400" }} />
    );

    if (c === "INSUFFICIENT_BALANCE") return (
      <Special emoji="💸" title="Insufficient Balance" text={message.text}
        action={{ label: "Make a Deposit", icon: <DollarSign size={16} />, onClick: () => navigate("/deposit"), cls: "bg-emerald-500 hover:bg-emerald-400" }}
        secondary={{ label: "Try a Different Amount", onClick: () => setMessage({ text: "", type: "", code: "" }) }} />
    );

    if (c === "FROZEN") return (
      <Special emoji="🔒" title="Withdrawals Suspended" text={message.text}
        link={{ href: "mailto:support@mexicatrading.com", label: "📧 Contact Support" }} />
    );

    if (c === "KYC_REQUIRED") return (
      <Special emoji="🪪" title="Identity Verification Required" text={message.text}
        extra={
          <div className="w-full p-4 rounded-xl bg-purple-500/8 border border-purple-500/20 text-left">
            <p className="text-purple-400 text-xs font-semibold mb-2">What you need:</p>
            <div className="space-y-1.5">
              <p className="text-white/50 text-xs">📄 A government-issued ID (passport or national ID)</p>
              <p className="text-white/50 text-xs">🤳 A selfie holding your ID</p>
              <p className="text-white/50 text-xs">⚡ Approval takes less than 24 hours</p>
            </div>
          </div>
        }
        action={{ label: "Verify My Identity", icon: <ShieldCheck size={16} />, onClick: () => navigate("/kyc"), cls: "bg-purple-500 hover:bg-purple-400" }}
        secondary={{ label: "Withdraw Smaller Amount", onClick: () => setMessage({ text: "", type: "", code: "" }) }} />
    );

    if (c === "KYC_PENDING") return (
      <Special emoji="⏳" title="Verification Under Review"
        text="Your identity documents are being reviewed. This usually takes less than 24 hours. You will receive an email once approved."
        extra={
          <div className="w-full p-4 rounded-xl bg-yellow-500/8 border border-yellow-500/20 flex items-center gap-3">
            <Clock size={16} className="text-yellow-400 shrink-0" />
            <p className="text-yellow-400/80 text-xs">Contact support@mexicatrading.com for urgent assistance</p>
          </div>
        } />
    );

    if (c === "KYC_REJECTED") return (
      <Special emoji="❌" title="Verification Rejected"
        text="Your identity verification was rejected. Please resubmit clear photos of your ID and selfie."
        action={{ label: "Resubmit Documents", icon: <ShieldCheck size={16} />, onClick: () => navigate("/kyc"), cls: "bg-red-500 hover:bg-red-400" }} />
    );

    if (c === "NO_PIN") return (
      <Special emoji="🔐" title="Set Up Your Withdrawal PIN" text={message.text}
        action={{ label: "Create PIN", icon: <KeyRound size={16} />, onClick: () => { setMessage({ text: "", type: "", code: "" }); setPinOpen(true); }, cls: "bg-emerald-500 hover:bg-emerald-400" }} />
    );

    if (c === "WALLET_COOLDOWN") return (
      <Special emoji="⏱️" title="Address Not Ready Yet" text={message.text}
        secondary={{ label: "Back", onClick: () => setMessage({ text: "", type: "", code: "" }) }} />
    );

    return (
      <Special emoji="⚠️" title="Withdrawal Failed" text={message.text}
        action={{ label: "Try Again", onClick: () => setMessage({ text: "", type: "", code: "" }), cls: "bg-emerald-500 hover:bg-emerald-400" }} />
    );
  };

  return (
    <div className="min-h-screen bg-[#080c18] text-white flex justify-center items-start pt-24 pb-16 px-4">

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full top-[-150px] left-[-150px]" />
        <div className="absolute w-[400px] h-[400px] bg-teal-400/8 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-lg">

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium tracking-widest uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {t("withdraw.secure")}
          </div>
          <h2 className="text-3xl font-bold tracking-tight">{t("withdraw.title")}</h2>
          <p className="text-white/40 text-sm mt-2">{t("withdraw.subtitle")}</p>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">

          {booting ? (
            <div className="flex justify-center py-10">
              <div className="w-9 h-9 border-4 border-emerald-500/25 border-t-emerald-400 rounded-full animate-spin" />
            </div>
          ) : message.code ? (
            renderSpecialMessage()
          ) : (
            <>
              <AnimatePresence>
                {message.text && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={`mb-6 p-4 rounded-xl text-sm text-center font-medium border ${
                      message.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}>
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ════════ STEP 1 — FORM ════════ */}
              {step === "form" && (
                <form onSubmit={goReview} className="space-y-5">

                  {/* Saved addresses */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">Withdraw To</label>
                      <button type="button" onClick={() => setAddOpen(true)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition">
                        <Plus size={12} /> Add Address
                      </button>
                    </div>

                    {wallets.length === 0 ? (
                      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 text-center">
                        <Wallet size={22} className="text-white/20 mx-auto mb-2" />
                        <p className="text-white/50 text-sm mb-1">No saved addresses</p>
                        <p className="text-white/25 text-xs mb-4">
                          For your security, withdrawals only go to addresses you've saved.
                        </p>
                        <button type="button" onClick={() => setAddOpen(true)}
                          className="px-5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/25 transition">
                          Add Your First Address
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {wallets.map((w) => {
                          const active = selectedWallet?._id === w._id;
                          return (
                            <div key={w._id}
                              onClick={() => w.isReady && setSelectedWallet(w)}
                              className={`rounded-2xl border p-4 transition-all ${
                                !w.isReady
                                  ? "border-white/8 bg-white/[0.02] opacity-60 cursor-not-allowed"
                                  : active
                                    ? "border-emerald-500/40 bg-emerald-500/10 cursor-pointer"
                                    : "border-white/8 bg-white/[0.02] hover:border-white/20 cursor-pointer"
                              }`}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-semibold text-white truncate">{w.label}</p>
                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/8 border border-white/10 text-white/50 font-bold uppercase tracking-wider shrink-0">
                                      {w.method}
                                    </span>
                                    {active && <Check size={13} className="text-emerald-400 shrink-0" />}
                                  </div>
                                  <p className="text-[11px] font-mono text-white/35 truncate">{shortAddr(w.address)}</p>
                                  {!w.isReady && (
                                    <p className="text-[10px] text-yellow-400/80 mt-1.5 flex items-center gap-1">
                                      <Clock size={9} /> Available in ~{w.hoursLeft}h (security hold)
                                    </p>
                                  )}
                                </div>
                                <button type="button"
                                  onClick={(e) => { e.stopPropagation(); removeWallet(w._id); }}
                                  className="shrink-0 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-red-400 transition">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">{t("withdraw.amount")}</label>
                    <div className="relative group">
                      <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-emerald-400 transition-colors" />
                      <input type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 transition-all text-sm placeholder:text-white/25"
                        required />
                    </div>
                  </div>

                  {/* Live fee preview */}
                  {selectedWallet && amt > 0 && (
                    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 space-y-2">
                      <Row label="Amount" value={`$${amt.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
                      <Row label={`Network fee (${selectedWallet.method})`} value={`−$${fee.toFixed(2)}`} />
                      <div className="pt-2 border-t border-white/8">
                        <Row label="You receive" value={`$${net.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} bold />
                      </div>
                      <p className="text-[10px] text-white/25 pt-1">
                        MexicaTrading charges no withdrawal fee — this is the blockchain network cost only.
                      </p>
                    </div>
                  )}

                  <div className="flex items-start gap-3 p-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/5">
                    <AlertTriangle size={15} className="text-yellow-400 mt-0.5 shrink-0" />
                    <p className="text-white/40 text-xs leading-relaxed">
                      Crypto transfers cannot be reversed. Double-check your address before confirming — funds sent to a wrong address are lost permanently.
                    </p>
                  </div>

                  <button type="submit"
                    className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition-all font-semibold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2">
                    <ArrowUpCircle size={16} /> Continue
                  </button>

                  {/* PIN status */}
                  <button type="button" onClick={() => setPinOpen(true)}
                    className="w-full flex items-center justify-center gap-2 text-[11px] text-white/30 hover:text-white/60 transition pt-1">
                    <Lock size={11} />
                    {hasPin ? "Change withdrawal PIN" : "Set up withdrawal PIN"}
                  </button>
                </form>
              )}

              {/* ════════ STEP 2 — REVIEW ════════ */}
              {step === "review" && selectedWallet && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                  <button onClick={() => setStep("form")} className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition">
                    <ArrowLeft size={14} /> Back
                  </button>

                  <div className="text-center">
                    <p className="text-white/40 text-xs uppercase tracking-widest mb-2">You will receive</p>
                    <p className="text-4xl font-bold text-emerald-400">${net.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 space-y-3">
                    <Row label="Amount" value={`$${amt.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
                    <Row label="Network fee" value={`−$${fee.toFixed(2)}`} />
                    <Row label="Method" value={selectedWallet.method} />
                    <Row label="To" value={selectedWallet.label} />
                    <div className="pt-3 border-t border-white/8">
                      <p className="text-white/35 text-[10px] uppercase tracking-widest mb-1.5">Address</p>
                      <p className="font-mono text-xs text-white/70 break-all leading-relaxed">{selectedWallet.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/5">
                    <AlertTriangle size={15} className="text-yellow-400 mt-0.5 shrink-0" />
                    <p className="text-white/45 text-xs leading-relaxed">
                      Check the first and last characters of the address above against your wallet. This cannot be undone.
                    </p>
                  </div>

                  <button onClick={() => setStep("pin")}
                    className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition-all font-semibold text-sm shadow-xl shadow-emerald-500/20">
                    Confirm Details
                  </button>
                </motion.div>
              )}

              {/* ════════ STEP 3 — PIN ════════ */}
              {step === "pin" && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                  <button onClick={() => setStep("review")} className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition">
                    <ArrowLeft size={14} /> Back
                  </button>

                  <div className="text-center py-2">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                      <Lock size={22} className="text-emerald-400" />
                    </div>
                    <p className="text-white font-bold mb-1">Enter your withdrawal PIN</p>
                    <p className="text-white/40 text-xs">Confirming ${net.toFixed(2)} to {selectedWallet?.label}</p>
                  </div>

                  <input type="password" inputMode="numeric" maxLength={6} value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••"
                    className="w-full py-4 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 transition-all text-center text-2xl tracking-[0.5em] font-bold placeholder:text-white/20" />

                  <button onClick={submit} disabled={loading || pin.length < 4}
                    className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 transition-all font-semibold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2">
                    {loading
                      ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting…</>
                      : <><ArrowUpCircle size={16} /> Submit Withdrawal</>}
                  </button>
                </motion.div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-center gap-6 mt-6 text-white/20 text-xs">
          <span>🔒 {t("common.sslSecured")}</span>
          <span>·</span>
          <span>⚡ {t("common.fastProcessing")}</span>
          <span>·</span>
          <span>🛡️ {t("common.fundsProtected")}</span>
        </div>
      </motion.div>

      {/* ════════ ADD ADDRESS MODAL ════════ */}
      <AnimatePresence>
        {addOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
            <div className="absolute inset-0" onClick={() => setAddOpen(false)} />
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="relative w-full sm:max-w-md bg-[#0e1422] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 z-10 shadow-2xl max-h-[90vh] overflow-y-auto">

              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold">Add Withdrawal Address</h3>
                <button onClick={() => setAddOpen(false)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition">
                  <X size={15} />
                </button>
              </div>

              {addErr && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">{addErr}</div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">Label</label>
                  <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="e.g. My Binance USDT"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 text-sm placeholder:text-white/25" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">Method</label>
                  <div className="relative">
                    <button type="button" onClick={() => setMethodOpen(!methodOpen)}
                      className="w-full text-left px-4 py-3 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between text-sm">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{METHODS.find(m => m.value === newMethod)?.label}</span>
                        <span className="text-white/30 text-xs">{METHODS.find(m => m.value === newMethod)?.desc}</span>
                      </div>
                      <ChevronDown size={16} className={`text-white/25 transition-transform ${methodOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {methodOpen && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="absolute top-full mt-2 w-full bg-[#0e1422] border border-white/10 rounded-2xl overflow-hidden z-20 shadow-2xl">
                          {METHODS.map((m) => (
                            <button key={m.value} type="button" onClick={() => { setNewMethod(m.value); setMethodOpen(false); }}
                              className={`w-full text-left px-4 py-3 flex flex-col gap-0.5 hover:bg-white/5 transition border-b border-white/5 last:border-0 ${newMethod === m.value ? "bg-emerald-500/10" : ""}`}>
                              <span className={`text-sm font-medium ${newMethod === m.value ? "text-emerald-400" : "text-white"}`}>{m.label}</span>
                              <span className="text-white/30 text-xs">{m.desc}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">Address</label>
                  <input value={newAddress} onChange={(e) => setNewAddress(e.target.value)}
                    placeholder={newMethod === "Bank" ? "Account number" : "Paste your wallet address"}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 text-sm font-mono placeholder:text-white/25" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">Confirm Address</label>
                  <input value={confirmAddress} onChange={(e) => setConfirmAddress(e.target.value)}
                    placeholder="Paste it again"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 text-sm font-mono placeholder:text-white/25" />
                  {newAddress && confirmAddress && newAddress.trim() === confirmAddress.trim() && (
                    <p className="text-emerald-400 text-[11px] flex items-center gap-1"><Check size={11} /> Addresses match</p>
                  )}
                </div>

                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                  <Clock size={14} className="text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-white/40 text-[11px] leading-relaxed">
                    For your security, this address can't be used for withdrawals for <span className="text-white/70 font-medium">{cooldownHours} hours</span> after saving. This protects your funds if your account is ever compromised.
                  </p>
                </div>

                <button onClick={addWallet} disabled={addBusy}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 transition-all font-semibold text-sm flex items-center justify-center gap-2">
                  {addBusy ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</> : "Save Address"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════ PIN MODAL ════════ */}
      <AnimatePresence>
        {pinOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
            <div className="absolute inset-0" onClick={() => setPinOpen(false)} />
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="relative w-full sm:max-w-sm bg-[#0e1422] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 z-10 shadow-2xl">

              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold">{hasPin ? "Change PIN" : "Set Withdrawal PIN"}</h3>
                <button onClick={() => setPinOpen(false)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition">
                  <X size={15} />
                </button>
              </div>

              <p className="text-white/40 text-xs mb-5 leading-relaxed">
                Your PIN is required every time you withdraw. Choose 4–6 digits you'll remember, and don't share it with anyone — our team will never ask for it.
              </p>

              {pinErr && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">{pinErr}</div>
              )}

              <div className="space-y-3">
                {hasPin && (
                  <input type="password" inputMode="numeric" maxLength={6} value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))} placeholder="Current PIN"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 text-sm text-center tracking-widest placeholder:text-white/25" />
                )}
                <input type="password" inputMode="numeric" maxLength={6} value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))} placeholder="New PIN (4–6 digits)"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 text-sm text-center tracking-widest placeholder:text-white/25" />
                <input type="password" inputMode="numeric" maxLength={6} value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))} placeholder="Confirm PIN"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 text-sm text-center tracking-widest placeholder:text-white/25" />

                <button onClick={savePin} disabled={pinBusy}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 transition-all font-semibold text-sm flex items-center justify-center gap-2">
                  {pinBusy ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</> : "Save PIN"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── small helpers ── */
function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-xs ${bold ? "text-white/60" : "text-white/35"}`}>{label}</span>
      <span className={bold ? "text-emerald-400 font-bold text-base" : "text-white/80 text-sm font-medium"}>{value}</span>
    </div>
  );
}

function Special({ emoji, title, text, extra, action, secondary, link }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center gap-5 py-4">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl">{emoji}</div>
      <div>
        <p className="text-white font-bold text-lg mb-2">{title}</p>
        <p className="text-white/50 text-sm leading-relaxed">{text}</p>
      </div>
      {extra}
      {action && (
        <button onClick={action.onClick}
          className={`w-full py-3.5 rounded-xl transition-all font-semibold text-sm text-white flex items-center justify-center gap-2 ${action.cls}`}>
          {action.icon} {action.label}
        </button>
      )}
      {link && (
        <a href={link.href}
          className="w-full py-3.5 rounded-xl bg-red-500/15 border border-red-500/25 text-red-400 hover:bg-red-500/25 transition-all font-semibold text-sm flex items-center justify-center gap-2">
          {link.label}
        </a>
      )}
      {secondary && (
        <button onClick={secondary.onClick}
          className="w-full py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition text-sm text-white/40 hover:text-white">
          {secondary.label}
        </button>
      )}
    </motion.div>
  );
}
