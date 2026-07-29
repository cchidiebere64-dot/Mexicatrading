import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Send, MessageSquare, AlertTriangle,
  HelpCircle, ChevronDown, ShieldCheck, Check, CheckCheck, Clock,
} from "lucide-react";
import { T, ThemeStyles, Spinner } from "./system.jsx";
import { Composer, MessageBody } from "./ChatComposer.jsx";
import MessageActions from "./MessageActions.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com";
const POLL_MS = 4000;
const c = T.color;

const SURFACE = {
  page:   "#15181E",
  thread: "#1A1E25",
  mine:   "rgba(63,143,95,.15)",
  theirs: "#242A33",
};

/* Aztec step-fret (greca) — the motif woven into Mexican textiles.
   Kept very faint so it reads as texture, never as decoration. */
const GRECA = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
  <g fill="none" stroke="#3F8F5F" stroke-width="1.4" stroke-linecap="square">
    <path d="M6 30h12V18h12v12h12V18h12"/>
    <path d="M6 42h24V30"/>
    <path d="M42 42h12V30"/>
    <path d="M18 6v6h24V6"/>
  </g>
</svg>`.replace(/\s+/g, " ").trim());

const QUICK_ASKS = [
  { key: "deposit",          label: "How do I make a deposit?" },
  { key: "deposit_missing",  label: "My deposit hasn't shown up yet" },
  { key: "withdraw",         label: "How do I withdraw my funds?" },
  { key: "withdraw_missing", label: "Where is my withdrawal?" },
  { key: "plans",            label: "How do the investment plans work?" },
  { key: "verification",     label: "I need help with verification" },
  { key: "other",            label: "Something else" },
];

function AskList({ onPick, compact }) {
  return (
    <div style={{ border: `1px solid ${c.line}`, background: SURFACE.page }}>
      {QUICK_ASKS.map((q, i) => (
        <button key={q.key} onClick={() => onPick(q)}
          className="w-full text-left hover-fill flex items-center justify-between gap-3"
          style={{
            padding: compact ? "11px 15px" : "13px 16px",
            borderBottom: i < QUICK_ASKS.length - 1 ? `1px solid ${c.lineSoft}` : "none",
            transition: "background .2s",
          }}>
          <span style={{ fontSize: 14, color: c.text2, lineHeight: 1.45 }}>{q.label}</span>
          <Send size={12} style={{ color: c.text4, flexShrink: 0 }} />
        </button>
      ))}
    </div>
  );
}

function Ticks({ m }) {
  if (m.failed)  return <AlertTriangle size={10} style={{ color: c.loss }} />;
  if (m.pending) return <Clock size={10} style={{ color: c.text4 }} />;
  if (m.isRead)  return <CheckCheck size={11} style={{ color: c.gain }} />;
  return <Check size={11} style={{ color: c.text4 }} />;
}

export default function Chat() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };
  const me = JSON.parse(sessionStorage.getItem("user") || "{}");

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [supportTyping, setSupportTyping] = useState(false);
  const [showAsks, setShowAsks] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [flashId, setFlashId] = useState(null);

  const typingSentAt = useRef(0);
  const bottomRef = useRef(null);
  const listRef = useRef(null);
  const stick = useRef(true);
  const msgRefs = useRef({});

  const jumpTo = (id) => {
    const el = msgRefs.current[id];
    if (!el) return;
    stick.current = false;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setFlashId(id);
    setTimeout(() => setFlashId(null), 1400);
  };

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 130;
  };

  const load = useCallback(async (silent = false) => {
    if (!token) { navigate("/login"); return; }
    try {
      const res = await axios.get(`${API_URL}/api/chat`, auth);
      const next = res.data.messages || [];
      setMessages((prev) => {
        const local = prev.filter((m) => m.pending || m.failed);
        if (!local.length &&
            prev.length === next.length &&
            prev[prev.length - 1]?._id === next[next.length - 1]?._id) return prev;
        return [...next, ...local];
      });
      setSupportTyping(Boolean(res.data.supportTyping));
      setError("");
    } catch (err) {
      if (!silent) setError("Couldn't load your messages.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(false); }, [load]);

  useEffect(() => {
    const tick = () => { if (document.visibilityState === "visible") load(true); };
    const id = setInterval(tick, POLL_MS);
    window.addEventListener("focus", tick);
    return () => { clearInterval(id); window.removeEventListener("focus", tick); };
  }, [load]);

  useEffect(() => {
    if (stick.current) {
      bottomRef.current?.scrollIntoView({ behavior: loading ? "auto" : "smooth", block: "end" });
    }
  }, [messages, loading, supportTyping]);

  const send = async ({ body, file, kind, duration, ask, replyTo: quoted }) => {
    if (sending) return;
    if (!body && !file) return;

    setSending(true);
    setError("");
    stick.current = true;

    const temp = {
      _id: `temp-${Date.now()}`,
      from: "user",
      body: body || "",
      kind: kind || "text",
      mediaUrl: kind === "image" ? file : "",
      mediaDuration: duration || 0,
      replyToBody: quoted?.body || "",
      replyToFrom: quoted?.from || "",
      replyToKind: quoted?.kind || "",
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setMessages((m) => [...m, temp]);
    setReplyTo(null);

    try {
      const res = await axios.post(
        `${API_URL}/api/chat`,
        { body, file, kind, duration, ask, replyTo: quoted },
        auth
      );
      setMessages((m) => {
        const swapped = m.map((x) => (x._id === temp._id ? res.data.message : x));
        return res.data.autoMessage ? [...swapped, res.data.autoMessage] : swapped;
      });
    } catch (err) {
      setMessages((m) => m.map((x) => (x._id === temp._id ? { ...x, failed: true, pending: false } : x)));
      setError(
        err.response?.status === 413
          ? "That file is too large. Try a shorter recording or smaller image."
          : err.response?.data?.message || "Message didn't send. Check your connection."
      );
    } finally {
      setSending(false);
    }
  };

  const react = async (msg, emoji) => {
    setMessages((list) => list.map((x) =>
      x._id === msg._id
        ? { ...x, reactions: [...(x.reactions || []).filter(r => r.by !== "user"), { by: "user", emoji }] }
        : x
    ));
    try {
      await axios.post(`${API_URL}/api/chat/${msg._id}/react`, { emoji }, auth);
    } catch {
      load(true);
    }
  };

  const fmtTime = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const fmtDay = (d) => {
    const date = new Date(d);
    const today = new Date();
    const yest = new Date(Date.now() - 86400000);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yest.toDateString()) return "Yesterday";
    return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  };

  const groups = messages.reduce((acc, m) => {
    const key = fmtDay(m.createdAt);
    (acc[key] = acc[key] || []).push(m);
    return acc;
  }, {});

  const initial = (me?.name || "?").charAt(0).toUpperCase();

  return (
    <div className="ui" style={{ background: SURFACE.page, color: c.text, height: "100dvh", overflow: "hidden" }}>
      <ThemeStyles />
      <style>{`
        .chat-dots i {
          width: 4px; height: 4px; border-radius: 50%;
          background: ${c.gain}; display: inline-block;
          animation: chatDot 1.2s ease-in-out infinite;
        }
        .chat-dots i:nth-child(2) { animation-delay: .18s; }
        .chat-dots i:nth-child(3) { animation-delay: .36s; }
        @keyframes chatDot { 0%,60%,100% { opacity:.25; } 30% { opacity:1; } }
        @media (prefers-reduced-motion: reduce) { .chat-dots i { animation: none; opacity:.6; } }
      `}</style>

      <div className="mx-auto" style={{
        maxWidth: 780, height: "100%",
        display: "flex", flexDirection: "column",
      }}>

        {/* ══ HEADER ══ */}
        <header className="flex items-center gap-3 shrink-0"
          style={{ padding: "11px 16px", borderBottom: `1px solid ${c.line}`, background: SURFACE.page }}>
          <button onClick={() => navigate("/dashboard")} aria-label="Back"
            className="flex items-center justify-center shrink-0"
            style={{ width: 34, height: 34, border: `1px solid ${c.line}`, background: c.fill, color: c.text2 }}>
            <ArrowLeft size={15} />
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="display" style={{ fontSize: 17, lineHeight: 1.15 }}>MexicaTrading Support</h1>
            <p className="mono flex items-center gap-1.5" style={{
              fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase",
              color: c.gain, marginTop: 2,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.gain, display: "inline-block" }} />
              {supportTyping ? "Typing…" : "Online"}
            </p>
          </div>

          <ShieldCheck size={14} style={{ color: c.text4, flexShrink: 0 }} />
        </header>

        {/* ══ THREAD ══ */}
        <div ref={listRef} onScroll={onScroll}
          style={{
            flex: 1, minHeight: 0, overflowY: "auto",
            background: SURFACE.thread,
            backgroundImage: `url("data:image/svg+xml,${GRECA}")`,
            backgroundSize: "60px 60px",
            backgroundBlendMode: "overlay",
            padding: "14px 14px 6px",
          }}>

          {/* keeps the pattern from overpowering the text */}
          <div style={{ position: "relative" }}>

            {loading ? (
              <div className="flex justify-center" style={{ padding: 50 }}>
                <Spinner size={22} />
              </div>
            ) : messages.length === 0 ? (
              <div style={{ padding: "14px 0", maxWidth: 440, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 18 }}>
                  <div className="flex items-center justify-center mx-auto"
                    style={{
                      width: 44, height: 44, marginBottom: 12,
                      background: "rgba(63,143,95,.14)", border: `1px solid rgba(63,143,95,.3)`,
                    }}>
                    <MessageSquare size={19} style={{ color: c.gain }} />
                  </div>
                  <p className="display" style={{ fontSize: 21, color: c.text, marginBottom: 6, lineHeight: 1.2 }}>
                    How can we help?
                  </p>
                  <p style={{ fontSize: 13, color: c.text3, lineHeight: 1.6 }}>
                    Pick a question, or write your own. Photos, screen recordings
                    and voice notes all work here.
                  </p>
                </div>
                <AskList onPick={(q) => send({ body: q.label, kind: "text", ask: q.key })} />
              </div>
            ) : (
              Object.entries(groups).map(([day, items]) => (
                <div key={day}>
                  <div className="flex items-center gap-3" style={{ margin: "10px 0 14px" }}>
                    <div style={{ flex: 1, borderBottom: `1px solid ${c.lineSoft}` }} />
                    <span className="mono" style={{
                      fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase",
                      color: c.text4, background: SURFACE.thread, padding: "0 8px",
                    }}>
                      {day}
                    </span>
                    <div style={{ flex: 1, borderBottom: `1px solid ${c.lineSoft}` }} />
                  </div>

                  {items.map((m, idx) => {
                    const mine = m.from === "user";
                    const prev = items[idx - 1];
                    const grouped = prev && prev.from === m.from;

                    return (
                      <motion.div
                        key={m._id}
                        ref={(el) => { if (el) msgRefs.current[m._id] = el; }}
                        initial={{ opacity: 0, y: 6, x: mine ? 8 : -8 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        transition={{ duration: .22, ease: [.22, 1, .36, 1] }}
                        style={{
                          display: "flex",
                          gap: 8,
                          justifyContent: mine ? "flex-end" : "flex-start",
                          marginBottom: grouped ? 4 : 12,
                          background: flashId === m._id ? "rgba(63,143,95,.12)" : "transparent",
                          borderRadius: 10,
                          padding: flashId === m._id ? "6px 4px" : "0",
                          transition: "background .4s ease, padding .3s ease",
                        }}>

                        {!mine && (
                          <div style={{ width: 26, flexShrink: 0 }}>
                            {!grouped && (
                              <div className="flex items-center justify-center"
                                style={{
                                  width: 26, height: 26, borderRadius: "50%",
                                  background: "rgba(63,143,95,.15)",
                                  border: `1px solid rgba(63,143,95,.3)`,
                                }}>
                                <span className="mono" style={{ fontSize: 10, color: c.gain, fontWeight: 600 }}>
                                  {m.isAuto ? "A" : "S"}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <div style={{ maxWidth: "min(76%, 480px)", minWidth: 0 }}>
                          {!mine && !grouped && (
                            <p className="mono" style={{
                              fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase",
                              color: m.isAuto ? c.brass : c.gain, marginBottom: 4,
                            }}>
                              {m.isAuto ? "Assistant" : (m.senderName || "Support")}
                            </p>
                          )}

                          <MessageActions
                            m={m} mine={mine} canDelete={false}
                            onReply={(x) => setReplyTo(x)}
                            onReact={react}>
                            <div style={{
                              background: mine ? SURFACE.mine : SURFACE.theirs,
                              border: `1px solid ${mine ? "rgba(63,143,95,.3)" : "rgba(255,255,255,.08)"}`,
                              padding: "9px 13px",
                              borderRadius: mine
                                ? (grouped ? "14px 5px 5px 14px" : "14px 14px 5px 14px")
                                : (grouped ? "5px 14px 14px 5px" : "14px 14px 14px 5px"),
                              opacity: m.pending ? .65 : 1,
                            }}>
                              <MessageBody m={m} onAction={(p) => navigate(p)} onJump={jumpTo} />
                            </div>
                          </MessageActions>

                          <div className="flex items-center gap-1"
                            style={{
                              marginTop: 3,
                              justifyContent: mine ? "flex-end" : "flex-start",
                            }}>
                            <span className="mono" style={{
                              fontSize: 10, color: m.failed ? c.loss : c.text4,
                            }}>
                              {m.failed ? "Not sent" : m.pending ? "Sending" : fmtTime(m.createdAt)}
                            </span>
                            {mine && <Ticks m={m} />}
                          </div>
                        </div>

                        {mine && (
                          <div style={{ width: 26, flexShrink: 0 }}>
                            {!grouped && (
                              <div className="flex items-center justify-center"
                                style={{
                                  width: 26, height: 26, borderRadius: "50%",
                                  background: "rgba(255,255,255,.06)",
                                  border: `1px solid ${c.line}`,
                                }}>
                                <span className="mono" style={{ fontSize: 10, color: c.text3, fontWeight: 600 }}>
                                  {initial}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ))
            )}

            {supportTyping && messages.length > 0 && (
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 26, flexShrink: 0 }} />
                <div style={{
                  background: SURFACE.theirs,
                  border: `1px solid rgba(255,255,255,.08)`,
                  padding: "9px 13px",
                  borderRadius: "14px 14px 14px 5px",
                  display: "flex", alignItems: "center", gap: 7,
                }}>
                  <span className="chat-dots" style={{ display: "inline-flex", gap: 3 }}>
                    <i /><i /><i />
                  </span>
                  <span className="mono" style={{
                    fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase", color: c.text3,
                  }}>
                    Typing
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* ══ COMMON QUESTIONS ══ */}
        {messages.length > 0 && (
          <div className="shrink-0" style={{ background: SURFACE.page, borderTop: `1px solid ${c.line}` }}>
            <button onClick={() => setShowAsks((v) => !v)}
              className="w-full flex items-center justify-between hover-fill"
              style={{ padding: "9px 16px", transition: "background .2s" }}>
              <span className="mono flex items-center gap-2" style={{
                fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: c.text3,
              }}>
                <HelpCircle size={11} /> Common questions
              </span>
              <ChevronDown size={12} style={{
                color: c.text4,
                transform: showAsks ? "rotate(180deg)" : "none",
                transition: "transform .2s",
              }} />
            </button>

            <AnimatePresence>
              {showAsks && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: .24, ease: [.22, 1, .36, 1] }}
                  style={{ overflow: "hidden", borderTop: `1px solid ${c.lineSoft}` }}>
                  <div style={{ padding: 10, maxHeight: 230, overflowY: "auto" }}>
                    <AskList compact onPick={(q) => {
                      setShowAsks(false);
                      send({ body: q.label, kind: "text", ask: q.key });
                    }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ══ COMPOSER ══ */}
        <div className="shrink-0" style={{ background: SURFACE.page }}>
          <Composer
            sending={sending}
            onSend={send}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
            onTyping={(val) => {
              const now = Date.now();
              if (val && now - typingSentAt.current > 3000) {
                typingSentAt.current = now;
                axios.post(`${API_URL}/api/chat/typing`, {}, auth).catch(() => {});
              }
            }}
          />

          {error && (
            <p className="flex items-center gap-1.5"
              style={{ fontSize: 12, color: c.loss, padding: "0 16px 8px" }}>
              <AlertTriangle size={11} /> {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
