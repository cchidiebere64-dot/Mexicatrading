import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const user = JSON.parse(sessionStorage.getItem("user"));

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
