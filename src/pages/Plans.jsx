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

// Each plan tier — premium card styles like a stock app
const planTiers = [
  {
    icon: <Zap size={20} className="text-emerald-400" />,
    name: "Starter",
    accentText: "text-emerald-400",
    accentBg: "bg-emerald-500/15",
    accentBorder: "border-emerald-500/30",
    glow: "shadow-emerald-500/15",
    gradient: "from-emerald-500/15 via-emerald-500/5 to-transparent",
    iconBg: "bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 border-emerald-500/30",
    button: "bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/25",
    tag: null,
  },
  {
    icon: <TrendingUp size={20} className="text-blue-400" />,
    name: "Basic",
    accentText: "text-blue-400",
    accentBg: "bg-blue-500/15",
    accentBorder: "border-blue-500/30",
    glow: "shadow-blue-500/15",
    gradient: "from-blue-500/15 via-blue-500/5 to-transparent",
    iconBg: "bg-gradient-to-br from-blue-500/30 to-blue-500/10 border-blue-500/30",
    button: "bg-blue-500 hover:bg-blue-400 shadow-blue-500/25",
    tag: null,
  },
  {
    icon: <Star size={20} className="text-purple-400" />,
    name: "Premium",
    accentText: "text-purple-400",
    accentBg: "bg-purple-500/15",
    accentBorder: "border-purple-500/40",
    glow: "shadow-purple-500/20",
    gradient: "from-purple-500/20 via-purple-500/8 to-transparent",
    iconBg: "bg-gradient-to-br from-purple-500/30 to-purple-500/10 border-purple-500/30",
    button: "bg-purple-500 hover:bg-purple-400 shadow-purple-500/30",
    tag: { label: "MOST POPULAR", icon: <Flame size={11} />, cls: "bg-gradient-to-r from-purple-500 to-pink-500 text-white" },
  },
  {
    icon: <Crown size={20} className="text-amber-400" />,
    name: "Elite",
    accentText: "text-amber-400",
    accentBg: "bg-amber-500/15",
    accentBorder: "border-amber-500/30",
    glow: "shadow-amber-500/15",
    gradient: "from-amber-500/15 via-amber-500/5 to-transparent",
    iconBg: "bg-gradient-to-br from-amber-500/30 to-amber-500/10 border-amber-500/30",
    button: "bg-amber-500 hover:bg-amber-400 shadow-amber-500/25",
    tag: null,
  },
  {
    icon: <Gem size={20} className="text-rose-400" />,
    name: "VIP",
    accentText: "text-rose-400",
    accentBg: "bg-rose-500/15",
    accentBorder: "border-rose-500/30",
    glow: "shadow-rose-500/15",
    gradient: "from-rose-500/15 via-rose-500/5 to-transparent",
    iconBg: "bg-gradient-to-br from-rose-500/30 to-rose-500/10 border-rose-500/30",
    button: "bg-rose-500 hover:bg-rose-400 shadow-rose-500/25",
    tag: { label: "HIGHEST RETURN", icon: <Sparkles size={11} />, cls: "bg-gradient-to-r from-rose-500 to-amber-500 text-white" },
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

  const estimatedProfit = () => {
    const amt = parseFloat(investAmount);
    if (!amt || isNaN(amt) || !activePlan) return null;
    return ((amt * activePlan.profitRate) / 100).toFixed(2);
  };

  // Calculate actual dollar profit at MIN investment
  const profitAtMin = (plan) => Math.round((plan.minAmount * plan.profitRate) / 100);

  // Match plan to its style by name
  const getStyleForPlan = (plan, idx) => {
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
        <div className="absolute w-[700px] h-[700px] bg-emerald-500/10 blur-[180px] rounded-full top-[-200px] left-[-150px]" />
        <div className="absolute w-[500px] h-[500px] bg-purple-500/8 blur-[160px] rounded-full top-[40%] right-[-100px]" />
        <div className="absolute w-[400px] h-[400px] bg-blue-500/6 blur-[140px] rounded-full bottom-[-100px] left-[30%]" />
        <div className="absolute inset-0 opacity-[0.018]" style={{ backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      </div>

      <main className="relative z-10 px-4 pt-20 max-w-6xl mx-auto">

        {/* HERO — premium and inviting */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-5 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <Sparkles size={12} /> Investment Plans
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
            Choose Your Path to{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
              Wealth
            </span>
          </h1>
          <p className="text-white/45 text-base max-w-lg mx-auto leading-relaxed">
            Premium investment plans engineered to grow your capital with consistent, predictable returns.
          </p>
        </motion.div>

        {/* PLAN CARDS GRID — premium polish */}
        {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <TrendingUp size={32} className="text-white/15" />
            <p className="text-white font-semibold">{t("common.noPlans")}</p>
            <p className="text-white/30 text-sm">{t("common.noPlansDesc")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {plans.map((plan, idx) => {
              const style = getStyleForPlan(plan, idx);
              const profit = profitAtMin(plan);
              const isFeatured = !!style.tag;

              return (
                <motion.div key={plan._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.5 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className={`relative group ${isFeatured ? "lg:-translate-y-2" : ""}`}>

                  {/* Featured glow */}
                  {isFeatured && (
                    <div className={`absolute -inset-px rounded-3xl bg-gradient-to-b ${style.gradient} blur-xl opacity-60 group-hover:opacity-90 transition-opacity`} />
                  )}

                  <div className={`relative h-full rounded-3xl border ${style.accentBorder} bg-gradient-to-b ${style.gradient} backdrop-blur-xl overflow-hidden flex flex-col ${isFeatured ? `shadow-2xl ${style.glow}` : ""}`}>

                    {/* Top accent line */}
                    <div className={`h-1 bg-gradient-to-r ${style.gradient.replace("from-", "from-").replace("/15", "").replace("/5", "")}`} />

                    {/* Tag badge for featured */}
                    {style.tag && (
                      <div className="absolute top-4 right-4 z-10">
                        <span className={`flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wider ${style.tag.cls} shadow-lg`}>
                          {style.tag.icon} {style.tag.label}
                        </span>
                      </div>
                    )}

                    <div className="p-6 flex flex-col gap-5 flex-1">

                      {/* Plan header */}
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${style.iconBg}`}>
                          {style.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold text-lg tracking-tight">{plan.name}</h3>
                          <p className="text-white/40 text-xs flex items-center gap-1 mt-0.5">
                            <Clock size={11} /> {plan.duration} {t("common.days")} duration
                          </p>
                        </div>
                      </div>

                      {/* THE BIG PROFIT NUMBER — what sells the plan */}
                      <div className={`relative rounded-2xl border ${style.accentBorder} ${style.accentBg} p-5 overflow-hidden`}>
                        {/* Subtle pattern */}
                        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5 blur-2xl" />

                        <div className="relative">
                          <p className="text-white/50 text-[11px] uppercase tracking-widest mb-1 font-semibold">
                            Earn up to
                          </p>
                          <div className="flex items-baseline gap-1">
                            <span className={`text-4xl font-bold ${style.accentText} tracking-tight`}>
                              ${Math.round((plan.maxAmount * plan.profitRate) / 100).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-white/40 text-xs mt-1">
                            on a ${Number(plan.maxAmount).toLocaleString()} investment
                          </p>
                        </div>
                      </div>

                      {/* Investment range — clean and clear */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/8">
                          <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Min Invest</p>
                          <p className="text-white font-bold text-sm">${Number(plan.minAmount).toLocaleString()}</p>
                          <p className="text-white/30 text-[10px] mt-0.5">→ Earn +${Number(profit).toLocaleString()}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/8">
                          <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Max Invest</p>
                          <p className="text-white font-bold text-sm">${Number(plan.maxAmount).toLocaleString()}</p>
                          <p className={`text-[10px] mt-0.5 font-semibold ${style.accentText}`}>{plan.profitRate}% return</p>
                        </div>
                      </div>

                      {/* Features list — clean */}
                      <ul className="space-y-1.5 flex-1">
                        {[
                          `${plan.profitRate}% guaranteed profit rate`,
                          `${plan.duration}-day investment cycle`,
                          "Automatic profit credit",
                          "24/7 dashboard tracking",
                        ].map((feat, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-white/55">
                            <div className={`w-4 h-4 rounded-full ${style.accentBg} flex items-center justify-center shrink-0`}>
                              <Check size={9} className={style.accentText} />
                            </div>
                            {feat}
                          </li>
                        ))}
                      </ul>

                      {/* THE CTA — bold and impossible to miss */}
                      <button onClick={() => openModal(plan, style)}
                        className={`w-full py-3.5 rounded-xl ${style.button} text-white font-bold text-sm transition-all shadow-xl flex items-center justify-center gap-2 group/btn`}>
                        Invest in {plan.name}
                        <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Trust footer — subtle and clean */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-10 pt-6 border-t border-white/5">
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <Shield size={13} className="text-emerald-400" />
            Bank-Grade Security
          </div>
          <span className="text-white/15">·</span>
          <div className="flex items-center gap-2 text-white/40 text-xs">
            🔒 SSL Encrypted
          </div>
          <span className="text-white/15">·</span>
          <div className="flex items-center gap-2 text-white/40 text-xs">
            ⚡ Instant Activation
          </div>
          <span className="text-white/15">·</span>
          <div className="flex items-center gap-2 text-white/40 text-xs">
            ✓ Verified Platform
          </div>
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
                      {activeStyle.icon}
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

                {/* Amount input — the focal point */}
                <div className="mb-5">
                  <label className="text-[11px] font-bold text-white/45 uppercase tracking-widest block mb-2">
                    How much do you want to invest?
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold text-lg">$</span>
                    <input type="number" value={investAmount} onChange={handleAmountChange}
                      min={activePlan.minAmount} max={activePlan.maxAmount}
                      placeholder={`${activePlan.minAmount}`}
                      className={`w-full pl-9 pr-4 py-4 rounded-2xl bg-white/5 border-2 ${amountError ? "border-red-500/40" : `${activeStyle.accentBorder}`} outline-none transition-all text-xl font-bold text-white placeholder:text-white/25`} />
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

                {/* Profit preview — big and motivating */}
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
                    className="flex-1 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/50 text-sm font-semibold hover:bg-white/10 transition-all">
                    {t("common.cancel")}
                  </button>
                  {balanceCheck === "insufficient" ? (
                    <button onClick={() => navigate("/deposit")}
                      className={`flex-1 py-3.5 rounded-2xl ${activeStyle.button} text-white text-sm font-bold transition-all shadow-xl`}>
                      {t("common.depositFunds")}
                    </button>
                  ) : (
                    <button onClick={handleConfirm}
                      disabled={confirming || balanceCheck === "success" || !!amountError || !investAmount}
                      className={`flex-1 py-3.5 rounded-2xl ${activeStyle.button} text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl`}>
                      {confirming && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      {confirming ? t("common.processing") : "Confirm Investment"}
                    </button>
                  )}
                </div>

                {/* Trust line */}
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
