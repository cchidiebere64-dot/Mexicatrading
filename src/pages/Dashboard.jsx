import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // ✅ Check login session
  useEffect(() => {
    const sessionUser = sessionStorage.getItem("user");
    if (!sessionUser) {
      navigate("/login"); // redirect if not logged in
    } else {
      setUser(JSON.parse(sessionUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null; // wait until user is loaded

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">👤 Welcome, {user.email}</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Balance */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6">
        <h3 className="text-xl font-semibold">Current Balance</h3>
        <p className="text-3xl font-bold text-emerald-500">$1250</p>
      </div>

      {/* Active Plans */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Active Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border dark:border-gray-700 p-4 rounded-lg">
            <h4 className="font-bold">Starter</h4>
            <p>Invested: $50</p>
            <p className="text-emerald-400">Profit: $12.5</p>
          </div>
          <div className="border dark:border-gray-700 p-4 rounded-lg">
            <h4 className="font-bold">Pro</h4>
            <p>Invested: $200</p>
            <p className="text-emerald-400">Profit: $60</p>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold mb-4">📜 Recent Activity</h3>
        <ul className="space-y-3">
          <li className="flex justify-between border-b dark:border-gray-700 pb-2">
            <span>Invested in Pro Plan</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">2025-08-20</span>
            <span className="font-semibold">$200</span>
          </li>
          <li className="flex justify-between border-b dark:border-gray-700 pb-2">
            <span>Profit credited</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">2025-08-25</span>
            <span className="font-semibold">$20</span>
          </li>
          <li className="flex justify-between border-b dark:border-gray-700 pb-2">
            <span>Invested in Starter Plan</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">2025-08-28</span>
            <span className="font-semibold">$50</span>
          </li>
        </ul>
      </div>
    </div>
  );
}



