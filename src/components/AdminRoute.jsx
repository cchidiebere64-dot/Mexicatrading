// src/components/AdminRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { getJSON } from "../utils/storage";

export default function AdminRoute({ children }) {
  const token = getJSON("token");
  const user = getJSON("user");

  // Only allow admin users
  if (!token || !user || !user.isAdmin) {
    return <Navigate to="/login" />;
  }

  return children;
}
