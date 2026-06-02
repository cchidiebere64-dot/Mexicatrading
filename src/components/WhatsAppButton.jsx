import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

/*
  Floating WhatsApp support button — BOTTOM-RIGHT.
  Tap the button to open the card; tap anywhere else on the screen to close it.
  Drop <WhatsAppButton /> once in your App and it appears on every page.
*/

const WHATSAPP_NUMBER = "447353370690"; // +44 7353 370690 (no +, no spaces)
const DEFAULT_MESSAGE = "Hi dear, I'd love some help getting started with MexicaTrading 😊";

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);

  const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <>
      <style>{`
        @keyframes waPulse {
          0%   { box-shadow: 0 0 0 0 rgba(16,185,129,.45); }
          70%  { box-shadow: 0 0 0 18px rgba(16,185,129,0); }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }
        .wa-pulse { animation: waPulse 2.4s ease-out infinite; }
      `}</style>

      {/* Invisible full-screen layer — tapping it closes the card */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:.2 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[9997]"
            style={{ background:"rgba(0,0,0,.25)", backdropFilter:"blur(1px)" }} />
        )}
      </AnimatePresence>

      {/* BOTTOM-RIGHT */}
      <div className="fixed bottom-6 right-6 z-[9998] flex flex-col items-end gap-3" style={{ fontFamily:"'Montserrat',sans-serif" }}>

        {/* Popup card */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity:0, y:20, scale:.94 }}
              animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0, y:20, scale:.94 }}
              transition={{ duration:.3, ease:[0.22,1,0.36,1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-[300px] overflow-hidden shadow-2xl rounded-2xl"
              style={{ background:"rgba(13,17,32,.98)", border:"1px solid rgba(16,185,129,.3)", backdropFilter:"blur(24px)" }}>

              {/* header */}
              <div className="relative px-5 py-5 flex items-center gap-3 overflow-hidden" style={{ background:"linear-gradient(135deg,#10b981,#14b8a6)" }}>
                {/* soft glow accent */}
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full" style={{ background:"rgba(255,255,255,.15)" }} />
                <div className="relative w-11 h-11 rounded-full bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
                  <MessageCircle size={21} className="text-white" />
                </div>
                <div className="relative min-w-0">
                  <p className="text-white text-sm font-semibold leading-tight">MexicaTrading Support</p>
                  <p className="text-white/85 text-[11px] flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-pulse" /> Online · replies within minutes
                  </p>
                </div>
              </div>

              {/* body */}
              <div className="px-5 py-5">
                <div className="px-4 py-3 mb-4 text-sm leading-relaxed rounded-xl"
                  style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", color:"rgba(255,255,255,.65)" }}>
                  👋 Hi dear! Need a hand with registration, investing, or withdrawing? Our friendly team is here for you — chat with us on WhatsApp anytime.
                </div>
                <a href={link} target="_blank" rel="noopener noreferrer"
                  className="w-full py-3.5 text-[11px] font-semibold tracking-[.18em] uppercase text-white flex items-center justify-center gap-2.5 rounded-xl transition-transform duration-300 hover:-translate-y-0.5"
                  style={{ background:"linear-gradient(135deg,#10b981,#14b8a6)", boxShadow:"0 8px 24px rgba(16,185,129,.35)" }}>
                  <MessageCircle size={15} /> Chat With Us
                </a>
                <p className="text-center text-[10px] mt-3 tracking-wider" style={{ color:"rgba(255,255,255,.28)" }}>
                  🔒 Secure · Friendly Support · 24/7
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating button */}
        <button
          onClick={() => setOpen(o => !o)}
          aria-label="WhatsApp support"
          className={`relative w-15 h-15 rounded-full flex items-center justify-center text-white shadow-xl transition-transform duration-300 hover:scale-105 active:scale-95 ${open ? "" : "wa-pulse"}`}
          style={{ width:60, height:60, background:"linear-gradient(135deg,#10b981,#14b8a6)" }}>
          <AnimatePresence mode="wait">
            {open ? (
              <motion.span key="x" initial={{ rotate:-90, opacity:0 }} animate={{ rotate:0, opacity:1 }} exit={{ rotate:90, opacity:0 }} transition={{ duration:.2 }}>
                <X size={24} />
              </motion.span>
            ) : (
              <motion.span key="chat" initial={{ rotate:90, opacity:0 }} animate={{ rotate:0, opacity:1 }} exit={{ rotate:-90, opacity:0 }} transition={{ duration:.2 }}>
                <MessageCircle size={27} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </>
  );
}
