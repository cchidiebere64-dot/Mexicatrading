import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Plus, Pencil, Trash2, X, RefreshCw, AlertTriangle, Copy, Check } from "lucide-react";
import { T, ThemeStyles, Button, Spinner, EmptyState, Banner, inputStyle } from "./system.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com";
const c = T.color;

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
  const [confirmAddress, setConfirmAddress] = useState("");

  const token = sessionStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}` };

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

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

  const handleEdit = (wallet) => {
    setForm({ name: wallet.name, address: wallet.address, caution: wallet.caution || "" });
    setEditId(wallet._id);
    setConfirmAddress(wallet.address);
    setShowForm(true);
  };

  const handleCancel = () => {
    setForm({ name: "", address: "", caution: "" });
    setEditId(null);
    setConfirmAddress("");
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return showMessage("Give the wallet a name users will recognise.", "error");
    if (!form.address.trim()) return showMessage("Enter the wallet address.", "error");
    if (form.address.trim() !== confirmAddress.trim()) {
      return showMessage("The two addresses don't match. Check them carefully.", "error");
    }

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

  const copyAddress = async (id, addr) => {
    try {
      await navigator.clipboard.writeText(addr);
      setCopied(id);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      showMessage("Couldn't copy.", "error");
    }
  };

  const addressesMatch = form.address.trim() && form.address.trim() === confirmAddress.trim();

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

      {/* ── Header ── */}
      <div className="flex items-end justify-between gap-3" style={{ marginBottom: T.space.xl }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 6 }}>Deposit addresses</p>
          <h1 className="display" style={{ fontSize: T.size.xl, lineHeight: 1.1 }}>Wallets</h1>
          <p className="mono" style={{ fontSize: T.size.xs, color: c.text3, marginTop: 6 }}>
            {wallets.length} live on the deposit page
          </p>
        </div>
        <div className="flex items-center shrink-0" style={{ gap: 8 }}>
          <button onClick={fetchWallets} aria-label="Refresh"
            className="flex items-center justify-center"
            style={{ width: 36, height: 36, background: c.fill, border: `1px solid ${c.line}`, color: c.text3 }}>
            <RefreshCw size={14} />
          </button>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} icon={<Plus size={13} />}>Add</Button>
          )}
        </div>
      </div>

      {/* ── Standing warning ── */}
      <div style={{ marginBottom: T.space.xl }}>
        <Banner tone="brass"
          title="These addresses receive real deposits"
          text="Anything saved here appears on the user deposit page immediately. A wrong character means funds are lost permanently." />
      </div>

      {message.text && (
        <div style={{ marginBottom: T.space.lg }}>
          <Banner tone={message.type === "success" ? "gain" : "loss"} title={message.text} />
        </div>
      )}

      {/* ══ FORM ══ */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: .25 }}
            style={{ border: `1px solid ${c.line}`, marginBottom: T.space.xl }}>

            <div className="flex items-center justify-between"
              style={{ padding: T.space.lg, borderBottom: `1px solid ${c.line}` }}>
              <div>
                <p className="eyebrow" style={{ marginBottom: 4 }}>{editId ? "Editing" : "New"}</p>
                <h3 className="display" style={{ fontSize: T.size.lg }}>
                  {editId ? "Update wallet" : "Add a wallet"}
                </h3>
              </div>
              <button onClick={handleCancel} aria-label="Close"
                className="flex items-center justify-center"
                style={{ width: 32, height: 32, background: c.fill, color: c.text3 }}>
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: T.space.xl }}>

              <div style={{ marginBottom: T.space.lg }}>
                <p className="eyebrow" style={{ marginBottom: 6 }}>Display name</p>
                <input type="text" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. USDT (TRC20)"
                  style={inputStyle} />
                <p style={{ fontSize: T.size.tiny, color: c.text4, marginTop: 6 }}>
                  This is what users see when choosing a currency.
                </p>
              </div>

              <div style={{ marginBottom: T.space.lg }}>
                <p className="eyebrow" style={{ marginBottom: 6 }}>Wallet address</p>
                <input type="text" value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Paste the address"
                  className="mono"
                  style={{ ...inputStyle, fontSize: T.size.xs }} />
              </div>

              <div style={{ marginBottom: T.space.lg }}>
                <p className="eyebrow" style={{ marginBottom: 6 }}>Confirm address</p>
                <input type="text" value={confirmAddress}
                  onChange={(e) => setConfirmAddress(e.target.value)}
                  placeholder="Paste it a second time"
                  className="mono"
                  style={{
                    ...inputStyle, fontSize: T.size.xs,
                    borderColor: confirmAddress
                      ? (addressesMatch ? "rgba(63,143,95,.45)" : "rgba(180,85,63,.45)")
                      : c.line,
                  }} />
                {confirmAddress && (
                  <p className="flex items-center gap-1.5"
                    style={{ fontSize: T.size.xs, marginTop: 6, color: addressesMatch ? c.gain : c.loss }}>
                    {addressesMatch
                      ? <><Check size={11} /> Addresses match</>
                      : <><AlertTriangle size={11} /> Addresses don't match</>}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: T.space.xl }}>
                <p className="eyebrow" style={{ marginBottom: 6 }}>Warning note — optional</p>
                <textarea value={form.caution}
                  onChange={(e) => setForm({ ...form, caution: e.target.value })}
                  rows={2}
                  placeholder="e.g. TRC20 network only. Sending on another network will lose your funds."
                  style={{ ...inputStyle, resize: "none" }} />
                <p style={{ fontSize: T.size.tiny, color: c.text4, marginTop: 6 }}>
                  Shown to the user beneath the address.
                </p>
              </div>

              <div className="flex" style={{ gap: 8 }}>
                <Button variant="quiet" onClick={handleCancel} style={{ flex: 1 }} type="button">
                  Cancel
                </Button>
                <Button type="submit" style={{ flex: 1, opacity: actionLoading ? .6 : 1 }}
                  disabled={actionLoading}
                  icon={actionLoading ? <Spinner size={12} tone="#fff" /> : null}>
                  {actionLoading ? "Saving" : editId ? "Update wallet" : "Add wallet"}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ LIST ══ */}
      {wallets.length === 0 ? (
        <EmptyState icon={<Wallet size={20} />}
          title="No deposit addresses"
          text="Users can't deposit crypto until you add at least one wallet."
          action={{ label: "Add your first wallet", onClick: () => setShowForm(true) }} />
      ) : (
        <div style={{ border: `1px solid ${c.line}` }}>
          {wallets.map((w, i) => (
            <div key={w._id}
              style={{
                padding: T.space.lg,
                borderBottom: i < wallets.length - 1 ? `1px solid ${c.lineSoft}` : "none",
                borderLeft: editId === w._id ? `2px solid ${c.gain}` : "2px solid transparent",
                background: editId === w._id ? "rgba(63,143,95,.05)" : "transparent",
              }}>

              <div className="flex items-start justify-between gap-3" style={{ marginBottom: T.space.md }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: T.size.sm, color: c.text }}>{w.name}</p>
                  <p className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".14em", textTransform: "uppercase", color: c.gain, marginTop: 3 }}>
                    Live on deposit page
                  </p>
                </div>
                <div className="flex shrink-0" style={{ gap: 6 }}>
                  <button onClick={() => copyAddress(w._id, w.address)} aria-label="Copy address"
                    className="flex items-center justify-center"
                    style={{ width: 30, height: 30, background: c.fill, border: `1px solid ${c.line}`, color: copied === w._id ? c.gain : c.text4 }}>
                    {copied === w._id ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                  <button onClick={() => handleEdit(w)} aria-label="Edit"
                    className="flex items-center justify-center"
                    style={{ width: 30, height: 30, background: c.fill, border: `1px solid ${c.line}`, color: c.text3 }}>
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => setConfirmDelete(w)} aria-label="Delete"
                    className="flex items-center justify-center"
                    style={{ width: 30, height: 30, background: c.fill, border: `1px solid rgba(180,85,63,.25)`, color: c.loss }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div style={{ borderTop: `1px solid ${c.lineSoft}`, paddingTop: T.space.md }}>
                <p className="eyebrow" style={{ marginBottom: 6 }}>Address</p>
                <p className="mono" style={{ fontSize: T.size.tiny, color: c.text2, wordBreak: "break-all", lineHeight: 1.7 }}>
                  {w.address}
                </p>
              </div>

              {w.caution && (
                <div style={{ marginTop: T.space.md }}>
                  <div className="flex items-start gap-2.5"
                    style={{ background: "rgba(192,138,62,.06)", borderLeft: `2px solid ${c.brass}`, padding: T.space.md }}>
                    <AlertTriangle size={12} style={{ color: c.brass, flexShrink: 0, marginTop: 2 }} />
                    <p style={{ fontSize: T.size.xs, color: c.text3, lineHeight: 1.6 }}>{w.caution}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ══ DELETE CONFIRM ══ */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
            style={{ background: "rgba(8,9,11,.9)" }}>
            <div className="absolute inset-0" onClick={() => setConfirmDelete(null)} />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="relative w-full z-10"
              style={{ maxWidth: 380, background: c.panel, border: `1px solid ${c.line}`, borderLeft: `2px solid ${c.loss}`, padding: T.space.xl }}>

              <p className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".24em", textTransform: "uppercase", color: c.loss, marginBottom: 8 }}>
                Confirm removal
              </p>
              <h3 className="display" style={{ fontSize: T.size.xl, marginBottom: 10 }}>
                Remove {confirmDelete.name}?
              </h3>
              <p style={{ fontSize: T.size.sm, color: c.text3, lineHeight: 1.7, marginBottom: T.space.lg }}>
                This currency disappears from the deposit page immediately. Anyone mid-payment to this address
                will still send funds — make sure no deposits are in flight.
              </p>

              <div style={{ border: `1px solid ${c.line}`, padding: T.space.md, marginBottom: T.space.xl }}>
                <p className="mono" style={{ fontSize: T.size.tiny, color: c.text4, wordBreak: "break-all", lineHeight: 1.6 }}>
                  {confirmDelete.address}
                </p>
              </div>

              <div className="grid grid-cols-2" style={{ gap: 8 }}>
                <Button variant="quiet" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                <Button variant="danger" onClick={() => handleDelete(confirmDelete._id)}
                  disabled={actionLoading}
                  icon={actionLoading ? <Spinner size={12} tone={c.loss} /> : <Trash2 size={12} />}>
                  Remove
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
