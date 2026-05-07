import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft, CheckCheck, Trash2, X, MessageSquare,
  Shield, ChevronRight, MoreVertical
} from "lucide-react";

const API_URL = "https://mexicatradingbackend.onrender.com";

function formatTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString(undefined, { weekday: "short" });
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatFull(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric",
    year: "numeric", hour: "2-digit", minute: "2-digit"
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
  const [menuOpen, setMenuOpen] = useState(null);
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
    setMenuOpen(null);
    if (!msg.isRead) markAsRead(msg._id);
  };

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="min-h-screen bg-[#080c18] text-white pb-20">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[600px] h-[600px] bg-emerald-500/6 blur-[150px] rounded-full top-[-200px] left-[-200px]" />
        <div className="absolute w-[500px] h-[500px] bg-blue-500/4 blur-[140px] rounded-full bottom-[-200px] right-[-200px]" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-24 pb-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition">
            <ArrowLeft size={14} /> {t("messages.backToDashboard")}
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-emerald-400 transition font-semibold">
              <CheckCheck size={13} /> {t("messages.markAllRead")}
            </button>
          )}
        </div>

        {/* Title */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/10 border border-white/10 flex items-center justify-center">
              <MessageSquare size={22} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t("messages.title")}</h1>
              <p className="text-white/30 text-xs mt-0.5">
                {unreadCount > 0
                  ? `${unreadCount} ${unreadCount > 1 ? t("messages.unreadPlural") : t("messages.unreadSingle")}`
                  : t("messages.allRead")}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
            <p className="text-white/30 text-sm animate-pulse">{t("common.loading")}</p>
          </div>

        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/8 flex items-center justify-center">
              <MessageSquare size={32} className="text-white/15" />
            </div>
            <div>
              <p className="text-white font-semibold text-lg">{t("messages.noMessages")}</p>
              <p className="text-white/30 text-sm mt-1 max-w-xs">{t("messages.noMessagesDesc")}</p>
            </div>
          </div>

        ) : (
          <div className="space-y-2">
            {messages.map((msg, i) => (
              <motion.div key={msg._id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`group relative flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                  msg.isRead
                    ? "border-white/8 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/15"
                    : "border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/8"
                }`}
                onClick={() => openMessage(msg)}>

                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Shield size={20} className="text-emerald-400" />
                  </div>
                  {!msg.isRead && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#080c18]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-bold text-sm text-white">MexicaTrading</p>
                    <p className="text-white/30 text-xs shrink-0 ml-2">{formatTime(msg.sentAt)}</p>
                  </div>
                  <p className={`text-sm font-semibold truncate mb-0.5 ${msg.isRead ? "text-white/50" : "text-white/90"}`}>
                    {msg.subject}
                  </p>
                  <p className="text-white/35 text-xs truncate">{msg.message}</p>
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all"
                  onClick={e => e.stopPropagation()}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(msg); }}
                    className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all">
                    <Trash2 size={13} />
                  </button>
                  <ChevronRight size={14} className="text-white/20" />
                </div>
              </motion.div>
            ))}

            <p className="text-center text-white/20 text-xs pt-4">{t("messages.contactSupport")}</p>
          </div>
        )}
      </div>

      {/* ── MESSAGE DETAIL MODAL ──────────────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
            <div className="absolute inset-0" onClick={() => setSelected(null)} />

            <motion.div
              initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }} transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-full sm:max-w-lg bg-[#0d1525] border border-white/10 rounded-t-3xl sm:rounded-3xl z-10 shadow-2xl overflow-hidden">

              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8 bg-white/[0.02]">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Shield size={18} className="text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-white">MexicaTrading</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <p className="text-emerald-400/70 text-xs">Official Support</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setConfirmDelete(selected); setSelected(null); }}
                    className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all">
                    <Trash2 size={13} />
                  </button>
                  <button onClick={() => setSelected(null)}
                    className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition">
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Chat body */}
              <div className="px-5 py-6 min-h-[200px] max-h-[60vh] overflow-y-auto">

                {/* Date stamp */}
                <div className="flex justify-center mb-5">
                  <span className="text-white/25 text-xs px-3 py-1 rounded-full bg-white/5 border border-white/8">
                    {formatFull(selected.sentAt)}
                  </span>
                </div>

                {/* Message bubble — left side like WhatsApp received */}
                <div className="flex items-end gap-2 mb-3">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Shield size={13} className="text-emerald-400" />
                  </div>
                  <div className="max-w-[85%]">
                    {/* Subject pill */}
                    <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25">
                      <span className="text-emerald-400 text-xs font-bold">{selected.subject}</span>
                    </div>
                    {/* Message bubble */}
                    <div className="bg-white/[0.07] border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
                      <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
                        {selected.message}
                      </p>
                    </div>
                    <p className="text-white/20 text-xs mt-1.5 ml-1 flex items-center gap-1">
                      <CheckCheck size={11} className="text-emerald-400" />
                      {t("messages.from")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-white/8 bg-white/[0.02]">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/8">
                  <p className="text-white/30 text-xs flex-1">{t("messages.contactSupport")}</p>
                </div>
                <button onClick={() => setSelected(null)}
                  className="w-full mt-3 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 transition-all font-semibold text-sm text-white">
                  {t("messages.close")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRM ────────────────────────────────────────────── */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="absolute inset-0" onClick={() => setConfirmDelete(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm bg-[#0d1525] border border-white/10 rounded-3xl p-6 z-10 shadow-2xl text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={22} className="text-red-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Delete Message?</h3>
              <p className="text-white/40 text-sm mb-6 leading-relaxed">
                "{confirmDelete.subject}" will be permanently deleted and cannot be recovered.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setConfirmDelete(null)}
                  className="py-3 rounded-xl border border-white/10 bg-white/[0.03] text-white/50 hover:text-white text-sm font-semibold transition-all">
                  Cancel
                </button>
                <button onClick={() => deleteMessage(confirmDelete._id)} disabled={deleting === confirmDelete._id}
                  className="py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {deleting === confirmDelete._id
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Trash2 size={14} />}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
