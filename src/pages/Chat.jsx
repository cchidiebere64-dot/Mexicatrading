import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Send, MessageSquare, AlertTriangle,
  HelpCircle, ChevronDown, ShieldCheck, Check, CheckCheck, Clock,
} from "lucide-react";
import { T, ThemeStyles, Spinner, inputStyle } from "./system.jsx";
import { Composer, MessageBody } from "./ChatComposer.jsx";
import MessageActions from "./MessageActions.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com";
const POLL_MS = 4000;
const c = T.color;

/* Chat gets its own, slightly lifted surfaces so the conversation
   reads as a space rather than a panel dropped on a black page. */
const SURFACE = {
  page:   "#15181E",   // warmer and lighter than the app ink
  thread: "#1A1E25",   // the conversation itself
  mine:   "rgba(63,143,95,.16)",
  theirs: "#242A33",
};

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
    <div style={{ border: `1px solid ${c.line}` }}>
      {QUICK_ASKS.map((q, i) => (
        <button key={q.key}
          onClick={() => onPick(q)}
          className="w-full text-left hover-fill flex items-center justify-between gap-3"
          style={{
            padding: compact ? `12px 16px` : `15px 18px`,
            borderBottom: i < QUICK_ASKS.length - 1 ? `1px solid ${c.lineSoft}` : "none",
            transition: "background .2s",
          }}>
          <span style={{ fontSize: T.size.sm, color: c.text2, lineHeight: 1.5 }}>{q.label}</span>
          <Send size={12} style={{ color: c.text4, flexShrink: 0 }} />
        </button>
      ))}
    </div>
  );
}

/* Delivery state, WhatsApp-style:
   sending → clock, sent → one tick, seen → two green ticks */
