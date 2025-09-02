import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Withdraw() {
  const API_URL = "https://mexicatradingbackend.onrender.com";
  const [amount, setAmount] = useState("");
  const navigate = useNavigate();

  const handleWithdraw = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/withdraw`,
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Withdrawal successful!");
      navigate("/dashboard"); // go back after withdraw
    } catch (err) {
      alert(err.response?.data?.message || "❌ Withdrawal failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleWithdraw}
        className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center text-red-600 mb-4">
          🏧 Withdraw Funds
        </h2>
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="w-full px-4 py-2 mb-4 border rounded-lg focus:ring focus:ring-red-400 dark:bg-gray-700 dark:text-white"
        />
        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
        >
          Submit Withdrawal
        </button>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="w-full mt-3 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
