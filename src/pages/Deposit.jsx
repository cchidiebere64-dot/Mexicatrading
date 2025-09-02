import { useState } from "react";
import axios from "axios";

export default function Deposit() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Bank Transfer");
  const [loading, setLoading] = useState(false);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://mexicatradingbackend.onrender.com/api/transactions/deposit",
        { amount, method },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message || "Deposit successful!");
      setAmount("");
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-emerald-500 mb-6">
          💰 Deposit Funds
        </h2>

        <form onSubmit={handleDeposit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full p-3 rounded-lg text-black"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full p-3 rounded-lg text-black"
            >
              <option>Bank Transfer</option>
              <option>Crypto (USDT/BTC)</option>
              <option>PayPal</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition"
          >
            {loading ? "Processing..." : "Deposit"}
          </button>
        </form>
      </div>
    </div>
  );
}
