
import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  const fetchDashboard = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get("https://mexicatradingbackend.onrender.com/api/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Deposit handler
  const handleDeposit = async () => {
    const amount = prompt("💰 Enter deposit amount:");
    if (!amount) return;
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(
        "https://mexicatradingbackend.onrender.com/api/deposit",
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Deposit successful!");
      fetchDashboard(); // refresh balance
    } catch (err) {
      alert(err.response?.data?.message || "Deposit failed");
    }
  };

  // Withdraw handler
  const handleWithdraw = async () => {
    const amount = prompt("🏧 Enter withdrawal amount:");
    if (!amount) return;
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(
        "https://mexicatradingbackend.onrender.com/api/withdraw",
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Withdrawal successful!");
      fetchDashboard(); // refresh balance
    } catch (err) {
      alert(err.response?.data?.message || "Withdrawal failed");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!data) return <p className="text-center mt-10 text-red-500">❌ Failed to load dashboard</p>;

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <h2 className="text-3xl font-bold mb-6">👤 Welcome, {data.name}</h2>

      {/* Balance Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Current Balance</h3>
          <p className="text-3xl font-bold text-emerald-500">${data.balance}</p>
        </div>
        <div className="space-x-3">
          <button
            onClick={handleDeposit}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            💰 Deposit
          </button>
          <button
            onClick={handleWithdraw}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            🏧 Withdraw
          </button>
          <button
            onClick={() => (window.location.href = "/plans")}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            📈 Invest
          </button>
        </div>
      </div>

      {/* Active Plans */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Active Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.plans.length > 0 ? (
            data.plans.map((plan, idx) => (
              <div key={idx} className="border dark:border-gray-700 p-4 rounded-lg">
                <h4 className="font-bold">{plan.name}</h4>
                <p>Invested: ${plan.invested}</p>
                <p className="text-emerald-400">Profit: ${plan.profit}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No active plans</p>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold mb-4">📜 Recent Activity</h3>
        <ul className="space-y-3">
          {data.history.length > 0 ? (
            data.history.map((item, idx) => (
              <li key={idx} className="flex justify-between border-b dark:border-gray-700 pb-2">
                <span>{item.action}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(item.date).toLocaleDateString()}
                </span>
                <span
                  className={`font-semibold ${
                    item.action === "Deposit" ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  ${item.amount}
                </span>
              </li>
            ))
          ) : (
            <p className="text-gray-500">No recent activity</p>
          )}
        </ul>
      </div>
    </div>
  );
}
