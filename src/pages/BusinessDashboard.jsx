import "./BusinessDashboard.css";
import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { useAuth } from "../firebase/AuthContext";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import PageLayout from "../layouts/PageLayout";

function isVideo(url = "") {
  const u = String(url).toLowerCase();
  return (
    u.endsWith(".mp4") ||
    u.endsWith(".mov") ||
    u.endsWith(".webm") ||
    u.includes("video/upload")
  );
}

export default function BusinessDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [creatorMap, setCreatorMap] = useState({});

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "services"),
      where("businessId", "==", currentUser.uid)
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const list = [];
      const creatorIds = new Set();

      snapshot.forEach((docSnap) => {
        const data = { id: docSnap.id, ...docSnap.data() };
        list.push(data);
        if (data.creatorId) creatorIds.add(data.creatorId);
      });

      setServices(list);

      const idsToFetch = [];
      creatorIds.forEach((id) => {
        if (!creatorMap[id]) idsToFetch.push(id);
      });

      if (idsToFetch.length === 0) return;

      for (const creatorId of idsToFetch) {
        try {
          const creatorSnap = await getDoc(doc(db, "users", creatorId));
          if (creatorSnap.exists()) {
            const name = creatorSnap.data().name || "Creator";
            setCreatorMap((prev) => ({
              ...prev,
              [creatorId]: name,
            }));
          }
        } catch (err) {
          console.error("Failed fetching creator:", creatorId, err);
        }
      }
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  return (
    <PageLayout>
      {!currentUser ? (
        <p style={{ padding: 20 }}>
          Please log in to view your dashboard.
        </p>
      ) : (
        <div className="business-dashboard-container">
          <h1>Your Projects</h1>

          {/* 💎 Subtle Platform Fee Disclosure */}
          <div className="platform-fee-card">
            <div className="platform-fee-title">
              Transparent Pricing
            </div>
            <div className="platform-fee-text">
              Clink applies a <strong>12% platform fee</strong> to
              each completed project. This supports secure payments,
              creator protection, and platform infrastructure.
            </div>
          </div>

          {services.length === 0 && (
            <p className="empty-text">
              You have no active or past projects yet.
            </p>
          )}

          <div className="service-list">
            {services.map((service) => {
              const firstMedia =
                service.media?.length ? service.media[0] : null;

              return (
                <div
                  key={service.id}
                  className="service-card"
                  onClick={() =>
                    navigate(`/service/${service.id}`)
                  }
                >
                  <div className="service-info-section">
                    <h3>
                      Project with{" "}
                      {creatorMap[service.creatorId] ||
                        "Loading..."}
                    </h3>

                    <p>
                      <strong>Status:</strong>{" "}
                      <span className={`status-badge ${service.status}`}>
                        {service.status}
                      </span>
                    </p>


                    <p>
                      <strong>Price:</strong> $
                      {service.price}
                    </p>

                    <p>
                      <strong>Created:</strong>{" "}
                      {service.createdAt
                        ? service.createdAt.toDate
                          ? service.createdAt.toDate().toLocaleDateString()
                          : new Date(service.createdAt).toLocaleDateString()
                        : "—"}
                    </p>

                  </div>

                  <div className="service-thumbnail">
                    {firstMedia ? (
                      isVideo(firstMedia) ? (
                        <video
                          src={firstMedia}
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={firstMedia}
                          alt="thumbnail"
                        />
                      )
                    ) : (
                      <div className="placeholder-thumb">
                        No media yet
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PageLayout>
  );
}
