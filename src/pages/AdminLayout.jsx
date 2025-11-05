import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

export default function AdminLayout() {
  const admin = JSON.parse(localStorage.getItem("adminUser"));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div 
          className="fixed inset-0 bg-black opacity-50"
          onClick={() => setSidebarOpen(false)}
        ></div>
        <aside className="fixed left-0 top-0 w-64 bg-gray-900 text-white h-full flex flex-col z-50 shadow-lg">
          <div className="p-6 text-2xl font-bold border-b border-gray-700 flex justify-between items-center">
            ⚡ Admin Panel
            <button onClick={() => setSidebarOpen(false)} className="text-white text-2xl">
              <FiX />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link to="/admin" className="block px-3 py-2 rounded hover:bg-gray-800">🏠 Dashboard</Link>
            <Link to="/admin/users" className="block px-3 py-2 rounded hover:bg-gray-800">👥 Manage Users</Link>
            <Link to="/admin/plans" className="block px-3 py-2 rounded hover:bg-gray-800">📦 Manage Plans</Link>
            <Link to="/admin/deposits" className="block px-3 py-2 rounded hover:bg-gray-800">💰 Deposits</Link>
            <Link to="/admin/withdrawals" className="block px-3 py-2 rounded hover:bg-gray-800">💸 Withdrawals</Link>
          </nav>
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
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-gray-900 text-white">
        <div className="p-6 text-2xl font-bold border-b border-gray-700">⚡ Admin Panel</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className="block px-3 py-2 rounded hover:bg-gray-800">🏠 Dashboard</Link>
          <Link to="/admin/users" className="block px-3 py-2 rounded hover:bg-gray-800">👥 Manage Users</Link>
          <Link to="/admin/plans" className="block px-3 py-2 rounded hover:bg-gray-800">📦 Manage Plans</Link>
          <Link to="/admin/deposits" className="block px-3 py-2 rounded hover:bg-gray-800">💰 Deposits</Link>
          <Link to="/admin/withdrawals" className="block px-3 py-2 rounded hover:bg-gray-800">💸 Withdrawals</Link>
        </nav>
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center bg-white shadow p-4">
          <div className="flex items-center space-x-4">
            <button
              className="md:hidden text-gray-700 text-2xl"
              onClick={() => setSidebarOpen(true)}
            >
              <FiMenu />
            </button>
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          </div>
          <span className="text-gray-600">Welcome, {admin?.name || "Admin"}</span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
