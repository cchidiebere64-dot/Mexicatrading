import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownToLine, ArrowUpFromLine, TrendingUp } from "lucide-react";

/*
  Live activity popups — bottom-LEFT (clear of the WhatsApp button bottom-right).
  Drop <LiveActivity /> on your Home page only.
  Shows varied messages from a large pool of people.
  South Africa, Mexico & Zimbabwe appear most often, mixed with others. No Nigeria.
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
  // heavy weight (repeated so they show more often)
  ["South Africa","🇿🇦"],["South Africa","🇿🇦"],["South Africa","🇿🇦"],["South Africa","🇿🇦"],
  ["Mexico","🇲🇽"],["Mexico","🇲🇽"],["Mexico","🇲🇽"],["Mexico","🇲🇽"],
  ["Zimbabwe","🇿🇼"],["Zimbabwe","🇿🇼"],["Zimbabwe","🇿🇼"],["Zimbabwe","🇿🇼"],
  // mix of others (single weight)
  ["Ghana","🇬🇭"],["Kenya","🇰🇪"],["Zambia","🇿🇲"],["Botswana","🇧🇼"],
  ["Brazil","🇧🇷"],["India","🇮🇳"],["USA","🇺🇸"],["UK","🇬🇧"],
  ["Canada","🇨🇦"],["Germany","🇩🇪"],["UAE","🇦🇪"],["Spain","🇪🇸"],
  ["Namibia","🇳🇦"],["Tanzania","🇹🇿"],["Philippines","🇵🇭"],["Turkey","🇹🇷"],
];

/* Message styles — mix of "contemplating" and simple */
const TYPES = [
  { kind:"deposit",  icon:ArrowDownToLine, color:"#10b981",
    lines:[
      (n,c,a)=>[`${n} ${c}`, `just deposited ${a}`],
      (n,c,a)=>[`While you're still contemplating…`, `${n} ${c} deposited ${a}`],
      (n,c,a)=>[`New deposit received`, `${n} ${c} · ${a}`],
    ]},
  { kind:"withdraw", icon:ArrowUpFromLine, color:"#14b8a6",
    lines:[
      (n,c,a)=>[`${n} ${c}`, `just withdrew ${a}`],
      (n,c,a)=>[`Someone just got paid 💸`, `${n} ${c} withdrew ${a}`],
      (n,c,a)=>[`Withdrawal completed`, `${n} ${c} · ${a}`],
    ]},
  { kind:"invest",   icon:TrendingUp,      color:"#10b981",
    lines:[
      (n,c,a)=>[`${n} ${c}`, `just invested ${a}`],
      (n,c,a)=>[`While you're still thinking…`, `${n} ${c} invested ${a}`],
      (n,c,a)=>[`New investment started`, `${n} ${c} · ${a}`],
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
    <div className="fixed bottom-6 left-6 z-[9997]" style={{ fontFamily:"'Montserrat',sans-serif" }}>
      <AnimatePresence>
        {event && (
          <motion.div
            key={event.id}
            initial={{ opacity:0, x:-40, scale:.95 }}
            animate={{ opacity:1, x:0, scale:1 }}
            exit={{ opacity:0, x:-40, scale:.95 }}
            transition={{ duration:.4, ease:[0.22,1,0.36,1] }}
            className="flex items-center gap-3 pr-5 pl-3 py-3 shadow-2xl rounded-2xl max-w-[310px]"
            style={{ background:"rgba(13,17,32,.97)", border:"1px solid rgba(16,185,129,.25)", backdropFilter:"blur(20px)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ border:`1px solid ${event.color}55`, background:`${event.color}14` }}>
              <event.Icon size={18} style={{ color:event.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm leading-tight font-semibold" style={{ color:"rgba(255,255,255,.9)" }}>{event.top}</p>
              <p className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,.55)" }}>{event.bottom}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
