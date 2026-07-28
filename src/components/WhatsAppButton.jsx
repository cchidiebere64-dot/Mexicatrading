import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, ArrowRight } from "lucide-react";
import axios from "axios";
import { T } from "../pages/system.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com";
const c = T.color;

/*
  Floating support button — BOTTOM-RIGHT.
  Opens the in-app chat at /chat. Live activity popups sit bottom-LEFT.
  Filename kept as WhatsAppButton.jsx so existing imports keep working.
*/

const BUBBLES = [
  "Need a hand?",
  "Questions? We're here",
  "Message support",
  "We're online now",
  "Happy to help",
];

export default function WhatsAppButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [bubble, setBubble] = useState(null);
  const [nudge, setNudge] = useState(false);
  const [unread, setUnread] = useState(0);
  const [popped, setPopped] = useState(null);   // the reply currently shown

  const seenIdRef = useRef(null);               // last reply we already popped
  const popTimerRef = useRef(null);
  const firstCheckRef = useRef(true);

  const token = sessionStorage.getItem("token");
  const onChatPage = location.pathname === "/chat";

  /* Unread replies — polled gently */
  useEffect(() => {
    if (!token || onChatPage) { setUnread(0); return; }

    let cancelled = false;
    const check = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/chat/unread`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cancelled) return;

        const count = res.data?.count || 0;
        const latest = res.data?.latest || null;
        setUnread(count);

        // Pop the reply itself — but not on the very first check after page load,
        // otherwise old unread messages would pop every time they navigate.
        if (latest && latest._id !== seenIdRef.current) {
          seenIdRef.current = latest._id;
          if (!firstCheckRef.current) {
            setPopped(latest);
            clearTimeout(popTimerRef.current);
            popTimerRef.current = setTimeout(() => setPopped(null), 9000);
          }
        }
        firstCheckRef.current = false;
      } catch {
        /* silent — this is a background nicety */
      }
    };

    check();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") check();
    }, 10000);

    return () => { cancelled = true; clearInterval(id); clearTimeout(popTimerRef.current); };
  }, [token, onChatPage, location.pathname]);

  /* Periodic nudge + bubble, only while the card is closed */
  useEffect(() => {
    if (open || onChatPage || popped) { setBubble(null); return; }

    let bubbleHide, nudgeStop;

    const cycle = () => {
      setNudge(true);
      nudgeStop = setTimeout(() => setNudge(false), 900);
      setBubble(BUBBLES[Math.floor(Math.random() * BUBBLES.length)]);
      bubbleHide = setTimeout(() => setBubble(null), 4500);
    };

    const first = setTimeout(cycle, 6000);
    const interval = setInterval(cycle, 20000);

    return () => {
      clearTimeout(first); clearTimeout(bubbleHide);
      clearTimeout(nudgeStop); clearInterval(interval);
    };
  }, [open, onChatPage, popped]);

  const goToChat = () => {
    setOpen(false);
    setPopped(null);
    clearTimeout(popTimerRef.current);
    navigate(token ? "/chat" : "/login");
  };

  const previewText = (m) => {
    if (!m) return "";
    if (m.kind === "image") return "Sent you an image";
    if (m.kind === "video") return "Sent you a video";
    if (m.kind === "audio") return "Sent you a voice note";
    return m.body.length > 120 ? m.body.slice(0, 120) + "…" : m.body;
  };

  /* Hide entirely while the user is already in the chat */
  if (onChatPage) return null;

  return (
    <>
      <style>{`
        @keyframes supNudge {
          0%, 100% { transform: translateY(0); }
          30%      { transform: translateY(-7px); }
          60%      { transform: translateY(0); }
          80%      { transform: translateY(-3px); }
        }
        .sup-nudge { animation: supNudge .9s cubic-bezier(.22,1,.36,1); }
        @media (prefers-reduced-motion: reduce) { .sup-nudge { animation: none; } }
      `}</style>

      {/* Tap-anywhere-to-close layer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: .2 }}
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 9997, background: "rgba(8,9,11,.5)" }} />
        )}
      </AnimatePresence>

      <div className="ui"
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9998,
          display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12,
        }}>

        {/* ── Card ── */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              transition={{ duration: .28, ease: [.22, 1, .36, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 292,
                background: c.panel,
                border: `1px solid ${c.line}`,
                boxShadow: "0 16px 48px rgba(0,0,0,.5)",
              }}>

              <div style={{ height: 2, background: c.gain }} />

              <div className="flex items-start justify-between gap-3"
                style={{ padding: "18px 18px 14px", borderBottom: `1px solid ${c.line}` }}>
                <div>
                  <p className="mono" style={{
                    fontSize: T.size.micro, letterSpacing: ".22em",
                    textTransform: "uppercase", color: c.gain, marginBottom: 6,
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: c.gain, display: "inline-block",
                    }} />
                    Online
                  </p>
                  <p className="display" style={{ fontSize: T.size.lg, color: c.text, lineHeight: 1.15 }}>
                    Support
                  </p>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Close"
                  className="flex items-center justify-center shrink-0"
                  style={{ width: 28, height: 28, background: c.fill, color: c.text3 }}>
                  <X size={13} />
                </button>
              </div>

              <div style={{ padding: 18 }}>
                <p style={{ fontSize: T.size.sm, color: c.text2, lineHeight: 1.7, marginBottom: 16 }}>
                  {unread > 0
                    ? `You have ${unread} unread ${unread === 1 ? "reply" : "replies"} from our team.`
                    : "Need help with registering, depositing, investing or withdrawing? Send us a message and we'll reply shortly."}
                </p>

                <button onClick={goToChat}
                  className="mono w-full flex items-center justify-center gap-2"
                  style={{
                    padding: "13px 0",
                    fontSize: T.size.tiny, letterSpacing: ".14em", textTransform: "uppercase",
                    background: c.gain, color: "#fff", border: `1px solid ${c.gain}`,
                  }}>
                  {unread > 0 ? "Read replies" : token ? "Open messages" : "Sign in to message"}
                  <ArrowRight size={13} />
                </button>

                <p className="mono" style={{
                  fontSize: T.size.micro, letterSpacing: ".14em", textTransform: "uppercase",
                  color: c.text4, textAlign: "center", marginTop: 12,
                }}>
                  Photos · Video · Voice notes
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Reply popped from the button ── */}
        <AnimatePresence>
          {popped && !open && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: .96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: .96 }}
              transition={{ duration: .32, ease: [.22, 1, .36, 1] }}
              style={{
                width: 286,
                background: c.panel,
                border: `1px solid ${c.line}`,
                borderLeft: `2px solid ${c.gain}`,
                boxShadow: "0 14px 44px rgba(0,0,0,.5)",
              }}>

              <div className="flex items-start justify-between gap-2"
                style={{ padding: "12px 14px 8px" }}>
                <p className="mono" style={{
                  fontSize: T.size.micro, letterSpacing: ".2em",
                  textTransform: "uppercase", color: c.gain,
                }}>
                  {popped.senderName || "Support"}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); setPopped(null); clearTimeout(popTimerRef.current); }}
                  aria-label="Dismiss"
                  className="flex items-center justify-center shrink-0"
                  style={{ width: 22, height: 22, background: c.fill, color: c.text4 }}>
                  <X size={11} />
                </button>
              </div>

              <button onClick={goToChat}
                className="w-full text-left"
                style={{ padding: "0 14px 14px", background: "transparent" }}>
                <p style={{
                  fontSize: T.size.sm, color: c.text, lineHeight: 1.6,
                  whiteSpace: "pre-line", wordBreak: "break-word",
                }}>
                  {previewText(popped)}
                </p>
                <p className="mono flex items-center gap-1.5" style={{
                  fontSize: T.size.micro, letterSpacing: ".16em",
                  textTransform: "uppercase", color: c.gain, marginTop: 10,
                }}>
                  Reply <ArrowRight size={11} />
                </p>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Bubble + button ── */}
        <div className="flex items-center gap-2.5">
          <AnimatePresence>
            {bubble && !open && (
              <motion.button
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: .28, ease: [.22, 1, .36, 1] }}
                onClick={() => setOpen(true)}
                style={{
                  background: c.paper,
                  color: c.paperInk,
                  padding: "9px 13px",
                  fontFamily: "'Archivo',system-ui,sans-serif",
                  fontSize: T.size.xs,
                  whiteSpace: "nowrap",
                  boxShadow: "0 6px 20px rgba(0,0,0,.35)",
                }}>
                {unread > 0 ? `${unread} new ${unread === 1 ? "reply" : "replies"}` : bubble}
              </motion.button>
            )}
          </AnimatePresence>

          <button
            onClick={() => setOpen(o => !o)}
            aria-label="Contact support"
            className={nudge && !open ? "sup-nudge" : ""}
            style={{
              position: "relative",
              width: 52, height: 52,
              background: c.gain,
              border: `1px solid ${c.gain}`,
              color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 24px rgba(63,143,95,.3)",
            }}>
            <AnimatePresence mode="wait">
              {open ? (
                <motion.span key="x"
                  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }} transition={{ duration: .18 }}>
                  <X size={20} />
                </motion.span>
              ) : (
                <motion.span key="chat"
                  initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }} transition={{ duration: .18 }}>
                  <MessageCircle size={22} />
                </motion.span>
              )}
            </AnimatePresence>

            {unread > 0 && !open && (
              <span className="mono" style={{
                position: "absolute", top: -6, right: -6,
                minWidth: 20, height: 20, padding: "0 5px",
                background: c.brass, color: "#0E1013",
                fontSize: T.size.micro, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
