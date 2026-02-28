import "./Home.css";
import PageLayout from "../layouts/PageLayout";
import { Link } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";

export default function Home() {
  const { currentUser, profile, loading, isCreator, isBusiness } = useAuth();

  if (loading) {
    return null; // wait for auth to resolve
  }

  return (
    <PageLayout>
      <div className="home-container">
        <section className="hero subtle-hero-bg">
          <h1 className="hero-title">
            Hire Professional Creators.<br />
            Fast, Reliable, Hassle-Free.
          </h1>

          <p className="hero-subtitle">
            Clink connects businesses with skilled videographers and photographers
            offering transparent pricing, quick turnaround, and high-quality work.
          </p>

          <div className="hero-buttons">

            {/* NOT LOGGED IN */}
            {!currentUser && (
              <>
                <Link to="/register" className="hero-btn primary">
                  Get Started
                </Link>
                <Link to="/login" className="hero-btn secondary">
                  Login
                </Link>
              </>
            )}

            {/* BUSINESS VIEW */}
            {currentUser && isBusiness && (
              <>
                <Link to="/creators" className="hero-btn primary">
                  Find Creators
                </Link>
                <Link to="/services" className="hero-btn secondary">
                  Explore Services
                </Link>
              </>
            )}

            {/* CREATOR VIEW */}
            {currentUser && isCreator && (
              <Link to="/creator-dashboard" className="hero-btn primary">
                Go to Dashboard
              </Link>
            )}

          </div>
        </section>
      </div>
    </PageLayout>
  );
}
