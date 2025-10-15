import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem("token"); // ✅ plain string

  if (!token) {
    // If no token, redirect to login
    return <Navigate to="/login" />;
  }

  return children;
}
