import React, { useState } from "react";
import axios from "axios";

export default function Deposit() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("USDT");
  const [txid, setTxid] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const token = sessionStorage.getItem("token");

    try {
      const res = await axios.post(
        "https://mexicatradingbackend.onrender.com/api/deposits",
        { amount, method, txid },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message);
      setAmount("");
      setTxid("");
    } catch (err) {
      console.error("Deposit Error:", err.response?.data || err.message);
      setMessage(err.response?.data?.message || "Deposit failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex justify-center items-start pt-20 pb-10 px-4">
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-glow max-w-md w-full p-8 animate-fade-in">
        <h2 className="text-3xl font-bold text-emerald-400 mb-6 text-center flex items-center justify-center gap-2">
          💰 Deposit Funds
        </h2>

        {message && (
          <div className="mb-6 p-3 text-center rounded-xl font-medium bg-emerald-900/50 text-emerald-300 border border-emerald-400">
            {message}
          </div>
        )}

        <form onSubmit={handleDeposit} className="space-y-5">
          {/* Amount */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-300">Deposit Amount ($):</label>
            <input
              type="number"
              placeholder="Enter amount"
              className="w-full p-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Method */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-300">Payment Method:</label>
            <select
              className="w-full p-3 rounded-xl border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="USDT">USDT</option>
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="Bank">Bank Transfer</option>
            </select>
          </div>

          {/* Transaction ID */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-300">Transaction ID / Proof (optional):</label>
            <input
              type="text"
              placeholder="TxID or proof"
              className="w-full p-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
              value={txid}
              onChange={(e) => setTxid(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-400 text-black font-semibold hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/50 disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? "Submitting..." : "Submit Deposit"}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-400 text-center">
          📌 Ensure your payment details are correct to avoid delays.
        </p>
      </div>
    </div>
  );
}
