import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { LogOut, Sun, Moon, Menu, X } from "lucide-react";
import { getUser } from "../utils/storage";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser());
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-emerald-600">Mexicatrading 🚀</Link>
        <div className="hidden md:flex space-x-4 items-center">
          <Link to="/" className="hover:text-emerald-600">Home</Link>
          <Link to="/plans" className="hover:text-emerald-600">Plans</Link>
          {user && <Link to="/dashboard" className="hover:text-emerald-600">Dashboard</Link>}
          {user ? (
            <button onClick={handleLogout} className="bg-red-600 text-white px-3 py-1 rounded">Logout</button>
          ) : (
            <Link to="/login" className="bg-emerald-600 text-white px-3 py-1 rounded">Login</Link>
          )}
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
