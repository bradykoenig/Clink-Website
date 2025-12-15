import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Creators from "./pages/Creators";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import CreatorProfile from "./pages/CreatorProfile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./App.css";
import CreatorDashboard from "./pages/CreatorDashboard";
import BusinessDashboard from "./pages/BusinessDashboard";
import CreatorDashboard from "./pages/CreatorDashboard";
import ProfileSettings from "./pages/ProfileSettings";
import HireCreator from "./pages/HireCreator";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import NotFound from "./pages/NotFound.jsx";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/creators" element={<Creators />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/creator/:id" element={<CreatorProfile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<CreatorDashboard />} />
            <Route path="/business-dashboard" element={<BusinessDashboard />} />
            <Route path="/creator-dashboard" element={<CreatorDashboard />} />
            <Route path="/profile-settings" element={<ProfileSettings />} />
            <Route path="/hire/:creatorId" element={<HireCreator />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-cancel" element={<PaymentCancel />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
