import { useState } from "react";
import axios from "axios";

export default function Login({ setToken, setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://mexicatradingbackend.onrender.com/api/auth/login", {
        email,
        password,
      });

      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));

      setToken(res.data.token);
      setUser(res.data.user);
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <form onSubmit={handleLogin} className="bg-white dark:bg-gray-800 p-8 rounded-xl w-96 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded-lg"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded-lg"
          required
        />

        <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg">
          Login
        </button>
      </form>
    </div>
  );
}
