import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Deposit() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(""); // method name (e.g., "BTC")
  const [txid, setTxid] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Wallets from server (array)
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null); // full wallet object
  const [selectModalOpen, setSelectModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Backend base (change if needed)
  const API_URL = "https://mexicatradingbackend.onrender.com";

  // Fetch available wallets on mount
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/wallets/public/all`);
        // Expecting an array: [{ _id, name, address, caution }, ...]
        setWallets(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch wallets:", err);
      }
    };
    fetchWallets();
  }, []);

  // When a wallet is selected from modal
  const handleSelectWallet = (wallet) => {
    setSelectedWallet(wallet);
    setMethod(wallet.name);
    setSelectModalOpen(false);
    setCopied(false);
  };

  // Copy address to clipboard
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

    const token = sessionStorage.getItem("token"); // user token
    if (!method) {
      setMessage("Please select a payment method.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/deposits`,
        { amount, method, txid },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message || "Deposit submitted.");
      setAmount("");
      setTxid("");
      setMethod("");
      setSelectedWallet(null);
    } catch (err) {
      setMessage(err.response?.data?.message || "Deposit failed.");
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

        <form onSubmit={handleDeposit} className="grid grid-cols-1 gap-6">
          {/* AMOUNT */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-300">Deposit Amount ($):</label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="Enter amount"
              className="w-full p-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* TRANSACTION ID */}
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

          {/* PAYMENT METHOD (opens modal) */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-300">Payment Method:</label>

            <button
              type="button"
              onClick={() => setSelectModalOpen(true)}
              className="w-full text-left p-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition flex items-center justify-between"
            >
              <span>{selectedWallet ? `${selectedWallet.name}` : "Select a payment method"}</span>
              <span className="text-sm text-gray-300">▼</span>
            </button>
          </div>

          {/* POP-UP / WARNING + ADDRESS + COPY */}
          {selectedWallet && (
            <div className="p-4 border border-red-500 rounded bg-red-50/60 text-gray-800 mt-2 space-y-3">
              {/* Dropdown-style warning (presented as a select-like block for clarity) */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <label className="text-xs font-semibold text-red-700 block">Only send</label>
                  <div className="mt-1 p-2 rounded border border-red-200 bg-red-50 text-sm">
                    <strong>{selectedWallet.name}</strong> — only send {selectedWallet.name} assets to this address.
                    Other assets will be lost forever.
                  </div>
                </div>
                {/* optional small icon / badge */}
                <div className="text-xs uppercase px-2 py-1 rounded bg-red-100 text-red-700 font-semibold">
                  Important
                </div>
              </div>

              {/* Caution / admin message if present */}
              {selectedWallet.caution && (
                <div className="text-sm text-gray-700">
                  {selectedWallet.caution}
                </div>
              )}

              {/* Address block with copy */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-600">Wallet Address</label>
                  <div className="mt-2 p-3 rounded-xl border border-white/10 bg-white/5 break-all text-sm font-mono">
                    {selectedWallet.address}
                  </div>
                </div>

                <div className="flex-shrink-0 flex flex-col items-stretch gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-4 py-2 rounded-xl bg-emerald-400 text-black font-semibold hover:bg-emerald-500 transition"
                  >
                    {copied ? "Copied!" : "Copy Address"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // optionally open wallet in new tab, or show QR - placeholder behavior
                      // For now we simply focus the address to help copy
                      const el = document.querySelector(".wallet-address-focus");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                    className="px-4 py-2 rounded-xl border border-white/10 text-sm text-white/80 hover:bg-white/3 transition"
                  >
                    Show QR
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-400 text-black font-semibold hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/50 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Deposit"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-sm text-gray-400 text-center">
          📌 Ensure your payment details are correct to avoid delays.
        </p>
      </div>

      {/* Modal: Select Method */}
      {selectModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSelectModalOpen(false)}
          />
          <div className="relative max-w-lg w-full mx-4 bg-[#0b0f19] border border-white/10 rounded-2xl p-6 z-60">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-emerald-300">Select Payment Method</h3>
              <button
                onClick={() => setSelectModalOpen(false)}
                className="text-sm text-gray-400 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-3 max-h-[50vh] overflow-auto">
              {wallets.length === 0 && (
                <div className="p-4 text-sm text-gray-300">No methods available.</div>
              )}

              {wallets.map((w) => (
                <button
                  key={w._id || w.name}
                  onClick={() => handleSelectWallet(w)}
                  className="text-left p-3 rounded-xl border border-white/6 bg-white/2 hover:bg-white/5 transition flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-white">{w.name}</div>
                    <div className="text-xs text-gray-300 mt-1 break-all">{w.address}</div>
                  </div>
                  <div className="text-sm text-gray-400">Select</div>
                </button>
              ))}
            </div>

            <div className="mt-4 text-right">
              <button
                onClick={() => setSelectModalOpen(false)}
                className="px-4 py-2 text-sm rounded-xl border border-white/10 hover:bg-white/3"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
