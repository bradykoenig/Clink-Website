import "./CreatorDashboard.css";
import { useEffect, useState, useMemo } from "react";
import { db, functions } from "../firebase/firebase";
import { useAuth } from "../firebase/AuthContext";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { useNavigate } from "react-router-dom";
import PageLayout from "../layouts/PageLayout";

function formatMoney(n) {
  return Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function CreatorDashboard() {
  const { currentUser, profile } = useAuth();
  const navigate = useNavigate();

  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [businessMap, setBusinessMap] = useState({});
  const [stripeLoading, setStripeLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "services"),
      where("creatorId", "==", currentUser.uid)
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const p = [];
      const a = [];
      const c = [];
      const businessIds = new Set();

      snapshot.forEach((docSnap) => {
        const data = { id: docSnap.id, ...docSnap.data() };
        if (data.businessId) businessIds.add(data.businessId);

        if (data.status === "pending") p.push(data);
        else if (["in_progress", "awaiting_approval"].includes(data.status))
          a.push(data);
        else c.push(data);
      });

      setPending(p);
      setActive(a);
      setCompleted(c);

      const newMap = { ...businessMap };

      for (const businessId of businessIds) {
        if (!newMap[businessId]) {
          const snap = await getDoc(doc(db, "users", businessId));
          if (snap.exists()) {
            newMap[businessId] =
              snap.data().name || "Business";
          }
        }
      }

      setBusinessMap(newMap);
    });

    return () => unsub();
  }, [currentUser]);

  async function connectStripe() {
    try {
      setStripeLoading(true);

      const createLink = httpsCallable(
        functions,
        "createStripeAccountLink"
      );

      const res = await createLink();

      window.location.href = res.data.url;
    } catch (err) {
      alert("Stripe connection failed.");
      setStripeLoading(false);
    }
  }

  function JobCard({ job, cardClass }) {
    const earnings = job.price * 0.88;

    return (
      <div
        className={`job-card ${cardClass}`}
        onClick={() => navigate(`/service/${job.id}`)}
      >
        <h3>
          Project with {businessMap[job.businessId] || "Loading..."}
        </h3>

        <p><strong>Status:</strong> {job.status}</p>
        <p><strong>Project Price:</strong> ${formatMoney(job.price)}</p>

        <p className="creator-earnings">
          You Earn: ${formatMoney(earnings)}
        </p>
      </div>
    );
  }

  const totalEarnings = useMemo(() => {
    return completed.reduce(
      (sum, job) => sum + job.price * 0.88,
      0
    );
  }, [completed]);

  return (
    <PageLayout>
      {!currentUser ? (
        <p style={{ padding: 20 }}>
          Please log in to access your dashboard.
        </p>
      ) : (
        <div className="creator-dashboard-container">
          <div className="dashboard-panel">

            {/* ================= HEADER ================= */}
            <div className="dashboard-header">
              <div className="dashboard-title">
                <h1>Your Jobs</h1>
                <div className="dashboard-sub">
                  Track your projects and earnings
                </div>
              </div>
            </div>

            {/* ================= EARNINGS BANNER ================= */}
            <div className="earnings-summary">
              <div className="earnings-card">

                <div className="earnings-main">
                  <div className="earnings-label">Total Earned</div>
                  <div className="earnings-amount">
                    ${formatMoney(totalEarnings)}
                  </div>
                  <div className="earnings-note">
                    After 12% platform fee
                  </div>
                </div>

                <div className="earnings-stats-row">
                  <div className="earnings-stat">
                    <div className="stat-small-label">Pending</div>
                    <div className="stat-small-value">{pending.length}</div>
                  </div>

                  <div className="earnings-stat">
                    <div className="stat-small-label">Active</div>
                    <div className="stat-small-value">{active.length}</div>
                  </div>

                  <div className="earnings-stat">
                    <div className="stat-small-label">Completed</div>
                    <div className="stat-small-value">{completed.length}</div>
                  </div>
                </div>

              </div>
            </div>

            {/* ================= STRIPE WARNING ================= */}
            {!profile?.stripeAccountId && (
              <div className="stripe-warning">
                <h3>Connect Stripe to Get Paid</h3>
                <p>
                  Securely connect your Stripe account to start receiving payouts
                  from completed projects.
                </p>
                <button
                  className="connect-stripe-btn"
                  onClick={connectStripe}
                  disabled={stripeLoading}
                >
                  {stripeLoading ? "Redirecting..." : "Connect Stripe"}
                </button>
              </div>
            )}

            {/* ================= PENDING ================= */}
            <section>
              <h2>Pending Requests</h2>
              <div className="job-list">
                {pending.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📥</div>
                    No pending requests yet.
                  </div>
                ) : (
                  pending.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      cardClass="pending-card"
                    />
                  ))
                )}
              </div>
            </section>

            {/* ================= ACTIVE ================= */}
            <section>
              <h2>Active Jobs</h2>
              <div className="job-list">
                {active.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🚀</div>
                    No active jobs right now.
                  </div>
                ) : (
                  active.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      cardClass="active-card"
                    />
                  ))
                )}
              </div>
            </section>

            {/* ================= COMPLETED ================= */}
            <section>
              <h2>Completed Jobs</h2>
              <div className="job-list">
                {completed.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🏁</div>
                    You haven’t completed any jobs yet.
                  </div>
                ) : (
                  completed.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      cardClass="completed-card"
                    />
                  ))
                )}
              </div>
            </section>

          </div>
        </div>
      )}
    </PageLayout>
  );
}
