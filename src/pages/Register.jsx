import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Lock, Phone, Globe, ArrowRight,
  Eye, EyeOff, CheckCircle, AlertTriangle, ChevronDown, Search, Gift, ChevronRight
} from "lucide-react";
import { useTranslation } from "react-i18next";

/* ─────────────────────────────────────────────
   COUNTRIES
───────────────────────────────────────────── */
const COUNTRIES = [
  {name:"Afghanistan",code:"AF",flag:"🇦🇫",dial:"+93"},{name:"Albania",code:"AL",flag:"🇦🇱",dial:"+355"},{name:"Algeria",code:"DZ",flag:"🇩🇿",dial:"+213"},{name:"Andorra",code:"AD",flag:"🇦🇩",dial:"+376"},{name:"Angola",code:"AO",flag:"🇦🇴",dial:"+244"},{name:"Antigua and Barbuda",code:"AG",flag:"🇦🇬",dial:"+1268"},{name:"Argentina",code:"AR",flag:"🇦🇷",dial:"+54"},{name:"Armenia",code:"AM",flag:"🇦🇲",dial:"+374"},{name:"Australia",code:"AU",flag:"🇦🇺",dial:"+61"},{name:"Austria",code:"AT",flag:"🇦🇹",dial:"+43"},{name:"Azerbaijan",code:"AZ",flag:"🇦🇿",dial:"+994"},{name:"Bahamas",code:"BS",flag:"🇧🇸",dial:"+1242"},{name:"Bahrain",code:"BH",flag:"🇧🇭",dial:"+973"},{name:"Bangladesh",code:"BD",flag:"🇧🇩",dial:"+880"},{name:"Barbados",code:"BB",flag:"🇧🇧",dial:"+1246"},{name:"Belarus",code:"BY",flag:"🇧🇾",dial:"+375"},{name:"Belgium",code:"BE",flag:"🇧🇪",dial:"+32"},{name:"Belize",code:"BZ",flag:"🇧🇿",dial:"+501"},{name:"Benin",code:"BJ",flag:"🇧🇯",dial:"+229"},{name:"Bhutan",code:"BT",flag:"🇧🇹",dial:"+975"},{name:"Bolivia",code:"BO",flag:"🇧🇴",dial:"+591"},{name:"Bosnia and Herzegovina",code:"BA",flag:"🇧🇦",dial:"+387"},{name:"Botswana",code:"BW",flag:"🇧🇼",dial:"+267"},{name:"Brazil",code:"BR",flag:"🇧🇷",dial:"+55"},{name:"Brunei",code:"BN",flag:"🇧🇳",dial:"+673"},{name:"Bulgaria",code:"BG",flag:"🇧🇬",dial:"+359"},{name:"Burkina Faso",code:"BF",flag:"🇧🇫",dial:"+226"},{name:"Burundi",code:"BI",flag:"🇧🇮",dial:"+257"},{name:"Cabo Verde",code:"CV",flag:"🇨🇻",dial:"+238"},{name:"Cambodia",code:"KH",flag:"🇰🇭",dial:"+855"},{name:"Cameroon",code:"CM",flag:"🇨🇲",dial:"+237"},{name:"Canada",code:"CA",flag:"🇨🇦",dial:"+1"},{name:"Central African Republic",code:"CF",flag:"🇨🇫",dial:"+236"},{name:"Chad",code:"TD",flag:"🇹🇩",dial:"+235"},{name:"Chile",code:"CL",flag:"🇨🇱",dial:"+56"},{name:"China",code:"CN",flag:"🇨🇳",dial:"+86"},{name:"Colombia",code:"CO",flag:"🇨🇴",dial:"+57"},{name:"Comoros",code:"KM",flag:"🇰🇲",dial:"+269"},{name:"Congo (DRC)",code:"CD",flag:"🇨🇩",dial:"+243"},{name:"Congo (Republic)",code:"CG",flag:"🇨🇬",dial:"+242"},{name:"Costa Rica",code:"CR",flag:"🇨🇷",dial:"+506"},{name:"Côte d'Ivoire",code:"CI",flag:"🇨🇮",dial:"+225"},{name:"Croatia",code:"HR",flag:"🇭🇷",dial:"+385"},{name:"Cuba",code:"CU",flag:"🇨🇺",dial:"+53"},{name:"Cyprus",code:"CY",flag:"🇨🇾",dial:"+357"},{name:"Czech Republic",code:"CZ",flag:"🇨🇿",dial:"+420"},{name:"Denmark",code:"DK",flag:"🇩🇰",dial:"+45"},{name:"Djibouti",code:"DJ",flag:"🇩🇯",dial:"+253"},{name:"Dominica",code:"DM",flag:"🇩🇲",dial:"+1767"},{name:"Dominican Republic",code:"DO",flag:"🇩🇴",dial:"+1809"},{name:"Ecuador",code:"EC",flag:"🇪🇨",dial:"+593"},{name:"Egypt",code:"EG",flag:"🇪🇬",dial:"+20"},{name:"El Salvador",code:"SV",flag:"🇸🇻",dial:"+503"},{name:"Equatorial Guinea",code:"GQ",flag:"🇬🇶",dial:"+240"},{name:"Eritrea",code:"ER",flag:"🇪🇷",dial:"+291"},{name:"Estonia",code:"EE",flag:"🇪🇪",dial:"+372"},{name:"Eswatini",code:"SZ",flag:"🇸🇿",dial:"+268"},{name:"Ethiopia",code:"ET",flag:"🇪🇹",dial:"+251"},{name:"Fiji",code:"FJ",flag:"🇫🇯",dial:"+679"},{name:"Finland",code:"FI",flag:"🇫🇮",dial:"+358"},{name:"France",code:"FR",flag:"🇫🇷",dial:"+33"},{name:"Gabon",code:"GA",flag:"🇬🇦",dial:"+241"},{name:"Gambia",code:"GM",flag:"🇬🇲",dial:"+220"},{name:"Georgia",code:"GE",flag:"🇬🇪",dial:"+995"},{name:"Germany",code:"DE",flag:"🇩🇪",dial:"+49"},{name:"Ghana",code:"GH",flag:"🇬🇭",dial:"+233"},{name:"Greece",code:"GR",flag:"🇬🇷",dial:"+30"},{name:"Grenada",code:"GD",flag:"🇬🇩",dial:"+1473"},{name:"Guatemala",code:"GT",flag:"🇬🇹",dial:"+502"},{name:"Guinea",code:"GN",flag:"🇬🇳",dial:"+224"},{name:"Guinea-Bissau",code:"GW",flag:"🇬🇼",dial:"+245"},{name:"Guyana",code:"GY",flag:"🇬🇾",dial:"+592"},{name:"Haiti",code:"HT",flag:"🇭🇹",dial:"+509"},{name:"Honduras",code:"HN",flag:"🇭🇳",dial:"+504"},{name:"Hong Kong",code:"HK",flag:"🇭🇰",dial:"+852"},{name:"Hungary",code:"HU",flag:"🇭🇺",dial:"+36"},{name:"Iceland",code:"IS",flag:"🇮🇸",dial:"+354"},{name:"India",code:"IN",flag:"🇮🇳",dial:"+91"},{name:"Indonesia",code:"ID",flag:"🇮🇩",dial:"+62"},{name:"Iran",code:"IR",flag:"🇮🇷",dial:"+98"},{name:"Iraq",code:"IQ",flag:"🇮🇶",dial:"+964"},{name:"Ireland",code:"IE",flag:"🇮🇪",dial:"+353"},{name:"Israel",code:"IL",flag:"🇮🇱",dial:"+972"},{name:"Italy",code:"IT",flag:"🇮🇹",dial:"+39"},{name:"Jamaica",code:"JM",flag:"🇯🇲",dial:"+1876"},{name:"Japan",code:"JP",flag:"🇯🇵",dial:"+81"},{name:"Jordan",code:"JO",flag:"🇯🇴",dial:"+962"},{name:"Kazakhstan",code:"KZ",flag:"🇰🇿",dial:"+7"},{name:"Kenya",code:"KE",flag:"🇰🇪",dial:"+254"},{name:"Kiribati",code:"KI",flag:"🇰🇮",dial:"+686"},{name:"Kosovo",code:"XK",flag:"🇽🇰",dial:"+383"},{name:"Kuwait",code:"KW",flag:"🇰🇼",dial:"+965"},{name:"Kyrgyzstan",code:"KG",flag:"🇰🇬",dial:"+996"},{name:"Laos",code:"LA",flag:"🇱🇦",dial:"+856"},{name:"Latvia",code:"LV",flag:"🇱🇻",dial:"+371"},{name:"Lebanon",code:"LB",flag:"🇱🇧",dial:"+961"},{name:"Lesotho",code:"LS",flag:"🇱🇸",dial:"+266"},{name:"Liberia",code:"LR",flag:"🇱🇷",dial:"+231"},{name:"Libya",code:"LY",flag:"🇱🇾",dial:"+218"},{name:"Liechtenstein",code:"LI",flag:"🇱🇮",dial:"+423"},{name:"Lithuania",code:"LT",flag:"🇱🇹",dial:"+370"},{name:"Luxembourg",code:"LU",flag:"🇱🇺",dial:"+352"},{name:"Macau",code:"MO",flag:"🇲🇴",dial:"+853"},{name:"Madagascar",code:"MG",flag:"🇲🇬",dial:"+261"},{name:"Malawi",code:"MW",flag:"🇲🇼",dial:"+265"},{name:"Malaysia",code:"MY",flag:"🇲🇾",dial:"+60"},{name:"Maldives",code:"MV",flag:"🇲🇻",dial:"+960"},{name:"Mali",code:"ML",flag:"🇲🇱",dial:"+223"},{name:"Malta",code:"MT",flag:"🇲🇹",dial:"+356"},{name:"Marshall Islands",code:"MH",flag:"🇲🇭",dial:"+692"},{name:"Mauritania",code:"MR",flag:"🇲🇷",dial:"+222"},{name:"Mauritius",code:"MU",flag:"🇲🇺",dial:"+230"},{name:"Mexico",code:"MX",flag:"🇲🇽",dial:"+52"},{name:"Micronesia",code:"FM",flag:"🇫🇲",dial:"+691"},{name:"Moldova",code:"MD",flag:"🇲🇩",dial:"+373"},{name:"Monaco",code:"MC",flag:"🇲🇨",dial:"+377"},{name:"Mongolia",code:"MN",flag:"🇲🇳",dial:"+976"},{name:"Montenegro",code:"ME",flag:"🇲🇪",dial:"+382"},{name:"Morocco",code:"MA",flag:"🇲🇦",dial:"+212"},{name:"Mozambique",code:"MZ",flag:"🇲🇿",dial:"+258"},{name:"Myanmar",code:"MM",flag:"🇲🇲",dial:"+95"},{name:"Namibia",code:"NA",flag:"🇳🇦",dial:"+264"},{name:"Nauru",code:"NR",flag:"🇳🇷",dial:"+674"},{name:"Nepal",code:"NP",flag:"🇳🇵",dial:"+977"},{name:"Netherlands",code:"NL",flag:"🇳🇱",dial:"+31"},{name:"New Zealand",code:"NZ",flag:"🇳🇿",dial:"+64"},{name:"Nicaragua",code:"NI",flag:"🇳🇮",dial:"+505"},{name:"Niger",code:"NE",flag:"🇳🇪",dial:"+227"},{name:"Nigeria",code:"NG",flag:"🇳🇬",dial:"+234"},{name:"North Korea",code:"KP",flag:"🇰🇵",dial:"+850"},{name:"North Macedonia",code:"MK",flag:"🇲🇰",dial:"+389"},{name:"Norway",code:"NO",flag:"🇳🇴",dial:"+47"},{name:"Oman",code:"OM",flag:"🇴🇲",dial:"+968"},{name:"Pakistan",code:"PK",flag:"🇵🇰",dial:"+92"},{name:"Palau",code:"PW",flag:"🇵🇼",dial:"+680"},{name:"Palestine",code:"PS",flag:"🇵🇸",dial:"+970"},{name:"Panama",code:"PA",flag:"🇵🇦",dial:"+507"},{name:"Papua New Guinea",code:"PG",flag:"🇵🇬",dial:"+675"},{name:"Paraguay",code:"PY",flag:"🇵🇾",dial:"+595"},{name:"Peru",code:"PE",flag:"🇵🇪",dial:"+51"},{name:"Philippines",code:"PH",flag:"🇵🇭",dial:"+63"},{name:"Poland",code:"PL",flag:"🇵🇱",dial:"+48"},{name:"Portugal",code:"PT",flag:"🇵🇹",dial:"+351"},{name:"Puerto Rico",code:"PR",flag:"🇵🇷",dial:"+1787"},{name:"Qatar",code:"QA",flag:"🇶🇦",dial:"+974"},{name:"Romania",code:"RO",flag:"🇷🇴",dial:"+40"},{name:"Russia",code:"RU",flag:"🇷🇺",dial:"+7"},{name:"Rwanda",code:"RW",flag:"🇷🇼",dial:"+250"},{name:"Saint Kitts and Nevis",code:"KN",flag:"🇰🇳",dial:"+1869"},{name:"Saint Lucia",code:"LC",flag:"🇱🇨",dial:"+1758"},{name:"Saint Vincent and the Grenadines",code:"VC",flag:"🇻🇨",dial:"+1784"},{name:"Samoa",code:"WS",flag:"🇼🇸",dial:"+685"},{name:"San Marino",code:"SM",flag:"🇸🇲",dial:"+378"},{name:"Sao Tome and Principe",code:"ST",flag:"🇸🇹",dial:"+239"},{name:"Saudi Arabia",code:"SA",flag:"🇸🇦",dial:"+966"},{name:"Senegal",code:"SN",flag:"🇸🇳",dial:"+221"},{name:"Serbia",code:"RS",flag:"🇷🇸",dial:"+381"},{name:"Seychelles",code:"SC",flag:"🇸🇨",dial:"+248"},{name:"Sierra Leone",code:"SL",flag:"🇸🇱",dial:"+232"},{name:"Singapore",code:"SG",flag:"🇸🇬",dial:"+65"},{name:"Slovakia",code:"SK",flag:"🇸🇰",dial:"+421"},{name:"Slovenia",code:"SI",flag:"🇸🇮",dial:"+386"},{name:"Solomon Islands",code:"SB",flag:"🇸🇧",dial:"+677"},{name:"Somalia",code:"SO",flag:"🇸🇴",dial:"+252"},{name:"South Africa",code:"ZA",flag:"🇿🇦",dial:"+27"},{name:"South Korea",code:"KR",flag:"🇰🇷",dial:"+82"},{name:"South Sudan",code:"SS",flag:"🇸🇸",dial:"+211"},{name:"Spain",code:"ES",flag:"🇪🇸",dial:"+34"},{name:"Sri Lanka",code:"LK",flag:"🇱🇰",dial:"+94"},{name:"Sudan",code:"SD",flag:"🇸🇩",dial:"+249"},{name:"Suriname",code:"SR",flag:"🇸🇷",dial:"+597"},{name:"Sweden",code:"SE",flag:"🇸🇪",dial:"+46"},{name:"Switzerland",code:"CH",flag:"🇨🇭",dial:"+41"},{name:"Syria",code:"SY",flag:"🇸🇾",dial:"+963"},{name:"Taiwan",code:"TW",flag:"🇹🇼",dial:"+886"},{name:"Tajikistan",code:"TJ",flag:"🇹🇯",dial:"+992"},{name:"Tanzania",code:"TZ",flag:"🇹🇿",dial:"+255"},{name:"Thailand",code:"TH",flag:"🇹🇭",dial:"+66"},{name:"Timor-Leste",code:"TL",flag:"🇹🇱",dial:"+670"},{name:"Togo",code:"TG",flag:"🇹🇬",dial:"+228"},{name:"Tonga",code:"TO",flag:"🇹🇴",dial:"+676"},{name:"Trinidad and Tobago",code:"TT",flag:"🇹🇹",dial:"+1868"},{name:"Tunisia",code:"TN",flag:"🇹🇳",dial:"+216"},{name:"Turkey",code:"TR",flag:"🇹🇷",dial:"+90"},{name:"Turkmenistan",code:"TM",flag:"🇹🇲",dial:"+993"},{name:"Tuvalu",code:"TV",flag:"🇹🇻",dial:"+688"},{name:"Uganda",code:"UG",flag:"🇺🇬",dial:"+256"},{name:"Ukraine",code:"UA",flag:"🇺🇦",dial:"+380"},{name:"United Arab Emirates",code:"AE",flag:"🇦🇪",dial:"+971"},{name:"United Kingdom",code:"GB",flag:"🇬🇧",dial:"+44"},{name:"United States",code:"US",flag:"🇺🇸",dial:"+1"},{name:"Uruguay",code:"UY",flag:"🇺🇾",dial:"+598"},{name:"Uzbekistan",code:"UZ",flag:"🇺🇿",dial:"+998"},{name:"Vanuatu",code:"VU",flag:"🇻🇺",dial:"+678"},{name:"Vatican City",code:"VA",flag:"🇻🇦",dial:"+379"},{name:"Venezuela",code:"VE",flag:"🇻🇪",dial:"+58"},{name:"Vietnam",code:"VN",flag:"🇻🇳",dial:"+84"},{name:"Yemen",code:"YE",flag:"🇾🇪",dial:"+967"},{name:"Zambia",code:"ZM",flag:"🇿🇲",dial:"+260"},{name:"Zimbabwe",code:"ZW",flag:"🇿🇼",dial:"+263"},
];

