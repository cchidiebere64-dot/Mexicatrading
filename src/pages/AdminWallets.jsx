import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";

export default function AdminWallets() {
  const [wallets, setWallets] = useState({});
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", address: "", caution: "" });
  const [editId, setEditId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const API_URL = "https://mexicatradingbackend.onrender.com";
  const token = sessionStorage.getItem("adminToken");

  const fetchWallets = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/wallets`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Convert array to object keyed by name
      const obj = {};
      res.data.forEach((w) => {
        obj[w.name] = { ...w, caution: w.caution || "" };
      });
      setWallets(obj);
    } catch (err) {
      console.error("Failed to fetch wallets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      if (editId) {
        const res = await axios.put(`${API_URL}/api/admin/wallets/${editId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert(res.data.message);
      } else {
        const res = await axios.post(`${API_URL}/api/admin/wallets`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert(res.data.message);
      }

      setForm({ name: "", address: "", caution: "" });
      setEditId(null);
      fetchWallets();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (wallet) => {
    setForm({
      name: wallet.name,
      address: wallet.address,
      caution: wallet.caution,
    });
    setEditId(wallet._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this wallet?")) return;

    try {
      const res = await axios.delete(`${API_URL}/api/admin/wallets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(res.data.message);
      fetchWallets();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  if (loading) return <div className="p-5 text-center">Loading wallets...</div>;

  return (
    <AdminLayout>
      <div className="p-5">
        <h1
          className="text-2xl font-bold mb-4"
        >
          Manage Wallets
        </h1>

        <form onSubmit={handleSubmit} className="mb-6 space-y-4 max-w-md">
          <input
            type="text"
            placeholder="Wallet Name (e.g., USDT, BTC)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-3 rounded-xl border border-gray-300"
            required
          />

          <input
            type="text"
            placeholder="Wallet Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full p-3 rounded-xl border border-gray-300"
            required
          />

          <input
            type="text"
            placeholder="Caution / Instructions (optional)"
            value={form.caution}
            onChange={(e) => setForm({ ...form, caution: e.target.value })}
            className="w-full p-3 rounded-xl border border-gray-300"
          />

          <button
            type="submit"
            disabled={actionLoading}
            className="px-6 py-2 rounded-xl bg-emerald-400 text-black font-semibold hover:bg-emerald-500 disabled:opacity-50"
          >
            {actionLoading ? "Processing..." : editId ? "Update Wallet" : "Add Wallet"}
          </button>

          {editId && (
            <button
              type="button"
              className="ml-2 px-6 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600"
              onClick={() => {
                setForm({ name: "", address: "", caution: "" });
                setEditId(null);
              }}
            >
              Cancel
            </button>
          )}
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full border bg-white shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Address</th>
                <th className="p-3 border">Caution / Instructions</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>

            <tbody>
              {Object.keys(wallets).length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-4">
                    No wallets found
                  </td>
                </tr>
              ) : (
                Object.keys(wallets).map((key) => (
                  <tr key={key} className="border-b">
                    <td className="p-3 border">{key}</td>
                    <td className="p-3 border break-all">{wallets[key].address}</td>
                    <td className="p-3 border">{wallets[key].caution}</td>

                    <td className="p-3 border flex gap-2">
                      <button
                        onClick={() =>
                          handleEdit({
                            _id: wallets[key]._id,
                            name: key,
                            address: wallets[key].address,
                            caution: wallets[key].caution,
                          })
                        }
                        className="px-3 py-1 bg-yellow-400 text-black rounded"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(wallets[key]._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded"
                      >
                        Delete
                      </button>
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
