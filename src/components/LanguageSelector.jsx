import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check, ChevronDown } from "lucide-react";
import { T } from "../pages/system.jsx";

const c = T.color;

const languages = [
  { code: "en",    label: "English",           flag: "🇺🇸" },
  { code: "es-MX", label: "Español (México)",  flag: "🇲🇽" },
  { code: "es",    label: "Español (España)",  flag: "🇪🇸" },
  { code: "fr",    label: "Français",          flag: "🇫🇷" },
  { code: "pt",    label: "Português",         flag: "🇵🇹" },
  { code: "ar",    label: "العربية",            flag: "🇦🇪" },
  { code: "zh",    label: "中文",               flag: "🇨🇳" },
  { code: "ru",    label: "Русский",           flag: "🇷🇺" },
  { code: "de",    label: "Deutsch",           flag: "🇩🇪" },
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

      const spaceRight = screenW - rect.right;
      const spaceLeft = rect.left;
      let left;
      if (spaceRight >= dropW) {
        left = rect.left;
      } else if (spaceLeft >= dropW) {
        left = rect.right - dropW;
      } else {
        left = Math.max(8, (screenW - dropW) / 2);
      }

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  return (
    <div ref={buttonRef} className="ui" style={{ position: "relative" }}>

      {/* Trigger */}
      <button
        onClick={handleOpen}
        aria-label="Change language"
        aria-expanded={open}
        className="flex items-center gap-1.5"
        style={{
          padding: "9px 11px",
          background: open ? "rgba(63,143,95,.08)" : c.fill,
          border: `1px solid ${open ? "rgba(63,143,95,.3)" : c.line}`,
          color: open ? c.gain : c.text3,
          transition: "color .2s, border-color .2s, background .2s",
        }}>
        <Globe size={13} style={{ flexShrink: 0 }} />
        <span className="mono" style={{
          fontSize: T.size.tiny,
          letterSpacing: ".14em",
          textTransform: "uppercase",
        }}>
          {current.code.split("-")[0]}
        </span>
        <ChevronDown size={11}
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s", opacity: .6 }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          ...dropdownStyle,
          background: c.panelAlt,
          border: `1px solid ${c.line}`,
          boxShadow: "0 12px 40px rgba(0,0,0,.5)",
          maxHeight: 340,
          overflowY: "auto",
        }}>
          <p className="mono" style={{
            padding: "10px 14px",
            fontSize: T.size.micro,
            letterSpacing: ".24em",
            textTransform: "uppercase",
            color: c.text4,
            borderBottom: `1px solid ${c.line}`,
          }}>
            Language
          </p>

          {languages.map((lang, i) => {
            const active = i18n.language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className="w-full flex items-center gap-2.5 text-left hover-fill"
                style={{
                  padding: "11px 14px",
                  borderBottom: i < languages.length - 1 ? `1px solid ${c.lineSoft}` : "none",
                  borderLeft: `2px solid ${active ? c.gain : "transparent"}`,
                  background: active ? "rgba(63,143,95,.07)" : "transparent",
                  transition: "background .2s",
                }}>
                <span style={{ fontSize: 15, lineHeight: 1, flexShrink: 0 }}>{lang.flag}</span>
                <span className="truncate" style={{
                  flex: 1,
                  fontSize: T.size.sm,
                  color: active ? c.gain : c.text2,
                }}>
                  {lang.label}
                </span>
                {active && <Check size={12} style={{ color: c.gain, flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
