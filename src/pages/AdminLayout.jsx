import React from "react";
import { Link, Outlet } from "react-router-dom";

export default function AdminLayout() {
  const admin = JSON.parse(localStorage.getItem("adminUser"));

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar (Permanent) */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-gray-700">
          ⚡ Admin Panel
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className="block px-3 py-2 rounded hover:bg-gray-800">🏠 Dashboard</Link>
          <Link to="/admin/users" className="block px-3 py-2 rounded hover:bg-gray-800">👥 Manage Users</Link>
          <Link to="/admin/plans" className="block px-3 py-2 rounded hover:bg-gray-800">📦 Manage Plans</Link>
          <Link to="/admin/deposits" className="block px-3 py-2 rounded hover:bg-gray-800">💰 Deposits</Link>
          <Link to="/admin/withdrawals" className="block px-3 py-2 rounded hover:bg-gray-800">💸 Withdrawals</Link>
        </nav>

        {/* Logout stays at the bottom */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => {
              sessionStorage.removeItem("adminToken");
              window.location.href = "/login";
            }}
            className="w-full py-2 bg-red-600 rounded hover:bg-red-700"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Top Header (Permanent) */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          <span className="text-gray-600">Welcome, {admin?.name || "Admin"}</span>
        </header>

        {/* Page Content Loads Here */}
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
