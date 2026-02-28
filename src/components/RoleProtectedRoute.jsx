import { Navigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";

export default function RoleProtectedRoute({ allowedRole, children }) {
  const { currentUser, profile, loading } = useAuth();

  if (loading) {
    return null; // wait until auth fully loads
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!profile || profile.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
