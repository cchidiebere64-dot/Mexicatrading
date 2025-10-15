import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [token, setToken] = useState(sessionStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem("user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (token && user) {
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));
    }
  }, [token, user]);

  console.log("Rendering App.jsx...");
  console.log("Token:", token ? "✅ Present" : "❌ Missing");
  console.log("User:", user);

  if (!token || !user) {
    return <Login setToken={setToken} setUser={setUser} />;
  }

  return <Dashboard />;
}
