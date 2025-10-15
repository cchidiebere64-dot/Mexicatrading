import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";

export default function App() {
  const [token, setToken] = useState(sessionStorage.getItem("token") || "");

  // Safely parse user
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
