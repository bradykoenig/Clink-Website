import { useNavigate } from "react-router-dom";
import PageLayout from "../layouts/PageLayout";
import PageTransition from "../components/PageTransition";
import "./Services.css";

export default function Services() {
  const navigate = useNavigate();

  const goToCreators = (service) => {
    navigate(`/creators?service=${encodeURIComponent(service)}`);
  };

  return (
    <PageLayout>
      <PageTransition>
        <div className="services-page">
          {/* Header */}
          <div className="services-header">
            <h1 className="services-title">Explore Services</h1>
            <p className="services-subtitle">
              Choose the type of creator you are looking for.
            </p>
          </div>

          {/* Grid */}
          <div className="services-grid">
            {/* Photography */}
            <div className="service-card">
              <img
                src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f"
                alt="Photography"
                className="service-image"
              />
              <div className="service-content">
                <div>
                  <h3 className="service-title-card">Photography</h3>
                  <p className="service-description">
                    Product shots, branding, portraits, and visual storytelling.
                  </p>
                </div>
                <button
                  className="service-btn"
                  onClick={() => goToCreators("Photography")}
                >
                  View Creators
                </button>
              </div>
            </div>

            {/* Videography */}
            <div className="service-card">
              <img
                src="https://images.unsplash.com/photo-1518770660439-4636190af475"
                alt="Videography"
                className="service-image"
              />
              <div className="service-content">
                <div>
                  <h3 className="service-title-card">Videography</h3>
                  <p className="service-description">
                    Commercial videos, reels, edits, and cinematic content.
                  </p>
                </div>
                <button
                  className="service-btn"
                  onClick={() => goToCreators("Videography")}
                >
                  View Creators
                </button>
              </div>
            </div>

            {/* Photo + Video */}
            <div className="service-card">
              <img
                src="https://images.unsplash.com/photo-1492724441997-5dc865305da7"
                alt="Photo and Video"
                className="service-image"
              />
              <div className="service-content">
                <div>
                  <h3 className="service-title-card">Photo + Video</h3>
                  <p className="service-description">
                    Complete visual content packages for modern brands.
                  </p>
                </div>
                <button
                  className="service-btn"
                  onClick={() => goToCreators("Photo + Video")}
                >
                  View Creators
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </PageLayout>
  );
}
