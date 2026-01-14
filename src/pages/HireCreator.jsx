import "./HireCreator.css";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions, db } from "../firebase/firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "../firebase/AuthContext";
import PageLayout from "../layouts/PageLayout";

export default function HireCreator() {
  const { creatorId } = useParams();
  const { currentUser } = useAuth();
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ref = doc(db, "users", creatorId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setCreator({ id: snap.id, ...snap.data() });
    });
    return () => unsub();
  }, [creatorId]);

  if (!creator)
    return (
      <PageLayout>
        <p style={{ padding: 20 }}>Loading creator...</p>
      </PageLayout>
    );

  return (
    <PageLayout>
      <div className="hire-container">
        {/* unchanged content */}
      </div>
    </PageLayout>
  );
}
