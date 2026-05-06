import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Privacy() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    { title: t("privacy.s1Title"), content: t("privacy.s1Content") },
    { title: t("privacy.s2Title"), content: t("privacy.s2Content") },
    { title: t("privacy.s3Title"), content: t("privacy.s3Content") },
    { title: t("privacy.s4Title"), content: t("privacy.s4Content") },
    { title: t("privacy.s5Title"), content: t("privacy.s5Content") },
    { title: t("privacy.s6Title"), content: t("privacy.s6Content") },
    { title: t("privacy.s7Title"), content: t("privacy.s7Content") },
    { title: t("privacy.s8Title"), content: t("privacy.s8Content") },
    { title: t("privacy.s9Title"), content: t("privacy.s9Content") },
    { title: t("privacy.s10Title"), content: t("privacy.s10Content") },
    { title: t("privacy.s11Title"), content: t("privacy.s11Content") },
  ];

  return (
    <div className="min-h-screen bg-[#080c18] text-white pb-20">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[600px] h-[600px] bg-emerald-500/6 blur-[150px] rounded-full top-[-200px] left-[-200px]" />
        <div className="absolute w-[500px] h-[500px] bg-blue-500/4 blur-[140px] rounded-full bottom-[-200px] right-[-200px]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-24">

        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition mb-8">
          <ArrowLeft size={14} />
          {t("common.back")}
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Lock size={22} className="text-blue-400" />
            </div>
            <div>
              <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest">Legal</p>
              <h1 className="text-2xl font-bold text-white">{t("privacy.title")}</h1>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/8">
            <p className="text-white/50 text-sm leading-relaxed">
              {t("privacy.lastUpdated")}: <span className="text-white/70">January 1, 2026</span> &nbsp;·&nbsp;
              {t("privacy.effectiveDate")}: <span className="text-white/70">January 1, 2026</span>
            </p>
            <p className="text-white/40 text-sm mt-2 leading-relaxed">{t("privacy.subtitle")}</p>
          </div>
        </motion.div>

        <div className="space-y-6">
          {sections.map((section, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.4 }}
              className="p-6 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-white/12 transition-all">
              <h2 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 text-xs font-bold flex-shrink-0">
                  {i + 1}
                </span>
                {section.title}
              </h2>
              <p className="text-white/50 text-sm leading-relaxed whitespace-pre-line">{section.content}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-12 p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 text-center">
          <p className="text-white/60 text-sm mb-3">{t("privacy.commitment")}</p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <Link to="/terms" className="text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1">
              {t("privacy.termsLink")} <ExternalLink size={12} />
            </Link>
            <span className="text-white/20">·</span>
            <a href="mailto:support@mexicatrading.com" className="text-emerald-400 hover:text-emerald-300 transition">
              support@mexicatrading.com
            </a>
          </div>
          <p className="text-white/25 text-xs mt-4">
            📍 Calle Hidalgo 247, Col. Centro, Oaxaca de Juárez, Oaxaca 68000, Mexico
          </p>
        </motion.div>

      </div>
    </div>
  );
}
