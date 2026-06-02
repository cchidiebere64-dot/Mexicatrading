import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Clock, Users, Cpu, Zap, ShieldCheck, BarChart3,
  UserPlus, LogIn, Wallet, TrendingUp, ChevronLeft, ChevronRight, Quote, Star,
  Lock, BadgeCheck, Globe, Server
} from "lucide-react";
import LiveActivity from "../components/LiveActivity.jsx";

/* ─────────── Hero slides (Unsplash CDN — free for commercial use) ─────────── */
const SLIDES = [
  { tag: "Expanding the possibilities", head: "Grow your wealth,", accent: "the smart way.",      img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1920&q=80" },
  { tag: "Built for everyone",          head: "Investing made",     accent: "simple & secure.",    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80" },
  { tag: "Endless opportunities",       head: "Your journey to",    accent: "financial freedom.",  img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1920&q=80" },
  { tag: "A brand new horizon",         head: "Trade. Earn.",       accent: "Prosper.",            img: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=1920&q=80" },
];

/* Continuous fixed backgrounds — rotate through these (trading / people / finance) */
const PAGE_BGS = [
  "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=1920&q=80", // crypto data
  "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1920&q=80", // business handshake
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1920&q=80", // team working
  "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1920&q=80", // trader screens
  "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1920&q=80", // financial district
];

const PILLARS = [
  { icon: Clock, title: "The Right Timing", text: "We align opportunities using advanced market analysis. In a fast-moving market, timing is everything — and we help you act with confidence." },
  { icon: Users, title: "The Right Team", text: "Our dedicated team is committed to delivering a dependable platform, always one step ahead, built for the long term." },
  { icon: Cpu,   title: "The Right Technology", text: "A refined, secure platform developed and monitored by professionals. Reliable technology you can trust with your investments." },
];

/* EXAMPLE plans — edit to match your real Plans page */
const PLANS = [
  { name: "Starter", rate: "Flexible returns", min: "$15",     max: "$499",      feat: ["Principal + Profit", "5% Referral Commission", "24/7 Support"], popular: false },
  { name: "Bronze",  rate: "Higher returns",   min: "$500",    max: "$1,999",    feat: ["Principal + Profit", "5% Referral Commission", "Priority Support"], popular: true  },
  { name: "Silver",  rate: "Premium returns",  min: "$2,000",  max: "$9,999",    feat: ["Principal + Profit", "5% Referral Commission", "Priority Support"], popular: false },
  { name: "Gold",    rate: "Elite returns",    min: "$10,000", max: "Unlimited", feat: ["Principal + Profit", "5% Referral Commission", "Dedicated Manager"], popular: false },
];

const FEATURES = [
  { icon: Zap,         title: "Fast Payments",          text: "Accessing your funds is quick and effortless, regardless of your technical experience." },
  { icon: ShieldCheck, title: "Layered Security",       text: "Your account is protected with state-of-the-art security, safeguarding your funds and data." },
  { icon: Cpu,         title: "Proprietary Technology", text: "Our platform is designed and refined exclusively by our own team for our members." },
  { icon: BarChart3,   title: "Transparent Reporting",  text: "Track your investments and results clearly, anytime, right from your dashboard." },
];

const STEPS = [
  { icon: UserPlus,   title: "Register", text: "Open your free MexicaTrading account in minutes." },
  { icon: LogIn,      title: "Login",    text: "Confirm your details and access your dashboard." },
  { icon: Wallet,     title: "Fund",     text: "Fund your account easily with crypto (BTC / USDT)." },
  { icon: TrendingUp, title: "Earn",     text: "Choose a plan and watch your investment grow." },
];

const TRUST = [
  { icon: Lock,       title: "Bank-Level Encryption", text: "All data is protected with strong end-to-end encryption." },
  { icon: ShieldCheck,title: "Secure Platform",        text: "Layered security safeguards your account around the clock." },
  { icon: Globe,      title: "Global Members",         text: "Trusted by people across many countries worldwide." },
  { icon: Server,     title: "Reliable Infrastructure",text: "Built on dependable technology for stable, 24/7 access." },
];

const TESTIMONIALS = [
  { name: "Daniel O.", country: "Nigeria",      text: "One of the most transparent platforms I've used. Withdrawals are smooth and the support team is always there when I need them." },
  { name: "Maria S.",  country: "Mexico",       text: "I started small and grew at my own pace. The dashboard is clear and easy, and I always know what's happening with my account." },
  { name: "James K.",  country: "South Africa", text: "What I love most is the transparency and how friendly the support is. Everything works exactly as described." },
  { name: "Aisha B.",  country: "Ghana",        text: "Simple to use and reliable. The referral program is a nice bonus and the whole experience feels professional." },
];

const FIRST_NAMES = [
  "John","Maria","Ahmed","Chen","Daniel","Aisha","Carlos","Priya","Liam","Sofia",
  "Kwame","Yuki","Omar","Elena","David","Grace","Fatima","Lucas","Ngozi","Hassan",
  "Mei","Diego","Amara","Yusuf","Olga","Tunde","Ravi","Lena","Pablo","Zainab",
  "Kenji","Rosa","Emeka","Layla","Marco","Chidi","Hana","Andre","Bisi","Ibrahim",
  "Nadia","Felix","Sade","Tariq","Ines","Kofi","Mira","Pedro","Aaliyah","Sergei",
  "Wei","Juana","Bashir","Lin","Ada","Karim","Esther","Mateo","Halima","Viktor",
  "Sun","Carmen","Femi","Rania","Hugo","Chioma","Akira","Lola","Samuel","Yara",
  "Dmitri","Bianca","Musa","Nia","Thiago","Salma","Ken","Adaeze","Rafael","Dunia",
];
const FLAGS = [
  "🇳🇬","🇲🇽","🇿🇦","🇬🇭","🇰🇪","🇧🇷","🇮🇳","🇵🇭","🇪🇬","🇺🇸",
  "🇬🇧","🇨🇦","🇩🇪","🇫🇷","🇪🇸","🇮🇹","🇨🇳","🇯🇵","🇰🇷","🇹🇷",
  "🇦🇪","🇸🇦","🇮🇩","🇵🇰","🇧🇩","🇻🇳","🇹🇭","🇵🇹","🇳🇱","🇸🇪",
  "🇨🇭","🇦🇷","🇨🇴","🇨🇱","🇵🇪","🇷🇺","🇺🇦","🇵🇱","🇬🇷","🇲🇦",
];
const COINS = ["BTC","USDT","ETH","BNB","SOL","USDC","XRP","TRX"];
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
  const [pageBg, setPageBg] = useState(0);
  const [deposits, setDeposits]   = useState(() => Array.from({length:8}, genRow));
  const [withdraws, setWithdraws] = useState(() => Array.from({length:8}, genRow));

  useEffect(() => { const t = setInterval(() => setSlide(s => (s+1) % SLIDES.length), 5500); return () => clearInterval(t); }, []);
  useEffect(() => { const t = setInterval(() => setPageBg(s => (s+1) % PAGE_BGS.length), 7000); return () => clearInterval(t); }, []);
  useEffect(() => { const t = setInterval(() => setTesti(s => (s+1) % TESTIMONIALS.length), 6000); return () => clearInterval(t); }, []);
  useEffect(() => {
    const t  = setInterval(() => setDeposits(d => [genRow(), ...d.slice(0,7)]), 3500);
    const t2 = setInterval(() => setWithdraws(d => [genRow(), ...d.slice(0,7)]), 4200);
    return () => { clearInterval(t); clearInterval(t2); };
  }, []);

  return (
    <div className="relative text-white" style={{ fontFamily:"'Montserrat',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap');
        :root{--em:#10b981;--teal:#14b8a6;}
        .serif{font-family:'Cormorant Garamond',serif;}
        ::selection{background:var(--em);color:#080c18;}
        @keyframes shine{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes orb{0%,100%{opacity:.05}50%{opacity:.12}}
        @keyframes kenburns{0%{transform:scale(1)}100%{transform:scale(1.12)}}
        .orb{animation:orb 7s ease-in-out infinite;}
        .top-line{background:linear-gradient(90deg,transparent,var(--em) 40%,var(--teal) 60%,transparent);background-size:400% 100%;animation:shine 3s linear infinite;}
        .grid-bg{background-image:linear-gradient(rgba(16,185,129,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,.03) 1px,transparent 1px);background-size:72px 72px;}
        .btn-prime{background:linear-gradient(135deg,var(--em),var(--teal));transition:transform .3s,box-shadow .3s;position:relative;overflow:hidden;}
        .btn-prime:hover{transform:translateY(-2px);box-shadow:0 0 0 1px var(--em),0 16px 40px rgba(16,185,129,.35);}
        .shine-badge{border:1px solid transparent;background:linear-gradient(rgba(8,12,24,.5),rgba(8,12,24,.5)) padding-box,linear-gradient(90deg,transparent 20%,var(--em) 50%,transparent 80%) border-box;background-size:200% auto;animation:shine 4s linear infinite;}
        .card-hover{transition:transform .4s,border-color .4s,background .4s;}
        .card-hover:hover{transform:translateY(-6px);border-color:rgba(16,185,129,.4)!important;background:rgba(8,12,24,.7)!important;}
        .gradtext{background:linear-gradient(135deg,var(--em),var(--teal));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
        .kb{animation:kenburns 7s ease-out forwards;}
        .parallax{background-attachment:fixed;background-size:cover;background-position:center;}
        @media (max-width:768px){.parallax{background-attachment:scroll;}}
        /* glass panel — see-through so the bright continuous bg shows behind it */
        .glass{background:rgba(8,12,24,.4);backdrop-filter:blur(2px);}
      `}</style>

      {/* Top shimmer */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[2px]"><div className="top-line h-full w-full" /></div>

      {/* ════════ CONTINUOUS FIXED BACKGROUND (rotates, brighter) ════════ */}
      <div className="fixed inset-0 -z-10 bg-[#080c18]">
        <AnimatePresence mode="sync">
          <motion.div key={pageBg} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:1.6}} className="absolute inset-0">
            <div className="parallax absolute inset-0" style={{ backgroundImage:`url(${PAGE_BGS[pageBg]})` }} />
          </motion.div>
        </AnimatePresence>
        {/* lighter overlay so the photo is clearly visible */}
        <div className="absolute inset-0" style={{ background:"linear-gradient(180deg,rgba(8,12,24,.55),rgba(8,12,24,.62))" }} />
        <div className="grid-bg absolute inset-0 opacity-25" />
      </div>

      {/* ════════ HERO ════════ */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 py-24">
        <div className="absolute inset-0 overflow-hidden">
          <AnimatePresence mode="sync">
            <motion.div key={slide} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:1.2}} className="absolute inset-0">
              <div className="parallax absolute inset-0 kb" style={{ backgroundImage:`url(${SLIDES[slide].img})` }} />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0" style={{ background:"linear-gradient(180deg,rgba(8,12,24,.4),rgba(8,12,24,.5) 65%,rgba(8,12,24,.75) 100%)" }} />
          <div className="absolute inset-0" style={{ background:"radial-gradient(circle at 30% 40%,rgba(16,185,129,.15),transparent 60%)" }} />
          <div className="grid-bg absolute inset-0 opacity-40" />
        </div>

        <div className="relative z-10 text-center max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div key={slide} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} transition={{duration:.6,ease:[.22,1,.36,1]}}>
              <div className="shine-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-semibold tracking-[.28em] uppercase mb-7" style={{color:"var(--em)"}}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:"var(--em)"}} />
                {SLIDES[slide].tag}
              </div>
              <h1 className="serif font-light mb-6" style={{fontSize:"clamp(40px,8vw,78px)",lineHeight:1.02,textShadow:"0 2px 30px rgba(0,0,0,.6)"}}>
                {SLIDES[slide].head}<br />
                <em className="gradtext" style={{fontStyle:"italic"}}>{SLIDES[slide].accent}</em>
              </h1>
            </motion.div>
          </AnimatePresence>

          <p className="text-sm sm:text-base font-light max-w-xl mx-auto mb-9" style={{color:"rgba(255,255,255,.7)",textShadow:"0 1px 12px rgba(0,0,0,.6)"}}>
            <span className="font-semibold text-white">MexicaTrading is a secure global investment platform where everyday people grow their money with confidence.</span> Invest in trusted plans, track your earnings in real time, and withdraw your profits fast — all on one simple, transparent platform built for you.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button onClick={()=>navigate("/register")}
              className="btn-prime px-8 py-4 text-[11px] font-semibold tracking-[.2em] uppercase text-white flex items-center gap-3">
              Start Now <ArrowRight size={15} />
            </button>
            <button onClick={()=>navigate("/login")}
              className="px-8 py-4 border text-[11px] font-medium tracking-[.18em] uppercase transition-all duration-300 flex items-center gap-2.5"
              style={{borderColor:"rgba(255,255,255,.3)",color:"rgba(255,255,255,.9)",backdropFilter:"blur(4px)"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--em)";e.currentTarget.style.color="var(--em)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.3)";e.currentTarget.style.color="rgba(255,255,255,.9)";}}>
              <LogIn size={14} /> Login
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-10">
            {SLIDES.map((_,i)=>(
              <button key={i} onClick={()=>setSlide(i)} className="h-1.5 rounded-full transition-all duration-400"
                style={{width:i===slide?28:8,background:i===slide?"var(--em)":"rgba(255,255,255,.3)"}} />
            ))}
          </div>

          {/* Benefit pills */}
          <div className="flex items-center justify-center gap-2.5 flex-wrap mt-9">
            {["No Minimum","Fast Withdrawals","Bank-Level Security"].map((b,i)=>(
              <span key={i} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] font-medium tracking-wider uppercase"
                style={{border:"1px solid rgba(16,185,129,.3)",background:"rgba(16,185,129,.06)",color:"rgba(255,255,255,.75)",backdropFilter:"blur(4px)"}}>
                <ShieldCheck size={11} style={{color:"var(--em)"}} /> {b}
              </span>
            ))}
          </div>

          {/* Trust row — big stats */}
          <div className="flex items-center justify-center gap-x-8 gap-y-3 flex-wrap mt-8">
            {[
              ["50,000+","Members"],
              ["$25M+","Paid Out"],
              ["90+","Countries"],
              ["24/7","Support"],
            ].map(([big,small],i)=>(
              <div key={i} className="text-center">
                <p className="serif text-3xl font-light gradtext leading-none">{big}</p>
                <p className="text-[9px] tracking-[.2em] uppercase mt-1.5" style={{color:"rgba(255,255,255,.45)"}}>{small}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 3 PILLARS ════════ */}
      <Section glass>
        <div className="grid md:grid-cols-3 gap-6">
          {PILLARS.map((p,i)=>(
            <Reveal key={i} delay={i*.12}>
              <div className="card-hover h-full p-8 border" style={{borderColor:"rgba(255,255,255,.08)",background:"rgba(8,12,24,.5)"}}>
                <div className="w-14 h-14 border flex items-center justify-center mb-5" style={{borderColor:"rgba(16,185,129,.25)",background:"rgba(16,185,129,.08)"}}>
                  <p.icon size={24} style={{color:"var(--em)"}} />
                </div>
                <h3 className="serif text-2xl font-light mb-3">{p.title}</h3>
                <p className="text-sm font-light leading-relaxed" style={{color:"rgba(255,255,255,.5)"}}>{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ════════ PART OF SOMETHING BIGGER (own image) ════════ */}
      <SolidSection>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <p className="text-[10px] font-semibold tracking-[.3em] uppercase mb-4" style={{color:"var(--em)"}}>Part of something bigger</p>
            <h2 className="serif font-light mb-6" style={{fontSize:"clamp(28px,4vw,46px)",lineHeight:1.08}}>
              The world of investing, <em className="gradtext" style={{fontStyle:"italic"}}>made easier.</em>
            </h2>
            <p className="text-sm font-light leading-relaxed mb-6" style={{color:"rgba(255,255,255,.5)"}}>
              The global financial market attracts millions of people with a shared dream of financial freedom. MexicaTrading combines technical expertise with a dedicated team and a passion for helping people improve their lives — on a platform built to be secure, simple, and transparent.
            </p>
            <button onClick={()=>navigate("/register")}
              className="btn-prime px-7 py-3.5 text-[11px] font-semibold tracking-[.2em] uppercase text-white inline-flex items-center gap-3">
              Learn More <ArrowRight size={14} />
            </button>
          </Reveal>
          <Reveal delay={.15}>
            <div className="relative aspect-video border overflow-hidden" style={{borderColor:"rgba(16,185,129,.2)"}}>
              <div className="absolute inset-0 bg-cover bg-center kb" style={{backgroundImage:"url(https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80)"}} />
              <div className="absolute inset-0" style={{background:"linear-gradient(135deg,rgba(8,12,24,.6),rgba(16,185,129,.22))"}} />
              <div className="relative h-full flex items-center justify-center text-center">
                <div>
                  <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{background:"linear-gradient(135deg,var(--em),var(--teal))"}}>
                    <TrendingUp size={28} className="text-white" />
                  </div>
                  <p className="serif text-xl font-light text-white">MexicaTrading</p>
                  <p className="text-[10px] tracking-[.2em] uppercase mt-1" style={{color:"rgba(255,255,255,.65)"}}>Secure · Transparent · Global</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </SolidSection>

      {/* ════════ PLANS ════════ */}
      <Section glass>
        <Heading kicker="Investment Plans" title="A perfect plan" accent="for everyone" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
          {PLANS.map((p,i)=>(
            <Reveal key={i} delay={i*.1}>
              <div className="card-hover relative h-full p-7 border flex flex-col"
                style={{borderColor:p.popular?"rgba(16,185,129,.4)":"rgba(255,255,255,.08)",background:p.popular?"rgba(16,185,129,.08)":"rgba(8,12,24,.5)"}}>
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[8px] font-bold tracking-[.2em] uppercase text-white" style={{background:"linear-gradient(135deg,var(--em),var(--teal))"}}>
                    Most Popular
                  </span>
                )}
                <p className="text-[10px] font-semibold tracking-[.2em] uppercase mb-1" style={{color:"rgba(255,255,255,.4)"}}>{p.name}</p>
                <p className="serif text-2xl font-light mb-5 gradtext">{p.rate}</p>
                <div className="space-y-1 mb-5 text-sm" style={{color:"rgba(255,255,255,.6)"}}>
                  <p><span className="text-white/30">Min:</span> {p.min}</p>
                  <p><span className="text-white/30">Max:</span> {p.max}</p>
                </div>
                <div className="space-y-2 mb-6 flex-1">
                  {p.feat.map((f,j)=>(
                    <div key={j} className="flex items-center gap-2 text-xs" style={{color:"rgba(255,255,255,.55)"}}>
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
        <p className="text-center text-[11px] mt-6" style={{color:"rgba(255,255,255,.3)"}}>
          * Returns vary by plan. All investing carries risk — please invest responsibly.
        </p>
      </Section>

      {/* ════════ PARALLAX QUOTE BAND (own image) ════════ */}
      <section className="relative">
        <div className="parallax absolute inset-0" style={{backgroundImage:"url(https://images.unsplash.com/photo-1591994843349-f415893b3a6b?auto=format&fit=crop&w=1920&q=80)"}} />
        <div className="absolute inset-0" style={{background:"linear-gradient(135deg,rgba(8,12,24,.6),rgba(16,185,129,.25))"}} />
        <div className="relative z-10 px-6 py-28 text-center max-w-3xl mx-auto">
          <Reveal>
            <Quote size={32} className="mx-auto mb-6" style={{color:"rgba(255,255,255,.6)"}} />
            <h2 className="serif font-light" style={{fontSize:"clamp(26px,4vw,44px)",lineHeight:1.15,textShadow:"0 2px 24px rgba(0,0,0,.55)"}}>
              "The journey to financial freedom begins with a single, <em className="gradtext" style={{fontStyle:"italic"}}>confident step.</em>"
            </h2>
            <p className="text-[11px] tracking-[.25em] uppercase mt-6" style={{color:"rgba(255,255,255,.7)"}}>— The MexicaTrading Team</p>
          </Reveal>
        </div>
      </section>

      {/* ════════ LIVE ACTIVITY ════════ */}
      <Section glass>
        <Heading kicker="Live Activity" title="Real-time" accent="transactions" />
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <ActivityTable title="Latest Deposits" rows={deposits} positive />
          <ActivityTable title="Latest Withdrawals" rows={withdraws} />
        </div>
        <p className="text-center text-[10px] mt-4" style={{color:"rgba(255,255,255,.25)"}}>
          Live activity feed · names partially hidden for privacy
        </p>
      </Section>

      {/* ════════ HOW IT WORKS ════════ */}
      <Section glass>
        <Heading kicker="Get Started" title="Begin in" accent="4 simple steps" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
          {STEPS.map((s,i)=>(
            <Reveal key={i} delay={i*.1}>
              <div className="relative text-center p-7 border h-full card-hover" style={{borderColor:"rgba(255,255,255,.08)",background:"rgba(8,12,24,.5)"}}>
                <span className="serif text-5xl font-light absolute top-3 right-4" style={{color:"rgba(16,185,129,.18)"}}>{i+1}</span>
                <div className="w-14 h-14 border flex items-center justify-center mx-auto mb-4" style={{borderColor:"rgba(16,185,129,.25)",background:"rgba(16,185,129,.08)"}}>
                  <s.icon size={22} style={{color:"var(--em)"}} />
                </div>
                <h3 className="text-base font-semibold mb-2">{s.title}</h3>
                <p className="text-xs font-light leading-relaxed" style={{color:"rgba(255,255,255,.45)"}}>{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ════════ FEATURES ════════ */}
      <Section glass>
        <Heading kicker="Why MexicaTrading" title="Something" accent="different." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
          {FEATURES.map((f,i)=>(
            <Reveal key={i} delay={i*.1}>
              <div className="card-hover h-full p-7 border" style={{borderColor:"rgba(255,255,255,.08)",background:"rgba(8,12,24,.5)"}}>
                <div className="w-12 h-12 border flex items-center justify-center mb-4" style={{borderColor:"rgba(16,185,129,.25)",background:"rgba(16,185,129,.08)"}}>
                  <f.icon size={20} style={{color:"var(--em)"}} />
                </div>
                <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                <p className="text-xs font-light leading-relaxed" style={{color:"rgba(255,255,255,.45)"}}>{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ════════ CERTIFICATE OF TRUST (original, safe) ════════ */}
      <Section glass>
        <Heading kicker="Trust & Security" title="Our commitment" accent="to you." />

        <Reveal delay={.1}>
          <div className="max-w-2xl mx-auto mt-12 relative overflow-hidden"
            style={{border:"1px solid rgba(16,185,129,.35)",background:"linear-gradient(160deg,rgba(8,12,24,.95),rgba(16,185,129,.05))"}}>
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2" style={{borderColor:"var(--em)"}} />
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2" style={{borderColor:"var(--em)"}} />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2" style={{borderColor:"var(--em)"}} />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2" style={{borderColor:"var(--em)"}} />

            <div className="px-8 py-10 text-center relative">
              <div className="relative w-20 h-20 mx-auto mb-5">
                <div className="absolute inset-0 rounded-full animate-pulse" style={{background:"radial-gradient(circle,rgba(16,185,129,.4),transparent 70%)"}} />
                <div className="relative w-20 h-20 rounded-full flex items-center justify-center" style={{background:"linear-gradient(135deg,var(--em),var(--teal))",boxShadow:"0 0 30px rgba(16,185,129,.4)"}}>
                  <BadgeCheck size={38} className="text-white" />
                </div>
              </div>

              <p className="text-[10px] tracking-[.35em] uppercase mb-3" style={{color:"var(--em)"}}>Certificate of Trust</p>
              <h3 className="serif font-light mb-1" style={{fontSize:"clamp(28px,5vw,42px)"}}>
                Mexica<em className="not-italic gradtext">Trading</em>
              </h3>
              <p className="text-[11px] tracking-[.2em] uppercase mb-6" style={{color:"rgba(255,255,255,.4)"}}>Secure &amp; Verified Investment Platform</p>

              <div className="w-16 h-px mx-auto mb-6" style={{background:"linear-gradient(90deg,transparent,var(--em),transparent)"}} />

              <p className="text-sm font-light leading-relaxed max-w-md mx-auto mb-7" style={{color:"rgba(255,255,255,.6)"}}>
                This certifies that MexicaTrading operates as a secure, transparent investment platform, committed to protecting every member's funds and data through strong encryption, continuous monitoring, and dedicated 24/7 support.
              </p>

              <div className="flex items-center justify-center gap-8 flex-wrap text-center">
                <div>
                  <p className="text-[9px] tracking-[.2em] uppercase mb-1" style={{color:"rgba(255,255,255,.35)"}}>Registered Office</p>
                  <p className="text-xs font-medium" style={{color:"rgba(255,255,255,.7)"}}>Mexico City, CDMX, Mexico</p>
                </div>
                <div className="w-px h-8 hidden sm:block" style={{background:"rgba(255,255,255,.15)"}} />
                <div>
                  <p className="text-[9px] tracking-[.2em] uppercase mb-1" style={{color:"rgba(255,255,255,.35)"}}>Support</p>
                  <p className="text-xs font-medium" style={{color:"rgba(255,255,255,.7)"}}>Available 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
          {TRUST.map((t,i)=>(
            <Reveal key={i} delay={i*.1}>
              <div className="card-hover h-full p-6 border text-center" style={{borderColor:"rgba(255,255,255,.08)",background:"rgba(8,12,24,.5)"}}>
                <div className="w-12 h-12 border flex items-center justify-center mx-auto mb-3" style={{borderColor:"rgba(16,185,129,.25)",background:"rgba(16,185,129,.08)"}}>
                  <t.icon size={20} style={{color:"var(--em)"}} />
                </div>
                <h3 className="text-sm font-semibold mb-1.5">{t.title}</h3>
                <p className="text-[11px] font-light leading-relaxed" style={{color:"rgba(255,255,255,.4)"}}>{t.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ════════ TESTIMONIALS ════════ */}
      <Section glass>
        <Heading kicker="Testimonials" title="What our members" accent="are saying" />
        <div className="max-w-2xl mx-auto mt-12">
          <AnimatePresence mode="wait">
            <motion.div key={testi} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} transition={{duration:.5}}
              className="p-9 border text-center" style={{borderColor:"rgba(16,185,129,.2)",background:"rgba(8,12,24,.5)"}}>
              <Quote size={28} className="mx-auto mb-5" style={{color:"rgba(16,185,129,.4)"}} />
              <p className="serif text-xl font-light leading-relaxed mb-6" style={{color:"rgba(255,255,255,.75)"}}>
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

      {/* ════════ FINAL CTA (own parallax image) ════════ */}
      <Section>
        <Reveal>
          <div className="relative text-center p-12 border overflow-hidden" style={{borderColor:"rgba(16,185,129,.25)"}}>
            <div className="parallax absolute inset-0" style={{backgroundImage:"url(https://images.unsplash.com/photo-1620325867502-221cfb5faa5f?auto=format&fit=crop&w=1600&q=80)"}} />
            <div className="absolute inset-0" style={{background:"linear-gradient(135deg,rgba(8,12,24,.72),rgba(16,185,129,.28))"}} />
            <div className="grid-bg absolute inset-0 opacity-40" />
            <div className="relative">
              <h2 className="serif font-light mb-4" style={{fontSize:"clamp(28px,5vw,52px)",lineHeight:1.05,textShadow:"0 2px 20px rgba(0,0,0,.5)"}}>
                Ready to <em className="gradtext" style={{fontStyle:"italic"}}>begin?</em>
              </h2>
              <p className="text-sm font-light max-w-md mx-auto mb-8" style={{color:"rgba(255,255,255,.72)"}}>
                Join MexicaTrading today and take your first step toward financial growth. No minimum, secure platform, friendly 24/7 support.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <button onClick={()=>navigate("/register")}
                  className="btn-prime px-9 py-4 text-[11px] font-semibold tracking-[.2em] uppercase text-white inline-flex items-center gap-3">
                  Create Free Account <ArrowRight size={15} />
                </button>
                <button onClick={()=>navigate("/login")}
                  className="px-9 py-4 border text-[11px] font-medium tracking-[.18em] uppercase transition-all duration-300 inline-flex items-center gap-2.5"
                  style={{borderColor:"rgba(255,255,255,.3)",color:"rgba(255,255,255,.9)"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--em)";e.currentTarget.style.color="var(--em)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.3)";e.currentTarget.style.color="rgba(255,255,255,.9)";}}>
                  <LogIn size={14}/> Login
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* ════════ FOOTER ════════ */}
      <footer className="relative border-t px-6 py-12 glass" style={{borderColor:"rgba(255,255,255,.06)"}}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="serif text-2xl font-light gradtext">Mexica<em className="not-italic text-white">Trading</em></p>
              <p className="text-xs mt-1" style={{color:"rgba(255,255,255,.35)"}}>Trusted global investment platform</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] tracking-wider uppercase" style={{color:"rgba(255,255,255,.45)"}}>
              {[["About","/"],["Plans","/plans"],["Terms","/terms"],["Privacy","/privacy"],["Login","/login"]].map(([l,to],i)=>(
                <button key={i} onClick={()=>navigate(to)} className="transition-colors hover:text-emerald-400">{l}</button>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3" style={{borderColor:"rgba(255,255,255,.05)"}}>
            <p className="text-[10px]" style={{color:"rgba(255,255,255,.3)"}}>© {new Date().getFullYear()} MexicaTrading. All Rights Reserved.</p>
            <p className="text-[10px] max-w-md text-center sm:text-right" style={{color:"rgba(255,255,255,.25)"}}>
              Investing involves risk. Please invest responsibly and only what you can afford.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─────────── Helpers ─────────── */
function Section({ children, glass }) {
  return (
    <section className={`relative px-6 py-20 ${glass ? "glass" : ""}`}>
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  );
}
function SolidSection({ children }) {
  return (
    <section className="relative px-6 py-20" style={{background:"rgba(8,12,24,.92)"}}>
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  );
}
function Reveal({ children, delay=0 }) {
  return (
    <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-60px"}}
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
    <div className="border" style={{borderColor:"rgba(255,255,255,.08)",background:"rgba(8,12,24,.6)"}}>
      <div className="px-5 py-3 border-b flex items-center gap-2" style={{borderColor:"rgba(255,255,255,.06)"}}>
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:positive?"var(--em)":"#14b8a6"}} />
        <p className="text-[10px] font-semibold tracking-[.2em] uppercase" style={{color:"rgba(255,255,255,.5)"}}>{title}</p>
      </div>
      <div className="divide-y" style={{borderColor:"rgba(255,255,255,.04)"}}>
        <AnimatePresence initial={false}>
          {rows.map((r)=>(
            <motion.div key={r.id} initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} transition={{duration:.4}}
              className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">{r.flag}</span>
                <span className="text-sm" style={{color:"rgba(255,255,255,.6)"}}>{r.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold" style={{color:positive?"var(--em)":"#14b8a6"}}>${r.amount.toLocaleString()}</span>
                <span className="text-[10px] px-1.5 py-0.5 border" style={{borderColor:"rgba(255,255,255,.1)",color:"rgba(255,255,255,.35)"}}>{r.coin}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <LiveActivity />
    </div>
  );
}
