import "./HireCreator.css";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions, db } from "../firebase/firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "../firebase/AuthContext";

export default function HireCreator() {
  const { creatorId } = useParams();
  const { currentUser } = useAuth();

  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load creator from Firestore
  useEffect(() => {
    const ref = doc(db, "users", creatorId);

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setCreator({ id: snap.id, ...snap.data() });
      }
    });

    return () => unsub();
  }, [creatorId]);

  if (!creator)
    return <p style={{ padding: 20 }}>Loading creator...</p>;

  // SAFETY CHECKS
  if (!creator.price) {
    return <p className="error-text">This creator has not set a project price yet.</p>;
  }

  if (!creator.stripeVerified) {
    return <p className="error-text">This creator is not ready to accept payments yet.</p>;
  }

  if (!creator.portfolio || creator.portfolio.length === 0) {
    return <p className="error-text">This creator must upload portfolio samples before being hired.</p>;
  }

  const handlePayment = async () => {
    if (!currentUser) {
      alert("You must be logged in as a business to hire.");
      return;
    }

    if (!creator.stripeAccountId) {
      alert("This creator is not ready to accept payments yet.");
      return;
    }

    setLoading(true);

    try {
      const createSession = httpsCallable(functions, "createCheckoutSession");

      const res = await createSession({
        creatorId: creator.id,
        creatorStripeAccountId: creator.stripeAccountId,
        price: creator.price,
        businessId: currentUser.uid,
      });

      window.location.href = res.data.sessionUrl;

    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="hire-container">
      <h1>Hire {creator.name}</h1>

      <div className="hire-card">

        <img
          src={creator.photo || "/default_user.png"}
          alt={creator.name}
          className="hire-photo"
        />

        <div className="hire-info">
          <h2>{creator.name}</h2>
          <p className="hire-service">{creator.serviceType}</p>

          <div className="hire-price-row">
            <p>Project Price:</p>
            <span className="hire-price">${creator.price}</span>
          </div>

          <button
            className="hire-btn"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? "Processing..." : "Proceed to Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
