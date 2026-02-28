import "./HireCreator.css";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions, db } from "../firebase/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { useAuth } from "../firebase/AuthContext";
import PageLayout from "../layouts/PageLayout";

function isVideo(url = "") {
  const u = String(url).toLowerCase();
  return (
    u.endsWith(".mp4") ||
    u.endsWith(".mov") ||
    u.endsWith(".webm") ||
    u.includes("/video/upload")
  );
}

function formatServiceType(type) {
  if (type === "Both") return "Photo + Video";
  return type || "—";
}

function formatMoney(n) {
  const num = Number(n || 0);
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function HireCreator() {
  const { creatorId } = useParams();
  const navigate = useNavigate();
  const { currentUser, profile } = useAuth();

  const [creator, setCreator] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!currentUser) navigate("/login");
    if (profile && profile.role !== "business") navigate("/");
  }, [currentUser, profile, navigate]);

  // Load creator
  useEffect(() => {
    async function loadCreator() {
      const snap = await getDoc(doc(db, "users", creatorId));
      if (snap.exists()) setCreator({ id: snap.id, ...snap.data() });
      setLoading(false);
    }
    loadCreator();
  }, [creatorId]);

  // Load reviews
  useEffect(() => {
    const q = query(
      collection(db, "users", creatorId, "reviews"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setReviews(list);
    });

    return () => unsub();
  }, [creatorId]);

  // Load portfolio
  useEffect(() => {
    const q = query(
      collection(db, "users", creatorId, "portfolio"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setPortfolio(list);
    });

    return () => unsub();
  }, [creatorId]);

  async function handleHire() {
    try {
      setProcessing(true);

      const createCheckoutSession = httpsCallable(
        functions,
        "createCheckoutSession"
      );

      const res = await createCheckoutSession({ creatorId });

      if (!res.data?.url)
        throw new Error("Checkout URL not returned.");

      window.location.href = res.data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      alert(err?.message || "Payment failed.");
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <p style={{ padding: 20 }}>Loading creator...</p>
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

  const rating = Number(creator.rating || 0);
  const reviewCount = Number(creator.reviewCount || 0);

  return (
    <PageLayout>
      <div className="hire-container">
        <h1 className="hire-title">Hire {creator.name}</h1>

        <div className="hire-meta">
          <div className="hire-pill">
            <span>Service:</span>
            <strong>{formatServiceType(creator.serviceType)}</strong>
          </div>

          <div className="hire-pill">
            ⭐ {rating.toFixed(1)} ({reviewCount})
          </div>
        </div>

        {creator.bio && (
          <p className="hire-bio">{creator.bio}</p>
        )}

        {/* Payment Box */}
        <div className="price-box">
          <div className="price-box-title">
            Project Price
          </div>

          <div className="price-row total">
            <strong>
              ${formatMoney(creator.price)}
            </strong>
          </div>

          <div className="price-note">
            Secure payment powered by Stripe.
            Clink retains a 12% platform fee
            from creator earnings.
          </div>
        </div>

        <button
          className="hire-btn"
          onClick={handleHire}
          disabled={processing}
        >
          {processing
            ? "Redirecting..."
            : "Continue to Payment"}
        </button>

        {/* PORTFOLIO SECTION */}
        <h2 className="hire-section-title">
          Portfolio
        </h2>

        {portfolio.length === 0 && (
          <p className="portfolio-empty">
            No portfolio items yet.
          </p>
        )}

        <div className="portfolio-grid">
          {portfolio.map((item) => (
            <div
              key={item.id}
              className="portfolio-item"
              onClick={() => setPreview(item.url)}
            >
              {isVideo(item.url) ? (
                <video
                  src={item.url}
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={item.url}
                  alt=""
                />
              )}
            </div>
          ))}
        </div>

        {/* Reviews */}
        <h2 className="hire-section-title">
          Reviews
        </h2>

        {reviews.length === 0 && (
          <p>No reviews yet.</p>
        )}

        {reviews.map((review) => (
          <div
            key={review.id}
            className="review-card"
          >
            <strong>
              {review.businessName}
            </strong>
            <span>
              {" "}
              - {review.rating} ⭐
            </span>
            <p>{review.text}</p>
          </div>
        ))}
      </div>

      {/* LIGHTBOX PREVIEW */}
      {preview && (
        <div
          className="portfolio-modal"
          onClick={() => setPreview(null)}
        >
          <div
            className="portfolio-modal-content"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {isVideo(preview) ? (
              <video
                src={preview}
                controls
                autoPlay
              />
            ) : (
              <img
                src={preview}
                alt=""
              />
            )}
          </div>
        </div>
      )}
    </PageLayout>
  );
}
