import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    axios
      .get("http://localhost:5000/api/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!data) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6 min-h-screen bg-gray-900 text-white">
      <h2 className="text-3xl font-bold mb-2">👤 Welcome, {data.name}</h2>
      <p className="text-gray-400 mb-6">
        Here’s your latest investment overview 🚀
      </p>

      {/* Balance */}
      <div className="bg-slate-800 p-6 rounded-xl shadow-md mb-6">
        <h3 className="text-lg font-semibold">Balance</h3>
        <p className="text-3xl font-bold text-emerald-500">${data.balance}</p>
      </div>

      {/* Active Plans */}
      <div className="bg-slate-800 p-6 rounded-xl shadow-md mb-6">
        <h3 className="text-lg font-semibold">Active Plans</h3>
        <p className="text-2xl">{data.plans?.length || 0}</p>
      </div>

      {/* Profit */}
      <div className="bg-slate-800 p-6 rounded-xl shadow-md mb-6">
        <h3 className="text-lg font-semibold">Total Profit</h3>
        <p className="text-2xl text-emerald-400">${data.profits}</p>
      </div>

      {/* Your Active Plans */}
      <div className="bg-slate-800 p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">📊 Your Active Plans</h3>
        {data.plans?.length ? (
          <ul className="space-y-2">
            {data.plans.map((plan, idx) => (
              <li
                key={idx}
                className="border-b border-gray-700 pb-2 flex justify-between"
              >
                <span>{plan.name}</span>
                <span className="text-emerald-400">
                  Invested: ${plan.amount}
                </span>
                <span className="text-blue-400">Profit: ${plan.profit}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No active plans yet.</p>
        )}
      </div>
    </div>
  );
}
