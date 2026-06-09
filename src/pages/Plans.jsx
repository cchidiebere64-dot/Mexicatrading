import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Check, X, AlertTriangle,
  Zap, Shield, Star, Crown, Gem, Sparkles, Clock,
  Flame, ChevronRight, BadgeCheck, Users, Wallet, ArrowRight,
} from "lucide-react";

const API_URL = "https://mexicatradingbackend.onrender.com";

export default function Plans() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const L = {
    investmentPlans: t("plans.investmentPlans", "Investment Plans"),
    choosePathTo: t("plans.choosePathTo", "Choose Your Path to"),
    wealth: t("plans.wealth", "Wealth"),
    subtitle: t("plans.subtitle", "Premium plans engineered for consistent, predictable returns."),
    popular: t("plans.popular", "POPULAR"),
    topReturn: t("plans.topReturn", "TOP RETURN"),
    earn: t("plans.earn", "Earn"),
    on: t("plans.on", "on"),
    bankGrade: t("plans.bankGrade", "Bank-Grade Security"),
    sslEncrypted: t("plans.sslEncrypted", "SSL Encrypted"),
    instantActivation: t("plans.instantActivation", "Instant Activation"),
    returnLabel: t("plans.return", "return"),
    howMuch: t("plans.howMuch", "How much do you want to invest?"),
    min: t("plans.min", "Min"),
    max: t("plans.max", "Max"),
    youWillEarn: t("plans.youWillEarn", "You will earn"),
    inLabel: t("plans.in", "In"),
    confirmInvestment: t("plans.confirmInvestment", "Confirm Investment"),
    secured: t("plans.secured", "Secured"),
    ssl: t("plans.ssl", "SSL"),
    instant: t("plans.instant", "Instant"),
    enterValidAmount: t("plans.enterValidAmount", "Please enter a valid amount."),
    minimumIs: t("plans.minimumIs", "Minimum is"),
    maximumIs: t("plans.maximumIs", "Maximum is"),
    transactionFailed: t("plans.transactionFailed", "Transaction failed. Please try again."),
    networkError: t("plans.networkError", "Network error. Please try again."),
    days: t("common.days", "days"),
    cancel: t("common.cancel", "Cancel"),
    processing: t("common.processing", "Processing..."),
    insufficientBalance: t("common.insufficientBalance", "Insufficient balance"),
    depositFunds: t("common.depositFunds", "Deposit Funds"),
    investmentSuccess: t("common.investmentSuccess", "Investment created successfully!"),
    loading: t("common.loading", "Loading..."),
    noPlans: t("common.noPlans", "No Plans Available"),
    noPlansDesc: t("common.noPlansDesc", "Investment plans will appear here once published."),
  };

  /* ── Plan tier styles ── */
  const planTiers = [
    {
      name: "Starter",
      icon: <Zap size={20} />,
      benefit: "Perfect starting point — grow with zero pressure.",
      accentText: "text-emerald-400",
      accentBg: "bg-emerald-500/15",
      accentBorder: "border-emerald-500/30",
      iconBg: "bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 border-emerald-500/30",
      cardGlow: "rgba(16,185,129,.06)",
      button: "bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/25",
      gradient: "from-emerald-500/8 to-transparent",
      tag: null,
    },
    {
      name: "Basic",
      icon: <TrendingUp size={20} />,
      benefit: "Step up your returns — built for growing investors.",
      accentText: "text-blue-400",
      accentBg: "bg-blue-500/15",
      accentBorder: "border-blue-500/30",
      iconBg: "bg-gradient-to-br from-blue-500/30 to-blue-500/10 border-blue-500/30",
      cardGlow: "rgba(59,130,246,.06)",
      button: "bg-blue-500 hover:bg-blue-400 shadow-blue-500/25",
      gradient: "from-blue-500/8 to-transparent",
      tag: null,
    },
    {
      name: "Premium",
      icon: <Star size={20} />,
      benefit: "Our most chosen plan — serious returns, serious results.",
      accentText: "text-purple-400",
      accentBg: "bg-purple-500/15",
      accentBorder: "border-purple-500/40",
      iconBg: "bg-gradient-to-br from-purple-500/30 to-purple-500/10 border-purple-500/30",
      cardGlow: "rgba(168,85,247,.08)",
      button: "bg-purple-500 hover:bg-purple-400 shadow-purple-500/30",
      gradient: "from-purple-500/12 to-transparent",
      tag: { label: L.popular, icon: <Flame size={9} />, cls: "bg-gradient-to-r from-purple-500 to-pink-500 text-white" },
    },
    {
      name: "Elite",
      icon: <Crown size={20} />,
      benefit: "For investors who know what they want.",
      accentText: "text-amber-400",
      accentBg: "bg-amber-500/15",
      accentBorder: "border-amber-500/30",
      iconBg: "bg-gradient-to-br from-amber-500/30 to-amber-500/10 border-amber-500/30",
      cardGlow: "rgba(245,158,11,.06)",
      button: "bg-amber-500 hover:bg-amber-400 shadow-amber-500/25",
      gradient: "from-amber-500/8 to-transparent",
      tag: null,
    },
    {
      name: "VIP",
      icon: <Gem size={20} />,
      benefit: "Maximum returns — exclusively for serious capital.",
      accentText: "text-rose-400",
      accentBg: "bg-rose-500/15",
      accentBorder: "border-rose-500/30",
      iconBg: "bg-gradient-to-br from-rose-500/30 to-rose-500/10 border-rose-500/30",
      cardGlow: "rgba(244,63,94,.06)",
      button: "bg-rose-500 hover:bg-rose-400 shadow-rose-500/25",
      gradient: "from-rose-500/8 to-transparent",
      tag: { label: L.topReturn, icon: <Sparkles size={9} />, cls: "bg-gradient-to-r from-rose-500 to-amber-500 text-white" },
    },
  ];

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
      setAmountError(L.enterValidAmount);
    } else if (num < activePlan.minAmount) {
      setAmountError(`${L.minimumIs} $${Number(activePlan.minAmount).toLocaleString()}`);
    } else if (num > activePlan.maxAmount) {
      setAmountError(`${L.maximumIs} $${Number(activePlan.maxAmount).toLocaleString()}`);
    }
  };

  const handleConfirm = async () => {
    const amount = parseFloat(investAmount);
    if (!amount || isNaN(amount)) { setAmountError(L.enterValidAmount); return; }
    if (amount < activePlan.minAmount) { setAmountError(`${L.minimumIs} $${Number(activePlan.minAmount).toLocaleString()}`); return; }
    if (amount > activePlan.maxAmount) { setAmountError(`${L.maximumIs} $${Number(activePlan.maxAmount).toLocaleString()}`); return; }

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
        setMessage(L.investmentSuccess);
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setMessage(data.message || L.transactionFailed);
      }
    } catch {
      setMessage(L.networkError);
    } finally {
      setConfirming(false);
    }
  };

  const estimatedProfit = () => {
    const amt = parseFloat(investAmount);
    if (!amt || isNaN(amt) || !activePlan) return null;
    return ((amt * activePlan.profitRate) / 100).toFixed(2);
  };

  const getStyle = (plan, idx) => {
    const tier = planTiers.find(t => t.name.toLowerCase() === plan.name?.toLowerCase());
    return tier || planTiers[idx % planTiers.length];
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#080c18] gap-4">
      <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
      <p className="text-white/30 text-sm animate-pulse">{L.loading}</p>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#080c18] text-white overflow-hidden pb-16"
      style={{ fontFamily:"'Montserrat',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Montserrat:wght@300;400;500;600;700&display=swap');
        :root{--em:#10b981;--teal:#14b8a6;}
        .serif{font-family:'Cormorant Garamond',serif;}
        .gradtext{background:linear-gradient(135deg,var(--em),var(--teal));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
        @keyframes shine{0%{background-position:200% center}100%{background-position:-200% center}}
        .shine-badge{border:1px solid transparent;background:linear-gradient(rgba(8,12,24,.6),rgba(8,12,24,.6)) padding-box,linear-gradient(90deg,transparent 20%,var(--em) 50%,transparent 80%) border-box;background-size:200% auto;animation:shine 4s linear infinite;}
        @keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(400%)}}
        .plan-card{transition:transform .3s,box-shadow .3s;}
        .plan-card:hover{transform:translateY(-3px);}
      `}</style>

      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[160px] top-[-150px] left-[-100px]" style={{background:"rgba(16,185,129,.07)"}} />
        <div className="absolute w-[400px] h-[400px] rounded-full blur-[140px] top-[40%] right-[-80px]" style={{background:"rgba(20,184,166,.05)"}} />
        <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage:`linear-gradient(rgba(16,185,129,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,.5) 1px,transparent 1px)`,backgroundSize:"60px 60px"}} />
      </div>

      <main className="relative z-10 px-4 pt-20 max-w-2xl mx-auto">

        {/* ── HERO ── */}
        <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:.6}} className="text-center mb-10">
          <div className="shine-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-semibold tracking-[.28em] uppercase mb-6" style={{color:"var(--em)"}}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:"var(--em)"}} />
            <Sparkles size={10} /> {L.investmentPlans}
          </div>
          <h1 className="serif font-light mb-4" style={{fontSize:"clamp(32px,7vw,56px)",lineHeight:1.05}}>
            {L.choosePathTo}{" "}
            <em className="gradtext" style={{fontStyle:"italic"}}>{L.wealth}</em>
          </h1>
          <p className="text-sm font-light max-w-sm mx-auto leading-relaxed" style={{color:"rgba(255,255,255,.5)"}}>
            Every plan includes your principal back plus profit — no hidden fees, no surprises. Start with any amount you're comfortable with.
          </p>
        </motion.div>

        {/* ── WHY INVEST — 3 quick trust points ── */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.15,duration:.6}}
          className="grid grid-cols-3 gap-3 mb-10">
          {[
            { icon:<BadgeCheck size={16}/>, label:"Principal Returned", sub:"You always get your money back" },
            { icon:<Users size={16}/>,     label:"50,000+ Members",     sub:"Trusted worldwide"             },
            { icon:<Wallet size={16}/>,    label:"Withdraw Anytime",    sub:"Processed within 24h"         },
          ].map((item,i)=>(
            <div key={i} className="text-center p-3 border rounded-2xl" style={{borderColor:"rgba(16,185,129,.15)",background:"rgba(16,185,129,.04)"}}>
              <div className="flex justify-center mb-1.5" style={{color:"var(--em)"}}>{item.icon}</div>
              <p className="text-white text-[11px] font-semibold leading-tight">{item.label}</p>
              <p className="text-[10px] mt-0.5" style={{color:"rgba(255,255,255,.35)"}}>{item.sub}</p>
            </div>
          ))}
        </motion.div>

        {/* ── PLAN CARDS ── */}
        {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <TrendingUp size={32} className="text-white/15" />
            <p className="text-white font-semibold">{L.noPlans}</p>
            <p className="text-white/30 text-sm">{L.noPlansDesc}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan, idx) => {
              const style = getStyle(plan, idx);
              const profit = Math.round((plan.minAmount * plan.profitRate) / 100);
              return (
                <motion.div
                  key={plan._id}
                  initial={{opacity:0,y:24}}
                  animate={{opacity:1,y:0}}
                  transition={{delay:idx*.08,duration:.5}}
                  className="plan-card">
                  <button
                    onClick={() => openModal(plan, style)}
                    className="w-full text-left relative overflow-hidden rounded-2xl border"
                    style={{
                      borderColor: style.tag ? "rgba(168,85,247,.35)" : "rgba(255,255,255,.08)",
                      background: `linear-gradient(135deg,${style.cardGlow},rgba(8,12,24,.6))`,
                      boxShadow: style.tag ? "0 0 0 1px rgba(168,85,247,.1),0 8px 32px rgba(0,0,0,.3)" : "0 4px 20px rgba(0,0,0,.25)",
                    }}>

                    {/* Popular / Top Return badge */}
                    {style.tag && (
                      <div className={`absolute top-0 right-0 flex items-center gap-1 px-3 py-1 text-[9px] font-bold tracking-widest rounded-bl-xl ${style.tag.cls}`}>
                        {style.tag.icon} {style.tag.label}
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 ${style.iconBg}`}>
                          <span className={style.accentText}>{style.icon}</span>
                        </div>

                        {/* Left: name + benefit + meta */}
                        <div className="flex-1 min-w-0 pt-0.5">
                          <h3 className="text-white font-bold text-base mb-1">{plan.name}</h3>
                          <p className="text-xs font-light mb-2.5" style={{color:"rgba(255,255,255,.45)"}}>{style.benefit}</p>
                          <div className="flex items-center gap-3 text-[11px]" style={{color:"rgba(255,255,255,.35)"}}>
                            <span className="flex items-center gap-1"><Clock size={10}/> {plan.duration} {L.days}</span>
                            <span>·</span>
                            <span>${Number(plan.minAmount).toLocaleString()} – ${Number(plan.maxAmount).toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Right: profit + chevron */}
                        <div className="text-right shrink-0 pt-0.5">
                          <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{color:"rgba(255,255,255,.3)"}}>Earn</p>
                          <p className={`font-bold text-xl leading-tight ${style.accentText}`}>
                            +${profit.toLocaleString()}
                          </p>
                          <p className="text-[10px] mt-0.5" style={{color:"rgba(255,255,255,.25)"}}>on ${Number(plan.minAmount).toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Bottom row: profit rate pill + invest button */}
                      <div className="flex items-center justify-between mt-4 pt-4" style={{borderTop:"1px solid rgba(255,255,255,.06)"}}>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${style.accentBg} ${style.accentText} border ${style.accentBorder}`}>
                            {plan.profitRate}% {L.returnLabel}
                          </span>
                          <span className="text-[10px]" style={{color:"rgba(255,255,255,.25)"}}>· principal included</span>
                        </div>
                        <div className={`flex items-center gap-1.5 text-xs font-semibold ${style.accentText}`}>
                          Invest Now <ArrowRight size={13}/>
                        </div>
                      </div>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Trust footer */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.5}}
          className="flex flex-wrap items-center justify-center gap-4 mt-10 pt-6" style={{borderTop:"1px solid rgba(255,255,255,.05)"}}>
          {[
            [<Shield size={11}/>, L.bankGrade],
            ["🔒", L.sslEncrypted],
            ["⚡", L.instantActivation],
          ].map(([icon,label],i)=>(
            <div key={i} className="flex items-center gap-1.5 text-[11px]" style={{color:"rgba(255,255,255,.3)"}}>
              <span style={{color:"var(--em)"}}>{icon}</span> {label}
            </div>
          ))}
        </motion.div>
      </main>

      {/* ══════════════════════════════════════════════════
          INVEST MODAL — same logic, premium new look
      ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {modalOpen && activePlan && activeStyle && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4">
            <div className="absolute inset-0" onClick={closeModal} />

            <motion.div
              initial={{opacity:0,y:60}} animate={{opacity:1,y:0}} exit={{opacity:0,y:60}}
              transition={{type:"spring",damping:28,stiffness:320}}
              className="relative w-full sm:max-w-md z-10 shadow-2xl overflow-hidden rounded-t-3xl sm:rounded-3xl"
              style={{background:"linear-gradient(160deg,#0d1525,#080c18)",border:"1px solid rgba(255,255,255,.1)"}}>

              {/* Modal header */}
              <div className="relative px-6 py-5 border-b overflow-hidden" style={{borderColor:"rgba(255,255,255,.07)",background:`linear-gradient(135deg,${style.cardGlow || "rgba(16,185,129,.06)"},transparent)`}}>
                {/* shimmer line */}
                <div className="absolute top-0 left-0 right-0 h-[1px]" style={{background:`linear-gradient(90deg,transparent,${activeStyle.accentText.replace("text-","").replace("-400","")},transparent)`}} />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${activeStyle.iconBg}`}>
                      <span className={activeStyle.accentText}>{activeStyle.icon}</span>
                    </div>
                    <div>
                      <h2 className="serif font-light text-white text-xl">{activePlan.name} <em className="gradtext" style={{fontStyle:"italic"}}>Plan</em></h2>
                      <p className="text-[11px] mt-0.5" style={{color:"rgba(255,255,255,.4)"}}>
                        {activePlan.duration} {L.days} · {activePlan.profitRate}% {L.returnLabel}
                      </p>
                    </div>
                  </div>
                  <button onClick={closeModal}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition" style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.4)"}}>
                    <X size={15}/>
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[72vh] overflow-y-auto">

                {/* Amount input */}
                <div className="mb-5">
                  <label className="text-[10px] font-semibold uppercase tracking-[.2em] block mb-2.5" style={{color:"rgba(255,255,255,.4)"}}>
                    {L.howMuch}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-xl" style={{color:"rgba(255,255,255,.35)"}}>$</span>
                    <input type="number" value={investAmount} onChange={handleAmountChange}
                      min={activePlan.minAmount} max={activePlan.maxAmount}
                      placeholder={`${activePlan.minAmount}`}
                      className="w-full pl-10 pr-4 py-4 text-2xl font-bold text-white outline-none transition-all rounded-2xl"
                      style={{
                        background:"rgba(255,255,255,.04)",
                        border:`2px solid ${amountError ? "rgba(239,68,68,.4)" : "rgba(16,185,129,.3)"}`,
                        caretColor:"var(--em)",
                      }} />
                  </div>
                  <div className="flex justify-between mt-2 text-[11px]" style={{color:"rgba(255,255,255,.3)"}}>
                    <span>{L.min}: ${Number(activePlan.minAmount).toLocaleString()}</span>
                    <span>{L.max}: ${Number(activePlan.maxAmount).toLocaleString()}</span>
                  </div>
                  {amountError && (
                    <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                      <AlertTriangle size={11}/> {amountError}
                    </p>
                  )}
                </div>

                {/* Quick amount buttons */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[activePlan.minAmount, Math.round((activePlan.minAmount+activePlan.maxAmount)/2), activePlan.maxAmount].map((amt,i)=>(
                    <button key={i}
                      onClick={()=>{setInvestAmount(String(amt));setAmountError("");setBalanceCheck(null);setMessage("");}}
                      className="py-2.5 rounded-xl text-xs font-bold border transition-all"
                      style={parseFloat(investAmount)===amt
                        ? {background:`${activeStyle.cardGlow}`,border:`1px solid rgba(16,185,129,.4)`,color:"var(--em)"}
                        : {background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",color:"rgba(255,255,255,.45)"}}>
                      ${Number(amt).toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* Profit preview */}
                <AnimatePresence>
                  {estimatedProfit() && !amountError && (
                    <motion.div initial={{opacity:0,scale:.96}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.96}}
                      className="mb-5 p-5 rounded-2xl border"
                      style={{background:"rgba(16,185,129,.05)",border:"1px solid rgba(16,185,129,.2)"}}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-[.2em] mb-1" style={{color:"rgba(255,255,255,.4)"}}>
                            {L.youWillEarn}
                          </p>
                          <p className="font-bold gradtext" style={{fontSize:"clamp(28px,6vw,38px)",lineHeight:1}}>
                            +${Number(estimatedProfit()).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-[.2em] mb-1" style={{color:"rgba(255,255,255,.4)"}}>In</p>
                          <p className="text-white font-bold text-2xl">{activePlan.duration}</p>
                          <p className="text-[10px]" style={{color:"rgba(255,255,255,.35)"}}>{L.days}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 flex items-center gap-2 text-[11px]" style={{borderTop:"1px solid rgba(255,255,255,.06)",color:"rgba(255,255,255,.35)"}}>
                        <Check size={11} style={{color:"var(--em)"}}/>
                        Principal of ${Number(parseFloat(investAmount)||0).toLocaleString()} returned with profit
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Status messages */}
                <AnimatePresence>
                  {balanceCheck==="insufficient" && (
                    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
                      className="flex items-center gap-3 p-4 rounded-xl text-sm mb-4"
                      style={{background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.2)",color:"#f87171"}}>
                      <AlertTriangle size={15}/> {L.insufficientBalance}
                    </motion.div>
                  )}
                  {balanceCheck==="success" && (
                    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
                      className="flex items-center gap-3 p-4 rounded-xl text-sm mb-4"
                      style={{background:"rgba(16,185,129,.08)",border:"1px solid rgba(16,185,129,.2)",color:"var(--em)"}}>
                      <Check size={15}/> {message}
                    </motion.div>
                  )}
                  {message && balanceCheck!=="success" && balanceCheck!=="insufficient" && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}}
                      className="p-4 rounded-xl text-sm mb-4"
                      style={{background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.2)",color:"#f87171"}}>
                      {message}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button onClick={closeModal}
                    className="flex-1 py-4 rounded-2xl text-sm font-semibold transition"
                    style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.09)",color:"rgba(255,255,255,.45)"}}>
                    {L.cancel}
                  </button>
                  {balanceCheck==="insufficient" ? (
                    <button onClick={()=>navigate("/deposit")}
                      className={`flex-1 py-4 rounded-2xl text-white text-sm font-bold transition shadow-xl ${activeStyle.button}`}>
                      {L.depositFunds}
                    </button>
                  ) : (
                    <button onClick={handleConfirm}
                      disabled={confirming||balanceCheck==="success"||!!amountError||!investAmount}
                      className={`flex-1 py-4 rounded-2xl text-white text-sm font-bold transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl ${activeStyle.button}`}>
                      {confirming && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
                      {confirming ? L.processing : L.confirmInvestment}
                    </button>
                  )}
                </div>

                {/* Security strip */}
                <div className="flex items-center justify-center gap-3 mt-4 text-[10px]" style={{color:"rgba(255,255,255,.22)"}}>
                  <span className="flex items-center gap-1"><Shield size={10} style={{color:"var(--em)"}}/> {L.secured}</span>
                  <span>·</span>
                  <span>🔒 {L.ssl}</span>
                  <span>·</span>
                  <span>⚡ {L.instant}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}






















{/*import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Check, X, AlertTriangle,
  Zap, Shield, Star, Crown, Gem, Sparkles, Clock,
  Flame, ChevronRight
} from "lucide-react";

const API_URL = "https://mexicatradingbackend.onrender.com";

export default function Plans() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // ── Translation shortcuts with English fallbacks ────────────────────────
  const L = {
    investmentPlans: t("plans.investmentPlans", "Investment Plans"),
    choosePathTo: t("plans.choosePathTo", "Choose Your Path to"),
    wealth: t("plans.wealth", "Wealth"),
    subtitle: t("plans.subtitle", "Premium plans engineered for consistent, predictable returns."),
    popular: t("plans.popular", "POPULAR"),
    topReturn: t("plans.topReturn", "TOP RETURN"),
    earn: t("plans.earn", "Earn"),
    on: t("plans.on", "on"),
    bankGrade: t("plans.bankGrade", "Bank-Grade Security"),
    sslEncrypted: t("plans.sslEncrypted", "SSL Encrypted"),
    instantActivation: t("plans.instantActivation", "Instant Activation"),
    returnLabel: t("plans.return", "return"),
    howMuch: t("plans.howMuch", "How much do you want to invest?"),
    min: t("plans.min", "Min"),
    max: t("plans.max", "Max"),
    youWillEarn: t("plans.youWillEarn", "You will earn"),
    inLabel: t("plans.in", "In"),
    confirmInvestment: t("plans.confirmInvestment", "Confirm Investment"),
    secured: t("plans.secured", "Secured"),
    ssl: t("plans.ssl", "SSL"),
    instant: t("plans.instant", "Instant"),
    enterValidAmount: t("plans.enterValidAmount", "Please enter a valid amount."),
    minimumIs: t("plans.minimumIs", "Minimum is"),
    maximumIs: t("plans.maximumIs", "Maximum is"),
    transactionFailed: t("plans.transactionFailed", "Transaction failed. Please try again."),
    networkError: t("plans.networkError", "Network error. Please try again."),
    days: t("common.days", "days"),
    cancel: t("common.cancel", "Cancel"),
    processing: t("common.processing", "Processing..."),
    insufficientBalance: t("common.insufficientBalance", "Insufficient balance"),
    depositFunds: t("common.depositFunds", "Deposit Funds"),
    investmentSuccess: t("common.investmentSuccess", "Investment created successfully!"),
    loading: t("common.loading", "Loading..."),
    noPlans: t("common.noPlans", "No Plans Available"),
    noPlansDesc: t("common.noPlansDesc", "Investment plans will appear here once published."),
  };

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
      tag: { label: L.popular, icon: <Flame size={9} />, cls: "bg-gradient-to-r from-purple-500 to-pink-500 text-white" },
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
      tag: { label: L.topReturn, icon: <Sparkles size={9} />, cls: "bg-gradient-to-r from-rose-500 to-amber-500 text-white" },
    },
  ];

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
      setAmountError(L.enterValidAmount);
    } else if (num < activePlan.minAmount) {
      setAmountError(`${L.minimumIs} $${Number(activePlan.minAmount).toLocaleString()}`);
    } else if (num > activePlan.maxAmount) {
      setAmountError(`${L.maximumIs} $${Number(activePlan.maxAmount).toLocaleString()}`);
    }
  };

  const handleConfirm = async () => {
    const amount = parseFloat(investAmount);
    if (!amount || isNaN(amount)) { setAmountError(L.enterValidAmount); return; }
    if (amount < activePlan.minAmount) { setAmountError(`${L.minimumIs} $${Number(activePlan.minAmount).toLocaleString()}`); return; }
    if (amount > activePlan.maxAmount) { setAmountError(`${L.maximumIs} $${Number(activePlan.maxAmount).toLocaleString()}`); return; }

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
        setMessage(L.investmentSuccess);
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setMessage(data.message || L.transactionFailed);
      }
    } catch {
      setMessage(L.networkError);
    } finally {
      setConfirming(false);
    }
  };

  const estimatedProfit = () => {
    const amt = parseFloat(investAmount);
    if (!amt || isNaN(amt) || !activePlan) return null;
    return ((amt * activePlan.profitRate) / 100).toFixed(2);
  };

  const getStyle = (plan, idx) => {
    const tier = planTiers.find(t => t.name.toLowerCase() === plan.name?.toLowerCase());
    return tier || planTiers[idx % planTiers.length];
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#080c18] gap-4">
      <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
      <p className="text-white/30 text-sm animate-pulse">{L.loading}</p>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#080c18] text-white overflow-hidden pb-12">

      {/* Background */}
{/*   <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[700px] h-[700px] bg-emerald-500/8 blur-[180px] rounded-full top-[-200px] left-[-150px]" />
        <div className="absolute w-[500px] h-[500px] bg-purple-500/6 blur-[160px] rounded-full top-[40%] right-[-100px]" />
        <div className="absolute inset-0 opacity-[0.018]" style={{ backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      </div>

      <main className="relative z-10 px-4 pt-20 max-w-3xl mx-auto">

        {/* HERO */}
{/*     <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-4 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <Sparkles size={11} /> {L.investmentPlans}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
            {L.choosePathTo}{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">{L.wealth}</span>
          </h1>
          <p className="text-white/45 text-sm max-w-md mx-auto">{L.subtitle}</p>
        </motion.div>

        {/* PLAN LIST */}
{/*      {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <TrendingUp size={32} className="text-white/15" />
            <p className="text-white font-semibold">{L.noPlans}</p>
            <p className="text-white/30 text-sm">{L.noPlansDesc}</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {plans.map((plan, idx) => {
              const style = getStyle(plan, idx);
              const profit = Math.round((plan.minAmount * plan.profitRate) / 100);
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

                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${style.iconBg}`}>
                      <span className={style.accentText}>{style.icon}</span>
                    </div>

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
                        <span className="flex items-center gap-1"><Clock size={10} /> {plan.duration} {L.days}</span>
                        <span>·</span>
                        <span>${Number(plan.minAmount).toLocaleString()} – ${Number(plan.maxAmount).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Profit on minimum investment */}
{/*            <div className="text-right shrink-0">
                      <p className="text-white/35 text-[10px] uppercase tracking-widest">{L.earn}</p>
                      <p className={`${style.accentText} font-bold text-base leading-tight`}>
                        +${profit.toLocaleString()}
                      </p>
                      <p className="text-white/30 text-[10px]">{L.on} ${Number(plan.minAmount).toLocaleString()}</p>
                    </div>

                    <ChevronRight size={16} className={`${style.accentText} opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0`} />
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Trust footer */}
{/*     <div className="flex flex-wrap items-center justify-center gap-3 mt-7 pt-5 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-white/35 text-[11px]">
            <Shield size={11} className="text-emerald-400" /> {L.bankGrade}
          </div>
          <span className="text-white/15">·</span>
          <div className="flex items-center gap-1.5 text-white/35 text-[11px]">🔒 {L.sslEncrypted}</div>
          <span className="text-white/15">·</span>
          <div className="flex items-center gap-1.5 text-white/35 text-[11px]">⚡ {L.instantActivation}</div>
        </div>
      </main>

      {/* ── INVEST MODAL ──────────────────────────────────────────────────── */}
{/*   <AnimatePresence>
        {modalOpen && activePlan && activeStyle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4">
            <div className="absolute inset-0" onClick={closeModal} />
            <motion.div
              initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="relative w-full sm:max-w-md bg-gradient-to-b from-[#0d1525] to-[#0a1120] border border-white/10 rounded-t-3xl sm:rounded-3xl z-10 shadow-2xl overflow-hidden">

              <div className={`relative px-6 py-5 border-b border-white/8 bg-gradient-to-r ${activeStyle.gradient}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${activeStyle.iconBg}`}>
                      <span className={activeStyle.accentText}>{activeStyle.icon}</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">{activePlan.name}</h2>
                      <p className="text-white/40 text-xs">{activePlan.duration} {L.days} · {activePlan.profitRate}% {L.returnLabel}</p>
                    </div>
                  </div>
                  <button onClick={closeModal}
                    className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition">
                    <X size={15} />
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">

                <div className="mb-5">
                  <label className="text-[11px] font-bold text-white/45 uppercase tracking-widest block mb-2">
                    {L.howMuch}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold text-lg">$</span>
                    <input type="number" value={investAmount} onChange={handleAmountChange}
                      min={activePlan.minAmount} max={activePlan.maxAmount}
                      placeholder={`${activePlan.minAmount}`}
                      className={`w-full pl-9 pr-4 py-4 rounded-2xl bg-white/5 border-2 ${amountError ? "border-red-500/40" : activeStyle.accentBorder} outline-none transition-all text-xl font-bold text-white placeholder:text-white/25`} />
                  </div>
                  <div className="flex justify-between mt-2 text-[11px]">
                    <span className="text-white/30">{L.min}: ${Number(activePlan.minAmount).toLocaleString()}</span>
                    <span className="text-white/30">{L.max}: ${Number(activePlan.maxAmount).toLocaleString()}</span>
                  </div>
                  {amountError && (
                    <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                      <AlertTriangle size={11} /> {amountError}
                    </p>
                  )}
                </div>

                {estimatedProfit() && !amountError && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-2xl border ${activeStyle.accentBorder} ${activeStyle.accentBg} mb-4`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/50 text-[11px] uppercase tracking-widest font-semibold">{L.youWillEarn}</p>
                        <p className={`text-3xl font-bold ${activeStyle.accentText} mt-1`}>
                          +${Number(estimatedProfit()).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/40 text-[11px] uppercase tracking-widest">{L.inLabel}</p>
                        <p className="text-white font-bold text-lg mt-1">{activePlan.duration} {L.days}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

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

                <AnimatePresence>
                  {balanceCheck === "insufficient" && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                      <AlertTriangle size={15} /> {L.insufficientBalance}
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
                    className="flex-1 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/50 text-sm font-semibold hover:bg-white/10 transition">
                    {L.cancel}
                  </button>
                  {balanceCheck === "insufficient" ? (
                    <button onClick={() => navigate("/deposit")}
                      className={`flex-1 py-3.5 rounded-2xl ${activeStyle.button} text-white text-sm font-bold transition shadow-xl`}>
                      {L.depositFunds}
                    </button>
                  ) : (
                    <button onClick={handleConfirm}
                      disabled={confirming || balanceCheck === "success" || !!amountError || !investAmount}
                      className={`flex-1 py-3.5 rounded-2xl ${activeStyle.button} text-white text-sm font-bold transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl`}>
                      {confirming && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      {confirming ? L.processing : L.confirmInvestment}
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-center gap-3 mt-4 text-[11px] text-white/25">
                  <span className="flex items-center gap-1"><Shield size={10} /> {L.secured}</span>
                  <span>·</span>
                  <span>🔒 {L.ssl}</span>
                  <span>·</span>
                  <span>⚡ {L.instant}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
