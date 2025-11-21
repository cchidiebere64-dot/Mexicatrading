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

  // Fetch wallets
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

  // Handle wallet selection
  const handleSelectWallet = (wallet) => {
    setSelectedWallet(wallet);
    setSelectModalOpen(false);
    setCopied(false);
  };

  // Copy wallet address
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

  // Submit deposit
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

      const res = await axios.post(
        `${API_URL}/api/deposits`,
        depositData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

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
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-glow max-w-2xl w-full p-8">
        <h2 className="text-3xl font-bold text-emerald-400 mb-6 text-center">💰 Deposit Funds</h2>

        {message && (
          <div className="mb-6 p-3 text-center rounded-xl font-medium bg-emerald-900/50 text-emerald-300 border border-emerald-400">
            {message}
          </div>
        )}

        <form onSubmit={handleDeposit} className="grid gap-6">
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

          {/* Selected Wallet Info */}
          {selectedWallet && (
            <div className="p-4 border-l-4 border-yellow-400 bg-gray-800 text-white rounded-xl mt-2 space-y-3">
              <p className="font-semibold text-yellow-400">⚠ CAUTION</p>
              <p className="text-sm">
                Only send <b>{selectedWallet.name}</b> to the address below. Any other asset sent will be permanently lost.
              </p>
              {selectedWallet.caution && (
                <p className="text-sm text-gray-300">{selectedWallet.caution}</p>
              )}
              <div className="flex justify-between items-center mt-2 bg-gray-900 p-3 rounded-lg break-all font-mono">
                <span className="truncate">{selectedWallet.address}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="ml-2 px-3 py-1 bg-emerald-400 rounded-lg text-black font-semibold"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="absolute inset-0" onClick={() => setSelectModalOpen(false)}></div>
          <div className="relative max-w-md w-full bg-gray-900 border border-white/20 rounded-2xl p-6 z-60">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-emerald-300">Select Payment Method</h3>
              <button onClick={() => setSelectModalOpen(false)} className="text-sm text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-auto">
              {wallets.length === 0 && <p className="text-sm text-gray-300">No payment methods available.</p>}
              {wallets.map((w) => (
                <button
                  key={w._id || w.name}
                  onClick={() => handleSelectWallet(w)}
                  className="w-full text-left p-4 rounded-xl border border-white/10 bg-gray-800 hover:bg-gray-700 transition flex flex-col"
                >
                  <span className="text-white text-xl font-bold">{w.name}</span>
                  <span className="text-gray-400 text-sm break-all">{w.address}</span>
                </button>
              ))}
            </div>

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