const PHONE_LENGTHS = {AF:[9],AL:[9],DZ:[9],AD:[6],AO:[9],AR:[10],AM:[8],AU:[9],AT:[10,11],AZ:[9],BS:[10],BH:[8],BD:[10],BB:[10],BY:[9],BE:[9],BZ:[7],BJ:[8],BT:[8],BO:[8],BA:[8],BW:[8],BR:[10,11],BN:[7],BG:[9],BF:[8],BI:[8],KH:[8,9],CM:[9],CA:[10],CV:[7],CF:[8],TD:[8],CL:[9],CN:[11],CO:[10],KM:[7],CD:[9],CG:[9],CR:[8],HR:[9],CU:[8],CY:[8],CZ:[9],DK:[8],DJ:[8],DM:[10],DO:[10],EC:[9],EG:[10],SV:[8],GQ:[9],ER:[7],EE:[7,8],SZ:[8],ET:[9],FJ:[7],FI:[9,10],FR:[9],GA:[8],GM:[7],GE:[9],DE:[10,11],GH:[9],GR:[10],GD:[10],GT:[8],GN:[9],GW:[9],GY:[7],HT:[8],HN:[8],HK:[8],HU:[9],IS:[7],IN:[10],ID:[9,10,11,12],IR:[10],IQ:[10],IE:[9],IL:[9],IT:[9,10],CI:[10],JM:[10],JP:[10],JO:[9],KZ:[10],KE:[9,10],KI:[8],XK:[8],KW:[8],KG:[9],LA:[9,10],LV:[8],LB:[7,8],LS:[8],LR:[8],LY:[9],LI:[7],LT:[8],LU:[9],MO:[8],MG:[9],MW:[9],MY:[9,10],MV:[7],ML:[8],MT:[8],MH:[7],MR:[8],MU:[8],MX:[10],FM:[7],MD:[8],MC:[8],MN:[8],ME:[8],MA:[9],MZ:[9],MM:[8,9,10],NA:[9],NR:[7],NP:[10],NL:[9],NZ:[8,9],NI:[8],NE:[8],NG:[10],KP:[10],MK:[8],NO:[8],OM:[8],PK:[10],PW:[7],PS:[9],PA:[8],PG:[8],PY:[9],PE:[9],PH:[10],PL:[9],PT:[9],PR:[10],QA:[8],RO:[9],RU:[10],RW:[9],KN:[10],LC:[10],VC:[10],WS:[7],SM:[10],ST:[7],SA:[9],SN:[9],RS:[8,9],SC:[7],SL:[8],SG:[8],SK:[9],SI:[8],SB:[7],SO:[8],ZA:[9],KR:[9,10],SS:[9],ES:[9],LK:[9],SD:[9],SR:[7],SE:[9],CH:[9],SY:[9],TW:[9],TJ:[9],TZ:[9],TH:[9],TL:[7,8],TG:[8],TO:[5,7],TT:[10],TN:[8],TR:[10],TM:[8],TV:[5],UG:[9],UA:[9],AE:[9],GB:[10],US:[10],UY:[8,9],UZ:[9],VU:[7],VA:[10],VE:[10],VN:[9,10],YE:[9],ZM:[9],ZW:[9]};

