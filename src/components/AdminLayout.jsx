import { Link } from "react-router-dom";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-700 text-white p-6 space-y-6">
        <h2 className="text-2xl font-bold">⚙️ Admin Panel</h2>
        <nav className="space-y-3">
          <Link to="/admin" className="block hover:underline">📊 Overview</Link>
          <Link to="/admin/users" className="block hover:underline">👥 Users</Link>
          <Link to="/admin/deposits" className="block hover:underline">💰 Deposits</Link>
          <Link to="/admin/withdrawals" className="block hover:underline">🏧 Withdrawals</Link>
          <Link to="/admin/plans" className="block hover:underline">📈 Plans</Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
