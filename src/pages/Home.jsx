import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Clock, Users, Cpu, Zap, ShieldCheck, BarChart3,
  UserPlus, LogIn, Wallet, TrendingUp, ChevronLeft, ChevronRight,
  Lock, BadgeCheck, Globe, Server,
} from "lucide-react";
import LiveActivity from "../components/LiveActivity.jsx";
import { T, ThemeStyles, Button } from "./system.jsx";

const c = T.color;

/* One image, used once. Chosen rather than cycled. */
const HERO_IMG = "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=1920&q=80";
const TEAM_IMG = "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1400&q=80";
const BAND_IMG = "https://images.unsplash.com/photo-1591994843349-f415893b3a6b?auto=format&fit=crop&w=1920&q=80";

/* Rotating headline — the words change, the page doesn't lurch. */
const LINES = [
  "Grow your wealth, the deliberate way.",
  "Investing made simple and secure.",
  "Your journey to financial independence.",
];

const PILLARS = [
  { icon: Clock, title: "Timing",     text: "We align opportunities using market analysis. In a fast-moving market, timing decides outcomes — we help you act with confidence." },
  { icon: Users, title: "People",     text: "A dedicated team committed to a dependable platform, built for the long term rather than the quick win." },
  { icon: Cpu,   title: "Technology", text: "A refined, secure platform developed and monitored by professionals. Infrastructure you can trust with your capital." },
];

const PLANS = [
  { name: "Starter", min: "$15",     max: "$499",      note: "A place to begin" },
  { name: "Basic",   min: "$500",    max: "$1,999",    note: "For steady investors" },
  { name: "Premium", min: "$2,000",  max: "$9,999",    note: "Our most chosen plan", popular: true },
  { name: "Elite",   min: "$10,000", max: "$49,999",   note: "For high-value portfolios" },
  { name: "VIP",     min: "$50,000", max: "Unlimited", note: "Reserved for serious capital" },
];

const FEATURES = [
  { icon: Zap,         title: "Fast payments",         text: "Accessing your funds is quick and effortless, whatever your technical experience." },
  { icon: ShieldCheck, title: "Layered security",      text: "Your account is protected by modern security safeguarding both funds and data." },
  { icon: Cpu,         title: "Own technology",        text: "Designed and refined by our own team, for our own members." },
  { icon: BarChart3,   title: "Transparent reporting", text: "Track your investments and results clearly, any time, from your dashboard." },
];

const STEPS = [
  { icon: UserPlus,   title: "Register", text: "Open your free account in minutes." },
  { icon: LogIn,      title: "Verify",   text: "Confirm your details and access your dashboard." },
  { icon: Wallet,     title: "Fund",     text: "Add funds by crypto or card." },
  { icon: TrendingUp, title: "Earn",     text: "Choose a plan and watch it mature." },
];

const TRUST = [
  { icon: Lock,        title: "Encrypted",      text: "Data protected end to end." },
  { icon: ShieldCheck, title: "PIN protected",  text: "Withdrawals need your PIN." },
  { icon: Globe,       title: "Global access",  text: "Members across many countries." },
  { icon: Server,      title: "Always on",      text: "Stable infrastructure, 24/7." },
];

const TESTIMONIALS = [
  { name: "Daniel O.", country: "Nigeria",      text: "One of the most transparent platforms I've used. Withdrawals are smooth and support is there when I need them." },
  { name: "Maria S.",  country: "Mexico",       text: "I started small and grew at my own pace. The dashboard is clear, and I always know what's happening with my account." },
  { name: "James K.",  country: "South Africa", text: "What I value is the transparency and how straightforward the support is. Everything works as described." },
  { name: "Aisha B.",  country: "Ghana",        text: "Simple to use and reliable. The referral programme is a nice bonus and the whole experience feels professional." },
];

/* Live tickers */
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
const mask = (n) => n[0] + "***" + (n.length > 4 ? n[n.length - 1] : "");
const randItem = (a) => a[Math.floor(Math.random() * a.length)];
const genRow = () => ({
  id: Math.random().toString(36).slice(2),
  name: mask(randItem(FIRST_NAMES)),
  amount: (Math.floor(Math.random() * 490) + 10) * 10,
  flag: randItem(FLAGS),
  coin: randItem(COINS),
});

