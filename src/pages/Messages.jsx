import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ArrowLeft, CheckCheck, Mail, MailOpen, X } from "lucide-react";

const API_URL = "https://mexicatradingbackend.onrender.com";

export default function Messages() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
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
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put(`${API_URL}/api/user/messages/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const openMessage = (msg) => {
    setSelected(msg);
    if (!msg.isRead) markAsRead(msg._id);
  };

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="min-h-screen bg-[#080c18] text-white pb-20">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[600px] h-[600px] bg-emerald-500/6 blur-[150px] rounded-full top-[-200px] left-[-200px]" />
        <div className="absolute w-[500px] h-[500px] bg-blue-500/4 blur-[140px] rounded-full bottom-[-200px] right-[-200px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-24">

        {/* Back */}
        <button onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition mb-6">
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <MessageSquare size={18} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Messages</h1>
              <p className="text-white/30 text-xs mt-0.5">
                {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}` : "All messages read"}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white text-xs font-semibold transition-all">
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
        </div>

        {/* Messages list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center">
              <MessageSquare size={24} className="text-white/20" />
            </div>
            <p className="text-white font-semibold">No messages yet</p>
            <p className="text-white/30 text-sm">Messages from MexicaTrading support will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, i) => (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => openMessage(msg)}
                className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                  msg.isRead
                    ? "border-white/8 bg-white/[0.02] hover:border-white/15"
                    : "border-blue-500/30 bg-blue-500/8 hover:border-blue-500/50"
                }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      msg.isRead
                        ? "bg-white/5 border border-white/10"
                        : "bg-blue-500/15 border border-blue-500/25"
                    }`}>
                      {msg.isRead
                        ? <MailOpen size={15} className="text-white/30" />
                        : <Mail size={15} className="text-blue-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-semibold text-sm truncate ${msg.isRead ? "text-white/70" : "text-white"}`}>
                          {msg.subject}
                        </p>
                        {!msg.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0 animate-pulse" />
                        )}
                      </div>
                      <p className="text-white/40 text-xs truncate">{msg.message}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-white/25 text-xs">
                      {new Date(msg.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    <p className="text-white/20 text-xs mt-0.5">MexicaTrading</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="absolute inset-0" onClick={() => setSelected(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#0e1422] border border-white/10 rounded-3xl p-6 z-10 shadow-2xl">

              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <MessageSquare size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white/30 text-xs">From MexicaTrading Support</p>
                    <p className="text-white/20 text-xs mt-0.5">
                      {new Date(selected.sentAt).toLocaleDateString("en-US", {
                        month: "long", day: "numeric", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition">
                  <X size={15} />
                </button>
              </div>

              {/* Subject */}
              <div className="mb-4 pb-4 border-b border-white/8">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Subject</p>
                <p className="text-white font-bold text-base">{selected.subject}</p>
              </div>

              {/* Message body */}
              <div className="mb-6">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Message</p>
                <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
                  {selected.message}
                </p>
              </div>

              {/* Footer */}
              <div className="p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-center mb-4">
                <p className="text-emerald-400/70 text-xs">
                  Need help? Contact us at support@mexicatrading.com
                </p>
              </div>

              <button onClick={() => setSelected(null)}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition-all font-semibold text-sm text-white">
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
