import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Send, AlertTriangle, Check } from "lucide-react";
import { T, ThemeStyles, Button, Spinner, Banner, inputStyle, LedgerRow } from "./system.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com/api";
const c = T.color;

const LANGUAGES = [
  { code: "en", label: "English",    flag: "🇬🇧" },
  { code: "ar", label: "Arabic",     flag: "🇸🇦" },
  { code: "de", label: "German",     flag: "🇩🇪" },
  { code: "es", label: "Spanish",    flag: "🇪🇸" },
  { code: "fr", label: "French",     flag: "🇫🇷" },
  { code: "pt", label: "Portuguese", flag: "🇧🇷" },
  { code: "ru", label: "Russian",    flag: "🇷🇺" },
  { code: "zh", label: "Chinese",    flag: "🇨🇳" },
];

const PLACEHOLDER = {
  en: { subject: "e.g. New investment plan available", message: "e.g. Dear investor, we're pleased to announce..." },
  ar: { subject: "مثال: خطة استثمارية جديدة متاحة!", message: "مثال: عزيزي المستثمر، يسعدنا الإعلان عن..." },
  de: { subject: "z.B. Neuer Investitionsplan verfügbar", message: "z.B. Lieber Investor, wir freuen uns..." },
  es: { subject: "Ej: Nuevo plan de inversión disponible", message: "Ej: Estimado inversor, nos complace anunciar..." },
  fr: { subject: "Ex: Nouveau plan d'investissement disponible", message: "Ex: Cher investisseur, nous sommes ravis d'annoncer..." },
  pt: { subject: "Ex: Novo plano de investimento disponível", message: "Ex: Prezado investidor, temos o prazer de anunciar..." },
  ru: { subject: "Пр: Новый инвестиционный план доступен", message: "Пр: Уважаемый инвестор, мы рады сообщить..." },
  zh: { subject: "例：新投资计划上线", message: "例：尊敬的投资者，我们很高兴宣布..." },
};

