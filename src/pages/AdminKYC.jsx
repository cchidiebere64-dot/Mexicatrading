import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, RefreshCw, CheckCircle, XCircle, Eye, X, ZoomIn, Mail, Landmark } from "lucide-react";

const API_URL = "https://mexicatradingbackend.onrender.com/api";

export default function AdminKYC() {
  const [submissions, setSubmissions] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [filter, setFilter] = useState("pending");
  const [zoomedImage, setZoomedImage] = useState(null);
  const [inviteLoading, setInviteLoading] = useState(null);

  const token = sessionStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kycRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/admin/kyc`, { headers }),
        axios.get(`${API_URL}/admin/users`, { headers }),
      ]);
      setSubmissions(kycRes.data);
      setAllUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const showMsg = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3500);
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
      showMsg(`KYC ${action === "approve" ? "approved ✅" : "rejected ❌"} successfully!`);
      setSelected(null);
      setRejectReason("");
      setShowRejectInput(false);
      fetchData();
    } catch (err) {
      showMsg("Action failed. Please try again.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleInviteKYC = async (userId, userName) => {
    setInviteLoading(userId);
    try {
      await axios.post(`${API_URL}/admin/users/${userId}/invite-kyc`, {}, { headers });
      showMsg(`✅ ${userName} has been invited to complete KYC!`);
    } catch (err) {
      showMsg("Failed to send invitation.", "error");
    } finally {
      setInviteLoading(null);
    }
  };

  const kycStatusOf = (userId) => {
    const found = submissions.find(s => s._id === userId);
    return found?.kyc?.status || "none";
  };

  const filtered = submissions.filter(s =>
    filter === "all" ? true : s.kyc?.status === filter
  );

  // Users who have no KYC submitted — can be invited
  const uninvitedUsers = allUsers.filter(u =>
    !u.kycInvited && (!u.kyc?.status || u.kyc?.status === "none") && !u.isAdmin
  );

  const statusBadge = (status) => ({
    pending:  "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
    approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    rejected: "bg-red-500/15 text-red-400 border-red-500/25",
    none:     "bg-white/8 text-white/30 border-white/10",
  }[status] || "bg-white/8 text-white/30 border-white/10");

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
      <p className="text-white/30 text-sm animate-pulse">Loading KYC data...</p>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">KYC Verification</h1>
          <p className="text-white/30 text-xs mt-0.5">
            {submissions.filter(s => s.kyc?.status === "pending").length} pending · {uninvitedUsers.length} can be invited
          </p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white text-sm transition-all">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Message */}
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

      {/* KYC Submissions Table */}
      <div className="rounded-2xl border border-white/8 overflow-hidden">
        <div className="px-5 py-3 bg-white/[0.03] border-b border-white/8">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-widest">Submissions</p>
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
                <p className="text-white/50 text-sm capitalize">{u.kyc?.idType?.replace(/_/g, " ") || "—"}</p>
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
                  {(u.kyc?.status === "approved" || u.kyc?.status === "rejected") && (
                    <button onClick={() => { setSelected(u); setShowRejectInput(false); }}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/30 hover:text-white transition-all">
                      <Eye size={11} /> View
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Invite Users to KYC */}
      {uninvitedUsers.length > 0 && (
        <div className="rounded-2xl border border-purple-500/20 overflow-hidden">
          <div className="px-5 py-3 bg-purple-500/8 border-b border-purple-500/15 flex items-center gap-2">
            <Mail size={14} className="text-purple-400" />
            <p className="text-purple-400 text-xs font-semibold uppercase tracking-widest">Invite Users to KYC</p>
            <span className="text-purple-400/60 text-xs">— {uninvitedUsers.length} users without KYC</span>
          </div>
          <div className="divide-y divide-white/5">
            {uninvitedUsers.slice(0, 10).map((u, i) => (
              <div key={u._id} className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-all">
                <div>
                  <p className="text-white text-sm font-medium">{u.name}</p>
                  <p className="text-white/30 text-xs">{u.email}</p>
                </div>
                <button
                  onClick={() => handleInviteKYC(u._id, u.name)}
                  disabled={inviteLoading === u._id}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-purple-500/15 border border-purple-500/25 text-purple-400 hover:bg-purple-500/25 transition-all disabled:opacity-50 font-semibold">
                  {inviteLoading === u._id
                    ? <span className="w-3 h-3 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                    : <Mail size={11} />}
                  Invite to KYC
                </button>
              </div>
            ))}
            {uninvitedUsers.length > 10 && (
              <p className="text-white/30 text-xs text-center py-3">
                + {uninvitedUsers.length - 10} more users not shown
              </p>
            )}
          </div>
        </div>
      )}

      {/* REVIEW / VIEW MODAL */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="absolute inset-0" onClick={() => { setSelected(null); setZoomedImage(null); }} />

            {/* Zoomed image overlay */}
            {zoomedImage && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/90 p-4"
                onClick={() => setZoomedImage(null)}>
                <img src={zoomedImage} alt="Zoomed" className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl" />
                <button className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition">
                  <X size={18} />
                </button>
                <p className="absolute bottom-4 text-white/40 text-xs">Click anywhere to close</p>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl bg-[#0e1422] border border-white/10 rounded-3xl z-10 shadow-2xl max-h-[90vh] overflow-y-auto">

              {/* Modal Header */}
              <div className="sticky top-0 bg-[#0e1422] border-b border-white/8 px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <p className="text-white font-bold">{selected.name}</p>
                  <p className="text-white/30 text-xs">{selected.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full border font-semibold capitalize ${statusBadge(selected.kyc?.status)}`}>
                    {selected.kyc?.status}
                  </span>
                  <button onClick={() => setSelected(null)}
                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition">
                    <X size={15} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">

                {/* Info row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/8">
                    <p className="text-white/30 text-xs mb-1">{selected.kyc?.method === "bank" ? "Method" : "Document Type"}</p>
                    <p className="text-white text-sm font-semibold capitalize">{selected.kyc?.idType?.replace(/_/g, " ") || "—"}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/8">
                    <p className="text-white/30 text-xs mb-1">Submitted</p>
                    <p className="text-white text-sm font-semibold">
                      {selected.kyc?.submittedAt
                        ? new Date(selected.kyc.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Rejection reason if rejected */}
                {selected.kyc?.status === "rejected" && selected.kyc?.rejectionReason && (
                  <div className="p-4 rounded-xl bg-red-500/8 border border-red-500/20">
                    <p className="text-red-400 text-xs font-semibold mb-1">Rejection Reason</p>
                    <p className="text-white/50 text-sm">{selected.kyc.rejectionReason}</p>
                  </div>
                )}

                {/* Approval date if approved */}
                {selected.kyc?.status === "approved" && selected.kyc?.reviewedAt && (
                  <div className="p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
                    <p className="text-emerald-400 text-xs font-semibold mb-1">Approved On</p>
                    <p className="text-white/50 text-sm">
                      {new Date(selected.kyc.reviewedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                )}

                {/* ── BANK DETAILS (when method is bank) ── */}
                {selected.kyc?.method === "bank" && (
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/8 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Landmark size={14} className="text-emerald-400" />
                      <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">Bank Details</p>
                    </div>
                    {[
                      ["Bank Name", selected.kyc?.bankName],
                      ["Account Holder", selected.kyc?.accountName],
                      ["Account Number", selected.kyc?.accountNumber],
                      ...(selected.kyc?.routingNumber ? [["Routing / SWIFT", selected.kyc.routingNumber]] : []),
                    ].map(([k, v], idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-white/30 text-xs">{k}</span>
                        <span className="text-white text-sm font-medium">{v || "—"}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* ID Document (Front) */}
                {selected.kyc?.idFrontImage && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">ID Document (Front)</p>
                      <button onClick={() => setZoomedImage(selected.kyc.idFrontImage)}
                        className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition">
                        <ZoomIn size={12} /> View Full Size
                      </button>
                    </div>
                    <div className="relative group cursor-pointer rounded-xl overflow-hidden border border-white/10"
                      onClick={() => setZoomedImage(selected.kyc.idFrontImage)}>
                      <img src={selected.kyc.idFrontImage} alt="ID Front"
                        className="w-full object-cover max-h-56 group-hover:brightness-75 transition-all" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <div className="bg-black/50 rounded-xl px-3 py-2 flex items-center gap-2 text-white text-xs font-semibold">
                          <ZoomIn size={14} /> Click to zoom
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ID Document (Back) */}
                {selected.kyc?.idBackImage && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">ID Document (Back)</p>
                      <button onClick={() => setZoomedImage(selected.kyc.idBackImage)}
                        className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition">
                        <ZoomIn size={12} /> View Full Size
                      </button>
                    </div>
                    <div className="relative group cursor-pointer rounded-xl overflow-hidden border border-white/10"
                      onClick={() => setZoomedImage(selected.kyc.idBackImage)}>
                      <img src={selected.kyc.idBackImage} alt="ID Back"
                        className="w-full object-cover max-h-56 group-hover:brightness-75 transition-all" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <div className="bg-black/50 rounded-xl px-3 py-2 flex items-center gap-2 text-white text-xs font-semibold">
                          <ZoomIn size={14} /> Click to zoom
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Selfie */}
                {selected.kyc?.selfieImage && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">Selfie with ID</p>
                      <button onClick={() => setZoomedImage(selected.kyc.selfieImage)}
                        className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition">
                        <ZoomIn size={12} /> View Full Size
                      </button>
                    </div>
                    <div className="relative group cursor-pointer rounded-xl overflow-hidden border border-white/10"
                      onClick={() => setZoomedImage(selected.kyc.selfieImage)}>
                      <img src={selected.kyc.selfieImage} alt="Selfie"
                        className="w-full object-cover max-h-56 group-hover:brightness-75 transition-all" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <div className="bg-black/50 rounded-xl px-3 py-2 flex items-center gap-2 text-white text-xs font-semibold">
                          <ZoomIn size={14} /> Click to zoom
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action buttons — only for pending */}
                {selected.kyc?.status === "pending" && (
                  <div className="space-y-3 pt-2">
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
                          className="py-3 rounded-xl bg-red-500/15 border border-red-500/25 text-red-400 text-sm font-semibold hover:bg-red-500/25 transition-all flex items-center justify-center gap-2">
                          <XCircle size={15} /> Reject
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Enter rejection reason (e.g. ID is blurry, selfie not clear, documents don't match)..."
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
                  </div>
                )}

                <button onClick={() => { setSelected(null); setZoomedImage(null); }}
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
