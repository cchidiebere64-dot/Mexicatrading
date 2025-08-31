import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const user = sessionStorage.getItem("user");

  // If no user in sessionStorage → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Else → allow access
  return children;
}