export default function AdminBroadcast() {
  const [mode, setMode] = useState("all"); // "all" | "language"

  const [messages, setMessages] = useState(
    LANGUAGES.reduce((acc, l) => ({ ...acc, [l.code]: { subject: "", message: "" } }), {})
  );
  const [single, setSingle] = useState({ subject: "", message: "" });

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState("en");

  const token = sessionStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}` };

  const filledLangs = LANGUAGES.filter(
    l => messages[l.code].subject.trim() && messages[l.code].message.trim()
  );

  const canSend = mode === "all"
    ? single.subject.trim() && single.message.trim()
    : filledLangs.length > 0;

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

  const modeTab = (active) => ({
    flex: 1,
    padding: "13px 0",
    fontFamily: "'IBM Plex Mono',monospace",
    fontSize: T.size.tiny,
    letterSpacing: ".16em",
    textTransform: "uppercase",
    background: active ? "rgba(63,143,95,.1)" : "transparent",
    color: active ? c.gain : c.text3,
    borderBottom: `2px solid ${active ? c.gain : "transparent"}`,
    transition: "color .2s, background .2s",
  });

  const current = mode === "all" ? single : messages[activeTab];
  const setCurrent = (patch) => {
    if (mode === "all") setSingle(s => ({ ...s, ...patch }));
    else setMessages(m => ({ ...m, [activeTab]: { ...m[activeTab], ...patch } }));
  };

  const ph = mode === "all" ? PLACEHOLDER.en : PLACEHOLDER[activeTab];

  return (
    <div className="ui" style={{ color: c.text, maxWidth: 640 }}>
      <ThemeStyles />

      {/* ── Header ── */}
      <div style={{ marginBottom: T.space.xl }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Announcements</p>
        <h1 className="display" style={{ fontSize: T.size.xl, lineHeight: 1.1 }}>Broadcast</h1>
        <p style={{ fontSize: T.size.sm, color: c.text3, marginTop: 8, lineHeight: 1.7, maxWidth: 460 }}>
          Sends an in-app message and an email to every member. There's no recall once it goes out.
        </p>
      </div>

      {result && (
        <div style={{ marginBottom: T.space.lg }}>
          <Banner tone={result.type === "success" ? "gain" : "loss"} title={result.text} />
        </div>
      )}

      {/* ══ CONFIRM ══ */}
      {confirm ? (
        <div style={{ border: `1px solid ${c.line}`, borderLeft: `2px solid ${c.brass}`, padding: T.space.xl }}>
          <p className="mono" style={{
            fontSize: T.size.micro, letterSpacing: ".24em", textTransform: "uppercase",
            color: c.brass, marginBottom: 8,
          }}>
            Confirm broadcast
          </p>
          <h3 className="display" style={{ fontSize: T.size.xl, marginBottom: T.space.lg }}>
            Send to every member?
          </h3>

          <div style={{ borderTop: `1px solid ${c.line}`, marginBottom: T.space.lg }}>
            <LedgerRow label="Audience" value={mode === "all" ? "All members" : "By language"} />
            {mode === "all" ? (
              <LedgerRow label="Subject" value={single.subject} last />
            ) : (
              <LedgerRow label="Languages ready"
                value={filledLangs.map(l => l.code.toUpperCase()).join(", ")} last />
            )}
          </div>

          {mode === "language" && filledLangs.length < LANGUAGES.length && (
            <div style={{ marginBottom: T.space.lg }}>
              <Banner tone="brass"
                title={`${LANGUAGES.length - filledLangs.length} language(s) left blank`}
                text="Members using those languages fall back to English if it's filled, otherwise they're skipped." />
            </div>
          )}

          <div className="flex items-start gap-2.5"
            style={{ background: "rgba(192,138,62,.06)", borderLeft: `2px solid ${c.brass}`, padding: T.space.md, marginBottom: T.space.xl }}>
            <AlertTriangle size={13} style={{ color: c.brass, flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: T.size.xs, color: c.text3, lineHeight: 1.65 }}>
              Read it once more before sending. Everyone receives it, and it can't be unsent.
            </p>
          </div>

          <div className="grid grid-cols-2" style={{ gap: 8 }}>
            <Button variant="quiet" onClick={() => setConfirm(false)} disabled={sending}>
              Back to editing
            </Button>
            <Button onClick={handleSend} disabled={sending}
              icon={sending ? <Spinner size={12} tone="#fff" /> : <Send size={13} />}>
              {sending ? "Sending" : "Send now"}
            </Button>
          </div>
        </div>

      /* ══ COMPOSER ══ */
      ) : (
        <div style={{ border: `1px solid ${c.line}` }}>

          {/* audience */}
          <div className="flex" style={{ borderBottom: `1px solid ${c.line}` }}>
            <button type="button" onClick={() => setMode("all")} style={modeTab(mode === "all")}>
              Everyone
            </button>
            <button type="button" onClick={() => setMode("language")} style={modeTab(mode === "language")}>
              By language
            </button>
          </div>

          {/* language tabs */}
          {mode === "language" && (
            <div className="flex overflow-x-auto"
              style={{ borderBottom: `1px solid ${c.line}`, scrollbarWidth: "none" }}>
              {LANGUAGES.map((l) => {
                const on = activeTab === l.code;
                const filled = messages[l.code].subject.trim() && messages[l.code].message.trim();
                return (
                  <button key={l.code} onClick={() => setActiveTab(l.code)}
                    className="mono shrink-0 flex items-center gap-1.5"
                    style={{
                      padding: "10px 13px", fontSize: T.size.tiny,
                      letterSpacing: ".1em", textTransform: "uppercase",
                      color: on ? c.gain : c.text3,
                      borderBottom: `2px solid ${on ? c.gain : "transparent"}`,
                      marginBottom: -1, transition: "color .2s",
                    }}>
                    <span style={{ fontSize: 13, lineHeight: 1 }}>{l.flag}</span>
                    {l.code}
                    {filled && <Check size={10} style={{ color: c.gain }} />}
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ padding: T.space.xl }}>

            {mode === "language" && (
              <p style={{ fontSize: T.size.xs, color: c.text4, lineHeight: 1.7, marginBottom: T.space.lg }}>
                Each member receives the version matching their chosen language. Fill English at minimum —
                it's the fallback.
              </p>
            )}

            <div style={{ marginBottom: T.space.lg }}>
              <p className="eyebrow" style={{ marginBottom: 6 }}>Subject</p>
              <input type="text" value={current.subject}
                onChange={(e) => setCurrent({ subject: e.target.value })}
                placeholder={ph.subject}
                style={inputStyle} />
            </div>

            <div style={{ marginBottom: T.space.xl }}>
              <p className="eyebrow" style={{ marginBottom: 6 }}>Message</p>
              <textarea value={current.message}
                onChange={(e) => setCurrent({ message: e.target.value })}
                rows={7}
                placeholder={ph.message}
                style={{ ...inputStyle, resize: "none", lineHeight: 1.7 }} />
              <p className="mono" style={{ fontSize: T.size.tiny, color: c.text4, marginTop: 6 }}>
                {current.message.length} characters
              </p>
            </div>

            <Button full onClick={() => setConfirm(true)} disabled={!canSend}
              style={{ opacity: canSend ? 1 : .4 }}
              icon={<Radio size={13} />}>
              Review broadcast
            </Button>

            {!canSend && (
              <p style={{ fontSize: T.size.xs, color: c.text4, textAlign: "center", marginTop: 10 }}>
                {mode === "all"
                  ? "Fill in a subject and message to continue."
                  : "Fill in at least one language to continue."}
              </p>
            )}
          </div>
        </div>
      )}

      <p style={{ fontSize: T.size.xs, color: c.text4, lineHeight: 1.7, marginTop: T.space.lg }}>
        For a message to one person, use the Users page instead — open the member and send an in-app message.
      </p>
    </div>
  );
}
