import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Pencil, Trash2, X, RefreshCw, AlertTriangle } from "lucide-react";

const API_URL = "https://mexicatradingbackend.onrender.com";

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [form, setForm] = useState({ name: "", min: "", max: "", profit: "", duration: "", description: "" });

  const token = sessionStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/plans`, { headers });
      setPlans(Array.isArray(res.data) ? res.data : []);
    } catch {
      showMessage("Failed to load plans.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const openCreate = () => {
    setEditPlan(null);
    setForm({ name: "", min: "", max: "", profit: "", duration: "", description: "" });
    setShowModal(true);
  };

  const openEdit = (plan) => {
    setEditPlan(plan);
    setForm({
      name: plan.name || "",
      min: plan.minAmount || "",
      max: plan.maxAmount || "",
      profit: plan.profitRate || "", // value is stored as the rate (e.g. 25 means $25/$100)
      duration: plan.duration || "",
      description: plan.description || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editPlan) {
        await axios.put(`${API_URL}/api/plans/${editPlan._id}`, form, { headers });
        showMessage("Plan updated successfully.");
      } else {
        await axios.post(`${API_URL}/api/plans`, form, { headers });
        showMessage("Plan created successfully.");
      }
      setShowModal(false);
      fetchPlans();
    } catch {
      showMessage("Failed to save plan.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const deletePlan = async (id) => {
    setActionLoading(true);
    try {
      await axios.delete(`${API_URL}/api/plans/${id}`, { headers });
      showMessage("Plan deleted successfully.");
      setConfirmDelete(null);
      fetchPlans();
    } catch {
      showMessage("Failed to delete plan.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-white/30 text-sm animate-pulse">Loading plans...</p>
      </div>
    );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Manage Plans</h1>
          <p className="text-white/30 text-xs mt-0.5">{plans.length} investment plans available</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchPlans} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white text-sm transition-all">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20">
            <Plus size={14} /> Add Plan
          </button>
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

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-white/8 bg-white/[0.02] text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Package size={24} className="text-white/20" />
          </div>
          <p className="text-white font-semibold">No Plans Yet</p>
          <p className="text-white/30 text-sm">Create your first investment plan to get started.</p>
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/25 transition-all">
            <Plus size={14} /> Create Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((p, i) => (
            <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-5 rounded-2xl border border-white/8 bg-white/[0.03] hover:border-emerald-500/30 transition-all space-y-4">

              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                  <Package size={18} className="text-emerald-400" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-400 hover:bg-blue-500/25 transition-all">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setConfirmDelete(p)} className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/25 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-white font-bold text-base">{p.name}</h3>
                {p.description && <p className="text-white/30 text-xs mt-0.5">{p.description}</p>}
                {p.duration && <p className="text-white/20 text-xs mt-0.5">{p.duration} days duration</p>}
              </div>

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/8">
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Min</p>
                  <p className="text-white font-semibold text-sm">${Number(p.minAmount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Max</p>
                  <p className="text-white font-semibold text-sm">${Number(p.maxAmount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Profit</p>
                  <p className="text-emerald-400 font-bold text-sm">+${p.profitRate}/$100</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="absolute inset-0" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#0e1422] border border-white/10 rounded-3xl p-6 z-10 shadow-2xl">

              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-bold text-base">{editPlan ? "Edit Plan" : "Create New Plan"}</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition">
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { label: "Plan Name", key: "name", placeholder: "e.g. Gold Plan", type: "text", hint: null },
                  { label: "Minimum ($)", key: "min", placeholder: "e.g. 100", type: "number", hint: null },
                  { label: "Maximum ($)", key: "max", placeholder: "e.g. 5000", type: "number", hint: null },
                  { label: "Profit per $100 ($)", key: "profit", placeholder: "e.g. 25", type: "number", hint: "Enter how much profit a user earns for every $100 invested. Example: 25 means $25 profit per $100." },
                  { label: "Duration (days)", key: "duration", placeholder: "e.g. 7", type: "number", hint: null },
                  { label: "Description (optional)", key: "description", placeholder: "Brief plan description", type: "text", hint: null },
                ].map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">{field.label}</label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={form[field.key]}
                      onChange={(e) => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                      required={field.key !== "description"}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 text-sm placeholder:text-white/25 text-white"
                    />
                    {field.hint && (
                      <p className="text-emerald-400/60 text-[11px] mt-1 flex items-start gap-1">
                        💡 {field.hint}
                      </p>
                    )}

                    {/* Live profit preview when entering profit value */}
                    {field.key === "profit" && form.profit && form.min && (
                      <div className="mt-2 p-2.5 rounded-lg bg-emerald-500/8 border border-emerald-500/20 flex items-center justify-between">
                        <span className="text-white/50 text-xs">Min investment earns</span>
                        <span className="text-emerald-400 font-bold text-xs">
                          +${((Number(form.min) * Number(form.profit)) / 100).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                <button type="submit" disabled={actionLoading}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-60">
                  {actionLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  {editPlan ? "Save Changes" : "Create Plan"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRM MODAL */}
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
                  <p className="text-white font-bold text-sm">Delete Plan</p>
                  <p className="text-white/30 text-xs">This cannot be undone</p>
                </div>
              </div>
              <p className="text-white/50 text-sm">Are you sure you want to delete <strong className="text-white">{confirmDelete.name}</strong>?</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => deletePlan(confirmDelete._id)} disabled={actionLoading}
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
