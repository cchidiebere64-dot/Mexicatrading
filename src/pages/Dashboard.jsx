import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const API_URL = "https://mexicatradingbackend.onrender.com";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
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
  const token = sessionStorage.getItem("token");
  console.log("🔑 Token used for dashboard:", token);
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
    <div className="p-6 min-h-screen text-gray-900 dark:text-white">
      <h2 className="text-4xl font-bold text-emerald-600 mb-6">
        👋 Welcome, {data.name || "User"}
      </h2>

      <div className="mb-8">
        <h3 className="text-lg font-medium">Current Balance</h3>
        <p className="text-4xl font-extrabold text-emerald-500">
          ${data.balance ?? 0}
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">📊 Active Plans</h3>
        {plans.length > 0 ? (
          plans.map((plan, idx) => (
            <div key={idx} className="border p-4 rounded-lg mb-2">
              <h4 className="font-bold">{plan.name || "Unnamed Plan"}</h4>
              <p>Invested: ${plan.invested ?? 0}</p>
              <p>Profit: ${plan.profit ?? 0}</p>
            </div>
          ))
        ) : (
          <p>No active plans</p>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">📜 Recent Activity</h3>
        {history.length > 0 ? (
          history.map((item, idx) => (
            <div key={idx} className="flex justify-between mb-2 border-b pb-1">
              <span>{item.action || "Unknown"}</span>
              <span>
                {item.date ? new Date(item.date).toLocaleDateString() : "N/A"}
              </span>
              <span
                className={
                  item.action === "Deposit" ? "text-emerald-500" : "text-red-500"
                }
              >
                ${item.amount ?? 0}
              </span>
            </div>
          ))
        ) : (
          <p>No recent activity</p>
        )}
      </div>
    </div>
  );
}

