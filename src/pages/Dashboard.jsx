import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const API_URL = "https://mexicatradingbackend.onrender.com";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    // ✅ Get token as plain string
    const token = sessionStorage.getItem("token");

    if (!token) {
      console.error("No token found. Please login first.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
      console.log("Dashboard data:", res.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err.response?.data || err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!data)
    return (
      <p className="text-center mt-10 text-red-500">
        ❌ Failed to load dashboard
      </p>
    );

  const plans = data.plans || [];
  const history = data.history || [];

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-bold text-emerald-600">
          👋 Welcome, {data.name || "User"}
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your investments and track your progress
        </p>
      </div>

      {/* Balance Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-8">
        <h3 className="text-lg font-medium">Current Balance</h3>
        <p className="text-4xl font-extrabold text-emerald-500 mt-2">
          ${data.balance ?? 0}
        </p>
      </div>

      {/* Active Plans */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-8">
        <h3 className="text-xl font-semibold mb-4">📊 Active Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.length > 0 ? (
            plans.map((plan, idx) => (
              <div
                key={idx}
                className="border dark:border-gray-700 p-4 rounded-lg hover:shadow-md transition"
              >
                <h4 className="font-bold text-lg">{plan.name || "Unnamed Plan"}</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Invested: <span className="font-semibold">${plan.invested ?? 0}</span>
                </p>
                <p className="text-emerald-500 font-semibold">
                  Profit: ${plan.profit ?? 0}
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
          {history.length > 0 ? (
            history.map((item, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center border-b dark:border-gray-700 pb-2"
              >
                <span className="font-medium">{item.action || "Unknown"}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {item.date ? new Date(item.date).toLocaleDateString() : "N/A"}
                </span>
                <span
                  className={`font-semibold ${
                    item.action === "Deposit" ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  ${item.amount ?? 0}
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

