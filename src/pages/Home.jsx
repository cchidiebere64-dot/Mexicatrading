import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Shield, TrendingUp, Globe, ArrowRight, ChevronDown, Star, Lock, BarChart2, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRef, useEffect, useState } from "react";

/* ─── Noise SVG overlay ─── */
const Noise = () => (
  <div className="pointer-events-none fixed inset-0 z-[999] opacity-[0.035]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundRepeat: "repeat",
      backgroundSize: "180px 180px",
    }}
  />
);

/* ─── Animated counter ─── */
function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const triggered = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !triggered.current) {
        triggered.current = true;
        const num = parseFloat(target.replace(/[^0-9.]/g, ""));
        const duration = 1600;
        const steps = 60;
        let step = 0;
        const timer = setInterval(() => {
          step++;
          const progress = step / steps;
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount((eased * num).toFixed(target.includes(".") ? 1 : 0));
          if (step >= steps) clearInterval(timer);
        }, duration / steps);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Home() {
  const { t } = useTranslation();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const stats = [
    { raw: "2.4", suffix: "B+", prefix: "$", label: t("home.stats.assets") },
    { raw: "98.6", suffix: "%", prefix: "", label: t("home.stats.satisfaction") },
    { raw: "150", suffix: "+", prefix: "", label: t("home.stats.countries") },
    { raw: "24", suffix: "/7", prefix: "", label: t("home.stats.support") },
  ];

  const features = [
    { icon: <Lock size={22} />, title: t("home.features.secureTitle"), desc: t("home.features.secureDesc") },
    { icon: <BarChart2 size={22} />, title: t("home.features.profitTitle"), desc: t("home.features.profitDesc") },
    { icon: <Globe size={22} />, title: t("home.features.globalTitle"), desc: t("home.features.globalDesc") },
  ];

  const steps = [
    { step: "01", title: t("home.steps.step1Title"), desc: t("home.steps.step1Desc") },
    { step: "02", title: t("home.steps.step2Title"), desc: t("home.steps.step2Desc") },
    { step: "03", title: t("home.steps.step3Title"), desc: t("home.steps.step3Desc") },
  ];

  const testimonials = [
    { name: t("home.t1Name"), country: t("home.t1Country"), plan: t("home.t1Plan"), profit: t("home.t1Profit"), avatar: "JO", text: t("home.t1Text") },
    { name: t("home.t2Name"), country: t("home.t2Country"), plan: t("home.t2Plan"), profit: t("home.t2Profit"), avatar: "FA", text: t("home.t2Text") },
    { name: t("home.t3Name"), country: t("home.t3Country"), plan: t("home.t3Plan"), profit: t("home.t3Profit"), avatar: "CM", text: t("home.t3Text") },
    { name: t("home.t4Name"), country: t("home.t4Country"), plan: t("home.t4Plan"), profit: t("home.t4Profit"), avatar: "AD", text: t("home.t4Text") },
    { name: t("home.t5Name"), country: t("home.t5Country"), plan: t("home.t5Plan"), profit: t("home.t5Profit"), avatar: "SN", text: t("home.t5Text") },
    { name: t("home.t6Name"), country: t("home.t6Country"), plan: t("home.t6Plan"), profit: t("home.t6Profit"), avatar: "DM", text: t("home.t6Text") },
  ];

  const staggerContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 32 },
    show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div className="relative bg-[#07080D] text-white overflow-x-hidden" style={{ fontFamily: "'Montserrat', sans-serif" }}>

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Montserrat:wght@300;400;500;600&display=swap');
        :root {
          --gold: #C9A96E;
          --gold-light: #E8D5B0;
          --gold-glow: rgba(201,169,110,0.15);
          --gold-dim: rgba(201,169,110,0.08);
          --charcoal: #111318;
          --graphite: #1A1C24;
          --smoke: #22242E;
          --cream: #F0EBE1;
          --muted: rgba(240,235,225,0.38);
        }
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .text-gold { color: var(--gold); }
        .bg-gold { background: var(--gold); }
        .border-gold { border-color: var(--gold); }
        ::selection { background: var(--gold); color: #07080D; }

        /* Ticker */
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .ticker-track { animation: ticker 28s linear infinite; }

        /* Shimmer line */
        @keyframes shimmer { from { background-position: -400px 0; } to { background-position: 400px 0; } }
        .shimmer-line {
          background: linear-gradient(90deg, transparent 0%, var(--gold) 50%, transparent 100%);
          background-size: 400px 1px;
          animation: shimmer 3s ease-in-out infinite;
        }

        /* Glow pulse */
        @keyframes goldPulse { 0%,100% { opacity: 0.06; } 50% { opacity: 0.14; } }
        .glow-orb { animation: goldPulse 6s ease-in-out infinite; }

        /* Vertical scrolling line */
        @keyframes scanDown { from { top: -30%; } to { top: 110%; } }
        .scan-line { animation: scanDown 8s linear infinite; }

        /* Card hover lift */
        .card-lift { transition: transform 0.4s cubic-bezier(.22,1,.36,1), box-shadow 0.4s; }
        .card-lift:hover { transform: translateY(-6px); box-shadow: 0 32px 64px rgba(201,169,110,0.08); }

        /* Gold underline reveal */
        .gold-link { position: relative; }
        .gold-link::after { content:''; position:absolute; left:0; bottom:-2px; width:0; height:1px; background:var(--gold); transition: width 0.35s ease; }
        .gold-link:hover::after { width:100%; }
      `}</style>

      <Noise />

      {/* ═══════════════════════════════ NAV ═══════════════════════════════ */}
      <nav className="fixed top-0 w-full z-50 px-8 py-5 flex items-center justify-between"
        style={{ background: "linear-gradient(to bottom, rgba(7,8,13,0.92), transparent)", backdropFilter: "blur(12px)" }}>

        <div className="font-serif text-xl tracking-[0.18em] text-[var(--gold)] uppercase font-light">
          Mexica<span style={{ color: "var(--cream)", fontStyle: "italic" }}>Trading</span>
        </div>

        <div className="hidden md:flex items-center gap-10">
          {["Markets", "Strategies", "Performance", "About"].map((item) => (
            <a key={item} href="#" className="gold-link text-[10px] tracking-[0.22em] uppercase font-medium"
              style={{ color: "var(--muted)", transition: "color 0.3s" }}
              onMouseEnter={e => e.target.style.color = "var(--gold)"}
              onMouseLeave={e => e.target.style.color = "var(--muted)"}>{item}</a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="gold-link text-[10px] tracking-[0.2em] uppercase font-medium"
            style={{ color: "var(--muted)", transition: "color 0.3s" }}
            onMouseEnter={e => e.target.style.color = "var(--gold)"}
            onMouseLeave={e => e.target.style.color = "var(--muted)"}>{t("nav.signIn")}</Link>
          <Link to="/register"
            className="text-[10px] tracking-[0.2em] uppercase font-semibold px-6 py-3 transition-all duration-300"
            style={{ background: "var(--gold)", color: "#07080D" }}
            onMouseEnter={e => { e.target.style.background = "var(--gold-light)"; e.target.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.target.style.background = "var(--gold)"; e.target.style.transform = "translateY(0)"; }}>
            {t("nav.getStarted")}
          </Link>
        </div>
      </nav>

      {/* ═══════════════════════════════ TICKER ═══════════════════════════════ */}
      <div className="fixed top-0 left-0 right-0 z-40 overflow-hidden h-[3px]">
        <div className="shimmer-line w-full h-full" />
      </div>

      {/* ═══════════════════════════════ HERO ═══════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-20 overflow-hidden">

        {/* Background orbs */}
        <div className="glow-orb absolute w-[900px] h-[900px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(201,169,110,0.09) 0%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
        <div className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(201,169,110,0.05) 0%, transparent 70%)", top: "20%", right: "10%" }} />

        {/* Vertical accent line */}
        <div className="absolute left-[8%] top-0 bottom-0 w-px pointer-events-none hidden lg:block"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(201,169,110,0.25) 30%, rgba(201,169,110,0.5) 60%, transparent)" }} />
        <div className="scan-line absolute left-[8%] w-px h-[30%] pointer-events-none hidden lg:block"
          style={{ background: "linear-gradient(to bottom, transparent, var(--gold), transparent)" }} />

        {/* Hero content */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-5xl mx-auto">

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 mb-12 px-5 py-2 border text-[10px] tracking-[0.28em] uppercase font-medium"
            style={{ borderColor: "rgba(201,169,110,0.3)", background: "rgba(201,169,110,0.06)", color: "var(--gold)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse" />
            {t("home.badge")}
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif font-light leading-[1.02] mb-8"
            style={{ fontSize: "clamp(52px, 8vw, 108px)", color: "var(--cream)", letterSpacing: "-0.01em" }}>
            {t("home.hero1")}{" "}
            <em style={{ color: "var(--gold)", fontStyle: "italic" }}>{t("home.hero2")}</em>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }}
            className="text-base md:text-lg max-w-lg mx-auto mb-14 leading-relaxed font-light"
            style={{ color: "var(--muted)", letterSpacing: "0.02em" }}>
            {t("home.heroSub")}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.7 }}
            className="flex gap-5 flex-wrap justify-center items-center">
            <Link to="/register"
              className="group flex items-center gap-3 text-[11px] tracking-[0.2em] uppercase font-semibold px-10 py-4 transition-all duration-300"
              style={{ background: "var(--gold)", color: "#07080D" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 20px 50px rgba(201,169,110,0.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
              {t("home.startInvesting")}
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link to="/login"
              className="gold-link flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase font-medium"
              style={{ color: "var(--muted)" }}>
              {t("home.signIn")} <ArrowRight size={13} style={{ color: "var(--gold)" }} />
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ color: "rgba(201,169,110,0.4)" }}>
          <span className="text-[9px] tracking-[0.3em] uppercase">{t("home.scroll")}</span>
          <ChevronDown size={14} className="animate-bounce" />
        </motion.div>
      </section>

      {/* ═══════════════════════════════ LIVE TICKER ═══════════════════════════════ */}
      <div className="relative z-10 overflow-hidden py-4 border-y" style={{ borderColor: "rgba(201,169,110,0.12)", background: "var(--charcoal)" }}>
        <div className="ticker-track flex gap-16 whitespace-nowrap w-max">
          {[...Array(2)].map((_, ri) => (
            <div key={ri} className="flex gap-16">
              {[
                { sym: "BTC/USD", val: "67,420", chg: "+2.4%" },
                { sym: "ETH/USD", val: "3,890", chg: "+1.8%" },
                { sym: "S&P 500", val: "5,312", chg: "+0.6%" },
                { sym: "GOLD", val: "2,341", chg: "+0.3%" },
                { sym: "EUR/USD", val: "1.0842", chg: "-0.2%" },
                { sym: "NASDAQ", val: "18,640", chg: "+1.1%" },
                { sym: "OIL WTI", val: "82.14", chg: "+0.9%" },
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[10px] tracking-[0.2em] font-semibold" style={{ color: "var(--gold)" }}>{t.sym}</span>
                  <span className="text-[10px] font-light" style={{ color: "var(--cream)" }}>{t.val}</span>
                  <span className="text-[10px]" style={{ color: t.chg.startsWith("+") ? "#4ade80" : "#f87171" }}>{t.chg}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════ STATS ═══════════════════════════════ */}
      <section className="relative z-10 py-20 px-6 border-b" style={{ borderColor: "rgba(201,169,110,0.1)", background: "var(--charcoal)" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x" style={{ divideColor: "rgba(201,169,110,0.12)" }}>
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} viewport={{ once: true }}
              className="px-10 py-8 text-center" style={{ borderColor: "rgba(201,169,110,0.12)", borderRight: i < 3 ? "1px solid rgba(201,169,110,0.12)" : "none" }}>
              <p className="font-serif font-light mb-2" style={{ fontSize: "clamp(36px,4vw,56px)", color: "var(--gold)", lineHeight: 1 }}>
                {s.prefix}<Counter target={s.raw + s.suffix} suffix={s.suffix} />{s.suffix !== "+%" && ""}
              </p>
              <p className="text-[9px] tracking-[0.25em] uppercase font-medium" style={{ color: "var(--muted)" }}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════ FEATURES ═══════════════════════════════ */}
      <section className="relative z-10 py-36 px-6" style={{ background: "#07080D" }}>

        {/* Section label */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="max-w-6xl mx-auto mb-20">
          <div className="flex items-center gap-5 mb-6">
            <div className="h-px w-10" style={{ background: "var(--gold)" }} />
            <span className="text-[9px] tracking-[0.3em] uppercase font-medium" style={{ color: "var(--gold)" }}>{t("home.whyUs")}</span>
          </div>
          <h2 className="font-serif font-light" style={{ fontSize: "clamp(36px,5vw,68px)", color: "var(--cream)", lineHeight: 1.1, maxWidth: 640 }}>
            {t("home.builtFor")} <em style={{ color: "var(--gold)" }}>those who demand more.</em>
          </h2>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-px"
          style={{ background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.1)" }}>
          {features.map((item, i) => (
            <motion.div key={i} variants={fadeUp}
              className="card-lift group p-12 flex flex-col gap-6 relative overflow-hidden"
              style={{ background: "var(--charcoal)" }}>
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-px transition-all duration-500"
                style={{ background: "transparent" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--gold)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"} />

              <div className="w-12 h-12 flex items-center justify-center border transition-all duration-400"
                style={{ borderColor: "rgba(201,169,110,0.3)", color: "var(--gold)" }}>
                {item.icon}
              </div>
              <div>
                <h3 className="font-serif text-2xl font-light mb-3" style={{ color: "var(--cream)" }}>{item.title}</h3>
                <p className="text-sm leading-relaxed font-light" style={{ color: "var(--muted)" }}>{item.desc}</p>
              </div>
              <div className="mt-auto pt-6 border-t" style={{ borderColor: "rgba(201,169,110,0.1)" }}>
                <span className="gold-link text-[10px] tracking-[0.2em] uppercase font-medium" style={{ color: "var(--gold)" }}>Learn more →</span>
              </div>

              {/* Hover glow */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "radial-gradient(ellipse at bottom left, rgba(201,169,110,0.05) 0%, transparent 70%)" }} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════════════════════════ HOW IT WORKS ═══════════════════════════════ */}
      <section className="relative z-10 py-36 px-6 overflow-hidden" style={{ background: "var(--charcoal)" }}>

        {/* Large background numeral */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 font-serif font-light select-none pointer-events-none"
          style={{ fontSize: "40vw", color: "rgba(201,169,110,0.02)", lineHeight: 1, right: "-5vw" }}>03</div>

        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20">
            <div className="flex items-center gap-5 mb-6">
              <div className="h-px w-10" style={{ background: "var(--gold)" }} />
              <span className="text-[9px] tracking-[0.3em] uppercase font-medium" style={{ color: "var(--gold)" }}>{t("home.simpleProcess")}</span>
            </div>
            <h2 className="font-serif font-light" style={{ fontSize: "clamp(36px,5vw,68px)", color: "var(--cream)", lineHeight: 1.1 }}>
              {t("home.steps.title")}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[17%] right-[17%] h-px"
              style={{ background: "linear-gradient(to right, transparent, rgba(201,169,110,0.4), transparent)" }} />

            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.18, duration: 0.8, ease: [0.22, 1, 0.36, 1] }} viewport={{ once: true }}
                className="flex flex-col gap-6 p-10">
                <div className="w-20 h-20 flex items-center justify-center border relative"
                  style={{ borderColor: "rgba(201,169,110,0.3)", background: "rgba(201,169,110,0.04)" }}>
                  <span className="font-serif font-light text-3xl" style={{ color: "var(--gold)" }}>{s.step}</span>
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t border-l" style={{ borderColor: "var(--gold)" }} />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r" style={{ borderColor: "var(--gold)" }} />
                </div>
                <h3 className="font-serif text-2xl font-light" style={{ color: "var(--cream)" }}>{s.title}</h3>
                <p className="text-sm leading-relaxed font-light" style={{ color: "var(--muted)", maxWidth: 220 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════ TESTIMONIALS ═══════════════════════════════ */}
      <section className="relative z-10 py-36 px-6" style={{ background: "#07080D" }}>

        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20">
            <div className="flex items-center gap-5 mb-6">
              <div className="h-px w-10" style={{ background: "var(--gold)" }} />
              <span className="text-[9px] tracking-[0.3em] uppercase font-medium" style={{ color: "var(--gold)" }}>{t("home.investorReviews")}</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <h2 className="font-serif font-light" style={{ fontSize: "clamp(36px,5vw,68px)", color: "var(--cream)", lineHeight: 1.1 }}>
                {t("home.testimonialsTitle")}
              </h2>
              <p className="text-sm font-light max-w-xs" style={{ color: "var(--muted)", lineHeight: 1.8 }}>
                {t("home.testimonialsSubtitle")}
              </p>
            </div>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px"
            style={{ background: "rgba(201,169,110,0.08)" }}>
            {testimonials.map((item, i) => (
              <motion.div key={i} variants={fadeUp}
                className="card-lift p-10 flex flex-col gap-5 relative overflow-hidden"
                style={{ background: "var(--charcoal)" }}>

                {/* Stars */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={11} style={{ color: "var(--gold)", fill: "var(--gold)" }} />
                  ))}
                </div>

                {/* Profit badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 w-fit"
                  style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.2)" }}>
                  <TrendingUp size={11} style={{ color: "var(--gold)" }} />
                  <span className="text-[10px] font-semibold tracking-wider" style={{ color: "var(--gold)" }}>+{item.profit}</span>
                  <span className="text-[10px]" style={{ color: "var(--muted)" }}>· {item.plan}</span>
                </div>

                {/* Quote */}
                <p className="font-serif text-lg font-light italic flex-1 leading-relaxed" style={{ color: "var(--cream)" }}>
                  "{item.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-5 border-t" style={{ borderColor: "rgba(201,169,110,0.12)" }}>
                  <div className="w-10 h-10 flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: "rgba(201,169,110,0.15)", border: "1px solid rgba(201,169,110,0.3)", color: "var(--gold)" }}>
                    {item.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--cream)" }}>{item.name}</p>
                    <p className="text-[10px] tracking-wider" style={{ color: "var(--muted)" }}>{item.country}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA under testimonials */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-16 text-center">
            <Link to="/register"
              className="inline-flex items-center gap-3 text-[11px] tracking-[0.2em] uppercase font-semibold px-12 py-5 transition-all duration-300"
              style={{ background: "var(--gold)", color: "#07080D" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 20px 50px rgba(201,169,110,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
              {t("home.startInvestingToday")} <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════ FINAL CTA ═══════════════════════════════ */}
      <section className="relative z-10 py-40 px-6 overflow-hidden" style={{ background: "var(--charcoal)" }}>

        {/* Diagonal gold line */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute" style={{
            width: "1px", height: "200%", background: "linear-gradient(to bottom, transparent, rgba(201,169,110,0.2), transparent)",
            top: "-50%", left: "30%", transform: "rotate(25deg)"
          }} />
          <div className="absolute" style={{
            width: "1px", height: "200%", background: "linear-gradient(to bottom, transparent, rgba(201,169,110,0.1), transparent)",
            top: "-50%", right: "20%", transform: "rotate(25deg)"
          }} />
          <div className="glow-orb absolute w-[700px] h-[700px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(201,169,110,0.07) 0%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center relative z-10">

          <div className="flex items-center justify-center gap-5 mb-8">
            <div className="h-px w-16" style={{ background: "var(--gold)" }} />
            <span className="text-[9px] tracking-[0.3em] uppercase font-medium" style={{ color: "var(--gold)" }}>{t("home.joinThePlatform")}</span>
            <div className="h-px w-16" style={{ background: "var(--gold)" }} />
          </div>

          <h2 className="font-serif font-light mb-8" style={{ fontSize: "clamp(44px,7vw,90px)", color: "var(--cream)", lineHeight: 1.05 }}>
            {t("home.cta.title")}
          </h2>

          <p className="text-base font-light mb-14 max-w-md mx-auto leading-relaxed" style={{ color: "var(--muted)" }}>
            {t("home.cta.sub")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register"
              className="inline-flex items-center gap-3 text-[11px] tracking-[0.22em] uppercase font-semibold px-14 py-5 transition-all duration-300"
              style={{ background: "var(--gold)", color: "#07080D" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 24px 60px rgba(201,169,110,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
              {t("home.cta.button")} <ArrowRight size={14} />
            </Link>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap justify-center gap-8 mt-16">
            {["256-bit SSL Encrypted", "FCA Regulated", "No Hidden Fees"].map((txt, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full" style={{ background: "var(--gold)" }} />
                <span className="text-[10px] tracking-[0.15em] uppercase" style={{ color: "var(--muted)" }}>{txt}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════ FOOTER ═══════════════════════════════ */}
      <footer className="relative z-10 py-12 px-8 border-t" style={{ borderColor: "rgba(201,169,110,0.1)", background: "#07080D" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

          <div className="font-serif text-lg tracking-[0.18em] uppercase font-light" style={{ color: "var(--gold)" }}>
            Mexica<span style={{ color: "var(--cream)", fontStyle: "italic" }}>Trading</span>
          </div>

          <div className="flex items-center gap-8">
            <Link to="/terms" className="gold-link text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--muted)" }}>{t("home.termsLink")}</Link>
            <Link to="/privacy" className="gold-link text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--muted)" }}>{t("home.privacyLink")}</Link>
          </div>

          <p className="text-[10px] tracking-[0.15em]" style={{ color: "rgba(201,169,110,0.3)" }}>
            © {new Date().getFullYear()} MexicaTrading. {t("home.allRightsReserved")}
          </p>
        </div>
      </footer>

    </div>
  );
}
