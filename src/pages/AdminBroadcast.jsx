import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio, Send, CheckCircle, AlertTriangle, X,
  Globe, Users, ChevronDown
} from "lucide-react";

const API_URL = "https://mexicatradingbackend.onrender.com/api";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "Arabic", flag: "🇸🇦" },
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "pt", label: "Portuguese", flag: "🇧🇷" },
  { code: "ru", label: "Russian", flag: "🇷🇺" },
  { code: "zh", label: "Chinese", flag: "🇨🇳" },
];

// Per-language message templates — admin fills English, others are shown as helpers
const PLACEHOLDER = {
  en: { subject: "e.g. New Investment Plan Available!", message: "e.g. Dear investor, we are excited to announce..." },
  ar: { subject: "مثال: خطة استثمارية جديدة متاحة!", message: "مثال: عزيزي المستثمر، يسعدنا الإعلان عن..." },
  de: { subject: "z.B. Neuer Investitionsplan verfügbar!", message: "z.B. Lieber Investor, wir freuen uns..." },
  es: { subject: "Ej: ¡Nuevo Plan de Inversión Disponible!", message: "Ej: Estimado inversor, nos complace anunciar..." },
  fr: { subject: "Ex: Nouveau Plan d'Investissement Disponible!", message: "Ex: Cher investisseur, nous sommes ravis d'annoncer..." },
  pt: { subject: "Ex: Novo Plano de Investimento Disponível!", message: "Ex: Prezado investidor, temos o prazer de anunciar..." },
  ru: { subject: "Пр: Новый инвестиционный план доступен!", message: "Пр: Уважаемый инвестор, мы рады сообщить..." },
  zh: { subject: "例：新投资计划上线！", message: "例：尊敬的投资者，我们很高兴宣布..." },
};

