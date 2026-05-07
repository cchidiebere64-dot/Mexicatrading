import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Check, X, ArrowRight, AlertTriangle,
  Zap, Shield, Star, Crown, Gem
} from "lucide-react";

const API_URL = "https://mexicatradingbackend.onrender.com";

const planStyles = [
  { icon: <Zap size={18} />,      border: "border-emerald-500/30", iconBg: "bg-emerald-500/15 border-emerald-500/25", badge: "bg-emerald-500/15 text-emerald-400", glow: "bg-emerald-500/5" },
  { icon: <TrendingUp size={18}/>, border: "border-blue-500/30",    iconBg: "bg-blue-500/15 border-blue-500/25",       badge: "bg-blue-500/15 text-blue-400",       glow: "bg-blue-500/5" },
  { icon: <Star size={18} />,     border: "border-purple-500/30",  iconBg: "bg-purple-500/15 border-purple-500/25",   badge: "bg-purple-500/15 text-purple-400",   glow: "bg-purple-500/5" },
  { icon: <Crown size={18} />,    border: "border-amber-500/30",   iconBg: "bg-amber-500/15 border-amber-500/25",     badge: "bg-amber-500/15 text-amber-400",     glow: "bg-amber-500/5" },
  { icon: <Gem size={18} />,      border: "border-rose-500/30",    iconBg: "bg-rose-500/15 border-rose-500/25",       badge: "bg-rose-500/15 text-rose-400",       glow: "bg-rose-500/5" },
];

