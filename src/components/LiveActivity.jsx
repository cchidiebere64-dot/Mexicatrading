import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownToLine, ArrowUpFromLine, TrendingUp } from "lucide-react";
import { T } from "../pages/system.jsx";

const c = T.color;

/*
  Live activity popups — bottom-LEFT (clear of the WhatsApp button bottom-right).
  Drop <LiveActivity /> on your Home page only.
*/

const NAMES = [
  "John","Maria","Ahmed","Chen","Daniel","Aisha","Carlos","Priya","Liam","Sofia",
  "Thabo","Yuki","Omar","Elena","David","Grace","Fatima","Lucas","Lerato","Hassan",
  "Mei","Diego","Amara","Yusuf","Olga","Tendai","Ravi","Lena","Pablo","Zanele",
  "Kenji","Rosa","Sipho","Layla","Marco","Farai","Hana","Andre","Naledi","Ibrahim",
  "Nadia","Felix","Sade","Tariq","Ines","Tinashe","Mira","Pedro","Aaliyah","Sergei",
  "Wei","Juana","Bongani","Lin","Ada","Karim","Esther","Mateo","Halima","Viktor",
  "Sun","Carmen","Nomvula","Rania","Hugo","Chipo","Akira","Lola","Samuel","Yara",
  "Dmitri","Bianca","Musa","Nia","Thiago","Salma","Themba","Adaeze","Rafael","Dunia",
  "Kagiso","Lucia","Tatenda","Pia","Khaya","Rosa","Mpho","Javier","Rudo","Anele",
];

/* Weighted countries — SA, Mexico, Zimbabwe appear most. No Nigeria. */
const COUNTRIES = [
  ["South Africa","🇿🇦"],["South Africa","🇿🇦"],["South Africa","🇿🇦"],["South Africa","🇿🇦"],
  ["Mexico","🇲🇽"],["Mexico","🇲🇽"],["Mexico","🇲🇽"],["Mexico","🇲🇽"],
  ["Zimbabwe","🇿🇼"],["Zimbabwe","🇿🇼"],["Zimbabwe","🇿🇼"],["Zimbabwe","🇿🇼"],
  ["Ghana","🇬🇭"],["Kenya","🇰🇪"],["Zambia","🇿🇲"],["Botswana","🇧🇼"],
  ["Brazil","🇧🇷"],["India","🇮🇳"],["USA","🇺🇸"],["UK","🇬🇧"],
  ["Canada","🇨🇦"],["Germany","🇩🇪"],["UAE","🇦🇪"],["Spain","🇪🇸"],
  ["Namibia","🇳🇦"],["Tanzania","🇹🇿"],["Philippines","🇵🇭"],["Turkey","🇹🇷"],
];

const TYPES = [
  { kind:"deposit",  icon:ArrowDownToLine, color:c.gain,
    lines:[
      (n,co,a)=>[`${n} ${co}`, `deposited ${a}`],
      (n,co,a)=>[`While you're still contemplating…`, `${n} ${co} deposited ${a}`],
      (n,co,a)=>[`New deposit received`, `${n} ${co} · ${a}`],
    ]},
  { kind:"withdraw", icon:ArrowUpFromLine, color:c.text2,
    lines:[
      (n,co,a)=>[`${n} ${co}`, `withdrew ${a}`],
      (n,co,a)=>[`Someone just got paid`, `${n} ${co} withdrew ${a}`],
      (n,co,a)=>[`Withdrawal completed`, `${n} ${co} · ${a}`],
    ]},
  { kind:"invest",   icon:TrendingUp,      color:c.gain,
    lines:[
      (n,co,a)=>[`${n} ${co}`, `invested ${a}`],
      (n,co,a)=>[`While you're still thinking…`, `${n} ${co} invested ${a}`],
      (n,co,a)=>[`New investment started`, `${n} ${co} · ${a}`],
    ]},
];

const rand = (a) => a[Math.floor(Math.random() * a.length)];
const mask = (n) => n[0] + "***" + n[n.length - 1];

function genEvent() {
  const t = rand(TYPES);
  const [country, flag] = rand(COUNTRIES);
  const amount = (Math.floor(Math.random() * 490) + 10) * 10; // 100 – 5000
  const name = mask(rand(NAMES));
  const lineFn = rand(t.lines);
  const [top, bottom] = lineFn(name, `${flag} ${country}`, `$${amount.toLocaleString()}`);
  return {
    id: Math.random().toString(36).slice(2),
    Icon: t.icon,
    color: t.color,
    top, bottom,
  };
}

export default function LiveActivity() {
  const [event, setEvent] = useState(null);

  useEffect(() => {
    let timeoutId, cycleId;
    const show = () => {
      setEvent(genEvent());
      timeoutId = setTimeout(() => setEvent(null), 5000);
    };
    const startId = setTimeout(show, 3000);
    cycleId = setInterval(show, 8000);
    return () => { clearTimeout(startId); clearTimeout(timeoutId); clearInterval(cycleId); };
  }, []);

  return (
    <div className="ui"
      style={{ position: "fixed", bottom: 24, left: 24, zIndex: 9997, pointerEvents: "none" }}>
      <AnimatePresence>
        {event && (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: .4, ease: [.22, 1, .36, 1] }}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              maxWidth: 300,
              background: c.panel,
              border: `1px solid ${c.line}`,
              borderLeft: `2px solid ${event.color}`,
              padding: "13px 16px",
              boxShadow: "0 8px 28px rgba(0,0,0,.4)",
            }}>

            <event.Icon size={14} style={{ color: event.color, flexShrink: 0, marginTop: 2 }} />

            <div style={{ minWidth: 0 }}>
              <p style={{
                fontFamily: "'Archivo',system-ui,sans-serif",
                fontSize: T.size.sm, color: c.text, lineHeight: 1.35,
              }}>
                {event.top}
              </p>
              <p style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: T.size.tiny, color: c.text3, marginTop: 3, lineHeight: 1.5,
              }}>
                {event.bottom}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
