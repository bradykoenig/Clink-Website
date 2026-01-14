import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PageLayout from "../layouts/PageLayout";
import "./Creators.css";

export default function Creators() {
  const [searchParams] = useSearchParams();
  const serviceParam = searchParams.get("service") || "All";

  const creators = [
    {
      id: 1,
      name: "John Carter",
      role: "Professional Photographer & Editor",
      rating: 4.9,
      reviews: 152,
      startingAt: 120,
      tags: ["Photography", "Editing"],
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
      badge: null,
    },
    {
      id: 2,
      name: "Sarah Mitchell",
      role: "Cinematic Videographer",
      rating: 5.0,
      reviews: 201,
      startingAt: 250,
      tags: ["Videography", "Color Grading"],
      image: "https://images.unsplash.com/photo-1548142813-c348350df52b",
      avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
      badge: null,
    },
    {
      id: 3,
      name: "Marcus Lee",
      role: "Content Creator (Photo + Video)",
      rating: 4.8,
      reviews: 89,
      startingAt: 180,
      tags: ["Photography", "Videography"],
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
      badge: null,
    },
  ];

  // ⭐ Assign badges (Fiverr-style logic)
  function assignBadges(list) {
    const sorted = [...list].sort((a, b) => b.rating - a.rating);
    const topCreator = sorted[0];

    return list.map((c) => {
      if (c.id === topCreator.id) return { ...c, badge: "Top Rated" };
      if (c.rating === 5 && c.reviews < 100)
        return { ...c, badge: "Rising Talent" };
      return { ...c, badge: null };
    });
  }

  const creatorsWithBadges = assignBadges(creators);

  // ⭐ Filter state (auto-selected from URL)
  const [selectedFilter, setSelectedFilter] = useState(serviceParam);

  // 🔄 Sync filter when URL param changes
  useEffect(() => {
    setSelectedFilter(serviceParam);
  }, [serviceParam]);

  // ⭐ Apply filter rules
  function applyFilter(list) {
    if (selectedFilter === "All") return list;

    if (selectedFilter === "Photography")
      return list.filter((c) => c.tags.includes("Photography"));

    if (selectedFilter === "Videography")
      return list.filter((c) => c.tags.includes("Videography"));

    if (selectedFilter === "Both")
      return list.filter(
        (c) =>
          c.tags.includes("Photography") &&
          c.tags.includes("Videography")
      );

    return list;
  }

  const filteredCreators = applyFilter(creatorsWithBadges);

  return (
    <PageLayout>
      <div className="creators-page">
        {/* HEADER */}
        <h1 className="creators-title">Browse Top Creators</h1>
        <p className="creators-subtitle">
          Hire skilled photographers and videographers offering high-quality
          work with transparent pricing.
        </p>

        {/* FILTER BAR */}
        <div className="filter-bar">
          {["All", "Photography", "Videography", "Both"].map((f) => (
            <button
              key={f}
              className={`filter-btn ${
                selectedFilter === f ? "active-filter" : ""
              }`}
              onClick={() => setSelectedFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* CREATORS GRID */}
        <div className="creators-grid">
          {filteredCreators.map((creator) => (
            <div key={creator.id} className="creator-card">
              {/* IMAGE */}
              <div className="creator-image-wrapper">
                <img
                  src={creator.image}
                  className="creator-image"
                  alt={creator.name}
                />
                {creator.badge && (
                  <span className="creator-badge">
                    {creator.badge}
                  </span>
                )}
              </div>

              {/* CONTENT */}
              <div className="creator-content">
                <div className="creator-header">
                  <img
                    src={creator.avatar}
                    className="creator-avatar"
                    alt={creator.name}
                  />
                  <div>
                    <h3 className="creator-name">{creator.name}</h3>
                    <p className="creator-role">{creator.role}</p>
                  </div>
                </div>

                <div className="creator-rating">
                  ⭐ {creator.rating}{" "}
                  <span className="rating-count">
                    ({creator.reviews})
                  </span>
                </div>

                <div className="creator-tags">
                  {creator.tags.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="creator-footer">
                  <p className="starting-at">
                    Starting at <span>${creator.startingAt}</span>
                  </p>
                  <button className="view-btn">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
