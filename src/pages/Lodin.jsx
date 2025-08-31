import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // fake auth (store in localStorage)
    if (email && password) {
      localStorage.setItem("user", JSON.stringify({ email }));
      navigate("/dashboard"); // redirect
    } else {
      alert("Enter email & password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <form
        onSubmit={handleLogin}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Login
        </h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 rounded-lg border dark:border-gray-700 dark:bg-gray-900"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-3 rounded-lg border dark:border-gray-700 dark:bg-gray-900"
        />
        <button
          type="submit"
          className="w-full bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600 transition"
        >
          Login
        </button>
        <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
          Don’t have an account?{" "}
          <a href="/register" className="text-emerald-500 hover:underline">
            Register
          </a>
        </p>
      </form>
    </div>
  );
}
