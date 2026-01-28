// src/pages/HireCreator.jsx
import "./HireCreator.css";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions, db } from "../firebase/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "../firebase/AuthContext";
import PageLayout from "../layouts/PageLayout";

export default function HireCreator() {
  const { creatorId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load creator profile
  useEffect(() => {
    if (!creatorId) return;

    const ref = doc(db, "users", creatorId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setCreator({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });

    return () => unsub();
  }, [creatorId]);

  // Start Stripe checkout
  async function handleHire() {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      const createCheckoutSession = httpsCallable(
        functions,
        "createCheckoutSession"
      );

      const res = await createCheckoutSession({
        creatorId,
        price: creator.price,
      });

      window.location.href = res.data.url;
    } catch (err) {
      console.error(err);
      alert("Failed to start checkout.");
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <p style={{ padding: 20 }}>Loading creator…</p>
      </PageLayout>
    );
  }

  if (!creator) {
    return (
      <PageLayout>
        <p style={{ padding: 20 }}>Creator not found.</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="hire-container">
        <h1>Hire {creator.name}</h1>

        <p className="hire-role">{creator.serviceType}</p>
        <p className="hire-bio">{creator.bio}</p>

        <div className="hire-price">
          <span>Project Price</span>
          <strong>${creator.price}</strong>
        </div>

        <button className="hire-btn" onClick={handleHire}>
          Continue to Payment
        </button>
      </div>
    </PageLayout>
  );
}
