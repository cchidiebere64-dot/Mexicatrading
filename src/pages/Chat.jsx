import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, MessageSquare, AlertTriangle } from "lucide-react";
import { T, PageShell, Button, Spinner, EmptyState, inputStyle } from "./system.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com";
const POLL_MS = 4000;
const c = T.color;

export default function Chat() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);
  const listRef = useRef(null);
  const stickToBottom = useRef(true);

  const scrollToBottom = (smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "end" });
  };

  /* Only auto-scroll if the user is already near the bottom */
  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    stickToBottom.current = nearBottom;
  };

  const load = useCallback(async (silent = false) => {
    if (!token) { navigate("/login"); return; }
    try {
      const res = await axios.get(`${API_URL}/api/chat`, auth);
      const next = res.data.messages || [];
      setMessages((prev) => {
        // avoid re-render if nothing changed
        if (prev.length === next.length && prev[prev.length - 1]?._id === next[next.length - 1]?._id) {
          return prev;
        }
        return next;
      });
      setError("");
    } catch (err) {
      if (!silent) setError("Couldn't load your messages. Pull to retry.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(false); }, [load]);

  /* Poll while the tab is visible */
  useEffect(() => {
    const tick = () => { if (document.visibilityState === "visible") load(true); };
    const id = setInterval(tick, POLL_MS);
    window.addEventListener("focus", tick);
    return () => { clearInterval(id); window.removeEventListener("focus", tick); };
  }, [load]);

  useEffect(() => {
    if (stickToBottom.current) scrollToBottom(!loading);
  }, [messages, loading]);

  const send = async (e) => {
    e?.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;

    setSending(true);
    setError("");
    setDraft("");
    stickToBottom.current = true;

    // optimistic — show it straight away
    const temp = {
      _id: `temp-${Date.now()}`,
      from: "user",
      body,
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setMessages((m) => [...m, temp]);

    try {
      const res = await axios.post(`${API_URL}/api/chat`, { body }, auth);
      setMessages((m) => m.map((x) => (x._id === temp._id ? res.data.message : x)));
    } catch (err) {
      setMessages((m) => m.map((x) => (x._id === temp._id ? { ...x, failed: true, pending: false } : x)));
      setError(err.response?.data?.message || "Message didn't send. Check your connection.");
    } finally {
      setSending(false);
    }
  };

  const fmtTime = (d) =>
    new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const fmtDay = (d) => {
    const date = new Date(d);
    const today = new Date();
    const yest = new Date(Date.now() - 86400000);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yest.toDateString()) return "Yesterday";
    return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  };

  /* Group by day */
  const groups = messages.reduce((acc, m) => {
    const key = fmtDay(m.createdAt);
    (acc[key] = acc[key] || []).push(m);
    return acc;
  }, {});

  return (
    <PageShell width={620}>

      {/* ── Back ── */}
      <button onClick={() => navigate("/dashboard")}
        className="mono flex items-center gap-2"
        style={{ fontSize: T.size.tiny, letterSpacing: ".14em", textTransform: "uppercase", color: c.text3, marginBottom: T.space.lg }}>
        <ArrowLeft size={12} /> Dashboard
      </button>

      {/* ── Header ── */}
      <div style={{ marginBottom: T.space.lg }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.gain, display: "inline-block" }} />
          <span className="mono" style={{
            fontSize: T.size.micro, letterSpacing: ".24em",
            textTransform: "uppercase", color: c.gain,
          }}>
            Support online
          </span>
        </div>
        <h1 className="display" style={{ fontSize: T.size.xxl, lineHeight: 1.05 }}>Messages</h1>
        <p style={{ fontSize: T.size.sm, color: c.text3, marginTop: 8, lineHeight: 1.7 }}>
          Message our team directly. We usually reply within a few minutes.
        </p>
      </div>

      {/* ── Thread ── */}
      <div style={{ border: `1px solid ${c.line}`, display: "flex", flexDirection: "column", height: "58vh", minHeight: 340 }}>

        <div ref={listRef} onScroll={onScroll}
          style={{ flex: 1, overflowY: "auto", padding: T.space.lg }}>

          {loading ? (
            <div className="flex justify-center" style={{ padding: T.space.xxxl }}>
              <Spinner size={24} />
            </div>
          ) : messages.length === 0 ? (
            <div style={{ padding: `${T.space.xl}px 0` }}>
              <EmptyState
                icon={<MessageSquare size={20} />}
                title="No messages yet"
                text="Ask us anything — deposits, withdrawals, verification, or how a plan works."
              />
            </div>
          ) : (
            Object.entries(groups).map(([day, items]) => (
              <div key={day}>
                {/* day rule */}
                <div className="flex items-center gap-3" style={{ margin: `${T.space.md}px 0 ${T.space.lg}px` }}>
                  <div style={{ flex: 1, borderBottom: `1px solid ${c.lineSoft}` }} />
                  <span className="mono" style={{
                    fontSize: T.size.micro, letterSpacing: ".2em",
                    textTransform: "uppercase", color: c.text4,
                  }}>
                    {day}
                  </span>
                  <div style={{ flex: 1, borderBottom: `1px solid ${c.lineSoft}` }} />
                </div>

                {items.map((m) => {
                  const mine = m.from === "user";
                  return (
                    <motion.div
                      key={m._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: .22 }}
                      style={{
                        display: "flex",
                        justifyContent: mine ? "flex-end" : "flex-start",
                        marginBottom: T.space.md,
                      }}>
                      <div style={{ maxWidth: "82%" }}>
                        {!mine && (
                          <p className="mono" style={{
                            fontSize: T.size.micro, letterSpacing: ".18em",
                            textTransform: "uppercase", color: c.gain, marginBottom: 5,
                          }}>
                            {m.senderName || "Support"}
                          </p>
                        )}

                        <div style={{
                          background: mine ? "rgba(63,143,95,.1)" : c.panelAlt,
                          border: `1px solid ${mine ? "rgba(63,143,95,.25)" : c.line}`,
                          borderLeft: mine ? undefined : `2px solid ${c.gain}`,
                          padding: "11px 14px",
                          opacity: m.pending ? .6 : 1,
                        }}>
                          <p style={{
                            fontSize: T.size.sm,
                            color: c.text,
                            lineHeight: 1.65,
                            whiteSpace: "pre-line",
                            wordBreak: "break-word",
                          }}>
                            {m.body}
                          </p>
                        </div>

                        <p className="mono" style={{
                          fontSize: T.size.micro,
                          color: m.failed ? c.loss : c.text4,
                          marginTop: 4,
                          textAlign: mine ? "right" : "left",
                        }}>
                          {m.failed
                            ? "Not sent"
                            : m.pending
                              ? "Sending…"
                              : fmtTime(m.createdAt)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Composer ── */}
        <form onSubmit={send}
          style={{ borderTop: `1px solid ${c.line}`, padding: T.space.md, display: "flex", gap: 8 }}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
            }}
            rows={1}
            placeholder="Type your message"
            style={{
              ...inputStyle,
              flex: 1,
              resize: "none",
              minHeight: 44,
              maxHeight: 120,
              lineHeight: 1.5,
            }} />
          <button type="submit" disabled={!draft.trim() || sending}
            aria-label="Send"
            style={{
              width: 46,
              flexShrink: 0,
              background: draft.trim() ? c.gain : c.fill,
              border: `1px solid ${draft.trim() ? c.gain : c.line}`,
              color: draft.trim() ? "#fff" : c.text4,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background .2s, border-color .2s, color .2s",
            }}>
            {sending ? <Spinner size={14} tone="#fff" /> : <Send size={15} />}
          </button>
        </form>
      </div>

      {error && (
        <p className="flex items-center gap-1.5"
          style={{ fontSize: T.size.xs, color: c.loss, marginTop: 10 }}>
          <AlertTriangle size={11} /> {error}
        </p>
      )}

      <p style={{ fontSize: T.size.xs, color: c.text4, lineHeight: 1.7, marginTop: T.space.lg }}>
        Our team will never ask for your password, withdrawal PIN, card number or CVV in this chat.
      </p>
    </PageShell>
  );
}
