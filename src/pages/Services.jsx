import PageLayout from "../layouts/PageLayout";
import "./Services.css";

export default function Services() {
  const services = [
    {
      name: "Photography",
      desc: "Product shoots, portraits, branding.",
      image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f",
      filter: "Photography",
    },
    {
      name: "Videography",
      desc: "Commercial videos, reels, edits.",
      image: "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
      filter: "Videography",
    },
    {
      name: "Photo + Video",
      desc: "Creators offering full photo & video packages.",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
      filter: "Both",
    },
    {
      name: "Brand Content",
      desc: "Custom brand-focused visuals.",
      image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36",
      filter: "Photography",
    },
    {
      name: "Event Coverage",
      desc: "Professional event photography & videography.",
      image: "https://images.unsplash.com/photo-1503428593586-e225b39bddfe",
      filter: "Both",
    },
    {
      name: "Product Shoots",
      desc: "High-quality visuals for online listings.",
      image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
      filter: "Photography",
    },
  ];

  return (
    <PageLayout>
      <div className="services-page">
        <h1 className="services-title">Explore Services</h1>
        <p className="services-subtitle">
          Browse service categories and find creators that match your business needs.
        </p>

        <div className="services-grid">
          {services.map((service) => (
            <div className="service-card" key={service.name}>
              <div className="service-image-wrapper">
                <img src={service.image} alt={service.name} />
                <div className="image-overlay" />
                <h3 className="service-name">{service.name}</h3>
              </div>

              <div className="service-content">
                <p className="service-desc">{service.desc}</p>

                <a
                  href={`/creators?service=${encodeURIComponent(service.filter)}`}
                  className="service-btn"
                >
                  View Creators
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
