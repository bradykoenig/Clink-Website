import { HashRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Home from "./pages/Home";
import Creators from "./pages/Creators";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import CreatorProfile from "./pages/CreatorProfile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreatorDashboard from "./pages/CreatorDashboard";
import BusinessDashboard from "./pages/BusinessDashboard";
import ProfileSettings from "./pages/ProfileSettings";
import HireCreator from "./pages/HireCreator";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

import "./App.css";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Business-only */}
        <Route
          path="/creators"
          element={
            <RoleProtectedRoute allowedRole="business">
              <Creators />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/hire/:creatorId"
          element={
            <RoleProtectedRoute allowedRole="business">
              <HireCreator />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/business-dashboard"
          element={
            <RoleProtectedRoute allowedRole="business">
              <BusinessDashboard />
            </RoleProtectedRoute>
          }
        />

        {/* Creator-only */}
        <Route
          path="/creator-dashboard"
          element={
            <RoleProtectedRoute allowedRole="creator">
              <CreatorDashboard />
            </RoleProtectedRoute>
          }
        />

        {/* Any logged-in user */}
        <Route
          path="/profile-settings"
          element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          }
        />

        {/* Payments */}
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancel" element={<PaymentCancel />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <main className="main-content">
          <AnimatedRoutes />
        </main>
      </div>
    </Router>
  );
}
