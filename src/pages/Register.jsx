import { useState } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Lock, Phone, Globe, ArrowRight,
  Eye, EyeOff, CheckCircle, AlertTriangle, ChevronDown, Search
} from "lucide-react";
import { useTranslation } from "react-i18next";

// All 195+ countries
const COUNTRIES = [
  { name: "Afghanistan", code: "AF", flag: "🇦🇫", dial: "+93" },
  { name: "Albania", code: "AL", flag: "🇦🇱", dial: "+355" },
  { name: "Algeria", code: "DZ", flag: "🇩🇿", dial: "+213" },
  { name: "Andorra", code: "AD", flag: "🇦🇩", dial: "+376" },
  { name: "Angola", code: "AO", flag: "🇦🇴", dial: "+244" },
  { name: "Antigua and Barbuda", code: "AG", flag: "🇦🇬", dial: "+1268" },
  { name: "Argentina", code: "AR", flag: "🇦🇷", dial: "+54" },
  { name: "Armenia", code: "AM", flag: "🇦🇲", dial: "+374" },
  { name: "Australia", code: "AU", flag: "🇦🇺", dial: "+61" },
  { name: "Austria", code: "AT", flag: "🇦🇹", dial: "+43" },
  { name: "Azerbaijan", code: "AZ", flag: "🇦🇿", dial: "+994" },
  { name: "Bahamas", code: "BS", flag: "🇧🇸", dial: "+1242" },
  { name: "Bahrain", code: "BH", flag: "🇧🇭", dial: "+973" },
  { name: "Bangladesh", code: "BD", flag: "🇧🇩", dial: "+880" },
  { name: "Barbados", code: "BB", flag: "🇧🇧", dial: "+1246" },
  { name: "Belarus", code: "BY", flag: "🇧🇾", dial: "+375" },
  { name: "Belgium", code: "BE", flag: "🇧🇪", dial: "+32" },
  { name: "Belize", code: "BZ", flag: "🇧🇿", dial: "+501" },
  { name: "Benin", code: "BJ", flag: "🇧🇯", dial: "+229" },
  { name: "Bhutan", code: "BT", flag: "🇧🇹", dial: "+975" },
  { name: "Bolivia", code: "BO", flag: "🇧🇴", dial: "+591" },
  { name: "Bosnia and Herzegovina", code: "BA", flag: "🇧🇦", dial: "+387" },
  { name: "Botswana", code: "BW", flag: "🇧🇼", dial: "+267" },
  { name: "Brazil", code: "BR", flag: "🇧🇷", dial: "+55" },
  { name: "Brunei", code: "BN", flag: "🇧🇳", dial: "+673" },
  { name: "Bulgaria", code: "BG", flag: "🇧🇬", dial: "+359" },
  { name: "Burkina Faso", code: "BF", flag: "🇧🇫", dial: "+226" },
  { name: "Burundi", code: "BI", flag: "🇧🇮", dial: "+257" },
  { name: "Cabo Verde", code: "CV", flag: "🇨🇻", dial: "+238" },
  { name: "Cambodia", code: "KH", flag: "🇰🇭", dial: "+855" },
  { name: "Cameroon", code: "CM", flag: "🇨🇲", dial: "+237" },
  { name: "Canada", code: "CA", flag: "🇨🇦", dial: "+1" },
  { name: "Central African Republic", code: "CF", flag: "🇨🇫", dial: "+236" },
  { name: "Chad", code: "TD", flag: "🇹🇩", dial: "+235" },
  { name: "Chile", code: "CL", flag: "🇨🇱", dial: "+56" },
  { name: "China", code: "CN", flag: "🇨🇳", dial: "+86" },
  { name: "Colombia", code: "CO", flag: "🇨🇴", dial: "+57" },
  { name: "Comoros", code: "KM", flag: "🇰🇲", dial: "+269" },
  { name: "Congo (DRC)", code: "CD", flag: "🇨🇩", dial: "+243" },
  { name: "Congo (Republic)", code: "CG", flag: "🇨🇬", dial: "+242" },
  { name: "Costa Rica", code: "CR", flag: "🇨🇷", dial: "+506" },
  { name: "Côte d'Ivoire", code: "CI", flag: "🇨🇮", dial: "+225" },
  { name: "Croatia", code: "HR", flag: "🇭🇷", dial: "+385" },
  { name: "Cuba", code: "CU", flag: "🇨🇺", dial: "+53" },
  { name: "Cyprus", code: "CY", flag: "🇨🇾", dial: "+357" },
  { name: "Czech Republic", code: "CZ", flag: "🇨🇿", dial: "+420" },
  { name: "Denmark", code: "DK", flag: "🇩🇰", dial: "+45" },
  { name: "Djibouti", code: "DJ", flag: "🇩🇯", dial: "+253" },
  { name: "Dominica", code: "DM", flag: "🇩🇲", dial: "+1767" },
  { name: "Dominican Republic", code: "DO", flag: "🇩🇴", dial: "+1809" },
  { name: "Ecuador", code: "EC", flag: "🇪🇨", dial: "+593" },
  { name: "Egypt", code: "EG", flag: "🇪🇬", dial: "+20" },
  { name: "El Salvador", code: "SV", flag: "🇸🇻", dial: "+503" },
  { name: "Equatorial Guinea", code: "GQ", flag: "🇬🇶", dial: "+240" },
  { name: "Eritrea", code: "ER", flag: "🇪🇷", dial: "+291" },
  { name: "Estonia", code: "EE", flag: "🇪🇪", dial: "+372" },
  { name: "Eswatini", code: "SZ", flag: "🇸🇿", dial: "+268" },
  { name: "Ethiopia", code: "ET", flag: "🇪🇹", dial: "+251" },
  { name: "Fiji", code: "FJ", flag: "🇫🇯", dial: "+679" },
  { name: "Finland", code: "FI", flag: "🇫🇮", dial: "+358" },
  { name: "France", code: "FR", flag: "🇫🇷", dial: "+33" },
  { name: "Gabon", code: "GA", flag: "🇬🇦", dial: "+241" },
  { name: "Gambia", code: "GM", flag: "🇬🇲", dial: "+220" },
  { name: "Georgia", code: "GE", flag: "🇬🇪", dial: "+995" },
  { name: "Germany", code: "DE", flag: "🇩🇪", dial: "+49" },
  { name: "Ghana", code: "GH", flag: "🇬🇭", dial: "+233" },
  { name: "Greece", code: "GR", flag: "🇬🇷", dial: "+30" },
  { name: "Grenada", code: "GD", flag: "🇬🇩", dial: "+1473" },
  { name: "Guatemala", code: "GT", flag: "🇬🇹", dial: "+502" },
  { name: "Guinea", code: "GN", flag: "🇬🇳", dial: "+224" },
  { name: "Guinea-Bissau", code: "GW", flag: "🇬🇼", dial: "+245" },
  { name: "Guyana", code: "GY", flag: "🇬🇾", dial: "+592" },
  { name: "Haiti", code: "HT", flag: "🇭🇹", dial: "+509" },
  { name: "Honduras", code: "HN", flag: "🇭🇳", dial: "+504" },
  { name: "Hong Kong", code: "HK", flag: "🇭🇰", dial: "+852" },
  { name: "Hungary", code: "HU", flag: "🇭🇺", dial: "+36" },
  { name: "Iceland", code: "IS", flag: "🇮🇸", dial: "+354" },
  { name: "India", code: "IN", flag: "🇮🇳", dial: "+91" },
  { name: "Indonesia", code: "ID", flag: "🇮🇩", dial: "+62" },
  { name: "Iran", code: "IR", flag: "🇮🇷", dial: "+98" },
  { name: "Iraq", code: "IQ", flag: "🇮🇶", dial: "+964" },
  { name: "Ireland", code: "IE", flag: "🇮🇪", dial: "+353" },
  { name: "Israel", code: "IL", flag: "🇮🇱", dial: "+972" },
  { name: "Italy", code: "IT", flag: "🇮🇹", dial: "+39" },
  { name: "Jamaica", code: "JM", flag: "🇯🇲", dial: "+1876" },
  { name: "Japan", code: "JP", flag: "🇯🇵", dial: "+81" },
  { name: "Jordan", code: "JO", flag: "🇯🇴", dial: "+962" },
  { name: "Kazakhstan", code: "KZ", flag: "🇰🇿", dial: "+7" },
  { name: "Kenya", code: "KE", flag: "🇰🇪", dial: "+254" },
  { name: "Kiribati", code: "KI", flag: "🇰🇮", dial: "+686" },
  { name: "Kosovo", code: "XK", flag: "🇽🇰", dial: "+383" },
  { name: "Kuwait", code: "KW", flag: "🇰🇼", dial: "+965" },
  { name: "Kyrgyzstan", code: "KG", flag: "🇰🇬", dial: "+996" },
  { name: "Laos", code: "LA", flag: "🇱🇦", dial: "+856" },
  { name: "Latvia", code: "LV", flag: "🇱🇻", dial: "+371" },
  { name: "Lebanon", code: "LB", flag: "🇱🇧", dial: "+961" },
  { name: "Lesotho", code: "LS", flag: "🇱🇸", dial: "+266" },
  { name: "Liberia", code: "LR", flag: "🇱🇷", dial: "+231" },
  { name: "Libya", code: "LY", flag: "🇱🇾", dial: "+218" },
  { name: "Liechtenstein", code: "LI", flag: "🇱🇮", dial: "+423" },
  { name: "Lithuania", code: "LT", flag: "🇱🇹", dial: "+370" },
  { name: "Luxembourg", code: "LU", flag: "🇱🇺", dial: "+352" },
  { name: "Macau", code: "MO", flag: "🇲🇴", dial: "+853" },
  { name: "Madagascar", code: "MG", flag: "🇲🇬", dial: "+261" },
  { name: "Malawi", code: "MW", flag: "🇲🇼", dial: "+265" },
  { name: "Malaysia", code: "MY", flag: "🇲🇾", dial: "+60" },
  { name: "Maldives", code: "MV", flag: "🇲🇻", dial: "+960" },
  { name: "Mali", code: "ML", flag: "🇲🇱", dial: "+223" },
  { name: "Malta", code: "MT", flag: "🇲🇹", dial: "+356" },
  { name: "Marshall Islands", code: "MH", flag: "🇲🇭", dial: "+692" },
  { name: "Mauritania", code: "MR", flag: "🇲🇷", dial: "+222" },
  { name: "Mauritius", code: "MU", flag: "🇲🇺", dial: "+230" },
  { name: "Mexico", code: "MX", flag: "🇲🇽", dial: "+52" },
  { name: "Micronesia", code: "FM", flag: "🇫🇲", dial: "+691" },
  { name: "Moldova", code: "MD", flag: "🇲🇩", dial: "+373" },
  { name: "Monaco", code: "MC", flag: "🇲🇨", dial: "+377" },
  { name: "Mongolia", code: "MN", flag: "🇲🇳", dial: "+976" },
  { name: "Montenegro", code: "ME", flag: "🇲🇪", dial: "+382" },
  { name: "Morocco", code: "MA", flag: "🇲🇦", dial: "+212" },
  { name: "Mozambique", code: "MZ", flag: "🇲🇿", dial: "+258" },
  { name: "Myanmar", code: "MM", flag: "🇲🇲", dial: "+95" },
  { name: "Namibia", code: "NA", flag: "🇳🇦", dial: "+264" },
  { name: "Nauru", code: "NR", flag: "🇳🇷", dial: "+674" },
  { name: "Nepal", code: "NP", flag: "🇳🇵", dial: "+977" },
  { name: "Netherlands", code: "NL", flag: "🇳🇱", dial: "+31" },
  { name: "New Zealand", code: "NZ", flag: "🇳🇿", dial: "+64" },
  { name: "Nicaragua", code: "NI", flag: "🇳🇮", dial: "+505" },
  { name: "Niger", code: "NE", flag: "🇳🇪", dial: "+227" },
  { name: "Nigeria", code: "NG", flag: "🇳🇬", dial: "+234" },
  { name: "North Korea", code: "KP", flag: "🇰🇵", dial: "+850" },
  { name: "North Macedonia", code: "MK", flag: "🇲🇰", dial: "+389" },
  { name: "Norway", code: "NO", flag: "🇳🇴", dial: "+47" },
  { name: "Oman", code: "OM", flag: "🇴🇲", dial: "+968" },
  { name: "Pakistan", code: "PK", flag: "🇵🇰", dial: "+92" },
  { name: "Palau", code: "PW", flag: "🇵🇼", dial: "+680" },
  { name: "Palestine", code: "PS", flag: "🇵🇸", dial: "+970" },
  { name: "Panama", code: "PA", flag: "🇵🇦", dial: "+507" },
  { name: "Papua New Guinea", code: "PG", flag: "🇵🇬", dial: "+675" },
  { name: "Paraguay", code: "PY", flag: "🇵🇾", dial: "+595" },
  { name: "Peru", code: "PE", flag: "🇵🇪", dial: "+51" },
  { name: "Philippines", code: "PH", flag: "🇵🇭", dial: "+63" },
  { name: "Poland", code: "PL", flag: "🇵🇱", dial: "+48" },
  { name: "Portugal", code: "PT", flag: "🇵🇹", dial: "+351" },
  { name: "Puerto Rico", code: "PR", flag: "🇵🇷", dial: "+1787" },
  { name: "Qatar", code: "QA", flag: "🇶🇦", dial: "+974" },
  { name: "Romania", code: "RO", flag: "🇷🇴", dial: "+40" },
  { name: "Russia", code: "RU", flag: "🇷🇺", dial: "+7" },
  { name: "Rwanda", code: "RW", flag: "🇷🇼", dial: "+250" },
  { name: "Saint Kitts and Nevis", code: "KN", flag: "🇰🇳", dial: "+1869" },
  { name: "Saint Lucia", code: "LC", flag: "🇱🇨", dial: "+1758" },
  { name: "Saint Vincent and the Grenadines", code: "VC", flag: "🇻🇨", dial: "+1784" },
  { name: "Samoa", code: "WS", flag: "🇼🇸", dial: "+685" },
  { name: "San Marino", code: "SM", flag: "🇸🇲", dial: "+378" },
  { name: "Sao Tome and Principe", code: "ST", flag: "🇸🇹", dial: "+239" },
  { name: "Saudi Arabia", code: "SA", flag: "🇸🇦", dial: "+966" },
  { name: "Senegal", code: "SN", flag: "🇸🇳", dial: "+221" },
  { name: "Serbia", code: "RS", flag: "🇷🇸", dial: "+381" },
  { name: "Seychelles", code: "SC", flag: "🇸🇨", dial: "+248" },
  { name: "Sierra Leone", code: "SL", flag: "🇸🇱", dial: "+232" },
  { name: "Singapore", code: "SG", flag: "🇸🇬", dial: "+65" },
  { name: "Slovakia", code: "SK", flag: "🇸🇰", dial: "+421" },
  { name: "Slovenia", code: "SI", flag: "🇸🇮", dial: "+386" },
  { name: "Solomon Islands", code: "SB", flag: "🇸🇧", dial: "+677" },
  { name: "Somalia", code: "SO", flag: "🇸🇴", dial: "+252" },
  { name: "South Africa", code: "ZA", flag: "🇿🇦", dial: "+27" },
  { name: "South Korea", code: "KR", flag: "🇰🇷", dial: "+82" },
  { name: "South Sudan", code: "SS", flag: "🇸🇸", dial: "+211" },
  { name: "Spain", code: "ES", flag: "🇪🇸", dial: "+34" },
  { name: "Sri Lanka", code: "LK", flag: "🇱🇰", dial: "+94" },
  { name: "Sudan", code: "SD", flag: "🇸🇩", dial: "+249" },
  { name: "Suriname", code: "SR", flag: "🇸🇷", dial: "+597" },
  { name: "Sweden", code: "SE", flag: "🇸🇪", dial: "+46" },
  { name: "Switzerland", code: "CH", flag: "🇨🇭", dial: "+41" },
  { name: "Syria", code: "SY", flag: "🇸🇾", dial: "+963" },
  { name: "Taiwan", code: "TW", flag: "🇹🇼", dial: "+886" },
  { name: "Tajikistan", code: "TJ", flag: "🇹🇯", dial: "+992" },
  { name: "Tanzania", code: "TZ", flag: "🇹🇿", dial: "+255" },
  { name: "Thailand", code: "TH", flag: "🇹🇭", dial: "+66" },
  { name: "Timor-Leste", code: "TL", flag: "🇹🇱", dial: "+670" },
  { name: "Togo", code: "TG", flag: "🇹🇬", dial: "+228" },
  { name: "Tonga", code: "TO", flag: "🇹🇴", dial: "+676" },
  { name: "Trinidad and Tobago", code: "TT", flag: "🇹🇹", dial: "+1868" },
  { name: "Tunisia", code: "TN", flag: "🇹🇳", dial: "+216" },
  { name: "Turkey", code: "TR", flag: "🇹🇷", dial: "+90" },
  { name: "Turkmenistan", code: "TM", flag: "🇹🇲", dial: "+993" },
  { name: "Tuvalu", code: "TV", flag: "🇹🇻", dial: "+688" },
  { name: "Uganda", code: "UG", flag: "🇺🇬", dial: "+256" },
  { name: "Ukraine", code: "UA", flag: "🇺🇦", dial: "+380" },
  { name: "United Arab Emirates", code: "AE", flag: "🇦🇪", dial: "+971" },
  { name: "United Kingdom", code: "GB", flag: "🇬🇧", dial: "+44" },
  { name: "United States", code: "US", flag: "🇺🇸", dial: "+1" },
  { name: "Uruguay", code: "UY", flag: "🇺🇾", dial: "+598" },
  { name: "Uzbekistan", code: "UZ", flag: "🇺🇿", dial: "+998" },
  { name: "Vanuatu", code: "VU", flag: "🇻🇺", dial: "+678" },
  { name: "Vatican City", code: "VA", flag: "🇻🇦", dial: "+379" },
  { name: "Venezuela", code: "VE", flag: "🇻🇪", dial: "+58" },
  { name: "Vietnam", code: "VN", flag: "🇻🇳", dial: "+84" },
  { name: "Yemen", code: "YE", flag: "🇾🇪", dial: "+967" },
  { name: "Zambia", code: "ZM", flag: "🇿🇲", dial: "+260" },
  { name: "Zimbabwe", code: "ZW", flag: "🇿🇼", dial: "+263" },
];

