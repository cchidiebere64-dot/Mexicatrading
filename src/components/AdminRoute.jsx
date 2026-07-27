import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Guards the /admin routes.
 *
 * Note: this is a convenience guard, not a security boundary. sessionStorage
 * can be edited in the browser, so the real protection is the `adminOnly`
 * middleware on the backend — every admin endpoint must keep using it.
 * This just stops the wrong person seeing an admin shell full of 401s.
 */
export default function AdminRoute({ children }) {
  const location = useLocation();

  const token = sessionStorage.getItem("token");
  const adminToken = sessionStorage.getItem("adminToken");
  const userStr = sessionStorage.getItem("user");

  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch {
    // corrupted value — treat as signed out
    user = null;
  }

  const isAdmin = Boolean(user?.isAdmin || user?.role === "admin");

  // adminToken is what every admin page sends; without it the API calls fail
  if (!token || !adminToken || !isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
