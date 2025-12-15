import "./Home.css";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home-container">

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Connecting Businesses with Top Content Creators</h1>
          <p>
            Clink helps businesses find talented videographers and photographers
            quickly — with same-day turnaround options and guaranteed quality.
          </p>

          <div className="hero-buttons">
            <Link to="/creators" className="btn primary">
              Find Creators
            </Link>
            <Link to="/services" className="btn secondary">
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose Clink?</h2>

        <div className="features-grid">
          <div className="feature-card">
            <h3>Fast Turnaround</h3>
            <p>Creators offer same-day delivery for urgent business needs.</p>
          </div>

          <div className="feature-card">
            <h3>Verified Creators</h3>
            <p>All creators are vetted for portfolio quality and reliability.</p>
          </div>

          <div className="feature-card">
            <h3>Clear Pricing</h3>
            <p>Simple, transparent project pricing with no hidden fees.</p>
          </div>

          <div className="feature-card">
            <h3>Secure Payments</h3>
            <p>Stripe-powered checkout ensures safe and fast transactions.</p>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="cta-final">
        <h2>Start Your Project Today</h2>
        <p>Find the perfect creator for your business in just a few clicks.</p>

        <Link to="/creators" className="btn primary large">
          Browse Creators
        </Link>
      </section>

    </div>
  );
}
