import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react"; // ✅ modern icons

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [menuOpen, setMenuOpen] = useState(false);

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
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-emerald-600">
          Mexicatrading 🚀
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 font-medium text-gray-700 dark:text-gray-200">
          <Link to="/" className="hover:text-emerald-500">Home</Link>
          <Link to="/plans" className="hover:text-emerald-500">Plans</Link>
          <Link to="/dashboard" className="hover:text-emerald-500">Dashboard</Link>
          <Link to="/login" className="hover:text-emerald-500">Login</Link>
          <Link to="/register" className="hover:text-emerald-500">Register</Link>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="hidden md:block px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 dark:text-gray-200"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-700 px-6 py-4 space-y-4">
          <Link to="/" className="block hover:text-emerald-500">Home</Link>
          <Link to="/plans" className="block hover:text-emerald-500">Plans</Link>
          <Link to="/dashboard" className="block hover:text-emerald-500">Dashboard</Link>
          <Link to="/login" className="block hover:text-emerald-500">Login</Link>
          <Link to="/register" className="block hover:text-emerald-500">Register</Link>
          {/* Dark Mode Toggle inside mobile */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      )}
    </nav>
  );
}
