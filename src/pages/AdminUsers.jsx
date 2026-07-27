import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, X, ShieldOff, Shield, KeyRound, Trash2, RefreshCw,
  ChevronRight, MessageSquare, Send, Phone, Copy, Check, Mail,
} from "lucide-react";
import { T, ThemeStyles, Button, Spinner, StatusPill, EmptyState, Banner, inputStyle, LedgerRow } from "./system.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com/api";
const c = T.color;

/* Friendly welcome message pre-filled when you WhatsApp a user */
const waMessage = (name) =>
  `Hi ${name || "dear"} 👋 Welcome to MexicaTrading! I'm reaching out from our support team. I noticed you recently registered — is there anything I can help you with to get started? We're happy to guide you with funding, investing, or any questions you may have 😊`;

/* Turn a phone number into a clean wa.me format (digits only) */
const toWaNumber = (phone) => (phone || "").replace(/[^0-9]/g, "");

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

  const [showMessageForm, setShowMessageForm] = useState(false);
  const [msgSubject, setMsgSubject] = useState("");
  const [msgBody, setMsgBody] = useState("");

  const [copied, setCopied] = useState(""); // "phone" | "email" | ""

  const token = sessionStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}` };

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

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
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.country?.toLowerCase().includes(q)
    ));
  }, [search, users]);

  const copyText = async (text, which) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      showMessage("Couldn't copy. Please copy manually.", "error");
    }
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

  const sendMessage = async () => {
    if (!msgSubject.trim() || !msgBody.trim()) {
      return showMessage("Please enter both subject and message.", "error");
    }
    setActionLoading(true);
    try {
      await axios.post(
        `${API_URL}/admin/users/${selectedUser._id}/message`,
        { subject: msgSubject, message: msgBody },
        { headers }
      );
      showMessage("Message sent successfully!");
      setMsgSubject("");
      setMsgBody("");
      setShowMessageForm(false);
    } catch {
      showMessage("Failed to send message.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const openUser = (u) => {
    setSelectedUser(u);
    setConfirmDelete(false);
    setShowPasswordField(false);
    setShowMessageForm(false);
    setAmount("");
    setMsgSubject("");
    setMsgBody("");
    setCopied("");
  };

  const memberSince = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  };

  const money = (v) => Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const totalBalance = users.reduce((s, u) => s + (Number(u.balance) || 0), 0);
  const verified = users.filter(u => u.isVerified).length;
  const frozen = users.filter(u => u.freezeWithdrawals).length;

  if (loading) return (
    <div className="ui flex flex-col items-center justify-center gap-4" style={{ height: 260 }}>
      <ThemeStyles />
      <Spinner size={26} />
      <p className="mono" style={{ fontSize: T.size.xs, letterSpacing: ".2em", textTransform: "uppercase", color: c.text3 }}>
        Loading
      </p>
    </div>
  );

  const iconBtn = {
    width: 30, height: 30,
    background: c.fill, border: `1px solid ${c.line}`, color: c.text4,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  };

  return (
    <div className="ui" style={{ color: c.text }}>
      <ThemeStyles />

      {/* ── Header ── */}
      <div className="flex items-end justify-between gap-3" style={{ marginBottom: T.space.xl }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 6 }}>Accounts</p>
          <h1 className="display" style={{ fontSize: T.size.xl, lineHeight: 1.1 }}>Users</h1>
          <p className="mono" style={{ fontSize: T.size.xs, color: c.text3, marginTop: 6 }}>
            {users.length} registered
          </p>
        </div>
        <button onClick={fetchUsers} aria-label="Refresh"
          className="flex items-center justify-center shrink-0"
          style={{ width: 36, height: 36, background: c.fill, border: `1px solid ${c.line}`, color: c.text3 }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {/* ── Totals ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4" style={{ border: `1px solid ${c.line}`, marginBottom: T.space.xl }}>
        {[
          ["Users", String(users.length), c.text],
          ["Verified", String(verified), c.gain],
          ["Frozen", String(frozen), frozen > 0 ? c.brass : c.text2],
          ["Held balance", `$${money(totalBalance)}`, c.text],
        ].map(([label, value, col], i) => (
          <div key={i} style={{
            padding: T.space.lg,
            borderLeft: i % 2 === 1 ? `1px solid ${c.line}` : "none",
            borderTop: i > 1 ? `1px solid ${c.line}` : "none",
          }} className="sm:border-l sm:border-t-0">
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

      {/* ── Search ── */}
      <div style={{ position: "relative", marginBottom: T.space.xl }}>
        <Search size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.text4 }} />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone or country"
          style={{ ...inputStyle, paddingLeft: 36 }} />
      </div>

      {/* ── List ── */}
      {filtered.length === 0 ? (
        <EmptyState icon={<Users size={20} />} title="No users found"
          text="Try a different search term." />
      ) : (
        <div style={{ border: `1px solid ${c.line}` }}>
          {filtered.map((u, i) => (
            <button key={u._id} onClick={() => openUser(u)}
              className="w-full text-left hover-fill flex items-center gap-3"
              style={{
                padding: T.space.lg,
                borderBottom: i < filtered.length - 1 ? `1px solid ${c.lineSoft}` : "none",
                borderLeft: `2px solid ${u.freezeWithdrawals ? c.brass : "transparent"}`,
                transition: "background .2s",
              }}>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 3 }}>
                  <span className="truncate" style={{ fontSize: T.size.sm, color: c.text }}>{u.name}</span>
                  {u.freezeWithdrawals && <StatusPill tone="brass">Frozen</StatusPill>}
                </div>
                <p className="mono truncate" style={{ fontSize: T.size.tiny, color: c.text4 }}>
                  {u.email}{u.country ? ` · ${u.country}` : ""}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="mono tabular" style={{ fontSize: T.size.sm, color: c.gain }}>
                  ${money(u.balance)}
                </p>
              </div>

              <ChevronRight size={14} style={{ color: c.text4, flexShrink: 0 }} />
            </button>
          ))}
        </div>
      )}

      {/* ══ USER SHEET ══ */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            style={{ background: "rgba(8,9,11,.88)" }}>
            <div className="absolute inset-0" onClick={() => setSelectedUser(null)} />

            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              transition={{ duration: .3, ease: [.22, 1, .36, 1] }}
              className="relative w-full sm:max-w-md z-10"
              style={{ background: c.panel, border: `1px solid ${c.line}`, maxHeight: "92vh", display: "flex", flexDirection: "column" }}>

              {/* header */}
              <div className="flex items-start justify-between gap-3"
                style={{ padding: T.space.xl, borderBottom: `1px solid ${c.line}` }}>
                <div style={{ minWidth: 0 }}>
                  <p className="eyebrow" style={{ marginBottom: 6 }}>Account</p>
                  <h3 className="display truncate" style={{ fontSize: T.size.xl, lineHeight: 1.15 }}>
                    {selectedUser.name}
                  </h3>
                </div>
                <button onClick={() => setSelectedUser(null)} aria-label="Close"
                  className="flex items-center justify-center shrink-0"
                  style={{ width: 32, height: 32, background: c.fill, color: c.text3 }}>
                  <X size={14} />
                </button>
              </div>

              <div style={{ padding: T.space.xl, overflowY: "auto", flex: 1 }}>

                {/* balance */}
                <div style={{ border: `1px solid ${c.line}`, padding: T.space.lg, marginBottom: T.space.lg }}>
                  <p className="eyebrow" style={{ marginBottom: 6 }}>Current balance</p>
                  <p className="mono tabular" style={{ fontSize: 26, color: c.gain, lineHeight: 1 }}>
                    ${money(selectedUser.balance)}
                  </p>
                </div>

                {/* contact */}
                <p className="eyebrow" style={{ marginBottom: T.space.md }}>Contact</p>
                <div style={{ border: `1px solid ${c.line}`, marginBottom: T.space.lg }}>

                  {/* phone */}
                  <div style={{ padding: T.space.lg, borderBottom: `1px solid ${c.lineSoft}` }}>
                    <div className="flex items-center justify-between gap-2" style={{ marginBottom: 8 }}>
                      <span className="eyebrow flex items-center gap-1.5"><Phone size={10} /> WhatsApp</span>
                      {selectedUser.phone && (
                        <button onClick={() => copyText(selectedUser.phone, "phone")} aria-label="Copy phone"
                          style={{ ...iconBtn, color: copied === "phone" ? c.gain : c.text4 }}>
                          {copied === "phone" ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      )}
                    </div>
                    {selectedUser.phone ? (
                      <a href={`https://wa.me/${toWaNumber(selectedUser.phone)}?text=${encodeURIComponent(waMessage(selectedUser.name))}`}
                        target="_blank" rel="noopener noreferrer"
                        className="mono flex items-center gap-2"
                        style={{ fontSize: T.size.sm, color: c.gain }}>
                        <MessageSquare size={13} /> {selectedUser.phone}
                      </a>
                    ) : (
                      <p style={{ fontSize: T.size.xs, color: c.text4 }}>Not provided</p>
                    )}
                  </div>

                  {/* email */}
                  <div style={{ padding: T.space.lg }}>
                    <div className="flex items-center justify-between gap-2" style={{ marginBottom: 8 }}>
                      <span className="eyebrow flex items-center gap-1.5"><Mail size={10} /> Email</span>
                      {selectedUser.email && (
                        <button onClick={() => copyText(selectedUser.email, "email")} aria-label="Copy email"
                          style={{ ...iconBtn, color: copied === "email" ? c.gain : c.text4 }}>
                          {copied === "email" ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      )}
                    </div>
                    <a href={`mailto:${selectedUser.email}?subject=${encodeURIComponent("MexicaTrading Support")}&body=${encodeURIComponent("Hi " + (selectedUser.name || "dear") + ",\n\n")}`}
                      className="mono truncate block"
                      style={{ fontSize: T.size.sm, color: c.gain }}>
                      {selectedUser.email}
                    </a>
                  </div>
                </div>

                {/* details */}
                <div style={{ border: `1px solid ${c.line}`, padding: `0 ${T.space.lg}px`, marginBottom: T.space.xl }}>
                  <LedgerRow label="Country" value={selectedUser.country || "—"} />
                  <LedgerRow label="Joined" value={memberSince(selectedUser.createdAt)} />
                  <LedgerRow label="Email verified"
                    value={selectedUser.isVerified ? "Yes" : "No"}
                    accent={selectedUser.isVerified ? c.gain : c.brass} />
                  <LedgerRow label="Withdrawals"
                    value={selectedUser.freezeWithdrawals ? "Frozen" : "Allowed"}
                    accent={selectedUser.freezeWithdrawals ? c.brass : c.gain} last />
                </div>

                {/* balance adjust */}
                <p className="eyebrow" style={{ marginBottom: T.space.md }}>Adjust balance</p>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount"
                  className="mono tabular"
                  style={{ ...inputStyle, marginBottom: 8 }} />
                <div className="grid grid-cols-2" style={{ gap: 8, marginBottom: T.space.xl }}>
                  <Button variant="primary" onClick={() => updateBalance("credit")} disabled={actionLoading}>
                    Credit
                  </Button>
                  <Button variant="danger" onClick={() => updateBalance("deduct")} disabled={actionLoading}>
                    Deduct
                  </Button>
                </div>

                {/* actions */}
                <p className="eyebrow" style={{ marginBottom: T.space.md }}>Actions</p>

                <Button variant={selectedUser.freezeWithdrawals ? "primary" : "quiet"} full
                  onClick={toggleFreeze} disabled={actionLoading}
                  icon={selectedUser.freezeWithdrawals ? <Shield size={13} /> : <ShieldOff size={13} />}
                  style={{ marginBottom: 8 }}>
                  {selectedUser.freezeWithdrawals ? "Unfreeze withdrawals" : "Freeze withdrawals"}
                </Button>

                {!showMessageForm ? (
                  <Button variant="quiet" full onClick={() => setShowMessageForm(true)}
                    icon={<MessageSquare size={13} />} style={{ marginBottom: 8 }}>
                    Send in-app message
                  </Button>
                ) : (
                  <div style={{ border: `1px solid ${c.line}`, padding: T.space.lg, marginBottom: 8 }}>
                    <p className="eyebrow" style={{ marginBottom: T.space.md }}>
                      Message to {selectedUser.name}
                    </p>
                    <input type="text" placeholder="Subject" value={msgSubject}
                      onChange={(e) => setMsgSubject(e.target.value)}
                      style={{ ...inputStyle, marginBottom: 8 }} />
                    <textarea placeholder="Your message" value={msgBody} rows={4}
                      onChange={(e) => setMsgBody(e.target.value)}
                      style={{ ...inputStyle, resize: "none", marginBottom: T.space.md }} />
                    <div className="grid grid-cols-2" style={{ gap: 8 }}>
                      <Button variant="quiet"
                        onClick={() => { setShowMessageForm(false); setMsgSubject(""); setMsgBody(""); }}>
                        Cancel
                      </Button>
                      <Button onClick={sendMessage} disabled={actionLoading}
                        icon={actionLoading ? <Spinner size={12} tone="#fff" /> : <Send size={13} />}>
                        Send
                      </Button>
                    </div>
                  </div>
                )}

                {!showPasswordField ? (
                  <Button variant="quiet" full onClick={() => setShowPasswordField(true)}
                    icon={<KeyRound size={13} />} style={{ marginBottom: 8 }}>
                    Reset password
                  </Button>
                ) : (
                  <div style={{ border: `1px solid ${c.line}`, padding: T.space.lg, marginBottom: 8 }}>
                    <p className="eyebrow" style={{ marginBottom: T.space.md }}>New password</p>
                    <input type="password" value={newPassword} placeholder="Enter new password"
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ ...inputStyle, marginBottom: T.space.md }} />
                    <div className="grid grid-cols-2" style={{ gap: 8 }}>
                      <Button variant="quiet" onClick={() => { setShowPasswordField(false); setNewPassword(""); }}>
                        Cancel
                      </Button>
                      <Button onClick={resetPassword} disabled={actionLoading}>
                        Confirm
                      </Button>
                    </div>
                    <p style={{ fontSize: T.size.tiny, color: c.text4, marginTop: 10, lineHeight: 1.6 }}>
                      Tell the user their new password through a channel they already trust.
                    </p>
                  </div>
                )}

                {/* danger */}
                <div style={{ marginTop: T.space.xl }}>
                  <p className="mono" style={{
                    fontSize: T.size.micro, letterSpacing: ".24em", textTransform: "uppercase",
                    color: c.loss, marginBottom: T.space.md,
                  }}>
                    Danger zone
                  </p>

                  {!confirmDelete ? (
                    <Button variant="danger" full onClick={() => setConfirmDelete(true)} icon={<Trash2 size={13} />}>
                      Delete user
                    </Button>
                  ) : (
                    <div style={{ border: `1px solid rgba(180,85,63,.35)`, background: "rgba(180,85,63,.05)", padding: T.space.lg }}>
                      <p style={{ fontSize: T.size.sm, color: c.loss, marginBottom: 8 }}>
                        Delete {selectedUser.name}?
                      </p>
                      <p style={{ fontSize: T.size.xs, color: c.text3, lineHeight: 1.7, marginBottom: T.space.lg }}>
                        Their account, history and referral records go permanently. If they hold a balance
                        of ${money(selectedUser.balance)}, settle it before deleting.
                      </p>
                      <div className="grid grid-cols-2" style={{ gap: 8 }}>
                        <Button variant="quiet" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                        <Button variant="danger" onClick={deleteUser} disabled={actionLoading}
                          icon={actionLoading ? <Spinner size={12} tone={c.loss} /> : <Trash2 size={12} />}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
