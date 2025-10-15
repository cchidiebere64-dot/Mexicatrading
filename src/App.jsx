import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";

export default function App() {
  const [token, setToken] = useState(sessionStorage.getItem("token") || "");
  const [user, setUser] = useState(
    sessionStorage.getItem("user")
      ? JSON.parse(sessionStorage.getItem("user"))
      : null
  );

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
