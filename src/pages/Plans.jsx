import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Check, X, ArrowRight, AlertTriangle,
  Zap, Shield, Star, Crown, Gem, Sparkles, Clock,
  Flame, ChevronRight
} from "lucide-react";

const API_URL = "https://mexicatradingbackend.onrender.com";

// Plan tier styles — matched by plan name
const planTiers = [
  {
    name: "Starter",
    icon: <Zap size={18} />,
    accentText: "text-emerald-400",
    accentBg: "bg-emerald-500/15",
    accentBorder: "border-emerald-500/30",
    iconBg: "bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 border-emerald-500/30",
    button: "bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/25",
    gradient: "from-emerald-500/8 to-transparent",
    tag: null,
  },
  {
    name: "Basic",
    icon: <TrendingUp size={18} />,
    accentText: "text-blue-400",
    accentBg: "bg-blue-500/15",
    accentBorder: "border-blue-500/30",
    iconBg: "bg-gradient-to-br from-blue-500/30 to-blue-500/10 border-blue-500/30",
    button: "bg-blue-500 hover:bg-blue-400 shadow-blue-500/25",
    gradient: "from-blue-500/8 to-transparent",
    tag: null,
  },
  {
    name: "Premium",
    icon: <Star size={18} />,
    accentText: "text-purple-400",
    accentBg: "bg-purple-500/15",
    accentBorder: "border-purple-500/40",
    iconBg: "bg-gradient-to-br from-purple-500/30 to-purple-500/10 border-purple-500/30",
    button: "bg-purple-500 hover:bg-purple-400 shadow-purple-500/30",
    gradient: "from-purple-500/12 to-transparent",
    tag: { label: "POPULAR", icon: <Flame size={9} />, cls: "bg-gradient-to-r from-purple-500 to-pink-500 text-white" },
  },
  {
    name: "Elite",
    icon: <Crown size={18} />,
    accentText: "text-amber-400",
    accentBg: "bg-amber-500/15",
    accentBorder: "border-amber-500/30",
    iconBg: "bg-gradient-to-br from-amber-500/30 to-amber-500/10 border-amber-500/30",
    button: "bg-amber-500 hover:bg-amber-400 shadow-amber-500/25",
    gradient: "from-amber-500/8 to-transparent",
    tag: null,
  },
  {
    name: "VIP",
    icon: <Gem size={18} />,
    accentText: "text-rose-400",
    accentBg: "bg-rose-500/15",
    accentBorder: "border-rose-500/30",
    iconBg: "bg-gradient-to-br from-rose-500/30 to-rose-500/10 border-rose-500/30",
    button: "bg-rose-500 hover:bg-rose-400 shadow-rose-500/25",
    gradient: "from-rose-500/8 to-transparent",
    tag: { label: "TOP RETURN", icon: <Sparkles size={9} />, cls: "bg-gradient-to-r from-rose-500 to-amber-500 text-white" },
  },
];

