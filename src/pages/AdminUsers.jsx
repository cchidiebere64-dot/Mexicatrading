import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);

  const API_URL = "https://mexicatradingbackend.onrender.com/api";

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      const res = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateBalance = async (type) => {
    if (!amount) return alert("Enter an amount.");
    try {
      const token = sessionStorage.getItem("adminToken");
      await axios.put(
        `${API_URL}/admin/users/${selectedUser._id}/balance`,
        { type, amount: Number(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Balance updated successfully.");
      setAmount("");
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to update balance.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading users...</p>;

  return (
    <div className="px-4 sm:px-6 pb-12">
      <h1 className="text-2xl font-semibold mb-6">👥 All Users</h1>

      {/* Responsive scrolling table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow p-4">
        <table className="w-full text-sm md:text-base">
          <thead>
            <tr className="bg-emerald-600 text-white">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Balance</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="p-3">{u.name}</td>
                <td className="p-3 break-all">{u.email}</td>
                <td className="p-3 font-semibold">${u.balance}</td>
                <td className="p-3">
                  <button
                    onClick={() => setSelectedUser(u)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-sm md:text-base"
                  >
                    Credit / Deduct
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Responsive Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center px-4 z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl w-full max-w-md animate-fade-in">
            <h2 className="text-xl font-semibold mb-4">
              Manage {selectedUser.name}
            </h2>

            {/* Balance Input */}
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 border dark:bg-gray-700 rounded mb-3"
              placeholder="Enter amount"
            />

            <div className="flex gap-3 mb-4">
              <button
                onClick={() => updateBalance("credit")}
                className="bg-green-600 text-white px-4 py-2 rounded w-full"
              >
                Credit
              </button>
              <button
                onClick={() => updateBalance("deduct")}
                className="bg-red-600 text-white px-4 py-2 rounded w-full"
              >
                Deduct
              </button>
            </div>

            <button
              onClick={async () => {
                const token = sessionStorage.getItem("adminToken");
                await axios.put(`${API_URL}/admin/users/${selectedUser._id}/freeze`, {}, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                alert("Updated withdrawal freeze status");
                fetchUsers();
              }}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded w-full mb-3"
            >
              {selectedUser.freezeWithdrawals ? "Unfreeze Withdrawals" : "Freeze Withdrawals"}
            </button>

            <button
              onClick={async () => {
                const newPass = prompt("Enter new password:");
                if (!newPass) return;
                const token = sessionStorage.getItem("adminToken");
                await axios.put(
                  `${API_URL}/admin/users/${selectedUser._id}/reset-password`,
                  { newPassword: newPass },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                alert("Password reset.");
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded w-full mb-3"
            >
              Reset Password
            </button>

            <button
              onClick={() => window.location.href = `/admin/user-history/${selectedUser._id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full mb-3"
            >
              View Transaction History
            </button>

            <button
              onClick={async () => {
                if (!window.confirm("Are you sure? This cannot be undone.")) return;
                const token = sessionStorage.getItem("adminToken");
                await axios.delete(`${API_URL}/admin/users/${selectedUser._id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                alert("User deleted.");
                setSelectedUser(null);
                fetchUsers();
              }}
              className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded w-full mb-3"
            >
              Delete User
            </button>

            <button
              onClick={() => setSelectedUser(null)}
              className="mt-2 w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
