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
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">👥 All Users</h1>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow p-4">
        <table className="w-full">
          <thead>
            <tr className="bg-emerald-600 text-white">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Balance</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b dark:border-gray-700">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 font-semibold">${u.balance}</td>
                <td className="p-3">
                  <button
                    onClick={() => setSelectedUser(u)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded"
                  >
                    Credit / Deduct
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-3">
              Adjust Balance for {selectedUser.name}
            </h2>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 border dark:bg-gray-700 rounded mb-4"
              placeholder="Enter amount"
            />
            <div className="flex gap-3">
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
              onClick={() => setSelectedUser(null)}
              className="mt-4 w-full bg-gray-600 text-white py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