// Reusable input shell
const Field = ({ icon: Icon, children, error }) => (
  <div className="relative group">
    {Icon && <Icon size={15} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${error ? "text-red-400" : "text-white/30 group-focus-within:text-emerald-400"}`} />}
    {children}
  </div>
);

export default function Register() {
  const { t } = useTranslation();
  const API_URL = "https://mexicatradingbackend.onrender.com";
  const navigate = useNavigate();
  const location = useLocation();
  const refCode = new URLSearchParams(location.search).get("ref") || "";

  const [form, setForm] = useState({
    name: "", email: "", phoneNumber: "",
    password: "", confirmPassword: "", referralCode: refCode,
  });
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.dial.includes(countrySearch)
  );

  const handleSelectCountry = (country) => {
    setSelectedCountry(country);
    setCountryOpen(false);
    setCountrySearch("");
    setError("");
  };

  const validatePhone = () => {
    if (!form.phoneNumber.trim()) return t("auth.phoneRequired", "Phone number is required.");
    if (!selectedCountry) return t("auth.countryRequired", "Please select your country first.");
    const digits = form.phoneNumber.replace(/\D/g, "");
    if (digits.length < 6 || digits.length > 15) {
      return t("auth.invalidPhone", `Please enter a valid phone number for ${selectedCountry.name}.`);
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError(t("auth.nameRequired", "Full name is required."));
    if (!form.email.trim()) return setError(t("auth.emailRequired", "Email is required."));
    if (!selectedCountry) return setError(t("auth.countryRequired", "Please select your country."));

    const phoneError = validatePhone();
    if (phoneError) return setError(phoneError);

    if (form.password.length < 6) return setError(t("auth.passwordTooShort", "Password must be at least 6 characters."));
    if (form.password !== form.confirmPassword) return setError(t("auth.passwordsDoNotMatch", "Passwords do not match."));
    if (!agreedToTerms) return setError(t("auth.mustAgreeTerms", "You must agree to the Terms and Privacy Policy."));

    const fullPhone = `${selectedCountry.dial} ${form.phoneNumber.trim()}`;

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        name: form.name,
        email: form.email,
        phone: fullPhone,
        country: selectedCountry.name,
        password: form.password,
        referralCode: form.referralCode,
      });
      if (res.data.token) {
        sessionStorage.setItem("token", res.data.token);
        setSuccess(true);
        setTimeout(() => navigate("/login"), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || t("auth.registrationFailed", "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  // Common input class
  const inputCls = "w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/8 outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] transition text-sm text-white placeholder:text-white/30";

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#080c18] text-white overflow-hidden px-4 py-10">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] bg-emerald-500/8 blur-[180px] rounded-full top-[-150px] left-[-150px]" />
        <div className="absolute w-[400px] h-[400px] bg-teal-400/6 blur-[140px] rounded-full bottom-[-100px] right-[-100px]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      </div>

      <Link to="/" className="absolute top-6 left-6 text-white/30 hover:text-white/70 text-sm transition flex items-center gap-1 z-10">
        ← MexicaTrading
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative w-full max-w-md">
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/8 px-7 py-8 rounded-3xl shadow-2xl">

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center gap-5 py-4">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle size={40} className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{t("auth.accountCreated", "Account Created!")}</h2>
                  <p className="text-white/45 text-sm">{t("auth.verificationSentTo", "We sent a verification email to")}</p>
                  <p className="text-emerald-400 font-semibold text-sm mt-1">{form.email}</p>
                </div>
                <div className="w-full p-4 rounded-2xl bg-emerald-500/8 border border-emerald-500/20">
                  <p className="text-white/55 text-sm leading-relaxed">
                    📧 {t("auth.checkInboxAndClick", "Please check your inbox and click the verification link to activate your account.")}
                  </p>
                </div>
                <button onClick={() => navigate("/login")}
                  className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 transition font-semibold text-sm text-white flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20">
                  {t("auth.goToLogin", "Go to Login")} <ArrowRight size={16} />
                </button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>

                {refCode && (
                  <div className="mb-5 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs text-center">
                    🎁 {t("auth.referralApplied", "Referral code applied")} · <strong className="font-mono">{refCode}</strong>
                  </div>
                )}

                {/* Heading */}
                <div className="text-center mb-7">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold tracking-widest uppercase mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {t("auth.secureRegister", "Secure Registration")}
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight mb-1.5">{t("auth.createAccountTitle", "Create Your Account")}</h2>
                  <p className="text-white/40 text-sm">{t("auth.joinDesc", "Join thousands growing their wealth.")}</p>
                </div>

                {/* Error banner */}
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mb-4 flex items-start gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-3 py-2.5 rounded-xl">
                      <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-3">

                  {/* Name */}
                  <Field icon={User}>
                    <input type="text" name="name" value={form.name} onChange={handleChange}
                      placeholder={t("auth.fullName", "Full Name")} required className={inputCls} />
                  </Field>

                  {/* Email */}
                  <Field icon={Mail}>
                    <input type="email" name="email" value={form.email} onChange={handleChange}
                      placeholder={t("auth.email", "Email Address")} required className={inputCls} />
                  </Field>

                  {/* Country */}
                  <div className="relative">
                    <button type="button" onClick={() => setCountryOpen(!countryOpen)}
                      className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/8 outline-none focus:border-emerald-500/50 transition text-sm text-left hover:bg-white/[0.06]">
                      {selectedCountry ? (
                        <span className="flex items-center gap-2.5 text-white">
                          <span className="text-lg leading-none">{selectedCountry.flag}</span>
                          <span className="truncate">{selectedCountry.name}</span>
                          <span className="text-emerald-400 font-mono text-xs ml-auto pr-2">{selectedCountry.dial}</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-2.5 text-white/30">
                          <Globe size={15} />
                          {t("auth.selectCountry", "Select Your Country")}
                        </span>
                      )}
                      <ChevronDown size={15} className={`text-white/40 transition shrink-0 ${countryOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {countryOpen && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                          className="absolute top-full mt-2 left-0 right-0 z-50 bg-[#0e1422] border border-white/10 rounded-2xl shadow-2xl max-h-72 overflow-hidden flex flex-col">
                          <div className="p-2.5 border-b border-white/8">
                            <div className="relative">
                              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                              <input type="text" placeholder={t("auth.searchCountry", "Search country or dial code...")}
                                value={countrySearch}
                                onChange={(e) => setCountrySearch(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-emerald-500/50 text-xs text-white placeholder:text-white/30" autoFocus />
                            </div>
                          </div>
                          <div className="overflow-y-auto flex-1">
                            {filteredCountries.length === 0 ? (
                              <p className="text-white/30 text-xs text-center py-6">{t("auth.noCountryFound", "No country found")}</p>
                            ) : (
                              filteredCountries.map(c => (
                                <button key={c.code} type="button" onClick={() => handleSelectCountry(c)}
                                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-emerald-500/10 transition text-left ${selectedCountry?.code === c.code ? "bg-emerald-500/10" : ""}`}>
                                  <span className="text-lg leading-none">{c.flag}</span>
                                  <span className="text-white flex-1 truncate">{c.name}</span>
                                  <span className="text-emerald-400/70 text-xs font-mono">{c.dial}</span>
                                </button>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Phone */}
                  <div>
                    <div className="flex gap-2">
                      <div className={`px-3.5 py-3.5 rounded-xl bg-white/[0.04] border flex items-center gap-1.5 shrink-0 min-w-[88px] justify-center transition ${selectedCountry ? "border-emerald-500/25" : "border-white/8"}`}>
                        {selectedCountry ? (
                          <>
                            <span className="text-base leading-none">{selectedCountry.flag}</span>
                            <span className="text-emerald-400 text-sm font-bold font-mono">{selectedCountry.dial}</span>
                          </>
                        ) : (
                          <span className="text-white/25 text-xs font-mono">+ —</span>
                        )}
                      </div>
                      <Field icon={Phone}>
                        <input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange}
                          placeholder={selectedCountry ? t("auth.enterPhoneNumber", "Phone number") : t("auth.selectCountryFirst", "Select country first")}
                          disabled={!selectedCountry} required
                          className={`${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`} />
                      </Field>
                    </div>
                    {selectedCountry && form.phoneNumber && (
                      <p className="text-white/30 text-[11px] mt-1.5 ml-1">
                        {t("auth.willBeSavedAs", "Saved as:")} <span className="text-emerald-400 font-mono">{selectedCountry.dial} {form.phoneNumber}</span>
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <Field icon={Lock}>
                    <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange}
                      placeholder={t("auth.password", "Password (min 6 characters)")} required minLength={6}
                      className={`${inputCls} pr-11`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </Field>

                  {/* Confirm Password */}
                  <Field icon={Lock}>
                    <input type={showConfirm ? "text" : "password"} name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                      placeholder={t("auth.confirmPassword", "Confirm Password")} required minLength={6}
                      className={`${inputCls} pr-11`} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition">
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </Field>

                  {form.confirmPassword && (
                    <p className={`text-[11px] flex items-center gap-1 ml-1 ${
                      form.password === form.confirmPassword ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {form.password === form.confirmPassword
                        ? <><CheckCircle size={11} /> {t("auth.passwordsMatch", "Passwords match")}</>
                        : <><AlertTriangle size={11} /> {t("auth.passwordsDoNotMatch", "Passwords do not match")}</>}
                    </p>
                  )}

                  {/* Referral */}
                  {!refCode && (
                    <input type="text" name="referralCode" value={form.referralCode} onChange={handleChange}
                      placeholder={t("auth.referralCode", "Referral Code (Optional)")}
                      className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/8 outline-none focus:border-emerald-500/50 transition text-sm text-white placeholder:text-white/30" />
                  )}

                  {/* Terms */}
                  <label className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-white/[0.02] border border-white/8 cursor-pointer hover:bg-white/[0.04] transition select-none">
                    <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded accent-emerald-500 cursor-pointer shrink-0" />
                    <span className="text-white/55 text-xs leading-relaxed">
                      {t("auth.termsAgree", "I agree to the")}{" "}
                      <Link to="/terms" target="_blank" className="text-emerald-400 hover:underline font-semibold">{t("auth.termsLink", "Terms of Service")}</Link>
                      {" "}{t("auth.and", "and")}{" "}
                      <Link to="/privacy" target="_blank" className="text-emerald-400 hover:underline font-semibold">{t("auth.privacyLink", "Privacy Policy")}</Link>
                    </span>
                  </label>

                  {/* Submit */}
                  <button type="submit" disabled={loading || !agreedToTerms}
                    className="group w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2">
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t("auth.registering", "Creating Account...")}</>
                    ) : (
                      <>{t("auth.register", "Create Account")}<ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                </form>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-white/8" />
                  <span className="text-white/25 text-xs">{t("auth.alreadyHave", "Already have an account?")}</span>
                  <div className="flex-1 h-px bg-white/8" />
                </div>

                <button onClick={() => navigate("/login")}
                  className="w-full py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] transition text-sm text-white/60 hover:text-white font-medium">
                  {t("auth.signIn", "Sign In")}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-3 mt-5 text-white/25 text-[11px]">
          <span>🔒 {t("common.sslSecured", "SSL Secured")}</span>
          <span>·</span>
          <span>🛡️ {t("common.dataProtected", "Data Protected")}</span>
          <span>·</span>
          <span>⚡ {t("common.instantAccess", "Instant Access")}</span>
        </div>
      </motion.div>
    </div>
  );
}
