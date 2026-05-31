import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

/*
  Floating WhatsApp support button.
  Positioned BOTTOM-LEFT so it never overlaps the Tawk.to live chat
  widget (which sits bottom-right).
  Drop <WhatsAppButton /> once in your App and it appears on every page.
*/

const WHATSAPP_NUMBER = "447353370690"; // +44 7353 370690 (no +, no spaces)
const DEFAULT_MESSAGE = "Hi MexicaTrading support, I need some help with my account.";

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);

  const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <>
      <style>{`
        @keyframes waPulse {
          0%   { box-shadow: 0 0 0 0 rgba(16,185,129,.45); }
          70%  { box-shadow: 0 0 0 16px rgba(16,185,129,0); }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }
        .wa-pulse { animation: waPulse 2.4s ease-out infinite; }
      `}</style>

      {/* BOTTOM-LEFT — clear of the bottom-right Tawk.to widget */}
      <div className="fixed bottom-6 left-6 z-[9998] flex flex-col items-start gap-3" style={{ fontFamily:"'Montserrat',sans-serif" }}>

        {/* Popup card */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity:0, y:16, scale:.96 }}
              animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0, y:16, scale:.96 }}
              transition={{ duration:.28, ease:[0.22,1,0.36,1] }}
              className="w-72 overflow-hidden shadow-2xl"
              style={{ background:"rgba(13,17,32,.97)", border:"1px solid rgba(16,185,129,.25)", backdropFilter:"blur(20px)" }}>

              {/* header */}
              <div className="px-5 py-4 flex items-center gap-3" style={{ background:"linear-gradient(135deg,#10b981,#14b8a6)" }}>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <MessageCircle size={20} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold leading-tight">MexicaTrading Support</p>
                  <p className="text-white/80 text-[11px] flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-pulse" /> Online · replies within minutes
                  </p>
                </div>
              </div>

              {/* body */}
              <div className="px-5 py-5">
                <div className="px-4 py-3 mb-4 text-sm" style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)", color:"rgba(255,255,255,.6)" }}>
                  👋 Hi there! Need help with deposits, withdrawals, KYC or your account? Chat with our support team on WhatsApp.
                </div>
                <a href={link} target="_blank" rel="noopener noreferrer"
                  className="w-full py-3.5 text-[11px] font-semibold tracking-[.18em] uppercase text-white flex items-center justify-center gap-2.5 transition-transform duration-300 hover:-translate-y-0.5"
                  style={{ background:"linear-gradient(135deg,#10b981,#14b8a6)" }}>
                  <MessageCircle size={15} /> Start Chat
                </a>
                <p className="text-center text-[10px] mt-3 tracking-wider" style={{ color:"rgba(255,255,255,.25)" }}>
                  🔒 Secure · Available 24/7
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating button */}
        <button
          onClick={() => setOpen(o => !o)}
          aria-label="WhatsApp support"
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-transform duration-300 hover:scale-105 ${open ? "" : "wa-pulse"}`}
          style={{ background:"linear-gradient(135deg,#10b981,#14b8a6)" }}>
          <AnimatePresence mode="wait">
            {open ? (
              <motion.span key="x" initial={{ rotate:-90, opacity:0 }} animate={{ rotate:0, opacity:1 }} exit={{ rotate:90, opacity:0 }} transition={{ duration:.2 }}>
                <X size={24} />
              </motion.span>
            ) : (
              <motion.span key="chat" initial={{ rotate:90, opacity:0 }} animate={{ rotate:0, opacity:1 }} exit={{ rotate:-90, opacity:0 }} transition={{ duration:.2 }}>
                <MessageCircle size={26} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </>
  );
}
