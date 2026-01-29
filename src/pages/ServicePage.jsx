// src/pages/ServicePage.jsx
import "./ServicePage.css";
import PageLayout from "../layouts/PageLayout";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../firebase/AuthContext";

export default function ServicePage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [service, setService] = useState(null);
  const [creator, setCreator] = useState(null);
  const [business, setBusiness] = useState(null);

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalItem, setModalItem] = useState(null);

  // 🔐 Protect page
  useEffect(() => {
    if (!currentUser) navigate("/login");
  }, [currentUser, navigate]);

  // 🔥 Load service
  useEffect(() => {
    const ref = doc(db, "services", serviceId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setService({ id: snap.id, ...snap.data() });
    });
    return () => unsub();
  }, [serviceId]);

  // 🔥 Load creator & business
  useEffect(() => {
    if (!service) return;

    const u1 = onSnapshot(doc(db, "users", service.creatorId), (s) => {
      if (s.exists()) setCreator({ id: s.id, ...s.data() });
    });

    const u2 = onSnapshot(doc(db, "users", service.businessId), (s) => {
      if (s.exists()) setBusiness({ id: s.id, ...s.data() });
    });

    return () => {
      u1();
      u2();
    };
  }, [service]);

  if (!service || !creator || !business)
    return (
      <PageLayout>
        <p style={{ padding: 40 }}>Loading service...</p>
      </PageLayout>
    );

  const isCreator = currentUser.uid === service.creatorId;
  const isBusiness = currentUser.uid === service.businessId;

  // ------------------------------------
  // 📤 Upload Media
  // ------------------------------------
  const uploadMedia = () => {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: "dks4wgyhr",
        uploadPreset: "unsigned_uploads",
        folder: `services/${serviceId}`,
      },
      async (err, result) => {
        if (!err && result.event === "success") {
          await updateDoc(doc(db, "services", serviceId), {
            media: [...(service.media || []), result.info.secure_url],
          });
        }
      }
    );
    widget.open();
  };

  // ------------------------------------
  // ✅ Creator requests completion
  // ------------------------------------
  const requestCompletion = async () => {
    await updateDoc(doc(db, "services", serviceId), {
      creatorRequestedCompletion: true,
      status: "awaiting_approval",
    });
  };

  // ------------------------------------
  // ⭐ Business approves + leaves review
  // ------------------------------------
  const approveCompletion = async () => {
    await updateDoc(doc(db, "services", serviceId), {
      status: "completed",
      completedAt: serverTimestamp(),
    });

    await addDoc(collection(db, "users", creator.id, "reviews"), {
      rating,
      text: reviewText,
      businessId: business.id,
      serviceId,
      createdAt: serverTimestamp(),
    });

    alert("Service completed & review submitted!");
  };

  // ------------------------------------
  // 🔁 Revision
  // ------------------------------------
  const requestRevision = async () => {
    if ((service.revisionCount || 0) >= 2) {
      alert("Maximum revisions reached.");
      return;
    }

    await updateDoc(doc(db, "services", serviceId), {
      revisionCount: (service.revisionCount || 0) + 1,
      status: "revision_requested",
      creatorRequestedCompletion: false,
    });
  };

  const openModal = (item) => {
    setModalItem(item);
    setShowModal(true);
  };

  return (
    <PageLayout>
      <div className="service-page">
        <h1 className="service-title">Project</h1>

        {/* USERS */}
        <div className="user-info-row">
          <div className="user-box">
            <img src={creator.photo} className="avatar" />
            <div>
              <h3>{creator.name}</h3>
              <p className="role-text">Creator</p>
            </div>
          </div>

          <div className="user-box">
            <img src={business.photo} className="avatar" />
            <div>
              <h3>{business.name}</h3>
              <p className="role-text">Business</p>
            </div>
          </div>
        </div>

        <p className="status-line">
          <strong>Status:</strong> {service.status}
        </p>

        {/* MEDIA */}
        <h2>Media</h2>
        <div className="media-grid">
          {(service.media || []).map((item, idx) => (
            <div
              key={idx}
              className="media-item"
              onClick={() => openModal(item)}
            >
              {item.endsWith(".mp4") ? (
                <>
                  <video src={item} muted />
                  <div className="video-icon">▶</div>
                </>
              ) : (
                <img src={item} />
              )}
            </div>
          ))}
        </div>

        {/* CREATOR */}
        {isCreator && service.status !== "completed" && (
          <div className="action-section">
            <button className="btn upload-btn" onClick={uploadMedia}>
              Upload Media
            </button>

            {!service.creatorRequestedCompletion && (
              <button className="btn completion-btn" onClick={requestCompletion}>
                Request Completion
              </button>
            )}
          </div>
        )}

        {/* BUSINESS */}
        {isBusiness && service.creatorRequestedCompletion && (
          <div className="approval-box">
            <h2>Approve Delivery</h2>

            <label>Rating</label>
            <select
              className="rating-select"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>

            <label>Review</label>
            <textarea
              className="review-box"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />

            <button className="btn approve-btn" onClick={approveCompletion}>
              Approve & Complete
            </button>

            <button className="btn revision-btn" onClick={requestRevision}>
              Request Revision ({service.revisionCount || 0}/2)
            </button>
          </div>
        )}

        {showModal && (
          <div className="media-modal" onClick={() => setShowModal(false)}>
            <div className="modal-content">
              {modalItem.endsWith(".mp4") ? (
                <video src={modalItem} controls autoPlay />
              ) : (
                <img src={modalItem} />
              )}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