export default function Plans() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [activeStyle, setActiveStyle] = useState(null);
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

  const openModal = (plan, style) => {
    setActivePlan(plan);
    setActiveStyle(style);
    setInvestAmount(String(plan.minAmount));
    setAmountError("");
    setModalOpen(true);
    setMessage("");
    setBalanceCheck(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActivePlan(null);
    setActiveStyle(null);
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
      setAmountError(`Minimum is $${Number(activePlan.minAmount).toLocaleString()}`);
    } else if (num > activePlan.maxAmount) {
      setAmountError(`Maximum is $${Number(activePlan.maxAmount).toLocaleString()}`);
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

  // Live profit calculation
  const estimatedProfit = () => {
    const amt = parseFloat(investAmount);
    if (!amt || isNaN(amt) || !activePlan) return null;
    return ((amt * activePlan.profitRate) / 100).toFixed(2);
  };

  // Profit per $100 — simple example showing the rate
  const profitPer100 = (plan) => Math.round((100 * plan.profitRate) / 100);

  // Match plan to its style
  const getStyle = (plan, idx) => {
    const tier = planTiers.find(t => t.name.toLowerCase() === plan.name?.toLowerCase());
    return tier || planTiers[idx % planTiers.length];
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#080c18] gap-4">
      <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
      <p className="text-white/30 text-sm animate-pulse">{t("common.loading")}</p>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#080c18] text-white overflow-hidden pb-12">

      {/* Premium ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[700px] h-[700px] bg-emerald-500/8 blur-[180px] rounded-full top-[-200px] left-[-150px]" />
        <div className="absolute w-[500px] h-[500px] bg-purple-500/6 blur-[160px] rounded-full top-[40%] right-[-100px]" />
        <div className="absolute inset-0 opacity-[0.018]" style={{ backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      </div>

      <main className="relative z-10 px-4 pt-20 max-w-3xl mx-auto">

        {/* HERO — compact and premium */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-4 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <Sparkles size={11} /> Investment Plans
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
            Choose Your Path to{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">Wealth</span>
          </h1>
          <p className="text-white/45 text-sm max-w-md mx-auto">
            Premium plans engineered for consistent, predictable returns.
          </p>
        </motion.div>

        {/* PLAN LIST — premium horizontal rows */}
        {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <TrendingUp size={32} className="text-white/15" />
            <p className="text-white font-semibold">{t("common.noPlans")}</p>
            <p className="text-white/30 text-sm">{t("common.noPlansDesc")}</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {plans.map((plan, idx) => {
              const style = getStyle(plan, idx);
              const per100 = profitPer100(plan);
              return (
                <motion.button
                  key={plan._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.4 }}
                  whileHover={{ x: 4 }}
                  onClick={() => openModal(plan, style)}
                  className={`w-full text-left relative group overflow-hidden rounded-2xl border ${style.accentBorder} bg-gradient-to-r ${style.gradient} bg-white/[0.02] hover:bg-white/[0.04] transition-all`}>

                  <div className="flex items-center gap-3 p-3.5">

                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${style.iconBg}`}>
                      <span className={style.accentText}>{style.icon}</span>
                    </div>

                    {/* Plan info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="text-white font-bold text-sm">{plan.name}</h3>
                        {style.tag && (
                          <span className={`flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 rounded-full font-bold tracking-wider ${style.tag.cls}`}>
                            {style.tag.icon} {style.tag.label}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-white/45">
                        <span className="flex items-center gap-1"><Clock size={10} /> {plan.duration} {t("common.days")}</span>
                        <span>·</span>
                        <span>${Number(plan.minAmount).toLocaleString()} – ${Number(plan.maxAmount).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Profit on minimum investment — real attractive number */}
                    <div className="text-right shrink-0">
                      <p className="text-white/35 text-[10px] uppercase tracking-widest">Earn</p>
                      <p className={`${style.accentText} font-bold text-base leading-tight`}>
                        +${Math.round((plan.minAmount * plan.profitRate) / 100).toLocaleString()}
                      </p>
                      <p className="text-white/30 text-[10px]">on ${Number(plan.minAmount).toLocaleString()}</p>
                    </div>

                    {/* Chevron */}
                    <ChevronRight size={16} className={`${style.accentText} opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0`} />
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Trust footer */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-7 pt-5 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-white/35 text-[11px]">
            <Shield size={11} className="text-emerald-400" /> Bank-Grade Security
          </div>
          <span className="text-white/15">·</span>
          <div className="flex items-center gap-1.5 text-white/35 text-[11px]">🔒 SSL Encrypted</div>
          <span className="text-white/15">·</span>
          <div className="flex items-center gap-1.5 text-white/35 text-[11px]">⚡ Instant Activation</div>
        </div>
      </main>

      {/* ── INVEST MODAL ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && activePlan && activeStyle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4">
            <div className="absolute inset-0" onClick={closeModal} />
            <motion.div
              initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="relative w-full sm:max-w-md bg-gradient-to-b from-[#0d1525] to-[#0a1120] border border-white/10 rounded-t-3xl sm:rounded-3xl z-10 shadow-2xl overflow-hidden">

              {/* Modal header */}
              <div className={`relative px-6 py-5 border-b border-white/8 bg-gradient-to-r ${activeStyle.gradient}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${activeStyle.iconBg}`}>
                      <span className={activeStyle.accentText}>{activeStyle.icon}</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">{activePlan.name}</h2>
                      <p className="text-white/40 text-xs">{activePlan.duration} {t("common.days")} · {activePlan.profitRate}% return</p>
                    </div>
                  </div>
                  <button onClick={closeModal}
                    className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition">
                    <X size={15} />
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">

                {/* Amount input — focal point */}
                <div className="mb-5">
                  <label className="text-[11px] font-bold text-white/45 uppercase tracking-widest block mb-2">
                    How much do you want to invest?
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold text-lg">$</span>
                    <input type="number" value={investAmount} onChange={handleAmountChange}
                      min={activePlan.minAmount} max={activePlan.maxAmount}
                      placeholder={`${activePlan.minAmount}`}
                      className={`w-full pl-9 pr-4 py-4 rounded-2xl bg-white/5 border-2 ${amountError ? "border-red-500/40" : activeStyle.accentBorder} outline-none transition-all text-xl font-bold text-white placeholder:text-white/25`} />
                  </div>
                  <div className="flex justify-between mt-2 text-[11px]">
                    <span className="text-white/30">Min: ${Number(activePlan.minAmount).toLocaleString()}</span>
                    <span className="text-white/30">Max: ${Number(activePlan.maxAmount).toLocaleString()}</span>
                  </div>
                  {amountError && (
                    <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                      <AlertTriangle size={11} /> {amountError}
                    </p>
                  )}
                </div>

                {/* Live profit preview */}
                {estimatedProfit() && !amountError && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-2xl border ${activeStyle.accentBorder} ${activeStyle.accentBg} mb-4`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/50 text-[11px] uppercase tracking-widest font-semibold">You will earn</p>
                        <p className={`text-3xl font-bold ${activeStyle.accentText} mt-1`}>
                          +${Number(estimatedProfit()).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/40 text-[11px] uppercase tracking-widest">In</p>
                        <p className="text-white font-bold text-lg mt-1">{activePlan.duration} {t("common.days")}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Quick amount buttons */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[activePlan.minAmount, Math.round((activePlan.minAmount + activePlan.maxAmount) / 2), activePlan.maxAmount].map((amt, i) => (
                    <button key={i}
                      onClick={() => { setInvestAmount(String(amt)); setAmountError(""); setBalanceCheck(null); setMessage(""); }}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        parseFloat(investAmount) === amt
                          ? `${activeStyle.accentBg} ${activeStyle.accentBorder} ${activeStyle.accentText}`
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

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button onClick={closeModal}
                    className="flex-1 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/50 text-sm font-semibold hover:bg-white/10 transition">
                    {t("common.cancel")}
                  </button>
                  {balanceCheck === "insufficient" ? (
                    <button onClick={() => navigate("/deposit")}
                      className={`flex-1 py-3.5 rounded-2xl ${activeStyle.button} text-white text-sm font-bold transition shadow-xl`}>
                      {t("common.depositFunds")}
                    </button>
                  ) : (
                    <button onClick={handleConfirm}
                      disabled={confirming || balanceCheck === "success" || !!amountError || !investAmount}
                      className={`flex-1 py-3.5 rounded-2xl ${activeStyle.button} text-white text-sm font-bold transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl`}>
                      {confirming && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      {confirming ? t("common.processing") : "Confirm Investment"}
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-center gap-3 mt-4 text-[11px] text-white/25">
                  <span className="flex items-center gap-1"><Shield size={10} /> Secured</span>
                  <span>·</span>
                  <span>🔒 SSL</span>
                  <span>·</span>
                  <span>⚡ Instant</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
