import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, X, DollarSign, ShieldOff, Shield,
  KeyRound, Trash2, RefreshCw, ChevronRight, AlertTriangle,
} from "lucide-react";

const API_URL = "https://mexicatradingbackend.onrender.com/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);

  const token = sessionStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/users`, { headers });
      setUsers(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
      showMessage("Failed to load users.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(users.filter(u =>
      u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    ));
  }, [search, users]);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const updateBalance = async (type) => {
    if (!amount) return showMessage("Please enter an amount.", "error");
    setActionLoading(true);
    try {
      await axios.put(`${API_URL}/admin/users/${selectedUser._id}/balance`, { type, amount: Number(amount) }, { headers });
      showMessage(`Balance ${type === "credit" ? "credited" : "deducted"} successfully.`);
      setAmount("");
      fetchUsers();
    } catch {
      showMessage("Failed to update balance.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleFreeze = async () => {
    setActionLoading(true);
    try {
      await axios.put(`${API_URL}/admin/users/${selectedUser._id}/freeze`, {}, { headers });
      showMessage("Withdrawal status updated.");
      setSelectedUser(prev => ({ ...prev, freezeWithdrawals: !prev.freezeWithdrawals }));
      fetchUsers();
    } catch {
      showMessage("Failed to update freeze status.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!newPassword) return showMessage("Please enter a new password.", "error");
    setActionLoading(true);
    try {
      await axios.put(`${API_URL}/admin/users/${selectedUser._id}/reset-password`, { newPassword }, { headers });
      showMessage("Password reset successfully.");
      setNewPassword("");
      setShowPasswordField(false);
    } catch {
      showMessage("Failed to reset password.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteUser = async () => {
    setActionLoading(true);
    try {
      await axios.delete(`${API_URL}/admin/users/${selectedUser._id}`, { headers });
      showMessage("User deleted successfully.");
      setSelectedUser(null);
      setConfirmDelete(false);
      fetchUsers();
    } catch {
      showMessage("Failed to delete user.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-white/30 text-sm animate-pulse">Loading users...</p>
      </div>
    );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Manage Users</h1>
          <p className="text-white/30 text-xs mt-0.5">{users.length} total users registered</p>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white text-sm transition-all">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Global Message */}
      <AnimatePresence>
        {message.text && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`p-4 rounded-xl text-sm text-center font-medium border ${message.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
        <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 transition-all text-sm placeholder:text-white/25 text-white" />
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-white/8 overflow-hidden">
        <div className="grid grid-cols-4 px-5 py-3 bg-white/[0.03] border-b border-white/8">
          {["Name", "Email", "Balance", "Action"].map(h => (
            <p key={h} className="text-white/30 text-xs font-semibold uppercase tracking-widest">{h}</p>
          ))}
        </div>
        <div className="divide-y divide-white/5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Users size={24} className="text-white/20" />
              <p className="text-white/30 text-sm">No users found</p>
            </div>
          ) : (
            filtered.map((u, i) => (
              <motion.div key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="grid grid-cols-4 px-5 py-4 hover:bg-white/[0.02] transition-all items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-white text-sm font-medium truncate">{u.name}</p>
                </div>
                <p className="text-white/50 text-sm truncate pr-4">{u.email}</p>
                <p className="text-emerald-400 font-bold text-sm">${parseFloat(u.balance || 0).toLocaleString()}</p>
                <button onClick={() => { setSelectedUser(u); setConfirmDelete(false); setShowPasswordField(false); setAmount(""); }}
                  className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-all w-fit">
                  Manage <ChevronRight size={12} />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* USER MODAL */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="absolute inset-0" onClick={() => setSelectedUser(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#0e1422] border border-white/10 rounded-3xl p-6 z-10 shadow-2xl max-h-[90vh] overflow-y-auto">

              {/* Modal Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                    {selectedUser.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{selectedUser.name}</p>
                    <p className="text-white/30 text-xs">{selectedUser.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition">
                  <X size={15} />
                </button>
              </div>

              {/* Balance Badge */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/8 mb-5">
                <p className="text-white/40 text-xs uppercase tracking-widest">Current Balance</p>
                <p className="text-emerald-400 font-bold text-lg">${parseFloat(selectedUser.balance || 0).toLocaleString()}</p>
              </div>

              {/* Modal Message */}
              <AnimatePresence>
                {message.text && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className={`mb-4 p-3 rounded-xl text-xs text-center font-medium border ${message.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3">

                {/* Credit / Deduct */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">Amount</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount"
                      className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 text-sm placeholder:text-white/25 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => updateBalance("credit")} disabled={actionLoading}
                      className="py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/25 transition-all disabled:opacity-50">
                      + Credit
                    </button>
                    <button onClick={() => updateBalance("deduct")} disabled={actionLoading}
                      className="py-2.5 rounded-xl bg-red-500/15 border border-red-500/25 text-red-400 text-sm font-semibold hover:bg-red-500/25 transition-all disabled:opacity-50">
                      − Deduct
                    </button>
                  </div>
                </div>

                <div className="h-px bg-white/8" />

                {/* Freeze */}
                <button onClick={toggleFreeze} disabled={actionLoading}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all disabled:opacity-50 ${selectedUser.freezeWithdrawals ? "bg-green-500/15 border-green-500/25 text-green-400 hover:bg-green-500/25" : "bg-yellow-500/15 border-yellow-500/25 text-yellow-400 hover:bg-yellow-500/25"}`}>
                  {selectedUser.freezeWithdrawals ? <Shield size={15} /> : <ShieldOff size={15} />}
                  {selectedUser.freezeWithdrawals ? "Unfreeze Withdrawals" : "Freeze Withdrawals"}
                </button>

                {/* Reset Password */}
                {!showPasswordField ? (
                  <button onClick={() => setShowPasswordField(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-500/15 border border-purple-500/25 text-purple-400 text-sm font-semibold hover:bg-purple-500/25 transition-all">
                    <KeyRound size={15} /> Reset Password
                  </button>
                ) : (
                  <div className="space-y-2">
                    <input type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-purple-500/60 text-sm placeholder:text-white/25 text-white" />
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={resetPassword} disabled={actionLoading}
                        className="py-2.5 rounded-xl bg-purple-500/15 border border-purple-500/25 text-purple-400 text-sm font-semibold hover:bg-purple-500/25 transition-all disabled:opacity-50">
                        Confirm Reset
                      </button>
                      <button onClick={() => { setShowPasswordField(false); setNewPassword(""); }}
                        className="py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 text-sm font-semibold hover:bg-white/10 transition-all">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Delete */}
                {!confirmDelete ? (
                  <button onClick={() => setConfirmDelete(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/15 border border-red-500/25 text-red-400 text-sm font-semibold hover:bg-red-500/25 transition-all">
                    <Trash2 size={15} /> Delete User
                  </button>
                ) : (
                  <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 space-y-3">
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertTriangle size={15} />
                      <p className="text-sm font-semibold">This cannot be undone!</p>
                    </div>
                    <p className="text-white/40 text-xs">Permanently delete {selectedUser.name}?</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={deleteUser} disabled={actionLoading}
                        className="py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-400 transition-all disabled:opacity-50">
                        Yes, Delete
                      </button>
                      <button onClick={() => setConfirmDelete(false)}
                        className="py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 text-sm font-semibold hover:bg-white/10 transition-all">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <button onClick={() => setSelectedUser(null)}
                  className="w-full py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition text-sm text-white/40 hover:text-white">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
