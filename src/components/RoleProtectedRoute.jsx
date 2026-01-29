import { Navigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";

export default function RoleProtectedRoute({ allowedRole, children }) {
  const { currentUser, profile, loading } = useAuth();

  if (loading) return null;

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
