import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function AdminLayout() {
  const navigate = useNavigate();

  const logout = () => {
    sessionStorage.removeItem("adminToken");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900 text-gray-200">

      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col justify-between fixed top-0 left-0 h-full">

        <div className="p-6">
          <h2 className="text-2xl font-bold text-emerald-400 mb-8">Admin Panel</h2>

          <nav className="space-y-4">
            <Link to="/admin" className="block hover:text-emerald-400">Dashboard</Link>
            <Link to="/admin/users" className="block hover:text-emerald-400">Manage Users</Link>
            <Link to="/admin/deposits" className="block hover:text-emerald-400">Deposits</Link>
            <Link to="/admin/withdrawals" className="block hover:text-emerald-400">Withdrawals</Link>
            <Link to="/admin/plans" className="block hover:text-emerald-400">Manage Plans</Link>
          </nav>
        </div>

        {/* LOGOUT (Pinned Bottom) */}
        <div className="p-6">
          <button
            onClick={logout}
            className="w-full py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            Logout
          </button>
        </div>

      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 ml-64 p-8 overflow-auto">
        <Outlet />
      </main>

    </div>
  );
}
