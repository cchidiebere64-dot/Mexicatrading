import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Package, ArrowDownCircle,
  ArrowUpCircle, Wallet, Menu, X,
  ShieldCheck, LogOut, Activity, Radio, CreditCard, BarChart3, Star, MessageSquare,
} from "lucide-react";
import { T, ThemeStyles } from "./system.jsx";

const c = T.color;

/* Grouped so the sidebar reads as sections rather than one long list */
const navGroups = [
  {
    label: "Overview",
    items: [
      { path: "/admin",           label: "Dashboard", icon: LayoutDashboard, exact: true },
      { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Money",
    items: [
      { path: "/admin/deposits",    label: "Deposits",    icon: ArrowDownCircle },
      { path: "/admin/withdrawals", label: "Withdrawals", icon: ArrowUpCircle },
      { path: "/admin/credit-user", label: "Credit user", icon: CreditCard },
      { path: "/admin/wallets",     label: "Wallets",     icon: Wallet },
    ],
  },
  {
    label: "Members",
    items: [
      { path: "/admin/users",   label: "Users",        icon: Users },
      { path: "/admin/kyc",     label: "Verification", icon: ShieldCheck },
      { path: "/admin/reviews", label: "Reviews",      icon: Star },
    ],
  },
  {
    label: "Products",
    items: [
      { path: "/admin/plans",        label: "Plans",         icon: Package },
      { path: "/admin/active-plans", label: "Investments",   icon: Activity },
      { path: "/admin/broadcast",    label: "Broadcast",     icon: Radio },
      { path: "/admin/chat", label: "Messages", icon: MessageSquare },
    ],
  },
];

const allItems = navGroups.flatMap(g => g.items);

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const isActive = (path, exact) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("hasVisitedDashboard");
    navigate("/admin/login");
  };

  const current = allItems.find(n => isActive(n.path, n.exact));
  const currentLabel = current?.label || "Admin";

  /* close the drawer whenever the route changes */
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const rowStyle = (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 11,
    width: "100%",
    padding: "11px 18px",
    fontSize: T.size.sm,
    color: active ? c.gain : c.text2,
    borderLeft: `2px solid ${active ? c.gain : "transparent"}`,
    background: active ? "rgba(63,143,95,.07)" : "transparent",
    transition: "background .2s, color .2s",
    textAlign: "left",
  });

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ background: c.panel }}>

      {/* Brand */}
      <div style={{ padding: "20px 18px", borderBottom: `1px solid ${c.line}` }}>
        <p className="mono" style={{
          fontSize: T.size.micro, letterSpacing: ".24em",
          textTransform: "uppercase", color: c.brass, marginBottom: 6,
        }}>
          Admin
        </p>
        <p className="display" style={{ fontSize: T.size.lg, color: "#fff", lineHeight: 1 }}>
          MexicaTrading
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto" style={{ paddingTop: 6, paddingBottom: 6 }}>
        {navGroups.map((group, gi) => (
          <div key={gi} style={{ marginBottom: 4 }}>
            <p className="eyebrow" style={{ padding: "12px 18px 6px" }}>{group.label}</p>
            {group.items.map((item) => {
              const active = isActive(item.path, item.exact);
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path} style={rowStyle(active)}>
                  <Icon size={15} style={{ flexShrink: 0, opacity: active ? 1 : .55 }} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Account */}
      <div style={{ borderTop: `1px solid ${c.line}`, padding: 14 }}>
        {user?.name && (
          <div style={{ padding: "0 4px 12px" }}>
            <p className="eyebrow" style={{ marginBottom: 4 }}>Signed in</p>
            <p className="truncate" style={{ fontSize: T.size.sm, color: c.text }}>{user.name}</p>
            <p className="mono truncate" style={{ fontSize: T.size.tiny, color: c.text4, marginTop: 2 }}>
              {user.email}
            </p>
          </div>
        )}

        <button onClick={handleLogout}
          className="mono w-full flex items-center justify-center gap-2"
          style={{
            padding: "12px 0",
            fontSize: T.size.tiny, letterSpacing: ".14em", textTransform: "uppercase",
            border: `1px solid rgba(180,85,63,.3)`, color: c.loss, background: "transparent",
          }}>
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="ui" style={{ minHeight: "100vh", background: c.ink, color: c.text }}>
      <ThemeStyles />

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:block"
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0, width: 236,
          borderRight: `1px solid ${c.line}`, zIndex: 30,
        }}>
        <SidebarContent />
      </aside>

      {/* ── Mobile drawer ── */}
      {sidebarOpen && (
        <div className="lg:hidden" style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(8,9,11,.82)" }}
            onClick={() => setSidebarOpen(false)} />
          <div style={{
            position: "absolute", top: 0, left: 0, bottom: 0, width: 262,
            borderRight: `1px solid ${c.line}`,
          }}>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* ── Main ── */}
      <div style={{ paddingLeft: 0 }} className="lg:pl-[236px]">

        {/* Top bar */}
        <header style={{
          position: "sticky", top: 0, zIndex: 20,
          background: "rgba(14,16,19,.96)", backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${c.line}`,
        }}>
          <div className="flex items-center gap-3" style={{ padding: "14px 20px" }}>
            <button onClick={() => setSidebarOpen(true)} aria-label="Menu"
              className="lg:hidden flex items-center justify-center shrink-0"
              style={{ width: 34, height: 34, border: `1px solid ${c.line}`, background: c.fill, color: c.text2 }}>
              <Menu size={16} />
            </button>

            <div style={{ minWidth: 0, flex: 1 }}>
              <p className="eyebrow" style={{ marginBottom: 2 }}>Admin</p>
              <h2 className="display truncate" style={{ fontSize: T.size.lg, lineHeight: 1.1 }}>
                {currentLabel}
              </h2>
            </div>

            <Link to="/" target="_blank" rel="noopener noreferrer"
              className="mono hidden sm:flex items-center shrink-0"
              style={{
                padding: "8px 12px", fontSize: T.size.tiny,
                letterSpacing: ".14em", textTransform: "uppercase",
                border: `1px solid ${c.line}`, color: c.text3,
              }}>
              View site
            </Link>
          </div>
        </header>

        {/* Page */}
        <main style={{ padding: "24px 20px 64px", maxWidth: 960, margin: "0 auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
