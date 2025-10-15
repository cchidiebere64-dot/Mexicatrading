import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [token, setToken] = useState(sessionStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("user");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // When token or user changes, update sessionStorage
  useEffect(() => {
    if (token && user) {
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));
    }
  }, [token, user]);

  // If token/user missing, show login
  if (!token || !user) {
    return <Login setToken={setToken} setUser={setUser} />;
  }

  // Otherwise show dashboard
  return <Dashboard />;
}
