import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Lock, Phone, Globe, ArrowRight,
  Eye, EyeOff, Check, AlertTriangle, ChevronDown, Search, Gift,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { T, ThemeStyles, Button, Spinner, Banner, inputStyle } from "./system.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com";
const c = T.color;

/* ─────────────────────────────────────────────
   COUNTRIES
───────────────────────────────────────────── */
const COUNTRIES = [
  {name:"Afghanistan",code:"AF",flag:"🇦🇫",dial:"+93"},{name:"Albania",code:"AL",flag:"🇦🇱",dial:"+355"},{name:"Algeria",code:"DZ",flag:"🇩🇿",dial:"+213"},{name:"Andorra",code:"AD",flag:"🇦🇩",dial:"+376"},{name:"Angola",code:"AO",flag:"🇦🇴",dial:"+244"},{name:"Antigua and Barbuda",code:"AG",flag:"🇦🇬",dial:"+1268"},{name:"Argentina",code:"AR",flag:"🇦🇷",dial:"+54"},{name:"Armenia",code:"AM",flag:"🇦🇲",dial:"+374"},{name:"Australia",code:"AU",flag:"🇦🇺",dial:"+61"},{name:"Austria",code:"AT",flag:"🇦🇹",dial:"+43"},{name:"Azerbaijan",code:"AZ",flag:"🇦🇿",dial:"+994"},{name:"Bahamas",code:"BS",flag:"🇧🇸",dial:"+1242"},{name:"Bahrain",code:"BH",flag:"🇧🇭",dial:"+973"},{name:"Bangladesh",code:"BD",flag:"🇧🇩",dial:"+880"},{name:"Barbados",code:"BB",flag:"🇧🇧",dial:"+1246"},{name:"Belarus",code:"BY",flag:"🇧🇾",dial:"+375"},{name:"Belgium",code:"BE",flag:"🇧🇪",dial:"+32"},{name:"Belize",code:"BZ",flag:"🇧🇿",dial:"+501"},{name:"Benin",code:"BJ",flag:"🇧🇯",dial:"+229"},{name:"Bhutan",code:"BT",flag:"🇧🇹",dial:"+975"},{name:"Bolivia",code:"BO",flag:"🇧🇴",dial:"+591"},{name:"Bosnia and Herzegovina",code:"BA",flag:"🇧🇦",dial:"+387"},{name:"Botswana",code:"BW",flag:"🇧🇼",dial:"+267"},{name:"Brazil",code:"BR",flag:"🇧🇷",dial:"+55"},{name:"Brunei",code:"BN",flag:"🇧🇳",dial:"+673"},{name:"Bulgaria",code:"BG",flag:"🇧🇬",dial:"+359"},{name:"Burkina Faso",code:"BF",flag:"🇧🇫",dial:"+226"},{name:"Burundi",code:"BI",flag:"🇧🇮",dial:"+257"},{name:"Cabo Verde",code:"CV",flag:"🇨🇻",dial:"+238"},{name:"Cambodia",code:"KH",flag:"🇰🇭",dial:"+855"},{name:"Cameroon",code:"CM",flag:"🇨🇲",dial:"+237"},{name:"Canada",code:"CA",flag:"🇨🇦",dial:"+1"},{name:"Central African Republic",code:"CF",flag:"🇨🇫",dial:"+236"},{name:"Chad",code:"TD",flag:"🇹🇩",dial:"+235"},{name:"Chile",code:"CL",flag:"🇨🇱",dial:"+56"},{name:"China",code:"CN",flag:"🇨🇳",dial:"+86"},{name:"Colombia",code:"CO",flag:"🇨🇴",dial:"+57"},{name:"Comoros",code:"KM",flag:"🇰🇲",dial:"+269"},{name:"Congo (DRC)",code:"CD",flag:"🇨🇩",dial:"+243"},{name:"Congo (Republic)",code:"CG",flag:"🇨🇬",dial:"+242"},{name:"Costa Rica",code:"CR",flag:"🇨🇷",dial:"+506"},{name:"Côte d'Ivoire",code:"CI",flag:"🇨🇮",dial:"+225"},{name:"Croatia",code:"HR",flag:"🇭🇷",dial:"+385"},{name:"Cuba",code:"CU",flag:"🇨🇺",dial:"+53"},{name:"Cyprus",code:"CY",flag:"🇨🇾",dial:"+357"},{name:"Czech Republic",code:"CZ",flag:"🇨🇿",dial:"+420"},{name:"Denmark",code:"DK",flag:"🇩🇰",dial:"+45"},{name:"Djibouti",code:"DJ",flag:"🇩🇯",dial:"+253"},{name:"Dominica",code:"DM",flag:"🇩🇲",dial:"+1767"},{name:"Dominican Republic",code:"DO",flag:"🇩🇴",dial:"+1809"},{name:"Ecuador",code:"EC",flag:"🇪🇨",dial:"+593"},{name:"Egypt",code:"EG",flag:"🇪🇬",dial:"+20"},{name:"El Salvador",code:"SV",flag:"🇸🇻",dial:"+503"},{name:"Equatorial Guinea",code:"GQ",flag:"🇬🇶",dial:"+240"},{name:"Eritrea",code:"ER",flag:"🇪🇷",dial:"+291"},{name:"Estonia",code:"EE",flag:"🇪🇪",dial:"+372"},{name:"Eswatini",code:"SZ",flag:"🇸🇿",dial:"+268"},{name:"Ethiopia",code:"ET",flag:"🇪🇹",dial:"+251"},{name:"Fiji",code:"FJ",flag:"🇫🇯",dial:"+679"},{name:"Finland",code:"FI",flag:"🇫🇮",dial:"+358"},{name:"France",code:"FR",flag:"🇫🇷",dial:"+33"},{name:"Gabon",code:"GA",flag:"🇬🇦",dial:"+241"},{name:"Gambia",code:"GM",flag:"🇬🇲",dial:"+220"},{name:"Georgia",code:"GE",flag:"🇬🇪",dial:"+995"},{name:"Germany",code:"DE",flag:"🇩🇪",dial:"+49"},{name:"Ghana",code:"GH",flag:"🇬🇭",dial:"+233"},{name:"Greece",code:"GR",flag:"🇬🇷",dial:"+30"},{name:"Grenada",code:"GD",flag:"🇬🇩",dial:"+1473"},{name:"Guatemala",code:"GT",flag:"🇬🇹",dial:"+502"},{name:"Guinea",code:"GN",flag:"🇬🇳",dial:"+224"},{name:"Guinea-Bissau",code:"GW",flag:"🇬🇼",dial:"+245"},{name:"Guyana",code:"GY",flag:"🇬🇾",dial:"+592"},{name:"Haiti",code:"HT",flag:"🇭🇹",dial:"+509"},{name:"Honduras",code:"HN",flag:"🇭🇳",dial:"+504"},{name:"Hong Kong",code:"HK",flag:"🇭🇰",dial:"+852"},{name:"Hungary",code:"HU",flag:"🇭🇺",dial:"+36"},{name:"Iceland",code:"IS",flag:"🇮🇸",dial:"+354"},{name:"India",code:"IN",flag:"🇮🇳",dial:"+91"},{name:"Indonesia",code:"ID",flag:"🇮🇩",dial:"+62"},{name:"Iran",code:"IR",flag:"🇮🇷",dial:"+98"},{name:"Iraq",code:"IQ",flag:"🇮🇶",dial:"+964"},{name:"Ireland",code:"IE",flag:"🇮🇪",dial:"+353"},{name:"Israel",code:"IL",flag:"🇮🇱",dial:"+972"},{name:"Italy",code:"IT",flag:"🇮🇹",dial:"+39"},{name:"Jamaica",code:"JM",flag:"🇯🇲",dial:"+1876"},{name:"Japan",code:"JP",flag:"🇯🇵",dial:"+81"},{name:"Jordan",code:"JO",flag:"🇯🇴",dial:"+962"},{name:"Kazakhstan",code:"KZ",flag:"🇰🇿",dial:"+7"},{name:"Kenya",code:"KE",flag:"🇰🇪",dial:"+254"},{name:"Kiribati",code:"KI",flag:"🇰🇮",dial:"+686"},{name:"Kosovo",code:"XK",flag:"🇽🇰",dial:"+383"},{name:"Kuwait",code:"KW",flag:"🇰🇼",dial:"+965"},{name:"Kyrgyzstan",code:"KG",flag:"🇰🇬",dial:"+996"},{name:"Laos",code:"LA",flag:"🇱🇦",dial:"+856"},{name:"Latvia",code:"LV",flag:"🇱🇻",dial:"+371"},{name:"Lebanon",code:"LB",flag:"🇱🇧",dial:"+961"},{name:"Lesotho",code:"LS",flag:"🇱🇸",dial:"+266"},{name:"Liberia",code:"LR",flag:"🇱🇷",dial:"+231"},{name:"Libya",code:"LY",flag:"🇱🇾",dial:"+218"},{name:"Liechtenstein",code:"LI",flag:"🇱🇮",dial:"+423"},{name:"Lithuania",code:"LT",flag:"🇱🇹",dial:"+370"},{name:"Luxembourg",code:"LU",flag:"🇱🇺",dial:"+352"},{name:"Macau",code:"MO",flag:"🇲🇴",dial:"+853"},{name:"Madagascar",code:"MG",flag:"🇲🇬",dial:"+261"},{name:"Malawi",code:"MW",flag:"🇲🇼",dial:"+265"},{name:"Malaysia",code:"MY",flag:"🇲🇾",dial:"+60"},{name:"Maldives",code:"MV",flag:"🇲🇻",dial:"+960"},{name:"Mali",code:"ML",flag:"🇲🇱",dial:"+223"},{name:"Malta",code:"MT",flag:"🇲🇹",dial:"+356"},{name:"Marshall Islands",code:"MH",flag:"🇲🇭",dial:"+692"},{name:"Mauritania",code:"MR",flag:"🇲🇷",dial:"+222"},{name:"Mauritius",code:"MU",flag:"🇲🇺",dial:"+230"},{name:"Mexico",code:"MX",flag:"🇲🇽",dial:"+52"},{name:"Micronesia",code:"FM",flag:"🇫🇲",dial:"+691"},{name:"Moldova",code:"MD",flag:"🇲🇩",dial:"+373"},{name:"Monaco",code:"MC",flag:"🇲🇨",dial:"+377"},{name:"Mongolia",code:"MN",flag:"🇲🇳",dial:"+976"},{name:"Montenegro",code:"ME",flag:"🇲🇪",dial:"+382"},{name:"Morocco",code:"MA",flag:"🇲🇦",dial:"+212"},{name:"Mozambique",code:"MZ",flag:"🇲🇿",dial:"+258"},{name:"Myanmar",code:"MM",flag:"🇲🇲",dial:"+95"},{name:"Namibia",code:"NA",flag:"🇳🇦",dial:"+264"},{name:"Nauru",code:"NR",flag:"🇳🇷",dial:"+674"},{name:"Nepal",code:"NP",flag:"🇳🇵",dial:"+977"},{name:"Netherlands",code:"NL",flag:"🇳🇱",dial:"+31"},{name:"New Zealand",code:"NZ",flag:"🇳🇿",dial:"+64"},{name:"Nicaragua",code:"NI",flag:"🇳🇮",dial:"+505"},{name:"Niger",code:"NE",flag:"🇳🇪",dial:"+227"},{name:"Nigeria",code:"NG",flag:"🇳🇬",dial:"+234"},{name:"North Korea",code:"KP",flag:"🇰🇵",dial:"+850"},{name:"North Macedonia",code:"MK",flag:"🇲🇰",dial:"+389"},{name:"Norway",code:"NO",flag:"🇳🇴",dial:"+47"},{name:"Oman",code:"OM",flag:"🇴🇲",dial:"+968"},{name:"Pakistan",code:"PK",flag:"🇵🇰",dial:"+92"},{name:"Palau",code:"PW",flag:"🇵🇼",dial:"+680"},{name:"Palestine",code:"PS",flag:"🇵🇸",dial:"+970"},{name:"Panama",code:"PA",flag:"🇵🇦",dial:"+507"},{name:"Papua New Guinea",code:"PG",flag:"🇵🇬",dial:"+675"},{name:"Paraguay",code:"PY",flag:"🇵🇾",dial:"+595"},{name:"Peru",code:"PE",flag:"🇵🇪",dial:"+51"},{name:"Philippines",code:"PH",flag:"🇵🇭",dial:"+63"},{name:"Poland",code:"PL",flag:"🇵🇱",dial:"+48"},{name:"Portugal",code:"PT",flag:"🇵🇹",dial:"+351"},{name:"Puerto Rico",code:"PR",flag:"🇵🇷",dial:"+1787"},{name:"Qatar",code:"QA",flag:"🇶🇦",dial:"+974"},{name:"Romania",code:"RO",flag:"🇷🇴",dial:"+40"},{name:"Russia",code:"RU",flag:"🇷🇺",dial:"+7"},{name:"Rwanda",code:"RW",flag:"🇷🇼",dial:"+250"},{name:"Saint Kitts and Nevis",code:"KN",flag:"🇰🇳",dial:"+1869"},{name:"Saint Lucia",code:"LC",flag:"🇱🇨",dial:"+1758"},{name:"Saint Vincent and the Grenadines",code:"VC",flag:"🇻🇨",dial:"+1784"},{name:"Samoa",code:"WS",flag:"🇼🇸",dial:"+685"},{name:"San Marino",code:"SM",flag:"🇸🇲",dial:"+378"},{name:"Sao Tome and Principe",code:"ST",flag:"🇸🇹",dial:"+239"},{name:"Saudi Arabia",code:"SA",flag:"🇸🇦",dial:"+966"},{name:"Senegal",code:"SN",flag:"🇸🇳",dial:"+221"},{name:"Serbia",code:"RS",flag:"🇷🇸",dial:"+381"},{name:"Seychelles",code:"SC",flag:"🇸🇨",dial:"+248"},{name:"Sierra Leone",code:"SL",flag:"🇸🇱",dial:"+232"},{name:"Singapore",code:"SG",flag:"🇸🇬",dial:"+65"},{name:"Slovakia",code:"SK",flag:"🇸🇰",dial:"+421"},{name:"Slovenia",code:"SI",flag:"🇸🇮",dial:"+386"},{name:"Solomon Islands",code:"SB",flag:"🇸🇧",dial:"+677"},{name:"Somalia",code:"SO",flag:"🇸🇴",dial:"+252"},{name:"South Africa",code:"ZA",flag:"🇿🇦",dial:"+27"},{name:"South Korea",code:"KR",flag:"🇰🇷",dial:"+82"},{name:"South Sudan",code:"SS",flag:"🇸🇸",dial:"+211"},{name:"Spain",code:"ES",flag:"🇪🇸",dial:"+34"},{name:"Sri Lanka",code:"LK",flag:"🇱🇰",dial:"+94"},{name:"Sudan",code:"SD",flag:"🇸🇩",dial:"+249"},{name:"Suriname",code:"SR",flag:"🇸🇷",dial:"+597"},{name:"Sweden",code:"SE",flag:"🇸🇪",dial:"+46"},{name:"Switzerland",code:"CH",flag:"🇨🇭",dial:"+41"},{name:"Syria",code:"SY",flag:"🇸🇾",dial:"+963"},{name:"Taiwan",code:"TW",flag:"🇹🇼",dial:"+886"},{name:"Tajikistan",code:"TJ",flag:"🇹🇯",dial:"+992"},{name:"Tanzania",code:"TZ",flag:"🇹🇿",dial:"+255"},{name:"Thailand",code:"TH",flag:"🇹🇭",dial:"+66"},{name:"Timor-Leste",code:"TL",flag:"🇹🇱",dial:"+670"},{name:"Togo",code:"TG",flag:"🇹🇬",dial:"+228"},{name:"Tonga",code:"TO",flag:"🇹🇴",dial:"+676"},{name:"Trinidad and Tobago",code:"TT",flag:"🇹🇹",dial:"+1868"},{name:"Tunisia",code:"TN",flag:"🇹🇳",dial:"+216"},{name:"Turkey",code:"TR",flag:"🇹🇷",dial:"+90"},{name:"Turkmenistan",code:"TM",flag:"🇹🇲",dial:"+993"},{name:"Tuvalu",code:"TV",flag:"🇹🇻",dial:"+688"},{name:"Uganda",code:"UG",flag:"🇺🇬",dial:"+256"},{name:"Ukraine",code:"UA",flag:"🇺🇦",dial:"+380"},{name:"United Arab Emirates",code:"AE",flag:"🇦🇪",dial:"+971"},{name:"United Kingdom",code:"GB",flag:"🇬🇧",dial:"+44"},{name:"United States",code:"US",flag:"🇺🇸",dial:"+1"},{name:"Uruguay",code:"UY",flag:"🇺🇾",dial:"+598"},{name:"Uzbekistan",code:"UZ",flag:"🇺🇿",dial:"+998"},{name:"Vanuatu",code:"VU",flag:"🇻🇺",dial:"+678"},{name:"Vatican City",code:"VA",flag:"🇻🇦",dial:"+379"},{name:"Venezuela",code:"VE",flag:"🇻🇪",dial:"+58"},{name:"Vietnam",code:"VN",flag:"🇻🇳",dial:"+84"},{name:"Yemen",code:"YE",flag:"🇾🇪",dial:"+967"},{name:"Zambia",code:"ZM",flag:"🇿🇲",dial:"+260"},{name:"Zimbabwe",code:"ZW",flag:"🇿🇼",dial:"+263"},
];

