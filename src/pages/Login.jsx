import React, { useState } from "react";
import axios from "axios";

export default function Login({ setToken, setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("🔹 Sending login request...");
      const res = await axios.post(
        "https://mexicatradingbackend.onrender.com/api/auth/login",
        { email, password }
      );

      console.log("✅ Login response:", res.data);

      if (res.data && res.data.token) {
        sessionStorage.setItem("token", res.data.token);
        sessionStorage.setItem("user", JSON.stringify(res.data.user));

        setToken(res.data.token);
        setUser(res.data.user);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("❌ Login failed:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Login failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <form
        onSubmit={handleLogin}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          🔐 Login to Your Account
        </h2>

        {error && (
          <p className="text-red-600 text-center mb-3 bg-red-100 dark:bg-red-900 p-2 rounded-lg">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

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
