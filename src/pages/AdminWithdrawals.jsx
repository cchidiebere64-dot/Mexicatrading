import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const token = sessionStorage.getItem("adminToken");

  const fetchWithdrawals = async () => {
    try {
      const res = await fetch(
        "https://mexicatradingbackend.onrender.com/api/withdrawals",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch withdrawals");

      const data = await res.json();
      setWithdrawals(data);
    } catch (err) {
      console.error("❌ Error fetching withdrawals:", err);
      alert(err.message || "Failed to fetch withdrawals");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    setActionLoading(id);
    try {
      const res = await fetch(
        `https://mexicatradingbackend.onrender.com/api/withdrawals/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Action failed");

      setWithdrawals((prev) =>
        prev.map((w) =>
          w._id === id
            ? { ...w, status: action === "approve" ? "approved" : "rejected" }
            : w
        )
      );

      alert(data.message);
    } catch (err) {
      console.error("❌ Error:", err);
      alert(err.message || "Failed to update withdrawal");
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  if (loading) return <div className="p-5 text-center">Loading withdrawals...</div>;

  return (
    <AdminLayout>
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-5">Admin Withdrawals</h1>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 bg-white shadow-md">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3 border">User</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Amount</th>
                <th className="p-3 border">Method</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border">Date</th>
                <th className="p-3 border">Action</th>
              </tr>
            </thead>

            <tbody>
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-5 text-center text-gray-500">
                    No withdrawals found
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 border">{w.user?.name}</td>
                    <td className="p-3 border">{w.user?.email}</td>
                    <td className="p-3 border">₦{Number(w.amount).toLocaleString()}</td>
                    <td className="p-3 border">{w.method}</td>
                    <td className="p-3 border">
                      <span
                        className={`px-3 py-1 rounded text-white ${
                          w.status === "pending"
                            ? "bg-yellow-500"
                            : w.status === "approved"
                            ? "bg-green-600"
                            : "bg-red-600"
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td className="p-3 border">{new Date(w.createdAt).toLocaleString()}</td>
                    <td className="p-3 border space-x-2">
                      {w.status === "pending" ? (
                        <>
                          <button
                            disabled={actionLoading === w._id}
                            onClick={() => handleAction(w._id, "approve")}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            {actionLoading === w._id ? "Processing..." : "Approve"}
                          </button>
                          <button
                            disabled={actionLoading === w._id}
                            onClick={() => handleAction(w._id, "reject")}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            {actionLoading === w._id ? "Processing..." : "Reject"}
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-500 italic">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminWithdrawals;
