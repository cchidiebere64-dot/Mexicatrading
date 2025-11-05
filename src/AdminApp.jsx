import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../pages/AdminLayout";
import AdminLogin from "../pages/AdminLogin";
import AdminDashboardHome from "../pages/AdminDashboardHome";
import AdminUsers from "../pages/AdminUsers";
import AdminPlans from "../pages/AdminPlans";
import ActivePlans from "../pages/ActivePlans";
import AdminDeposits from "../pages/AdminDeposits";
import AdminWithdrawals from "../pages/AdminWithdrawals";
import AdminCreditUser from "../pages/AdminCreditUser";

export default function AdminApp() {
  const token = localStorage.getItem("admin_token");

  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected routes */}
        <Route
          path="/admin"
          element={token ? <AdminLayout /> : <Navigate to="/admin/login" />}
        >
          <Route index element={<AdminDashboardHome />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="plans" element={<AdminPlans />} />
          <Route path="active-plans" element={<ActivePlans />} />
          <Route path="deposits" element={<AdminDeposits />} />
          <Route path="withdrawals" element={<AdminWithdrawals />} />
          <Route path="credit-user" element={<AdminCreditUser />} />
        </Route>

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
