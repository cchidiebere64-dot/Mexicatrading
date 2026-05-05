import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, ExternalLink } from "lucide-react";

export default function Terms() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `By accessing or using the MexicaTrading platform at mexicatrading.com, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, you may not use our platform. MexicaTrading reserves the right to modify these terms at any time, and continued use of the platform constitutes acceptance of any changes.`,
    },
    {
      title: "2. Eligibility",
      content: `You must be at least 18 years of age to use MexicaTrading. By registering an account, you confirm that you are legally eligible to participate in investment activities in your country of residence. MexicaTrading reserves the right to refuse service to anyone at its sole discretion.`,
    },
    {
      title: "3. Account Registration",
      content: `You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, current, and complete information during registration. You are responsible for all activities that occur under your account. Notify us immediately at support@mexicatrading.com if you suspect unauthorized access to your account.`,
    },
    {
      title: "4. Investment Plans",
      content: `MexicaTrading offers structured investment plans with defined durations and profit rates. By activating an investment plan, you acknowledge that your funds will be locked for the duration of the selected plan. Profit rates are as stated for each plan at the time of investment. MexicaTrading processes all plans automatically and credits profits to your account upon maturity.`,
    },
    {
      title: "5. Deposits and Withdrawals",
      content: `All deposits must be made through approved cryptocurrency channels (Bitcoin, USDT, or Ethereum) as listed on our platform. Withdrawal requests are processed by our team and are subject to review. MexicaTrading reserves the right to delay or refuse withdrawals if fraudulent activity is suspected. Users are responsible for providing accurate withdrawal details.`,
    },
    {
      title: "6. Risks",
      content: `All investments carry inherent risk. While MexicaTrading works to deliver consistent returns, past performance does not guarantee future results. You should only invest funds you can afford to lose. MexicaTrading is not liable for losses arising from market conditions, technical failures, or user error.`,
    },
    {
      title: "7. Prohibited Activities",
      content: `You agree not to use MexicaTrading for any unlawful purpose, including money laundering, fraud, or financing of illegal activities. You may not attempt to hack, reverse-engineer, or disrupt our platform. Multiple accounts per user are not permitted. Violation of these rules may result in immediate account suspension without notice.`,
    },
    {
      title: "8. Account Suspension",
      content: `MexicaTrading reserves the right to suspend or terminate any account at its sole discretion, including but not limited to cases of suspected fraud, violation of these terms, or unusual account activity. In cases of suspension, outstanding balances may be held pending investigation.`,
    },
    {
      title: "9. Privacy",
      content: `Your use of MexicaTrading is also governed by our Privacy Policy, which is incorporated into these Terms by reference. By using our platform you consent to the collection and use of your data as described in our Privacy Policy.`,
    },
    {
      title: "10. Limitation of Liability",
      content: `To the maximum extent permitted by law, MexicaTrading shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform. Our total liability to you shall not exceed the amount you have deposited in the 30 days preceding the claim.`,
    },
    {
      title: "11. Governing Law",
      content: `These Terms shall be governed by and construed in accordance with the laws of Mexico. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Oaxaca de Juárez, Oaxaca, Mexico.`,
    },
    {
      title: "12. Contact Us",
      content: `If you have any questions about these Terms and Conditions, please contact us at:\n\nMexicaTrading\nCalle Hidalgo 247, Colonia Centro\nOaxaca de Juárez, Oaxaca 68000, Mexico\nEmail: support@mexicatrading.com\nWebsite: www.mexicatrading.com`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#080c18] text-white pb-20">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[600px] h-[600px] bg-emerald-500/6 blur-[150px] rounded-full top-[-200px] left-[-200px]" />
        <div className="absolute w-[500px] h-[500px] bg-blue-500/4 blur-[140px] rounded-full bottom-[-200px] right-[-200px]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-24">

        {/* Back button */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition mb-8">
          <ArrowLeft size={14} />
          Back
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Shield size={22} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest">Legal</p>
              <h1 className="text-2xl font-bold text-white">Terms & Conditions</h1>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/8">
            <p className="text-white/50 text-sm leading-relaxed">
              Last updated: <span className="text-white/70">January 1, 2026</span> &nbsp;·&nbsp;
              Effective date: <span className="text-white/70">January 1, 2026</span>
            </p>
            <p className="text-white/40 text-sm mt-2 leading-relaxed">
              Please read these Terms and Conditions carefully before using MexicaTrading. These terms govern your use of our platform and services.
            </p>
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              className="p-6 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-white/12 transition-all">

              <h2 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 text-xs font-bold flex-shrink-0">
                  {i + 1}
                </span>
                {section.title.replace(/^\d+\.\s/, "")}
              </h2>
              <p className="text-white/50 text-sm leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-center">
          <p className="text-white/60 text-sm mb-3">
            By using MexicaTrading, you confirm that you have read, understood, and agreed to these Terms & Conditions.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <Link to="/privacy" className="text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1">
              Privacy Policy <ExternalLink size={12} />
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
