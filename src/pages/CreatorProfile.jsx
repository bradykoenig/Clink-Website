import "./CreatorProfile.css";
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { doc, onSnapshot, getDoc } from "firebase/firestore";

export default function CreatorProfile() {
  const { id } = useParams();
  const [creator, setCreator] = useState(null);
  const [reviewsEnriched, setReviewsEnriched] = useState([]);

  // Load creator in real-time
  useEffect(() => {
    const ref = doc(db, "users", id);

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setCreator({ id: snap.id, ...snap.data() });
      }
    });

    return () => unsub();
  }, [id]);

  // Enrich reviews with business user data
  useEffect(() => {
    const loadReviews = async () => {
      if (!creator?.reviews) {
        setReviewsEnriched([]);
        return;
      }

      const enriched = [];

      for (const r of creator.reviews) {
        const businessRef = doc(db, "users", r.businessId);
        const snap = await getDoc(businessRef);

        enriched.push({
          ...r,
          businessName: snap.exists() ? snap.data().name : "Business User",
          businessPhoto: snap.exists()
            ? snap.data().photo
            : "/default_user.png",
        });
      }

      setReviewsEnriched(enriched);
    };

    loadReviews();
  }, [creator]);

  if (!creator)
    return <p style={{ padding: 20 }}>Loading creator profile...</p>;

  // Compute average rating
  const avgRating =
    creator.reviews && creator.reviews.length > 0
      ? (
          creator.reviews.reduce((sum, r) => sum + r.rating, 0) /
          creator.reviews.length
        ).toFixed(1)
      : "New";

  return (
    <div className="creator-profile-container">
      {/* HEADER */}
      <div className="creator-header">
        <img
          src={creator.photo || "/default_user.png"}
          alt={creator.name}
          className="creator-profile-photo"
        />

        <div className="creator-details">
          <h1>{creator.name}</h1>
          <p className="creator-service">{creator.serviceType}</p>
          <p className="creator-rating">
            ⭐ {avgRating}{" "}
            {creator.reviews?.length > 0 &&
              `(${creator.reviews.length} reviews)`}
          </p>
          <p className="creator-bio">{creator.bio}</p>

          <div className="price-row">
            <span className="price-label">Project Price</span>
            <span className="price-amount">
              {creator.price ? `$${creator.price}` : "Not Set"}
            </span>
          </div>

          {/* HIRE BUTTON LOGIC */}
          {!creator.price ? (
            <p className="warning-text">
              This creator has not set a project price yet.
            </p>
          ) : !creator.stripeVerified ? (
            <p className="warning-text">
              This creator is not ready to accept payments yet.
            </p>
          ) : !creator.portfolio || creator.portfolio.length === 0 ? (
            <p className="warning-text">
              This creator has not added any portfolio samples yet.
            </p>
          ) : (
            <Link to={`/hire/${creator.id}`} className="hire-btn">
              Hire Creator
            </Link>
          )}
        </div>
      </div>

      {/* PORTFOLIO */}
      <h2 className="portfolio-title">Portfolio</h2>

      <div className="portfolio-grid">
        {(creator.portfolio ?? []).map((item, idx) => (
          <div className="portfolio-item" key={idx}>
            {item.endsWith(".mp4") ? (
              <video src={item} controls />
            ) : (
              <img src={item} alt="portfolio" />
            )}
          </div>
        ))}

        {creator.portfolio?.length === 0 && (
          <p className="empty-text">No portfolio added yet.</p>
        )}
      </div>

      {/* REVIEWS */}
      <h2 className="reviews-title">Customer Reviews</h2>

      {reviewsEnriched.length === 0 && (
        <p className="empty-text">No reviews yet.</p>
      )}

      <div className="reviews-list">
        {reviewsEnriched.map((r, idx) => (
          <div className="review-card" key={idx}>
            <div className="review-user">
              <img src={r.businessPhoto} className="review-avatar" />
              <div>
                <p className="review-name">{r.businessName}</p>
                <p className="review-stars">⭐ {r.rating}</p>
              </div>
            </div>

            <p className="review-text">{r.text}</p>
            <p className="review-date">
              {new Date(r.date).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
