import { useEffect, useState } from "react";

export default function Transactions() {
  const API_URL = "https://mexicatradingbackend.onrender.com";
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch(`${API_URL}/api/transactions`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setTransactions(data);
        }
      } catch (err) {
        console.error("Failed to fetch transactions");
      }
      setLoading(false);
    };

    fetchTransactions();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">📜 Transaction History</h2>
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : transactions.length === 0 ? (
        <p className="text-center text-gray-500">No transactions yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border rounded-lg overflow-hidden">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="p-3">Plan</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => (
                <tr key={i} className="text-center border-t dark:border-gray-700">
                  <td className="p-3">{tx.plan}</td>
                  <td className="p-3">${tx.amount}</td>
                  <td
                    className={`p-3 font-semibold ${
                      tx.status === "approved"
                        ? "text-emerald-500"
                        : tx.status === "pending"
                        ? "text-yellow-500"
                        : "text-red-500"
                    }`}
                  >
                    {tx.status}
                  </td>
                  <td className="p-3">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
