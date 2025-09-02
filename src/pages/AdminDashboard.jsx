import AdminLayout from "../components/AdminLayout";

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-indigo-600 mb-6">📊 Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="text-lg font-medium">Total Users</h3>
          <p className="text-3xl font-bold text-indigo-600">0</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="text-lg font-medium">Total Deposits</h3>
          <p className="text-3xl font-bold text-emerald-600">$0</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="text-lg font-medium">Total Withdrawals</h3>
          <p className="text-3xl font-bold text-red-600">$0</p>
        </div>
      </div>
    </AdminLayout>
  );
}
