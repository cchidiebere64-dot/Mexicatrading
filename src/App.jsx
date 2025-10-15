import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Plans from "./pages/Plans";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminDeposits from "./pages/AdminDeposits";
import AdminWithdrawals from "./pages/AdminWithdrawals";
import AdminPlans from "./pages/AdminPlans";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar always visible */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow p-6">
        {/* Render pages directly */}
        <Dashboard />
        {/* Uncomment other pages if needed */}
        {/* <Home /> */}
        {/* <Plans /> */}
        {/* <Login /> */}
        {/* <Register /> */}
        {/* <Deposit /> */}
        {/* <Withdraw /> */}
        {/* <AdminDashboard /> */}
        {/* <AdminUsers /> */}
        {/* <AdminDeposits /> */}
        {/* <AdminWithdrawals /> */}
        {/* <AdminPlans /> */}
      </main>
    </div>
  );
}