function Ticks({ m }) {
  if (m.failed)  return <AlertTriangle size={11} style={{ color: c.loss }} />;
  if (m.pending) return <Clock size={11} style={{ color: c.text4 }} />;
  if (m.isRead)  return <CheckCheck size={12} style={{ color: c.gain }} />;
  return <Check size={12} style={{ color: c.text4 }} />;
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
  const stickToBottom = useRef(true);
  const msgRefs = useRef({});

  /* Tap a quote to jump back to what it's quoting */
  const jumpTo = (id) => {
    const el = msgRefs.current[id];
    if (!el) return;
    stickToBottom.current = false;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setFlashId(id);
    setTimeout(() => setFlashId(null), 1400);
  };

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 140;
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
            prev[prev.length - 1]?._id === next[next.length - 1]?._id) {
          return prev;
        }
        return [...next, ...local];
      });
      setSupportTyping(Boolean(res.data.supportTyping));
      setError("");
    } catch (err) {
      if (!silent) setError("Couldn't load your messages. Tap refresh to retry.");
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
    if (stickToBottom.current) {
      bottomRef.current?.scrollIntoView({ behavior: loading ? "auto" : "smooth", block: "end" });
    }
  }, [messages, loading, supportTyping]);

  const send = async ({ body, file, kind, duration, ask, replyTo: quoted }) => {
    if (sending) return;
    if (!body && !file) return;

    setSending(true);
    setError("");
    stickToBottom.current = true;

    const temp = {
      _id: `temp-${Date.now()}`,
      from: "user",
      body: body || "",
      kind: kind || "text",
      mediaUrl: kind === "image" ? file : "",
      mediaDuration: duration || 0,
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setMessages((m) => [...m, temp]);
    setReplyTo(null);

    try {
      const res = await axios.post(`${API_URL}/api/chat`, { body, file, kind, duration, ask, replyTo: quoted }, auth);
      setMessages((m) => {
        const swapped = m.map((x) => (x._id === temp._id ? res.data.message : x));
        return res.data.autoMessage ? [...swapped, res.data.autoMessage] : swapped;
      });
    } catch (err) {
      setMessages((m) => m.map((x) => (x._id === temp._id ? { ...x, failed: true, pending: false } : x)));
      setError(
        err.response?.status === 413
          ? "That file is too large for the server. Try a shorter recording or smaller image."
          : err.response?.data?.message || `Didn't send (${err.response?.status || "no response"}). Check your connection.`
      );
    } finally {
      setSending(false);
    }
  };

  const react = async (msg, emoji) => {
    // optimistic
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
    <div className="ui" style={{ background: SURFACE.page, color: c.text, minHeight: "100vh" }}>
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

      {/* ══ HEADER ══ */}
      <header style={{
        position: "sticky", top: 0, zIndex: 20,
        background: SURFACE.page,
        borderBottom: `1px solid ${c.line}`,
      }}>
        <div className="mx-auto flex items-center gap-3" style={{ maxWidth: 760, padding: "14px 18px" }}>
          <button onClick={() => navigate("/dashboard")} aria-label="Back"
            className="flex items-center justify-center shrink-0"
            style={{ width: 36, height: 36, border: `1px solid ${c.line}`, background: c.fill, color: c.text2 }}>
            <ArrowLeft size={15} />
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="display" style={{ fontSize: T.size.lg, lineHeight: 1.1 }}>
              MexicaTrading Support
            </h1>
            <p className="mono flex items-center gap-1.5" style={{
              fontSize: T.size.micro, letterSpacing: ".16em",
              textTransform: "uppercase", color: c.gain, marginTop: 3,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.gain, display: "inline-block" }} />
              {supportTyping ? "Typing…" : "Online"}
            </p>
          </div>

          <ShieldCheck size={15} style={{ color: c.text4, flexShrink: 0 }} />
        </div>
      </header>

      {/* ══ CONVERSATION ══ */}
      <div className="mx-auto" style={{
        maxWidth: 760,
        display: "flex", flexDirection: "column",
        height: "calc(100dvh - 66px)",
      }}>

        <div ref={listRef} onScroll={onScroll}
          style={{
            flex: 1, overflowY: "auto",
            background: SURFACE.thread,
            padding: "28px 20px 12px",
          }}>

          {loading ? (
            <div className="flex justify-center" style={{ padding: 60 }}>
              <Spinner size={24} />
            </div>
          ) : messages.length === 0 ? (
            <div style={{ padding: "24px 0", maxWidth: 460, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div className="flex items-center justify-center mx-auto"
                  style={{
                    width: 52, height: 52, marginBottom: 16,
                    background: "rgba(63,143,95,.12)", border: `1px solid rgba(63,143,95,.28)`,
                  }}>
                  <MessageSquare size={21} style={{ color: c.gain }} />
                </div>
                <p className="display" style={{ fontSize: 24, color: c.text, marginBottom: 8, lineHeight: 1.2 }}>
                  How can we help?
                </p>
                <p style={{ fontSize: T.size.sm, color: c.text3, lineHeight: 1.7 }}>
                  Pick a question below, or write your own. You can send photos,
                  screen recordings and voice notes too.
                </p>
              </div>

              <AskList onPick={(q) =>
                send({ body: q.label, file: null, kind: "text", duration: 0, ask: q.key })
              } />
            </div>
          ) : (
            Object.entries(groups).map(([day, items]) => (
              <div key={day}>
                <div className="flex items-center gap-3" style={{ margin: "26px 0 30px" }}>
                  <div style={{ flex: 1, borderBottom: `1px solid ${c.lineSoft}` }} />
                  <span className="mono" style={{
                    fontSize: T.size.micro, letterSpacing: ".2em",
                    textTransform: "uppercase", color: c.text4,
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
                      initial={{ opacity: 0, y: 8, x: mine ? 10 : -10 }}
                      animate={{ opacity: 1, y: 0, x: 0 }}
                      transition={{ duration: .26, ease: [.22, 1, .36, 1] }}
                      style={{
                        display: "flex",
                        gap: 12,
                        justifyContent: mine ? "flex-end" : "flex-start",
                        marginBottom: grouped ? 10 : 28,
                        background: flashId === m._id ? "rgba(63,143,95,.10)" : "transparent",
                        borderRadius: 12,
                        padding: flashId === m._id ? "8px 6px" : "0",
                        transition: "background .4s ease, padding .3s ease",
                      }}>

                      {/* avatar — support side only, and only on the first of a run */}
                      {!mine && (
                        <div style={{ width: 34, flexShrink: 0 }}>
                          {!grouped && (
                            <div className="flex items-center justify-center"
                              style={{
                                width: 34, height: 34, borderRadius: "50%",
                                background: "rgba(63,143,95,.14)",
                                border: `1px solid rgba(63,143,95,.3)`,
                              }}>
                              <span className="mono" style={{ fontSize: 12, color: c.gain, fontWeight: 600 }}>
                                {m.isAuto ? "A" : "S"}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <div style={{ maxWidth: "min(78%, 520px)", minWidth: 0 }}>
                        {!mine && !grouped && (
                          <p className="mono" style={{
                            fontSize: T.size.micro, letterSpacing: ".18em",
                            textTransform: "uppercase",
                            color: m.isAuto ? c.brass : c.gain,
                            marginBottom: 9,
                          }}>
                            {m.isAuto ? "Assistant · automated" : (m.senderName || "Support")}
                          </p>
                        )}

                        <MessageActions
                          m={m}
                          mine={mine}
                          canDelete={false}
                          onReply={(msg) => setReplyTo(msg)}
                          onReact={react}>
                        <div style={{
                          background: mine ? SURFACE.mine : SURFACE.theirs,
                          border: `1px solid ${mine ? "rgba(63,143,95,.3)" : "rgba(255,255,255,.08)"}`,
                          padding: "15px 18px",
                          opacity: m.pending ? .65 : 1,
                          // Rounded, with the corner nearest the speaker squared off —
                          // the classic messenger shape. Softened when grouped.
                          borderRadius: mine
                            ? (grouped ? "16px 6px 6px 16px" : "16px 16px 6px 16px")
                            : (grouped ? "6px 16px 16px 6px" : "16px 16px 16px 6px"),
                          transition: "opacity .2s",
                        }}>
                          <MessageBody m={m} onAction={(path) => navigate(path)} onJump={jumpTo} />
                        </div>
                        </MessageActions>

                        <div className="flex items-center gap-1.5"
                          style={{
                            marginTop: 7,
                            justifyContent: mine ? "flex-end" : "flex-start",
                            paddingLeft: mine ? 0 : 4,
                            paddingRight: mine ? 4 : 0,
                          }}>
                          <span className="mono" style={{
                            fontSize: T.size.micro,
                            color: m.failed ? c.loss : c.text4,
                          }}>
                            {m.failed ? "Not sent" : m.pending ? "Sending" : fmtTime(m.createdAt)}
                          </span>
                          {mine && <Ticks m={m} />}
                        </div>
                      </div>

                      {/* your own initial, mirrored */}
                      {mine && (
                        <div style={{ width: 34, flexShrink: 0 }}>
                          {!grouped && (
                            <div className="flex items-center justify-center"
                              style={{
                                width: 34, height: 34, borderRadius: "50%",
                                background: "rgba(255,255,255,.05)",
                                border: `1px solid ${c.line}`,
                              }}>
                              <span className="mono" style={{ fontSize: 12, color: c.text3, fontWeight: 600 }}>
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
            <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
              <div style={{ width: 34, flexShrink: 0 }} />
              <div style={{
                background: SURFACE.theirs,
                border: `1px solid rgba(255,255,255,.08)`,
                padding: "14px 17px",
                borderRadius: "16px 16px 16px 6px",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span className="chat-dots" style={{ display: "inline-flex", gap: 3 }}>
                  <i /><i /><i />
                </span>
                <span className="mono" style={{
                  fontSize: T.size.micro, letterSpacing: ".16em",
                  textTransform: "uppercase", color: c.text3,
                }}>
                  Support is typing
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ══ COMMON QUESTIONS ══ */}
        {messages.length > 0 && (
          <div style={{ background: SURFACE.page, borderTop: `1px solid ${c.line}` }}>
            <button onClick={() => setShowAsks((v) => !v)}
              className="w-full flex items-center justify-between hover-fill"
              style={{ padding: "12px 18px", transition: "background .2s" }}>
              <span className="mono flex items-center gap-2" style={{
                fontSize: T.size.tiny, letterSpacing: ".16em",
                textTransform: "uppercase", color: c.text3,
              }}>
                <HelpCircle size={12} /> Common questions
              </span>
              <ChevronDown size={13} style={{
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
                  transition={{ duration: .25, ease: [.22, 1, .36, 1] }}
                  style={{ overflow: "hidden", borderTop: `1px solid ${c.lineSoft}` }}>
                  <div style={{ padding: 14, maxHeight: 260, overflowY: "auto" }}>
                    <AskList compact onPick={(q) => {
                      setShowAsks(false);
                      send({ body: q.label, file: null, kind: "text", duration: 0, ask: q.key });
                    }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ══ COMPOSER ══ */}
        <div style={{ background: SURFACE.page }}>
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
              style={{ fontSize: T.size.xs, color: c.loss, padding: "0 18px 10px" }}>
              <AlertTriangle size={11} /> {error}
            </p>
          )}

          <p style={{
            fontSize: T.size.micro, color: c.text4,
            textAlign: "center", padding: "0 18px 14px", lineHeight: 1.6,
          }}>
            We'll never ask for your password, withdrawal PIN, card number or CVV.
          </p>
        </div>
      </div>
    </div>
  );
}
