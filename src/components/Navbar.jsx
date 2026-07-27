import { Link, useLocation, useNavigate } from "react-router-dom";
import mexicanLogo from "../assets/mexican.png";
import { useState, useEffect } from "react";
import { X, Menu, LayoutDashboard, LogOut, ChevronRight, Settings, MessageCircle } from "lucide-react";
import LanguageSelector from "./LanguageSelector.jsx";
import { useTranslation } from "react-i18next";
import { T } from "../pages/system.jsx";

const c = T.color;

// Pages considered "outside the app"
const OUTSIDE_PAGES = ["/", "/login", "/register"];

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

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

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
  const loggedIn = token && !OUTSIDE_PAGES.includes(location.pathname);

  /* Desktop link — active state is an underline rule, not a filled pill */
  const linkStyle = (active) => ({
    position: "relative",
    padding: "20px 14px",
    fontFamily: "'IBM Plex Mono',monospace",
    fontSize: T.size.tiny,
    letterSpacing: ".16em",
    textTransform: "uppercase",
    color: active ? c.gain : c.text3,
    borderBottom: `2px solid ${active ? c.gain : "transparent"}`,
    marginBottom: -1,
    transition: "color .2s",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  });

  const rightBtn = (active, tone) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "9px 13px",
    fontFamily: "'IBM Plex Mono',monospace",
    fontSize: T.size.tiny,
    letterSpacing: ".14em",
    textTransform: "uppercase",
    color: tone || (active ? c.gain : c.text3),
    border: `1px solid ${active ? "rgba(63,143,95,.35)" : c.line}`,
    background: active ? "rgba(63,143,95,.08)" : "transparent",
    transition: "color .2s, border-color .2s",
  });

  const drawerRow = (active) => ({
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 18px",
    fontSize: T.size.sm,
    color: active ? c.gain : c.text2,
    borderBottom: `1px solid ${c.lineSoft}`,
    borderLeft: `2px solid ${active ? c.gain : "transparent"}`,
    background: active ? "rgba(63,143,95,.06)" : "transparent",
    textAlign: "left",
    transition: "background .2s",
  });

  return (
    <>
      <header className="ui" style={{
        position: "fixed", top: 0, left: 0, width: "100%", zIndex: 50,
        background: scrolled ? "rgba(14,16,19,.97)" : "rgba(14,16,19,.85)",
        backdropFilter: "blur(14px)",
        borderBottom: `1px solid ${scrolled ? c.line : c.lineSoft}`,
        transition: "background .3s, border-color .3s",
      }}>
        <div className="mx-auto flex justify-between items-stretch px-5" style={{ maxWidth: 1200 }}>

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2.5" style={{ paddingTop: 14, paddingBottom: 14 }}>
            <img src={mexicanLogo} alt="MexicaTrading"
              style={{ height: 30, width: 30, objectFit: "contain" }} />
            <span className="display" style={{ fontSize: T.size.lg, color: "#fff", lineHeight: 1 }}>
              MexicaTrading
            </span>
          </Link>

          {/* DESKTOP LINKS */}
          <nav className="hidden md:flex items-stretch">
            {navLinks.map((link) =>
              link.protected ? (
                <button key={link.to} onClick={() => handleProtectedNav(link.to)} style={linkStyle(isActive(link.to))}>
                  {link.label}
                </button>
              ) : (
                <Link key={link.to} to={link.to} style={linkStyle(isActive(link.to))}>
                  {link.label}
                </Link>
              )
            )}
            <button onClick={() => handleProtectedNav("/chat")} style={linkStyle(isActive("/chat"))}>
              <MessageCircle size={13} /> Support
            </button>
          </nav>

          {/* DESKTOP RIGHT */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSelector />
            {loggedIn ? (
              <>
                <button onClick={() => handleProtectedNav("/dashboard")} style={rightBtn(isActive("/dashboard"))}>
                  <LayoutDashboard size={13} /> {t("nav.dashboard")}
                </button>
                <button onClick={() => handleProtectedNav("/settings")} style={rightBtn(isActive("/settings"))}>
                  <Settings size={13} />
                </button>
                <button onClick={handleLogout} style={rightBtn(false, c.loss)}>
                  <LogOut size={13} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={rightBtn(false)}>{t("nav.signIn")}</Link>
                <Link to="/register" style={{
                  ...rightBtn(false),
                  background: c.gain, color: "#fff", border: `1px solid ${c.gain}`,
                }}>
                  {t("nav.getStarted")}
                </Link>
              </>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            className="md:hidden flex items-center justify-center"
            style={{ width: 38, height: 38, alignSelf: "center", border: `1px solid ${c.line}`, color: c.text2, background: c.fill }}>
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden ui">
          <div className="absolute inset-0" style={{ background: "rgba(8,9,11,.8)" }} onClick={() => setMenuOpen(false)} />

          <div className="absolute top-0 right-0 h-full flex flex-col"
            style={{ width: 288, background: c.panel, borderLeft: `1px solid ${c.line}` }}>

            {/* Drawer header */}
            <div className="flex items-center justify-between"
              style={{ padding: "16px 18px", borderBottom: `1px solid ${c.line}` }}>
              <span className="display" style={{ fontSize: T.size.base, color: "#fff" }}>MexicaTrading</span>
              <button onClick={() => setMenuOpen(false)} aria-label="Close"
                className="flex items-center justify-center"
                style={{ width: 32, height: 32, background: c.fill, color: c.text3 }}>
                <X size={15} />
              </button>
            </div>

            {/* User */}
            {loggedIn && user?.name && (
              <div style={{ padding: "16px 18px", borderBottom: `1px solid ${c.line}` }}>
                <p className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".2em", textTransform: "uppercase", color: c.text4, marginBottom: 6 }}>
                  Signed in
                </p>
                <p style={{ fontSize: T.size.sm, color: c.text }}>{user.name}</p>
                <p className="mono truncate" style={{ fontSize: T.size.tiny, color: c.text4, marginTop: 2 }}>{user.email}</p>
              </div>
            )}

            {/* Links */}
            <nav className="flex-1 overflow-y-auto">
              {navLinks.map((link) =>
                link.protected ? (
                  <button key={link.to} onClick={() => handleProtectedNav(link.to)} style={drawerRow(isActive(link.to))}>
                    {link.label}
                    <ChevronRight size={13} style={{ opacity: .35 }} />
                  </button>
                ) : (
                  <Link key={link.to} to={link.to} style={drawerRow(isActive(link.to))}>
                    {link.label}
                    <ChevronRight size={13} style={{ opacity: .35 }} />
                  </Link>
                )
              )}

              {loggedIn && (
                <>
                  <button onClick={() => handleProtectedNav("/dashboard")} style={drawerRow(isActive("/dashboard"))}>
                    <span className="flex items-center gap-2"><LayoutDashboard size={14} /> {t("nav.dashboard")}</span>
                    <ChevronRight size={13} style={{ opacity: .35 }} />
                  </button>
                  <button onClick={() => handleProtectedNav("/history")} style={drawerRow(isActive("/history"))}>
                    <span className="flex items-center gap-2">History</span>
                    <ChevronRight size={13} style={{ opacity: .35 }} />
                  </button>
                  <button onClick={() => handleProtectedNav("/settings")} style={drawerRow(isActive("/settings"))}>
                    <span className="flex items-center gap-2"><Settings size={14} /> {t("nav.settings", "Settings")}</span>
                    <ChevronRight size={13} style={{ opacity: .35 }} />
                  </button>
                </>
              )}

              <button onClick={() => handleProtectedNav("/chat")}
                style={{ ...drawerRow(isActive("/chat")), color: c.gain }}>
                <span className="flex items-center gap-2"><MessageCircle size={14} /> Support</span>
                <ChevronRight size={13} style={{ opacity: .35 }} />
              </button>
            </nav>

            {/* Bottom */}
            <div style={{ padding: 14, borderTop: `1px solid ${c.line}` }}>
              <div className="flex justify-center" style={{ marginBottom: 12 }}>
                <LanguageSelector />
              </div>

              {loggedIn ? (
                <button onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 mono"
                  style={{
                    padding: "13px 0", fontSize: T.size.tiny, letterSpacing: ".14em", textTransform: "uppercase",
                    border: `1px solid rgba(180,85,63,.35)`, color: c.loss, background: "transparent",
                  }}>
                  <LogOut size={13} /> {t("nav.logout")}
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Link to="/login" className="mono block text-center"
                    style={{
                      padding: "13px 0", fontSize: T.size.tiny, letterSpacing: ".14em", textTransform: "uppercase",
                      border: `1px solid ${c.line}`, color: c.text2,
                    }}>
                    {t("nav.signIn")}
                  </Link>
                  <Link to="/register" className="mono block text-center"
                    style={{
                      padding: "13px 0", fontSize: T.size.tiny, letterSpacing: ".14em", textTransform: "uppercase",
                      background: c.gain, color: "#fff", border: `1px solid ${c.gain}`,
                    }}>
                    {t("nav.getStarted")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
