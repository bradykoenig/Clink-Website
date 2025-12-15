import "./Services.css";
import { Link } from "react-router-dom";

export default function Services() {
  const services = [
    {
      id: 1,
      title: "Photography",
      description:
        "Professional photography for brands, portraits, products, and events.",
      icon: "📸",
      filter: "Photography",
    },
    {
      id: 2,
      title: "Videography",
      description:
        "High-quality video shoots, edits, reels, and commercial content.",
      icon: "🎥",
      filter: "Videography",
    },
    {
      id: 3,
      title: "Photo + Video",
      description:
        "Creators who offer both photography and videography services.",
      icon: "🎬",
      filter: "Both",
    },
    {
      id: 4,
      title: "Brand Content",
      description:
        "Custom content tailored specifically for your business or product.",
      icon: "🏷️",
      filter: "Brand",
    },
    {
      id: 5,
      title: "Event Coverage",
      description:
        "Capture your event with professional photos and videos.",
      icon: "🎉",
      filter: "Event",
    },
    {
      id: 6,
      title: "Product Shoots",
      description:
        "Detailed product photography and video to elevate your listings.",
      icon: "📦",
      filter: "Product",
    },
  ];

  return (
    <div className="services-container">
      {/* Hero Section */}
      <section className="services-hero">
        <h1>Explore Services</h1>
        <p>Find the perfect service for your business or personal project.</p>
      </section>

      {/* Services Grid */}
      <div className="services-grid">
        {services.map((service) => (
          <div className="service-card" key={service.id}>
            <div className="service-icon">{service.icon}</div>

            <h3>{service.title}</h3>

            <p>{service.description}</p>

            <Link
              to="/creators"
              className="btn service-btn"
            >
              View Creators
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
