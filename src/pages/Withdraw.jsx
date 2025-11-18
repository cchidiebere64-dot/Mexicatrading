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
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex justify-center items-start">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg max-w-md w-full mt-10">
        <h2 className="text-2xl font-bold text-red-600 mb-4">🏧 Make a Withdrawal</h2>

        {message.text && (
          <div
            className={`mb-4 p-3 rounded-lg text-center ${
              message.type === "success"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Withdrawal"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          📌 Double-check your withdrawal details. Incorrect info may result in loss of funds.
        </p>
      </div>
    </div>
  );
}
