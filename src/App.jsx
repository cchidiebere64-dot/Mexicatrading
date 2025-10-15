import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

export default function App() {
  const [token, setToken] = useState(sessionStorage.getItem("token") || "");
  const [user, setUser] = useState(
    sessionStorage.getItem("user")
      ? JSON.parse(sessionStorage.getItem("user"))
      : null
  );

  // If user is logged in, show Dashboard
  if (token && user) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <Dashboard />
        </main>
      </div>
    );
  }

  // If not logged in, show Login
  return <Login setToken={setToken} setUser={setUser} />;
}
