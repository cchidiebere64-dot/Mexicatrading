import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Wallet, ChevronDown, AlertTriangle, ArrowUpCircle } from "lucide-react";

const METHODS = [
  { value: "TON", label: "TON Wallet", desc: "Transfer via TON blockchain" },
  { value: "Bank", label: "Bank Transfer", desc: "Direct bank account transfer" },
  { value: "USDT", label: "USDT (TRC20)", desc: "Tether on TRON network" },
];

export default function Withdraw() {
  const API_URL = "https://mexicatradingbackend.onrender.com";
  const [method, setMethod] = useState("TON");
  const [details, setDetails] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [methodOpen, setMethodOpen] = useState(false);

  const selectedMethod = METHODS.find((m) => m.value === method);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || amount <= 0) {
      setMessage({ text: "Please enter a valid withdrawal amount.", type: "error" });
      return;
    }
    if (!details) {
      setMessage({ text: "Please enter your withdrawal details.", type: "error" });
      return;
    }

    try {
      setLoading(true);
      setMessage({ text: "", type: "" });

      const token = sessionStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/withdrawals`,
        { amount, method, details },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({
        text: "Withdrawal request submitted successfully. Our team will process it shortly.",
        type: "success",
      });
      setAmount("");
      setDetails("");
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Withdrawal failed. Please try again.",
        type: "error",
      });
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
            Secure Withdrawal
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Withdraw Funds</h2>
          <p className="text-white/40 text-sm mt-2">Request a withdrawal from your investment account</p>
        </div>

        {/* CARD */}
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">

          {/* MESSAGE */}
          <AnimatePresence>
            {message.text && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mb-6 p-4 rounded-xl text-sm text-center font-medium border ${
                  message.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* WITHDRAWAL METHOD */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                Withdrawal Method
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMethodOpen(!methodOpen)}
                  className="w-full text-left pl-4 pr-4 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-emerald-500/30 focus:outline-none transition-all flex items-center justify-between text-sm"
                >
                  <div className="flex flex-col">
                    <span className="text-white font-medium">{selectedMethod?.label}</span>
                    <span className="text-white/30 text-xs">{selectedMethod?.desc}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-white/25 transition-transform ${methodOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {methodOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-full mt-2 w-full bg-[#0e1422] border border-white/10 rounded-2xl overflow-hidden z-20 shadow-2xl"
                    >
                      {METHODS.map((m) => (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => {
                            setMethod(m.value);
                            setMethodOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3.5 flex flex-col gap-0.5 hover:bg-white/5 transition-all border-b border-white/5 last:border-0 ${
                            method === m.value ? "bg-emerald-500/10" : ""
                          }`}
                        >
                          <span className={`text-sm font-medium ${method === m.value ? "text-emerald-400" : "text-white"}`}>
                            {m.label}
                          </span>
                          <span className="text-white/30 text-xs">{m.desc}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* WITHDRAWAL DETAILS */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                {method === "Bank" ? "Bank Account Number" : "Wallet Address"}
              </label>
              <div className="relative group">
                <Wallet size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type="text"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={
                    method === "Bank"
                      ? "Enter your bank account number"
                      : "Enter your wallet address"
                  }
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 transition-all text-sm placeholder:text-white/25"
                  required
                />
              </div>
            </div>

            {/* AMOUNT */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                Withdrawal Amount (USD)
              </label>
              <div className="relative group">
                <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 transition-all text-sm placeholder:text-white/25"
                  required
                />
              </div>
            </div>

            {/* CAUTION BOX */}
            <div className="flex items-start gap-3 p-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/5">
              <AlertTriangle size={15} className="text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-white/40 text-xs leading-relaxed">
                Double-check your withdrawal details before submitting. Incorrect information may result in permanent loss of funds. Processing typically takes 1–3 business days.
              </p>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all font-semibold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <ArrowUpCircle size={16} />
                  Submit Withdrawal
                </>
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
    </div>
  );
}
