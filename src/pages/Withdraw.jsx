import { useState } from "react";
import axios from "axios";

export default function Withdraw() {
  const API_URL = "https://mexicatradingbackend.onrender.com";
  const [method, setMethod] = useState("TON");
  const [details, setDetails] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      return alert("❌ Enter a valid withdrawal amount.");
    }
    if (!details) {
      return alert("❌ Enter your withdrawal details.");
    }

    try {
      const token = sessionStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/withdraw`,
        { amount, method, details },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Withdrawal request submitted! Wait for admin approval.");
      setAmount("");
      setDetails("");
    } catch (err) {
      alert(err.response?.data?.message || "❌ Withdrawal failed");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex justify-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-600 mb-4">🏧 Make a Withdrawal</h2>

        {/* Withdrawal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Method Selection */}
          <div>
            <label className="block font-medium mb-1">Select Withdrawal Method:</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="TON">TON Wallet</option>
              <option value="Bank">Bank Transfer</option>
              <option value="USDT">USDT (TRC20)</option>
            </select>
          </div>

          {/* Withdrawal Details */}
          <div>
            <label className="block font-medium mb-1">Withdrawal Details:</label>
            <input
              type="text"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Wallet address / Bank account number"
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block font-medium mb-1">Withdrawal Amount ($):</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="e.g. 50"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
          >
            Submit Withdrawal
          </button>
        </form>

        {/* Note */}
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          📌 Please double-check your withdrawal details. Incorrect information may result in loss of funds.
        </p>
      </div>
    </div>
  );
}
