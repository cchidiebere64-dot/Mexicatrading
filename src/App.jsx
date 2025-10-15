import React, { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

export default function App() {
  const rawUser = sessionStorage.getItem("user");
  const [user, setUser] = useState(
    rawUser && rawUser !== "undefined" ? JSON.parse(rawUser) : null
  );
  const [token, setToken] = useState(sessionStorage.getItem("token") || "");

  return (
    <div className="flex flex-col min-h-screen">
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