/* ─────────────────────────────────────────────
   VALIDATION HELPERS
───────────────────────────────────────────── */
const isValidName  = (v) => v.trim().length >= 6 && v.trim().includes(" ");
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isValidPhone = (v) => v.replace(/\D/g,"").length >= 5;
const isValidPass  = (v) => v.length >= 6;

/* ─────────────────────────────────────────────
   FADE WRAPPER
───────────────────────────────────────────── */
const Fade = ({ show, children, delay = 0 }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity:0, y:20, filter:"blur(8px)" }}
        animate={{ opacity:1, y:0,  filter:"blur(0px)" }}
        exit={{    opacity:0, y:-8, filter:"blur(4px)" }}
        transition={{ duration:0.6, delay, ease:[0.22,1,0.36,1] }}>
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─────────────────────────────────────────────
   FIELD SHELL
───────────────────────────────────────────── */
const Field = ({ icon: Icon, children }) => (
  <div className="relative group">
    {Icon && <Icon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 text-white/25 group-focus-within:text-emerald-400 z-10" />}
    {children}
  </div>
);

/* ─────────────────────────────────────────────
   NEXT HINT — subtle animated nudge
───────────────────────────────────────────── */
const NextHint = ({ show, label = "Keep going…" }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity:0, y:4 }}
        animate={{ opacity:1, y:0 }}
        exit={{ opacity:0, y:-4 }}
        transition={{ duration:0.4 }}
        className="flex items-center gap-1.5 mt-1.5 ml-1">
        <motion.div
          animate={{ x:[0,4,0] }}
          transition={{ repeat:Infinity, duration:1.4, ease:"easeInOut" }}>
          <ChevronRight size={11} style={{ color:"var(--em)" }} />
        </motion.div>
        <span className="text-[10px] font-light tracking-wider" style={{ color:"rgba(16,185,129,.5)" }}>{label}</span>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─────────────────────────────────────────────
   PROGRESS BAR
