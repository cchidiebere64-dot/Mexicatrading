import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Clock, Users, Cpu, Zap, ShieldCheck, BarChart3, FileText,
  UserPlus, LogIn, Wallet, TrendingUp, ChevronLeft, ChevronRight, Quote, Star
} from "lucide-react";

/* ─────────── Hero slides ─────────── */
const SLIDES = [
  { tag: "Expanding the possibilities", head: "Grow your wealth,", accent: "the smart way." },
  { tag: "Built for everyone", head: "Investing made", accent: "simple & secure." },
  { tag: "Endless opportunities", head: "Your journey to", accent: "financial freedom." },
  { tag: "A brand new horizon", head: "Trade. Earn.", accent: "Prosper." },
];

/* ─────────── 3 pillars ─────────── */
const PILLARS = [
  { icon: Clock, title: "The Right Timing", text: "We align opportunities using advanced market analysis. In a fast-moving market, timing is everything — and we help you act with confidence." },
  { icon: Users, title: "The Right Team", text: "Our dedicated team is committed to delivering a dependable platform, always one step ahead, built for the long term." },
  { icon: Cpu,   title: "The Right Technology", text: "A refined, secure platform developed and monitored by professionals. Reliable technology you can trust with your investments." },
];

/* ─────────── Plans (EXAMPLE — edit to match your real Plans page) ─────────── */
const PLANS = [
  { name: "Starter",   rate: "Flexible returns", min: "$15",     max: "$499",    feat: ["Principal + Profit", "5% Referral Commission", "24/7 Support"], popular: false },
  { name: "Bronze",    rate: "Higher returns",   min: "$500",    max: "$1,999",  feat: ["Principal + Profit", "5% Referral Commission", "Priority Support"], popular: true  },
  { name: "Silver",    rate: "Premium returns",  min: "$2,000",  max: "$9,999",  feat: ["Principal + Profit", "5% Referral Commission", "Priority Support"], popular: false },
  { name: "Gold",      rate: "Elite returns",    min: "$10,000", max: "Unlimited", feat: ["Principal + Profit", "5% Referral Commission", "Dedicated Manager"], popular: false },
];

/* ─────────── Platform features ─────────── */
const FEATURES = [
  { icon: Zap,         title: "Fast Payments",         text: "Accessing your funds is quick and effortless, regardless of your technical experience." },
  { icon: ShieldCheck, title: "Layered Security",      text: "Your account is protected with state-of-the-art security, safeguarding your funds and data." },
  { icon: Cpu,         title: "Proprietary Technology",text: "Our platform is designed and refined exclusively by our own team for our members." },
  { icon: BarChart3,   title: "Transparent Reporting", text: "Track your investments and results clearly, anytime, right from your dashboard." },
];

/* ─────────── How it works ─────────── */
const STEPS = [
  { icon: UserPlus, title: "Register",  text: "Open your free MexicaTrading account in minutes." },
  { icon: LogIn,    title: "Login",     text: "Confirm your details and access your dashboard." },
  { icon: Wallet,   title: "Fund",      text: "Fund your account easily with crypto (BTC / USDT)." },
  { icon: TrendingUp, title: "Earn",    text: "Choose a plan and watch your investment grow." },
];

/* ─────────── Testimonials (generic, no fake earnings claims) ─────────── */
const TESTIMONIALS = [
  { name: "Daniel O.", country: "Nigeria",      text: "One of the most transparent platforms I've used. Withdrawals are smooth and the support team is always there when I need them." },
  { name: "Maria S.",  country: "Mexico",       text: "I started small and grew at my own pace. The dashboard is clear and easy, and I always know what's happening with my account." },
  { name: "James K.",  country: "South Africa", text: "What I love most is the transparency and how friendly the support is. Everything works exactly as described." },
  { name: "Aisha B.",  country: "Ghana",        text: "Simple to use and reliable. The referral program is a nice bonus and the whole experience feels professional." },
];

