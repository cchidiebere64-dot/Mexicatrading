import { useEffect, useState } from "react";

export default function ActivePlans() {
  const API_URL = "https://mexicatradingbackend.onrender.com";
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const res = await fetch(`${API_URL}/api/investments/mine`, {
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

  const activeInvestments = investments.filter(i => i.status === "active");
  const completedInvestments = investments.filter(i => i.status === "completed");

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <h2 className="text-3xl font-bold mb-6 text-center">📈 Investments</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <>
          {/* Active Investments */}
          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">Active Investments</h3>
            {activeInvestments.length === 0 ? (
              <p>No active investments yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeInvestments.map(inv => (
                  <div
                    key={inv._id}
                    className="p-5 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  >
                    <h3 className="text-xl font-bold mb-2">💼 {inv.plan} Plan</h3>
                    <p>Amount Invested: <span className="font-semibold">${inv.amount}</span></p>
                    <p>Expected Profit: <span className="font-semibold">${inv.profit}</span></p>
                    <p>Started: {new Date(inv.createdAt).toLocaleDateString()}</p>
                    <p>Ends: {new Date(inv.endDate).toLocaleDateString()}</p>
                    <p className={`font-semibold mt-4 ${calculateDaysLeft(inv.endDate) === 0 ? "text-red-500" : "text-emerald-500"}`}>
                      {calculateDaysLeft(inv.endDate) === 0
                        ? "Completed"
                        : `${calculateDaysLeft(inv.endDate)} days remaining`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Completed Investments */}
          <section>
            <h3 className="text-2xl font-semibold mb-4">Completed Investments</h3>
            {completedInvestments.length === 0 ? (
              <p>No completed investments yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {completedInvestments.map(inv => (
                  <div
                    key={inv._id}
                    className="p-5 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 opacity-75"
                  >
                    <h3 className="text-xl font-bold mb-2">💼 {inv.plan} Plan</h3>
                    <p>Amount Invested: <span className="font-semibold">${inv.amount}</span></p>
                    <p>Profit Earned: <span className="font-semibold">${inv.profit}</span></p>
                    <p>Completed on: {new Date(inv.endDate).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
