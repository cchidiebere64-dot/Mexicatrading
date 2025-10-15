// src/components/AdminRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  // ✅ Get token and user from sessionStorage directly
  const token = sessionStorage.getItem("token");
  const userStr = sessionStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  // Only allow admin users
  if (!token || !user || !user.isAdmin) {
    return <Navigate to="/login" />;
  }

  return children;
}
