import AdminLayout from "../components/AdminLayout";
import React, { useEffect, useState } from "react";

const AdminDeposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const token = sessionStorage.getItem("adminToken");

  // Fetch all deposits (ADMIN ONLY)
  const fetchDeposits = async () => {
    try {
      const res = await fetch("/api/admin/deposits", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ VERY IMPORTANT
        },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Server responded with HTML:", text);
        throw new Error("Invalid JSON response — missing admin token?");
      }

      const data = await res.json();
      setDeposits(data);
    } catch (err) {
      console.error("❌ Error fetching deposits:", err);
    } finally {
      setLoading(false);
    }
  };

  // Approve or Reject a deposit
  const handleAction = async (id, action) => {
    setActionLoading(id);

    try {
      const res = await fetch(`/api/admin/deposits/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ REQUIRED
        },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Update failed");

      // Update UI instantly
      setDeposits((prev) =>
        prev.map((d) =>
          d._id === id
            ? { ...d, status: action === "approve" ? "approved" : "rejected" }
            : d
        )
      );

      alert(data.message);
    } catch (err) {
      console.error("❌ Action error:", err);
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  if (loading) {
    return <div className="text-center p-5">Loading deposits...</div>;
  }

  return (
    <AdminLayout>
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-5">Admin Deposits</h1>

        <div className="overflow-x-auto">
          <table className="min-w-full border bg-white shadow-md">
            <thead className="bg-gray-100">
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
              {deposits.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-5 text-gray-500">
                    No deposits found
                  </td>
                </tr>
              ) : (
                deposits.map((d) => (
                  <tr key={d._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 border">{d.user?.name}</td>
                    <td className="p-3 border">{d.user?.email}</td>
                    <td className="p-3 border">
                      ₦{Number(d.amount).toLocaleString()}
                    </td>
                    <td className="p-3 border">{d.method}</td>

                    <td className="p-3 border">
                      <span
                        className={`px-3 py-1 rounded text-white ${
                          d.status === "pending"
                            ? "bg-yellow-500"
                            : d.status === "approved"
                            ? "bg-green-600"
                            : "bg-red-600"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>

                    <td className="p-3 border">
                      {new Date(d.createdAt).toLocaleString()}
                    </td>

                    <td className="p-3 border space-x-2">
                      {d.status === "pending" ? (
                        <>
                          <button
                            disabled={actionLoading === d._id}
                            onClick={() => handleAction(d._id, "approve")}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            {actionLoading === d._id
                              ? "Processing..."
                              : "Approve"}
                          </button>

                          <button
                            disabled={actionLoading === d._id}
                            onClick={() => handleAction(d._id, "reject")}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            {actionLoading === d._id
                              ? "Processing..."
                              : "Reject"}
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

export default AdminDeposits;
