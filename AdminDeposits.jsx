import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = "https://mexicatradingbackend.onrender.com/api";

  // Fetch all deposits
  const fetchDeposits = async () => {
    setLoading(true);
    setError("");
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${API_URL}/admin/deposits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeposits(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load deposits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  // Approve or reject deposit
  const handleAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this deposit?`)) return;
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(
        `${API_URL}/admin/deposits/${id}`, // ✅ fixed path
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Deposit ${action}ed successfully.`);
      fetchDeposits();
    } catch (err) {
      console.error(err);
      alert("Action failed. Try again.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading admin data...</p>;
  if (error)
    return (
      <p className="text-center text-red-500 mt-10">
        {error}
      </p>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-emerald-600">Mesica Admin Dashboard</h1>
        <button
          onClick={() => {
            sessionStorage.clear();
            window.location.href = "/";
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      {/* Deposits Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">💰 Pending Deposits</h2>
        {deposits.length === 0 ? (
          <p className="text-gray-500">No deposit requests found.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-emerald-600 text-white text-left">
                <th className="p-3">User</th>
                <th className="p-3">Email</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((d) => (
                <tr
                  key={d._id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <td className="p-3">{d.user?.name || "N/A"}</td>
                  <td className="p-3">{d.user?.email || "N/A"}</td>
                  <td className="p-3">${d.amount}</td>
                  <td
                    className={`p-3 capitalize ${
                      d.status === "approved"
                        ? "text-green-500"
                        : d.status === "rejected"
                        ? "text-red-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {d.status}
                  </td>
                  <td className="p-3 flex gap-2">
                    {d.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAction(d._id, "approve")}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(d._id, "reject")}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Placeholder: Email User Section */}
      <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">📧 Send Email to User</h2>
        <p className="text-gray-500 mb-4">
          (Feature coming soon — admin can email users directly.)
        </p>
        <textarea
          className="w-full p-3 border rounded-lg dark:bg-gray-700"
          placeholder="Type your message..."
          rows={4}
          disabled
        />
        <button
          className="mt-3 bg-emerald-600 text-white px-4 py-2 rounded-lg opacity-50 cursor-not-allowed"
          disabled
        >
          Send Email
        </button>
      </div>
    </div>
  );
}
