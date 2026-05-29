import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, RefreshCw, CheckCircle, XCircle, Eye, X, ZoomIn, Mail, Landmark, Calendar, FileText } from "lucide-react";

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

  const filtered = submissions.filter(s =>
    filter === "all" ? true : s.kyc?.status === filter
  );

  const uninvitedUsers = allUsers.filter(u =>
    !u.kycInvited && (!u.kyc?.status || u.kyc?.status === "none") && !u.isAdmin
  );

  const statusBadge = (status) => ({
    pending:  "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
    approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    rejected: "bg-red-500/15 text-red-400 border-red-500/25",
    none:     "bg-white/8 text-white/30 border-white/10",
  }[status] || "bg-white/8 text-white/30 border-white/10");

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  /* ─── Full-screen zoom rendered ON TOP via portal ─── */
  const ZoomOverlay = () => {
    if (!zoomedImage) return null;
    return createPortal(
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={() => setZoomedImage(null)}
        style={{ position: "fixed", inset: 0, zIndex: 99999 }}
        className="flex items-center justify-center bg-black/95 p-3">
        <img src={zoomedImage} alt="Zoomed" className="max-w-full max-h-full rounded-xl object-contain shadow-2xl" />
        <button onClick={() => setZoomedImage(null)}
          className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/15 flex items-center justify-center text-white active:bg-white/30 transition">
          <X size={20} />
        </button>
        <p className="absolute bottom-5 left-0 right-0 text-center text-white/50 text-xs">Tap anywhere to close</p>
      </motion.div>,
      document.body
    );
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
      <p className="text-white/30 text-sm animate-pulse">Loading KYC data...</p>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
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

      {/* ─── KYC Submissions — CARD layout (mobile friendly) ─── */}
      <div>
        <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">Submissions</p>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 rounded-2xl border border-white/8">
            <ShieldCheck size={24} className="text-white/20" />
            <p className="text-white/30 text-sm">No {filter} submissions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((u, i) => (
              <motion.div key={u._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">

                {/* top: name + status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-semibold truncate">{u.name}</p>
                    <p className="text-white/30 text-xs truncate">{u.email}</p>
                  </div>
                  <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full border font-semibold capitalize ${statusBadge(u.kyc?.status)}`}>
                    {u.kyc?.status || "none"}
                  </span>
                </div>

                {/* meta: type + date */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5">
                    <FileText size={12} className="text-white/25" />
                    <span className="text-white/50 text-xs capitalize">{u.kyc?.idType?.replace(/_/g, " ") || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-white/25" />
                    <span className="text-white/40 text-xs">{fmtDate(u.kyc?.submittedAt)}</span>
                  </div>
                </div>

                {/* full-width action button */}
                <button onClick={() => { setSelected(u); setShowRejectInput(false); setRejectReason(""); }}
                  className="w-full flex items-center justify-center gap-2 text-sm py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white active:bg-white/10 transition-all font-medium">
                  <Eye size={14} /> {u.kyc?.status === "pending" ? "Review Submission" : "View Submission"}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Users to KYC */}
      {uninvitedUsers.length > 0 && (
        <div className="rounded-2xl border border-purple-500/20 overflow-hidden">
          <div className="px-5 py-3 bg-purple-500/8 border-b border-purple-500/15 flex items-center gap-2 flex-wrap">
            <Mail size={14} className="text-purple-400" />
            <p className="text-purple-400 text-xs font-semibold uppercase tracking-widest">Invite Users to KYC</p>
            <span className="text-purple-400/60 text-xs">— {uninvitedUsers.length} users without KYC</span>
          </div>
          <div className="divide-y divide-white/5">
            {uninvitedUsers.slice(0, 10).map((u) => (
              <div key={u._id} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-white/[0.02] transition-all">
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-medium truncate">{u.name}</p>
                  <p className="text-white/30 text-xs truncate">{u.email}</p>
                </div>
                <button
                  onClick={() => handleInviteKYC(u._id, u.name)}
                  disabled={inviteLoading === u._id}
                  className="shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-purple-500/15 border border-purple-500/25 text-purple-400 hover:bg-purple-500/25 transition-all disabled:opacity-50 font-semibold">
                  {inviteLoading === u._id
                    ? <span className="w-3 h-3 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                    : <Mail size={11} />}
                  Invite
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

      {/* ─── REVIEW / VIEW MODAL ─── */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setSelected(null)} />

            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="relative w-full sm:max-w-xl bg-[#0e1422] border border-white/10 rounded-t-3xl sm:rounded-3xl z-10 shadow-2xl max-h-[92vh] overflow-y-auto">

              {/* Modal Header */}
              <div className="sticky top-0 bg-[#0e1422] border-b border-white/8 px-5 py-4 flex items-center justify-between z-10">
                <div className="min-w-0 flex-1">
                  <p className="text-white font-bold truncate">{selected.name}</p>
                  <p className="text-white/30 text-xs truncate">{selected.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full border font-semibold capitalize ${statusBadge(selected.kyc?.status)}`}>
                    {selected.kyc?.status}
                  </span>
                  <button onClick={() => setSelected(null)}
                    className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white active:bg-white/10 transition">
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">

                {/* Info row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/8">
                    <p className="text-white/30 text-xs mb-1">{selected.kyc?.method === "bank" ? "Method" : "Document Type"}</p>
                    <p className="text-white text-sm font-semibold capitalize">{selected.kyc?.idType?.replace(/_/g, " ") || "—"}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/8">
                    <p className="text-white/30 text-xs mb-1">Submitted</p>
                    <p className="text-white text-sm font-semibold">{fmtDate(selected.kyc?.submittedAt)}</p>
                  </div>
                </div>

                {/* Rejection reason */}
                {selected.kyc?.status === "rejected" && selected.kyc?.rejectionReason && (
                  <div className="p-4 rounded-xl bg-red-500/8 border border-red-500/20">
                    <p className="text-red-400 text-xs font-semibold mb-1">Rejection Reason</p>
                    <p className="text-white/50 text-sm">{selected.kyc.rejectionReason}</p>
                  </div>
                )}

                {/* Approval date */}
                {selected.kyc?.status === "approved" && selected.kyc?.reviewedAt && (
                  <div className="p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
                    <p className="text-emerald-400 text-xs font-semibold mb-1">Approved On</p>
                    <p className="text-white/50 text-sm">{fmtDate(selected.kyc.reviewedAt)}</p>
                  </div>
                )}

                {/* BANK DETAILS */}
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
                      <div key={idx} className="flex justify-between items-center gap-3">
                        <span className="text-white/30 text-xs shrink-0">{k}</span>
                        <span className="text-white text-sm font-medium text-right break-all">{v || "—"}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* ID Front */}
                {selected.kyc?.idFrontImage && (
                  <ImageBlock label="ID Document (Front)" src={selected.kyc.idFrontImage} onZoom={setZoomedImage} />
                )}
                {/* ID Back */}
                {selected.kyc?.idBackImage && (
                  <ImageBlock label="ID Document (Back)" src={selected.kyc.idBackImage} onZoom={setZoomedImage} />
                )}
                {/* Selfie */}
                {selected.kyc?.selfieImage && (
                  <ImageBlock label="Selfie with ID" src={selected.kyc.selfieImage} onZoom={setZoomedImage} />
                )}

                {/* Action buttons — only for pending */}
                {selected.kyc?.status === "pending" && (
                  <div className="space-y-3 pt-1">
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

                <button onClick={() => setSelected(null)}
                  className="w-full py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition text-sm text-white/40 hover:text-white">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoom overlay — rendered on top of everything via portal */}
      <AnimatePresence>
        <ZoomOverlay />
      </AnimatePresence>
    </div>
  );
}

/* ─── Reusable image block with zoom ─── */
function ImageBlock({ label, src, onZoom }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">{label}</p>
        <button onClick={() => onZoom(src)}
          className="flex items-center gap-1 text-xs text-emerald-400 active:text-emerald-300 transition">
          <ZoomIn size={12} /> View Full Size
        </button>
      </div>
      <div className="relative cursor-pointer rounded-xl overflow-hidden border border-white/10" onClick={() => onZoom(src)}>
        <img src={src} alt={label} className="w-full object-cover max-h-64" />
        <div className="absolute bottom-2 right-2 bg-black/60 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-white text-xs font-semibold">
          <ZoomIn size={13} /> Tap to zoom
        </div>
      </div>
    </div>
  );
}
