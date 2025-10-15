import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

export default function App() {
  const [token, setToken] = useState(sessionStorage.getItem("token") || "");
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

  // Sync state if sessionStorage changes (e.g., login/logout)
  useEffect(() => {
    const handleStorage = () => {
      setToken(sessionStorage.getItem("token") || "");
      const rawUser = sessionStorage.getItem("user");
      if (!rawUser) return setUser(null);
      try {
        setUser(JSON.parse(rawUser));
      } catch {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {token && user ? (
          <Dashboard />
        ) : (
          <Login setToken={setToken} setUser={setUser} />
        )}
      </main>
    </div>
  );
}
