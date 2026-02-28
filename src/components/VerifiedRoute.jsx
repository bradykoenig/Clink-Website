import { Navigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";

export default function VerifiedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  // Wait until auth fully initializes
  if (loading) {
    return null;
  }

  // Not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not verified
  if (!currentUser.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
}
