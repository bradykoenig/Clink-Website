import "./CreatorProfile.css";
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import PageLayout from "../layouts/PageLayout";

export default function CreatorProfile() {
  const { id } = useParams();
  const [creator, setCreator] = useState(null);
  const [reviewsEnriched, setReviewsEnriched] = useState([]);

  useEffect(() => {
    const ref = doc(db, "users", id);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setCreator({ id: snap.id, ...snap.data() });
    });
    return () => unsub();
  }, [id]);

  if (!creator)
    return (
      <PageLayout>
        <p style={{ padding: 20 }}>Loading creator profile...</p>
      </PageLayout>
    );

  return (
    <PageLayout>
      <div className="creator-profile-container">
        {/* unchanged content */}
      </div>
    </PageLayout>
  );
}
