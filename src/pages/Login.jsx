import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle, AlertTriangle, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

/* ── Validation ── */
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isValidPass  = (v) => v.length >= 6;

/* ── Animated next hint ── */
const NextHint = ({ show, label }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity:0, y:4 }}
        animate={{ opacity:1, y:0 }}
        exit={{ opacity:0, y:-4 }}
        transition={{ duration:0.35 }}
        className="flex items-center gap-1.5 mt-1.5 ml-1">
        <motion.div animate={{ x:[0,4,0] }} transition={{ repeat:Infinity, duration:1.4, ease:"easeInOut" }}>
          <ChevronRight size={11} style={{ color:"var(--em)" }} />
        </motion.div>
        <span className="text-[10px] font-light tracking-wider" style={{ color:"rgba(16,185,129,.5)" }}>{label}</span>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ── Next button — travels down the form ── */
const NextButton = ({ show, onClick }) => (
  <AnimatePresence>
    {show && (
      <motion.button
        type="button"
        onClick={onClick}
        initial={{ opacity:0, y:6 }}
        animate={{ opacity:1, y:0 }}
        exit={{ opacity:0, y:-6 }}
        transition={{ duration:0.4, ease:[0.22,1,0.36,1] }}
        className="btn-prime group/next w-full py-3 mt-2.5 text-[10px] font-semibold tracking-[.22em] uppercase text-white flex items-center justify-center gap-2.5">
        Next
        <ChevronRight size={13} className="group-hover/next:translate-x-1 transition-transform duration-300" />
      </motion.button>
    )}
  </AnimatePresence>
);

/* ── Progress bar ── */
const ProgressBar = ({ step, total }) => {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[9px] font-medium tracking-[.2em] uppercase" style={{ color:"rgba(255,255,255,.25)" }}>Progress</span>
        <span className="text-[9px] font-semibold" style={{ color:"var(--em)" }}>{pct}%</span>
      </div>
      <div className="h-[2px] w-full" style={{ background:"rgba(255,255,255,.06)" }}>
        <motion.div className="h-full"
          style={{ background:"linear-gradient(90deg,var(--em),var(--teal))" }}
          animate={{ width:`${pct}%` }}
          transition={{ duration:0.6, ease:[0.22,1,0.36,1] }} />
      </div>
    </div>
  );
};

