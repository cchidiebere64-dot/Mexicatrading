import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check, ChevronDown } from "lucide-react";

const languages = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es-MX", label: "Español (México)", flag: "🇲🇽" },
  { code: "es", label: "Español (España)", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "ar", label: "العربية", flag: "🇦🇪" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const buttonRef = useRef(null);

  const current = languages.find(l => l.code === i18n.language) || languages[0];

  const handleSelect = async (code) => {
  i18n.changeLanguage(code);
  localStorage.setItem("mexica_language", code);
  setOpen(false);

  // ✅ Save language to user account
  const token = sessionStorage.getItem("token");
  if (token) {
    try {
      await fetch("https://mexicatradingbackend.onrender.com/api/user/language", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ language: code }),
      });
    } catch (err) {
      console.error("Failed to save language:", err);
    }
  }
};

  const handleOpen = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const dropW = 210;
      const dropH = 340;

      // Horizontal — open left if not enough space on right
      const spaceRight = screenW - rect.right;
      const spaceLeft = rect.left;
      let left;
      if (spaceRight >= dropW) {
        // Enough space on the right
        left = rect.left;
      } else if (spaceLeft >= dropW) {
        // Open to the left
        left = rect.right - dropW;
      } else {
        // Center it on screen
        left = Math.max(8, (screenW - dropW) / 2);
      }

      // Vertical — open up if not enough space below
      const spaceBelow = screenH - rect.bottom;
      let top;
      if (spaceBelow >= dropH) {
        top = rect.bottom + 8;
      } else {
        top = Math.max(8, rect.top - dropH - 8);
      }

      setDropdownStyle({
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
        width: `${dropW}px`,
        zIndex: 9999,
      });
    }
    setOpen(!open);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // RTL support for Arabic
  useEffect(() => {
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  return (
    <div ref={buttonRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm text-white/60 hover:text-white"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="text-xs font-medium hidden sm:block">{current.label.split(" ")[0]}</span>
        <ChevronDown size={12} className={`text-white/30 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Full screen backdrop */}
      {open && (
        <div
          className="fixed inset-0"
          style={{ zIndex: 9998 }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Smart dropdown — opens in available space */}
      {open && (
        <div
          style={dropdownStyle}
          className="bg-[#0d1221] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div
            className="p-2 space-y-0.5"
            style={{ maxHeight: "320px", overflowY: "auto" }}
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  i18n.language === lang.code
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base leading-none">{lang.flag}</span>
                  <span className="font-medium text-xs">{lang.label}</span>
                </div>
                {i18n.language === lang.code && (
                  <Check size={13} className="text-emerald-400 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
