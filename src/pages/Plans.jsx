import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Check, X, ArrowRight, AlertTriangle, Zap, Shield, Star } from "lucide-react";

const API_URL = "https://mexicatradingbackend.onrender.com";

const planIcons = [
  <Zap size={24} className="text-emerald-400" />,
  <TrendingUp size={24} className="text-blue-400" />,
  <Star size={24} className="text-purple-400" />,
];

const planColors = [
  { border: "border-emerald-500/30", bg: "bg-emerald-500/10", icon: "bg-emerald-500/15 border-emerald-500/25", badge: "bg-emerald-500/15 text-emerald-400" },
  { border: "border-blue-500/30", bg: "bg-blue-500/10", icon: "bg-blue-500/15 border-blue-500/25", badge: "bg-blue-500/15 text-blue-400" },
  { border: "border-purple-500/30", bg: "bg-purple-500/10", icon: "bg-purple-500/15 border-purple-500/25", badge: "bg-purple-500/15 text-purple-400" },
];

export default function Plans() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [balanceCheck, setBalanceCheck] = useState(null);
  const [message, setMessage] = useState("");

  // Fetch plans from backend
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
    setModalOpen(true);
    setMessage("");
    setBalanceCheck(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActivePlan(null);
    setBalanceCheck(null);
    setMessage("");
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const token = sessionStorage.getItem("token");

      const profileRes = await fetch(`${API_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileRes.json();
      const balance = profileData.balance || 0;

      if (balance < activePlan.minAmount) {
        setBalanceCheck("insufficient");
        setConfirming(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/investments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: activePlan.name,
          amount: activePlan.minAmount,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setBalanceCheck("success");
        setMessage("Investment confirmed successfully!");
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setMessage(data.message || "Transaction failed. Please try again.");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#080c18] gap-4">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-white/30 text-sm animate-pulse">{t("common.loading")}</p>
      </div>
    );

  return (
    <div className="relative min-h-screen bg-[#080c18] text-white overflow-hidden pb-16">

      {/* BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[600px] h-[600px] bg-emerald-500/8 blur-[150px] rounded-full top-[-200px] left-[-200px]" />
        <div className="absolute w-[500px] h-[500px] bg-blue-500/6 blur-[140px] rounded-full bottom-[-200px] right-[-200px]" />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      </div>

      <main className="relative z-10 px-4 pt-24 pb-16 max-w-6xl mx-auto">

        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium tracking-widest uppercase mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Investment Plans
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Plan</span>
          </h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Select the investment plan that best fits your financial goals and start growing your wealth today.
          </p>
        </motion.div>

        {/* PLAN CARDS */}
        {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <TrendingUp size={24} className="text-white/20" />
            </div>
            <p className="text-white font-semibold">No Plans Available</p>
            <p className="text-white/30 text-sm">Investment plans will appear here once they are added.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan, idx) => {
              const color = planColors[idx % planColors.length];
              const icon = planIcons[idx % planIcons.length];

              return (
                <motion.div
                  key={plan._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -4 }}
                  className={`relative p-6 rounded-3xl border ${color.border} bg-white/[0.03] backdrop-blur-xl flex flex-col gap-5 hover:bg-white/[0.05] transition-all duration-300`}
                >
                  {/* Plan Header */}
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${color.icon}`}>
                      {icon}
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${color.badge}`}>
                      {plan.profitRate}% ROI
                    </span>
                  </div>

                  {/* Plan Name & Duration */}
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    {plan.description && <p className="text-white/40 text-sm mt-1">{plan.description}</p>}
                    {plan.duration && <p className="text-white/30 text-xs mt-1">{plan.duration} days duration</p>}
                  </div>

                  {/* Price */}
                  <div className="py-4 border-t border-b border-white/8">
                    <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Minimum Investment</p>
                    <p className="text-3xl font-bold text-white">${Number(plan.minAmount).toLocaleString()}</p>
                    <p className="text-white/30 text-xs mt-1">Maximum: ${Number(plan.maxAmount).toLocaleString()}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 flex-1">
                    {[
                      `Min: $${Number(plan.minAmount).toLocaleString()} — Max: $${Number(plan.maxAmount).toLocaleString()}`,
                      `${plan.profitRate}% profit rate`,
                      `${plan.duration} day${plan.duration !== 1 ? "s" : ""} investment period`,
                      "Automatic profit credit",
                      "24/7 dashboard tracking",
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-white/60">
                        <Check size={14} className="text-emerald-400 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => openModal(plan)}
                    className="group w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    Choose Plan
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Trust note */}
        <div className="flex items-center justify-center gap-6 mt-12 text-white/20 text-xs">
          <span className="flex items-center gap-1.5"><Shield size={12} /> Secured Investment</span>
          <span>·</span>
          <span>🔒 {t("common.sslSecured")}</span>
          <span>·</span>
          <span>⚡ Instant Activation</span>
        </div>
      </main>

      {/* CONFIRM MODAL */}
      <AnimatePresence>
        {modalOpen && activePlan && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="absolute inset-0" onClick={closeModal} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#0e1422] border border-white/10 rounded-3xl p-6 z-10 shadow-2xl">

              {/* Modal Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">Confirm Investment</h2>
                <button onClick={closeModal} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition">
                  <X size={15} />
                </button>
              </div>

              {/* Plan Summary */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Plan</span>
                  <span className="text-white font-semibold">{activePlan.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Amount</span>
                  <span className="text-emerald-400 font-bold">${Number(activePlan.minAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Profit Rate</span>
                  <span className="text-white font-semibold">{activePlan.profitRate}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Duration</span>
                  <span className="text-white font-semibold">{activePlan.duration} days</span>
                </div>
              </div>

              {/* Status Messages */}
              <AnimatePresence>
                {balanceCheck === "insufficient" && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                    <AlertTriangle size={15} />
                    Insufficient balance. Please deposit funds first.
                  </motion.div>
                )}
                {balanceCheck === "success" && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-4">
                    <Check size={15} />
                    {message}
                  </motion.div>
                )}
                {message && balanceCheck !== "success" && balanceCheck !== "insufficient" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                    {message}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Buttons */}
              <div className="flex gap-3">
                <button onClick={closeModal}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/50 text-sm font-medium hover:bg-white/10 transition-all">
                  {t("common.cancel")}
                </button>
                {balanceCheck === "insufficient" ? (
                  <button onClick={() => navigate("/deposit")}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all">
                    Deposit Funds
                  </button>
                ) : (
                  <button onClick={handleConfirm} disabled={confirming || balanceCheck === "success"}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {confirming ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                    {confirming ? "Processing..." : "Confirm"}
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
