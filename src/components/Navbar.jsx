import { Link, useLocation, useNavigate } from "react-router-dom";
import mexicanLogo from "../assets/mexican.png";
import { useState, useEffect } from "react";
import { X, Menu, LayoutDashboard, LogOut, ChevronRight, Settings, MessageCircle } from "lucide-react";
import LanguageSelector from "./LanguageSelector.jsx";
import { useTranslation } from "react-i18next";

// Pages considered "outside the app"
const OUTSIDE_PAGES = ["/", "/login", "/register"];

// Opens the Tawk.to chat widget
const openChat = () => {
  try {
    if (window.Tawk_API && typeof window.Tawk_API.maximize === "function") {
      window.Tawk_API.showWidget();
      window.Tawk_API.maximize();
    } else {
      // Fallback if Tawk hasn't loaded yet — keep trying
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.Tawk_API && typeof window.Tawk_API.maximize === "function") {
          window.Tawk_API.showWidget();
          window.Tawk_API.maximize();
          clearInterval(interval);
        }
        if (attempts > 20) clearInterval(interval); // give up after 10s
      }, 500);
    }
  } catch (e) {
    console.warn("Tawk.to not ready:", e);
  }
};

export default function Navbar() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const navLinks = [
    { to: "/", label: t("nav.home"), protected: false },
    { to: "/plans", label: t("nav.plans"), protected: true },
    { to: "/deposit", label: t("nav.deposit"), protected: true },
    { to: "/withdraw", label: t("nav.withdraw"), protected: true },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleProtectedNav = (path) => {
    const currentPath = location.pathname;
    if (OUTSIDE_PAGES.includes(currentPath) || !token) {
      navigate("/login");
      return;
    }
    navigate(path);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#080c18]/95 backdrop-blur-xl border-b border-white/8 shadow-lg"
          : "bg-[#080c18]/70 backdrop-blur-lg border-b border-white/5"
      }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center px-5 py-3">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <img
                src={mexicanLogo}
                alt="MexicaTrading Logo"
                className="h-9 w-9 object-contain drop-shadow-[0_0_8px_#10B981] group-hover:drop-shadow-[0_0_14px_#10B981] transition-all"
              />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-white text-base font-bold tracking-tight">
              Mexica<span className="text-emerald-400">Trading</span>
            </span>
          </Link>

          {/* DESKTOP LINKS */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.protected ? (
                <button
                  key={link.to}
                  onClick={() => handleProtectedNav(link.to)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.to)
                      ? "text-emerald-400 bg-emerald-500/10"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.to)
                      ? "text-emerald-400 bg-emerald-500/10"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}

            {/* 💬 Chat Support — Desktop */}
            <button
              onClick={openChat}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-emerald-400/80 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
            >
              <MessageCircle size={15} />
              Chat Support
            </button>
          </nav>

          {/* DESKTOP RIGHT */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSelector />
            {token && !OUTSIDE_PAGES.includes(location.pathname) ? (
              <>
                <button
                  onClick={() => handleProtectedNav("/dashboard")}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
                >
                  <LayoutDashboard size={15} />
                  {t("nav.dashboard")}
                </button>
                <button
                  onClick={() => handleProtectedNav("/settings")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                    isActive("/settings")
                      ? "text-emerald-400 bg-emerald-500/10"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Settings size={15} />
                  {t("nav.settings", "Settings")}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={15} />
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
                >
                  {t("nav.signIn")}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-all shadow-lg shadow-emerald-500/20"
                >
                  {t("nav.getStarted")}
                </Link>
              </>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />

          <div className="absolute top-0 right-0 h-full w-72 bg-[#0e1422] border-l border-white/8 shadow-2xl flex flex-col">

            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <span className="text-white font-bold text-sm">
                Mexica<span className="text-emerald-400">Trading</span>
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* User info */}
            {token && !OUTSIDE_PAGES.includes(location.pathname) && user?.name && (
              <div className="px-5 py-4 border-b border-white/8">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{user.name}</p>
                    <p className="text-white/30 text-xs">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nav Links */}
            <nav className="flex flex-col gap-1 px-3 py-4 flex-1 overflow-y-auto">
              {navLinks.map((link) =>
                link.protected ? (
                  <button
                    key={link.to}
                    onClick={() => handleProtectedNav(link.to)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive(link.to)
                        ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                    <ChevronRight size={14} className="opacity-40" />
                  </button>
                ) : (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive(link.to)
                        ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                    <ChevronRight size={14} className="opacity-40" />
                  </Link>
                )
              )}

              {token && !OUTSIDE_PAGES.includes(location.pathname) && (
                <>
                  <button
                    onClick={() => handleProtectedNav("/dashboard")}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive("/dashboard")
                        ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <LayoutDashboard size={15} />
                      {t("nav.dashboard")}
                    </span>
                    <ChevronRight size={14} className="opacity-40" />
                  </button>

                  <button
                    onClick={() => handleProtectedNav("/settings")}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive("/settings")
                        ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Settings size={15} />
                      {t("nav.settings", "Settings")}
                    </span>
                    <ChevronRight size={14} className="opacity-40" />
                  </button>
                </>
              )}

              {/* 💬 Chat Support — Mobile (inside drawer) */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setTimeout(openChat, 300); // slight delay so drawer closes first
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all mt-1"
              >
                <span className="flex items-center gap-2">
                  <MessageCircle size={15} />
                  Chat Support
                </span>
                <ChevronRight size={14} className="opacity-40" />
              </button>
            </nav>

            {/* Bottom Actions */}
            <div className="px-3 pb-6 space-y-2">
              <div className="flex justify-center py-2">
                <LanguageSelector />
              </div>

              {token && !OUTSIDE_PAGES.includes(location.pathname) ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all"
                >
                  <LogOut size={15} />
                  {t("nav.logout")}
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block text-center py-3 rounded-xl border border-white/10 bg-white/5 text-white/60 text-sm font-medium hover:bg-white/10 transition-all"
                  >
                    {t("nav.signIn")}
                  </Link>
                  <Link
                    to="/register"
                    className="block text-center py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20"
                  >
                    {t("nav.getStarted")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
