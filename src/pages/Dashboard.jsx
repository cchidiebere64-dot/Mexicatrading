import { useEffect, useState } from "react";
import { getToken, getUser } from "../utils/storage";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = getToken();
  const user = getUser();

  useEffect(() => {
    if (!token) return;

    const fetchDashboard = async () => {
      try {
        const res = await fetch("https://mexicatradingbackend.onrender.com/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) setData(json);
        else throw new Error(json.message || "Failed to fetch dashboard");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [token]);

  if (!token) return <p className="text-center mt-10 text-red-500">Login required</p>;
  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <h2 className="text-3xl font-bold mb-6">Welcome, {user?.name || "User"}</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-6">
        <h3 className="text-lg font-medium">Balance</h3>
        <p className="text-4xl font-bold text-emerald-500">${data?.balance || 0}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-6">
        <h3 className="text-xl font-semibold mb-4">Active Plans</h3>
        {data?.plans?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.plans.map((plan, i) => (
              <div key={i} className="border dark:border-gray-700 p-4 rounded-lg">
                <h4 className="font-bold">{plan.name}</h4>
                <p>Invested: ${plan.invested}</p>
                <p className="text-emerald-500">Profit: ${plan.profit}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No active plans</p>
        )}
      </div>
    </div>
  );
}
