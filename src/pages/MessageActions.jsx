import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reply, Trash2, Copy, Check, X } from "lucide-react";
import { T } from "./system.jsx";

const c = T.color;

export const REACTIONS = ["👍", "❤️", "😂", "😮", "🙏"];

/**
 * Wraps a chat bubble to add:
 *   • swipe toward the centre to reply
 *   • long-press to open reactions and actions
 *
 * Props:
 *   mine        — is this my own message (affects swipe direction)
 *   canDelete   — show the delete action (admin only)
 *   onReply, onReact, onDelete, onCopy
 */
export default function MessageActions({
  children, m, mine, canDelete,
  onReply, onReact, onDelete, onCopy,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const pressTimer = useRef(null);
  const moved = useRef(false);

  const startPress = () => {
    moved.current = false;
    clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => {
      if (!moved.current) {
        setMenuOpen(true);
        if (navigator.vibrate) navigator.vibrate(12);
      }
    }, 420);
  };

  const endPress = () => clearTimeout(pressTimer.current);
  const cancelPress = () => { moved.current = true; clearTimeout(pressTimer.current); };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(m.body || "");
      setCopied(true);
      setTimeout(() => { setCopied(false); setMenuOpen(false); }, 900);
      onCopy?.();
    } catch {
      setMenuOpen(false);
    }
  };

  const myReaction = m.reactions?.find((r) => r.by === (mine ? "user" : "admin"))?.emoji;

  return (
    <div style={{ position: "relative" }}>

      {/* ── Swipe to reply ── */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: mine ? -70 : 0, right: mine ? 0 : 70 }}
        dragElastic={0.18}
        onDragStart={cancelPress}
        onDragEnd={(_e, info) => {
          const past = mine ? info.offset.x < -52 : info.offset.x > 52;
          if (past) {
            onReply?.(m);
            if (navigator.vibrate) navigator.vibrate(10);
          }
        }}
        onPointerDown={startPress}
        onPointerUp={endPress}
        onPointerCancel={endPress}
        onContextMenu={(e) => { e.preventDefault(); setMenuOpen(true); }}
        whileTap={{ scale: 0.995 }}
        style={{ position: "relative", touchAction: "pan-y", cursor: "pointer" }}>

        {/* the reply arrow revealed behind the bubble as it slides */}
        <div style={{
          position: "absolute", top: 0, bottom: 0,
          [mine ? "right" : "left"]: -34,
          display: "flex", alignItems: "center",
          color: c.text4, pointerEvents: "none",
        }}>
          <Reply size={15} />
        </div>

        {children}
      </motion.div>

      {/* ── Existing reactions, pinned under the bubble ── */}
      {m.reactions?.length > 0 && (
        <div className="flex" style={{
          gap: 4, marginTop: -4, marginBottom: 2,
          justifyContent: mine ? "flex-end" : "flex-start",
        }}>
          {m.reactions.map((r, i) => (
            <span key={i}
              style={{
                fontSize: 13, lineHeight: 1,
                background: c.panel,
                border: `1px solid ${c.line}`,
                borderRadius: 20,
                padding: "3px 7px",
              }}>
              {r.emoji}
            </span>
          ))}
        </div>
      )}

      {/* ── Long-press menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <div
              onClick={() => setMenuOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 60 }} />

            <motion.div
              initial={{ opacity: 0, y: 8, scale: .96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: .96 }}
              transition={{ duration: .18, ease: [.22, 1, .36, 1] }}
              style={{
                position: "absolute", zIndex: 61,
                bottom: "calc(100% + 6px)",
                [mine ? "right" : "left"]: 0,
                background: c.panel,
                border: `1px solid ${c.line}`,
                boxShadow: "0 12px 34px rgba(0,0,0,.5)",
                borderRadius: 10,
                overflow: "hidden",
                minWidth: 196,
              }}>

              {/* reactions */}
              <div className="flex items-center" style={{
                gap: 2, padding: "8px 8px",
                borderBottom: `1px solid ${c.lineSoft}`,
              }}>
                {REACTIONS.map((e) => (
                  <button key={e}
                    onClick={() => { onReact?.(m, e); setMenuOpen(false); }}
                    style={{
                      fontSize: 19, lineHeight: 1,
                      padding: "6px 7px",
                      borderRadius: 8,
                      background: myReaction === e ? "rgba(63,143,95,.16)" : "transparent",
                    }}>
                    {e}
                  </button>
                ))}
              </div>

              {/* actions */}
              <button onClick={() => { onReply?.(m); setMenuOpen(false); }}
                className="w-full text-left hover-fill flex items-center gap-2.5"
                style={{ padding: "11px 14px", borderBottom: `1px solid ${c.lineSoft}` }}>
                <Reply size={13} style={{ color: c.text3 }} />
                <span style={{ fontSize: T.size.sm, color: c.text2 }}>Reply</span>
              </button>

              {m.body && (
                <button onClick={copyText}
                  className="w-full text-left hover-fill flex items-center gap-2.5"
                  style={{ padding: "11px 14px", borderBottom: canDelete ? `1px solid ${c.lineSoft}` : "none" }}>
                  {copied
                    ? <Check size={13} style={{ color: c.gain }} />
                    : <Copy size={13} style={{ color: c.text3 }} />}
                  <span style={{ fontSize: T.size.sm, color: copied ? c.gain : c.text2 }}>
                    {copied ? "Copied" : "Copy text"}
                  </span>
                </button>
              )}

              {canDelete && (
                <button onClick={() => { onDelete?.(m); setMenuOpen(false); }}
                  className="w-full text-left hover-fill flex items-center gap-2.5"
                  style={{ padding: "11px 14px" }}>
                  <Trash2 size={13} style={{ color: c.loss }} />
                  <span style={{ fontSize: T.size.sm, color: c.loss }}>Delete</span>
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
