import { useState } from "react";
import axios from "axios";

export default function Withdraw() {
  const API_URL = "https://mexicatradingbackend.onrender.com";
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || amount <= 0) {
      alert("❌ Please enter a valid amount.");
      return;
    }
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/withdraw`,
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Withdrawal request submitted successfully!");
      setAmount("");
    } catch (err) {
      alert(err.response?.data?.message || "❌ Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-red-600">
          🏧 Withdraw Funds
        </h2>
        <form onSubmit={handleWithdraw} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Enter Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 100"
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition"
          >
            {loading ? "Processing..." : "Withdraw"}
          </button>
        </form>
      </div>
    </div>
  );
}
