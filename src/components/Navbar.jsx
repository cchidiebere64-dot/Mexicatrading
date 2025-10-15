import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon, LogOut } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();

  // Safe user parsing
  const [user, setUser] = useState(() => {
    const rawUser = sessionStorage.getItem("user");
    if (!rawUser) return null;
    try {
      return JSON.parse(rawUser);
    } catch {
      console.warn("Failed to parse user from sessionStorage");
      return null;
    }
  });

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [menuOpen, setMenuOpen] = useState(false);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Logout handler
  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-emerald-600">
            Mexicatrading 🚀
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="hover:text-emerald-600">Home</Link>
            <Link to="/plans" className="hover:text-emerald-600">Plans</Link>

            {user && (
              <>
                <Link to="/deposit" className="hover:text-emerald-600">Deposit</Link>
                <Link to="/dashboard" className="hover:text-emerald-600">Dashboard</Link>
              </>
            )}

            {user?.role === "admin" && (
              <Link to="/admin" className="hover:text-emerald-600">Admin</Link>
            )}

            {!user ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg border border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                >
                  Register
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                <LogOut size={18} /> Logout
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="ml-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 px-4 py-3 space-y-3 shadow-lg">
          <Link to="/" className="block hover:text-emerald-600" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/plans" className="block hover:text-emerald-600" onClick={() => setMenuOpen(false)}>Plans</Link>

          {user && (
            <>
              <Link to="/deposit" className="block hover:text-emerald-600" onClick={() => setMenuOpen(false)}>Deposit</Link>
              <Link to="/dashboard" className="block hover:text-emerald-600" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            </>
          )}

          {user?.role === "admin" && (
            <Link to="/admin" className="block hover:text-emerald-600" onClick={() => setMenuOpen(false)}>Admin</Link>
          )}

          {!user ? (
            <>
              <Link
                to="/login"
                className="block px-4 py-2 rounded-lg bg-emerald-600 text-white text-center"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-4 py-2 rounded-lg border border-emerald-600 text-emerald-600 text-center"
                onClick={() => setMenuOpen(false)}
              >
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              <LogOut size={18} /> Logout
            </button>
          )}

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      )}
    </nav>
  );
}
