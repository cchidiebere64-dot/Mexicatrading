import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { T } from "../pages/system.jsx";

const c = T.color;

/*
  Floating WhatsApp support button — BOTTOM-RIGHT.
  Live activity popups sit bottom-LEFT, so nothing overlaps.
*/

const WHATSAPP_NUMBER = "447353370690"; // +44 7353 370690 (no +, no spaces)
const DEFAULT_MESSAGE = "Hi, I'd like some help getting started with MexicaTrading.";

const BUBBLES = [
  "Need a hand?",
  "Questions? We're here",
  "Chat with support",
  "We're online now",
  "Happy to help",
];

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);
  const [bubble, setBubble] = useState(null);
  const [nudge, setNudge] = useState(false);

  const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  /* Periodic nudge + bubble, only while the card is closed */
  useEffect(() => {
    if (open) { setBubble(null); return; }

    let bubbleHide, nudgeStop;

    const cycle = () => {
      setNudge(true);
      nudgeStop = setTimeout(() => setNudge(false), 900);
      setBubble(BUBBLES[Math.floor(Math.random() * BUBBLES.length)]);
      bubbleHide = setTimeout(() => setBubble(null), 4500);
    };

    const first = setTimeout(cycle, 5000);
    const interval = setInterval(cycle, 16000);

    return () => {
      clearTimeout(first); clearTimeout(bubbleHide);
      clearTimeout(nudgeStop); clearInterval(interval);
    };
  }, [open]);

  return (
    <>
      <style>{`
        @keyframes waNudge {
          0%, 100% { transform: translateY(0); }
          30%      { transform: translateY(-7px); }
          60%      { transform: translateY(0); }
          80%      { transform: translateY(-3px); }
        }
        .wa-nudge { animation: waNudge .9s cubic-bezier(.22,1,.36,1); }
        @media (prefers-reduced-motion: reduce) { .wa-nudge { animation: none; } }
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

              {/* header */}
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

              {/* body */}
              <div style={{ padding: 18 }}>
                <p style={{ fontSize: T.size.sm, color: c.text2, lineHeight: 1.7, marginBottom: 16 }}>
                  Need help with registering, depositing, investing or withdrawing?
                  Message us on WhatsApp and we'll reply shortly.
                </p>

                <a href={link} target="_blank" rel="noopener noreferrer"
                  className="mono flex items-center justify-center gap-2"
                  style={{
                    padding: "13px 0",
                    fontSize: T.size.tiny, letterSpacing: ".14em", textTransform: "uppercase",
                    background: c.gain, color: "#fff", border: `1px solid ${c.gain}`,
                  }}>
                  <MessageCircle size={13} /> Open WhatsApp
                </a>

                <p className="mono" style={{
                  fontSize: T.size.micro, letterSpacing: ".14em", textTransform: "uppercase",
                  color: c.text4, textAlign: "center", marginTop: 12,
                }}>
                  Replies within minutes · 24/7
                </p>
              </div>
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
                {bubble}
              </motion.button>
            )}
          </AnimatePresence>

          <button
            onClick={() => setOpen(o => !o)}
            aria-label="Contact support on WhatsApp"
            className={nudge && !open ? "wa-nudge" : ""}
            style={{
              width: 52, height: 52,
              background: c.gain,
              border: `1px solid ${c.gain}`,
              color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 24px rgba(63,143,95,.3)",
              transition: "transform .2s",
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
          </button>
        </div>
      </div>
    </>
  );
}
