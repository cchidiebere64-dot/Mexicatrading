import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Deposit() {
  const [amount, setAmount] = useState("");
  const [txid, setTxid] = useState("");
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [selectModalOpen, setSelectModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API_URL = "https://mexicatradingbackend.onrender.com";

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/wallets/public/all`);
        setWallets(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch wallets:", err);
      }
    };
    fetchWallets();
  }, []);

  const handleSelectWallet = (wallet) => {
    setSelectedWallet(wallet);
    setSelectModalOpen(false);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!selectedWallet?.address) return;
    try {
      await navigator.clipboard.writeText(selectedWallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setMessage("You must be logged in to deposit.");
        setLoading(false);
        return;
      }
      if (!amount || parseFloat(amount) <= 0) {
        setMessage("Please enter a valid deposit amount.");
        setLoading(false);
        return;
      }
      if (!selectedWallet) {
        setMessage("Please select a payment method.");
        setLoading(false);
        return;
      }

      const depositData = {
        amount: parseFloat(amount),
        method: selectedWallet.name,
        txid: txid || "",
      };

      const res = await axios.post(`${API_URL}/api/deposits`, depositData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(res.data.message || "Deposit submitted successfully!");
      setAmount("");
      setTxid("");
      setSelectedWallet(null);
    } catch (err) {
      console.error("Deposit request failed:", err.response?.data || err.message);
      setMessage(err.response?.data?.message || "Deposit failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex justify-center items-start pt-20 pb-10 px-4">
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-glow w-full max-w-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-6 text-center">💰 Deposit Funds</h2>

        {message && (
          <div className="mb-6 p-3 text-center rounded-xl font-medium bg-emerald-900/50 text-emerald-300 border border-emerald-400">
            {message}
          </div>
        )}

        <form onSubmit={handleDeposit} className="grid gap-4 sm:gap-6">
          {/* Amount */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-300">Deposit Amount ($):</label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
              required
            />
          </div>

          {/* Payment Method */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-300">Payment Method:</label>
            <button
              type="button"
              onClick={() => setSelectModalOpen(true)}
              className="w-full text-left p-4 rounded-xl border border-white/20 bg-gray-700 text-white text-lg font-semibold hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition flex items-center justify-between"
            >
              <span>{selectedWallet ? selectedWallet.name : "Select a payment method"}</span>
              <span className="text-sm text-gray-300">▼</span>
            </button>
          </div>


          {/* Selected Wallet Warning + Details */}
{selectedWallet && (
  <div className="p-4 mt-2 border-l-4 border-yellow-400 bg-gray-800 text-white rounded-xl space-y-3 w-full break-words">
    {/* Warning Title */}
    <p className="font-semibold text-yellow-400">⚠ CAUTION</p>

    {/* Warning message */}
    <p className="text-sm sm:text-base">
      Only send <b>{selectedWallet.name}</b> to the address below. Any other asset sent will be permanently lost.
    </p>

    {/* Wallet address + copy */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 bg-gray-900 p-3 rounded-lg w-full">
      <span className="break-all font-mono text-sm sm:text-base sm:flex-1">{selectedWallet.address}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="mt-2 sm:mt-0 sm:ml-3 px-3 py-2 bg-emerald-400 rounded-lg text-black font-semibold text-sm sm:text-base"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>

    {/* Optional caution from admin */}
    {selectedWallet.caution && (
      <p className="text-sm sm:text-base text-gray-300">{selectedWallet.caution}</p>
    )}
  </div>
)}


          
          {/* Transaction ID */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-300">Transaction ID / Proof (optional):</label>
            <input
              type="text"
              placeholder="TxID or proof"
              value={txid}
              onChange={(e) => setTxid(e.target.value)}
              className="w-full p-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-400 text-black font-semibold hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/50 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Deposit"}
          </button>
        </form>
      </div>

      {/* Select Wallet Modal */}
{selectModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6">
    {/* Background overlay */}
    <div className="absolute inset-0" onClick={() => setSelectModalOpen(false)}></div>

    <div className="relative w-full max-w-md bg-gray-900 border border-white/20 rounded-2xl p-4 sm:p-6 z-60 flex flex-col max-h-[90vh]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-emerald-300">Select Payment Method</h3>
        <button
          onClick={() => setSelectModalOpen(false)}
          className="text-sm text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Wallet list - scrollable */}
      <div className="overflow-auto flex-1 space-y-3">
        {wallets.length === 0 && (
          <p className="text-sm text-gray-300">No payment methods available.</p>
        )}
        {wallets.map((w) => (
          <button
            key={w._id || w.name}
            onClick={() => handleSelectWallet(w)}
            className="w-full text-left p-4 rounded-xl border border-white/10 bg-gray-800 hover:bg-gray-700 transition flex flex-col sm:flex-row sm:justify-between sm:items-center"
          >
            <span className="text-white text-lg sm:text-xl font-bold">{w.name}</span>
            <span className="text-gray-400 text-xs sm:text-sm break-words sm:break-normal">{w.address}</span>
          </button>
        ))}
      </div>

      {/* Cancel button */}
      <button
        onClick={() => setSelectModalOpen(false)}
        className="mt-4 w-full py-2 rounded-xl border border-white/10 hover:bg-white/5 transition"
      >
        Cancel
      </button>
    </div>
  </div>
)}

    </div>
  );
}


