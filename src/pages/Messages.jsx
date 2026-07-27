import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CheckCheck, Trash2, X, MessageSquare } from "lucide-react";
import { T, PageShell, Button, EmptyState, Spinner, StatusPill } from "./system.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com";
const c = T.color;

function formatTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString(undefined, { weekday: "short" });
  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
}

function formatFull(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric",
    year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function Messages() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const token = sessionStorage.getItem("token");

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/user/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return navigate("/login");
    fetchMessages();
  }, []);

  const markAsRead = async (msgId) => {
    try {
      await axios.put(`${API_URL}/api/user/messages/${msgId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(prev => prev.map(m => m._id === msgId ? { ...m, isRead: true } : m));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await axios.put(`${API_URL}/api/user/messages/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
    } catch {}
  };

  const deleteMessage = async (msgId) => {
    setDeleting(msgId);
    try {
      await axios.delete(`${API_URL}/api/user/messages/${msgId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(prev => prev.filter(m => m._id !== msgId));
      if (selected?._id === msgId) setSelected(null);
      setConfirmDelete(null);
    } catch {
      setDeleting(null);
    } finally {
      setDeleting(null);
    }
  };

  const openMessage = (msg) => {
    setSelected(msg);
    if (!msg.isRead) markAsRead(msg._id);
  };

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <PageShell width={640}>

      {/* ── Back + mark all ── */}
      <div className="flex items-center justify-between" style={{ marginBottom: T.space.lg }}>
        <button onClick={() => navigate("/dashboard")}
          className="mono flex items-center gap-2"
          style={{ fontSize: T.size.tiny, letterSpacing: ".14em", textTransform: "uppercase", color: c.text3 }}>
          <ArrowLeft size={12} /> {t("messages.backToDashboard", "Dashboard")}
        </button>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="mono flex items-center gap-1.5"
            style={{ fontSize: T.size.tiny, letterSpacing: ".14em", textTransform: "uppercase", color: c.gain }}>
            <CheckCheck size={12} /> {t("messages.markAllRead", "Mark all read")}
          </button>
        )}
      </div>

      {/* ── Header ── */}
      <div style={{ marginBottom: T.space.xl }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>From MexicaTrading</p>
        <h1 className="display" style={{ fontSize: T.size.xxl, lineHeight: 1.05 }}>
          {t("messages.title", "Messages")}
        </h1>
        <p className="mono" style={{ fontSize: T.size.xs, color: unreadCount > 0 ? c.gain : c.text3, marginTop: 8 }}>
          {unreadCount > 0
            ? `${unreadCount} unread`
            : t("messages.allRead", "All caught up")}
        </p>
      </div>

      {/* ── List ── */}
      {loading ? (
        <div className="flex justify-center" style={{ padding: T.space.xxxl }}>
          <Spinner size={26} />
        </div>
      ) : messages.length === 0 ? (
        <EmptyState
          icon={<MessageSquare size={20} />}
          title={t("messages.noMessages", "No messages yet")}
          text={t("messages.noMessagesDesc", "Notices from our team will appear here.")}
        />
      ) : (
        <>
          <div style={{ border: `1px solid ${c.line}` }}>
            {messages.map((msg, i) => (
              <motion.div key={msg._id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, .3) }}
                onClick={() => openMessage(msg)}
                className="hover-fill cursor-pointer"
                style={{
                  padding: T.space.lg,
                  borderBottom: i < messages.length - 1 ? `1px solid ${c.lineSoft}` : "none",
                  borderLeft: `2px solid ${msg.isRead ? "transparent" : c.gain}`,
                  background: msg.isRead ? "transparent" : "rgba(63,143,95,.04)",
                  transition: "background .2s",
                }}>
                <div className="flex items-start justify-between gap-3">
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                      <span className="truncate" style={{
                        fontSize: T.size.sm,
                        color: msg.isRead ? c.text2 : c.text,
                        fontWeight: msg.isRead ? 400 : 600,
                      }}>
                        {msg.subject}
                      </span>
                      {!msg.isRead && <StatusPill tone="gain">New</StatusPill>}
                    </div>
                    <p className="truncate" style={{ fontSize: T.size.xs, color: c.text4 }}>
                      {msg.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="mono" style={{ fontSize: T.size.tiny, color: c.text4 }}>
                      {formatTime(msg.sentAt)}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(msg); }}
                      aria-label="Delete"
                      className="flex items-center justify-center"
                      style={{ width: 28, height: 28, background: c.fill, color: c.text4 }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <p style={{ fontSize: T.size.xs, color: c.text4, marginTop: T.space.lg, lineHeight: 1.7 }}>
            {t("messages.contactSupport", "Need help? Contact support and we'll get back to you.")}
          </p>
        </>
      )}

      {/* ══ DETAIL ══ */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            style={{ background: "rgba(8,9,11,.86)" }}>
            <div className="absolute inset-0" onClick={() => setSelected(null)} />

            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              transition={{ duration: .3, ease: [.22, 1, .36, 1] }}
              className="relative w-full sm:max-w-lg z-10"
              style={{ background: c.panel, border: `1px solid ${c.line}`, maxHeight: "88vh", display: "flex", flexDirection: "column" }}>

              {/* header */}
              <div className="flex items-start justify-between gap-3"
                style={{ padding: T.space.xl, borderBottom: `1px solid ${c.line}` }}>
                <div style={{ minWidth: 0 }}>
                  <p className="eyebrow" style={{ marginBottom: 6 }}>MexicaTrading · Official</p>
                  <h3 className="display" style={{ fontSize: T.size.xl, lineHeight: 1.15 }}>{selected.subject}</h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => { setConfirmDelete(selected); setSelected(null); }}
                    aria-label="Delete"
                    className="flex items-center justify-center"
                    style={{ width: 32, height: 32, background: c.fill, color: c.loss, border: `1px solid rgba(180,85,63,.25)` }}>
                    <Trash2 size={13} />
                  </button>
                  <button onClick={() => setSelected(null)} aria-label="Close"
                    className="flex items-center justify-center"
                    style={{ width: 32, height: 32, background: c.fill, color: c.text3 }}>
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* body */}
              <div style={{ padding: T.space.xl, overflowY: "auto", flex: 1 }}>
                <p className="mono" style={{
                  fontSize: T.size.tiny, letterSpacing: ".14em", textTransform: "uppercase",
                  color: c.text4, paddingBottom: T.space.lg, borderBottom: `1px solid ${c.lineSoft}`,
                }}>
                  {formatFull(selected.sentAt)}
                </p>

                <p style={{
                  fontSize: T.size.sm, color: c.text2, lineHeight: 1.85,
                  whiteSpace: "pre-line", marginTop: T.space.lg,
                }}>
                  {selected.message}
                </p>
              </div>

              {/* footer */}
              <div style={{ padding: T.space.lg, borderTop: `1px solid ${c.line}` }}>
                <Button variant="quiet" full onClick={() => setSelected(null)}>
                  {t("messages.close", "Close")}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ DELETE CONFIRM ══ */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
            style={{ background: "rgba(8,9,11,.9)" }}>
            <div className="absolute inset-0" onClick={() => setConfirmDelete(null)} />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="relative w-full z-10"
              style={{ maxWidth: 360, background: c.panel, border: `1px solid ${c.line}`, borderLeft: `2px solid ${c.loss}`, padding: T.space.xl }}>

              <p className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".24em", textTransform: "uppercase", color: c.loss, marginBottom: 8 }}>
                Confirm
              </p>
              <h3 className="display" style={{ fontSize: T.size.xl, marginBottom: 10 }}>Delete this message?</h3>
              <p style={{ fontSize: T.size.sm, color: c.text3, lineHeight: 1.7, marginBottom: T.space.xl }}>
                “{confirmDelete.subject}” will be removed permanently and can't be recovered.
              </p>

              <div className="grid grid-cols-2" style={{ gap: 8 }}>
                <Button variant="quiet" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                <Button variant="danger" onClick={() => deleteMessage(confirmDelete._id)}
                  disabled={deleting === confirmDelete._id}
                  icon={deleting === confirmDelete._id ? <Spinner size={12} tone={c.loss} /> : <Trash2 size={12} />}>
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
