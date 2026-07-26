import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign, CreditCard, Hash, Copy, Check, ChevronDown, X,
  AlertTriangle, Bitcoin, ExternalLink, Info,
} from "lucide-react";
import { useTranslation } from "react-i18next";

/* Flutterwave payment link (USD, customer enters amount) */
const CARD_PAYMENT_LINK = "https://flutterwave.com/pay/mexicatrading";

export default function Deposit() {
  const { t } = useTranslation();
  const [payMethod, setPayMethod] = useState("crypto"); // "crypto" | "card"
  const [amount, setAmount] = useState("");
  const [txid, setTxid] = useState("");
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [selectModalOpen, setSelectModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [paymentOpened, setPaymentOpened] = useState(false);

  const API_URL = "https://mexicatradingbackend.onrender.com";

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/wallets/public/all`);
        setWallets(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch wallets:", err);
      }
    };
    fetchWallets();
  }, []);

  const handleSelectWallet = (wallet) => {
    setSelectedWallet(wallet);
    setSelectModalOpen(false);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!selectedWallet?.address) return;
    try {
      await navigator.clipboard.writeText(selectedWallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const openCardPayment = () => {
    window.open(CARD_PAYMENT_LINK, "_blank", "noopener,noreferrer");
    setPaymentOpened(true);
  };

  const switchMethod = (m) => {
    setPayMethod(m);
    setMessage("");
    setPaymentOpened(false);
    setSelectedWallet(null);
    setTxid("");
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setMessage("You must be logged in to deposit.");
        setMessageType("error"); setLoading(false); return;
      }
      if (!amount || parseFloat(amount) <= 0) {
        setMessage("Please enter a valid deposit amount.");
        setMessageType("error"); setLoading(false); return;
      }
      if (payMethod === "crypto" && !selectedWallet) {
        setMessage("Please select a payment method.");
        setMessageType("error"); setLoading(false); return;
      }

      const method = payMethod === "card" ? "Card (Flutterwave)" : selectedWallet.name;

      const res = await axios.post(`${API_URL}/api/deposits`,
        { amount: parseFloat(amount), method, txid: txid || "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message || "Deposit submitted successfully!");
      setMessageType("success");
      setAmount(""); setTxid(""); setSelectedWallet(null); setPaymentOpened(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Deposit failed. Try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c18] text-white flex justify-center items-start pt-24 pb-16 px-4">

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full top-[-150px] left-[-150px]" />
        <div className="absolute w-[400px] h-[400px] bg-teal-400/8 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-lg">

        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium tracking-widest uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {t("deposit.secure")}
          </div>
          <h2 className="text-3xl font-bold tracking-tight">{t("deposit.title")}</h2>
          <p className="text-white/40 text-sm mt-2">{t("deposit.subtitle")}</p>
        </div>

        {/* CARD */}
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">

          <AnimatePresence>
            {message && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`mb-6 p-4 rounded-xl text-sm text-center font-medium border ${messageType === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── PAYMENT TYPE TOGGLE ── */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1 rounded-2xl bg-white/[0.03] border border-white/8">
            <button type="button" onClick={() => switchMethod("crypto")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                payMethod === "crypto"
                  ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                  : "text-white/40 hover:text-white/70"
              }`}>
              <Bitcoin size={15} /> Crypto
            </button>
            <button type="button" onClick={() => switchMethod("card")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                payMethod === "card"
                  ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                  : "text-white/40 hover:text-white/70"
              }`}>
              <CreditCard size={15} /> Card
            </button>
          </div>

          <form onSubmit={handleDeposit} className="space-y-5">

            {/* AMOUNT */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">{t("deposit.amount")}</label>
              <div className="relative group">
                <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-emerald-400 transition-colors" />
                <input type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00"
                  value={amount} onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 transition-all text-sm placeholder:text-white/25"
                  required />
              </div>
            </div>

            {/* ═══════════ CARD FLOW ═══════════ */}
            {payMethod === "card" && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

                {/* Steps */}
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">How it works</p>
                  <ol className="space-y-2.5 text-xs text-white/60 leading-relaxed">
                    <li className="flex gap-2.5">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center justify-center">1</span>
                      <span>Enter the amount above, then tap <span className="text-white font-medium">Pay with Card</span></span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center justify-center">2</span>
                      <span>Enter the <span className="text-white font-medium">same amount</span> on the payment page and complete your card payment</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center justify-center">3</span>
                      <span>Come back here and tap <span className="text-white font-medium">Submit Deposit</span> so our team can confirm and credit your balance</span>
                    </li>
                  </ol>
                </div>

                {/* Pay button */}
                <button type="button" onClick={openCardPayment}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 transition-all font-semibold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2.5">
                  <CreditCard size={16} /> Pay with Card
                  <ExternalLink size={13} className="opacity-70" />
                </button>

                {paymentOpened && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-center text-xs text-emerald-400/80">
                    ✓ Payment page opened. Once you've paid, submit the deposit below.
                  </motion.p>
                )}

                {/* Notes */}
                <div className="flex items-start gap-2.5 rounded-xl border border-white/8 bg-white/[0.02] p-4">
                  <Info size={14} className="text-white/30 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-white/40 leading-relaxed space-y-1.5">
                    <p>Payments are charged in <span className="text-white/70 font-medium">USD</span>. If your card is in another currency, your bank converts it automatically — the amount on your statement may differ slightly, and your bank may add its own international fee.</p>
                    <p>Use the <span className="text-white/70 font-medium">same email</span> as your MexicaTrading account on the payment page so we can match your payment.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═══════════ CRYPTO FLOW ═══════════ */}
            {payMethod === "crypto" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">{t("deposit.method")}</label>
                  <button type="button" onClick={() => setSelectModalOpen(true)}
                    className="w-full text-left pl-4 pr-4 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-emerald-500/30 focus:outline-none transition-all flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <Bitcoin size={16} className="text-white/25" />
                      <span className={selectedWallet ? "text-white" : "text-white/25"}>
                        {selectedWallet ? selectedWallet.name : t("deposit.selectMethod")}
                      </span>
                    </div>
                    <ChevronDown size={16} className="text-white/25" />
                  </button>
                </div>

                <AnimatePresence>
                  {selectedWallet && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5 space-y-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={16} className="text-yellow-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-yellow-400 text-sm font-semibold mb-1">{t("deposit.warning")}</p>
                          <p className="text-white/50 text-xs leading-relaxed">
                            Only send <span className="text-white font-medium">{selectedWallet.name}</span> to this address. Sending any other asset will result in permanent loss.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">{t("deposit.walletAddress")}</p>
                        <div className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-xl p-3">
                          <span className="break-all font-mono text-xs text-white/70 flex-1">{selectedWallet.address}</span>
                          <button type="button" onClick={handleCopy}
                            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${copied ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/10 text-white/60 hover:bg-white/20 border border-white/10"}`}>
                            {copied ? <Check size={12} /> : <Copy size={12} />}
                            {copied ? t("deposit.copied") : t("deposit.copy")}
                          </button>
                        </div>
                      </div>
                      {selectedWallet.caution && <p className="text-white/40 text-xs leading-relaxed">{selectedWallet.caution}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {/* TRANSACTION ID / REFERENCE */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                {payMethod === "card" ? "Payment Reference" : t("deposit.txid")}{" "}
                <span className="text-white/20 normal-case">{t("deposit.txidOptional")}</span>
              </label>
              <div className="relative group">
                <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-emerald-400 transition-colors" />
                <input type="text"
                  placeholder={payMethod === "card" ? "Reference from your payment receipt" : t("deposit.txidPlaceholder")}
                  value={txid} onChange={(e) => setTxid(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 transition-all text-sm placeholder:text-white/25" />
              </div>
            </div>

            {/* SUBMIT */}
            <button type="submit" disabled={loading}
              className="group w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all font-semibold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t("deposit.submitting")}</>
              ) : t("deposit.submit")}
            </button>
          </form>
        </div>

        <div className="flex items-center justify-center gap-6 mt-6 text-white/20 text-xs">
          <span>🔒 {t("common.sslSecured")}</span>
          <span>·</span>
          <span>⚡ {t("common.fastProcessing")}</span>
          <span>·</span>
          <span>🛡️ {t("common.fundsProtected")}</span>
        </div>
      </motion.div>

      {/* WALLET SELECTION MODAL */}
      <AnimatePresence>
        {selectModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="absolute inset-0" onClick={() => setSelectModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#0e1422] border border-white/10 rounded-3xl p-6 z-10 flex flex-col max-h-[85vh] shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold">Select Payment Method</h3>
                  <p className="text-white/40 text-xs mt-0.5">Choose your preferred cryptocurrency</p>
                </div>
                <button onClick={() => setSelectModalOpen(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition">
                  <X size={14} className="text-white/50" />
                </button>
              </div>
              <div className="overflow-auto flex-1 space-y-2 pr-1">
                {wallets.length === 0 ? (
                  <div className="text-center py-10 text-white/30 text-sm">No payment methods available at this time.</div>
                ) : (
                  wallets.map((w) => (
                    <button key={w._id || w.name} onClick={() => handleSelectWallet(w)}
                      className="w-full text-left p-4 rounded-xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.07] hover:border-emerald-500/30 transition-all flex flex-col gap-1">
                      <span className="text-white font-semibold text-sm">{w.name}</span>
                      <span className="text-white/30 text-xs font-mono truncate">{w.address}</span>
                    </button>
                  ))
                )}
              </div>
              <button onClick={() => setSelectModalOpen(false)}
                className="mt-4 w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 transition text-sm text-white/40 hover:text-white">
                {t("common.cancel")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
