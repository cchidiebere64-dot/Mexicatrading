import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { getToken, getUser } from "./utils/storage";

export default function App() {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getUser());

  // Show Login if not logged in
  if (!token || !user) {
    return <Login setToken={setToken} setUser={setUser} />;
  }

  // Once logged in, show Dashboard
  return <Dashboard />;
}
