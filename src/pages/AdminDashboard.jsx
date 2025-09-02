import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const API_URL = "https://mexicatradingbackend.onrender.com";
  const [users, setUsers] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/admin/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users);
      setDeposits(res.data.deposits);
      setWithdrawals(res.data.withdrawals);
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const approveDeposit = async (id) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/admin/deposits/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Deposit approved");
      fetchData();
    } catch (err) {
      alert("❌ Failed to approve deposit");
    }
  };

  const approveWithdrawal = async (id) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/admin/withdrawals/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Withdrawal approved");
      fetchData();
    } catch (err) {
      alert("❌ Failed to approve withdrawal");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <h2 className="text-3xl font-bold text-indigo-600 mb-6">⚙️ Admin Dashboard</h2>

      {/* Users */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-6">
        <h3 className="text-xl font-semibold mb-3">👥 Users</h3>
        <ul>
          {users.map((u) => (
            <li key={u._id} className="border-b py-2 flex justify-between">
              <span>{u.name} ({u.email})</span>
              <span className="font-bold">${u.balance}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Deposits */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-6">
        <h3 className="text-xl font-semibold mb-3">💰 Pending Deposits</h3>
        <ul>
          {deposits.map((d) => (
            <li key={d._id} className="border-b py-2 flex justify-between items-center">
              <span>{d.user.name} - ${d.amount}</span>
              <button
                onClick={() => approveDeposit(d._id)}
                className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700"
              >
                Approve
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Withdrawals */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-3">🏧 Pending Withdrawals</h3>
        <ul>
          {withdrawals.map((w) => (
            <li key={w._id} className="border-b py-2 flex justify-between items-center">
              <span>{w.user.name} - ${w.amount}</span>
              <button
                onClick={() => approveWithdrawal(w._id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Approve
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