const PHONE_LENGTHS = {AF:[9],AL:[9],DZ:[9],AD:[6],AO:[9],AR:[10],AM:[8],AU:[9],AT:[10,11],AZ:[9],BS:[10],BH:[8],BD:[10],BB:[10],BY:[9],BE:[9],BZ:[7],BJ:[8],BT:[8],BO:[8],BA:[8],BW:[8],BR:[10,11],BN:[7],BG:[9],BF:[8],BI:[8],KH:[8,9],CM:[9],CA:[10],CV:[7],CF:[8],TD:[8],CL:[9],CN:[11],CO:[10],KM:[7],CD:[9],CG:[9],CR:[8],HR:[9],CU:[8],CY:[8],CZ:[9],DK:[8],DJ:[8],DM:[10],DO:[10],EC:[9],EG:[10],SV:[8],GQ:[9],ER:[7],EE:[7,8],SZ:[8],ET:[9],FJ:[7],FI:[9,10],FR:[9],GA:[8],GM:[7],GE:[9],DE:[10,11],GH:[9],GR:[10],GD:[10],GT:[8],GN:[9],GW:[9],GY:[7],HT:[8],HN:[8],HK:[8],HU:[9],IS:[7],IN:[10],ID:[9,10,11,12],IR:[10],IQ:[10],IE:[9],IL:[9],IT:[9,10],CI:[10],JM:[10],JP:[10],JO:[9],KZ:[10],KE:[9,10],KI:[8],XK:[8],KW:[8],KG:[9],LA:[9,10],LV:[8],LB:[7,8],LS:[8],LR:[8],LY:[9],LI:[7],LT:[8],LU:[9],MO:[8],MG:[9],MW:[9],MY:[9,10],MV:[7],ML:[8],MT:[8],MH:[7],MR:[8],MU:[8],MX:[10],FM:[7],MD:[8],MC:[8],MN:[8],ME:[8],MA:[9],MZ:[9],MM:[8,9,10],NA:[9],NR:[7],NP:[10],NL:[9],NZ:[8,9],NI:[8],NE:[8],NG:[10],KP:[10],MK:[8],NO:[8],OM:[8],PK:[10],PW:[7],PS:[9],PA:[8],PG:[8],PY:[9],PE:[9],PH:[10],PL:[9],PT:[9],PR:[10],QA:[8],RO:[9],RU:[10],RW:[9],KN:[10],LC:[10],VC:[10],WS:[7],SM:[10],ST:[7],SA:[9],SN:[9],RS:[8,9],SC:[7],SL:[8],SG:[8],SK:[9],SI:[8],SB:[7],SO:[8],ZA:[9],KR:[9,10],SS:[9],ES:[9],LK:[9],SD:[9],SR:[7],SE:[9],CH:[9],SY:[9],TW:[9],TJ:[9],TZ:[9],TH:[9],TL:[7,8],TG:[8],TO:[5,7],TT:[10],TN:[8],TR:[10],TM:[8],TV:[5],UG:[9],UA:[9],AE:[9],GB:[10],US:[10],UY:[8,9],UZ:[9],VU:[7],VA:[10],VE:[10],VN:[9,10],YE:[9],ZM:[9],ZW:[9]};

