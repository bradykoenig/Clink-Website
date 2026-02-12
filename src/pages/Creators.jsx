import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PageLayout from "../layouts/PageLayout";
import PageTransition from "../components/PageTransition";
import "./Creators.css";

import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../firebase/AuthContext";

/* Distance helper (Haversine formula) */
function getDistanceMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function Creators() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, profile } = useAuth();

  const serviceParam = searchParams.get("service") || "All";

  const [creators, setCreators] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(serviceParam);
  const [maxDistance, setMaxDistance] = useState(50); // miles
  const [loading, setLoading] = useState(true);

  // ✅ MINIMAL FIX: keep a fresh copy of the logged-in user's doc (for location)
  const [freshProfile, setFreshProfile] = useState(null);

  useEffect(() => {
    // if logged out, clear
    if (!currentUser) {
      setFreshProfile(null);
      return;
    }

    // live listener so location updates immediately after ProfileSettings save
    const ref = doc(db, "users", currentUser.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setFreshProfile({ id: snap.id, ...snap.data() });
      }
    });

    return () => unsub();
  }, [currentUser]);

  // ✅ Use freshest profile if available, otherwise fall back to AuthContext profile
  const effectiveProfile = freshProfile || profile;

  /* Sync filter with URL */
  useEffect(() => {
    setSelectedFilter(serviceParam);
  }, [serviceParam]);

  /* Load creators */
  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "creator"));

    const unsub = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setCreators(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  /* Service filter */
  function applyServiceFilter(list) {
    if (selectedFilter === "All") return list;
    if (selectedFilter === "Photo + Video") {
      return list.filter((c) => c.serviceType === "Both");
    }
    return list.filter((c) => c.serviceType === selectedFilter);
  }

  /* Distance + service filtering combined */
  const filteredCreators = useMemo(() => {
    let list = applyServiceFilter(creators);

    // Only apply distance filtering for business users with location
    if (
      effectiveProfile?.role === "business" &&
      effectiveProfile?.location &&
      maxDistance
    ) {
      list = list
        .map((creator) => {
          if (!creator.location) return null;

          const miles = getDistanceMiles(
            effectiveProfile.location.lat,
            effectiveProfile.location.lng,
            creator.location.lat,
            creator.location.lng
          );

          return { ...creator, distanceMiles: miles };
        })
        .filter((c) => c && c.distanceMiles <= maxDistance)
        .sort((a, b) => a.distanceMiles - b.distanceMiles);
    }

    return list;
  }, [creators, selectedFilter, maxDistance, effectiveProfile]);

  function handleFilterClick(filter) {
    setSearchParams(filter === "All" ? {} : { service: filter });
  }

  function handleHireClick(creatorId) {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // keep your original logic (don’t change behavior)
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
                className={`filter-btn ${selectedFilter === f ? "active-filter" : ""}`}
                onClick={() => handleFilterClick(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {/* DISTANCE FILTER (business only) */}
          {effectiveProfile?.role === "business" && effectiveProfile?.location && (
            <div className="distance-filter">
              <label>
                Within <strong>{maxDistance} miles</strong>
              </label>
              <input
                type="range"
                min={5}
                max={200}
                step={5}
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
              />
            </div>
          )}

          {/* CONTENT */}
          {loading ? (
            <p style={{ padding: 20 }}>Loading creators…</p>
          ) : filteredCreators.length === 0 ? (
            <p style={{ padding: 20 }}>
              No creators found for this service and distance.
            </p>
          ) : (
            <div className="creators-grid">
              {filteredCreators.map((creator) => (
                <div key={creator.id} className="creator-card">
                  <div className="creator-image-wrapper">
                    <img
                      src={creator.photo || "/default_user.png"}
                      className="creator-image"
                      alt=""
                      onError={(e) => {
                        e.currentTarget.src = "/default_user.png";
                      }}
                    />
                  </div>

                  <div className="creator-content">
                    <div className="creator-header">
                      <img
                        src={creator.photo || "/default_user.png"}
                        className="creator-avatar"
                        alt=""
                        onError={(e) => {
                          e.currentTarget.src = "/default_user.png";
                        }}
                      />
                      <div>
                        <h3 className="creator-name">
                          {creator.name || "Unnamed Creator"}
                        </h3>
                        <p className="creator-role">
                          {creator.serviceType || "Creator"}
                        </p>

                        {creator.distanceMiles != null && (
                          <p className="creator-distance">
                            📍 {creator.distanceMiles.toFixed(1)} miles away
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="creator-footer">
                      <p className="starting-at">
                        Starting at <span>${creator.price ?? "—"}</span>
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
