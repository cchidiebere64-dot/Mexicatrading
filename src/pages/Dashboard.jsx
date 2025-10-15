import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const API_URL = "https://mexicatradingbackend.onrender.com";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(sessionStorage.getItem("token") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Fetch dashboard if token exists
  const fetchDashboard = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));
      setToken(res.data.token);
      setLoginError("");
    } catch (err) {
      console.error(err.response?.data || err.message);
      setLoginError(err.response?.data?.message || "Login failed");
    }
  };

  // Loading
  if (loading) return <p className="text-center mt-10">Loading...</p>;

  // If no token, show login form
  if (!token)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <form
          onSubmit={handleLogin}
          className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 w-96"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
            🔑 Login to Dashboard
          </h2>

          {loginError && (
            <p className="text-red-500 font-semibold mb-4 text-center">{loginError}</p>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="********"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    );

  // Dashboard view
  const plans = data?.plans || [];
  const history = data?.history || [];

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-bold text-emerald-600">
          👋 Welcome, {data?.name || "User"}
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your investments and track your progress
        </p>
      </div>

      {/* Balance */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-8">
        <h3 className="text-lg font-medium">Current Balance</h3>
        <p className="text-4xl font-extrabold text-emerald-500 mt-2">
          ${data?.balance ?? 0}
        </p>
      </div>

      {/* Active Plans */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-8">
        <h3 className="text-xl font-semibold mb-4">📊 Active Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.length > 0 ? (
            plans.map((plan, idx) => (
              <div
                key={idx}
                className="border dark:border-gray-700 p-4 rounded-lg hover:shadow-md transition"
              >
                <h4 className="font-bold text-lg">{plan.name || "Unnamed Plan"}</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Invested: <span className="font-semibold">${plan.invested ?? 0}</span>
                </p>
                <p className="text-emerald-500 font-semibold">
                  Profit: ${plan.profit ?? 0}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No active plans</p>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4">📜 Recent Activity</h3>
        <ul className="space-y-3">
          {history.length > 0 ? (
            history.map((item, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center border-b dark:border-gray-700 pb-2"
              >
                <span className="font-medium">{item.action || "Unknown"}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {item.date ? new Date(item.date).toLocaleDateString() : "N/A"}
                </span>
                <span
                  className={`font-semibold ${
                    item.action === "Deposit" ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  ${item.amount ?? 0}
                </span>
              </li>
            ))
          ) : (
            <p className="text-gray-500">No recent activity</p>
          )}
        </ul>
      </div>
    </div>
  );
}
