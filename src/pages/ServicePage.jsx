import "./ServicePage.css";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useAuth } from "../firebase/AuthContext";

export default function ServicePage() {
  const { serviceId } = useParams();
  const { currentUser } = useAuth();

  const [service, setService] = useState(null);
  const [creator, setCreator] = useState(null);
  const [business, setBusiness] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  // 🔥 Load service in real-time
  useEffect(() => {
    const ref = doc(db, "services", serviceId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setService({ id: snap.id, ...snap.data() });
    });
    return () => unsub();
  }, [serviceId]);

  // 🔥 Load creator + business profiles
  useEffect(() => {
    if (!service) return;

    const unsub1 = onSnapshot(doc(db, "users", service.creatorId), (s) => {
      if (s.exists()) setCreator({ id: s.id, ...s.data() });
    });

    const unsub2 = onSnapshot(doc(db, "users", service.businessId), (s) => {
      if (s.exists()) setBusiness({ id: s.id, ...s.data() });
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [service]);

  if (!service || !creator || !business)
    return <div className="loading">Loading service...</div>;

  const isCreator = currentUser?.uid === service.creatorId;
  const isBusiness = currentUser?.uid === service.businessId;

  // ------------------------------------------
  // ⭐ Upload media (Cloudinary widget)
  // ------------------------------------------
  const uploadMedia = () => {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: "dks4wgyhr",
        uploadPreset: "unsigned_uploads",
        folder: `services/${serviceId}`,
        sources: ["local", "camera"],
        multiple: false,
      },
      async (err, result) => {
        if (!err && result.event === "success") {
          const url = result.info.secure_url;

          await updateDoc(doc(db, "services", serviceId), {
            media: [...(service.media || []), url],
          });
        }
      }
    );

    widget.open();
  };

  // ------------------------------------------
  // ⭐ Creator requests completion
  // ------------------------------------------
  const requestCompletion = async () => {
    await updateDoc(doc(db, "services", serviceId), {
      creatorRequestedCompletion: true,
      status: "awaiting_approval",
    });
  };

  // ------------------------------------------
  // ⭐ Business approves (completes service)
  // ------------------------------------------
  const approveCompletion = async () => {
    await updateDoc(doc(db, "services", serviceId), {
      status: "completed",
      businessReview: {
        rating,
        text: reviewText,
        date: Date.now(),
      },
    });

    // ⭐ Add review to creator's profile
    await updateDoc(doc(db, "users", creator.id), {
      reviews: [
        ...(creator.reviews || []),
        {
          rating,
          text: reviewText,
          businessId: business.id,
          date: Date.now(),
        },
      ],
    });
  };

  // ------------------------------------------
  // ⭐ Business requests revision
  // ------------------------------------------
  const requestRevision = async () => {
    if ((service.revisionCount || 0) >= 2) {
      alert("Maximum of 2 revisions allowed.");
      return;
    }

    await updateDoc(doc(db, "services", serviceId), {
      status: "revision_requested",
      revisionCount: (service.revisionCount || 0) + 1,
      creatorRequestedCompletion: false,
    });
  };

  // ------------------------------------------
  // ⭐ Open full-screen modal
  // ------------------------------------------
  const openModal = (item) => {
    setModalItem(item);
    setShowModal(true);
  };

  return (
    <div className="service-page">
      <h1 className="service-title">Project Details</h1>

      {/* USER SUMMARY */}
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

      {/* STATUS */}
      <p className="status-line">
        <strong>Status:</strong> {service.status}
      </p>

      {/* MEDIA GRID */}
      <h2>Media</h2>
      <div className="media-grid">
        {(service.media || []).map((item, idx) => (
          <div className="media-item" key={idx} onClick={() => openModal(item)}>
            {item.endsWith(".mp4") ? (
              <>
                <video src={item} />
                <div className="video-icon">▶</div>
              </>
            ) : (
              <img src={item} />
            )}
          </div>
        ))}
      </div>

      {/* CREATOR ACTIONS */}
      {isCreator && (
        <div className="action-section">
          <button className="btn upload-btn" onClick={uploadMedia}>
            Upload Image/Video
          </button>

          {!service.creatorRequestedCompletion &&
            service.status !== "completed" && (
              <button className="btn completion-btn" onClick={requestCompletion}>
                Request Completion
              </button>
            )}
        </div>
      )}

      {/* BUSINESS ACTIONS */}
      {isBusiness && service.creatorRequestedCompletion && (
        <div className="approval-box">
          <h2>Approve Final Delivery</h2>

          <label>Rating</label>
          <select
            className="rating-select"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} Stars
              </option>
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

      {/* FULLSCREEN MODAL */}
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
  );
}
