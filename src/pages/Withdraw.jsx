import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Wallet, ChevronDown, AlertTriangle, ArrowUpCircle, TrendingUp, ShieldCheck, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function Withdraw() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const API_URL = "https://mexicatradingbackend.onrender.com";
  const [method, setMethod] = useState("TON");
  const [details, setDetails] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "", code: "" });
  const [methodOpen, setMethodOpen] = useState(false);

  const METHODS = [
    { value: "TON", label: "TON Wallet", desc: "Transfer via TON blockchain" },
    { value: "Bank", label: "Bank Transfer", desc: "Direct bank account transfer" },
    { value: "USDT", label: "USDT (TRC20)", desc: "Tether on TRON network" },
  ];

  const selectedMethod = METHODS.find((m) => m.value === method);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setMessage({ text: "Please enter a valid withdrawal amount.", type: "error", code: "" });
      return;
    }
    if (!details) {
      setMessage({ text: "Please enter your withdrawal details.", type: "error", code: "" });
      return;
    }
    try {
      setLoading(true);
      setMessage({ text: "", type: "", code: "" });
      const token = sessionStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/withdrawals`,
        { amount, method, details },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({
        text: "Withdrawal request submitted successfully. Our team will process it shortly.",
        type: "success",
        code: "",
      });
      setAmount("");
      setDetails("");
    } catch (err) {
      const code = err.response?.data?.code || "";
      const msg = err.response?.data?.message || "Withdrawal failed. Please try again.";
      setMessage({ text: msg, type: "error", code });
    } finally {
      setLoading(false);
    }
  };

  const renderSpecialMessage = () => {

    // ── No balance ────────────────────────────────────────────────────────────
    if (message.code === "NO_BALANCE") {
      return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center gap-5 py-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl">💰</div>
          <div>
            <p className="text-white font-bold text-lg mb-2">No Balance Yet</p>
            <p className="text-white/50 text-sm leading-relaxed">
              You don't have any balance yet. Make your first deposit to start investing and growing your wealth.
            </p>
          </div>
          <button onClick={() => navigate("/deposit")}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition-all font-semibold text-sm text-white flex items-center justify-center gap-2">
            <DollarSign size={16} /> Make a Deposit
          </button>
        </motion.div>
      );
    }

    // ── No investment ─────────────────────────────────────────────────────────
    if (message.code === "NO_INVESTMENT") {
      return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center gap-5 py-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-3xl">📈</div>
          <div>
            <p className="text-white font-bold text-lg mb-2">Invest First to Withdraw</p>
            <p className="text-white/50 text-sm leading-relaxed">
              You have a balance but haven't invested yet. Choose a plan, earn your profits, then withdraw your earnings!
            </p>
          </div>
          <div className="w-full p-4 rounded-xl bg-blue-500/8 border border-blue-500/20 text-left">
            <p className="text-blue-400 text-xs font-semibold mb-2">How it works:</p>
            <div className="space-y-1.5">
              <p className="text-white/50 text-xs">✅ Choose an investment plan</p>
              <p className="text-white/50 text-xs">✅ Wait for your plan to mature</p>
              <p className="text-white/50 text-xs">✅ Withdraw your principal + profit</p>
            </div>
          </div>
          <button onClick={() => navigate("/plans")}
            className="w-full py-3.5 rounded-xl bg-blue-500 hover:bg-blue-400 transition-all font-semibold text-sm text-white flex items-center justify-center gap-2">
            <TrendingUp size={16} /> Browse Investment Plans
          </button>
        </motion.div>
      );
    }

    // ── Insufficient balance ──────────────────────────────────────────────────
    if (message.code === "INSUFFICIENT_BALANCE") {
      return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center gap-5 py-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-3xl">💸</div>
          <div>
            <p className="text-white font-bold text-lg mb-2">Insufficient Balance</p>
            <p className="text-white/50 text-sm leading-relaxed">{message.text}</p>
          </div>
          <button onClick={() => navigate("/deposit")}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition-all font-semibold text-sm text-white flex items-center justify-center gap-2">
            <DollarSign size={16} /> Make a Deposit
          </button>
          <button onClick={() => setMessage({ text: "", type: "", code: "" })}
            className="w-full py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition text-sm text-white/40 hover:text-white">
            Try a Different Amount
          </button>
        </motion.div>
      );
    }

    // ── Account frozen ────────────────────────────────────────────────────────
    if (message.code === "FROZEN") {
      return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center gap-5 py-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-3xl">🔒</div>
          <div>
            <p className="text-white font-bold text-lg mb-2">Withdrawals Suspended</p>
            <p className="text-white/50 text-sm leading-relaxed">{message.text}</p>
          </div>
          <a href="mailto:support@mexicatrading.com"
            className="w-full py-3.5 rounded-xl bg-red-500/15 border border-red-500/25 text-red-400 hover:bg-red-500/25 transition-all font-semibold text-sm flex items-center justify-center gap-2">
            📧 Contact Support
          </a>
        </motion.div>
      );
    }

    // ── KYC required ──────────────────────────────────────────────────────────
    if (message.code === "KYC_REQUIRED") {
      return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center gap-5 py-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-3xl">🪪</div>
          <div>
            <p className="text-white font-bold text-lg mb-2">Identity Verification Required</p>
            <p className="text-white/50 text-sm leading-relaxed">{message.text}</p>
          </div>
          <div className="w-full p-4 rounded-xl bg-purple-500/8 border border-purple-500/20 text-left">
            <p className="text-purple-400 text-xs font-semibold mb-2">What you need:</p>
            <div className="space-y-1.5">
              <p className="text-white/50 text-xs">📄 A government-issued ID (passport or national ID)</p>
              <p className="text-white/50 text-xs">🤳 A selfie holding your ID</p>
              <p className="text-white/50 text-xs">⚡ Approval takes less than 24 hours</p>
            </div>
          </div>
          <button onClick={() => navigate("/kyc")}
            className="w-full py-3.5 rounded-xl bg-purple-500 hover:bg-purple-400 transition-all font-semibold text-sm text-white flex items-center justify-center gap-2">
            <ShieldCheck size={16} /> Verify My Identity
          </button>
          <button onClick={() => setMessage({ text: "", type: "", code: "" })}
            className="w-full py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition text-sm text-white/40 hover:text-white">
            Withdraw Smaller Amount
          </button>
        </motion.div>
      );
    }

    // ── KYC pending ───────────────────────────────────────────────────────────
    if (message.code === "KYC_PENDING") {
      return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center gap-5 py-4">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-3xl">⏳</div>
          <div>
            <p className="text-white font-bold text-lg mb-2">Verification Under Review</p>
            <p className="text-white/50 text-sm leading-relaxed">
              Your identity documents are being reviewed. This usually takes less than 24 hours. You will receive an email once approved.
            </p>
          </div>
          <div className="w-full p-4 rounded-xl bg-yellow-500/8 border border-yellow-500/20 flex items-center gap-3">
            <Clock size={16} className="text-yellow-400 shrink-0" />
            <p className="text-yellow-400/80 text-xs">Contact support@mexicatrading.com for urgent assistance</p>
          </div>
        </motion.div>
      );
    }

    // ── KYC rejected ──────────────────────────────────────────────────────────
    if (message.code === "KYC_REJECTED") {
      return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center gap-5 py-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-3xl">❌</div>
          <div>
            <p className="text-white font-bold text-lg mb-2">Verification Rejected</p>
            <p className="text-white/50 text-sm leading-relaxed">
              Your identity verification was rejected. Please resubmit clear photos of your ID and selfie.
            </p>
          </div>
          <button onClick={() => navigate("/kyc")}
            className="w-full py-3.5 rounded-xl bg-red-500 hover:bg-red-400 transition-all font-semibold text-sm text-white flex items-center justify-center gap-2">
            <ShieldCheck size={16} /> Resubmit Documents
          </button>
        </motion.div>
      );
    }

    // ── Fallback — show error message and reset button ────────────────────────
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center gap-5 py-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-3xl">⚠️</div>
        <div>
          <p className="text-white font-bold text-lg mb-2">Withdrawal Failed</p>
          <p className="text-white/50 text-sm leading-relaxed">{message.text}</p>
        </div>
        <button onClick={() => setMessage({ text: "", type: "", code: "" })}
          className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition-all font-semibold text-sm text-white">
          Try Again
        </button>
      </motion.div>
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

          {/* Special state screens — always renders something when code exists */}
          {message.code && renderSpecialMessage()}

          {/* Normal success/error messages — only when no code */}
          {!message.code && (
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
          )}

          {/* Withdrawal form — only when no code */}
          {!message.code && (
            <form onSubmit={handleSubmit} className="space-y-5">

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">{t("withdraw.method")}</label>
                <div className="relative">
                  <button type="button" onClick={() => setMethodOpen(!methodOpen)}
                    className="w-full text-left pl-4 pr-4 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-emerald-500/30 focus:outline-none transition-all flex items-center justify-between text-sm">
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{selectedMethod?.label}</span>
                      <span className="text-white/30 text-xs">{selectedMethod?.desc}</span>
                    </div>
                    <ChevronDown size={16} className={`text-white/25 transition-transform ${methodOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {methodOpen && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="absolute top-full mt-2 w-full bg-[#0e1422] border border-white/10 rounded-2xl overflow-hidden z-20 shadow-2xl">
                        {METHODS.map((m) => (
                          <button key={m.value} type="button" onClick={() => { setMethod(m.value); setMethodOpen(false); }}
                            className={`w-full text-left px-4 py-3.5 flex flex-col gap-0.5 hover:bg-white/5 transition-all border-b border-white/5 last:border-0 ${method === m.value ? "bg-emerald-500/10" : ""}`}>
                            <span className={`text-sm font-medium ${method === m.value ? "text-emerald-400" : "text-white"}`}>{m.label}</span>
                            <span className="text-white/30 text-xs">{m.desc}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                  {method === "Bank" ? t("withdraw.bankDetails") : t("withdraw.details")}
                </label>
                <div className="relative group">
                  <Wallet size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-emerald-400 transition-colors" />
                  <input type="text" value={details} onChange={(e) => setDetails(e.target.value)}
                    placeholder={method === "Bank" ? "Enter your bank account number" : "Enter your wallet address"}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 transition-all text-sm placeholder:text-white/25"
                    required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">{t("withdraw.amount")}</label>
                <div className="relative group">
                  <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-emerald-400 transition-colors" />
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 transition-all text-sm placeholder:text-white/25"
                    required />
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/5">
                <AlertTriangle size={15} className="text-yellow-400 mt-0.5 shrink-0" />
                <p className="text-white/40 text-xs leading-relaxed">{t("withdraw.caution")}</p>
              </div>

              <button type="submit" disabled={loading}
                className="group w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all font-semibold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("withdraw.submitting")}
                  </>
                ) : (
                  <>
                    <ArrowUpCircle size={16} />
                    {t("withdraw.submit")}
                  </>
                )}
              </button>
            </form>
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
    </div>
  );
}
