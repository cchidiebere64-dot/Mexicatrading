import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, ArrowLeft, Upload, CheckCircle, Clock, XCircle, Camera,
  CreditCard, ChevronRight, ChevronLeft, Landmark, IdCard, BookUser, Car, RefreshCw
} from "lucide-react";

const API_URL = "https://mexicatradingbackend.onrender.com";

/* ── Document methods user can choose ── */
const DOC_METHODS = [
  { value: "passport",         label: "Passport",          icon: BookUser, desc: "International passport" },
  { value: "national_id",      label: "National ID",       icon: IdCard,   desc: "Government issued ID" },
  { value: "drivers_license",  label: "Driver's License",  icon: Car,      desc: "Valid driving permit" },
  { value: "bank",             label: "Bank Details",      icon: Landmark, desc: "Verify with your bank" },
];

export default function KYC() {
  const navigate = useNavigate();
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [countdown, setCountdown] = useState(5);

  /* ── Wizard state ── */
  const [stage, setStage] = useState(0);       // 0 = choose method, 1..n = steps
  const [method, setMethod] = useState(null);  // selected method value

  /* document uploads */
  const [idFront, setIdFront]   = useState(null);
  const [idFrontPreview, setIdFrontPreview] = useState(null);
  const [idBack, setIdBack]     = useState(null);
  const [idBackPreview, setIdBackPreview]   = useState(null);
  const [selfie, setSelfie]     = useState(null);
  const [selfiePreview, setSelfiePreview]   = useState(null);

  /* bank details */
  const [bank, setBank] = useState({ bankName:"", accountName:"", accountNumber:"", routingNumber:"" });

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (!token) return navigate("/login");
    fetchKYCStatus();
  }, []);

  useEffect(() => {
    if (!submitted) return;
    if (countdown === 0) { navigate("/dashboard"); return; }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [submitted, countdown]);

  const fetchKYCStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/user/kyc-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKycStatus(res.data.kyc);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

  const handleFileChange = (e, which) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: "File size must be less than 5MB.", type: "error" });
      return;
    }
    setMessage({ text: "", type: "" });
    const preview = URL.createObjectURL(file);
    if (which === "front")  { setIdFront(file);  setIdFrontPreview(preview); }
    if (which === "back")   { setIdBack(file);   setIdBackPreview(preview); }
    if (which === "selfie") { setSelfie(file);   setSelfiePreview(preview); }
  };

  /* ── Reset everything (used when changing method on rejection) ── */
  const resetAll = () => {
    setMethod(null); setStage(0);
    setIdFront(null); setIdFrontPreview(null);
    setIdBack(null); setIdBackPreview(null);
    setSelfie(null); setSelfiePreview(null);
    setBank({ bankName:"", accountName:"", accountNumber:"", routingNumber:"" });
    setMessage({ text:"", type:"" });
  };

  /* ── Steps depend on method ── */
  const isBank = method === "bank";
  const docSteps   = ["method", "front", "back", "selfie", "review"];
  const bankSteps  = ["method", "bank", "review"];
  const steps = isBank ? bankSteps : docSteps;
  const totalSteps = steps.length - 1; // exclude "method" pick from count
  const remaining = Math.max(totalSteps - stage, 0);

  const pickMethod = (m) => {
    setMethod(m);
    setStage(1);
    setMessage({ text:"", type:"" });
  };

  /* ── Validate current step then advance ── */
  const next = () => {
    const cur = steps[stage];
    if (cur === "front"  && !idFront)  return setMessage({ text:"Please upload the front of your document.", type:"error" });
    if (cur === "back"   && !idBack)   return setMessage({ text:"Please upload the back of your document.", type:"error" });
    if (cur === "selfie" && !selfie)   return setMessage({ text:"Please upload a selfie holding your document.", type:"error" });
    if (cur === "bank") {
      if (!bank.bankName.trim())      return setMessage({ text:"Please enter your bank name.", type:"error" });
      if (!bank.accountName.trim())   return setMessage({ text:"Please enter the account holder name.", type:"error" });
      if (!bank.accountNumber.trim()) return setMessage({ text:"Please enter your account number.", type:"error" });
    }
    setMessage({ text:"", type:"" });
    setStage(s => s + 1);
  };

  const back = () => {
    setMessage({ text:"", type:"" });
    if (stage === 0) return;
    setStage(s => s - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setMessage({ text:"", type:"" });
    try {
      let payload;
      if (isBank) {
        payload = { method: "bank", ...bank };
      } else {
        const [f, b, s] = await Promise.all([toBase64(idFront), toBase64(idBack), toBase64(selfie)]);
        payload = { method: "document", idType: method, idFrontImage: f, idBackImage: b, selfieImage: s };
      }
      await axios.post(`${API_URL}/api/user/kyc-submit`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmitted(true);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Submission failed. Please try again.", type:"error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-[#080c18]">
      <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
    </div>
  );

  const status = kycStatus?.status || "none";

  const inp = "w-full px-4 py-4 bg-white/[0.03] border border-white/[0.08] outline-none text-sm text-white placeholder:text-white/25 transition-all duration-300 focus:border-emerald-500/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]";

  /* ════════════════ SHARED SHELL ════════════════ */
  const Shell = ({ children }) => (
    <div className="min-h-screen bg-[#080c18] text-white pb-20" style={{ fontFamily:"'Montserrat',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Montserrat:wght@300;400;500;600;700&display=swap');
        :root{--em:#10b981;--teal:#14b8a6;}
        .serif{font-family:'Cormorant Garamond',serif;}
        ::selection{background:var(--em);color:#080c18;}
        @keyframes shine{0%{background-position:200% center}100%{background-position:-200% center}}
        .top-line{background:linear-gradient(90deg,transparent,var(--em) 40%,var(--teal) 60%,transparent);background-size:400% 100%;animation:shine 3s linear infinite;}
        .btn-prime{background:linear-gradient(135deg,var(--em),var(--teal));transition:transform .3s,box-shadow .3s;position:relative;overflow:hidden;}
        .btn-prime:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 0 0 1px var(--em),0 16px 40px rgba(16,185,129,.35);}
        .shine-badge{border:1px solid transparent;background:linear-gradient(#080c18,#080c18) padding-box,linear-gradient(90deg,transparent 20%,var(--em) 50%,transparent 80%) border-box;background-size:200% auto;animation:shine 4s linear infinite;}
        .grid-bg{background-image:linear-gradient(rgba(16,185,129,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,.03) 1px,transparent 1px);background-size:72px 72px;}
        @keyframes orb{0%,100%{opacity:.06}50%{opacity:.13}}
        .orb{animation:orb 7s ease-in-out infinite;}
      `}</style>

      {/* Top shimmer */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[2px]"><div className="top-line h-full w-full" /></div>

      {/* BG */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="grid-bg absolute inset-0" />
        <div className="orb absolute rounded-full" style={{width:700,height:700,background:"radial-gradient(circle,rgba(16,185,129,.09) 0%,transparent 70%)",top:"-250px",left:"-250px"}} />
        <div className="orb absolute rounded-full" style={{width:550,height:550,background:"radial-gradient(circle,rgba(20,184,166,.07) 0%,transparent 70%)",bottom:"-200px",right:"-200px",animationDelay:"3.5s"}} />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-20">
        <button onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition mb-6">
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        <div className="text-center mb-8">
          <div className="shine-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-semibold tracking-[.28em] uppercase mb-5" style={{color:"var(--em)"}}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:"var(--em)"}} />
            Identity Verification
          </div>
          <h1 className="serif font-light text-white mb-2" style={{fontSize:"clamp(28px,5vw,44px)",lineHeight:1.05}}>
            KYC{" "}
            <em style={{fontStyle:"italic",background:"linear-gradient(135deg,var(--em),var(--teal))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Verification</em>
          </h1>
          <p className="text-xs font-light tracking-wide" style={{color:"rgba(255,255,255,.35)"}}>
            Verify your identity to unlock full withdrawal access
          </p>
        </div>

        {children}
      </div>
    </div>
  );

  /* ════════════════ SUCCESS ════════════════ */
  if (submitted) {
    return (
      <Shell>
        <motion.div initial={{ opacity:0, scale:.95 }} animate={{ opacity:1, scale:1 }}
          className="px-8 py-10 text-center" style={{background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.07)",backdropFilter:"blur(24px)"}}>
          <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",stiffness:220,delay:.2}}
            className="w-20 h-20 flex items-center justify-center border mx-auto mb-5"
            style={{borderColor:"rgba(16,185,129,.4)",background:"rgba(16,185,129,.1)"}}>
            <CheckCircle size={36} style={{color:"var(--em)"}} />
          </motion.div>
          <h2 className="serif font-light mb-2 text-white" style={{fontSize:"clamp(24px,5vw,32px)"}}>
            Documents <em style={{fontStyle:"italic",color:"var(--em)"}}>Submitted!</em>
          </h2>
          <p className="text-sm font-light leading-relaxed mb-6" style={{color:"rgba(255,255,255,.4)"}}>
            Your verification has been received and is now under review by our team. You'll receive an email once it's complete — usually within 24 hours.
          </p>
          <div className="px-4 py-3 border mb-6" style={{borderColor:"rgba(234,179,8,.25)",background:"rgba(234,179,8,.07)"}}>
            <p className="text-sm font-semibold" style={{color:"#eab308"}}>⏳ Status: Under Review</p>
          </div>
          <p className="text-white/30 text-xs mb-5">
            Redirecting in <span className="font-bold" style={{color:"var(--em)"}}>{countdown}</span> seconds...
          </p>
          <button onClick={() => navigate("/dashboard")}
            className="btn-prime w-full py-4 text-[11px] font-semibold tracking-[.2em] uppercase text-white flex items-center justify-center gap-3">
            <ShieldCheck size={16} /> Go to Dashboard Now
          </button>
        </motion.div>
      </Shell>
    );
  }

  /* ════════════════ APPROVED ════════════════ */
  if (status === "approved") {
    return (
      <Shell>
        <motion.div initial={{ opacity:0, scale:.95 }} animate={{ opacity:1, scale:1 }}
          className="px-8 py-10 text-center" style={{background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.07)",backdropFilter:"blur(24px)"}}>
          <div className="w-20 h-20 flex items-center justify-center border mx-auto mb-5"
            style={{borderColor:"rgba(16,185,129,.4)",background:"rgba(16,185,129,.1)"}}>
            <CheckCircle size={36} style={{color:"var(--em)"}} />
          </div>
          <h2 className="serif font-light mb-2 text-white" style={{fontSize:"clamp(22px,5vw,30px)"}}>Identity Verified ✅</h2>
          <p className="text-sm font-light leading-relaxed mb-5" style={{color:"rgba(255,255,255,.4)"}}>
            Your identity has been verified successfully. You now have full access to all withdrawal features.
          </p>
          <div className="px-4 py-3 border mb-5" style={{borderColor:"rgba(16,185,129,.2)",background:"rgba(16,185,129,.06)"}}>
            <p className="text-sm font-semibold" style={{color:"var(--em)"}}>🎉 Status: Approved</p>
            <p className="text-white/40 text-xs mt-1">
              Verified on {kycStatus?.reviewedAt ? new Date(kycStatus.reviewedAt).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}) : "N/A"}
            </p>
          </div>
          <button onClick={() => navigate("/dashboard")}
            className="btn-prime w-full py-4 text-[11px] font-semibold tracking-[.2em] uppercase text-white">
            Back to Dashboard
          </button>
        </motion.div>
      </Shell>
    );
  }

  /* ════════════════ PENDING ════════════════ */
  if (status === "pending") {
    return (
      <Shell>
        <motion.div initial={{ opacity:0, scale:.95 }} animate={{ opacity:1, scale:1 }}
          className="px-8 py-10 text-center" style={{background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.07)",backdropFilter:"blur(24px)"}}>
          <div className="w-20 h-20 flex items-center justify-center border mx-auto mb-5"
            style={{borderColor:"rgba(234,179,8,.4)",background:"rgba(234,179,8,.1)"}}>
            <Clock size={36} style={{color:"#eab308"}} />
          </div>
          <h2 className="serif font-light mb-2 text-white" style={{fontSize:"clamp(22px,5vw,30px)"}}>Under Review ⏳</h2>
          <p className="text-sm font-light leading-relaxed mb-5" style={{color:"rgba(255,255,255,.4)"}}>
            Your documents are being reviewed by our team. This usually takes less than 24 hours.
          </p>
          <div className="px-4 py-3 border mb-5" style={{borderColor:"rgba(234,179,8,.25)",background:"rgba(234,179,8,.07)"}}>
            <p className="text-sm font-semibold" style={{color:"#eab308"}}>⏳ Status: Under Review</p>
            <p className="text-white/40 text-xs mt-1">
              Submitted on {kycStatus?.submittedAt ? new Date(kycStatus.submittedAt).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}) : "N/A"}
            </p>
          </div>
          <button onClick={() => navigate("/dashboard")}
            className="w-full py-3.5 border text-[11px] font-medium tracking-[.18em] uppercase transition-all duration-300"
            style={{borderColor:"rgba(255,255,255,.08)",background:"rgba(255,255,255,.02)",color:"rgba(255,255,255,.4)"}}>
            Back to Dashboard
          </button>
        </motion.div>
      </Shell>
    );
  }

  /* ════════════════ WIZARD (none or rejected) ════════════════ */

  /* Upload box component */
  const UploadBox = ({ preview, onChange, icon:Icon, title, hint }) => (
    <label className="block w-full border-2 border-dashed transition-all cursor-pointer"
      style={{borderColor: preview ? "rgba(16,185,129,.4)" : "rgba(255,255,255,.15)"}}>
      <input type="file" accept="image/*" onChange={onChange} className="hidden" />
      {preview ? (
        <div className="relative">
          <img src={preview} alt={title} className="w-full h-52 object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-all">
            <p className="text-white text-xs font-semibold tracking-wider uppercase">Click to change</p>
          </div>
          <div className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center" style={{background:"var(--em)"}}>
            <CheckCircle size={15} className="text-white" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-44 gap-3">
          <div className="w-14 h-14 border flex items-center justify-center" style={{borderColor:"rgba(16,185,129,.25)",background:"rgba(16,185,129,.06)"}}>
            <Icon size={22} style={{color:"var(--em)"}} />
          </div>
          <p className="text-white/50 text-sm font-medium">{title}</p>
          <p className="text-white/25 text-xs">{hint}</p>
        </div>
      )}
    </label>
  );

  return (
    <Shell>
      {/* REJECTED banner */}
      {status === "rejected" && (
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
          className="px-6 py-5 border text-center mb-6" style={{borderColor:"rgba(239,68,68,.2)",background:"rgba(239,68,68,.06)"}}>
          <XCircle size={26} className="mx-auto mb-3 text-red-400" />
          <p className="text-white font-semibold mb-1">Verification Rejected</p>
          <p className="text-white/40 text-sm">Please try again below — you can use the same or a different method.</p>
          {kycStatus?.rejectionReason && (
            <div className="mt-3 px-3 py-2 border" style={{borderColor:"rgba(239,68,68,.2)",background:"rgba(239,68,68,.05)"}}>
              <p className="text-red-400 text-xs">Reason: {kycStatus.rejectionReason}</p>
            </div>
          )}
        </motion.div>
      )}

      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        className="px-7 py-8" style={{background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.07)",backdropFilter:"blur(24px)"}}>

        {/* Progress indicator — shows once a method is chosen */}
        {stage > 0 && (
          <div className="mb-7">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-medium tracking-[.2em] uppercase" style={{color:"rgba(255,255,255,.25)"}}>
                Step {stage} of {totalSteps}
              </span>
              <span className="text-[9px] font-semibold" style={{color:"var(--em)"}}>
                {remaining === 0 ? "Final step" : `${remaining} remaining`}
              </span>
            </div>
            <div className="h-[2px] w-full" style={{background:"rgba(255,255,255,.06)"}}>
              <motion.div className="h-full" style={{background:"linear-gradient(90deg,var(--em),var(--teal))"}}
                animate={{ width:`${(stage/totalSteps)*100}%` }} transition={{ duration:.6, ease:[0.22,1,0.36,1] }} />
            </div>
          </div>
        )}

        {/* message */}
        <AnimatePresence>
          {message.text && (
            <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="mb-5 flex items-start gap-2.5 text-xs px-4 py-3 border"
              style={message.type==="success"
                ? {background:"rgba(16,185,129,.07)",borderColor:"rgba(16,185,129,.25)",color:"var(--em)"}
                : {background:"rgba(239,68,68,.07)",borderColor:"rgba(239,68,68,.2)",color:"#f87171"}}>
              <XCircle size={12} className="shrink-0 mt-0.5" /><span>{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">

          {/* ── STAGE 0: CHOOSE METHOD ── */}
          {stage === 0 && (
            <motion.div key="method" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:.35}}>
              <p className="text-xs font-medium tracking-[.2em] uppercase mb-4" style={{color:"rgba(255,255,255,.4)"}}>
                Choose verification method
              </p>
              <div className="space-y-3">
                {DOC_METHODS.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button key={m.value} type="button" onClick={() => pickMethod(m.value)}
                      className="w-full flex items-center gap-4 px-5 py-4 border text-left transition-all duration-300 group"
                      style={{borderColor:"rgba(255,255,255,.08)",background:"rgba(255,255,255,.02)"}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(16,185,129,.4)";e.currentTarget.style.background="rgba(16,185,129,.05)";}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.08)";e.currentTarget.style.background="rgba(255,255,255,.02)";}}>
                      <div className="w-11 h-11 border flex items-center justify-center shrink-0" style={{borderColor:"rgba(16,185,129,.25)",background:"rgba(16,185,129,.06)"}}>
                        <Icon size={19} style={{color:"var(--em)"}} />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-semibold">{m.label}</p>
                        <p className="text-white/35 text-xs mt-0.5">{m.desc}</p>
                      </div>
                      <ChevronRight size={16} className="text-white/25 group-hover:translate-x-1 transition-transform" style={{color:"var(--em)"}} />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── DOC: FRONT ── */}
          {steps[stage] === "front" && (
            <motion.div key="front" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:.35}}>
              <p className="text-sm font-semibold text-white mb-1">Front of your document</p>
              <p className="text-white/35 text-xs mb-4">Upload a clear photo of the front. All text must be readable.</p>
              <UploadBox preview={idFrontPreview} onChange={(e)=>handleFileChange(e,"front")} icon={CreditCard} title="Upload front photo" hint="JPG, PNG — max 5MB" />
            </motion.div>
          )}

          {/* ── DOC: BACK ── */}
          {steps[stage] === "back" && (
            <motion.div key="back" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:.35}}>
              <p className="text-sm font-semibold text-white mb-1">Back of your document</p>
              <p className="text-white/35 text-xs mb-4">Now upload the back side of the same document.</p>
              <UploadBox preview={idBackPreview} onChange={(e)=>handleFileChange(e,"back")} icon={CreditCard} title="Upload back photo" hint="JPG, PNG — max 5MB" />
            </motion.div>
          )}

          {/* ── DOC: SELFIE ── */}
          {steps[stage] === "selfie" && (
            <motion.div key="selfie" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:.35}}>
              <p className="text-sm font-semibold text-white mb-1">Selfie holding your document</p>
              <p className="text-white/35 text-xs mb-4">Take a selfie holding your document next to your face, clearly visible.</p>
              <UploadBox preview={selfiePreview} onChange={(e)=>handleFileChange(e,"selfie")} icon={Camera} title="Upload your selfie" hint="Hold your ID near your face — max 5MB" />
            </motion.div>
          )}

          {/* ── BANK DETAILS ── */}
          {steps[stage] === "bank" && (
            <motion.div key="bank" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:.35}}>
              <p className="text-sm font-semibold text-white mb-1">Your bank details</p>
              <p className="text-white/35 text-xs mb-4">Enter the bank account registered in your name for verification.</p>
              <div className="space-y-3">
                <input className={inp} placeholder="Bank Name" value={bank.bankName}
                  onChange={e=>{setMessage({text:"",type:""});setBank(b=>({...b,bankName:e.target.value}));}} />
                <input className={inp} placeholder="Account Holder Name" value={bank.accountName}
                  onChange={e=>{setMessage({text:"",type:""});setBank(b=>({...b,accountName:e.target.value}));}} />
                <input className={inp} placeholder="Account Number" value={bank.accountNumber}
                  onChange={e=>{setMessage({text:"",type:""});setBank(b=>({...b,accountNumber:e.target.value}));}} />
                <input className={inp} placeholder="Routing / SWIFT Code (optional)" value={bank.routingNumber}
                  onChange={e=>{setMessage({text:"",type:""});setBank(b=>({...b,routingNumber:e.target.value}));}} />
              </div>
            </motion.div>
          )}

          {/* ── REVIEW ── */}
          {steps[stage] === "review" && (
            <motion.div key="review" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:.35}}>
              <p className="text-sm font-semibold text-white mb-1">Review &amp; submit</p>
              <p className="text-white/35 text-xs mb-4">Confirm everything looks right before submitting.</p>

              {isBank ? (
                <div className="space-y-2.5">
                  {[
                    ["Method","Bank Details"],
                    ["Bank", bank.bankName],
                    ["Account Name", bank.accountName],
                    ["Account Number", bank.accountNumber],
                    ...(bank.routingNumber ? [["Routing / SWIFT", bank.routingNumber]] : []),
                  ].map(([k,v],i)=>(
                    <div key={i} className="flex justify-between items-center px-4 py-3 border" style={{borderColor:"rgba(255,255,255,.07)",background:"rgba(255,255,255,.02)"}}>
                      <span className="text-white/35 text-xs">{k}</span>
                      <span className="text-white text-sm font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-4 py-3 border" style={{borderColor:"rgba(255,255,255,.07)",background:"rgba(255,255,255,.02)"}}>
                    <span className="text-white/35 text-xs">Document</span>
                    <span className="text-white text-sm font-medium">{DOC_METHODS.find(m=>m.value===method)?.label}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[["Front",idFrontPreview],["Back",idBackPreview],["Selfie",selfiePreview]].map(([label,src],i)=>(
                      <div key={i}>
                        <img src={src} alt={label} className="w-full h-20 object-cover border" style={{borderColor:"rgba(16,185,129,.25)"}} />
                        <p className="text-white/30 text-[10px] text-center mt-1 tracking-wider uppercase">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={handleSubmit} disabled={submitting}
                className="btn-prime w-full py-4 mt-5 text-[11px] font-semibold tracking-[.2em] uppercase text-white flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Submitting...</>
                  : <><ShieldCheck size={16}/> Submit for Verification</>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons (not on method pick, not on review which has its own submit) */}
        {stage > 0 && steps[stage] !== "review" && (
          <div className="flex gap-3 mt-6">
            <button onClick={back}
              className="px-5 py-3.5 border text-[11px] font-medium tracking-[.18em] uppercase transition-all duration-300 flex items-center gap-2"
              style={{borderColor:"rgba(255,255,255,.08)",background:"rgba(255,255,255,.02)",color:"rgba(255,255,255,.4)"}}>
              <ChevronLeft size={14}/> Back
            </button>
            <button onClick={next}
              className="btn-prime flex-1 py-3.5 text-[11px] font-semibold tracking-[.2em] uppercase text-white flex items-center justify-center gap-2.5">
              Next <ChevronRight size={14}/>
            </button>
          </div>
        )}

        {/* Change method link on rejection / after choosing */}
        {stage > 0 && (
          <button onClick={resetAll}
            className="w-full mt-4 text-[10px] font-medium tracking-[.15em] uppercase flex items-center justify-center gap-2 transition-colors duration-300"
            style={{color:"rgba(255,255,255,.28)"}}
            onMouseEnter={e=>e.currentTarget.style.color="var(--em)"}
            onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,.28)"}>
            <RefreshCw size={11}/> Change verification method
          </button>
        )}
      </motion.div>

      {/* Trust row */}
      <div className="flex items-center justify-center gap-6 mt-5">
        {["🔒 Bank-Level Security","🛡️ Data Encrypted","⚡ 24h Review"].map((txt,i)=>(
          <span key={i} className="text-[10px] font-light tracking-wider" style={{color:"rgba(255,255,255,.18)"}}>{txt}</span>
        ))}
      </div>
    </Shell>
  );
}
