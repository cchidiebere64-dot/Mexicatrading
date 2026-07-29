import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ArrowLeft, Send, RefreshCw, Search, MessageSquare, Mail, ChevronRight,
  Check, CheckCheck, Clock, AlertTriangle,
} from "lucide-react";
import { T, ThemeStyles, Spinner, StatusPill, EmptyState, inputStyle, LedgerRow } from "./system.jsx";
import { Composer, MessageBody } from "./ChatComposer.jsx";
import MessageActions from "./MessageActions.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com";
const THREADS_POLL = 8000;
const THREAD_POLL = 4000;
const c = T.color;

function Ticks({ m }) {
  if (m.failed)  return <AlertTriangle size={11} style={{ color: c.loss }} />;
  if (m.pending) return <Clock size={11} style={{ color: c.text4 }} />;
  if (m.isRead)  return <CheckCheck size={12} style={{ color: c.gain }} />;
  return <Check size={12} style={{ color: c.text4 }} />;
}

export default function AdminChat() {
  const token = sessionStorage.getItem("adminToken");
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const [threads, setThreads] = useState([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [search, setSearch] = useState("");

  const [openUser, setOpenUser] = useState(null);   // { _id, name, email, ... }
  const [messages, setMessages] = useState([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [memberTyping, setMemberTyping] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

  const typingSentAt = useRef(0);
  const bottomRef = useRef(null);
  const listRef = useRef(null);
  const stick = useRef(true);

  /* ── Threads ── */
  const loadThreads = useCallback(async (silent = false) => {
    try {
      const res = await axios.get(`${API_URL}/api/chat/admin/threads`, auth);
      setThreads(res.data.threads || []);
      setTotalUnread(res.data.totalUnread || 0);
    } catch (err) {
      if (!silent) setError("Couldn't load conversations.");
    } finally {
      if (!silent) setLoadingThreads(false);
    }
  }, []);

  useEffect(() => { loadThreads(false); }, [loadThreads]);

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible" && !openUser) loadThreads(true);
    }, THREADS_POLL);
    return () => clearInterval(id);
  }, [loadThreads, openUser]);

  /* ── One thread ── */
  const loadThread = useCallback(async (userId, silent = false) => {
    if (!silent) setLoadingThread(true);
    try {
      const res = await axios.get(`${API_URL}/api/chat/admin/${userId}`, auth);
      setOpenUser(res.data.user);
      setMessages((prev) => {
        const next = res.data.messages || [];
        const local = prev.filter((m) => m.pending || m.failed);
        if (!local.length &&
            prev.length === next.length &&
            prev[prev.length - 1]?._id === next[next.length - 1]?._id) return prev;
        return [...next, ...local];
      });
      setMemberTyping(Boolean(res.data.memberTyping));
      setError("");
    } catch (err) {
      if (!silent) setError("Couldn't load that conversation.");
    } finally {
      if (!silent) setLoadingThread(false);
    }
  }, []);

  useEffect(() => {
    if (!openUser) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") loadThread(openUser._id, true);
    }, THREAD_POLL);
    return () => clearInterval(id);
  }, [openUser, loadThread]);

  useEffect(() => {
    if (stick.current) bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  };

  /* ── Reply ── */
  const reply = async ({ body, file, kind, duration, replyTo: quoted }) => {
    if (sending || !openUser) return;
    if (!body && !file) return;

    setSending(true); setError("");
    stick.current = true;

    const temp = {
      _id: `temp-${Date.now()}`,
      from: "admin",
      body: body || "",
      kind: kind || "text",
      mediaUrl: (kind === "image" || kind === "video") ? file : "",
      mediaDuration: duration || 0,
      senderName: "Support",
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setMessages((m) => [...m, temp]);
    setReplyTo(null);

    try {
      const res = await axios.post(`${API_URL}/api/chat/admin/${openUser._id}`, { body, file, kind, duration, replyTo: quoted }, auth);
      setMessages((m) => m.map((x) => (x._id === temp._id ? res.data.message : x)));
      loadThreads(true);
    } catch (err) {
      setMessages((m) => m.map((x) => (x._id === temp._id ? { ...x, failed: true, pending: false } : x)));
      setError(
        err.response?.status === 413
          ? "That file is too large for the server. Try a shorter recording or smaller image."
          : err.response?.data?.message || `Reply didn't send (${err.response?.status || "no response"}).`
      );
    } finally {
      setSending(false);
    }
  };

  const react = async (msg, emoji) => {
    setMessages((list) => list.map((x) =>
      x._id === msg._id
        ? { ...x, reactions: [...(x.reactions || []).filter(r => r.by !== "admin"), { by: "admin", emoji }] }
        : x
    ));
    try {
      await axios.post(`${API_URL}/api/chat/${msg._id}/react`, { emoji }, auth);
    } catch {
      loadThread(openUser._id, true);
    }
  };

  const removeMessage = async (msg) => {
    setMessages((list) => list.filter((x) => x._id !== msg._id));
    try {
      await axios.delete(`${API_URL}/api/chat/admin/message/${msg._id}`, auth);
      loadThreads(true);
    } catch {
      setError("Couldn't delete that message.");
      loadThread(openUser._id, true);
    }
  };

  const closeThread = () => {
    setOpenUser(null);
    setMessages([]);
    setReplyTo(null);
    loadThreads(true);
  };

  const money = (v) => Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fmtTime = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const fmtWhen = (d) => {
    const date = new Date(d);
    const today = new Date();
    const yest = new Date(Date.now() - 86400000);
    if (date.toDateString() === today.toDateString()) return fmtTime(d);
    if (date.toDateString() === yest.toDateString()) return "Yesterday";
    return date.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
  };

  const fmtDay = (d) => {
    const date = new Date(d);
    const today = new Date();
    const yest = new Date(Date.now() - 86400000);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yest.toDateString()) return "Yesterday";
    return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  };

  const filtered = threads.filter((t) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return t.user?.name?.toLowerCase().includes(q)
      || t.user?.email?.toLowerCase().includes(q)
      || t.lastMessage?.toLowerCase().includes(q);
  });

  const groups = messages.reduce((acc, m) => {
    const key = fmtDay(m.createdAt);
    (acc[key] = acc[key] || []).push(m);
    return acc;
  }, {});

  /* ══════════ THREAD VIEW ══════════ */
  if (openUser) {
    return (
      <div className="ui" style={{ color: c.text }}>
        <ThemeStyles />
        <style>{`
          .chat-dots i {
            width: 4px; height: 4px; border-radius: 50%;
            background: ${c.brass}; display: inline-block;
            animation: chatDot 1.2s ease-in-out infinite;
          }
          .chat-dots i:nth-child(2) { animation-delay: .18s; }
          .chat-dots i:nth-child(3) { animation-delay: .36s; }
          @keyframes chatDot { 0%,60%,100% { opacity:.25; } 30% { opacity:1; } }
          @media (prefers-reduced-motion: reduce) { .chat-dots i { animation: none; opacity:.6; } }
        `}</style>

        <button onClick={closeThread}
          className="mono flex items-center gap-2"
          style={{ fontSize: T.size.tiny, letterSpacing: ".14em", textTransform: "uppercase", color: c.text3, marginBottom: T.space.lg }}>
          <ArrowLeft size={12} /> All conversations
        </button>

        {/* member header */}
        <div style={{ border: `1px solid ${c.line}`, padding: T.space.lg, marginBottom: T.space.lg }}>
          <div className="flex items-start justify-between gap-3" style={{ marginBottom: T.space.md }}>
            <div style={{ minWidth: 0 }}>
              <h2 className="display truncate" style={{ fontSize: T.size.xl, lineHeight: 1.15 }}>
                {openUser.name}
              </h2>
              <a href={`mailto:${openUser.email}`} className="mono truncate flex items-center gap-1.5"
                style={{ fontSize: T.size.tiny, color: c.gain, marginTop: 4 }}>
                <Mail size={10} /> {openUser.email}
              </a>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${c.lineSoft}` }}>
            <LedgerRow small label="Balance" value={`$${money(openUser.balance)}`} accent={c.gain} />
            <LedgerRow small label="Country" value={openUser.country || "—"} last />
          </div>
        </div>

        {/* thread */}
        <div style={{ border: `1px solid ${c.line}`, display: "flex", flexDirection: "column", height: "56vh", minHeight: 320 }}>
          <div ref={listRef} onScroll={onScroll} style={{ flex: 1, overflowY: "auto", padding: T.space.lg }}>
            {loadingThread ? (
              <div className="flex justify-center" style={{ padding: T.space.xxxl }}><Spinner size={24} /></div>
            ) : messages.length === 0 ? (
              <EmptyState icon={<MessageSquare size={20} />} title="No messages" text="Nothing here yet." />
            ) : (
              Object.entries(groups).map(([day, items]) => (
                <div key={day}>
                  <div className="flex items-center gap-3" style={{ margin: `${T.space.md}px 0 ${T.space.lg}px` }}>
                    <div style={{ flex: 1, borderBottom: `1px solid ${c.lineSoft}` }} />
                    <span className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".2em", textTransform: "uppercase", color: c.text4 }}>
                      {day}
                    </span>
                    <div style={{ flex: 1, borderBottom: `1px solid ${c.lineSoft}` }} />
                  </div>

                  {items.map((m) => {
                    const mine = m.from === "admin";
                    return (
                      <motion.div key={m._id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .22 }}
                        style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", marginBottom: T.space.md }}>
                        <div style={{ maxWidth: "min(74%, 460px)", minWidth: 0 }}>
                          {mine && m.isAuto && (
                            <p className="mono" style={{
                              fontSize: T.size.micro, letterSpacing: ".18em",
                              textTransform: "uppercase", color: c.brass, marginBottom: 5, textAlign: "right",
                            }}>
                              Automated
                            </p>
                          )}
                          {!mine && (
                            <p className="mono" style={{
                              fontSize: T.size.micro, letterSpacing: ".18em",
                              textTransform: "uppercase", color: c.text4, marginBottom: 5,
                            }}>
                              {openUser.name?.split(" ")[0]}
                            </p>
                          )}
                          <MessageActions
                            m={m}
                            mine={mine}
                            canDelete
                            onReply={(x) => setReplyTo(x)}
                            onReact={react}
                            onDelete={removeMessage}>
                          <div style={{
                            background: mine ? "rgba(63,143,95,.14)" : "#242A33",
                            border: `1px solid ${mine ? "rgba(63,143,95,.3)" : "rgba(255,255,255,.08)"}`,
                            padding: "12px 15px",
                            borderRadius: mine ? "16px 16px 6px 16px" : "16px 16px 16px 6px",
                            opacity: m.pending ? .65 : 1,
                          }}>
                            <MessageBody m={m} />
                          </div>
                          </MessageActions>
                          <div className="flex items-center gap-1.5"
                            style={{
                              marginTop: 5,
                              justifyContent: mine ? "flex-end" : "flex-start",
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
                      </motion.div>
                    );
                  })}
                </div>
              ))
            )}
            {memberTyping && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: T.space.md }}>
                <div style={{
                  background: c.panelAlt,
                  border: `1px solid ${c.line}`,
                  borderLeft: `2px solid ${c.brass}`,
                  padding: "10px 14px",
                  display: "flex", alignItems: "center", gap: 7,
                }}>
                  <span className="chat-dots" style={{ display: "inline-flex", gap: 3 }}>
                    <i /><i /><i />
                  </span>
                  <span className="mono" style={{
                    fontSize: T.size.micro, letterSpacing: ".16em",
                    textTransform: "uppercase", color: c.text3,
                  }}>
                    {openUser.name?.split(" ")[0]} is typing
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <Composer
            sending={sending}
            placeholder="Type your reply"
            onSend={reply}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
            onTyping={(val) => {
              const now = Date.now();
              if (val && openUser && now - typingSentAt.current > 3000) {
                typingSentAt.current = now;
                axios.post(`${API_URL}/api/chat/admin/${openUser._id}/typing`, {}, auth).catch(() => {});
              }
            }}
          />
        </div>

        {error && <p style={{ fontSize: T.size.xs, color: c.loss, marginTop: 10 }}>{error}</p>}

        <p style={{ fontSize: T.size.xs, color: c.text4, lineHeight: 1.7, marginTop: T.space.lg }}>
          Never ask a member for their password, withdrawal PIN, card number or CVV.
        </p>
      </div>
    );
  }

  /* ══════════ INBOX ══════════ */
  return (
    <div className="ui" style={{ color: c.text }}>
      <ThemeStyles />
      <style>{`
        .chat-dots i {
          width: 4px; height: 4px; border-radius: 50%;
          background: ${c.brass}; display: inline-block;
          animation: chatDot 1.2s ease-in-out infinite;
        }
        .chat-dots i:nth-child(2) { animation-delay: .18s; }
        .chat-dots i:nth-child(3) { animation-delay: .36s; }
        @keyframes chatDot { 0%,60%,100% { opacity:.25; } 30% { opacity:1; } }
        @media (prefers-reduced-motion: reduce) { .chat-dots i { animation: none; opacity:.6; } }
      `}</style>

      <div className="flex items-end justify-between gap-3" style={{ marginBottom: T.space.xl }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 6 }}>Support</p>
          <h1 className="display" style={{ fontSize: T.size.xl, lineHeight: 1.1 }}>Conversations</h1>
          <p className="mono" style={{
            fontSize: T.size.xs, color: totalUnread > 0 ? c.brass : c.text3, marginTop: 6,
          }}>
            {totalUnread > 0 ? `${totalUnread} unread` : `${threads.length} total`}
          </p>
        </div>
        <button onClick={() => loadThreads(false)} aria-label="Refresh"
          className="flex items-center justify-center shrink-0"
          style={{ width: 36, height: 36, background: c.fill, border: `1px solid ${c.line}`, color: c.text3 }}>
          <RefreshCw size={14} />
        </button>
      </div>

      <div style={{ position: "relative", marginBottom: T.space.xl }}>
        <Search size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.text4 }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or message"
          style={{ ...inputStyle, paddingLeft: 36 }} />
      </div>

      {loadingThreads ? (
        <div className="flex justify-center" style={{ padding: T.space.xxxl }}><Spinner size={26} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<MessageSquare size={20} />}
          title={threads.length === 0 ? "No conversations yet" : "Nothing matches"}
          text={threads.length === 0
            ? "When a member messages you, their conversation appears here."
            : "Try a different search term."} />
      ) : (
        <div style={{ border: `1px solid ${c.line}` }}>
          {filtered.map((t, i) => (
            <button key={t._id} onClick={() => loadThread(t._id)}
              className="w-full text-left hover-fill flex items-center gap-3"
              style={{
                padding: T.space.lg,
                borderBottom: i < filtered.length - 1 ? `1px solid ${c.lineSoft}` : "none",
                borderLeft: `2px solid ${t.unread > 0 ? c.brass : "transparent"}`,
                background: t.unread > 0 ? "rgba(192,138,62,.04)" : "transparent",
                transition: "background .2s",
              }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 3 }}>
                  <span className="truncate" style={{
                    fontSize: T.size.sm,
                    color: c.text,
                    fontWeight: t.unread > 0 ? 600 : 400,
                  }}>
                    {t.user?.name}
                  </span>
                  {t.unread > 0 && <StatusPill tone="brass">{t.unread}</StatusPill>}
                </div>
                {t.typing ? (
                  <span className="flex items-center gap-2">
                    <span className="chat-dots" style={{ display: "inline-flex", gap: 3 }}>
                      <i /><i /><i />
                    </span>
                    <span className="mono" style={{
                      fontSize: T.size.micro, letterSpacing: ".16em",
                      textTransform: "uppercase", color: c.brass,
                    }}>
                      Typing
                    </span>
                  </span>
                ) : (
                  <p className="truncate" style={{ fontSize: T.size.xs, color: c.text3 }}>
                    {t.lastFrom === "admin" && <span style={{ color: c.text4 }}>You: </span>}
                    {t.lastKind === "image" ? "📷 Image"
                      : t.lastKind === "video" ? "🎬 Video"
                      : t.lastKind === "audio" ? "🎤 Voice note"
                      : t.lastMessage}
                  </p>
                )}
              </div>

              <div className="text-right shrink-0">
                <p className="mono" style={{ fontSize: T.size.micro, color: c.text4 }}>
                  {fmtWhen(t.lastAt)}
                </p>
              </div>

              <ChevronRight size={14} style={{ color: c.text4, flexShrink: 0 }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
