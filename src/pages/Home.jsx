import "./Home.css";
import PageLayout from "../layouts/PageLayout";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <PageLayout>
      <div className="home-container">
        {/* HERO */}
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
            <Link to="/creators" className="hero-btn primary">
              Find Creators
            </Link>

            <Link to="/services" className="hero-btn secondary">
              Explore Services
            </Link>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
