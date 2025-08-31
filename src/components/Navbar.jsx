import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <nav className="bg-slate-900 dark:bg-gray-100 text-white dark:text-gray-900 p-4 flex justify-between items-center shadow-lg">
      <h1 className="text-2xl font-bold text-emerald-400">Mexicatrading 🚀</h1>
      <div className="flex gap-6 items-center">
        <Link to="/" className="hover:text-emerald-400 transition">Home</Link>
        <Link to="/plans" className="hover:text-emerald-400 transition">Plans</Link>
        <Link to="/dashboard" className="hover:text-emerald-400 transition">Dashboard</Link>
        <Link to="/login" className="hover:text-emerald-400">Login</Link>
<Link to="/register" className="hover:text-emerald-400">Register</Link>

        {/* 🌙☀️ Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="ml-4 bg-emerald-500 text-white dark:text-white px-3 py-1 rounded-lg text-sm hover:bg-emerald-600 transition"
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>
    </nav>
  );
}



