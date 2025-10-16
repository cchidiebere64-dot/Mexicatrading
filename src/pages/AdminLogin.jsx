import { useState } from "react";

export default function AdminLogin({ setAdmin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === import.meta.env.VITE_ADMIN_PASS) {
      setAdmin(true);
      sessionStorage.setItem("isAdmin", "true");
    } else {
      setError("Invalid password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <form onSubmit={handleLogin} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Admin Login</h2>
        {error && <p className="text-red-500 mb-3">{error}</p>}
        <input
          type="password"
          placeholder="Enter Admin Password"
          className="w-full p-2 mb-4 border rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700">
          Login
        </button>
      </form>
    </div>
  );
}
