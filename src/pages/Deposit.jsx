import { useState } from "react";
import axios from "axios";

export default function Deposit() {
  const API_URL = "https://mexicatradingbackend.onrender.com";
  const [amount, setAmount] = useState("");

  const handleCopy = () => {
    navigator.clipboard.writeText("UQDFCUmoi5-9Uln74UFEhBzRgySsWUKkg6pYc4OX5ql2GWmy");
    alert("✅ Address copied to clipboard!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || amount <= 0) {
      return alert("❌ Enter a valid deposit amount.");
    }

    try {
      const token = sessionStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/deposit`,
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Deposit request submitted! Wait for admin approval.");
      setAmount("");
    } catch (err) {
      alert(err.response?.data?.message || "❌ Deposit failed");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex justify-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-emerald-600 mb-4">💰 Make a Deposit</h2>

        {/* Payment Method */}
        <p className="font-medium">Select Payment Method:</p>
        <div className="my-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="font-bold">TON</p>
          <p className="text-sm text-red-500">
            ⚠️ Only send TON assets to this address. Other assets will be lost forever.
          </p>
        </div>

        {/* Wallet Address */}
        <div className="mb-4">
          <p className="font-medium mb-1">TON Address / Account:</p>
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-lg justify-between">
            <span className="text-sm break-all">
              UQDFCUmoi5-9Uln74UFEhBzRgySsWUKkg6pYc4OX5ql2GWmy
            </span>
            <button
              onClick={handleCopy}
              className="ml-2 bg-emerald-600 text-white px-3 py-1 rounded-lg hover:bg-emerald-700 transition"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Deposit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Enter Deposit Amount ($):</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="e.g. 100"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            Submit Deposit
          </button>
        </form>

        {/* Note */}
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          📌 Please make payment to the wallet address above and wait for deposit approval.
        </p>
      </div>
    </div>
  );
}
