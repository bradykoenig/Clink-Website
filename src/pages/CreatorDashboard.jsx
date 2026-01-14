import "./CreatorDashboard.css";
import { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
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
      const p = [], a = [], c = [];

      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        if (data.status === "pending") p.push(data);
        else if (["in_progress", "awaiting_approval"].includes(data.status))
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
        <p style={{ padding: 20 }}>Please log in to access your dashboard.</p>
      ) : (
        <div className="creator-dashboard-container">
          <h1>Your Jobs</h1>

          {/* sections unchanged */}
        </div>
      )}
    </PageLayout>
  );
}
