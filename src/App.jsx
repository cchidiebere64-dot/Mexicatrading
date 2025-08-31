import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const user = localStorage.getItem("loggedInUser"); // check login

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


