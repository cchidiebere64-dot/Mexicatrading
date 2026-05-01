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
      const res = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password },
        { timeout: 30000 }
      );

      if (res.data?.token) {
        const userData = {
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          balance: res.data.balance,
          isAdmin: res.data.isAdmin || false,
        };

        // store session
        sessionStorage.setItem("token", res.data.token);
        sessionStorage.setItem("user", JSON.stringify(userData));

        // admin handling (unchanged logic)
        if (userData.isAdmin) {
          sessionStorage.setItem("adminToken", res.data.token);
          navigate("/admin");
        } else {
          navigate("/dashboard");

          // keep your existing refresh logic (important for your app state)
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
      } else {
        setError("Invalid response from server.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#0a0f1c] text-white overflow-hidden px-4">

      {/* background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full top-[-120px] left-[-120px]" />
        <div className="absolute w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full bottom-[-120px] right-[-120px]" />
      </div>

      {/* login form */}
      <form
        onSubmit={handleLogin}
        className="relative w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl hover:scale-[1.01] transition"
      >
        <h2 className="text-3xl font-bold text-center mb-2">
          Welcome Back
        </h2>

        <p className="text-center text-gray-400 mb-6">
          Login to continue 🚀
        </p>

        {error && (
          <p className="text-red-400 text-center mb-4 bg-red-500/10 border border-red-500/20 p-2 rounded-lg">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 rounded-lg bg-white/10 border border-white/10 outline-none focus:border-emerald-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full p-3 mb-4 rounded-lg bg-white/10 border border-white/10 outline-none focus:border-emerald-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 transition font-semibold shadow-lg active:scale-95"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm mt-5 text-gray-400">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-emerald-400 cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>
      </form>
    </div>
  );
}
