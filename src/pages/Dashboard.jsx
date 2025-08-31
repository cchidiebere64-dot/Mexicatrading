
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
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md p-6 hidden md:block">
        <h2 className="text-2xl font-bold text-emerald-500 mb-6">📊 Dashboard</h2>
        <ul className="space-y-4">
          <li className="hover:text-emerald-400 cursor-pointer">Overview</li>
          <li className="hover:text-emerald-400 cursor-pointer">My Plans</li>
          <li className="hover:text-emerald-400 cursor-pointer">Transactions</li>
          <li className="hover:text-emerald-400 cursor-pointer">Settings</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h2 className="text-3xl font-bold mb-6">👤 Welcome, {user.name}</h2>

        {/* Balance */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6">
          <h3 className="text-xl font-semibold">Current Balance</h3>
          <p className="text-3xl font-bold text-emerald-500">${user.balance}</p>
        </div>

        {/* Active Plans */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-4">Active Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.plans.map((plan, idx) => (
              <div key={idx} className="border dark:border-gray-700 p-4 rounded-lg">
                <h4 className="font-bold">{plan.name}</h4>
                <p>Invested: ${plan.invested}</p>
                <p className="text-emerald-400">Profit: ${plan.profit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4">📜 Recent Activity</h3>
          <ul className="space-y-3">
            {user.history.map((item) => (
              <li key={item.id} className="flex justify-between border-b dark:border-gray-700 pb-2">
                <span>{item.action}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{item.date}</span>
                <span className="font-semibold">{item.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
