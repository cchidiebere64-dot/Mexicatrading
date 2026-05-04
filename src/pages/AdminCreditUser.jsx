import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, DollarSign, ArrowRight, CreditCard } from "lucide-react";

const API_URL = "https://mexicatradingbackend.onrender.com";

export default function AdminCreditUser() {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("credit");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const token = sessionStorage.getItem("adminToken");

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/admin/credit-user`,
        { email, amount: parseFloat(amount), type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showMessage(res.data?.message || "Balance updated successfully!");
      setEmail("");
      setAmount("");
    } catch (error) {
      showMessage(error.response?.data?.error || "Failed to update balance. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Credit / Deduct User</h1>
        <p className="text-white/30 text-xs mt-0.5">Manually adjust a user's account balance</p>
      </div>

      <div className="max-w-lg">

        {/* Message */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-5 p-4 rounded-xl text-sm text-center font-medium border ${
                message.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/8 rounded-3xl p-8 space-y-5">

          {/* Icon */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
              <CreditCard size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Balance Adjustment</p>
              <p className="text-white/30 text-xs">Credit or deduct from any user account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                User Email
              </label>
              <div className="relative group">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type="email"
                  placeholder="Enter user email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 transition-all text-sm placeholder:text-white/25 text-white"
                />
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                Amount (USD)
              </label>
              <div className="relative group">
                <DollarSign size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500/60 transition-all text-sm placeholder:text-white/25 text-white"
                />
              </div>
            </div>

            {/* Type Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                Action Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType("credit")}
                  className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                    type === "credit"
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                      : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                  }`}
                >
                  + Credit
                </button>
                <button
                  type="button"
                  onClick={() => setType("deduct")}
                  className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                    type === "deduct"
                      ? "bg-red-500/20 border-red-500/40 text-red-400"
                      : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                  }`}
                >
                  − Deduct
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`group w-full py-3.5 rounded-xl font-semibold text-sm shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                type === "credit"
                  ? "bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20"
                  : "bg-red-500 hover:bg-red-400 shadow-red-500/20"
              }`}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {type === "credit" ? "Credit User" : "Deduct from User"}
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
