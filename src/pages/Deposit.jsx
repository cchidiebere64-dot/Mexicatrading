import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, CreditCard, Hash, Copy, Check, ChevronDown, X, AlertTriangle } from "lucide-react";

export default function Deposit() {
  const [amount, setAmount] = useState("");
  const [txid, setTxid] = useState("");
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [selectModalOpen, setSelectModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

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

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setMessage("You must be logged in to deposit.");
        setMessageType("error");
        setLoading(false);
        return;
      }
      if (!amount || parseFloat(amount) <= 0) {
        setMessage("Please enter a valid deposit amount.");
        setMessageType("error");
        setLoading(false);
        return;
      }
      if (!selectedWallet) {
        setMessage("Please select a payment method.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      const depositData = {
        amount: parseFloat(amount),
        method: selectedWallet.name,
        txid: txid || "",
      };

      const res = await axios.post(`${API_URL}/api/deposits`, depositData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(res.data.message || "Deposit submitted successfully!");
      setMessageType("success");
      setAmount("");
      setTxid("");
      setSelectedWallet(null);
    } catch (err) {
      setMessage(err.response?.data?.message || "Deposit failed. Try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c18] text-white flex justify-center items-start pt-24 pb-16 px-4">

      {/* AMBIENT BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full top-[-150px] left-[-150px]" />
        <div className="absolute w-[400px] h-[400px] bg-teal-400/8 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium tracking-widest uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Secure Deposit
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Deposit Funds</h2>
          <p className="text-white/40 text-sm mt-2">Add funds to your investment account</p>
        </div>

        {/* CARD */}
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">

          {/* MESSAGE */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mb-6 p-4 rounded-xl text-sm text-center font-medium border ${
                  messageType === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleDeposit} className="space-y-5">

            {/* AMOUNT */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                Deposit Amount (USD)
              </label>
              <div className="relative group">
                <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 transition-all text-sm placeholder:text-white/25"
                  required
                />
              </div>
            </div>

            {/* PAYMENT METHOD */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                Payment Method
              </label>
              <button
                type="button"
                onClick={() => setSelectModalOpen(true)}
                className="w-full text-left pl-4 pr-4 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-emerald-500/30 focus:outline-none transition-all flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-3">
                  <CreditCard size={16} className="text-white/25" />
                  <span className={selectedWallet ? "text-white" : "text-white/25"}>
                    {selectedWallet ? selectedWallet.name : "Select a payment method"}
                  </span>
                </div>
                <ChevronDown size={16} className="text-white/25" />
              </button>
            </div>

            {/* WALLET DETAILS */}
            <AnimatePresence>
              {selectedWallet && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5 space-y-4"
                >
                  {/* Warning */}
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={16} className="text-yellow-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-yellow-400 text-sm font-semibold mb-1">Important Notice</p>
                      <p className="text-white/50 text-xs leading-relaxed">
                        Only send <span className="text-white font-medium">{selectedWallet.name}</span> to this address. Sending any other asset will result in permanent loss.
                      </p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Wallet Address</p>
                    <div className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-xl p-3">
                      <span className="break-all font-mono text-xs text-white/70 flex-1">{selectedWallet.address}</span>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                          copied
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-white/10 text-white/60 hover:bg-white/20 border border-white/10"
                        }`}
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>

                  {/* Optional caution */}
                  {selectedWallet.caution && (
                    <p className="text-white/40 text-xs leading-relaxed">{selectedWallet.caution}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* TRANSACTION ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                Transaction ID / Proof <span className="text-white/20 normal-case">(optional)</span>
              </label>
              <div className="relative group">
                <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Paste your TxID or proof here"
                  value={txid}
                  onChange={(e) => setTxid(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 transition-all text-sm placeholder:text-white/25"
                />
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all font-semibold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Deposit"
              )}
            </button>
          </form>
        </div>

        {/* TRUST NOTE */}
        <div className="flex items-center justify-center gap-6 mt-6 text-white/20 text-xs">
          <span>🔒 SSL Secured</span>
          <span>·</span>
          <span>⚡ Fast Processing</span>
          <span>·</span>
          <span>🛡️ Funds Protected</span>
        </div>
      </motion.div>

      {/* WALLET SELECTION MODAL */}
      <AnimatePresence>
        {selectModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <div className="absolute inset-0" onClick={() => setSelectModalOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#0e1422] border border-white/10 rounded-3xl p-6 z-10 flex flex-col max-h-[85vh] shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold">Select Payment Method</h3>
                  <p className="text-white/40 text-xs mt-0.5">Choose your preferred cryptocurrency</p>
                </div>
                <button
                  onClick={() => setSelectModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
                >
                  <X size={14} className="text-white/50" />
                </button>
              </div>

              {/* Wallet List */}
              <div className="overflow-auto flex-1 space-y-2 pr-1">
                {wallets.length === 0 ? (
                  <div className="text-center py-10 text-white/30 text-sm">
                    No payment methods available at this time.
                  </div>
                ) : (
                  wallets.map((w) => (
                    <button
                      key={w._id || w.name}
                      onClick={() => handleSelectWallet(w)}
                      className="w-full text-left p-4 rounded-xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.07] hover:border-emerald-500/30 transition-all flex flex-col gap-1"
                    >
                      <span className="text-white font-semibold text-sm">{w.name}</span>
                      <span className="text-white/30 text-xs font-mono truncate">{w.address}</span>
                    </button>
                  ))
                )}
              </div>

              {/* Cancel */}
              <button
                onClick={() => setSelectModalOpen(false)}
                className="mt-4 w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 transition text-sm text-white/40 hover:text-white"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