export default function Home() {
  const navigate = useNavigate();
  const [line, setLine] = useState(0);
  const [testi, setTesti] = useState(0);
  const [deposits, setDeposits] = useState(() => Array.from({ length: 7 }, genRow));
  const [withdraws, setWithdraws] = useState(() => Array.from({ length: 7 }, genRow));

  useEffect(() => { const t = setInterval(() => setLine(s => (s + 1) % LINES.length), 5000); return () => clearInterval(t); }, []);
  useEffect(() => { const t = setInterval(() => setTesti(s => (s + 1) % TESTIMONIALS.length), 6000); return () => clearInterval(t); }, []);
  useEffect(() => {
    const t = setInterval(() => setDeposits(d => [genRow(), ...d.slice(0, 6)]), 3500);
    const t2 = setInterval(() => setWithdraws(d => [genRow(), ...d.slice(0, 6)]), 4200);
    return () => { clearInterval(t); clearInterval(t2); };
  }, []);

  return (
    <div className="ui" style={{ background: c.ink, color: c.text }}>
      <ThemeStyles />
      <style>{`
        .kb { animation: kb 18s ease-out forwards; }
        @keyframes kb { from { transform: scale(1.06); } to { transform: scale(1); } }
        .lift { transition: border-color .3s, background .3s; }
        .lift:hover { border-color: rgba(63,143,95,.35) !important; background: rgba(255,255,255,.02) !important; }
      `}</style>

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative flex items-center" style={{ minHeight: "92vh" }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="kb absolute inset-0" style={{
            backgroundImage: `url(${HERO_IMG})`, backgroundSize: "cover", backgroundPosition: "center",
          }} />
          <div className="absolute inset-0" style={{
            background: "linear-gradient(100deg, rgba(14,16,19,.96) 0%, rgba(14,16,19,.88) 45%, rgba(14,16,19,.55) 100%)",
          }} />
        </div>

        <div className="relative px-6 mx-auto w-full" style={{ maxWidth: 1100, paddingTop: 120, paddingBottom: 80 }}>
          <div style={{ maxWidth: 660 }}>

            <p className="mono" style={{ fontSize: T.size.tiny, letterSpacing: ".26em", textTransform: "uppercase", color: c.gain, marginBottom: T.space.xl }}>
              Global investment platform
            </p>

            <div style={{ minHeight: 190 }}>
              <AnimatePresence mode="wait">
                <motion.h1 key={line}
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: .5, ease: [.22, 1, .36, 1] }}
                  className="display"
                  style={{ fontSize: "clamp(38px,7vw,64px)", lineHeight: 1.04, color: "#fff" }}>
                  {LINES[line]}
                </motion.h1>
              </AnimatePresence>
            </div>

            <p style={{ fontSize: T.size.base, color: c.text2, lineHeight: 1.75, maxWidth: 520, marginTop: T.space.lg, marginBottom: T.space.xxl }}>
              <span style={{ color: "#fff" }}>MexicaTrading is a secure investment platform where everyday people grow their money with confidence.</span>{" "}
              Invest in clear plans, track earnings in real time, and withdraw your profits fast.
            </p>

            <div className="flex flex-wrap" style={{ gap: 10 }}>
              <Button onClick={() => navigate("/register")}>
                Open an account <ArrowRight size={13} />
              </Button>
              <Button variant="quiet" onClick={() => navigate("/login")}>
                <LogIn size={13} /> Sign in
              </Button>
            </div>

            {/* Facts row */}
            <div className="grid grid-cols-2 sm:grid-cols-4"
              style={{ marginTop: T.space.xxxl, borderTop: `1px solid rgba(255,255,255,.12)` }}>
              {[
                ["50,000+", "Members"],
                ["$25M+", "Paid out"],
                ["90+", "Countries"],
                ["24/7", "Support"],
              ].map(([big, small], i) => (
                <div key={i} style={{
                  padding: `${T.space.lg}px ${T.space.lg}px ${T.space.lg}px 0`,
                  borderLeft: i > 0 ? `1px solid rgba(255,255,255,.12)` : "none",
                  paddingLeft: i > 0 ? T.space.lg : 0,
                }}>
                  <p className="display tabular" style={{ fontSize: 26, color: "#fff", lineHeight: 1 }}>{big}</p>
                  <p className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".18em", textTransform: "uppercase", color: c.text3, marginTop: 6 }}>
                    {small}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ PILLARS ═══════════ */}
      <Band>
        <Eyebrow>What we stand on</Eyebrow>
        <SectionTitle>Three things we get right</SectionTitle>
        <div className="grid md:grid-cols-3" style={{ marginTop: T.space.xxl, border: `1px solid ${c.line}` }}>
          {PILLARS.map((p, i) => (
            <Reveal key={i} delay={i * .08}>
              <div className="lift h-full" style={{
                padding: T.space.xl,
                borderLeft: i > 0 ? `1px solid ${c.line}` : "none",
              }}>
                <div className="flex items-center gap-2.5" style={{ marginBottom: T.space.lg }}>
                  <span className="mono tabular" style={{ fontSize: T.size.tiny, color: c.text4 }}>{String(i + 1).padStart(2, "0")}</span>
                  <p.icon size={15} style={{ color: c.gain }} />
                </div>
                <h3 className="display" style={{ fontSize: T.size.xl, marginBottom: 10 }}>{p.title}</h3>
                <p style={{ fontSize: T.size.sm, color: c.text3, lineHeight: 1.75 }}>{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Band>

      {/* ═══════════ ABOUT + IMAGE ═══════════ */}
      <Band alt>
        <div className="grid md:grid-cols-2" style={{ gap: T.space.xxxl, alignItems: "center" }}>
          <Reveal>
            <Eyebrow>Part of something bigger</Eyebrow>
            <h2 className="display" style={{ fontSize: "clamp(28px,4vw,44px)", lineHeight: 1.08, marginBottom: T.space.lg }}>
              The world of investing, made easier
            </h2>
            <p style={{ fontSize: T.size.sm, color: c.text3, lineHeight: 1.8, marginBottom: T.space.xl }}>
              The global financial market draws millions of people with one shared aim: independence.
              MexicaTrading combines technical expertise with a dedicated team and a genuine interest in
              helping people improve their circumstances — on a platform built to be secure, simple and transparent.
            </p>
            <Button variant="outline" onClick={() => navigate("/register")}>
              Get started <ArrowRight size={13} />
            </Button>
          </Reveal>

          <Reveal delay={.12}>
            <div style={{ position: "relative", aspectRatio: "4/3", border: `1px solid ${c.line}`, overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${TEAM_IMG})`, backgroundSize: "cover", backgroundPosition: "center" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(14,16,19,.2),rgba(14,16,19,.75))" }} />
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: T.space.xl }}>
                <p className="display" style={{ fontSize: T.size.lg, color: "#fff" }}>MexicaTrading</p>
                <p className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,255,255,.6)", marginTop: 4 }}>
                  Secure · Transparent · Global
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </Band>

      {/* ═══════════ PLANS ═══════════ */}
      <Band>
        <Eyebrow>Investment plans</Eyebrow>
        <SectionTitle>Choose your term</SectionTitle>
        <p style={{ fontSize: T.size.sm, color: c.text3, marginTop: 10, maxWidth: 460, lineHeight: 1.7 }}>
          Every plan returns your principal along with the profit at maturity. Rates and durations are shown in full before you commit.
        </p>

        <div style={{ marginTop: T.space.xxl, border: `1px solid ${c.line}` }}>
          {PLANS.map((p, i) => (
            <Reveal key={i} delay={i * .05}>
              <button onClick={() => navigate("/register")}
                className="w-full text-left lift"
                style={{
                  display: "block",
                  padding: T.space.xl,
                  borderBottom: i < PLANS.length - 1 ? `1px solid ${c.line}` : "none",
                  borderLeft: p.popular ? `2px solid ${c.gain}` : "2px solid transparent",
                  background: p.popular ? "rgba(63,143,95,.04)" : "transparent",
                }}>
                <div className="flex items-center justify-between gap-4">
                  <div style={{ minWidth: 0 }}>
                    <div className="flex items-baseline gap-2.5" style={{ marginBottom: 4 }}>
                      <span className="mono tabular" style={{ fontSize: T.size.tiny, color: c.text4 }}>{String(i + 1).padStart(2, "0")}</span>
                      <h3 className="display" style={{ fontSize: T.size.xl }}>{p.name}</h3>
                      {p.popular && (
                        <span className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".16em", textTransform: "uppercase", color: c.gain }}>
                          Most chosen
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: T.size.xs, color: c.text3 }}>{p.note}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="mono tabular" style={{ fontSize: T.size.sm, color: c.text2 }}>{p.min} — {p.max}</p>
                    <p className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".16em", textTransform: "uppercase", color: c.gain, marginTop: 4 }}>
                      View terms →
                    </p>
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>

        <p style={{ fontSize: T.size.xs, color: c.text4, marginTop: T.space.lg, lineHeight: 1.7 }}>
          Returns vary by plan. All investing carries risk — please invest responsibly and only what you can afford.
        </p>
      </Band>

      {/* ═══════════ QUOTE BAND ═══════════ */}
      <section style={{ position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${BAND_IMG})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(14,16,19,.88)" }} />
        <div className="relative px-6 mx-auto text-center" style={{ maxWidth: 720, paddingTop: 110, paddingBottom: 110 }}>
          <Reveal>
            <p className="display" style={{ fontSize: "clamp(24px,4vw,40px)", lineHeight: 1.25, color: "#fff" }}>
              “The journey to financial independence begins with a single, deliberate step.”
            </p>
            <p className="mono" style={{ fontSize: T.size.tiny, letterSpacing: ".24em", textTransform: "uppercase", color: c.text3, marginTop: T.space.xl }}>
              The MexicaTrading team
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══════════ LIVE ACTIVITY ═══════════ */}
      <Band>
        <Eyebrow>Live activity</Eyebrow>
        <SectionTitle>Moving right now</SectionTitle>
        <div className="grid md:grid-cols-2" style={{ marginTop: T.space.xxl, gap: T.space.lg }}>
          <Ticker title="Latest deposits" rows={deposits} tone={c.gain} />
          <Ticker title="Latest withdrawals" rows={withdraws} tone={c.text2} />
        </div>
        <p className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".14em", textTransform: "uppercase", color: c.text4, marginTop: T.space.md }}>
          Names partially hidden for privacy
        </p>
      </Band>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <Band alt>
        <Eyebrow>Getting started</Eyebrow>
        <SectionTitle>Four steps</SectionTitle>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4" style={{ marginTop: T.space.xxl, border: `1px solid ${c.line}` }}>
          {STEPS.map((s, i) => (
            <Reveal key={i} delay={i * .06}>
              <div className="lift h-full" style={{
                padding: T.space.xl,
                borderLeft: i > 0 ? `1px solid ${c.line}` : "none",
              }}>
                <div className="flex items-center justify-between" style={{ marginBottom: T.space.lg }}>
                  <s.icon size={15} style={{ color: c.gain }} />
                  <span className="display tabular" style={{ fontSize: 28, color: "rgba(255,255,255,.09)", lineHeight: 1 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 style={{ fontSize: T.size.base, fontWeight: 600, marginBottom: 6 }}>{s.title}</h3>
                <p style={{ fontSize: T.size.xs, color: c.text3, lineHeight: 1.7 }}>{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Band>

      {/* ═══════════ FEATURES ═══════════ */}
      <Band>
        <Eyebrow>Why MexicaTrading</Eyebrow>
        <SectionTitle>Built differently</SectionTitle>
        <div className="grid sm:grid-cols-2" style={{ marginTop: T.space.xxl, border: `1px solid ${c.line}` }}>
          {FEATURES.map((f, i) => (
            <Reveal key={i} delay={i * .06}>
              <div className="lift h-full" style={{
                padding: T.space.xl,
                borderLeft: i % 2 === 1 ? `1px solid ${c.line}` : "none",
                borderTop: i > 1 ? `1px solid ${c.line}` : "none",
              }}>
                <f.icon size={15} style={{ color: c.gain, marginBottom: T.space.md }} />
                <h3 style={{ fontSize: T.size.base, fontWeight: 600, marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: T.size.xs, color: c.text3, lineHeight: 1.7 }}>{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Band>

      {/* ═══════════ COMMITMENT — the paper statement ═══════════ */}
      <Band alt>
        <Eyebrow>Trust and security</Eyebrow>
        <SectionTitle>Our commitment to you</SectionTitle>

        <Reveal delay={.08}>
          <div style={{ maxWidth: 620, margin: `${T.space.xxl}px auto 0`, background: c.paper, color: c.paperInk }}>
            <div style={{ height: 3, background: c.gain }} />
            <div style={{ padding: T.space.xxl }}>
              <div className="flex items-start justify-between" style={{ marginBottom: T.space.xl }}>
                <div>
                  <p className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(14,16,19,.5)", marginBottom: 8 }}>
                    Statement of commitment
                  </p>
                  <h3 className="display" style={{ fontSize: 30, lineHeight: 1.05 }}>MexicaTrading</h3>
                </div>
                <BadgeCheck size={26} style={{ color: c.gainDeep, flexShrink: 0, marginTop: 4 }} />
              </div>

              <p style={{ fontSize: T.size.sm, color: "rgba(14,16,19,.7)", lineHeight: 1.85, paddingBottom: T.space.xl, borderBottom: `1px solid ${c.lineInk}` }}>
                MexicaTrading operates as a secure, transparent investment platform. We commit to protecting
                every member's funds and data through strong encryption, PIN-protected withdrawals, saved-address
                safeguards and continuous monitoring — with support available at any hour.
              </p>

              <div className="grid grid-cols-2" style={{ marginTop: T.space.lg }}>
                {[["Registered office", "Mexico City, CDMX"], ["Support", "Available 24/7"]].map(([k, v], i) => (
                  <div key={i} style={{ paddingLeft: i === 1 ? T.space.lg : 0, borderLeft: i === 1 ? `1px solid ${c.lineInk}` : "none" }}>
                    <p className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(14,16,19,.45)", marginBottom: 5 }}>{k}</p>
                    <p style={{ fontSize: T.size.xs, color: "rgba(14,16,19,.8)" }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-4" style={{ marginTop: T.space.xxl, border: `1px solid ${c.line}` }}>
          {TRUST.map((t, i) => (
            <div key={i} style={{
              padding: T.space.lg,
              borderLeft: i % 2 === 1 ? `1px solid ${c.line}` : "none",
              borderTop: i > 1 ? `1px solid ${c.line}` : "none",
            }} className="lg:border-t-0">
              <t.icon size={14} style={{ color: c.gain, marginBottom: 10 }} />
              <h4 style={{ fontSize: T.size.sm, fontWeight: 600, marginBottom: 4 }}>{t.title}</h4>
              <p style={{ fontSize: T.size.xs, color: c.text3, lineHeight: 1.6 }}>{t.text}</p>
            </div>
          ))}
        </div>
      </Band>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <Band>
        <Eyebrow>Members</Eyebrow>
        <SectionTitle>In their words</SectionTitle>

        <div style={{ maxWidth: 640, marginTop: T.space.xxl }}>
          <AnimatePresence mode="wait">
            <motion.div key={testi}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: .4 }}
              style={{ borderLeft: `2px solid ${c.gain}`, paddingLeft: T.space.xl }}>
              <p className="display" style={{ fontSize: "clamp(19px,2.6vw,26px)", lineHeight: 1.5, color: c.text }}>
                “{TESTIMONIALS[testi].text}”
              </p>
              <p className="mono" style={{ fontSize: T.size.tiny, letterSpacing: ".16em", textTransform: "uppercase", color: c.text3, marginTop: T.space.lg }}>
                {TESTIMONIALS[testi].name} · {TESTIMONIALS[testi].country}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-2" style={{ marginTop: T.space.xl }}>
            <button onClick={() => setTesti(t => (t - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
              aria-label="Previous"
              className="w-9 h-9 flex items-center justify-center"
              style={{ border: `1px solid ${c.line}`, color: c.text3 }}>
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => setTesti(t => (t + 1) % TESTIMONIALS.length)}
              aria-label="Next"
              className="w-9 h-9 flex items-center justify-center"
              style={{ border: `1px solid ${c.line}`, color: c.text3 }}>
              <ChevronRight size={14} />
            </button>
            <span className="mono tabular" style={{ fontSize: T.size.tiny, color: c.text4, marginLeft: 8 }}>
              {String(testi + 1).padStart(2, "0")} / {String(TESTIMONIALS.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </Band>

      {/* ═══════════ CTA ═══════════ */}
      <Band alt>
        <div style={{ maxWidth: 560 }}>
          <Eyebrow>Ready when you are</Eyebrow>
          <h2 className="display" style={{ fontSize: "clamp(30px,5vw,48px)", lineHeight: 1.05, marginBottom: T.space.lg }}>
            Open an account today
          </h2>
          <p style={{ fontSize: T.size.sm, color: c.text3, lineHeight: 1.75, marginBottom: T.space.xl }}>
            No minimum deposit. Withdrawals processed within 24 hours. Support whenever you need it.
          </p>
          <div className="flex flex-wrap" style={{ gap: 10 }}>
            <Button onClick={() => navigate("/register")}>Create free account <ArrowRight size={13} /></Button>
            <Button variant="quiet" onClick={() => navigate("/login")}><LogIn size={13} /> Sign in</Button>
          </div>
        </div>
      </Band>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer style={{ borderTop: `1px solid ${c.line}`, padding: `${T.space.xxl}px 24px` }}>
        <div className="mx-auto" style={{ maxWidth: 1100 }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between" style={{ gap: T.space.xl }}>
            <div>
              <p className="display" style={{ fontSize: T.size.xl }}>MexicaTrading</p>
              <p style={{ fontSize: T.size.xs, color: c.text3, marginTop: 4 }}>Global investment platform</p>
            </div>
            <div className="flex flex-wrap mono" style={{ gap: "10px 22px", fontSize: T.size.tiny, letterSpacing: ".14em", textTransform: "uppercase" }}>
              {[["Plans", "/plans"], ["Reviews", "/reviews"], ["Terms", "/terms"], ["Privacy", "/privacy"], ["Sign in", "/login"]].map(([l, to], i) => (
                <button key={i} onClick={() => navigate(to)} style={{ color: c.text3 }}>{l}</button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between"
            style={{ marginTop: T.space.xxl, paddingTop: T.space.lg, borderTop: `1px solid ${c.lineSoft}`, gap: 10 }}>
            <p className="mono" style={{ fontSize: T.size.micro, color: c.text4 }}>
              © {new Date().getFullYear()} MexicaTrading
            </p>
            <p style={{ fontSize: T.size.micro, color: c.text4, maxWidth: 420 }}>
              Investing involves risk. Invest responsibly, and only what you can afford to lose.
            </p>
          </div>
        </div>
      </footer>

      <LiveActivity />
    </div>
  );
}

/* ─────────── Helpers ─────────── */
function Band({ children, alt }) {
  return (
    <section style={{ background: alt ? c.panel : c.ink, padding: "88px 24px" }}>
      <div className="mx-auto" style={{ maxWidth: 1100 }}>{children}</div>
    </section>
  );
}

function Eyebrow({ children }) {
  return (
    <p className="mono" style={{ fontSize: T.size.tiny, letterSpacing: ".24em", textTransform: "uppercase", color: c.gain, marginBottom: 10 }}>
      {children}
    </p>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="display" style={{ fontSize: "clamp(28px,4.5vw,44px)", lineHeight: 1.06 }}>{children}</h2>
  );
}

function Reveal({ children, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: .55, delay, ease: [.22, 1, .36, 1] }}
      style={{ height: "100%" }}>
      {children}
    </motion.div>
  );
}

function Ticker({ title, rows, tone }) {
  return (
    <div style={{ border: `1px solid ${c.line}` }}>
      <div className="flex items-center gap-2" style={{ padding: `${T.space.md}px ${T.space.lg}px`, borderBottom: `1px solid ${c.line}` }}>
        <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: c.gain }} />
        <p className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".2em", textTransform: "uppercase", color: c.text3 }}>{title}</p>
      </div>
      <AnimatePresence initial={false}>
        {rows.map((r, i) => (
          <motion.div key={r.id}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: .35 }}
            className="flex items-center justify-between"
            style={{ padding: `11px ${T.space.lg}px`, borderBottom: i < rows.length - 1 ? `1px solid ${c.lineSoft}` : "none" }}>
            <span className="flex items-center gap-2.5" style={{ minWidth: 0 }}>
              <span style={{ fontSize: 14, lineHeight: 1 }}>{r.flag}</span>
              <span className="mono" style={{ fontSize: T.size.xs, color: c.text3 }}>{r.name}</span>
            </span>
            <span className="flex items-center gap-2.5">
              <span className="mono tabular" style={{ fontSize: T.size.sm, color: tone }}>${r.amount.toLocaleString()}</span>
              <span className="mono" style={{ fontSize: T.size.micro, color: c.text4, minWidth: 34, textAlign: "right" }}>{r.coin}</span>
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
