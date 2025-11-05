import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboardHome() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPlans, setTotalPlans] = useState(0);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [userLogs, setUserLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const adminToken = sessionStorage.getItem("adminToken");

  const fetchDashboardData = async () => {
    try {
      const headers = { Authorization: `Bearer ${adminToken}` };

      // Fetch total users
      const usersRes = await axios.get("/api/admin/users", { headers });
      setTotalUsers(Array.isArray(usersRes.data) ? usersRes.data.length : 0);

      // Fetch total plans
      const plansRes = await axios.get("/api/plans", { headers });
      setTotalPlans(Array.isArray(plansRes.data) ? plansRes.data.length : 0);

      // Fetch deposits
      const depositsRes = await axios.get("/api/admin/deposits", { headers });
      setTotalDeposits(Array.isArray(depositsRes.data) ? depositsRes.data.length : 0);

      // Fetch withdrawals
      const withdrawalsRes = await axios.get("/api/admin/withdrawals", { headers });
      setTotalWithdrawals(Array.isArray(withdrawalsRes.data) ? withdrawalsRes.data.length : 0);

      // Fetch activity logs (user actions)
      const logsRes = await axios.get("/api/activity", { headers });
      setUserLogs(Array.isArray(logsRes.data) ? logsRes.data.reverse() : []);

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading dashboard...</div>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-100 rounded shadow">
          <h2 className="font-semibold">Total Users</h2>
          <p className="text-xl">{totalUsers}</p>
        </div>
        <div className="p-4 bg-green-100 rounded shadow">
          <h2 className="font-semibold">Total Plans</h2>
          <p className="text-xl">{totalPlans}</p>
        </div>
        <div className="p-4 bg-yellow-100 rounded shadow">
          <h2 className="font-semibold">Total Deposits</h2>
          <p className="text-xl">{totalDeposits}</p>
        </div>
        <div className="p-4 bg-red-100 rounded shadow">
          <h2 className="font-semibold">Total Withdrawals</h2>
          <p className="text-xl">{totalWithdrawals}</p>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-bold mb-2">User Activity Logs</h2>
        {userLogs.length === 0 ? (
          <p>No activity logs available.</p>
        ) : (
          <div className="overflow-auto max-h-96 border rounded p-2">
            <table className="w-full text-left table-auto">
              <thead>
                <tr>
                  <th className="px-2 py-1 border">User</th>
                  <th className="px-2 py-1 border">Action</th>
                  <th className="px-2 py-1 border">Details</th>
                  <th className="px-2 py-1 border">Date</th>
                </tr>
              </thead>
              <tbody>
                {userLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-gray-100">
                    <td className="px-2 py-1 border">{log.userId || "System"}</td>
                    <td className="px-2 py-1 border">{log.action}</td>
                    <td className="px-2 py-1 border">{log.details}</td>
                    <td className="px-2 py-1 border">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
