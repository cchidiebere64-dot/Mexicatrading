import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    axios
      .get("https://mexicatradingbackend.onrender.com/api/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data))
      .catch((err) => console.error("❌ Dashboard error:", err));
  }, []);

  if (!data) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <h2 className="text-3xl font-bold mb-6">👤 Welcome, {data.name}</h2>

      {/* Balance */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6">
        <h3 className="text-xl font-semibold">Current Balance</h3>
        <p className="text-3xl font-bold text-emerald-500">${data.balance}</p>
      </div>

      {/* Active Plans */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Active Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.plans && data.plans.length > 0 ? (
            data.plans.map((plan, idx) => (
              <div key={idx} className="border dark:border-gray-700 p-4 rounded-lg">
                <h4 className="font-bold">{plan.name}</h4>
                <p>Invested: ${plan.invested}</p>
                <p className="text-emerald-400">Profit: ${plan.profit}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No active plans yet.</p>
          )}
        </div>
      </div>

      {/* History */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold mb-4">📜 Recent Activity</h3>
        <ul className="space-y-3">
          {data.history && data.history.length > 0 ? (
            data.history.map((item, idx) => (
              <li
                key={idx}
                className="flex justify-between border-b dark:border-gray-700 pb-2"
              >
                <span>{item.action}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(item.date).toLocaleDateString()}
                </span>
                <span className="font-semibold">${item.amount}</span>
              </li>
            ))
          ) : (
            <p className="text-gray-500">No recent activity.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
