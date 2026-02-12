import { Navigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";

export default function VerifiedRoute({ children }) {
  const { currentUser } = useAuth();

  // Not logged in → login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but NOT verified → verify email
  if (!currentUser.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
}
