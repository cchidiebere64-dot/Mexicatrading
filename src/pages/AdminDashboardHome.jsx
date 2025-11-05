import { useState, useEffect } from "react";
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
  const [error, setError] = useState("");

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const adminToken = sessionStorage.getItem("adminToken");
        if (!adminToken) throw new Error("Admin not logged in");

        const response = await axios.get("/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${adminToken}` },
        });

        // Ensure default structure in case backend omits fields
        setStats({
          users: response.data.users || 0,
          plans: response.data.plans || 0,
          deposits: response.data.deposits || 0,
          withdrawals: response.data.withdrawals || 0,
          recentActivity: Array.isArray(response.data.recentActivity)
            ? response.data.recentActivity
            : [],
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Failed to load dashboard data");
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Users</h2>
          <p className="text-2xl">{stats.users}</p>
        </div>
        <div className="bg-green-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Plans</h2>
          <p className="text-2xl">{stats.plans}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Deposits</h2>
          <p className="text-2xl">${stats.deposits}</p>
        </div>
        <div className="bg-red-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Withdrawals</h2>
          <p className="text-2xl">${stats.withdrawals}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        {(!stats.recentActivity || stats.recentActivity.length === 0) ? (
          <p>No recent activity</p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">User</th>
                <th className="p-2 border">Action</th>
                <th className="p-2 border">Details</th>
                <th className="p-2 border">Time</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentActivity.map((activity) => (
                <tr key={activity._id || Math.random()} className="text-center">
                  <td className="p-2 border">
                    {activity?.user?.name || "Unknown"}
                  </td>
                  <td className="p-2 border">{activity?.action || "N/A"}</td>
                  <td className="p-2 border">{activity?.details || "N/A"}</td>
                  <td className="p-2 border">
                    {activity?.createdAt
                      ? new Date(activity.createdAt).toLocaleString()
                      : "—"}
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
