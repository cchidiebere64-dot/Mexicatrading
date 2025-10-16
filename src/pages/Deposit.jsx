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
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <form
        onSubmit={handleDeposit}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-emerald-600">
          Deposit Funds
        </h2>

        {message && (
          <p className="text-center mb-4 text-sm text-emerald-500 bg-emerald-100 dark:bg-emerald-900 p-2 rounded-lg">
            {message}
          </p>
        )}

        <input
          type="number"
          placeholder="Enter amount"
          className="w-full p-2 mb-4 border rounded-lg"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <select
          className="w-full p-2 mb-4 border rounded-lg"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          <option value="USDT">USDT</option>
          <option value="BTC">BTC</option>
          <option value="ETH">ETH</option>
          <option value="Bank">Bank Transfer</option>
        </select>

        <input
          type="text"
          placeholder="Transaction ID or proof (optional)"
          className="w-full p-2 mb-4 border rounded-lg"
          value={txid}
          onChange={(e) => setTxid(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition"
        >
          {loading ? "Submitting..." : "Submit Deposit"}
        </button>
      </form>
    </div>
  );
}
