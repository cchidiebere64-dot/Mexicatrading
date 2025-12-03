import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const API_URL = "https://mexicatradingbackend.onrender.com";

 const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    console.log("🔹 Sending login request...");
    const res = await axios.post(`${API_URL}/api/auth/login`, { email, password }, { timeout: 30000 });

    console.log("✅ Login response:", res.data);

    if (res.data?.token) {
      const userData = {
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        balance: res.data.balance,
        isAdmin: res.data.isAdmin || false,
      };

      // Save to sessionStorage
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("user", JSON.stringify(userData));

      // If admin, also set adminToken for admin routes
      if (userData.isAdmin) {
        sessionStorage.setItem("adminToken", res.data.token);
        console.log("🎯 Admin login success, redirecting to admin dashboard...");
        navigate("/admin");
      } else {
       console.log("🎯 Login success, redirecting to dashboard...");
navigate("/dashboard");

// Force React to reload auth state
setTimeout(() => {
  window.location.reload();
}, 100);

      }
    } else {
      setError("Invalid response from server.");
    }
  } catch (err) {
    console.error("❌ Login failed:", err.response?.data || err.message);
    setError(err.response?.data?.message || "Login failed");
  } finally {
    setLoading(false); // ✅ ensures spinner/loading always stops
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <form
        onSubmit={handleLogin}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Login to <span className="text-emerald-600">Mexicatrading</span>
        </h2>

        {error && (
          <p className="text-red-600 text-center mb-3 bg-red-100 dark:bg-red-900 p-2 rounded-lg">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full p-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 transition"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}



