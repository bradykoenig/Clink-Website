// src/pages/BusinessDashboard.jsx
import "./BusinessDashboard.css";
import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { useAuth } from "../firebase/AuthContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import PageLayout from "../layouts/PageLayout";

export default function BusinessDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "services"),
      where("businessId", "==", currentUser.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) =>
        list.push({ id: doc.id, ...doc.data() })
      );
      setServices(list);
    });

    return () => unsub();
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

          {services.length === 0 && (
            <p className="empty-text">
              You have no active or past projects yet.
            </p>
          )}

          <div className="service-list">
            {services.map((service) => (
              <div
                key={service.id}
                className="service-card"
                onClick={() => navigate(`/service/${service.id}`)}
              >
                <div className="service-info-section">
                  <h3>Project with {service.creatorId}</h3>
                  <p>
                    <strong>Status:</strong> {service.status}
                  </p>
                  <p>
                    <strong>Price:</strong> ${service.price}
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {service.createdAt
                      ? new Date(service.createdAt).toLocaleDateString()
                      : "—"}
                  </p>
                </div>

                <div className="service-thumbnail">
                  {service.media?.length ? (
                    service.media[0].endsWith(".mp4") ? (
                      <video src={service.media[0]} muted />
                    ) : (
                      <img
                        src={service.media[0]}
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
            ))}
          </div>
        </div>
      )}
    </PageLayout>
  );
}
