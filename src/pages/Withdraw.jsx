import { useState } from "react";
import axios from "axios";

export default function Withdraw() {
  const API_URL = "https://mexicatradingbackend.onrender.com";
  const [method, setMethod] = useState("TON");
  const [details, setDetails] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || amount <= 0) {
      setMessage({ text: "❌ Enter a valid withdrawal amount.", type: "error" });
      return;
    }
    if (!details) {
      setMessage({ text: "❌ Enter your withdrawal details.", type: "error" });
      return;
    }

    try {
      setLoading(true);
      setMessage({ text: "", type: "" });

      const token = sessionStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/withdrawals`,
        { amount, method, details },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ text: "✅ Withdrawal request submitted! Wait for admin approval.", type: "success" });
      setAmount("");
      setDetails("");
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "❌ Withdrawal failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex justify-center items-start pt-20 pb-10 px-4">
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-glow max-w-md w-full p-8 animate-fade-in">
        <h2 className="text-3xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
          🏧 Make a Withdrawal
        </h2>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded-xl text-center font-medium ${
              message.type === "success"
                ? "bg-green-900/50 text-green-300 border border-green-400"
                : "bg-red-900/50 text-red-300 border border-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Withdrawal Method */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-sm text-gray-300">Select Withdrawal Method:</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full p-3 rounded-xl border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
            >
              <option value="TON">TON Wallet</option>
              <option value="Bank">Bank Transfer</option>
              <option value="USDT">USDT (TRC20)</option>
            </select>
          </div>

          {/* Withdrawal Details */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-sm text-gray-300">Withdrawal Details:</label>
            <input
              type="text"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Wallet address / Bank account number"
              className="w-full p-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
              required
            />
          </div>

          {/* Withdrawal Amount */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-sm text-gray-300">Withdrawal Amount ($):</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 50"
              className="w-full p-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-400 text-black font-semibold hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/50 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? "Submitting..." : "Submit Withdrawal"}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-400">
          📌 Double-check your withdrawal details. Incorrect info may result in loss of funds.
        </p>
      </div>
    </div>
  );
}
