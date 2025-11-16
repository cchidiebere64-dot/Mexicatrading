import AdminLayout from "../components/AdminLayout";

import React, { useEffect, useState } from "react";

const AdminDeposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // Track which deposit is being updated

 const token = sessionStorage.getItem("adminToken");

const res = await fetch("/api/deposits", {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});


      if (!res.ok) throw new Error("Failed to fetch deposits");

      const data = await res.json();
      setDeposits(data);
    } catch (err) {
      console.error("❌ Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Approve or Reject deposit
  const handleAction = async (id, action) => {
    setActionLoading(id);

    try {
      const res = await fetch(`/api/deposits/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Action failed");

      // Update UI locally
      setDeposits((prev) =>
        prev.map((d) =>
          d._id === id
            ? { ...d, status: action === "approve" ? "approved" : "rejected" }
            : d
        )
      );

      alert(data.message);
    } catch (err) {
      console.error("❌ Error:", err);
      alert(err.message || "Failed to update deposit");
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  if (loading)
    return (
      <div className="text-center text-gray-600 p-5">
        Loading deposits...
      </div>
    );

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-5">Admin Deposits</h1>

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
            {deposits.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-5 text-center text-gray-500">
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

                  {/* Status Badge */}
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

                  {/* Date */}
                  <td className="p-3 border">
                    {new Date(d.createdAt).toLocaleString()}
                  </td>

                  {/* Action Buttons */}
                  <td className="p-3 border space-x-2">
                    {d.status === "pending" ? (
                      <>
                        <button
                          disabled={actionLoading === d._id}
                          onClick={() => handleAction(d._id, "approve")}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionLoading === d._id ? "Processing..." : "Approve"}
                        </button>

                        <button
                          disabled={actionLoading === d._id}
                          onClick={() => handleAction(d._id, "reject")}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          {actionLoading === d._id ? "Processing..." : "Reject"}
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
  );
};

export default AdminDeposits;