/* ─────────── Fake-but-labelled live activity ─────────── */
const FIRST_NAMES = ["John","Maria","Ahmed","Chen","Daniel","Aisha","Carlos","Priya","Liam","Sofia","Kwame","Yuki","Omar","Elena","David","Grace"];
const FLAGS = ["🇳🇬","🇲🇽","🇿🇦","🇬🇭","🇰🇪","🇧🇷","🇮🇳","🇵🇭","🇪🇬","🇺🇸","🇬🇧","🇨🇦","🇩🇪","🇫🇷"];
const COINS = ["BTC","USDT","ETH"];
const mask = (n) => n[0] + "***" + (n.length > 4 ? n[n.length-1] : "");
const randItem = (a) => a[Math.floor(Math.random()*a.length)];
const genRow = () => ({
  id: Math.random().toString(36).slice(2),
  name: mask(randItem(FIRST_NAMES)),
  amount: (Math.floor(Math.random()*490)+10) * 10,
  flag: randItem(FLAGS),
  coin: randItem(COINS),
});

export default function Home() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const [testi, setTesti] = useState(0);
  const [deposits, setDeposits]   = useState(() => Array.from({length:8}, genRow));
  const [withdraws, setWithdraws] = useState(() => Array.from({length:8}, genRow));

  /* hero auto-rotate */
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s+1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  /* testimonials auto-rotate */
  useEffect(() => {
    const t = setInterval(() => setTesti(s => (s+1) % TESTIMONIALS.length), 6000);
    return () => clearInterval(t);
  }, []);

  /* live activity: push a new row every few seconds */
  useEffect(() => {
    const t = setInterval(() => {
      setDeposits(d => [genRow(), ...d.slice(0,7)]);
    }, 3500);
    const t2 = setInterval(() => {
      setWithdraws(d => [genRow(), ...d.slice(0,7)]);
    }, 4200);
    return () => { clearInterval(t); clearInterval(t2); };
  }, []);

  return (
    <div className="bg-[#080c18] text-white overflow-hidden" style={{ fontFamily:"'Montserrat',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap');
        :root{--em:#10b981;--teal:#14b8a6;}
        .serif{font-family:'Cormorant Garamond',serif;}
        ::selection{background:var(--em);color:#080c18;}
        @keyframes shine{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes orb{0%,100%{opacity:.05}50%{opacity:.12}}
        .orb{animation:orb 7s ease-in-out infinite;}
        .top-line{background:linear-gradient(90deg,transparent,var(--em) 40%,var(--teal) 60%,transparent);background-size:400% 100%;animation:shine 3s linear infinite;}
        .grid-bg{background-image:linear-gradient(rgba(16,185,129,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,.03) 1px,transparent 1px);background-size:72px 72px;}
        .btn-prime{background:linear-gradient(135deg,var(--em),var(--teal));transition:transform .3s,box-shadow .3s;position:relative;overflow:hidden;}
        .btn-prime:hover{transform:translateY(-2px);box-shadow:0 0 0 1px var(--em),0 16px 40px rgba(16,185,129,.35);}
        .shine-badge{border:1px solid transparent;background:linear-gradient(#080c18,#080c18) padding-box,linear-gradient(90deg,transparent 20%,var(--em) 50%,transparent 80%) border-box;background-size:200% auto;animation:shine 4s linear infinite;}
        .card-hover{transition:transform .4s,border-color .4s,background .4s;}
        .card-hover:hover{transform:translateY(-6px);border-color:rgba(16,185,129,.4)!important;background:rgba(16,185,129,.04)!important;}
        .gradtext{background:linear-gradient(135deg,var(--em),var(--teal));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
      `}</style>

      {/* Top shimmer */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[2px]"><div className="top-line h-full w-full" /></div>

      {/* ════════ HERO ════════ */}
      <section className="relative min-h-[88vh] flex items-center justify-center px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="grid-bg absolute inset-0" />
          <div className="orb absolute rounded-full" style={{width:800,height:800,background:"radial-gradient(circle,rgba(16,185,129,.1) 0%,transparent 70%)",top:"-300px",left:"-200px"}} />
          <div className="orb absolute rounded-full" style={{width:600,height:600,background:"radial-gradient(circle,rgba(20,184,166,.08) 0%,transparent 70%)",bottom:"-200px",right:"-150px",animationDelay:"3.5s"}} />
        </div>

        <div className="relative z-10 text-center max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div key={slide}
              initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}
              transition={{duration:.6,ease:[.22,1,.36,1]}}>
              <div className="shine-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-semibold tracking-[.28em] uppercase mb-7" style={{color:"var(--em)"}}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:"var(--em)"}} />
                {SLIDES[slide].tag}
              </div>
              <h1 className="serif font-light mb-6" style={{fontSize:"clamp(40px,8vw,76px)",lineHeight:1.02}}>
                {SLIDES[slide].head}<br />
                <em className="gradtext" style={{fontStyle:"italic"}}>{SLIDES[slide].accent}</em>
              </h1>
            </motion.div>
          </AnimatePresence>

          <p className="text-sm sm:text-base font-light max-w-xl mx-auto mb-9" style={{color:"rgba(255,255,255,.45)"}}>
            A secure, transparent investment platform trusted by people worldwide. Start your journey toward financial growth — with no minimum and friendly 24/7 support.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button onClick={()=>navigate("/register")}
              className="btn-prime px-8 py-4 text-[11px] font-semibold tracking-[.2em] uppercase text-white flex items-center gap-3">
              Start Now <ArrowRight size={15} />
            </button>
            <button onClick={()=>navigate("/plans")}
              className="px-8 py-4 border text-[11px] font-medium tracking-[.18em] uppercase transition-all duration-300"
              style={{borderColor:"rgba(255,255,255,.12)",color:"rgba(255,255,255,.6)"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(16,185,129,.4)";e.currentTarget.style.color="var(--em)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.12)";e.currentTarget.style.color="rgba(255,255,255,.6)";}}>
              View Plans
            </button>
          </div>

          {/* slide dots */}
          <div className="flex items-center justify-center gap-2 mt-10">
            {SLIDES.map((_,i)=>(
              <button key={i} onClick={()=>setSlide(i)} className="h-1.5 rounded-full transition-all duration-400"
                style={{width:i===slide?28:8,background:i===slide?"var(--em)":"rgba(255,255,255,.2)"}} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 3 PILLARS ════════ */}
      <Section>
        <div className="grid md:grid-cols-3 gap-6">
          {PILLARS.map((p,i)=>(
            <Reveal key={i} delay={i*.12}>
              <div className="card-hover h-full p-8 border" style={{borderColor:"rgba(255,255,255,.08)",background:"rgba(255,255,255,.02)"}}>
                <div className="w-14 h-14 border flex items-center justify-center mb-5" style={{borderColor:"rgba(16,185,129,.25)",background:"rgba(16,185,129,.06)"}}>
                  <p.icon size={24} style={{color:"var(--em)"}} />
                </div>
                <h3 className="serif text-2xl font-light mb-3">{p.title}</h3>
                <p className="text-sm font-light leading-relaxed" style={{color:"rgba(255,255,255,.45)"}}>{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ════════ PART OF SOMETHING BIGGER ════════ */}
      <Section>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <p className="text-[10px] font-semibold tracking-[.3em] uppercase mb-4" style={{color:"var(--em)"}}>Part of something bigger</p>
            <h2 className="serif font-light mb-6" style={{fontSize:"clamp(28px,4vw,46px)",lineHeight:1.08}}>
              The world of investing, <em className="gradtext" style={{fontStyle:"italic"}}>made easier.</em>
            </h2>
            <p className="text-sm font-light leading-relaxed mb-6" style={{color:"rgba(255,255,255,.45)"}}>
              The global financial market attracts millions of people with a shared dream of financial freedom. MexicaTrading combines technical expertise with a dedicated team and a passion for helping people improve their lives — on a platform built to be secure, simple, and transparent.
            </p>
            <button onClick={()=>navigate("/register")}
              className="btn-prime px-7 py-3.5 text-[11px] font-semibold tracking-[.2em] uppercase text-white inline-flex items-center gap-3">
              Learn More <ArrowRight size={14} />
            </button>
          </Reveal>
          <Reveal delay={.15}>
            <div className="relative aspect-video border flex items-center justify-center overflow-hidden" style={{borderColor:"rgba(16,185,129,.2)",background:"linear-gradient(135deg,rgba(16,185,129,.08),rgba(20,184,166,.04))"}}>
              <div className="grid-bg absolute inset-0 opacity-50" />
              <div className="relative text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{background:"linear-gradient(135deg,var(--em),var(--teal))"}}>
                  <TrendingUp size={28} className="text-white" />
                </div>
                <p className="serif text-xl font-light gradtext">MexicaTrading</p>
                <p className="text-[10px] tracking-[.2em] uppercase mt-1" style={{color:"rgba(255,255,255,.3)"}}>Secure · Transparent · Global</p>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ════════ PLANS ════════ */}
      <Section>
        <Heading kicker="Investment Plans" title="A perfect plan" accent="for everyone" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
          {PLANS.map((p,i)=>(
            <Reveal key={i} delay={i*.1}>
              <div className="card-hover relative h-full p-7 border flex flex-col"
                style={{borderColor:p.popular?"rgba(16,185,129,.4)":"rgba(255,255,255,.08)",background:p.popular?"rgba(16,185,129,.05)":"rgba(255,255,255,.02)"}}>
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[8px] font-bold tracking-[.2em] uppercase text-white" style={{background:"linear-gradient(135deg,var(--em),var(--teal))"}}>
                    Most Popular
                  </span>
                )}
                <p className="text-[10px] font-semibold tracking-[.2em] uppercase mb-1" style={{color:"rgba(255,255,255,.4)"}}>{p.name}</p>
                <p className="serif text-2xl font-light mb-5 gradtext">{p.rate}</p>
                <div className="space-y-1 mb-5 text-sm" style={{color:"rgba(255,255,255,.55)"}}>
                  <p><span className="text-white/30">Min:</span> {p.min}</p>
                  <p><span className="text-white/30">Max:</span> {p.max}</p>
                </div>
                <div className="space-y-2 mb-6 flex-1">
                  {p.feat.map((f,j)=>(
                    <div key={j} className="flex items-center gap-2 text-xs" style={{color:"rgba(255,255,255,.5)"}}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:"var(--em)"}} /> {f}
                    </div>
                  ))}
                </div>
                <button onClick={()=>navigate("/register")}
                  className="btn-prime w-full py-3 text-[10px] font-semibold tracking-[.2em] uppercase text-white">
                  Start Now
                </button>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="text-center text-[11px] mt-6" style={{color:"rgba(255,255,255,.25)"}}>
          * Returns vary by plan. All investing carries risk — please invest responsibly.
        </p>
      </Section>

      {/* ════════ LIVE ACTIVITY ════════ */}
      <Section>
        <Heading kicker="Live Activity" title="Real-time" accent="transactions" />
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <ActivityTable title="Latest Deposits" rows={deposits} positive />
          <ActivityTable title="Latest Withdrawals" rows={withdraws} />
        </div>
        <p className="text-center text-[10px] mt-4" style={{color:"rgba(255,255,255,.2)"}}>
          Live activity feed · names partially hidden for privacy
        </p>
      </Section>

      {/* ════════ HOW IT WORKS ════════ */}
      <Section>
        <Heading kicker="Get Started" title="Begin in" accent="4 simple steps" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
          {STEPS.map((s,i)=>(
            <Reveal key={i} delay={i*.1}>
              <div className="relative text-center p-7 border h-full card-hover" style={{borderColor:"rgba(255,255,255,.08)",background:"rgba(255,255,255,.02)"}}>
                <span className="serif text-5xl font-light absolute top-3 right-4" style={{color:"rgba(16,185,129,.15)"}}>{i+1}</span>
                <div className="w-14 h-14 border flex items-center justify-center mx-auto mb-4" style={{borderColor:"rgba(16,185,129,.25)",background:"rgba(16,185,129,.06)"}}>
                  <s.icon size={22} style={{color:"var(--em)"}} />
                </div>
                <h3 className="text-base font-semibold mb-2">{s.title}</h3>
                <p className="text-xs font-light leading-relaxed" style={{color:"rgba(255,255,255,.4)"}}>{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ════════ FEATURES ════════ */}
      <Section>
        <Heading kicker="Why MexicaTrading" title="Something" accent="different." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
          {FEATURES.map((f,i)=>(
            <Reveal key={i} delay={i*.1}>
              <div className="card-hover h-full p-7 border" style={{borderColor:"rgba(255,255,255,.08)",background:"rgba(255,255,255,.02)"}}>
                <div className="w-12 h-12 border flex items-center justify-center mb-4" style={{borderColor:"rgba(16,185,129,.25)",background:"rgba(16,185,129,.06)"}}>
                  <f.icon size={20} style={{color:"var(--em)"}} />
                </div>
                <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                <p className="text-xs font-light leading-relaxed" style={{color:"rgba(255,255,255,.4)"}}>{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ════════ TESTIMONIALS ════════ */}
      <Section>
        <Heading kicker="Testimonials" title="What our members" accent="are saying" />
        <div className="max-w-2xl mx-auto mt-12">
          <AnimatePresence mode="wait">
            <motion.div key={testi}
              initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}
              transition={{duration:.5}}
              className="p-9 border text-center" style={{borderColor:"rgba(16,185,129,.2)",background:"rgba(255,255,255,.02)"}}>
              <Quote size={28} className="mx-auto mb-5" style={{color:"rgba(16,185,129,.4)"}} />
              <p className="serif text-xl font-light leading-relaxed mb-6" style={{color:"rgba(255,255,255,.7)"}}>
                "{TESTIMONIALS[testi].text}"
              </p>
              <div className="flex items-center justify-center gap-1 mb-3">
                {[...Array(5)].map((_,i)=>(<Star key={i} size={13} fill="var(--em)" style={{color:"var(--em)"}} />))}
              </div>
              <p className="text-sm font-semibold">{TESTIMONIALS[testi].name}</p>
              <p className="text-[11px] tracking-wider uppercase mt-0.5" style={{color:"rgba(255,255,255,.3)"}}>{TESTIMONIALS[testi].country}</p>
            </motion.div>
          </AnimatePresence>
          <div className="flex items-center justify-center gap-3 mt-6">
            <button onClick={()=>setTesti(t=>(t-1+TESTIMONIALS.length)%TESTIMONIALS.length)}
              className="w-10 h-10 border flex items-center justify-center transition-all" style={{borderColor:"rgba(255,255,255,.1)",color:"rgba(255,255,255,.5)"}}>
              <ChevronLeft size={16} />
            </button>
            <div className="flex gap-1.5">
              {TESTIMONIALS.map((_,i)=>(
                <button key={i} onClick={()=>setTesti(i)} className="h-1.5 rounded-full transition-all"
                  style={{width:i===testi?24:8,background:i===testi?"var(--em)":"rgba(255,255,255,.2)"}} />
              ))}
            </div>
            <button onClick={()=>setTesti(t=>(t+1)%TESTIMONIALS.length)}
              className="w-10 h-10 border flex items-center justify-center transition-all" style={{borderColor:"rgba(255,255,255,.1)",color:"rgba(255,255,255,.5)"}}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </Section>

      {/* ════════ FINAL CTA ════════ */}
      <Section>
        <Reveal>
          <div className="relative text-center p-12 border overflow-hidden" style={{borderColor:"rgba(16,185,129,.25)",background:"linear-gradient(135deg,rgba(16,185,129,.08),rgba(20,184,166,.03))"}}>
            <div className="grid-bg absolute inset-0 opacity-40" />
            <div className="relative">
              <h2 className="serif font-light mb-4" style={{fontSize:"clamp(28px,5vw,52px)",lineHeight:1.05}}>
                Ready to <em className="gradtext" style={{fontStyle:"italic"}}>begin?</em>
              </h2>
              <p className="text-sm font-light max-w-md mx-auto mb-8" style={{color:"rgba(255,255,255,.45)"}}>
                Join MexicaTrading today and take your first step toward financial growth. No minimum, secure platform, friendly 24/7 support.
              </p>
              <button onClick={()=>navigate("/register")}
                className="btn-prime px-9 py-4 text-[11px] font-semibold tracking-[.2em] uppercase text-white inline-flex items-center gap-3">
                Create Free Account <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* ════════ FOOTER ════════ */}
      <footer className="border-t px-6 py-12" style={{borderColor:"rgba(255,255,255,.06)"}}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="serif text-2xl font-light gradtext">Mexica<em className="not-italic text-white">Trading</em></p>
              <p className="text-xs mt-1" style={{color:"rgba(255,255,255,.3)"}}>Trusted global investment platform</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] tracking-wider uppercase" style={{color:"rgba(255,255,255,.4)"}}>
              {[["About","/"],["Plans","/plans"],["Terms","/terms"],["Privacy","/privacy"],["Login","/login"]].map(([l,to],i)=>(
                <button key={i} onClick={()=>navigate(to)} className="transition-colors hover:text-emerald-400">{l}</button>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3" style={{borderColor:"rgba(255,255,255,.05)"}}>
            <p className="text-[10px]" style={{color:"rgba(255,255,255,.25)"}}>© {new Date().getFullYear()} MexicaTrading. All Rights Reserved.</p>
            <p className="text-[10px] max-w-md text-center sm:text-right" style={{color:"rgba(255,255,255,.2)"}}>
              Investing involves risk. Please invest responsibly and only what you can afford.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─────────── Helpers ─────────── */
function Section({ children }) {
  return <section className="relative px-6 py-20 max-w-6xl mx-auto">{children}</section>;
}

function Reveal({ children, delay=0 }) {
  return (
    <motion.div
      initial={{opacity:0,y:30}}
      whileInView={{opacity:1,y:0}}
      viewport={{once:true,margin:"-60px"}}
      transition={{duration:.7,delay,ease:[.22,1,.36,1]}}>
      {children}
    </motion.div>
  );
}

function Heading({ kicker, title, accent }) {
  return (
    <Reveal>
      <div className="text-center">
        <p className="text-[10px] font-semibold tracking-[.3em] uppercase mb-4" style={{color:"var(--em)"}}>{kicker}</p>
        <h2 className="serif font-light" style={{fontSize:"clamp(28px,4.5vw,50px)",lineHeight:1.08}}>
          {title} <em className="gradtext" style={{fontStyle:"italic"}}>{accent}</em>
        </h2>
      </div>
    </Reveal>
  );
}

function ActivityTable({ title, rows, positive }) {
  return (
    <div className="border" style={{borderColor:"rgba(255,255,255,.08)",background:"rgba(255,255,255,.02)"}}>
      <div className="px-5 py-3 border-b flex items-center gap-2" style={{borderColor:"rgba(255,255,255,.06)"}}>
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:positive?"var(--em)":"#14b8a6"}} />
        <p className="text-[10px] font-semibold tracking-[.2em] uppercase" style={{color:"rgba(255,255,255,.5)"}}>{title}</p>
      </div>
      <div className="divide-y" style={{borderColor:"rgba(255,255,255,.04)"}}>
        <AnimatePresence initial={false}>
          {rows.map((r)=>(
            <motion.div key={r.id}
              initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
              transition={{duration:.4}}
              className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">{r.flag}</span>
                <span className="text-sm" style={{color:"rgba(255,255,255,.6)"}}>{r.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold" style={{color:positive?"var(--em)":"#14b8a6"}}>
                  ${r.amount.toLocaleString()}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 border" style={{borderColor:"rgba(255,255,255,.1)",color:"rgba(255,255,255,.35)"}}>{r.coin}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
