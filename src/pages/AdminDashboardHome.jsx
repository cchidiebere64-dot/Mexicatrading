import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminDashboardHome() {
  const [stats, setStats] = useState(null);
  const adminToken = sessionStorage.getItem("adminToken");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        setStats(res.data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };
    fetchStats();
  }, [adminToken]);

  if (!stats) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Users</h2>
          <p>{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Plans</h2>
          <p>{stats.totalPlans}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Deposits</h2>
          <p>{stats.totalDeposits}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Withdrawals</h2>
          <p>{stats.totalWithdrawals}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-2">Recent Activities</h2>
      <ul className="bg-white p-4 rounded shadow">
        {stats.activities.map((activity) => (
          <li key={activity._id} className="border-b py-2">
            {activity.action} by {activity.userId} - {new Date(activity.createdAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
