import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PageLayout from "../layouts/PageLayout";
import PageTransition from "../components/PageTransition";
import "./Creators.css";

import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../firebase/AuthContext";

export default function Creators() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, profile } = useAuth();

  const serviceParam = searchParams.get("service") || "All";

  const [creators, setCreators] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(serviceParam);
  const [loading, setLoading] = useState(true);

  // Keep state in sync with URL
  useEffect(() => {
    setSelectedFilter(serviceParam);
  }, [serviceParam]);

  // Load creators
  useEffect(() => {
    const q = query(
      collection(db, "users"),
      where("role", "==", "creator")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) =>
        list.push({ id: doc.id, ...doc.data() })
      );
      setCreators(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Apply filter
  function applyFilter(list) {
    if (selectedFilter === "All") return list;
    if (selectedFilter === "Photo + Video") {
      return list.filter((c) => c.serviceType === "Both");
    }
    return list.filter((c) => c.serviceType === selectedFilter);
  }

  const filteredCreators = applyFilter(creators);

  function handleFilterClick(filter) {
    setSearchParams(
      filter === "All" ? {} : { service: filter }
    );
  }

  function handleHireClick(creatorId) {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (profile?.role !== "business") {
      alert("Only business accounts can hire creators.");
      return;
    }

    navigate(`/hire/${creatorId}`);
  }

  return (
    <PageLayout>
      <PageTransition>
        <div className="creators-page">
          <h1 className="creators-title">Browse Top Creators</h1>
          <p className="creators-subtitle">
            Hire professional creators for your next project.
          </p>

          {/* FILTER BAR */}
          <div className="filter-bar">
            {["All", "Photography", "Videography", "Photo + Video"].map((f) => (
              <button
                key={f}
                className={`filter-btn ${
                  selectedFilter === f ? "active-filter" : ""
                }`}
                onClick={() => handleFilterClick(f)}
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
                  <div className="creator-image-wrapper">
                    <img
                      src={creator.photo || "/default_user.png"}
                      className="creator-image"
                      alt={creator.name}
                    />
                  </div>

                  <div className="creator-content">
                    <div className="creator-header">
                      <img
                        src={creator.photo || "/default_user.png"}
                        className="creator-avatar"
                        alt={creator.name}
                      />
                      <div>
                        <h3 className="creator-name">
                          {creator.name || "Unnamed Creator"}
                        </h3>
                        <p className="creator-role">
                          {creator.serviceType || "Creator"}
                        </p>
                      </div>
                    </div>

                    <div className="creator-footer">
                      <p className="starting-at">
                        Starting at{" "}
                        <span>${creator.price ?? "—"}</span>
                      </p>

                      <button
                        className="view-btn"
                        onClick={() => handleHireClick(creator.id)}
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
      </PageTransition>
    </PageLayout>
  );
}
