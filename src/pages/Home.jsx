import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, TrendingUp, Globe, ArrowRight, ChevronDown, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();

  const stats = [
    { value: "$2.4B+", label: t("home.stats.assets") },
    { value: "98.6%", label: t("home.stats.satisfaction") },
    { value: "150+", label: t("home.stats.countries") },
    { value: "24/7", label: t("home.stats.support") },
  ];

  const features = [
    { icon: <Shield size={28} />, title: t("home.features.secureTitle"), desc: t("home.features.secureDesc") },
    { icon: <TrendingUp size={28} />, title: t("home.features.profitTitle"), desc: t("home.features.profitDesc") },
    { icon: <Globe size={28} />, title: t("home.features.globalTitle"), desc: t("home.features.globalDesc") },
  ];

  const steps = [
    { step: "01", title: t("home.steps.step1Title"), desc: t("home.steps.step1Desc") },
    { step: "02", title: t("home.steps.step2Title"), desc: t("home.steps.step2Desc") },
    { step: "03", title: t("home.steps.step3Title"), desc: t("home.steps.step3Desc") },
  ];

  const testimonials = [
    { name: t("home.t1Name"), country: t("home.t1Country"), plan: t("home.t1Plan"), profit: t("home.t1Profit"), avatar: "JO", color: "from-emerald-500 to-teal-400", text: t("home.t1Text") },
    { name: t("home.t2Name"), country: t("home.t2Country"), plan: t("home.t2Plan"), profit: t("home.t2Profit"), avatar: "FA", color: "from-blue-500 to-indigo-400", text: t("home.t2Text") },
    { name: t("home.t3Name"), country: t("home.t3Country"), plan: t("home.t3Plan"), profit: t("home.t3Profit"), avatar: "CM", color: "from-purple-500 to-violet-400", text: t("home.t3Text") },
    { name: t("home.t4Name"), country: t("home.t4Country"), plan: t("home.t4Plan"), profit: t("home.t4Profit"), avatar: "AD", color: "from-amber-500 to-orange-400", text: t("home.t4Text") },
    { name: t("home.t5Name"), country: t("home.t5Country"), plan: t("home.t5Plan"), profit: t("home.t5Profit"), avatar: "SN", color: "from-rose-500 to-pink-400", text: t("home.t5Text") },
    { name: t("home.t6Name"), country: t("home.t6Country"), plan: t("home.t6Plan"), profit: t("home.t6Profit"), avatar: "DM", color: "from-cyan-500 to-teal-400", text: t("home.t6Text") },
  ];

  return (
    <div className="relative min-h-screen bg-[#080c18] text-white overflow-x-hidden font-sans">

      {/* BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[700px] h-[700px] bg-emerald-500/10 blur-[150px] rounded-full top-[-200px] left-[-200px]" />
        <div className="absolute w-[500px] h-[500px] bg-teal-400/8 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />
        <div className="absolute w-[300px] h-[300px] bg-emerald-300/5 blur-[100px] rounded-full top-[40%] left-[50%]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      </div>

      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-[#080c18]/60 border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="text-lg font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
          MexicaTrading
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-white/60 hover:text-white transition px-4 py-2">
            {t("nav.signIn")}
          </Link>
          <Link to="/register" className="text-sm px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 transition font-medium shadow-lg shadow-emerald-500/20">
            {t("nav.getStarted")}
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {t("home.badge")}
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight max-w-4xl">
          {t("home.hero1")}{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
            {t("home.hero2")}
          </span>
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-white/50 text-lg md:text-xl max-w-xl mb-12 leading-relaxed">
          {t("home.heroSub")}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="flex gap-4 flex-wrap justify-center">
          <Link to="/register" className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/25 font-semibold text-sm">
            {t("home.startInvesting")} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/login" className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-md transition border border-white/10 text-sm font-medium">
            {t("home.signIn")}
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/20 text-xs">
          <span>{t("home.scroll")}</span>
          <ChevronDown size={16} className="animate-bounce" />
        </motion.div>
      </section>

      {/* STATS */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.02] py-10 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
              <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">{s.value}</p>
              <p className="text-white/40 text-sm mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-3">{t("home.whyUs")}</p>
            <h2 className="text-4xl font-bold">{t("home.builtFor")}</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} viewport={{ once: true }} whileHover={{ y: -4 }}
                className="group p-8 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-emerald-500/30 hover:bg-white/[0.06] transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:bg-emerald-500/20 transition-all">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 py-28 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-3">{t("home.simpleProcess")}</p>
            <h2 className="text-4xl font-bold">{t("home.steps.title")}</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }} viewport={{ once: true }}
                className="text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl font-bold">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed max-w-[200px]">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative z-10 py-28 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-3">{t("home.investorReviews")}</p>
            <h2 className="text-4xl font-bold mb-4">{t("home.testimonialsTitle")}</h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">{t("home.testimonialsSubtitle")}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} whileHover={{ y: -4 }}
                className="group p-6 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-emerald-500/20 hover:bg-white/[0.05] transition-all duration-300 flex flex-col gap-4">

                {/* Stars */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={13} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-white/60 text-sm leading-relaxed flex-1">"{item.text}"</p>

                {/* Profit badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 w-fit">
                  <TrendingUp size={12} className="text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-bold">{item.profit} {t("home.profit")}</span>
                  <span className="text-white/30 text-xs">· {item.plan}</span>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 pt-2 border-t border-white/8">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {item.avatar}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{item.name}</p>
                    <p className="text-white/30 text-xs">{item.country}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom trust line */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-12 text-center">
            <p className="text-white/25 text-sm">{t("home.joinInvestors")}</p>
            <Link to="/register"
              className="inline-flex items-center gap-2 mt-5 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/25 font-semibold text-sm">
              {t("home.startInvestingToday")} <ArrowRight size={16} />
            </Link>
          </motion.div>

        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-28 px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-transparent p-16">
          <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-4">{t("home.joinThePlatform")}</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">{t("home.cta.title")}</h2>
          <p className="text-white/40 mb-10 text-lg">{t("home.cta.sub")}</p>
          <Link to="/register" className="group inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/30 font-semibold">
            {t("home.cta.button")} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-6 text-center text-white/20 text-sm">
        <div className="flex items-center justify-center gap-6 mb-3">
          <Link to="/terms" className="text-white/30 hover:text-white text-xs transition">{t("home.termsLink")}</Link>
          <Link to="/privacy" className="text-white/30 hover:text-white text-xs transition">{t("home.privacyLink")}</Link>
        </div>
        © {new Date().getFullYear()} MexicaTrading. {t("home.allRightsReserved")}
      </footer>

    </div>
  );
}
