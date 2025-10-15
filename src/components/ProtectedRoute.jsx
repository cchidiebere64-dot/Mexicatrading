// src/components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { getJSON } from "../utils/storage";

export default function ProtectedRoute({ children }) {
  const token = getJSON("token");

  if (!token) {
    // If no token, redirect to login
    return <Navigate to="/login" />;
  }

  return children;
}
