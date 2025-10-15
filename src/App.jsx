import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Plans from "./pages/Plans";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminDeposits from "./pages/AdminDeposits";
import AdminWithdrawals from "./pages/AdminWithdrawals";
import AdminPlans from "./pages/AdminPlans";
import { getToken, getUser } from "./utils/storage";

export default function App() {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getUser());

  // State to control which page is currently shown
  const [currentPage, setCurrentPage] = useState("dashboard"); 
  // Possible values: dashboard, plans, deposit, withdraw, adminDashboard, adminUsers, adminDeposits, adminWithdrawals, adminPlans

  // Simple page switcher
  const renderPage = () => {
    if (!token || !user) return <Login setToken={setToken} setUser={setUser} />;

    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "plans":
        return <Plans />;
      case "deposit":
        return <Deposit />;
      case "withdraw":
        return <Withdraw />;
      case "adminDashboard":
        return <AdminDashboard />;
      case "adminUsers":
        return <AdminUsers />;
      case "adminDeposits":
        return <AdminDeposits />;
      case "adminWithdrawals":
        return <AdminWithdrawals />;
      case "adminPlans":
        return <AdminPlans />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {renderPage()}
      </main>
    </div>
  );
}
