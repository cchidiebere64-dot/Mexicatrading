// src/components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  // ✅ Read token as plain string (no JSON.parse)
  const token = sessionStorage.getItem("token");

  if (!token) {
    // If no token, redirect to login
    return <Navigate to="/login" />;
  }

  return children;
}
