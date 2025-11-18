import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const API_URL = "https://mexicatradingbackend.onrender.com";
  const token = sessionStorage.getItem("adminToken");

  // Fetch all deposits (ADMIN)
  const fetchDeposits = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/deposits`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch deposits");

      const data = await res.json();
      setDeposits(data);

    } catch (err) {
      console.error("❌ Error fetching deposits:", err);
    } finally {
      setLoading(false);
    }
  };

  // Approve or reject deposit
  const handleAction = async (id, action) => {
    setActionLoading(id);

    try {
      const res = await fetch(`${API_URL}/api/deposits/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Update UI without reloading
      setDeposits((prev) =>
        prev.map((d) =>
          d._id === id
            ? { ...d, status: action === "approve" ? "approved" : "rejected" }
            : d
        )
      );

      alert(data.message);

    } catch (err) {
      console.error("❌ Error updating deposit:", err);
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  if (loading)
    return <div className="p-5 text-center">Loading deposits...</div>;

 <AdminLayout>
  <div className="p-5">
    <h1 className="text-2xl font-bold mb-4">User Deposits</h1>

    <div className="overflow-x-auto">
      <table className="min-w-full border bg-white shadow-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 border">User</th>
            <th className="p-3 border">Email</th>
            <th className="p-3 border">Amount</th>
            <th className="p-3 border">Method</th>
            <th className="p-3 border">Transaction ID</th>
            <th className="p-3 border">Status</th>
            <th className="p-3 border">Date</th>
            <th className="p-3 border">Action</th>
          </tr>
        </thead>

        <tbody>
          {deposits.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center p-4">
                No deposits found
              </td>
            </tr>
          ) : (
            deposits.map((d) => (
              <tr key={d._id} className="border-b">
                <td className="p-3 border">{d.user?.name}</td>
                <td className="p-3 border">{d.user?.email}</td>
                <td className="p-3 border">₦{Number(d.amount).toLocaleString()}</td>
                <td className="p-3 border">{d.method}</td>
                <td className="p-3 border">{d.txid}</td>
                <td className="p-3 border">
                  <span
                    className={`px-3 py-1 text-white rounded ${
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
                <td className="p-3 border">{new Date(d.createdAt).toLocaleString()}</td>
                <td className="p-3 border">
                  {d.status === "pending" ? (
                    <>
                      <button
                        disabled={actionLoading === d._id}
                        onClick={() => handleAction(d._id, "approve")}
                        className="bg-green-600 text-white px-3 py-1 rounded mr-2 disabled:opacity-50"
                      >
                        {actionLoading === d._id ? "Processing..." : "Approve"}
                      </button>
                      <button
                        disabled={actionLoading === d._id}
                        onClick={() => handleAction(d._id, "reject")}
                        className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
                      >
                        {actionLoading === d._id ? "Processing..." : "Reject"}
                      </button>
                    </>
                  ) : (
                    <span className="text-gray-500">Processed</span>
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
}


