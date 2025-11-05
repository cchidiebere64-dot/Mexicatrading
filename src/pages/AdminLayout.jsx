import { Outlet, Link, useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const navigate = useNavigate();

  const logout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-white">

      {/* SIDEBAR */}
      <aside className="w-64 bg-black/40 border-r border-white/10 px-5 py-6 space-y-6">
        <h2 className="text-2xl font-bold text-emerald-400">Admin Panel</h2>

        <nav className="flex flex-col gap-3 text-sm">
          <Link className="hover:text-emerald-400" to="/admin">Dashboard</Link>
          <Link className="hover:text-emerald-400" to="/admin/users">Users</Link>
          <Link className="hover:text-emerald-400" to="/admin/deposits">Deposits</Link>
          <Link className="hover:text-emerald-400" to="/admin/credit">Credit User</Link>
        </nav>

        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white w-full">
          Logout
        </button>
      </aside>

      {/* CONTENT AREA */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
