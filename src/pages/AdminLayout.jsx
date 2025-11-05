import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);

  const logout = () => {
    sessionStorage.removeItem("adminToken");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-200">

      {/* Sidebar */}
      <div className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-gray-800 border-r border-gray-700 p-5 
        transform ${openMenu ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-300`}>
        
        <h2 className="text-2xl font-bold mb-6 text-emerald-400">Admin Panel</h2>

        <nav className="flex flex-col gap-3">
          <Link to="/admin" className="hover:text-emerald-400">Dashboard</Link>
          <Link to="/admin/users" className="hover:text-emerald-400">Manage Users</Link>
          <Link to="/admin/deposits" className="hover:text-emerald-400">Deposits</Link>
          <Link to="/admin/withdrawals" className="hover:text-emerald-400">Withdrawals</Link>
          <Link to="/admin/plans" className="hover:text-emerald-400">Manage Plans</Link>
        </nav>

        <button
          onClick={logout}
          className="mt-6 bg-red-600 hover:bg-red-700 py-2 w-full rounded-lg text-white"
        >
          Logout
        </button>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setOpenMenu(!openMenu)}
        className="md:hidden fixed top-4 left-4 bg-emerald-600 text-white p-2 rounded-lg z-50"
      >
        ☰
      </button>

      {/* Content Area */}
      <div className="flex-1 ml-0 md:ml-64 p-6 md:p-10 transition-all">
        <Outlet />
      </div>
    </div>
  );
}
