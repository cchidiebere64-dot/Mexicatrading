
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [investments, setInvestments] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchInvestments = async () => {
      const res = await fetch("http://localhost:5000/api/investments", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (res.ok) setInvestments(data);
    };
    fetchInvestments();
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h2 className="text-3xl font-bold mb-6">👤 Welcome, {user.name}</h2>
      <h3 className="text-xl mb-4">Your Investments</h3>
      <div className="space-y-4">
        {investments.map((inv) => (
          <div key={inv._id} className="p-4 bg-white rounded shadow">
            <h4 className="font-semibold">{inv.plan} Plan</h4>
            <p>Invested: ${inv.amount}</p>
            <p>Profit: ${inv.profit}</p>
            <p>Status: {inv.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

