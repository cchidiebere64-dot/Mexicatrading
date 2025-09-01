import { useState } from "react";

export default function Deposit() {
  const API_URL = "https://mexicatradingbackend.onrender.com";
  const [plan, setPlan] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const plans = [
    { name: "Starter", min: 50 },
    { name: "Pro", min: 200 },
    { name: "Elite", min: 1000 },
  ];

  const handleDeposit = async (e) => {
    e.preventDefault();

    if (!plan || !amount || isNaN(amount)) {
      setMessage("❌ Please select a plan and enter a valid amount.");
      return;
    }

    if (Number(amount) < plans.find((p) => p.name === plan).min) {
      setMessage(`❌ Minimum investment for ${plan} is $${plans.find((p) => p.name === plan).min}`);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/transactions/deposit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ plan, amount }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Deposit request submitted! Waiting for admin approval.");
        setPlan("");
        setAmount("");
      } else {
        setMessage(`❌ ${data.message || "Failed to submit deposit"}`);
      }
    } catch (error) {
      setMessage("❌ Network error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6">
        <h2 className="text-3xl font-bold mb-4 text-center">💰 Make a Deposit</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
          Select your plan, enter amount, and wait for admin approval.
        </p>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl text-center font-semibold ${
              message.startsWith("✅")
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleDeposit} className="space-y-4">
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">-- Select Plan --</option>
            {plans.map((p, i) => (
              <option key={i} value={p.name}>
                {p.name} (Min: ${p.min})
              </option>
            ))}
          </select>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition"
          >
            {loading ? "Processing..." : "Submit Deposit"}
          </button>
        </form>
      </div>
    </div>
  );
}
