import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const API_URL = "https://mexicatradingbackend.onrender.com";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch dashboard data
  const fetchDashboard = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleWithdraw = async () => {
    const amount = prompt("🏧 Enter withdrawal amount:");
    if (!amount) return;
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/withdraw`,
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Withdrawal successful!");
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || "❌ Withdrawal failed");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!data)
    return (
      <p className="text-center mt-10 text-red-500">
        ❌ Failed to load dashboard
      </p>
    );

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-bold text-emerald-600">
          👋 Welcome, {data.name}
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your investments and track your progress
        </p>
      </div>

      {/* Balance Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Current Balance</h3>
            <p className="text-4xl font-extrabold text-emerald-500 mt-2">
              ${data.balance}
            </p>
          </div>
          <div className="space-x-3">
            {/* ✅ Navigate to Deposit Page */}
            <button
              onClick={() => navigate("/deposit")}
              className="bg-emerald-600 text-white px-5 py-2 rounded-xl hover:bg-emerald-700 transition"
            >
              💰 Deposit
            </button>

            <button
              onClick={handleWithdraw}
              className="bg-red-600 text-white px-5 py-2 rounded-xl hover:bg-red-700 transition"
            >
              🏧 Withdraw
            </button>

            <button
              onClick={() => navigate("/plans")}
              className="bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700 transition"
            >
              📈 Invest
            </button>
          </div>
        </div>
      </div>

      {/* Active Plans */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-8">
        <h3 className="text-xl font-semibold mb-4">📊 Active Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.plans && data.plans.length > 0 ? (
            data.plans.map((plan, idx) => (
              <div
                key={idx}
                className="border dark:border-gray-700 p-4 rounded-lg hover:shadow-md transition"
              >
                <h4 className="font-bold text-lg">{plan.name}</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Invested:{" "}
                  <span className="font-semibold">${plan.invested}</span>
                </p>
                <p className="text-emerald-500 font-semibold">
                  Profit: ${plan.profit}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No active plans</p>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4">📜 Recent Activity</h3>
        <ul className="space-y-3">
          {data.history && data.history.length > 0 ? (
            data.history.map((item, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center border-b dark:border-gray-700 pb-2"
              >
                <span className="font-medium">{item.action}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(item.date).toLocaleDateString()}
                </span>
                <span
                  className={`font-semibold ${
                    item.action === "Deposit"
                      ? "text-emerald-500"
                      : "text-red-500"
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
