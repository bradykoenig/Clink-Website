import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PageLayout from "../layouts/PageLayout";
import "./Creators.css";

import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";

export default function Creators() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const serviceParam = searchParams.get("service") || "All";

  const [creators, setCreators] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(serviceParam);
  const [loading, setLoading] = useState(true);

  // 🔄 Sync filter with URL param
  useEffect(() => {
    setSelectedFilter(serviceParam);
  }, [serviceParam]);

  // 🔥 Load real creators from Firestore
  useEffect(() => {
    const q = query(
      collection(db, "users"),
      where("role", "==", "creator")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setCreators(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // ⭐ Apply service filter
  function applyFilter(list) {
    if (selectedFilter === "All") return list;

    if (selectedFilter === "Photography")
      return list.filter((c) => c.serviceType === "Photography");

    if (selectedFilter === "Videography")
      return list.filter((c) => c.serviceType === "Videography");

    if (selectedFilter === "Both")
      return list.filter((c) => c.serviceType === "Both");

    return list;
  }

  const filteredCreators = applyFilter(creators);

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

        {/* CONTENT */}
        {loading ? (
          <p style={{ padding: 20 }}>Loading creators…</p>
        ) : filteredCreators.length === 0 ? (
          <p style={{ padding: 20 }}>
            No creators found for this service.
          </p>
        ) : (
          <div className="creators-grid">
            {filteredCreators.map((creator) => (
              <div key={creator.id} className="creator-card">
                {/* IMAGE */}
                <div className="creator-image-wrapper">
                  <img
                    src={
                      creator.photo ||
                      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"
                    }
                    className="creator-image"
                    alt={creator.name}
                  />
                </div>

                {/* CONTENT */}
                <div className="creator-content">
                  <div className="creator-header">
                    <img
                      src={
                        creator.photo ||
                        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d"
                      }
                      className="creator-avatar"
                      alt={creator.name}
                    />
                    <div>
                      <h3 className="creator-name">
                        {creator.name || "Unnamed Creator"}
                      </h3>
                      <p className="creator-role">
                        {creator.serviceType || "Content Creator"}
                      </p>
                    </div>
                  </div>

                  <div className="creator-tags">
                    {creator.serviceType && (
                      <span className="tag">{creator.serviceType}</span>
                    )}
                  </div>

                  <div className="creator-footer">
                    <p className="starting-at">
                      Starting at{" "}
                      <span>${creator.price || "—"}</span>
                    </p>
                    <button
                      className="view-btn"
                      onClick={() =>
                        navigate(`/hire/${creator.id}`)
                      }
                    >
                      Hire Creator
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
