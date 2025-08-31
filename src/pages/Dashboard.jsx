import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [deposit, setDeposit] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    const token = sessionStorage.getItem("token");
    axios
      .get("http://localhost:5000/api/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data))
      .catch((err) => console.error("Dashboard fetch error:", err));
  };

  const handleDeposit = (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");

    axios
      .post(
        "http://localhost:5000/api/dashboard/deposit",
        { amount: Number(deposit) },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        alert("✅ Deposit successful!");
        setData({ ...data, balance: res.data.balance, history: res.data.history });
        setDeposit("");
      })
      .catch((err) => {
        console.error("Deposit error:", err);
        alert("❌ Deposit failed");
      });
  };

  if (!data) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Welcome */}
      <h2 className="text-3xl font-bold mb-6">👤 Welcome, {data.name}</h2>

      {/* Balance */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6">
        <h3 className="text-xl font-semibold">Current Balance</h3>
        <p className="text-3xl font-bold text-emerald-500">${data.balance}</p>
      </div>

      {/* 💰 Deposit Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">💳 Deposit Funds</h3>
        <form onSubmit={handleDeposit} className="flex gap-4">
          <input
            type="number"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            placeholder="Enter amount"
            required
          />
          <button
            type="submit"
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            Deposit
          </button>
        </form>
      </div>

      {/* Active Plans + History (same as before) */}
    </div>
  );
}