export default function AdminBroadcast() {
  const [mode, setMode] = useState("all"); // "all" | "language"
  const [targetLang, setTargetLang] = useState("en");
  const [langDropdown, setLangDropdown] = useState(false);

  // Per-language content
  const [messages, setMessages] = useState(
    LANGUAGES.reduce((acc, l) => ({ ...acc, [l.code]: { subject: "", message: "" } }), {})
  );

  // Single message for "all" mode
  const [single, setSingle] = useState({ subject: "", message: "" });

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState("en");

  const token = sessionStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}` };

  const canSend = mode === "all"
    ? single.subject.trim() && single.message.trim()
    : LANGUAGES.some(l => messages[l.code].subject.trim() && messages[l.code].message.trim());

  const handleSend = async () => {
    setSending(true);
    setConfirm(false);
    try {
      const payload = mode === "all"
        ? { subject: single.subject, message: single.message, mode: "all" }
        : { translations: messages, mode: "language" };

      const res = await axios.post(`${API_URL}/admin/broadcast`, payload, { headers });
      setResult({ type: "success", text: res.data.message });
      setSingle({ subject: "", message: "" });
      setMessages(LANGUAGES.reduce((acc, l) => ({ ...acc, [l.code]: { subject: "", message: "" } }), {}));
    } catch (err) {
      setResult({ type: "error", text: err.response?.data?.message || "Broadcast failed. Please try again." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Broadcast Message</h1>
        <p className="text-white/30 text-xs mt-0.5">Send a message to all users at once</p>
      </div>

      {/* Result banner */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`flex items-center justify-between p-4 rounded-2xl border text-sm font-medium ${
              result.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
            <div className="flex items-center gap-2">
              {result.type === "success" ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              {result.text}
            </div>
            <button onClick={() => setResult(null)}><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 rounded-2xl border border-yellow-500/25 bg-yellow-500/8">
        <AlertTriangle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
        <p className="text-yellow-400/80 text-xs leading-relaxed">
          This message will be delivered to <strong className="text-yellow-400">every registered user</strong> on the platform — both as an in-app message and an email notification. Use for important announcements only.
        </p>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setMode("all")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            mode === "all"
              ? "border-emerald-500/40 bg-emerald-500/10"
              : "border-white/8 bg-white/[0.02] hover:border-white/15"
          }`}>
          <div className="flex items-center gap-2 mb-1">
            <Users size={15} className={mode === "all" ? "text-emerald-400" : "text-white/30"} />
            <p className={`text-sm font-bold ${mode === "all" ? "text-emerald-400" : "text-white/50"}`}>
              Same Message
            </p>
          </div>
          <p className="text-white/30 text-xs leading-relaxed">
            One message sent to everyone in English
          </p>
        </button>

        <button onClick={() => setMode("language")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            mode === "language"
              ? "border-blue-500/40 bg-blue-500/10"
              : "border-white/8 bg-white/[0.02] hover:border-white/15"
          }`}>
          <div className="flex items-center gap-2 mb-1">
            <Globe size={15} className={mode === "language" ? "text-blue-400" : "text-white/30"} />
            <p className={`text-sm font-bold ${mode === "language" ? "text-blue-400" : "text-white/50"}`}>
              By Language
            </p>
          </div>
          <p className="text-white/30 text-xs leading-relaxed">
            Each user receives message in their own language
          </p>
        </button>
      </div>

      {/* ── SINGLE MESSAGE MODE ─────────────────────────────────────── */}
      {mode === "all" && (
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/8 bg-white/[0.02] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
              <Radio size={15} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">Compose Message</p>
              <p className="text-white/30 text-xs">Sent to all users regardless of language</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-white/40 text-xs uppercase tracking-widest font-semibold block mb-2">Subject</label>
              <input
                value={single.subject}
                onChange={e => setSingle({ ...single, subject: e.target.value })}
                placeholder="e.g. Important Platform Update"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 text-sm text-white placeholder:text-white/20 transition-all"
              />
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-widest font-semibold block mb-2">Message</label>
              <textarea
                value={single.message}
                onChange={e => setSingle({ ...single, message: e.target.value })}
                placeholder="Write your message to all users..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 text-sm text-white placeholder:text-white/20 transition-all resize-none leading-relaxed"
              />
              <p className="text-white/20 text-xs mt-1.5 text-right">{single.message.length} characters</p>
            </div>
          </div>
        </div>
      )}

      {/* ── LANGUAGE MODE ──────────────────────────────────────────── */}
      {mode === "language" && (
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/8 bg-white/[0.02] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
              <Globe size={15} className="text-blue-400" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">Multilingual Broadcast</p>
              <p className="text-white/30 text-xs">Fill in messages per language — users receive their own language version</p>
            </div>
          </div>

          {/* Language tabs */}
          <div className="flex gap-1 px-4 pt-4 pb-2 flex-wrap">
            {LANGUAGES.map(l => {
              const filled = messages[l.code].subject.trim() && messages[l.code].message.trim();
              return (
                <button key={l.code} onClick={() => setActiveTab(l.code)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    activeTab === l.code
                      ? "border-blue-500/40 bg-blue-500/15 text-blue-400"
                      : filled
                        ? "border-emerald-500/30 bg-emerald-500/8 text-emerald-400"
                        : "border-white/8 bg-white/[0.03] text-white/35 hover:text-white/60"
                  }`}>
                  {l.flag} {l.label}
                  {filled && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </button>
              );
            })}
          </div>

          {/* Active language form */}
          {LANGUAGES.filter(l => l.code === activeTab).map(l => (
            <div key={l.code} className="p-5 space-y-4">
              <div>
                <label className="text-white/40 text-xs uppercase tracking-widest font-semibold block mb-2">
                  Subject ({l.flag} {l.label})
                </label>
                <input
                  value={messages[l.code].subject}
                  onChange={e => setMessages(prev => ({ ...prev, [l.code]: { ...prev[l.code], subject: e.target.value } }))}
                  placeholder={PLACEHOLDER[l.code]?.subject || "Subject..."}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-blue-500/60 text-sm text-white placeholder:text-white/20 transition-all"
                />
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-widest font-semibold block mb-2">
                  Message ({l.flag} {l.label})
                </label>
                <textarea
                  value={messages[l.code].message}
                  onChange={e => setMessages(prev => ({ ...prev, [l.code]: { ...prev[l.code], message: e.target.value } }))}
                  placeholder={PLACEHOLDER[l.code]?.message || "Message..."}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-blue-500/60 text-sm text-white placeholder:text-white/20 transition-all resize-none leading-relaxed"
                />
                <p className="text-white/20 text-xs mt-1.5 text-right">{messages[l.code].message.length} characters</p>
              </div>
            </div>
          ))}

          {/* Progress */}
          <div className="px-5 pb-5">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/8">
              <p className="text-white/30 text-xs mb-2">Languages filled:</p>
              <div className="flex gap-1.5 flex-wrap">
                {LANGUAGES.map(l => {
                  const filled = messages[l.code].subject.trim() && messages[l.code].message.trim();
                  return (
                    <span key={l.code} className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      filled ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-white/20"
                    }`}>
                      {l.flag} {l.code.toUpperCase()}
                    </span>
                  );
                })}
              </div>
              <p className="text-white/20 text-xs mt-2">
                Users whose language has no message will receive the English version as fallback.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Send button */}
      <button
        onClick={() => setConfirm(true)}
        disabled={!canSend || sending}
        className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold text-sm text-white flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20">
        {sending
          ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending Broadcast...</>
          : <><Radio size={16} /> Send Broadcast to All Users</>
        }
      </button>

      {/* ── CONFIRM MODAL ──────────────────────────────────────────── */}
      <AnimatePresence>
        {confirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="absolute inset-0" onClick={() => setConfirm(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm bg-[#0d1525] border border-white/10 rounded-3xl p-6 z-10 shadow-2xl text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Radio size={26} className="text-emerald-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Send Broadcast?</h3>
              <p className="text-white/40 text-sm mb-1">
                {mode === "all"
                  ? `"${single.subject}" will be sent to all users.`
                  : `Multilingual broadcast will be sent — each user receives their language version.`}
              </p>
              <p className="text-yellow-400/70 text-xs mb-6">This action cannot be undone.</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setConfirm(false)}
                  className="py-3 rounded-xl border border-white/10 bg-white/[0.03] text-white/50 hover:text-white text-sm font-semibold transition-all">
                  Cancel
                </button>
                <button onClick={handleSend}
                  className="py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2">
                  <Send size={14} /> Send Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