───────────────────────────────────────────── */
const ProgressBar = ({ step, total }) => {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[9px] font-medium tracking-[.2em] uppercase" style={{ color:"rgba(255,255,255,.25)" }}>Progress</span>
        <span className="text-[9px] font-semibold" style={{ color:"var(--em)" }}>{pct}%</span>
      </div>
      <div className="h-[2px] w-full" style={{ background:"rgba(255,255,255,.06)" }}>
        <motion.div className="h-full" style={{ background:"linear-gradient(90deg,var(--em),var(--teal))" }}
          animate={{ width:`${pct}%` }}
          transition={{ duration:0.6, ease:[0.22,1,0.36,1] }} />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function Register() {
  const { t } = useTranslation();
  const API_URL = "https://mexicatradingbackend.onrender.com";
  const navigate = useNavigate();
  const location = useLocation();
  const refCode  = new URLSearchParams(location.search).get("ref") || "";

  const [form, setForm] = useState({
    name:"", email:"", phoneNumber:"", password:"", confirmPassword:"", referralCode:refCode
  });
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryOpen,     setCountryOpen]     = useState(false);
  const [countrySearch,   setCountrySearch]   = useState("");
  const [agreedToTerms,   setAgreedToTerms]   = useState(false);
  const [error,           setError]           = useState("");
  const [loading,         setLoading]         = useState(false);
  const [showPass,        setShowPass]        = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [success,         setSuccess]         = useState(false);

  /* reveal flags */
  const [showEmail,    setShowEmail]    = useState(false);
  const [showCountry,  setShowCountry]  = useState(false);
  const [showPhone,    setShowPhone]    = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmF, setShowConfirmF] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [showTerms,    setShowTerms]    = useState(false);

  /* refs for auto-focus */
  const emailRef   = useRef(null);
  const phoneRef   = useRef(null);
  const passRef    = useRef(null);
  const confirmRef = useRef(null);
  const bottomRef  = useRef(null);

  const focus  = (ref, delay = 650) => setTimeout(() => ref.current?.focus(), delay);
  const scroll = (delay = 120)      => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:"smooth", block:"end" }), delay);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  /* ── AUTO-REVEAL EFFECTS (fire while typing, no blur needed) ── */

  /* Name → Email: 6+ chars AND contains a space (first + last name) */
  useEffect(() => {
    if (!showEmail && isValidName(form.name)) {
      setShowEmail(true);
      focus(emailRef);
      scroll();
    }
  }, [form.name]);

  /* Email → Country: valid email format */
  useEffect(() => {
    if (!showCountry && isValidEmail(form.email)) {
      setShowCountry(true);
      scroll();
    }
  }, [form.email]);

  /* Phone → Password: 5+ digits typed */
  useEffect(() => {
    if (!showPassword && showPhone && isValidPhone(form.phoneNumber)) {
      setShowPassword(true);
      focus(passRef);
      scroll();
    }
  }, [form.phoneNumber]);

  /* Password → Confirm: 6+ chars */
  useEffect(() => {
    if (!showConfirmF && isValidPass(form.password)) {
      setShowConfirmF(true);
      focus(confirmRef);
      scroll();
    }
  }, [form.password]);

  /* Confirm → Referral + Terms: 6+ chars */
  useEffect(() => {
    if (!showReferral && form.confirmPassword.length >= 6) {
      setShowReferral(true);
      scroll();
      setTimeout(() => { setShowTerms(true); scroll(200); }, 350);
    }
  }, [form.confirmPassword]);

  /* Country select → Phone */
  const onCountrySelect = (c) => {
    setSelectedCountry(c);
    setCountryOpen(false);
    setCountrySearch("");
    setError("");
    if (!showPhone) {
      setShowPhone(true);
      focus(phoneRef);
      scroll();
    }
  };

  /* progress step 0–7 */
  const step = showTerms ? 7 : showReferral ? 6 : showConfirmF ? 5 : showPassword ? 4 : showPhone ? 3 : showCountry ? 2 : showEmail ? 1 : 0;

  /* phone validation */
  const validatePhone = () => {
    if (!form.phoneNumber.trim()) return "Phone number is required.";
    if (!selectedCountry)        return "Please select your country first.";
    const digits   = form.phoneNumber.replace(/\D/g,"");
    const expected = PHONE_LENGTHS[selectedCountry.code] || [];
    if (!expected.length) { return digits.length < 6 || digits.length > 15 ? `Enter a valid phone number for ${selectedCountry.name}.` : null; }
    if (!expected.includes(digits.length)) {
      const range = expected.length === 1 ? `${expected[0]} digits` : `${expected.join(" or ")} digits`;
      return `Phone for ${selectedCountry.name} must be ${range}. You entered ${digits.length}.`;
    }
    return null;
  };

  /* submit */
  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (!isValidName(form.name))        return setError("Please enter your full name (first and last).");
    if (!isValidEmail(form.email))      return setError("Please enter a valid email address.");
    if (!selectedCountry)               return setError("Please select your country.");
    const phoneErr = validatePhone();
    if (phoneErr)                        return setError(phoneErr);
    if (!isValidPass(form.password))    return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    if (!agreedToTerms)                 return setError("You must agree to the Terms and Privacy Policy.");
    const fullPhone = `${selectedCountry.dial} ${form.phoneNumber.trim()}`;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        name:form.name, email:form.email, phone:fullPhone,
        country:selectedCountry.name, password:form.password, referralCode:form.referralCode,
      });
      if (res.data.token) {
        sessionStorage.setItem("token", res.data.token);
        setSuccess(true);
        setTimeout(() => navigate("/login"), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  const inp = "w-full pl-11 pr-4 py-4 bg-white/[0.03] border border-white/[0.08] outline-none text-sm text-white placeholder:text-white/25 transition-all duration-300 focus:border-emerald-500/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]";
  const done = "border-emerald-500/25 bg-emerald-500/[0.04]";

  return (
    <div className="relative flex flex-col items-center justify-start min-h-screen bg-[#080c18] text-white overflow-x-hidden px-4 py-12"
      style={{ fontFamily:"'Montserrat',sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Montserrat:wght@300;400;500;600;700&display=swap');
        :root{--em:#10b981;--teal:#14b8a6;}
        .serif{font-family:'Cormorant Garamond',serif;}
        ::selection{background:var(--em);color:#080c18;}
        @keyframes orb{0%,100%{opacity:.06}50%{opacity:.13}}
        .orb{animation:orb 7s ease-in-out infinite;}
        @keyframes scan{from{top:-30%}to{top:110%}}
        .scan{animation:scan 10s ease-in-out infinite;}
        @keyframes shine{0%{background-position:200% center}100%{background-position:-200% center}}
        .top-line{background:linear-gradient(90deg,transparent,var(--em) 40%,var(--teal) 60%,transparent);background-size:400% 100%;animation:shine 3s linear infinite;}
        .grid-bg{background-image:linear-gradient(rgba(16,185,129,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,.03) 1px,transparent 1px);background-size:72px 72px;}
        .btn-prime{background:linear-gradient(135deg,var(--em),var(--teal));transition:transform .3s,box-shadow .3s;position:relative;overflow:hidden;}
        .btn-prime::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.15),transparent);opacity:0;transition:opacity .3s;}
        .btn-prime:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 0 0 1px var(--em),0 16px 40px rgba(16,185,129,.35);}
        .btn-prime:hover:not(:disabled)::before{opacity:1;}
        .shine-badge{border:1px solid transparent;background:linear-gradient(#080c18,#080c18) padding-box,linear-gradient(90deg,transparent 20%,var(--em) 50%,transparent 80%) border-box;background-size:200% auto;animation:shine 4s linear infinite;}
        .nav-link{color:rgba(255,255,255,.35);transition:color .3s;}
        .nav-link:hover{color:var(--em);}
        .c-row{transition:background .2s;}
        .c-row:hover{background:rgba(16,185,129,.08);}
        .c-row.sel{background:rgba(16,185,129,.1);}
      `}</style>

      {/* Top shimmer */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[2px]"><div className="top-line h-full w-full" /></div>

      {/* BG */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="grid-bg absolute inset-0" />
        <div className="orb absolute rounded-full" style={{width:800,height:800,background:"radial-gradient(circle,rgba(16,185,129,.09) 0%,transparent 70%)",top:"-300px",left:"-300px"}} />
        <div className="orb absolute rounded-full" style={{width:600,height:600,background:"radial-gradient(circle,rgba(20,184,166,.07) 0%,transparent 70%)",bottom:"-200px",right:"-200px",animationDelay:"3.5s"}} />
        <div className="absolute left-[5%] top-0 bottom-0 w-px hidden lg:block" style={{background:"linear-gradient(to bottom,transparent 5%,rgba(16,185,129,.15) 40%,rgba(16,185,129,.3) 60%,transparent 95%)"}} />
        <div className="scan absolute left-[5%] w-px hidden lg:block" style={{height:"28%",background:"linear-gradient(to bottom,transparent,var(--em),transparent)"}} />
        <div className="absolute right-[5%] top-0 bottom-0 w-px hidden lg:block" style={{background:"linear-gradient(to bottom,transparent 5%,rgba(20,184,166,.1) 40%,rgba(20,184,166,.22) 60%,transparent 95%)"}} />
      </div>

      {/* Back */}
      <Link to="/" className="nav-link absolute top-7 left-8 text-[10px] font-medium tracking-[.2em] uppercase flex items-center gap-2 z-20">
        ← <span className="serif text-base font-light" style={{color:"var(--em)"}}>Mexica<em className="not-italic text-white">Trading</em></span>
      </Link>

      <div className="relative w-full max-w-md z-10 mt-8">
        <AnimatePresence mode="wait">

          {/* ══ SUCCESS ══ */}
          {success ? (
            <motion.div key="ok" initial={{opacity:0,scale:.96}} animate={{opacity:1,scale:1}} exit={{opacity:0}}
              className="px-8 py-10 flex flex-col items-center text-center gap-6"
              style={{background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.07)",backdropFilter:"blur(24px)"}}>
              <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",stiffness:220,delay:.2}}
                className="w-20 h-20 flex items-center justify-center border"
                style={{borderColor:"rgba(16,185,129,.4)",background:"rgba(16,185,129,.1)"}}>
                <CheckCircle size={36} style={{color:"var(--em)"}} />
              </motion.div>
              <div>
                <h2 className="serif font-light mb-2 text-white" style={{fontSize:"clamp(28px,5vw,38px)"}}>
                  Account <em style={{fontStyle:"italic",color:"var(--em)"}}>Created!</em>
                </h2>
                <p className="text-sm font-light" style={{color:"rgba(255,255,255,.4)"}}>We sent a verification email to</p>
                <p className="font-semibold text-sm mt-1" style={{color:"var(--em)"}}>{form.email}</p>
              </div>
              <div className="w-full px-5 py-4 border" style={{borderColor:"rgba(16,185,129,.2)",background:"rgba(16,185,129,.06)"}}>
                <p className="text-sm font-light leading-relaxed" style={{color:"rgba(255,255,255,.4)"}}>
                  📧 Check your inbox and click the verification link to activate your account.
                </p>
              </div>
              <button onClick={()=>navigate("/login")} className="btn-prime w-full py-4 text-[11px] font-semibold tracking-[.2em] uppercase text-white flex items-center justify-center gap-3">
                Go to Login <ArrowRight size={14} />
              </button>
            </motion.div>

          ) : (

          /* ══ FORM ══ */
          <motion.div key="form" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.7,ease:[.22,1,.36,1]}}>
            <div className="px-8 py-9" style={{background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.07)",backdropFilter:"blur(24px)"}}>

              {/* Referral banner */}
              {refCode && (
                <div className="mb-6 px-4 py-3 border text-center text-xs font-medium tracking-wider flex items-center justify-center gap-2"
                  style={{borderColor:"rgba(16,185,129,.25)",background:"rgba(16,185,129,.07)",color:"var(--em)"}}>
                  <Gift size={12}/> Referral code applied · <strong className="font-mono">{refCode}</strong>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-8">
                <div className="shine-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-semibold tracking-[.28em] uppercase mb-5" style={{color:"var(--em)"}}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:"var(--em)"}} />
                  Secure Registration
                </div>
                <h2 className="serif font-light text-white mb-2" style={{fontSize:"clamp(28px,5vw,40px)",lineHeight:1.1}}>
                  Create Your{" "}
                  <em style={{fontStyle:"italic",background:"linear-gradient(135deg,var(--em),var(--teal))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Account</em>
                </h2>
                <p className="text-xs font-light tracking-wide" style={{color:"rgba(255,255,255,.35)"}}>
                  Just start typing — each field unlocks automatically.
                </p>
              </div>

              {/* Progress bar */}
              <ProgressBar step={step} total={7} />

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                    className="mb-5 flex items-start gap-2.5 text-xs px-4 py-3 border"
                    style={{background:"rgba(239,68,68,.07)",borderColor:"rgba(239,68,68,.2)",color:"#f87171"}}>
                    <AlertTriangle size={12} className="shrink-0 mt-0.5"/><span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit}>
                <div className="space-y-3">

                  {/* ── 1. NAME ── always visible */}
                  <div>
                    <Field icon={User}>
                      <input type="text" name="name" value={form.name} onChange={handleChange}
                        placeholder="Full Name (first and last)"
                        className={`${inp} ${isValidName(form.name) ? done : ""}`}
                        autoFocus autoComplete="name" />
                      {isValidName(form.name) && <CheckCircle size={13} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:"var(--em)"}} />}
                    </Field>
                    {/* Hint: shows while typing but name not yet valid */}
                    <NextHint show={form.name.length > 0 && !isValidName(form.name)} label="Enter your first and last name" />
                  </div>

                  {/* ── 2. EMAIL ── */}
                  <Fade show={showEmail}>
                    <div>
                      <Field icon={Mail}>
                        <input ref={emailRef} type="email" name="email" value={form.email} onChange={handleChange}
                          placeholder="Email Address"
                          className={`${inp} ${isValidEmail(form.email) ? done : ""}`}
                          autoComplete="email" />
                        {isValidEmail(form.email) && <CheckCircle size={13} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:"var(--em)"}} />}
                      </Field>
                      <NextHint show={form.email.length > 0 && !isValidEmail(form.email)} label="Enter a valid email address" />
                    </div>
                  </Fade>

                  {/* ── 3. COUNTRY ── */}
                  <Fade show={showCountry}>
                    <div className="relative">
                      <button type="button" onClick={()=>setCountryOpen(!countryOpen)}
                        className={`w-full flex items-center justify-between px-4 py-4 border text-sm text-left transition-all duration-300 ${selectedCountry ? done : ""}`}
                        style={{background:"rgba(255,255,255,.03)",borderColor:countryOpen?"rgba(16,185,129,.5)":selectedCountry?"rgba(16,185,129,.25)":"rgba(255,255,255,.08)"}}>
                        {selectedCountry ? (
                          <span className="flex items-center gap-3 text-white">
                            <span className="text-lg leading-none">{selectedCountry.flag}</span>
                            <span className="truncate">{selectedCountry.name}</span>
                            <span className="font-mono text-xs ml-auto pr-2" style={{color:"var(--em)"}}>{selectedCountry.dial}</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-3" style={{color:"rgba(255,255,255,.25)"}}>
                            <Globe size={14}/> Select Your Country
                          </span>
                        )}
                        <ChevronDown size={14} style={{color:"rgba(255,255,255,.3)",transform:countryOpen?"rotate(180deg)":"none",transition:"transform .3s"}} />
                      </button>
                      <AnimatePresence>
                        {countryOpen && (
                          <motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:.2}}
                            className="absolute top-full mt-1.5 left-0 right-0 z-50 border shadow-2xl max-h-64 overflow-hidden flex flex-col"
                            style={{background:"#0d1120",borderColor:"rgba(16,185,129,.2)"}}>
                            <div className="p-2.5 border-b" style={{borderColor:"rgba(255,255,255,.06)"}}>
                              <div className="relative">
                                <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:"rgba(255,255,255,.25)"}} />
                                <input type="text" placeholder="Search country or dial code..."
                                  value={countrySearch} onChange={e=>setCountrySearch(e.target.value)}
                                  className="w-full pl-8 pr-3 py-2 text-xs text-white outline-none"
                                  style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)"}}
                                  autoFocus />
                              </div>
                            </div>
                            <div className="overflow-y-auto flex-1">
                              {COUNTRIES.filter(c=>c.name.toLowerCase().includes(countrySearch.toLowerCase())||c.dial.includes(countrySearch)).map(c=>(
                                <button key={c.code} type="button" onClick={()=>onCountrySelect(c)}
                                  className={`c-row w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left ${selectedCountry?.code===c.code?"sel":""}`}>
                                  <span className="text-base leading-none">{c.flag}</span>
                                  <span className="text-white flex-1 truncate">{c.name}</span>
                                  <span className="font-mono text-xs" style={{color:"rgba(16,185,129,.6)"}}>{c.dial}</span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <NextHint show={showCountry && !selectedCountry} label="Select your country to continue" />
                    </div>
                  </Fade>

                  {/* ── 4. PHONE ── */}
                  <Fade show={showPhone}>
                    <div>
                      <div className="flex gap-2">
                        <div className="px-3 py-4 border flex items-center gap-1.5 shrink-0 min-w-[88px] justify-center"
                          style={{background:"rgba(16,185,129,.06)",borderColor:"rgba(16,185,129,.25)"}}>
                          <span className="text-base leading-none">{selectedCountry?.flag}</span>
                          <span className="font-bold font-mono text-sm" style={{color:"var(--em)"}}>{selectedCountry?.dial}</span>
                        </div>
                        <Field icon={Phone}>
                          <input ref={phoneRef} type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange}
                            placeholder="Phone number"
                            className={`${inp} ${isValidPhone(form.phoneNumber) ? done : ""}`} />
                          {isValidPhone(form.phoneNumber) && <CheckCircle size={13} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:"var(--em)"}} />}
                        </Field>
                      </div>
                      {form.phoneNumber && (
                        <p className="text-[11px] mt-1.5 ml-1 font-light" style={{color:"rgba(255,255,255,.28)"}}>
                          Saved as: <span className="font-mono" style={{color:"var(--em)"}}>{selectedCountry?.dial} {form.phoneNumber}</span>
                        </p>
                      )}
                      <NextHint show={form.phoneNumber.length > 0 && !isValidPhone(form.phoneNumber)} label="Enter your phone number" />
                    </div>
                  </Fade>

                  {/* ── 5. PASSWORD ── */}
                  <Fade show={showPassword}>
                    <div>
                      <Field icon={Lock}>
                        <input ref={passRef} type={showPass?"text":"password"} name="password" value={form.password}
                          onChange={handleChange} placeholder="Password (min 6 characters)"
                          className={`${inp} pr-11 ${isValidPass(form.password) ? done : ""}`} />
                        <button type="button" onClick={()=>setShowPass(!showPass)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 transition-colors duration-300"
                          style={{color:"rgba(255,255,255,.25)"}}>
                          {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                        </button>
                      </Field>
                      <NextHint show={form.password.length > 0 && !isValidPass(form.password)} label="At least 6 characters" />
                    </div>
                  </Fade>

                  {/* ── 6. CONFIRM PASSWORD ── */}
                  <Fade show={showConfirmF}>
                    <div>
                      <Field icon={Lock}>
                        <input ref={confirmRef} type={showConfirm?"text":"password"} name="confirmPassword"
                          value={form.confirmPassword} onChange={handleChange} placeholder="Confirm Password"
                          className={`${inp} pr-11 ${form.confirmPassword.length>=6 && form.password===form.confirmPassword ? done : ""}`} />
                        <button type="button" onClick={()=>setShowConfirm(!showConfirm)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
                          style={{color:"rgba(255,255,255,.25)"}}>
                          {showConfirm ? <EyeOff size={14}/> : <Eye size={14}/>}
                        </button>
                      </Field>
                      {form.confirmPassword.length > 0 && (
                        <motion.p initial={{opacity:0}} animate={{opacity:1}}
                          className={`text-[11px] flex items-center gap-1.5 mt-1.5 ml-1 ${form.password===form.confirmPassword?"text-emerald-400":"text-red-400"}`}>
                          {form.password===form.confirmPassword
                            ? <><CheckCircle size={11}/>Passwords match — looking good!</>
                            : <><AlertTriangle size={11}/>Passwords don't match yet</>}
                        </motion.p>
                      )}
                    </div>
                  </Fade>

                  {/* ── 7. REFERRAL ── */}
                  <Fade show={showReferral && !refCode} delay={0.05}>
                    <div className="relative">
                      <Gift size={14} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10" style={{color:"rgba(255,255,255,.25)"}} />
                      <input type="text" name="referralCode" value={form.referralCode} onChange={handleChange}
                        placeholder="Referral Code (Optional)"
                        className={`${inp} pl-11`} />
                    </div>
                  </Fade>

                  {/* ── TERMS + SUBMIT ── */}
                  <Fade show={showTerms} delay={0.1}>
                    <div className="space-y-3 pt-1">
                      <label className="flex items-start gap-3 px-4 py-4 border cursor-pointer transition-all duration-300 select-none"
                        style={{background:agreedToTerms?"rgba(16,185,129,.05)":"rgba(255,255,255,.02)",borderColor:agreedToTerms?"rgba(16,185,129,.3)":"rgba(255,255,255,.07)"}}>
                        <input type="checkbox" checked={agreedToTerms} onChange={e=>setAgreedToTerms(e.target.checked)}
                          className="mt-0.5 w-4 h-4 cursor-pointer shrink-0 accent-emerald-500" />
                        <span className="text-xs font-light leading-relaxed" style={{color:"rgba(255,255,255,.45)"}}>
                          I agree to the{" "}
                          <Link to="/terms" target="_blank" className="font-semibold hover:underline" style={{color:"var(--em)"}}>Terms of Service</Link>
                          {" "}and{" "}
                          <Link to="/privacy" target="_blank" className="font-semibold hover:underline" style={{color:"var(--em)"}}>Privacy Policy</Link>
                        </span>
                      </label>

                      <button type="submit" disabled={loading||!agreedToTerms}
                        className="btn-prime group w-full py-4 text-[11px] font-semibold tracking-[.2em] uppercase text-white flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading
                          ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Creating Account...</>
                          : <>Create Account <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300"/></>}
                      </button>
                    </div>
                  </Fade>

                </div>
              </form>

              {/* Sign in */}
              <div className="mt-7">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px" style={{background:"rgba(255,255,255,.07)"}} />
                  <span className="text-[10px] font-light tracking-wider" style={{color:"rgba(255,255,255,.2)"}}>Already have an account?</span>
                  <div className="flex-1 h-px" style={{background:"rgba(255,255,255,.07)"}} />
                </div>
                <button onClick={()=>navigate("/login")}
                  className="w-full py-3.5 border text-[11px] font-medium tracking-[.18em] uppercase transition-all duration-300"
                  style={{borderColor:"rgba(255,255,255,.08)",background:"rgba(255,255,255,.02)",color:"rgba(255,255,255,.4)"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(16,185,129,.3)";e.currentTarget.style.color="var(--em)";e.currentTarget.style.background="rgba(16,185,129,.05)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.08)";e.currentTarget.style.color="rgba(255,255,255,.4)";e.currentTarget.style.background="rgba(255,255,255,.02)";}}>
                  Sign In
                </button>
              </div>
            </div>

            {/* Trust */}
            <div className="flex items-center justify-center gap-6 mt-5">
              {["🔒 SSL Secured","🛡️ Data Protected","⚡ Instant Access"].map((txt,i)=>(
                <span key={i} className="text-[10px] font-light tracking-wider" style={{color:"rgba(255,255,255,.18)"}}>{txt}</span>
              ))}
            </div>
          </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
