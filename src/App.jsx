import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { getToken, getUser } from "./utils/storage";

export default function App() {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getUser());

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

