import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Plus, Pencil, Trash2, X, RefreshCw, AlertTriangle, Copy, Check } from "lucide-react";

const API_URL = "https://mexicatradingbackend.onrender.com";

export default function AdminWallets() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", address: "", caution: "" });
  const [editId, setEditId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState(null);

  const token = sessionStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/wallets`, { headers });
      setWallets(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showMessage("Failed to fetch wallets.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWallets(); }, []);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handleEdit = (wallet) => {
    setForm({ name: wallet.name, address: wallet.address, caution: wallet.caution || "" });
    setEditId(wallet._id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setForm({ name: "", address: "", caution: "" });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editId) {
        const res = await axios.put(`${API_URL}/api/admin/wallets/${editId}`, form, { headers });
        showMessage(res.data.message || "Wallet updated successfully.");
      } else {
        const res = await axios.post(`${API_URL}/api/admin/wallets`, form, { headers });
        showMessage(res.data.message || "Wallet added successfully.");
      }
      handleCancel();
      fetchWallets();
    } catch (err) {
      showMessage(err.response?.data?.message || "Action failed.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      const res = await axios.delete(`${API_URL}/api/admin/wallets/${id}`, { headers });
      showMessage(res.data.message || "Wallet deleted successfully.");
      setConfirmDelete(null);
      fetchWallets();
    } catch (err) {
      showMessage(err.response?.data?.message || "Delete failed.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopy = (id, address) => {
    navigator.clipboard.writeText(address);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-white/30 text-sm animate-pulse">Loading wallets...</p>
      </div>
    );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Manage Wallets</h1>
          <p className="text-white/30 text-xs mt-0.5">{wallets.length} payment wallet{wallets.length !== 1 ? "s" : ""} configured</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchWallets} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white text-sm transition-all">
            <RefreshCw size={14} /> Refresh
          </button>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20">
              <Plus size={14} /> Add Wallet
            </button>
          )}
        </div>
      </div>

      {/* Message */}
      <AnimatePresence>
        {message.text && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`p-4 rounded-xl text-sm text-center font-medium border ${message.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD / EDIT FORM */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-white/[0.03] border border-white/8 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-sm">{editId ? "Edit Wallet" : "Add New Wallet"}</h3>
              <button onClick={handleCancel} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">Wallet Name</label>
                <input type="text" placeholder="e.g. USDT, BTC, TON" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 text-sm placeholder:text-white/25 text-white" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">Wallet Address</label>
                <input type="text" placeholder="Enter full wallet address" value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })} required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 text-sm placeholder:text-white/25 text-white font-mono" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                  Caution / Instructions <span className="text-white/20 normal-case">(optional)</span>
                </label>
                <input type="text" placeholder="e.g. Only send USDT TRC20 to this address" value={form.caution}
                  onChange={(e) => setForm({ ...form, caution: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 text-sm placeholder:text-white/25 text-white" />
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={actionLoading}
                  className="flex-1 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-60">
                  {actionLoading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : null}
                  {editId ? "Save Changes" : "Add Wallet"}
                </button>
                <button type="button" onClick={handleCancel}
                  className="px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white/40 text-sm font-semibold hover:bg-white/10 transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WALLETS LIST */}
      {wallets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-white/8 bg-white/[0.02] text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Wallet size={24} className="text-white/20" />
          </div>
          <p className="text-white font-semibold">No Wallets Yet</p>
          <p className="text-white/30 text-sm">Add a payment wallet so users can make deposits.</p>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/25 transition-all">
            <Plus size={14} /> Add Wallet
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {wallets.map((wallet, i) => (
            <motion.div key={wallet._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-5 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-white/15 transition-all">

              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                    <Wallet size={18} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{wallet.name}</p>
                    {wallet.caution && <p className="text-yellow-400/70 text-xs mt-0.5">⚠ {wallet.caution}</p>}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleEdit(wallet)}
                    className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-400 hover:bg-blue-500/25 transition-all">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setConfirmDelete(wallet)}
                    className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/25 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Address */}
              <div className="mt-4 pt-4 border-t border-white/8">
                <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Wallet Address</p>
                <div className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-xl p-3">
                  <p className="text-white/60 text-xs font-mono flex-1 break-all">{wallet.address}</p>
                  <button onClick={() => handleCopy(wallet._id, wallet.address)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      copied === wallet._id
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-white/10 text-white/50 hover:bg-white/20 border border-white/10"
                    }`}>
                    {copied === wallet._id ? <Check size={11} /> : <Copy size={11} />}
                    {copied === wallet._id ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* DELETE CONFIRM */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="absolute inset-0" onClick={() => setConfirmDelete(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-[#0e1422] border border-white/10 rounded-3xl p-6 z-10 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center">
                  <AlertTriangle size={18} className="text-red-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Delete Wallet</p>
                  <p className="text-white/30 text-xs">This cannot be undone</p>
                </div>
              </div>
              <p className="text-white/50 text-sm">Are you sure you want to delete the <strong className="text-white">{confirmDelete.name}</strong> wallet?</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleDelete(confirmDelete._id)} disabled={actionLoading}
                  className="py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-semibold transition-all disabled:opacity-50">
                  Yes, Delete
                </button>
                <button onClick={() => setConfirmDelete(null)}
                  className="py-3 rounded-xl bg-white/5 border border-white/10 text-white/40 text-sm font-semibold hover:bg-white/10 transition-all">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
      }
