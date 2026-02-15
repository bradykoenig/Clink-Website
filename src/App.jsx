import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import FloatingBackground from "./components/FloatingBackground";

import Home from "./pages/Home";
import Creators from "./pages/Creators";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import CreatorProfile from "./pages/CreatorProfile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import CreatorDashboard from "./pages/CreatorDashboard";
import BusinessDashboard from "./pages/BusinessDashboard";
import ProfileSettings from "./pages/ProfileSettings";
import HireCreator from "./pages/HireCreator";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResendVerification from "./pages/ResendVerification";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import VerifiedRoute from "./components/VerifiedRoute";

import "./App.css";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/resend-verification" element={<ResendVerification />} />

        <Route
          path="/creators"
          element={
            <VerifiedRoute>
              <RoleProtectedRoute allowedRole="business">
                <Creators />
              </RoleProtectedRoute>
            </VerifiedRoute>
          }
        />

        <Route
          path="/hire/:creatorId"
          element={
            <VerifiedRoute>
              <RoleProtectedRoute allowedRole="business">
                <HireCreator />
              </RoleProtectedRoute>
            </VerifiedRoute>
          }
        />

        <Route
          path="/business-dashboard"
          element={
            <VerifiedRoute>
              <RoleProtectedRoute allowedRole="business">
                <BusinessDashboard />
              </RoleProtectedRoute>
            </VerifiedRoute>
          }
        />

        <Route
          path="/creator-dashboard"
          element={
            <VerifiedRoute>
              <RoleProtectedRoute allowedRole="creator">
                <CreatorDashboard />
              </RoleProtectedRoute>
            </VerifiedRoute>
          }
        />

        <Route
          path="/profile-settings"
          element={
            <VerifiedRoute>
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            </VerifiedRoute>
          }
        />

        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancel" element={<PaymentCancel />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <FloatingBackground /> {/* Render ONCE globally */}

      <div className="app-container">
        <main className="main-content">
          <AnimatedRoutes />
        </main>
      </div>
    </Router>
  );
}
