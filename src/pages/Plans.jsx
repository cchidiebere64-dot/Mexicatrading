import { useEffect, useState } from "react";

export default function Dashboard() {
  const user = {
    name: "Elvis",
    balance: 1250,
    plans: [
      { name: "Starter", invested: 50, profit: 12.5 },
      { name: "Pro", invested: 200, profit: 60 },
    ],
    history: [
      { id: 1, action: "Invested in Pro Plan", amount: "$200", date: "2025-08-20" },
      { id: 2, action: "Profit credited", amount: "$20", date: "2025-08-25" },
      { id: 3, action: "Invested in Starter Plan", amount: "$50", date: "2025-08-28" },
    ],
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold">👤 Welcome back, {user.name}</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Here’s your latest investment overview 🚀
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-500">Balance</h3>
          <p className="text-3xl font-bold text-emerald-500">${user.balance}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-500">Active Plans</h3>
          <p className="text-3xl font-bold">{user.plans.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-500">Total Profit</h3>
          <p className="text-3xl font-bold text-emerald-400">
            ${user.plans.reduce((sum, p) => sum + p.profit, 0)}
          </p>
        </div>
      </div>

      {/* Active Plans */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4">📊 Your Active Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {user.plans.map((plan, idx) => (
            <div
              key={idx}
              className="p-4 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
            >
              <h4 className="font-bold text-lg">{plan.name}</h4>
              <p>Invested: ${plan.invested}</p>
              <p className="text-emerald-400 font-semibold">
                Profit: ${plan.profit}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold mb-4">📜 Recent Activity</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b dark:border-gray-700">
              <th className="pb-2">Action</th>
              <th className="pb-2">Amount</th>
              <th className="pb-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {user.history.map((item) => (
              <tr
                key={item.id}
                className="border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <td className="py-2">{item.action}</td>
                <td className="py-2 font-semibold">{item.amount}</td>
                <td className="py-2 text-gray-500 dark:text-gray-400">
                  {item.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

