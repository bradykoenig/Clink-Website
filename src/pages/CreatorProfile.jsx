import "./CreatorProfile.css";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import PageLayout from "../layouts/PageLayout";

function watermarked(url) {
  if (!url) return "";
  return url.replace(
    "/upload/",
    "/upload/l_text:Arial_30_bold:CLINK,o_35,g_south_east,x_20,y_20/"
  );
}

export default function CreatorProfile() {
  const { id } = useParams();

  const [creator, setCreator] = useState(null);
  const [reviews, setReviews] = useState([]);

  // Load creator
  useEffect(() => {
    const ref = doc(db, "users", id);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setCreator({ id: snap.id, ...snap.data() });
    });
    return () => unsub();
  }, [id]);

  // Load reviews
  useEffect(() => {
    const q = query(
      collection(db, "users", id, "reviews"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setReviews(list);
    });

    return () => unsub();
  }, [id]);

  if (!creator) {
    return (
      <PageLayout>
        <p style={{ padding: 20 }}>Loading creator profile...</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="creator-profile-container">
        <h1>{creator.name}</h1>

        <p>{creator.serviceType}</p>

        <p>
          ⭐ {(creator.rating ?? 0).toFixed(1)} (
          {creator.reviewCount ?? 0})
        </p>

        <p>{creator.bio}</p>

        <h2>Reviews</h2>

        {reviews.length === 0 && <p>No reviews yet.</p>}

        {reviews.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <strong>{review.businessName}</strong>
              <span>{review.rating} ⭐</span>
            </div>

            <p>{review.text}</p>

            {review.media &&
              review.media.map((item, i) => (
                <img
                  key={i}
                  src={watermarked(item)}
                  alt=""
                  className="review-media"
                />
              ))}
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
