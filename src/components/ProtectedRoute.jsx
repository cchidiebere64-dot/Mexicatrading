import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Guards the signed-in pages.
 *
 * Note: this is a convenience guard, not a security boundary. sessionStorage
 * can be edited in the browser, so the real protection is the `protect`
 * middleware on the backend — every user endpoint must keep using it.
 * This only stops a signed-out visitor seeing an empty shell full of 401s.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = sessionStorage.getItem("token");

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return children;
}
