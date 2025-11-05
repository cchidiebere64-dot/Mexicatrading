// src/pages/AdminDashboardHome.jsx
import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminDashboardHome() {
  const [stats, setStats] = useState({
    users: [],
    plans: [],
    deposits: [],
    withdrawals: [],
    logs: [],
  });
  const [loading, setLoading] = useState(true);
  const adminToken = sessionStorage.getItem("adminToken");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${adminToken}`,
        };

        // Fetch all users
        const usersRes = await axios.get("/api/admin/users", { headers });

        // Fetch all plans
        const plansRes = await axios.get("/api/plans", { headers });

        // Fetch all deposits
        const depositsRes = await axios.get("/api/admin/deposits", { headers });

        // Fetch all withdrawals
        const withdrawalsRes = await axios.get("/api/admin/withdrawals", { headers });

        // Fetch all activity logs
        const logsRes = await axios.get("/api/admin/logs", { headers });

        setStats({
          users: usersRes.data ?? [],
          plans: plansRes.data ?? [],
          deposits: depositsRes.data ?? [],
          withdrawals: withdrawalsRes.data ?? [],
          logs: logsRes.data ?? [],
        });
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, [adminToken]);

  if (loading) {
    return <div>Loading admin dashboard...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Total Users</h2>
          <p>{stats.users?.length ?? 0}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Total Plans</h2>
          <p>{stats.plans?.length ?? 0}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Total Deposits</h2>
          <p>{stats.deposits?.length ?? 0}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Total Withdrawals</h2>
          <p>{stats.withdrawals?.length ?? 0}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded col-span-full">
          <h2 className="font-bold">Recent Activity Logs</h2>
          <ul className="max-h-64 overflow-y-auto">
            {stats.logs?.map((log, idx) => (
              <li key={idx} className="border-b py-1">
                <strong>{log.action}</strong>: {log.details}
              </li>
            )) ?? <li>No logs yet</li>}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-bold mb-2">Users</h2>
          <ul className="max-h-64 overflow-y-auto">
            {stats.users?.map(user => (
              <li key={user._id} className="border-b py-1">
                {user.name} ({user.email}) - Balance: ${user.balance ?? 0}
              </li>
            )) ?? <li>No users found</li>}
          </ul>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-bold mb-2">Plans</h2>
          <ul className="max-h-64 overflow-y-auto">
            {stats.plans?.map(plan => (
              <li key={plan._id} className="border-b py-1">
                {plan.name} - Min: ${plan.minAmount}, Max: ${plan.maxAmount}, Profit: {plan.profitRate}%
              </li>
            )) ?? <li>No plans found</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
