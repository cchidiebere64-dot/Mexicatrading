import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Deposit() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [txid, setTxid] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState({});
  const [showWarning, setShowWarning] = useState(false);

  const API_URL = "https://mexicatradingbackend.onrender.com";

 useEffect(() => {
  const fetchWallets = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/wallets/public/all`);

      // Convert array to object: { "USDT": {...}, "BTC": {...} }
      const formatted = {};
      res.data.forEach((w) => {
        formatted[w.name] = {
          address: w.address,
          caution: w.caution || "Send only to this wallet!",
        };
      });

      setWallets(formatted);
    } catch (err) {
      console.error("Failed to fetch wallets:", err);
    }
  };
  fetchWallets();
}, []);


  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const token = sessionStorage.getItem("token"); // User token

    try {
      const res = await axios.post(
        `${API_URL}/api/deposits`,
        { amount, method, txid },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message);
      setAmount("");
      setTxid("");
      setMethod("");
      setShowWarning(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Deposit failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMethod = (coin) => {
    setMethod(coin);
    setShowWarning(true);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex justify-center items-start pt-20 pb-10 px-4">
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-glow max-w-md w-full p-8">
        <h2 className="text-3xl font-bold text-emerald-400 mb-6 text-center">
          💰 Deposit Funds
        </h2>

        {message && (
          <div className="mb-6 p-3 text-center rounded-xl font-medium bg-emerald-900/50 text-emerald-300 border border-emerald-400">
            {message}
          </div>
        )}

        <form onSubmit={handleDeposit} className="space-y-5">
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

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-300">Payment Method:</label>
            <select
              className="w-full p-3 rounded-xl border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
              value={method}
              onChange={(e) => handleSelectMethod(e.target.value)}
              required
            >
              <option value="">Select a method</option>
              {Object.keys(wallets).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          {/* Popup warning with wallet info */}
          {showWarning && method && wallets[method] && (
            <div className="p-4 border border-red-500 rounded bg-red-100 text-red-700 mt-2">
              <p>{wallets[method].caution}</p>
              <p className="mt-2 font-bold break-all">
                Wallet Address: {wallets[method].address}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-300">
              Transaction ID / Proof (optional):
            </label>
            <input
              type="text"
              placeholder="TxID or proof"
              className="w-full p-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
              value={txid}
              onChange={(e) => setTxid(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-400 text-black font-semibold hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/50 disabled:opacity-50"
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

