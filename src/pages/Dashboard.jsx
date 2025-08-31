import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/dashboard/deposit",
        { amount: Number(depositAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDepositAmount("");
      fetchData(); // refresh dashboard
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!data) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <h2 className="text-3xl font-bold mb-6">👤 Welcome, {data.name}</h2>

      {/* Balance */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6">
        <h3 className="text-xl font-semibold">💰 Current Balance</h3>
        <p className="text-3xl font-bold text-emerald-500">${data.balance}</p>

        {/* Deposit Form */}
        <form onSubmit={handleDeposit} className="mt-4 flex gap-3">
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="Enter amount"
            className="border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <button
            type="submit"
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            Deposit
          </button>
        </form>
      </div>

      {/* Active Plans */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">📊 Active Plans</h3>
        {data.plans?.length ? (
          <ul className="space-y-2">
            {data.plans.map((plan, idx) => (
              <li key={idx} className="border-b dark:border-gray-700 pb-2">
                {plan.name} - Invested: ${plan.amount} | Profit: ${plan.profit}
              </li>
            ))}
          </ul>
        ) : (
          <p>No active plans</p>
        )}
      </div>

      {/* Profits */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold mb-4">📈 Total Profits</h3>
        <p className="text-2xl font-bold text-emerald-400">${data.profits}</p>
      </div>
    </div>
  );
}

