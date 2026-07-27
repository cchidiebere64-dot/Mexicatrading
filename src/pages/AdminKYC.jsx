import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, RefreshCw, Check, X, ZoomIn, Mail, Landmark,
  Send, ChevronRight, UserPlus,
} from "lucide-react";
import { T, ThemeStyles, Button, Spinner, StatusPill, EmptyState, Banner, inputStyle, LedgerRow } from "./system.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com/api";
const c = T.color;

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
  const [showInvites, setShowInvites] = useState(false);

  const token = sessionStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}` };

  const showMsg = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3500);
  };

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
      showMsg("Failed to load verification data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (action) => {
    if (action === "reject" && !rejectReason.trim()) {
      showMsg("Give a reason so the user knows what to fix.", "error");
      return;
    }
    setActionLoading(true);
    try {
      await axios.put(
        `${API_URL}/admin/kyc/${selected._id}`,
        { action, rejectionReason: rejectReason },
        { headers }
      );
      showMsg(action === "approve" ? "Verification approved." : "Verification rejected.");
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
      showMsg(`${userName} has been invited to verify.`);
      fetchData();
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

  const counts = {
    pending: submissions.filter(s => s.kyc?.status === "pending").length,
    approved: submissions.filter(s => s.kyc?.status === "approved").length,
    rejected: submissions.filter(s => s.kyc?.status === "rejected").length,
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString(undefined, {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }) : "—";

  const tone = (s) => s === "approved" ? "gain" : s === "pending" ? "brass" : s === "rejected" ? "loss" : "neutral";
  const docLabel = (t) => (t || "").replace(/_/g, " ") || "—";

  /* ── Zoom overlay via portal so it sits above everything ── */
  const ZoomOverlay = () => {
    if (!zoomedImage) return null;
    return createPortal(
      <div onClick={() => setZoomedImage(null)}
        style={{
          position: "fixed", inset: 0, zIndex: 99999,
          background: "rgba(8,9,11,.96)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 14,
        }}>
        <img src={zoomedImage} alt="Document"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: "100%", maxHeight: "88vh", objectFit: "contain" }} />
        <button onClick={() => setZoomedImage(null)} aria-label="Close"
          style={{
            position: "absolute", top: 18, right: 18, width: 40, height: 40,
            background: "rgba(255,255,255,.08)", border: `1px solid ${c.line}`, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
          <X size={18} />
        </button>
        <p className="mono" style={{
          position: "absolute", bottom: 20, left: 0, right: 0, textAlign: "center",
          fontSize: T.size.tiny, letterSpacing: ".16em", textTransform: "uppercase", color: c.text4,
        }}>
          Tap anywhere to close
        </p>
      </div>,
      document.body
    );
  };

  const ImageBlock = ({ label, src }) => (
    <div>
      <p className="eyebrow" style={{ marginBottom: 6 }}>{label}</p>
      {src ? (
        <button onClick={() => setZoomedImage(src)}
          style={{ position: "relative", width: "100%", display: "block", border: `1px solid ${c.line}` }}>
          <img src={src} alt={label} style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }} />
          <span style={{
            position: "absolute", bottom: 8, right: 8, width: 26, height: 26,
            background: "rgba(14,16,19,.82)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ZoomIn size={13} color="#fff" />
          </span>
        </button>
      ) : (
        <div className="flex items-center justify-center"
          style={{ height: 150, border: `1px dashed ${c.line}`, fontSize: T.size.xs, color: c.text4 }}>
          Not provided
        </div>
      )}
    </div>
  );

  if (loading) return (
    <div className="ui flex flex-col items-center justify-center gap-4" style={{ height: 260 }}>
      <ThemeStyles />
      <Spinner size={26} />
      <p className="mono" style={{ fontSize: T.size.xs, letterSpacing: ".2em", textTransform: "uppercase", color: c.text3 }}>
        Loading
      </p>
    </div>
  );

  return (
    <div className="ui" style={{ color: c.text }}>
      <ThemeStyles />
      <ZoomOverlay />

      {/* ── Header ── */}
      <div className="flex items-end justify-between gap-3" style={{ marginBottom: T.space.xl }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 6 }}>Compliance</p>
          <h1 className="display" style={{ fontSize: T.size.xl, lineHeight: 1.1 }}>Verification</h1>
          <p className="mono" style={{ fontSize: T.size.xs, color: c.text3, marginTop: 6 }}>
            {submissions.length} submissions
          </p>
        </div>
        <button onClick={fetchData} aria-label="Refresh"
          className="flex items-center justify-center shrink-0"
          style={{ width: 36, height: 36, background: c.fill, border: `1px solid ${c.line}`, color: c.text3 }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {/* ── Totals ── */}
      <div className="grid grid-cols-3" style={{ border: `1px solid ${c.line}`, marginBottom: T.space.lg }}>
        {[
          ["Awaiting you", counts.pending, counts.pending > 0 ? c.brass : c.text2],
          ["Approved", counts.approved, c.gain],
          ["Rejected", counts.rejected, c.text2],
        ].map(([label, value, col], i) => (
          <div key={i} style={{ padding: T.space.lg, borderLeft: i > 0 ? `1px solid ${c.line}` : "none" }}>
            <p className="eyebrow" style={{ marginBottom: 8 }}>{label}</p>
            <p className="mono tabular" style={{ fontSize: T.size.base, color: col }}>{value}</p>
          </div>
        ))}
      </div>

      {message.text && (
        <div style={{ marginBottom: T.space.lg }}>
          <Banner tone={message.type === "success" ? "gain" : "loss"} title={message.text} />
        </div>
      )}

      {/* ══ NOT YET INVITED ══ */}
      {uninvitedUsers.length > 0 && (
        <div style={{ border: `1px solid ${c.line}`, marginBottom: T.space.xl }}>
          <button onClick={() => setShowInvites(!showInvites)}
            className="w-full flex items-center justify-between gap-3 hover-fill"
            style={{ padding: T.space.lg, transition: "background .2s" }}>
            <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
              <UserPlus size={15} style={{ color: c.brass, flexShrink: 0 }} />
              <div style={{ textAlign: "left", minWidth: 0 }}>
                <p style={{ fontSize: T.size.sm, color: c.text }}>
                  {uninvitedUsers.length} {uninvitedUsers.length === 1 ? "member has" : "members have"} not been invited
                </p>
                <p style={{ fontSize: T.size.xs, color: c.text4, marginTop: 2 }}>
                  Invite them to verify so withdrawals aren't blocked later
                </p>
              </div>
            </div>
            <ChevronRight size={14}
              style={{ color: c.text4, flexShrink: 0, transform: showInvites ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
          </button>

          <AnimatePresence>
            {showInvites && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                transition={{ duration: .25 }}
                style={{ overflow: "hidden", borderTop: `1px solid ${c.line}` }}>
                {uninvitedUsers.map((u, i) => (
                  <div key={u._id}
                    className="flex items-center justify-between gap-3"
                    style={{
                      padding: T.space.lg,
                      borderBottom: i < uninvitedUsers.length - 1 ? `1px solid ${c.lineSoft}` : "none",
                    }}>
                    <div style={{ minWidth: 0 }}>
                      <p className="truncate" style={{ fontSize: T.size.sm, color: c.text }}>{u.name}</p>
                      <p className="mono truncate" style={{ fontSize: T.size.tiny, color: c.text4, marginTop: 2 }}>
                        {u.email}
                      </p>
                    </div>
                    <Button variant="outline"
                      onClick={() => handleInviteKYC(u._id, u.name)}
                      disabled={inviteLoading === u._id}
                      icon={inviteLoading === u._id ? <Spinner size={12} /> : <Send size={12} />}
                      style={{ flexShrink: 0 }}>
                      Invite
                    </Button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex" style={{ borderBottom: `1px solid ${c.line}`, marginBottom: T.space.xl }}>
        {["pending", "approved", "rejected", "all"].map((f) => {
          const on = filter === f;
          return (
            <button key={f} onClick={() => setFilter(f)}
              className="mono"
              style={{
                padding: "11px 15px", fontSize: T.size.tiny,
                letterSpacing: ".14em", textTransform: "uppercase",
                color: on ? c.gain : c.text3,
                borderBottom: `2px solid ${on ? c.gain : "transparent"}`,
                marginBottom: -1, transition: "color .2s",
              }}>
              {f}{f !== "all" && counts[f] > 0 ? ` · ${counts[f]}` : ""}
            </button>
          );
        })}
      </div>

      {/* ── List ── */}
      {filtered.length === 0 ? (
        <EmptyState icon={<ShieldCheck size={20} />} title={`No ${filter === "all" ? "" : filter} submissions`}
          text={filter === "pending" ? "Nothing waiting on you right now." : "Try another filter."} />
      ) : (
        <div style={{ border: `1px solid ${c.line}` }}>
          {filtered.map((u, i) => (
            <div key={u._id}
              style={{
                padding: T.space.lg,
                borderBottom: i < filtered.length - 1 ? `1px solid ${c.lineSoft}` : "none",
                borderLeft: `2px solid ${u.kyc?.status === "pending" ? c.brass : "transparent"}`,
              }}>
              <div className="flex items-start justify-between gap-3" style={{ marginBottom: T.space.md }}>
                <div style={{ minWidth: 0 }}>
                  <p className="truncate" style={{ fontSize: T.size.sm, color: c.text }}>{u.name}</p>
                  <p className="mono truncate" style={{ fontSize: T.size.tiny, color: c.text4, marginTop: 2 }}>{u.email}</p>
                </div>
                <StatusPill tone={tone(u.kyc?.status)}>{u.kyc?.status}</StatusPill>
              </div>

              <div className="flex items-baseline justify-between"
                style={{ borderTop: `1px solid ${c.lineSoft}`, paddingTop: T.space.md, marginBottom: T.space.md }}>
                <span className="mono" style={{ fontSize: T.size.tiny, color: c.text3, textTransform: "capitalize" }}>
                  {u.kyc?.method === "bank" ? "Bank details" : docLabel(u.kyc?.idType)}
                </span>
                <span className="mono" style={{ fontSize: T.size.tiny, color: c.text4 }}>
                  {fmtDate(u.kyc?.submittedAt)}
                </span>
              </div>

              <Button variant={u.kyc?.status === "pending" ? "primary" : "quiet"} full
                onClick={() => { setSelected(u); setShowRejectInput(false); setRejectReason(""); }}>
                Review submission <ChevronRight size={13} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* ══ REVIEW SHEET ══ */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            style={{ background: "rgba(8,9,11,.88)" }}>
            <div className="absolute inset-0" onClick={() => setSelected(null)} />

            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              transition={{ duration: .3, ease: [.22, 1, .36, 1] }}
              className="relative w-full sm:max-w-lg z-10"
              style={{ background: c.panel, border: `1px solid ${c.line}`, maxHeight: "92vh", display: "flex", flexDirection: "column" }}>

              <div className="flex items-start justify-between gap-3"
                style={{ padding: T.space.xl, borderBottom: `1px solid ${c.line}` }}>
                <div style={{ minWidth: 0 }}>
                  <p className="eyebrow" style={{ marginBottom: 6 }}>Review submission</p>
                  <h3 className="display truncate" style={{ fontSize: T.size.xl, lineHeight: 1.15 }}>{selected.name}</h3>
                  <a href={`mailto:${selected.email}`} className="mono truncate flex items-center gap-1.5"
                    style={{ fontSize: T.size.tiny, color: c.gain, marginTop: 4 }}>
                    <Mail size={10} /> {selected.email}
                  </a>
                </div>
                <button onClick={() => setSelected(null)} aria-label="Close"
                  className="flex items-center justify-center shrink-0"
                  style={{ width: 32, height: 32, background: c.fill, color: c.text3 }}>
                  <X size={14} />
                </button>
              </div>

              <div style={{ padding: T.space.xl, overflowY: "auto", flex: 1 }}>

                <div style={{ border: `1px solid ${c.line}`, padding: `0 ${T.space.lg}px`, marginBottom: T.space.lg }}>
                  <LedgerRow label="Status" value={selected.kyc?.status} />
                  <LedgerRow label="Method"
                    value={selected.kyc?.method === "bank" ? "Bank details" : docLabel(selected.kyc?.idType)} />
                  <LedgerRow label="Submitted" value={fmtDate(selected.kyc?.submittedAt)} last />
                </div>

                {selected.kyc?.method === "bank" ? (
                  <div style={{ border: `1px solid ${c.line}`, padding: T.space.lg }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: T.space.md }}>
                      <Landmark size={14} style={{ color: c.text3 }} />
                      <p className="eyebrow">Bank details</p>
                    </div>
                    <div style={{ borderTop: `1px solid ${c.lineSoft}` }}>
                      <LedgerRow label="Bank" value={selected.kyc?.bankName || "—"} />
                      <LedgerRow label="Account name" value={selected.kyc?.accountName || "—"} />
                      <LedgerRow label="Account number" value={selected.kyc?.accountNumber || "—"} />
                      <LedgerRow label="Routing / SWIFT" value={selected.kyc?.routingNumber || "—"} last />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: T.space.lg }}>
                    <ImageBlock label="Document · front" src={selected.kyc?.idFrontImage} />
                    <ImageBlock label="Document · back" src={selected.kyc?.idBackImage} />
                    <ImageBlock label="Selfie with document" src={selected.kyc?.selfieImage} />
                  </div>
                )}

                {selected.kyc?.status === "rejected" && selected.kyc?.rejectionReason && (
                  <div style={{ marginTop: T.space.lg }}>
                    <Banner tone="loss" title="Rejection reason" text={selected.kyc.rejectionReason} />
                  </div>
                )}

                {showRejectInput && (
                  <div style={{ marginTop: T.space.lg }}>
                    <p className="eyebrow" style={{ marginBottom: 6 }}>Reason for rejection</p>
                    <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                      placeholder="e.g. The back of the document is blurred — please resubmit a sharper photo."
                      style={{ ...inputStyle, resize: "none", borderColor: "rgba(180,85,63,.35)" }} />
                    <p style={{ fontSize: T.size.tiny, color: c.text4, marginTop: 6, lineHeight: 1.6 }}>
                      This is emailed to the user, so be specific about what to fix.
                    </p>
                  </div>
                )}
              </div>

              {selected.kyc?.status === "pending" && (
                <div style={{ padding: T.space.lg, borderTop: `1px solid ${c.line}` }}>
                  {!showRejectInput ? (
                    <div className="flex" style={{ gap: 8 }}>
                      <Button variant="primary" style={{ flex: 1 }}
                        onClick={() => handleAction("approve")}
                        disabled={actionLoading}
                        icon={actionLoading ? <Spinner size={12} tone="#fff" /> : <Check size={13} />}>
                        Approve
                      </Button>
                      <Button variant="danger" style={{ flex: 1 }} onClick={() => setShowRejectInput(true)}
                        icon={<X size={13} />}>
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <div className="flex" style={{ gap: 8 }}>
                      <Button variant="quiet" style={{ flex: 1 }}
                        onClick={() => { setShowRejectInput(false); setRejectReason(""); }}>
                        Cancel
                      </Button>
                      <Button variant="danger" style={{ flex: 1 }}
                        onClick={() => handleAction("reject")}
                        disabled={actionLoading}
                        icon={actionLoading ? <Spinner size={12} tone={c.loss} /> : <Send size={13} />}>
                        Confirm rejection
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