/* ── Validation ── */
const isValidName  = (v) => v.trim().length >= 6 && v.trim().includes(" ");
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isValidPhone = (v) => v.replace(/\D/g, "").length >= 5;
const isValidPass  = (v) => v.length >= 6;

/* ── Reveal wrapper ── */
const Reveal = ({ show, children, delay = 0 }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}>
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

/* ── Progress: honest step count, not a percentage ── */
function Progress({ step, total }) {
  return (
    <div style={{ marginBottom: T.space.xl }}>
      <div className="flex items-baseline justify-between" style={{ marginBottom: 8 }}>
        <span className="mono" style={{ fontSize: T.size.tiny, letterSpacing: ".18em", textTransform: "uppercase", color: c.text3 }}>
          Step {Math.min(step + 1, total)} of {total}
        </span>
        <span className="mono tabular" style={{ fontSize: T.size.tiny, color: c.gain }}>
          {String(step).padStart(2, "0")}/{String(total).padStart(2, "0")}
        </span>
      </div>
      <div style={{ height: 2, background: c.line }}>
        <motion.div style={{ height: "100%", background: c.gain }}
          animate={{ width: `${Math.round((step / total) * 100)}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
      </div>
    </div>
  );
}

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const refCode = new URLSearchParams(location.search).get("ref") || "";

  const [form, setForm] = useState({
    name: "", email: "", phoneNumber: "", password: "", confirmPassword: "", referralCode: refCode,
  });
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  /* reveal flags */
  const [showEmail, setShowEmail] = useState(false);
  const [showCountry, setShowCountry] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmF, setShowConfirmF] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const [fieldError, setFieldError] = useState("");

  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const passRef = useRef(null);
  const confirmRef = useRef(null);
  const bottomRef = useRef(null);

  const focus = (ref, delay = 650) => setTimeout(() => ref.current?.focus(), delay);
  const scroll = (delay = 120) => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), delay);

  const handleChange = (e) => { setFieldError(""); setForm(f => ({ ...f, [e.target.name]: e.target.value })); };

  useEffect(() => {
    if (!showEmail && isValidName(form.name)) { setShowEmail(true); focus(emailRef); scroll(); }
  }, [form.name]);

  useEffect(() => {
    if (!showCountry && isValidEmail(form.email)) { setShowCountry(true); scroll(); }
  }, [form.email]);

  useEffect(() => {
    if (!showPassword && showPhone && isValidPhone(form.phoneNumber)) { setShowPassword(true); focus(passRef); scroll(); }
  }, [form.phoneNumber]);

  useEffect(() => {
    if (!showConfirmF && isValidPass(form.password)) { setShowConfirmF(true); focus(confirmRef); scroll(); }
  }, [form.password]);

  useEffect(() => {
    if (!showReferral && form.confirmPassword.length >= 6) {
      setShowReferral(true); scroll();
      setTimeout(() => { setShowTerms(true); scroll(200); }, 350);
    }
  }, [form.confirmPassword]);

  const onCountrySelect = (ct) => {
    setSelectedCountry(ct);
    setCountryOpen(false);
    setCountrySearch("");
    setError("");
    setFieldError("");
    if (!showPhone) { setShowPhone(true); focus(phoneRef); scroll(); }
  };

  const nextFromName = () => {
    if (!isValidName(form.name)) return setFieldError("Enter your first and last name to continue.");
    setFieldError(""); setShowEmail(true); focus(emailRef); scroll();
  };
  const nextFromEmail = () => {
    if (!isValidEmail(form.email)) return setFieldError("Enter a valid email address to continue.");
    setFieldError(""); setShowCountry(true); scroll();
  };
  const nextFromCountry = () => {
    if (!selectedCountry) return setFieldError("Select your country to continue.");
    setFieldError(""); setShowPhone(true); focus(phoneRef); scroll();
  };
  const nextFromPhone = () => {
    if (!isValidPhone(form.phoneNumber)) return setFieldError("Enter your phone number to continue.");
    setFieldError(""); setShowPassword(true); focus(passRef); scroll();
  };
  const nextFromPassword = () => {
    if (!isValidPass(form.password)) return setFieldError("Password must be at least 6 characters.");
    setFieldError(""); setShowConfirmF(true); focus(confirmRef); scroll();
  };
  const nextFromConfirm = () => {
    if (form.confirmPassword.length < 6) return setFieldError("Confirm your password to continue.");
    if (form.password !== form.confirmPassword) return setFieldError("Passwords don't match yet.");
    setFieldError(""); setShowReferral(true); scroll();
    setTimeout(() => { setShowTerms(true); scroll(200); }, 350);
  };

  const step = showTerms ? 7 : showReferral ? 6 : showConfirmF ? 5 : showPassword ? 4 : showPhone ? 3 : showCountry ? 2 : showEmail ? 1 : 0;

  const validatePhone = () => {
    if (!form.phoneNumber.trim()) return "Phone number is required.";
    if (!selectedCountry) return "Select your country first.";
    const digits = form.phoneNumber.replace(/\D/g, "");
    const expected = PHONE_LENGTHS[selectedCountry.code] || [];
    if (!expected.length) {
      return digits.length < 6 || digits.length > 15 ? `Enter a valid phone number for ${selectedCountry.name}.` : null;
    }
    if (!expected.includes(digits.length)) {
      const range = expected.length === 1 ? `${expected[0]} digits` : `${expected.join(" or ")} digits`;
      return `Phone for ${selectedCountry.name} must be ${range}. You entered ${digits.length}.`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (!isValidName(form.name)) return setError("Enter your full name (first and last).");
    if (!isValidEmail(form.email)) return setError("Enter a valid email address.");
    if (!selectedCountry) return setError("Select your country.");
    const phoneErr = validatePhone();
    if (phoneErr) return setError(phoneErr);
    if (!isValidPass(form.password)) return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    if (!agreedToTerms) return setError("You must agree to the Terms and Privacy Policy.");
    const fullPhone = `${selectedCountry.dial} ${form.phoneNumber.trim()}`;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        name: form.name, email: form.email, phone: fullPhone,
        country: selectedCountry.name, password: form.password, referralCode: form.referralCode,
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

  const field = (valid) => ({
    ...inputStyle,
    paddingLeft: 38,
    borderColor: valid ? "rgba(63,143,95,.4)" : c.line,
    background: valid ? "rgba(63,143,95,.04)" : c.fill,
  });

  const label = (txt) => <p className="eyebrow" style={{ marginBottom: 6 }}>{txt}</p>;

  const Hint = ({ show, children, tone }) =>
    show ? <p style={{ fontSize: T.size.xs, color: tone || c.text4, marginTop: 6 }}>{children}</p> : null;

  const NextBtn = ({ show, onClick }) =>
    show ? (
      <>
        <Button type="button" variant="quiet" full onClick={onClick} style={{ marginTop: T.space.md }}>
          Continue
        </Button>
        {fieldError && (
          <p className="flex items-center gap-1.5" style={{ fontSize: T.size.xs, color: c.loss, marginTop: 8 }}>
            <AlertTriangle size={11} /> {fieldError}
          </p>
        )}
      </>
    ) : null;

  /* ══ SUCCESS ══ */
  if (success) {
    return (
      <div className="ui min-h-screen flex items-center justify-center px-4" style={{ background: c.ink, color: c.text }}>
        <ThemeStyles />
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          className="w-full" style={{ maxWidth: 420 }}>

          <div style={{ background: c.paper, color: c.paperInk }}>
            <div style={{ height: 3, background: c.gain }} />
            <div style={{ padding: T.space.xxl }}>
              <p className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(14,16,19,.5)", marginBottom: 10 }}>
                Registration complete
              </p>
              <h1 className="display" style={{ fontSize: 34, lineHeight: 1.05, marginBottom: T.space.lg }}>
                Account created
              </h1>
              <p style={{ fontSize: T.size.sm, color: "rgba(14,16,19,.6)", lineHeight: 1.7, marginBottom: T.space.lg }}>
                We've sent a verification link to
              </p>
              <p className="mono" style={{ fontSize: T.size.sm, color: c.gainDeep, wordBreak: "break-all", paddingBottom: T.space.lg, borderBottom: `1px solid ${c.lineInk}` }}>
                {form.email}
              </p>
              <p style={{ fontSize: T.size.xs, color: "rgba(14,16,19,.55)", lineHeight: 1.7, marginTop: T.space.lg }}>
                Open your inbox and click the link to activate your account. Check your spam folder if it hasn't arrived within a few minutes.
              </p>
            </div>
          </div>

          <Button full onClick={() => navigate("/login")} style={{ marginTop: T.space.lg }}>
            Go to sign in <ArrowRight size={13} />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="ui min-h-screen flex justify-center px-4 py-16" style={{ background: c.ink, color: c.text }}>
      <ThemeStyles />

      <Link to="/" className="mono absolute flex items-center gap-2"
        style={{ top: 28, left: 24, fontSize: T.size.tiny, letterSpacing: ".16em", textTransform: "uppercase", color: c.text3 }}>
        ← <span className="display" style={{ fontSize: T.size.base, color: c.text }}>MexicaTrading</span>
      </Link>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .5, ease: [.22, 1, .36, 1] }}
        className="w-full" style={{ maxWidth: 420, marginTop: 24 }}>

        {/* Referral banner */}
        {refCode && (
          <div style={{ marginBottom: T.space.lg }}>
            <Banner tone="gain" title="Referral code applied" text={refCode} right={<Gift size={14} />} />
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: T.space.xl }}>
          <p className="eyebrow" style={{ marginBottom: 8 }}>New account</p>
          <h1 className="display" style={{ fontSize: 40, lineHeight: 1.02 }}>Open an account</h1>
          <p style={{ fontSize: T.size.sm, color: c.text3, marginTop: 10, lineHeight: 1.6 }}>
            Start typing — each field opens as you complete the one before it.
          </p>
        </div>

        <Progress step={step} total={7} />

        {error && (
          <div style={{ marginBottom: T.space.lg }}>
            <Banner tone="loss" title={error} />
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* ── 1. NAME ── */}
          <div style={{ marginBottom: T.space.md }}>
            {label("Full name")}
            <div style={{ position: "relative" }}>
              <User size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.text4 }} />
              <input type="text" name="name" value={form.name} onChange={handleChange}
                placeholder="First and last name" autoFocus autoComplete="name"
                style={field(isValidName(form.name))} />
              {isValidName(form.name) && <Check size={14} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: c.gain }} />}
            </div>
            <Hint show={form.name.length > 0 && !isValidName(form.name)}>Enter both your first and last name</Hint>
            <NextBtn show={!showEmail} onClick={nextFromName} />
          </div>

          {/* ── 2. EMAIL ── */}
          <Reveal show={showEmail}>
            <div style={{ marginBottom: T.space.md }}>
              {label("Email address")}
              <div style={{ position: "relative" }}>
                <Mail size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.text4 }} />
                <input ref={emailRef} type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="you@example.com" autoComplete="email"
                  style={field(isValidEmail(form.email))} />
                {isValidEmail(form.email) && <Check size={14} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: c.gain }} />}
              </div>
              <Hint show={form.email.length > 0 && !isValidEmail(form.email)}>Enter a valid email address</Hint>
              <NextBtn show={showEmail && !showCountry} onClick={nextFromEmail} />
            </div>
          </Reveal>

          {/* ── 3. COUNTRY ── */}
          <Reveal show={showCountry}>
            <div style={{ marginBottom: T.space.md, position: "relative" }}>
              {label("Country")}
              <button type="button" onClick={() => setCountryOpen(!countryOpen)}
                className="w-full flex items-center justify-between"
                style={{
                  ...inputStyle,
                  textAlign: "left",
                  borderColor: countryOpen ? "rgba(63,143,95,.5)" : selectedCountry ? "rgba(63,143,95,.4)" : c.line,
                  background: selectedCountry ? "rgba(63,143,95,.04)" : c.fill,
                }}>
                {selectedCountry ? (
                  <span className="flex items-center gap-2.5" style={{ minWidth: 0 }}>
                    <span style={{ fontSize: 16, lineHeight: 1 }}>{selectedCountry.flag}</span>
                    <span className="truncate" style={{ fontSize: T.size.sm }}>{selectedCountry.name}</span>
                    <span className="mono" style={{ fontSize: T.size.xs, color: c.gain }}>{selectedCountry.dial}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2.5" style={{ color: c.text4, fontSize: T.size.sm }}>
                    <Globe size={14} /> Select your country
                  </span>
                )}
                <ChevronDown size={15} style={{ color: c.text4, transform: countryOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
              </button>

              {countryOpen && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, marginTop: 2,
                  background: c.panelAlt, border: `1px solid ${c.line}`, maxHeight: 280,
                  display: "flex", flexDirection: "column",
                }}>
                  <div style={{ padding: 10, borderBottom: `1px solid ${c.line}` }}>
                    <div style={{ position: "relative" }}>
                      <Search size={12} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: c.text4 }} />
                      <input type="text" placeholder="Search country or dial code"
                        value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} autoFocus
                        style={{ ...inputStyle, paddingLeft: 32, padding: "9px 12px 9px 32px", fontSize: T.size.xs }} />
                    </div>
                  </div>
                  <div style={{ overflowY: "auto", flex: 1 }}>
                    {COUNTRIES.filter(ct =>
                      ct.name.toLowerCase().includes(countrySearch.toLowerCase()) || ct.dial.includes(countrySearch)
                    ).map((ct) => (
                      <button key={ct.code} type="button" onClick={() => onCountrySelect(ct)}
                        className="w-full flex items-center gap-3 text-left hover-fill"
                        style={{
                          padding: "10px 14px",
                          background: selectedCountry?.code === ct.code ? "rgba(63,143,95,.1)" : "transparent",
                        }}>
                        <span style={{ fontSize: 15, lineHeight: 1 }}>{ct.flag}</span>
                        <span className="truncate" style={{ flex: 1, fontSize: T.size.sm, color: c.text }}>{ct.name}</span>
                        <span className="mono" style={{ fontSize: T.size.tiny, color: c.text3 }}>{ct.dial}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Hint show={showCountry && !selectedCountry}>Choose the country your phone number belongs to</Hint>
              <NextBtn show={showCountry && !showPhone} onClick={nextFromCountry} />
            </div>
          </Reveal>

          {/* ── 4. PHONE ── */}
          <Reveal show={showPhone}>
            <div style={{ marginBottom: T.space.md }}>
              {label("Phone number")}
              <div className="flex" style={{ gap: 0 }}>
                <div className="flex items-center justify-center gap-1.5 shrink-0"
                  style={{
                    minWidth: 92, padding: "13px 10px",
                    background: "rgba(63,143,95,.06)", border: `1px solid rgba(63,143,95,.3)`, borderRight: "none",
                  }}>
                  <span style={{ fontSize: 15, lineHeight: 1 }}>{selectedCountry?.flag}</span>
                  <span className="mono" style={{ fontSize: T.size.sm, color: c.gain }}>{selectedCountry?.dial}</span>
                </div>
                <div style={{ position: "relative", flex: 1 }}>
                  <Phone size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.text4 }} />
                  <input ref={phoneRef} type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange}
                    placeholder="Phone number"
                    style={field(isValidPhone(form.phoneNumber))} />
                </div>
              </div>
              {form.phoneNumber && (
                <p className="mono" style={{ fontSize: T.size.tiny, color: c.text4, marginTop: 6 }}>
                  Saved as {selectedCountry?.dial} {form.phoneNumber}
                </p>
              )}
              <Hint show={form.phoneNumber.length > 0 && !isValidPhone(form.phoneNumber)}>Enter your phone number</Hint>
              <NextBtn show={showPhone && !showPassword} onClick={nextFromPhone} />
            </div>
          </Reveal>

          {/* ── 5. PASSWORD ── */}
          <Reveal show={showPassword}>
            <div style={{ marginBottom: T.space.md }}>
              {label("Password")}
              <div style={{ position: "relative" }}>
                <Lock size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.text4 }} />
                <input ref={passRef} type={showPass ? "text" : "password"} name="password"
                  value={form.password} onChange={handleChange} placeholder="At least 6 characters"
                  style={{ ...field(isValidPass(form.password)), paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: c.text4, padding: 4 }}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <Hint show={form.password.length > 0 && !isValidPass(form.password)}>At least 6 characters</Hint>
              <NextBtn show={showPassword && !showConfirmF} onClick={nextFromPassword} />
            </div>
          </Reveal>

          {/* ── 6. CONFIRM ── */}
          <Reveal show={showConfirmF}>
            <div style={{ marginBottom: T.space.md }}>
              {label("Confirm password")}
              <div style={{ position: "relative" }}>
                <Lock size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.text4 }} />
                <input ref={confirmRef} type={showConfirm ? "text" : "password"} name="confirmPassword"
                  value={form.confirmPassword} onChange={handleChange} placeholder="Repeat your password"
                  style={{
                    ...field(form.confirmPassword.length >= 6 && form.password === form.confirmPassword),
                    paddingRight: 44,
                  }} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: c.text4, padding: 4 }}>
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {form.confirmPassword.length > 0 && (
                <p className="flex items-center gap-1.5" style={{
                  fontSize: T.size.xs, marginTop: 6,
                  color: form.password === form.confirmPassword ? c.gain : c.loss,
                }}>
                  {form.password === form.confirmPassword
                    ? <><Check size={11} /> Passwords match</>
                    : <><AlertTriangle size={11} /> Passwords don't match yet</>}
                </p>
              )}
              <NextBtn show={showConfirmF && !showReferral && !showTerms} onClick={nextFromConfirm} />
            </div>
          </Reveal>

          {/* ── 7. REFERRAL ── */}
          <Reveal show={showReferral && !refCode} delay={0.05}>
            <div style={{ marginBottom: T.space.md }}>
              {label("Referral code — optional")}
              <div style={{ position: "relative" }}>
                <Gift size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.text4 }} />
                <input type="text" name="referralCode" value={form.referralCode} onChange={handleChange}
                  placeholder="Enter a code if you have one"
                  className="mono" style={{ ...inputStyle, paddingLeft: 38, fontSize: T.size.xs }} />
              </div>
            </div>
          </Reveal>

          {/* ── TERMS + SUBMIT ── */}
          <Reveal show={showTerms} delay={0.1}>
            <div style={{ marginTop: T.space.lg }}>
              <label className="flex items-start gap-3 cursor-pointer select-none"
                style={{
                  padding: T.space.lg,
                  border: `1px solid ${agreedToTerms ? "rgba(63,143,95,.35)" : c.line}`,
                  background: agreedToTerms ? "rgba(63,143,95,.05)" : c.fill,
                  marginBottom: T.space.lg,
                  transition: "background .2s, border-color .2s",
                }}>
                <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)}
                  style={{ marginTop: 2, width: 15, height: 15, accentColor: c.gain, flexShrink: 0, cursor: "pointer" }} />
                <span style={{ fontSize: T.size.xs, color: c.text2, lineHeight: 1.7 }}>
                  I agree to the{" "}
                  <Link to="/terms" target="_blank" style={{ color: c.gain, textDecoration: "underline" }}>Terms of Service</Link>
                  {" "}and{" "}
                  <Link to="/privacy" target="_blank" style={{ color: c.gain, textDecoration: "underline" }}>Privacy Policy</Link>,
                  and I understand that investing carries risk.
                </span>
              </label>

              <Button type="submit" full disabled={loading || !agreedToTerms}
                style={{ opacity: (loading || !agreedToTerms) ? .5 : 1 }}
                icon={loading ? <Spinner size={13} tone="#fff" /> : null}>
                {loading ? "Creating account" : "Create account"}
                {!loading && <ArrowRight size={13} />}
              </Button>
            </div>
          </Reveal>
        </form>

        {/* Sign in */}
        <div style={{ marginTop: T.space.xxl }}>
          <div className="flex items-center gap-3" style={{ marginBottom: T.space.lg }}>
            <div style={{ flex: 1, borderBottom: `1px solid ${c.line}` }} />
            <span className="mono" style={{ fontSize: T.size.tiny, letterSpacing: ".16em", textTransform: "uppercase", color: c.text4 }}>
              Already registered
            </span>
            <div style={{ flex: 1, borderBottom: `1px solid ${c.line}` }} />
          </div>
          <Button variant="quiet" full onClick={() => navigate("/login")}>Sign in</Button>
        </div>

        <div className="flex items-center justify-center gap-5 mono"
          style={{ marginTop: T.space.xl, fontSize: T.size.micro, letterSpacing: ".14em", textTransform: "uppercase", color: c.text4 }}>
          <span>SSL secured</span>
          <span>·</span>
          <span>Data protected</span>
        </div>

        <div ref={bottomRef} />
      </motion.div>
    </div>
  );
}
