// src/pages/CreatorDashboard.jsx
import "./CreatorDashboard.css";
import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { useAuth } from "../firebase/AuthContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import PageLayout from "../layouts/PageLayout";

export default function CreatorDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "services"),
      where("creatorId", "==", currentUser.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const p = [];
      const a = [];
      const c = [];

      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };

        if (data.status === "pending") p.push(data);
        else if (
          ["in_progress", "awaiting_approval"].includes(data.status)
        )
          a.push(data);
        else c.push(data);
      });

      setPending(p);
      setActive(a);
      setCompleted(c);
    });

    return () => unsub();
  }, [currentUser]);

  return (
    <PageLayout>
      {!currentUser ? (
        <p style={{ padding: 20 }}>
          Please log in to access your dashboard.
        </p>
      ) : (
        <div className="creator-dashboard-container">
          <h1>Your Jobs</h1>

          <section>
            <h2>Pending Requests</h2>
            {pending.length === 0 && (
              <p className="empty-text">
                No pending requests.
              </p>
            )}
            <div className="job-list">
              {pending.map((job) => (
                <div
                  key={job.id}
                  className="job-card pending-card"
                  onClick={() =>
                    navigate(`/service/${job.id}`)
                  }
                >
                  <h3>Project from {job.businessId}</h3>
                  <p>Status: {job.status}</p>
                  <p>Price: ${job.price}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2>Active Jobs</h2>
            {active.length === 0 && (
              <p className="empty-text">
                No active jobs right now.
              </p>
            )}
            <div className="job-list">
              {active.map((job) => (
                <div
                  key={job.id}
                  className="job-card active-card"
                  onClick={() =>
                    navigate(`/service/${job.id}`)
                  }
                >
                  <h3>Project with {job.businessId}</h3>
                  <p>Status: {job.status}</p>
                  <p>Price: ${job.price}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2>Completed Jobs</h2>
            {completed.length === 0 && (
              <p className="empty-text">
                No completed jobs yet.
              </p>
            )}
            <div className="job-list">
              {completed.map((job) => (
                <div
                  key={job.id}
                  className="job-card completed-card"
                  onClick={() =>
                    navigate(`/service/${job.id}`)
                  }
                >
                  <h3>Project with {job.businessId}</h3>
                  <p>Status: {job.status}</p>
                  <p>Price: ${job.price}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </PageLayout>
  );
}
