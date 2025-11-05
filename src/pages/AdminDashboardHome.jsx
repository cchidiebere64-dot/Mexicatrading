import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboardHome() {
  const [stats, setStats] = useState({
    users: 0,
    plans: 0,
    deposits: 0,
    withdrawals: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const adminToken = sessionStorage.getItem("adminToken");

  const BASE_URL = "/api/admin"; // Adjust if your backend has a different origin

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/dashboard`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        alert("Error fetching dashboard stats. Check your backend connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [adminToken]);

  if (loading) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-500 text-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Users</h2>
          <p className="text-2xl">{stats.users}</p>
        </div>
        <div className="bg-green-500 text-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Plans</h2>
          <p className="text-2xl">{stats.plans}</p>
        </div>
        <div className="bg-yellow-500 text-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Deposits</h2>
          <p className="text-2xl">${stats.deposits}</p>
        </div>
        <div className="bg-red-500 text-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Withdrawals</h2>
          <p className="text-2xl">${stats.withdrawals}</p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
        {stats.recentActivity.length === 0 ? (
          <p>No recent activities.</p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">User</th>
                <th className="p-2 border">Action</th>
                <th className="p-2 border">Details</th>
                <th className="p-2 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentActivity.map((act) => (
                <tr key={act._id}>
                  <td className="p-2 border">{act.user?.name || "Unknown"}</td>
                  <td className="p-2 border">{act.action}</td>
                  <td className="p-2 border">{act.details}</td>
                  <td className="p-2 border">
                    {new Date(act.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
