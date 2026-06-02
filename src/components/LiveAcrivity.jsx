import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownToLine, ArrowUpFromLine, TrendingUp } from "lucide-react";

/*
  Live activity popups — bottom-LEFT, so they never overlap the
  WhatsApp button (bottom-right).
  Drop <LiveActivity /> on your Home page only.
  Each notification slides in, stays a few seconds, slides out,
  then a new random one appears.
*/

const NAMES = [
  "John","Maria","Ahmed","Chen","Daniel","Aisha","Carlos","Priya","Liam","Sofia",
  "Kwame","Yuki","Omar","Elena","David","Grace","Fatima","Lucas","Ngozi","Hassan",
  "Mei","Diego","Amara","Yusuf","Olga","Tunde","Ravi","Lena","Pablo","Zainab",
  "Kenji","Rosa","Emeka","Layla","Marco","Chidi","Hana","Andre","Bisi","Ibrahim",
  "Nadia","Felix","Sade","Tariq","Ines","Kofi","Mira","Pedro","Aaliyah","Sergei",
];
const COUNTRIES = [
  ["Nigeria","🇳🇬"],["Mexico","🇲🇽"],["South Africa","🇿🇦"],["Ghana","🇬🇭"],["Kenya","🇰🇪"],
  ["Brazil","🇧🇷"],["India","🇮🇳"],["Philippines","🇵🇭"],["Egypt","🇪🇬"],["USA","🇺🇸"],
  ["UK","🇬🇧"],["Canada","🇨🇦"],["Germany","🇩🇪"],["France","🇫🇷"],["Spain","🇪🇸"],
  ["Turkey","🇹🇷"],["UAE","🇦🇪"],["Indonesia","🇮🇩"],["Vietnam","🇻🇳"],["Poland","🇵🇱"],
];
const TYPES = [
  { kind:"deposit",  verb:"deposited", icon:ArrowDownToLine, color:"#10b981" },
  { kind:"withdraw", verb:"withdrew",  icon:ArrowUpFromLine, color:"#14b8a6" },
  { kind:"invest",   verb:"invested",  icon:TrendingUp,      color:"#10b981" },
];

const rand = (a) => a[Math.floor(Math.random() * a.length)];
const mask = (n) => n[0] + "***" + n[n.length - 1];

function genEvent() {
  const t = rand(TYPES);
  const [country, flag] = rand(COUNTRIES);
  const amount = (Math.floor(Math.random() * 490) + 10) * 10; // 100 – 5000
  return {
    id: Math.random().toString(36).slice(2),
    name: mask(rand(NAMES)),
    country, flag,
    verb: t.verb,
    Icon: t.icon,
    color: t.color,
    amount,
  };
}

export default function LiveActivity() {
  const [event, setEvent] = useState(null);

  useEffect(() => {
    let timeoutId;
    let cycleId;

    const show = () => {
      setEvent(genEvent());
      // hide after 5 seconds
      timeoutId = setTimeout(() => setEvent(null), 5000);
    };

    // first one after 3 seconds
    const startId = setTimeout(show, 3000);
    // then a new one every ~9 seconds
    cycleId = setInterval(show, 9000);

    return () => { clearTimeout(startId); clearTimeout(timeoutId); clearInterval(cycleId); };
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-[9997]" style={{ fontFamily:"'Montserrat',sans-serif" }}>
      <AnimatePresence>
        {event && (
          <motion.div
            key={event.id}
            initial={{ opacity:0, x:-40, scale:.95 }}
            animate={{ opacity:1, x:0, scale:1 }}
            exit={{ opacity:0, x:-40, scale:.95 }}
            transition={{ duration:.4, ease:[0.22,1,0.36,1] }}
            className="flex items-center gap-3 pr-5 pl-3 py-3 shadow-2xl max-w-[300px]"
            style={{ background:"rgba(13,17,32,.97)", border:"1px solid rgba(16,185,129,.25)", backdropFilter:"blur(20px)" }}>
            <div className="w-10 h-10 flex items-center justify-center shrink-0"
              style={{ border:`1px solid ${event.color}55`, background:`${event.color}14` }}>
              <event.Icon size={18} style={{ color:event.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm leading-tight" style={{ color:"rgba(255,255,255,.85)" }}>
                <span className="font-semibold">{event.name}</span>
                <span style={{ color:"rgba(255,255,255,.5)" }}> {event.flag} {event.country}</span>
              </p>
              <p className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,.55)" }}>
                just {event.verb} <span className="font-semibold" style={{ color:event.color }}>${event.amount.toLocaleString()}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