export default function Login() {
  const { t }       = useTranslation();
  const navigate    = useNavigate();
  const location    = useLocation();
  const API_URL     = "https://mexicatradingbackend.onrender.com";
  const verified    = new URLSearchParams(location.search).get("verified");

  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [showPassF,   setShowPassF]   = useState(false); /* reveal flag */
  const [fieldError,  setFieldError]  = useState("");      /* inline next-button error */

  const passRef   = useRef(null);
  const bottomRef = useRef(null);

  const scroll = (d=120) => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:"smooth", block:"end" }), d);

  /* Auto-reveal password field as soon as email is valid — no blur needed */
  useEffect(() => {
    if (!showPassF && isValidEmail(email)) {
      setShowPassF(true);
      setTimeout(() => passRef.current?.focus(), 600);
      scroll();
    }
    /* If user edits email back to invalid, hide password again */
    if (showPassF && !isValidEmail(email)) {
      setShowPassF(false);
    }
  }, [email]);

  /* Next button handler — reveal password, show error if email invalid */
  const nextFromEmail = () => {
    if (!isValidEmail(email)) return setFieldError("Please enter a valid email address to continue.");
    setFieldError("");
    setShowPassF(true);
    setTimeout(() => passRef.current?.focus(), 600);
    scroll();
  };

  /* progress: 0 = nothing, 1 = valid email, 2 = valid pass */
  const step = isValidPass(password) ? 2 : isValidEmail(email) ? 1 : 0;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) return setError("Please enter a valid email address.");
    if (!isValidPass(password)) return setError("Password must be at least 6 characters.");
    setLoading(true); setError("");
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password }, { timeout:30000 });
      if (res.data?.token) {
        const userData = {
          _id: res.data._id, name: res.data.name,
          email: res.data.email, balance: res.data.balance,
          isAdmin: res.data.isAdmin || false,
        };
        sessionStorage.setItem("token", res.data.token);
        sessionStorage.setItem("user", JSON.stringify(userData));
        if (userData.isAdmin) {
          sessionStorage.setItem("adminToken", res.data.token);
          navigate("/admin");
        } else {
          navigate("/dashboard");
          setTimeout(() => window.location.reload(), 100);
        }
      } else {
        setError("Invalid response from server.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally { setLoading(false); }
  };

  const inp  = "w-full pl-11 pr-4 py-4 bg-white/[0.03] border border-white/[0.08] outline-none text-sm text-white placeholder:text-white/25 transition-all duration-300 focus:border-emerald-500/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]";
  const done = "border-emerald-500/25 bg-emerald-500/[0.04]";

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#080c18] text-white overflow-hidden px-4"
      style={{ fontFamily:"'Montserrat',sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Montserrat:wght@300;400;500;600;700&display=swap');
        :root{--em:#10b981;--teal:#14b8a6;}
        .serif{font-family:'Cormorant Garamond',serif;}
        ::selection{background:var(--em);color:#080c18;}
        @keyframes orb{0%,100%{opacity:.06}50%{opacity:.13}}
        .orb{animation:orb 7s ease-in-out infinite;}
        @keyframes scan{from{top:-30%}to{top:110%}}
        .scan{animation:scan 10s ease-in-out infinite;}
        @keyframes shine{0%{background-position:200% center}100%{background-position:-200% center}}
        .top-line{background:linear-gradient(90deg,transparent,var(--em) 40%,var(--teal) 60%,transparent);background-size:400% 100%;animation:shine 3s linear infinite;}
        .grid-bg{background-image:linear-gradient(rgba(16,185,129,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,.03) 1px,transparent 1px);background-size:72px 72px;}
        .btn-prime{background:linear-gradient(135deg,var(--em),var(--teal));transition:transform .3s,box-shadow .3s;position:relative;overflow:hidden;}
        .btn-prime::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.15),transparent);opacity:0;transition:opacity .3s;}
        .btn-prime:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 0 0 1px var(--em),0 16px 40px rgba(16,185,129,.35);}
        .btn-prime:hover:not(:disabled)::before{opacity:1;}
        .shine-badge{border:1px solid transparent;background:linear-gradient(#080c18,#080c18) padding-box,linear-gradient(90deg,transparent 20%,var(--em) 50%,transparent 80%) border-box;background-size:200% auto;animation:shine 4s linear infinite;}
        .nav-link{color:rgba(255,255,255,.35);transition:color .3s;}
        .nav-link:hover{color:var(--em);}
      `}</style>

      {/* Top shimmer */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[2px]"><div className="top-line h-full w-full" /></div>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="grid-bg absolute inset-0" />
        <div className="orb absolute rounded-full" style={{width:800,height:800,background:"radial-gradient(circle,rgba(16,185,129,.09) 0%,transparent 70%)",top:"-300px",left:"-300px"}} />
        <div className="orb absolute rounded-full" style={{width:600,height:600,background:"radial-gradient(circle,rgba(20,184,166,.07) 0%,transparent 70%)",bottom:"-200px",right:"-200px",animationDelay:"3.5s"}} />
        <div className="absolute left-[5%] top-0 bottom-0 w-px hidden lg:block" style={{background:"linear-gradient(to bottom,transparent 5%,rgba(16,185,129,.15) 40%,rgba(16,185,129,.3) 60%,transparent 95%)"}} />
        <div className="scan absolute left-[5%] w-px hidden lg:block" style={{height:"28%",background:"linear-gradient(to bottom,transparent,var(--em),transparent)"}} />
        <div className="absolute right-[5%] top-0 bottom-0 w-px hidden lg:block" style={{background:"linear-gradient(to bottom,transparent 5%,rgba(20,184,166,.1) 40%,rgba(20,184,166,.22) 60%,transparent 95%)"}} />
      </div>

      {/* Back nav */}
      <Link to="/" className="nav-link absolute top-7 left-8 text-[10px] font-medium tracking-[.2em] uppercase flex items-center gap-2 z-20">
        ← <span className="serif text-base font-light" style={{color:"var(--em)"}}>Mexica<em className="not-italic text-white">Trading</em></span>
      </Link>

      <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:.7,ease:[.22,1,.36,1]}}
        className="relative w-full max-w-md z-10">

        {/* Card */}
        <div className="px-8 py-10" style={{background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.07)",backdropFilter:"blur(24px)"}}>

          {/* Header */}
          <div className="text-center mb-10">
            <div className="shine-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-semibold tracking-[.28em] uppercase mb-6" style={{color:"var(--em)"}}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:"var(--em)"}} />
              {t("auth.secureLogin")}
            </div>
            <h2 className="serif font-light text-white mb-2" style={{fontSize:"clamp(30px,5vw,46px)",lineHeight:1.05}}>
              {t("auth.welcomeBack")}{" "}
              <em style={{fontStyle:"italic",background:"linear-gradient(135deg,var(--em),var(--teal))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>back.</em>
            </h2>
            <p className="text-xs font-light tracking-wide" style={{color:"rgba(255,255,255,.35)"}}>
              {t("auth.signInDesc")}
            </p>
          </div>

          {/* Progress bar */}
          <ProgressBar step={step} total={2} />

          {/* Verified banner */}
          <AnimatePresence>
            {verified === "true" && (
              <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                className="mb-6 flex items-center gap-3 px-4 py-3 border text-xs font-medium"
                style={{background:"rgba(16,185,129,.07)",borderColor:"rgba(16,185,129,.25)",color:"var(--em)"}}>
                <CheckCircle size={13} className="shrink-0" />
                <span>{t("auth.emailVerifiedSuccess")}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                className="mb-6 flex items-start gap-2.5 text-xs px-4 py-3 border"
                style={{background:"rgba(239,68,68,.07)",borderColor:"rgba(239,68,68,.2)",color:"#f87171"}}>
                <AlertTriangle size={12} className="shrink-0 mt-0.5"/><span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin}>
            <div className="space-y-3">

              {/* ── EMAIL — always visible ── */}
              <div>
                <div className="relative group">
                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 text-white/25 group-focus-within:text-emerald-400 z-10" />
                  <input
                    type="email" value={email} onChange={e => { setFieldError(""); setEmail(e.target.value); }}
                    placeholder={t("auth.email")}
                    required autoFocus autoComplete="username"
                    className={`${inp} ${isValidEmail(email) ? done : ""}`} />
                  {isValidEmail(email) && (
                    <CheckCircle size={13} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:"var(--em)"}} />
                  )}
                </div>
                {/* Hint while typing invalid email */}
                <NextHint
                  show={email.length > 0 && !isValidEmail(email)}
                  label="Enter your full email address" />
                {/* Next button — only while password not yet revealed */}
                <NextButton show={!showPassF} onClick={nextFromEmail} />
                <AnimatePresence>
                  {!showPassF && fieldError && (
                    <motion.p initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                      className="text-[11px] flex items-center gap-1.5 mt-2 ml-1 text-red-400">
                      <AlertTriangle size={11} className="shrink-0" />{fieldError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* ── PASSWORD — auto-reveals when email is valid ── */}
              <AnimatePresence>
                {showPassF && (
                  <motion.div
                    initial={{opacity:0, y:20, filter:"blur(8px)"}}
                    animate={{opacity:1, y:0,  filter:"blur(0px)"}}
                    exit={{opacity:0,   y:-8,  filter:"blur(4px)"}}
                    transition={{duration:0.6, ease:[0.22,1,0.36,1]}}>
                    <div>
                      <div className="relative group">
                        <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 text-white/25 group-focus-within:text-emerald-400 z-10" />
                        <input
                          ref={passRef}
                          id="login-password"
                          type={showPass ? "text" : "password"}
                          value={password} onChange={e => setPassword(e.target.value)}
                          placeholder={t("auth.password")}
                          required autoComplete="current-password"
                          className={`${inp} pr-11 ${isValidPass(password) ? done : ""}`} />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 transition-colors duration-300"
                          style={{color:"rgba(255,255,255,.25)"}}>
                          {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                        </button>
                      </div>
                      <NextHint show={password.length > 0 && !isValidPass(password)} label="At least 6 characters" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── FORGOT PASSWORD — fades in with password field ── */}
              <AnimatePresence>
                {showPassF && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.35,duration:.5}}
                    className="flex justify-end">
                    <Link to="/forgot-password"
                      className="text-[10px] font-medium tracking-[.15em] uppercase transition-colors duration-300"
                      style={{color:"rgba(255,255,255,.28)"}}
                      onMouseEnter={e=>e.target.style.color="var(--em)"}
                      onMouseLeave={e=>e.target.style.color="rgba(255,255,255,.28)"}>
                      {t("auth.forgotPassword")}
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── SUBMIT — fades in with password field ── */}
              <AnimatePresence>
                {showPassF && (
                  <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:.2,duration:.55,ease:[.22,1,.36,1]}}>
                    <button type="submit" disabled={loading}
                      className="btn-prime group w-full py-4 text-[11px] font-semibold tracking-[.2em] uppercase text-white flex items-center justify-center gap-3 mt-1 disabled:opacity-50 disabled:cursor-not-allowed">
                      {loading
                        ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>{t("auth.signingIn")}</>
                        : <>{t("auth.signIn")} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300"/></>}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </form>

          {/* Divider + register */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{background:"rgba(255,255,255,.07)"}} />
              <span className="text-[10px] font-light tracking-wider" style={{color:"rgba(255,255,255,.2)"}}>{t("auth.newToMexica")}</span>
              <div className="flex-1 h-px" style={{background:"rgba(255,255,255,.07)"}} />
            </div>
            <button onClick={()=>navigate("/register")}
              className="w-full py-3.5 border text-[11px] font-medium tracking-[.18em] uppercase transition-all duration-300"
              style={{borderColor:"rgba(255,255,255,.08)",background:"rgba(255,255,255,.02)",color:"rgba(255,255,255,.4)"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(16,185,129,.3)";e.currentTarget.style.color="var(--em)";e.currentTarget.style.background="rgba(16,185,129,.05)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.08)";e.currentTarget.style.color="rgba(255,255,255,.4)";e.currentTarget.style.background="rgba(255,255,255,.02)";}}>
              {t("auth.createAccount")}
            </button>
          </div>
        </div>

        {/* Trust row */}
        <div className="flex items-center justify-center gap-6 mt-5">
          {[`🔒 ${t("common.sslSecured")}`,`🛡️ ${t("common.dataProtected")}`,`⚡ ${t("common.instantAccess")}`].map((txt,i)=>(
            <span key={i} className="text-[10px] font-light tracking-wider" style={{color:"rgba(255,255,255,.18)"}}>{txt}</span>
          ))}
        </div>

        <div ref={bottomRef} />
      </motion.div>
    </div>
  );
}
