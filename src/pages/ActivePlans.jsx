import { useEffect, useState } from "react";

export default function ActivePlans() {
  const API_URL = "https://mexicatradingbackend.onrender.com";
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const res = await fetch(`${API_URL}/api/investments`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });

        const data = await res.json();
        setInvestments(data);
      } catch (error) {
        console.error("Fetch investments error:", error);
      }
      setLoading(false);
    };

    fetchInvestments();
  }, []);

  const calculateDaysLeft = (endDate) => {
    const diff = new Date(endDate) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <h2 className="text-3xl font-bold mb-6 text-center">📈 Active Investments</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : investments.length === 0 ? (
        <p className="text-center text-gray-500">No active investments yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {investments.map((inv) => (
            <div
              key={inv._id}
              className="p-5 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <h3 className="text-xl font-bold mb-2">💼 {inv.plan} Plan</h3>

              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Amount Invested: <span className="font-semibold">${inv.amount}</span>
              </p>

              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Expected Profit: <span className="font-semibold">${inv.profit}</span>
              </p>

              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Started: {new Date(inv.createdAt).toLocaleDateString()}
              </p>

              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Ends: {new Date(inv.endDate).toLocaleDateString()}
              </p>

              <p
                className={`font-semibold mt-4 ${
                  calculateDaysLeft(inv.endDate) === 0
                    ? "text-red-500"
                    : "text-emerald-500"
                }`}
              >
                {calculateDaysLeft(inv.endDate) === 0
                  ? "Completed"
                  : `${calculateDaysLeft(inv.endDate)} days remaining`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
