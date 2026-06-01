import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { TrendingUp, Globe, ArrowRight, ChevronDown, Star, Lock, BarChart2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRef, useEffect, useState } from "react";

/* ─── Grain ─── */
const Grain = () => (
  <div className="pointer-events-none fixed inset-0 z-[998] opacity-[0.032]"
    style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`, backgroundSize:"200px 200px" }} />
);

/* ─── Counter ─── */
function Counter({ to, prefix="", suffix="" }) {
  const [val,setVal]=useState(0);
  const ref=useRef(null);
  const fired=useRef(false);
  useEffect(()=>{
    const ob=new IntersectionObserver(([e])=>{
      if(e.isIntersecting&&!fired.current){
        fired.current=true;
        const n=parseFloat(to),steps=70,dur=1800;
        let s=0;
        const t=setInterval(()=>{ s++; const ease=1-Math.pow(1-s/steps,3); setVal((ease*n).toFixed(to.includes(".")?1:0)); if(s>=steps)clearInterval(t); },dur/steps);
      }
    },{threshold:0.4});
    if(ref.current)ob.observe(ref.current);
    return()=>ob.disconnect();
  },[to]);
  return <span ref={ref}>{prefix}{val}{suffix}</span>;
}

const tickers=[
  {sym:"BTC/USD",val:"67,420",up:true},{sym:"ETH/USD",val:"3,890",up:true},
  {sym:"S&P 500",val:"5,312",up:true},{sym:"GOLD",val:"2,341",up:true},
  {sym:"EUR/USD",val:"1.0842",up:false},{sym:"NASDAQ",val:"18,640",up:true},
  {sym:"OIL/WTI",val:"82.14",up:true},{sym:"XRP/USD",val:"0.521",up:false},
];

export default function Home() {
  const { t } = useTranslation();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target:heroRef, offset:["start start","end start"] });
  const heroY   = useTransform(scrollYProgress,[0,1],["0%","22%"]);
  const heroFade= useTransform(scrollYProgress,[0,0.75],[1,0]);

  const stats=[
    {to:"2.4",prefix:"$",suffix:"B+",label:t("home.stats.assets")},
    {to:"98.6",prefix:"",suffix:"%",label:t("home.stats.satisfaction")},
    {to:"150",prefix:"",suffix:"+",label:t("home.stats.countries")},
    {to:"24",prefix:"",suffix:"/7",label:t("home.stats.support")},
  ];
  const features=[
    {icon:<Lock size={20}/>,title:t("home.features.secureTitle"),desc:t("home.features.secureDesc")},
    {icon:<BarChart2 size={20}/>,title:t("home.features.profitTitle"),desc:t("home.features.profitDesc")},
    {icon:<Globe size={20}/>,title:t("home.features.globalTitle"),desc:t("home.features.globalDesc")},
  ];
  const steps=[
    {n:"01",title:t("home.steps.step1Title"),desc:t("home.steps.step1Desc")},
    {n:"02",title:t("home.steps.step2Title"),desc:t("home.steps.step2Desc")},
    {n:"03",title:t("home.steps.step3Title"),desc:t("home.steps.step3Desc")},
  ];
  const testimonials=[
    {name:t("home.t1Name"),country:t("home.t1Country"),plan:t("home.t1Plan"),profit:t("home.t1Profit"),av:"JO",text:t("home.t1Text")},
    {name:t("home.t2Name"),country:t("home.t2Country"),plan:t("home.t2Plan"),profit:t("home.t2Profit"),av:"FA",text:t("home.t2Text")},
    {name:t("home.t3Name"),country:t("home.t3Country"),plan:t("home.t3Plan"),profit:t("home.t3Profit"),av:"CM",text:t("home.t3Text")},
    {name:t("home.t4Name"),country:t("home.t4Country"),plan:t("home.t4Plan"),profit:t("home.t4Profit"),av:"AD",text:t("home.t4Text")},
    {name:t("home.t5Name"),country:t("home.t5Country"),plan:t("home.t5Plan"),profit:t("home.t5Profit"),av:"SN",text:t("home.t5Text")},
    {name:t("home.t6Name"),country:t("home.t6Country"),plan:t("home.t6Plan"),profit:t("home.t6Profit"),av:"DM",text:t("home.t6Text")},
  ];

  const fadeUp={ hidden:{opacity:0,y:28}, show:{opacity:1,y:0,transition:{duration:.8,ease:[.22,1,.36,1]}} };
  const stagger={ hidden:{}, show:{transition:{staggerChildren:.13}} };

  return (
    <div className="relative bg-[#080c18] text-white overflow-x-hidden" style={{fontFamily:"'Montserrat',sans-serif"}}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap');
        :root{--em:#10b981;--teal:#14b8a6;--muted:rgba(255,255,255,.4);--surf:rgba(255,255,255,.025);--bdr:rgba(255,255,255,.07);}
        .serif{font-family:'Cormorant Garamond',serif;}
        ::selection{background:var(--em);color:#080c18;}
        @keyframes tick{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .ticker{animation:tick 32s linear infinite;}
        .ticker:hover{animation-play-state:paused;}
        @keyframes scan{from{top:-30%}to{top:110%}}
        .scan{animation:scan 9s ease-in-out infinite;}
        @keyframes scan2{from{top:-30%}to{top:110%}}
        .scan2{animation:scan2 9s ease-in-out 4s infinite;}
        @keyframes orb-pulse{0%,100%{opacity:.07}50%{opacity:.15}}
        .orb{animation:orb-pulse 7s ease-in-out infinite;}
        @keyframes shine{0%{background-position:200% center}100%{background-position:-200% center}}
        .top-line{background:linear-gradient(90deg,transparent 0%,var(--em) 40%,var(--teal) 60%,transparent 100%);background-size:400% 100%;animation:shine 3s linear infinite;}
        .grid-bg{background-image:linear-gradient(rgba(16,185,129,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,.04) 1px,transparent 1px);background-size:72px 72px;}
        .card-hover{transition:transform .45s cubic-bezier(.22,1,.36,1),box-shadow .45s;}
        .card-hover:hover{transform:translateY(-5px);box-shadow:0 28px 56px rgba(16,185,129,.09);}
        .ul-em{position:relative;}
        .ul-em::after{content:'';position:absolute;left:0;bottom:-2px;width:0;height:1px;background:var(--em);transition:width .35s ease;}
        .ul-em:hover::after{width:100%;}
        .btn-prime{background:linear-gradient(135deg,var(--em),var(--teal));transition:transform .3s,box-shadow .3s;position:relative;overflow:hidden;}
        .btn-prime::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.18),transparent);opacity:0;transition:opacity .3s;}
        .btn-prime:hover{transform:translateY(-2px);box-shadow:0 0 0 1px var(--em),0 16px 48px rgba(16,185,129,.4);}
        .btn-prime:hover::before{opacity:1;}
        .shine-badge{border:1px solid transparent;background:linear-gradient(#080c18,#080c18) padding-box,linear-gradient(90deg,transparent 20%,var(--em) 50%,transparent 80%) border-box;background-size:200% auto;animation:shine 4s linear infinite;}
        .bg-num{font-family:'Cormorant Garamond',serif;font-weight:300;color:rgba(16,185,129,.022);user-select:none;pointer-events:none;line-height:1;}
        .nav-link{color:var(--muted);transition:color .3s;}
        .nav-link:hover{color:var(--em);}
      `}</style>

      <Grain />

      {/* ── Top shimmer ── */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[2px]"><div className="top-line h-full w-full" /></div>

      {/* ══════════════════════ NAV ══════════════════════ */}
      <nav className="fixed top-0 w-full z-40 flex items-center justify-between px-8 py-5"
        style={{background:"linear-gradient(to bottom,rgba(8,12,24,.95),rgba(8,12,24,0))",backdropFilter:"blur(16px)"}}>
        <div className="serif text-xl font-light tracking-[.16em] uppercase" style={{color:"var(--em)"}}>
          Mexica<em className="not-italic text-white">Trading</em>
        </div>
        <div className="hidden md:flex items-center gap-10">
          {["Markets","Strategies","Performance","About"].map(l=>(
            <a key={l} href="#" className="nav-link ul-em text-[10px] font-medium tracking-[.22em] uppercase">{l}</a>
          ))}
        </div>
        <div className="flex items-center gap-5">
          <Link to="/login" className="nav-link ul-em text-[10px] font-medium tracking-[.2em] uppercase">{t("nav.signIn")}</Link>
          <Link to="/register" className="btn-prime text-[10px] font-semibold tracking-[.2em] uppercase px-6 py-3 text-white">{t("nav.getStarted")}</Link>
        </div>
      </nav>

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        {/* Orbs */}
        <div className="orb absolute rounded-full pointer-events-none" style={{width:900,height:900,background:"radial-gradient(circle,rgba(16,185,129,.1) 0%,transparent 70%)",top:"50%",left:"50%",transform:"translate(-50%,-50%)"}} />
        <div className="orb absolute rounded-full pointer-events-none" style={{width:400,height:400,background:"radial-gradient(circle,rgba(20,184,166,.07) 0%,transparent 70%)",bottom:"5%",right:"5%",animationDelay:"3s"}} />
        {/* Vertical lines */}
        <div className="absolute left-[6%] top-0 bottom-0 w-px hidden lg:block" style={{background:"linear-gradient(to bottom,transparent 5%,rgba(16,185,129,.2) 40%,rgba(16,185,129,.4) 60%,transparent 95%)"}} />
        <div className="scan absolute left-[6%] w-px pointer-events-none hidden lg:block" style={{height:"35%",background:"linear-gradient(to bottom,transparent,var(--em),transparent)"}} />
        <div className="absolute right-[6%] top-0 bottom-0 w-px hidden lg:block" style={{background:"linear-gradient(to bottom,transparent 5%,rgba(20,184,166,.15) 40%,rgba(20,184,166,.3) 60%,transparent 95%)"}} />
        <div className="scan2 absolute right-[6%] w-px pointer-events-none hidden lg:block" style={{height:"35%",background:"linear-gradient(to bottom,transparent,rgba(20,184,166,.6),transparent)"}} />

        <motion.div style={{y:heroY,opacity:heroFade}} className="relative z-10 max-w-5xl mx-auto">
          <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:.6}}
            className="shine-badge inline-flex items-center gap-3 mb-10 px-5 py-2 rounded-full text-[10px] font-semibold tracking-[.24em] uppercase" style={{color:"var(--em)"}}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:"var(--em)"}} />
            {t("home.badge")}
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:"var(--teal)"}} />
          </motion.div>

          <motion.h1 initial={{opacity:0,y:44}} animate={{opacity:1,y:0}} transition={{duration:1.1,delay:.15,ease:[.22,1,.36,1]}}
            className="serif font-light leading-[1.0] mb-6" style={{fontSize:"clamp(54px,9vw,120px)",color:"#fff"}}>
            {t("home.hero1")}{" "}
            <em style={{fontStyle:"italic",background:"linear-gradient(135deg,var(--em),var(--teal))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              {t("home.hero2")}
            </em>
          </motion.h1>

          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.45,duration:.9}}
            className="text-base md:text-lg font-light leading-relaxed max-w-lg mx-auto mb-14" style={{color:"var(--muted)",letterSpacing:".02em"}}>
            {t("home.heroSub")}
          </motion.p>

          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.65,duration:.8}}
            className="flex flex-wrap gap-4 justify-center items-center">
            <Link to="/register" className="btn-prime group flex items-center gap-3 text-[11px] font-semibold tracking-[.2em] uppercase px-10 py-4 text-white">
              {t("home.startInvesting")} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link to="/login" className="nav-link ul-em flex items-center gap-2 text-[11px] font-medium tracking-[.18em] uppercase">
              {t("home.signIn")} <ArrowRight size={13} style={{color:"var(--em)"}} />
            </Link>
          </motion.div>

          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1,duration:.8}}
            className="flex flex-wrap justify-center gap-8 mt-16">
            {["256-bit Encrypted","24/7 Live Support","FCA Compliant","150+ Countries"].map((txt,i)=>(
              <div key={i} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full" style={{background:"var(--em)"}} />
                <span className="text-[9px] font-medium tracking-[.2em] uppercase" style={{color:"rgba(255,255,255,.28)"}}>{txt}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.5}}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{color:"rgba(16,185,129,.4)"}}>
          <span className="text-[9px] tracking-[.3em] uppercase">{t("home.scroll")}</span>
          <ChevronDown size={14} className="animate-bounce" />
        </motion.div>
      </section>

      {/* ══════════════════════ TICKER ══════════════════════ */}
      <div className="relative z-10 overflow-hidden border-y py-4" style={{borderColor:"rgba(16,185,129,.12)",background:"rgba(255,255,255,.015)",backdropFilter:"blur(12px)"}}>
        <div className="ticker flex gap-20 whitespace-nowrap w-max">
          {[0,1].map(ri=>(
            <div key={ri} className="flex gap-20">
              {tickers.map((tk,i)=>(
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[10px] font-semibold tracking-[.18em]" style={{color:"var(--em)"}}>{tk.sym}</span>
                  <span className="text-[10px] font-light text-white">{tk.val}</span>
                  <span className="text-[10px] font-medium" style={{color:tk.up?"#4ade80":"#f87171"}}>{tk.up?"▲":"▼"}{tk.up?" 2.4%":" 0.3%"}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════ STATS ══════════════════════ */}
      <section className="relative z-10 py-20 px-6" style={{background:"rgba(255,255,255,.015)",borderBottom:"1px solid rgba(16,185,129,.1)"}}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {stats.map((s,i)=>(
            <motion.div key={i} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}}
              transition={{delay:i*.1,duration:.75,ease:[.22,1,.36,1]}} viewport={{once:true}}
              className="px-10 py-8 text-center" style={{borderRight:i<3?"1px solid rgba(16,185,129,.1)":"none"}}>
              <p className="serif font-light mb-2" style={{fontSize:"clamp(40px,5vw,64px)",lineHeight:1,background:"linear-gradient(135deg,var(--em),var(--teal))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
                <Counter to={s.to} prefix={s.prefix} suffix={s.suffix} />
              </p>
              <p className="text-[9px] font-medium tracking-[.24em] uppercase" style={{color:"var(--muted)"}}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════ FEATURES ══════════════════════ */}
      <section className="relative z-10 py-36 px-6 overflow-hidden" style={{background:"#080c18"}}>
        <div className="bg-num absolute -top-4 -left-6" style={{fontSize:"40vw"}}>W</div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="mb-20">
            <div className="flex items-center gap-4 mb-5">
              <div className="h-px w-10" style={{background:"var(--em)"}} />
              <span className="text-[9px] font-semibold tracking-[.3em] uppercase" style={{color:"var(--em)"}}>{t("home.whyUs")}</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <h2 className="serif font-light" style={{fontSize:"clamp(36px,5vw,72px)",lineHeight:1.08,maxWidth:580}}>
                {t("home.builtFor")}{" "}
                <em style={{fontStyle:"italic",background:"linear-gradient(135deg,var(--em),var(--teal))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>serious investors.</em>
              </h2>
              <p className="text-sm font-light max-w-xs leading-relaxed" style={{color:"var(--muted)"}}>Everything you need to grow, protect and manage your wealth — in one platform.</p>
            </div>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{once:true}}
            className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{background:"rgba(16,185,129,.08)",border:"1px solid rgba(16,185,129,.1)"}}>
            {features.map((f,i)=>(
              <motion.div key={i} variants={fadeUp} className="card-hover group p-12 flex flex-col gap-6 relative overflow-hidden" style={{background:"#080c18"}}>
                <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{background:"linear-gradient(90deg,var(--em),var(--teal))"}} />
                <div className="w-12 h-12 flex items-center justify-center border" style={{borderColor:"rgba(16,185,129,.3)",color:"var(--em)"}}>{f.icon}</div>
                <div>
                  <h3 className="serif text-2xl font-light mb-3 text-white">{f.title}</h3>
                  <p className="text-sm font-light leading-relaxed" style={{color:"var(--muted)"}}>{f.desc}</p>
                </div>
                <div className="mt-auto pt-6 border-t" style={{borderColor:"rgba(255,255,255,.06)"}}>
                  <span className="ul-em text-[10px] font-medium tracking-[.2em] uppercase" style={{color:"var(--em)"}}>Learn more →</span>
                </div>
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{background:"radial-gradient(ellipse at bottom left,rgba(16,185,129,.06) 0%,transparent 70%)"}} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════ HOW IT WORKS ══════════════════════ */}
      <section className="relative z-10 py-36 px-6 overflow-hidden" style={{background:"rgba(255,255,255,.015)",borderTop:"1px solid rgba(16,185,129,.08)"}}>
        <div className="absolute inset-0 grid-bg" />
        <div className="bg-num absolute right-0 top-1/2 -translate-y-1/2" style={{fontSize:"38vw"}}>03</div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="mb-20">
            <div className="flex items-center gap-4 mb-5">
              <div className="h-px w-10" style={{background:"var(--em)"}} />
              <span className="text-[9px] font-semibold tracking-[.3em] uppercase" style={{color:"var(--em)"}}>{t("home.simpleProcess")}</span>
            </div>
            <h2 className="serif font-light" style={{fontSize:"clamp(36px,5vw,72px)",lineHeight:1.08}}>{t("home.steps.title")}</h2>
          </motion.div>
          <div className="hidden md:block absolute" style={{top:195,left:"calc(16.66% + 40px)",right:"calc(16.66% + 40px)",height:1,background:"linear-gradient(to right,transparent,rgba(16,185,129,.4),transparent)"}} />
          <div className="grid grid-cols-1 md:grid-cols-3">
            {steps.map((s,i)=>(
              <motion.div key={i} initial={{opacity:0,y:36}} whileInView={{opacity:1,y:0}}
                transition={{delay:i*.2,duration:.85,ease:[.22,1,.36,1]}} viewport={{once:true}}
                className="flex flex-col gap-6 p-10">
                <div className="relative w-20 h-20 flex items-center justify-center" style={{border:"1px solid rgba(16,185,129,.3)",background:"rgba(16,185,129,.04)"}}>
                  <span className="serif font-light text-3xl" style={{color:"var(--em)"}}>{s.n}</span>
                  <div className="absolute top-0 left-0 w-3 h-3 border-t border-l" style={{borderColor:"var(--em)"}} />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r" style={{borderColor:"var(--em)"}} />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l" style={{borderColor:"var(--em)"}} />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r" style={{borderColor:"var(--em)"}} />
                </div>
                <h3 className="serif text-2xl font-light text-white">{s.title}</h3>
                <p className="text-sm font-light leading-relaxed" style={{color:"var(--muted)",maxWidth:220}}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ TESTIMONIALS ══════════════════════ */}
      <section className="relative z-10 py-36 px-6 overflow-hidden" style={{background:"#080c18"}}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute" style={{width:1,height:"200%",background:"linear-gradient(to bottom,transparent,rgba(16,185,129,.12),transparent)",top:"-50%",left:"30%",transform:"rotate(20deg)"}} />
          <div className="absolute" style={{width:1,height:"200%",background:"linear-gradient(to bottom,transparent,rgba(20,184,166,.08),transparent)",top:"-50%",right:"20%",transform:"rotate(20deg)"}} />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="mb-20">
            <div className="flex items-center gap-4 mb-5">
              <div className="h-px w-10" style={{background:"var(--em)"}} />
              <span className="text-[9px] font-semibold tracking-[.3em] uppercase" style={{color:"var(--em)"}}>{t("home.investorReviews")}</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <h2 className="serif font-light" style={{fontSize:"clamp(36px,5vw,72px)",lineHeight:1.08}}>{t("home.testimonialsTitle")}</h2>
              <p className="text-sm font-light max-w-xs leading-relaxed" style={{color:"var(--muted)"}}>{t("home.testimonialsSubtitle")}</p>
            </div>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{once:true}}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px" style={{background:"rgba(16,185,129,.07)"}}>
            {testimonials.map((item,i)=>(
              <motion.div key={i} variants={fadeUp} className="card-hover group p-10 flex flex-col gap-5 relative overflow-hidden" style={{background:"#080c18"}}>
                <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{background:"linear-gradient(90deg,var(--em),var(--teal))"}} />
                <div className="flex gap-1">{[...Array(5)].map((_,j)=><Star key={j} size={11} fill="var(--em)" style={{color:"var(--em)"}} />)}</div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 w-fit border" style={{background:"rgba(16,185,129,.08)",borderColor:"rgba(16,185,129,.2)"}}>
                  <TrendingUp size={11} style={{color:"var(--em)"}} />
                  <span className="text-[10px] font-bold tracking-wider" style={{color:"var(--em)"}}>+{item.profit}</span>
                  <span className="text-[10px]" style={{color:"var(--muted)"}}>· {item.plan}</span>
                </div>
                <p className="serif text-lg font-light italic flex-1 leading-relaxed text-white">"{item.text}"</p>
                <div className="flex items-center gap-3 pt-5 border-t" style={{borderColor:"rgba(255,255,255,.07)"}}>
                  <div className="w-10 h-10 flex items-center justify-center text-xs font-bold shrink-0 text-white"
                    style={{background:"linear-gradient(135deg,rgba(16,185,129,.3),rgba(20,184,166,.2))",border:"1px solid rgba(16,185,129,.3)"}}>
                    {item.av}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.name}</p>
                    <p className="text-[10px] tracking-wider" style={{color:"var(--muted)"}}>{item.country}</p>
                  </div>
                </div>
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{background:"radial-gradient(ellipse at bottom left,rgba(16,185,129,.05) 0%,transparent 70%)"}} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="mt-16 text-center">
            <Link to="/register" className="btn-prime inline-flex items-center gap-3 text-[11px] font-semibold tracking-[.2em] uppercase px-12 py-5 text-white">
              {t("home.startInvestingToday")} <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════ CTA ══════════════════════ */}
      <section className="relative z-10 py-44 px-6 overflow-hidden" style={{background:"rgba(255,255,255,.015)",borderTop:"1px solid rgba(16,185,129,.08)"}}>
        <div className="absolute inset-0 grid-bg" />
        <div className="orb absolute rounded-full pointer-events-none" style={{width:800,height:800,background:"radial-gradient(circle,rgba(16,185,129,.08) 0%,transparent 70%)",top:"50%",left:"50%",transform:"translate(-50%,-50%)"}} />
        <motion.div initial={{opacity:0,y:32}} whileInView={{opacity:1,y:0}} transition={{duration:.9,ease:[.22,1,.36,1]}} viewport={{once:true}}
          className="max-w-4xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-5 mb-8">
            <div className="h-px w-16" style={{background:"var(--em)"}} />
            <span className="text-[9px] font-semibold tracking-[.3em] uppercase" style={{color:"var(--em)"}}>{t("home.joinThePlatform")}</span>
            <div className="h-px w-16" style={{background:"var(--em)"}} />
          </div>
          <h2 className="serif font-light mb-8" style={{fontSize:"clamp(44px,7.5vw,100px)",lineHeight:1.02,color:"#fff"}}>{t("home.cta.title")}</h2>
          <p className="text-base font-light mb-14 max-w-md mx-auto leading-relaxed" style={{color:"var(--muted)"}}>{t("home.cta.sub")}</p>
          <Link to="/register" className="btn-prime inline-flex items-center gap-3 text-[11px] font-semibold tracking-[.24em] uppercase px-16 py-6 text-white">
            {t("home.cta.button")} <ArrowRight size={14} />
          </Link>
          <div className="flex flex-wrap justify-center gap-4 mt-14">
            {["256-bit SSL Encrypted","FCA Regulated","No Hidden Fees","Instant Withdrawals"].map((txt,i)=>(
              <div key={i} className="flex items-center gap-2 px-4 py-2 border" style={{borderColor:"rgba(16,185,129,.15)",background:"rgba(16,185,129,.04)"}}>
                <div className="w-1 h-1 rounded-full" style={{background:"var(--em)"}} />
                <span className="text-[9px] font-medium tracking-[.15em] uppercase" style={{color:"rgba(255,255,255,.35)"}}>{txt}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════ FOOTER ══════════════════════ */}
      <footer className="relative z-10 py-10 px-8 border-t" style={{borderColor:"rgba(16,185,129,.1)",background:"#080c18"}}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="serif text-lg font-light tracking-[.16em] uppercase" style={{color:"var(--em)"}}>
            Mexica<em className="not-italic text-white">Trading</em>
          </div>
          <div className="flex items-center gap-8">
            <Link to="/terms" className="nav-link ul-em text-[10px] tracking-[.2em] uppercase">{t("home.termsLink")}</Link>
            <Link to="/privacy" className="nav-link ul-em text-[10px] tracking-[.2em] uppercase">{t("home.privacyLink")}</Link>
          </div>
          <p className="text-[10px] tracking-[.14em]" style={{color:"rgba(16,185,129,.3)"}}>© {new Date().getFullYear()} MexicaTrading. {t("home.allRightsReserved")}</p>
        </div>
      </footer>

    </div>
  );
            }
