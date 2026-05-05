import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, ExternalLink } from "lucide-react";

export default function Privacy() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      title: "1. Information We Collect",
      content: `When you register on MexicaTrading, we collect the following information:\n\n• Full name and email address\n• Password (stored in encrypted form)\n• IP address and device information\n• Transaction history (deposits, withdrawals, investments)\n• Communication preferences and language settings\n• Country of residence (auto-detected for localization purposes)`,
    },
    {
      title: "2. How We Use Your Information",
      content: `We use your information to:\n\n• Create and manage your account\n• Process deposits, withdrawals, and investment plans\n• Send transaction confirmation emails and notifications\n• Detect and prevent fraudulent activity\n• Improve our platform and user experience\n• Comply with legal obligations\n• Communicate important updates about our services`,
    },
    {
      title: "3. Data Security",
      content: `MexicaTrading takes data security seriously. We implement industry-standard security measures including:\n\n• SSL/TLS encryption for all data transmission\n• Bcrypt password hashing — your password is never stored in plain text\n• JWT token-based authentication with session management\n• Automatic session locking after periods of inactivity\n• Regular security audits of our platform infrastructure`,
    },
    {
      title: "4. Cookies and Tracking",
      content: `MexicaTrading uses session cookies to maintain your login state and provide a seamless experience. We also use third-party services including:\n\n• Tawk.to for live chat support\n• TradingView for market data widgets\n• IP geolocation services for fraud detection and localization\n\nBy using our platform, you consent to the use of these cookies. You may disable cookies in your browser settings, but this may affect platform functionality.`,
    },
    {
      title: "5. Data Sharing",
      content: `MexicaTrading does not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:\n\n• With service providers who assist in operating our platform (under strict confidentiality agreements)\n• When required by law or legal process\n• To protect the rights, property, or safety of MexicaTrading, our users, or others\n• In connection with a merger, acquisition, or sale of company assets`,
    },
    {
      title: "6. Email Communications",
      content: `By registering on MexicaTrading, you agree to receive transactional emails including:\n\n• Account registration and verification emails\n• Deposit and withdrawal confirmations\n• Investment plan activation and completion notices\n• Password reset emails\n• Important platform announcements\n\nWe use Brevo (formerly Sendinblue) to send emails. All emails are sent from support@mexicatrading.com.`,
    },
    {
      title: "7. Data Retention",
      content: `We retain your personal data for as long as your account is active or as needed to provide our services. If you request account deletion, we will remove your personal information within 30 days, except where retention is required by law. Transaction records may be retained for up to 7 years for legal and financial compliance purposes.`,
    },
    {
      title: "8. Your Rights",
      content: `You have the right to:\n\n• Access the personal data we hold about you\n• Request correction of inaccurate data\n• Request deletion of your account and associated data\n• Object to processing of your personal data\n• Withdraw consent at any time\n\nTo exercise any of these rights, contact us at support@mexicatrading.com.`,
    },
    {
      title: "9. Children's Privacy",
      content: `MexicaTrading is not intended for users under the age of 18. We do not knowingly collect personal information from minors. If we become aware that a minor has provided us with personal data, we will take immediate steps to delete that information and close the account.`,
    },
    {
      title: "10. Changes to This Policy",
      content: `MexicaTrading may update this Privacy Policy from time to time. We will notify registered users of significant changes via email. Your continued use of the platform after changes are posted constitutes your acceptance of the updated policy. We encourage you to review this policy periodically.`,
    },
    {
      title: "11. Contact Us",
      content: `If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:\n\nMexicaTrading\nCalle Hidalgo 247, Colonia Centro\nOaxaca de Juárez, Oaxaca 68000, Mexico\nEmail: support@mexicatrading.com\nWebsite: www.mexicatrading.com`,
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
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Lock size={22} className="text-blue-400" />
            </div>
            <div>
              <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest">Legal</p>
              <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/8">
            <p className="text-white/50 text-sm leading-relaxed">
              Last updated: <span className="text-white/70">January 1, 2026</span> &nbsp;·&nbsp;
              Effective date: <span className="text-white/70">January 1, 2026</span>
            </p>
            <p className="text-white/40 text-sm mt-2 leading-relaxed">
              This Privacy Policy explains how MexicaTrading collects, uses, and protects your personal information when you use our platform.
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
                <span className="w-6 h-6 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 text-xs font-bold flex-shrink-0">
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
          className="mt-12 p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 text-center">
          <p className="text-white/60 text-sm mb-3">
            Your privacy is important to us. We are committed to protecting your personal information at all times.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <Link to="/terms" className="text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1">
              Terms & Conditions <ExternalLink size={12} />
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
