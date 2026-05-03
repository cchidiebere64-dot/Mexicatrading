import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Package, ArrowDownCircle,
  ArrowUpCircle, Wallet, ChevronRight, Menu, X,
  ShieldCheck, LogOut, Bell, Activity,
} from "lucide-react";

const navItems = [
  { path: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} />, exact: true },
  { path: "/admin/users", label: "Manage Users", icon: <Users size={18} /> },
  { path: "/admin/plans", label: "Manage Plans", icon: <Package size={18} /> },
  { path: "/admin/active-plans", label: "Active Plans", icon: <Activity size={18} /> },
  { path: "/admin/deposits", label: "Deposits", icon: <ArrowDownCircle size={18} /> },
  { path: "/admin/withdrawals", label: "Withdrawals", icon: <ArrowUpCircle size={18} /> },
  { path: "/admin/wallets", label: "Manage Wallets", icon: <Wallet size={18} /> },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("hasVisitedDashboard");
    navigate("/admin/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <ShieldCheck size={18} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-white font-bold text-sm tracking-tight">MexicaTrading</p>
            <p className="text-white/30 text-xs">Operations Center</p>
          </div>
        </div>
      </div>

      {/* Admin Info */}
      <div className="px-6 py-4 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div>
            <p className="text-white text-sm font-semibold">{user?.name || "Admin"}</p>
            <p className="text-emerald-400 text-xs">Super Admin</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-white/20 text-xs font-semibold uppercase tracking-widest px-3 mb-3">
          Navigation
        </p>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
              isActive(item.path, item.exact)
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={isActive(item.path, item.exact) ? "text-emerald-400" : "text-white/30 group-hover:text-white/60"}>
                {item.icon}
              </span>
              {item.label}
            </div>
            <ChevronRight size={14} className="opacity-30" />
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/8">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#080c18] text-white overflow-hidden">

      {/* AMBIENT BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] rounded-full top-0 left-0" />
        <div className="absolute w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full bottom-0 right-0" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-[#0e1422] border-r border-white/8 z-50 shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <span className="text-white font-bold text-sm">Admin Panel</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex md:flex-col w-64 bg-[#0e1422] border-r border-white/8 relative z-10 shrink-0">
        <SidebarContent />
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">

        {/* TOP HEADER */}
        <header className="flex justify-between items-center bg-[#080c18]/80 backdrop-blur-xl border-b border-white/8 px-6 py-4 shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-white font-bold text-base">
                {navItems.find(n =>
                  n.exact ? location.pathname === n.path : location.pathname.startsWith(n.path)
                )?.label || "Admin Panel"}
              </h1>
              <p className="text-white/30 text-xs">MexicaTrading Operations Center</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="flex items-center gap-2 text-xs text-white/40 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>

            {/* Admin badge */}
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span className="text-emerald-400 text-xs font-semibold">
                {user?.name || "Admin"}
              </span>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