export default function Plans() {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
      setAmountError("Please enter a valid amount.");
    } else if (num < activePlan.minAmount) {
      setAmountError(`Minimum investment is $${Number(activePlan.minAmount).toLocaleString()}`);
    } else if (num > activePlan.maxAmount) {
      setAmountError(`Maximum investment is $${Number(activePlan.maxAmount).toLocaleString()}`);
    }
  };

  const handleConfirm = async () => {
    const amount = parseFloat(investAmount);
    if (!amount || isNaN(amount)) { setAmountError("Please enter a valid amount."); return; }
    if (amount < activePlan.minAmount) { setAmountError(`Minimum is $${Number(activePlan.minAmount).toLocaleString()}`); return; }
    if (amount > activePlan.maxAmount) { setAmountError(`Maximum is $${Number(activePlan.maxAmount).toLocaleString()}`); return; }

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
        setMessage(t("common.investmentSuccess"));
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setMessage(data.message || "Transaction failed. Please try again.");
      }
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  const estimatedProfit = () => {
    const amt = parseFloat(investAmount);
    if (!amt || isNaN(amt) || !activePlan) return null;
    return ((amt * activePlan.profitRate) / 100).toFixed(2);
  };

  // Calculate actual dollar profit from minimum investment
  const minProfit = (plan) => ((plan.minAmount * plan.profitRate) / 100).toFixed(0);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#080c18] gap-4">
      <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
      <p className="text-white/30 text-sm animate-pulse">{t("common.loading")}</p>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#080c18] text-white overflow-hidden">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[600px] h-[600px] bg-emerald-500/8 blur-[150px] rounded-full top-[-200px] left-[-200px]" />
        <div className="absolute w-[500px] h-[500px] bg-blue-500/6 blur-[140px] rounded-full bottom-[-200px] right-[-200px]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      </div>

      <main className="relative z-10 px-4 pt-24 pb-10 max-w-5xl mx-auto">

        {/* Compact header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium tracking-widest uppercase mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {t("common.investmentPlans")}
          </div>
          <h1 className="text-2xl font-bold text-white">
            {t("common.chooseYourPlan")} <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Plan</span>
          </h1>
          <p className="text-white/35 text-sm mt-1">{t("common.choosePlanDesc")}</p>
        </motion.div>

        {/* Plans grid — compact cards */}
        {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <TrendingUp size={32} className="text-white/15" />
            <p className="text-white font-semibold">{t("common.noPlans")}</p>
            <p className="text-white/30 text-sm">{t("common.noPlansDesc")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {plans.map((plan, idx) => {
              const style = planStyles[idx % planStyles.length];
              const profit = minProfit(plan);
              return (
                <motion.div key={plan._id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  className={`relative p-4 rounded-2xl border ${style.border} ${style.glow} bg-white/[0.03] flex flex-col gap-3 hover:bg-white/[0.05] transition-all duration-300`}>

                  {/* Top row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${style.iconBg}`}>
                        {style.icon}
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{plan.name}</p>
                        <p className="text-white/30 text-xs">{plan.duration} {t("common.days")}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${style.badge}`}>
                      {plan.profitRate}%
                    </span>
                  </div>

                  {/* Profit showcase — actual dollars */}
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/8 flex items-center justify-between">
                    <div>
                      <p className="text-white/35 text-xs mb-0.5">Invest from</p>
                      <p className="text-white font-bold text-base">${Number(plan.minAmount).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/35 text-xs mb-0.5">Earn from</p>
                      <p className="text-emerald-400 font-bold text-base">+${Number(profit).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Key info row */}
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <span>Max: ${Number(plan.maxAmount).toLocaleString()}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Check size={10} className="text-emerald-400" /> Auto profit</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Check size={10} className="text-emerald-400" /> 24/7 tracking</span>
                  </div>

                  {/* Invest button */}
                  <button onClick={() => openModal(plan)}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group">
                    {t("common.choosePlan")}
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Footer trust badges */}
        <div className="flex items-center justify-center gap-4 mt-6 text-white/20 text-xs">
          <span className="flex items-center gap-1"><Shield size={11} /> {t("common.securedInvestment")}</span>
          <span>·</span>
          <span>🔒 {t("common.sslSecured")}</span>
          <span>·</span>
          <span>⚡ {t("common.instantActivation")}</span>
        </div>
      </main>

      {/* ── INVEST MODAL ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && activePlan && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="absolute inset-0" onClick={closeModal} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#0e1422] border border-white/10 rounded-3xl p-6 z-10 shadow-2xl">

              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-white">{t("common.confirmInvestment")}</h2>
                  <p className="text-white/30 text-xs mt-0.5">{activePlan.name} · {activePlan.duration} {t("common.days")}</p>
                </div>
                <button onClick={closeModal} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition">
                  <X size={15} />
                </button>
              </div>

              {/* Plan summary */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 space-y-2.5 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">{t("common.plan")}</span>
                  <span className="text-white font-semibold">{activePlan.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">{t("common.profitRate")}</span>
                  <span className="text-emerald-400 font-semibold">{activePlan.profitRate}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">{t("common.duration")}</span>
                  <span className="text-white font-semibold">{activePlan.duration} {t("common.days")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Range</span>
                  <span className="text-white/60 font-medium">
                    ${Number(activePlan.minAmount).toLocaleString()} — ${Number(activePlan.maxAmount).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Amount input */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-2">
                  Amount to Invest (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold text-sm">$</span>
                  <input type="number" value={investAmount} onChange={handleAmountChange}
                    min={activePlan.minAmount} max={activePlan.maxAmount}
                    placeholder={`${activePlan.minAmount}`}
                    className="w-full pl-8 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 transition-all text-sm text-white placeholder:text-white/25" />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-white/25 text-xs">Min: ${Number(activePlan.minAmount).toLocaleString()}</span>
                  <span className="text-white/25 text-xs">Max: ${Number(activePlan.maxAmount).toLocaleString()}</span>
                </div>
                {amountError && (
                  <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <AlertTriangle size={11} /> {amountError}
                  </p>
                )}
                {estimatedProfit() && !amountError && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20 flex justify-between items-center">
                    <span className="text-emerald-400/70 text-xs">You will earn</span>
                    <span className="text-emerald-400 font-bold text-sm">+${estimatedProfit()}</span>
                  </div>
                )}
              </div>

              {/* Quick amount buttons */}
              <div className="flex gap-2 mb-4">
                {[activePlan.minAmount, Math.round((activePlan.minAmount + activePlan.maxAmount) / 2), activePlan.maxAmount].map((amt, i) => (
                  <button key={i}
                    onClick={() => { setInvestAmount(String(amt)); setAmountError(""); setBalanceCheck(null); setMessage(""); }}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      parseFloat(investAmount) === amt
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                        : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10"
                    }`}>
                    ${Number(amt).toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Status messages */}
              <AnimatePresence>
                {balanceCheck === "insufficient" && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                    <AlertTriangle size={15} /> {t("common.insufficientBalance")}
                  </motion.div>
                )}
                {balanceCheck === "success" && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-4">
                    <Check size={15} /> {message}
                  </motion.div>
                )}
                {message && balanceCheck !== "success" && balanceCheck !== "insufficient" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                    {message}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3">
                <button onClick={closeModal}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/50 text-sm font-medium hover:bg-white/10 transition-all">
                  {t("common.cancel")}
                </button>
                {balanceCheck === "insufficient" ? (
                  <button onClick={() => navigate("/deposit")}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all">
                    {t("common.depositFunds")}
                  </button>
                ) : (
                  <button onClick={handleConfirm}
                    disabled={confirming || balanceCheck === "success" || !!amountError || !investAmount}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {confirming && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {confirming ? t("common.processing") : t("common.confirm")}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
