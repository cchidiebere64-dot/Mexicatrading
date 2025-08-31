export default function AdminDashboard() {
  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <h2 className="text-3xl font-bold mb-6">🛠 Admin Dashboard</h2>
      <p className="mb-4">
        Welcome, Admin! Manage users, investments, and site settings here.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="font-bold">📊 User Stats</h3>
          <p>200 Active Users</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="font-bold">💰 Total Investments</h3>
          <p>$150,000</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="font-bold">⚙️ Settings</h3>
          <p>Manage Plans & System Config</p>
        </div>
      </div>
    </div>
  );
}
