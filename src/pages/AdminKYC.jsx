import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, RefreshCw, CheckCircle, XCircle, Eye, X } from "lucide-react";

const API_URL = "https://mexicatradingbackend.onrender.com/api";

export default function AdminKYC() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [filter, setFilter] = useState("pending");

  const token = sessionStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/kyc`, { headers });
      setSubmissions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const showMsg = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handleAction = async (action) => {
    if (action === "reject" && !rejectReason.trim()) {
      showMsg("Please enter a rejection reason.", "error");
      return;
    }
    setActionLoading(true);
    try {
      await axios.put(
        `${API_URL}/admin/kyc/${selected._id}`,
        { action, rejectionReason: rejectReason },
        { headers }
      );
      showMsg(`KYC ${action === "approve" ? "approved" : "rejected"} successfully!`);
      setSelected(null);
      setRejectReason("");
      setShowRejectInput(false);
      fetchSubmissions();
    } catch (err) {
      showMsg("Action failed. Please try again.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = submissions.filter(s =>
    filter === "all" ? true : s.kyc?.status === filter
  );

  const statusBadge = (status) => ({
    pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
    approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    rejected: "bg-red-500/15 text-red-400 border-red-500/25",
  }[status] || "bg-white/10 text-white/40 border-white/10");

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
      <p className="text-white/30 text-sm animate-pulse">Loading KYC submissions...</p>
    </div>
  );

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">KYC Verification</h1>
          <p className="text-white/30 text-xs mt-0.5">
            {submissions.filter(s => s.kyc?.status === "pending").length} pending reviews
          </p>
        </div>
        <button onClick={fetchSubmissions} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white text-sm transition-all">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <AnimatePresence>
        {message.text && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`p-4 rounded-xl text-sm text-center font-medium border ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["pending", "approved", "rejected", "all"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all border ${
              filter === f
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                : "bg-white/5 border-white/10 text-white/40 hover:text-white"
            }`}>
            {f} {f !== "all" && `(${submissions.filter(s => s.kyc?.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/8 overflow-hidden">
        <div className="grid grid-cols-4 px-5 py-3 bg-white/[0.03] border-b border-white/8">
          {["User", "Document", "Submitted", "Action"].map(h => (
            <p key={h} className="text-white/30 text-xs font-semibold uppercase tracking-widest">{h}</p>
          ))}
        </div>
        <div className="divide-y divide-white/5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <ShieldCheck size={24} className="text-white/20" />
              <p className="text-white/30 text-sm">No {filter} submissions</p>
            </div>
          ) : (
            filtered.map((u, i) => (
              <motion.div key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="grid grid-cols-4 px-5 py-4 hover:bg-white/[0.02] transition-all items-center">
                <div>
                  <p className="text-white text-sm font-medium">{u.name}</p>
                  <p className="text-white/30 text-xs truncate">{u.email}</p>
                </div>
                <p className="text-white/50 text-sm capitalize">{u.kyc?.idType?.replace("_", " ") || "—"}</p>
                <p className="text-white/40 text-xs">
                  {u.kyc?.submittedAt
                    ? new Date(u.kyc.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "—"}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full border font-semibold capitalize ${statusBadge(u.kyc?.status)}`}>
                    {u.kyc?.status || "none"}
                  </span>
                  {u.kyc?.status === "pending" && (
                    <button onClick={() => { setSelected(u); setShowRejectInput(false); setRejectReason(""); }}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all">
                      <Eye size={11} /> Review
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* REVIEW MODAL */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="absolute inset-0" onClick={() => setSelected(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#0e1422] border border-white/10 rounded-3xl p-6 z-10 shadow-2xl max-h-[90vh] overflow-y-auto">

              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-white font-bold">{selected.name}</p>
                  <p className="text-white/30 text-xs">{selected.email}</p>
                  <p className="text-white/40 text-xs mt-1 capitalize">
                    Document: {selected.kyc?.idType?.replace("_", " ")}
                  </p>
                </div>
                <button onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition">
                  <X size={15} />
                </button>
              </div>

              {/* Document images */}
              <div className="space-y-4 mb-5">
                {selected.kyc?.idFrontImage && (
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-widest mb-2">ID Document (Front)</p>
                    <img src={selected.kyc.idFrontImage} alt="ID Front"
                      className="w-full rounded-xl border border-white/10 object-cover max-h-52" />
                  </div>
                )}
                {selected.kyc?.selfieImage && (
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Selfie with ID</p>
                    <img src={selected.kyc.selfieImage} alt="Selfie"
                      className="w-full rounded-xl border border-white/10 object-cover max-h-52" />
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                {!showRejectInput ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleAction("approve")} disabled={actionLoading}
                      className="py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {actionLoading
                        ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <CheckCircle size={15} />}
                      Approve
                    </button>
                    <button onClick={() => setShowRejectInput(true)} disabled={actionLoading}
                      className="py-3 rounded-xl bg-red-500/15 border border-red-500/25 text-red-400 text-sm font-semibold hover:bg-red-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      <XCircle size={15} /> Reject
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Enter rejection reason (e.g. ID is blurry, selfie not clear)..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-red-500/60 text-sm placeholder:text-white/25 text-white resize-none"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => handleAction("reject")} disabled={actionLoading}
                        className="py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-semibold transition-all disabled:opacity-50">
                        Confirm Reject
                      </button>
                      <button onClick={() => setShowRejectInput(false)}
                        className="py-3 rounded-xl bg-white/5 border border-white/10 text-white/40 text-sm font-semibold hover:bg-white/10 transition-all">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                <button onClick={() => setSelected(null)}
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
