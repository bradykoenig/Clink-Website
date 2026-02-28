import "./ServicePage.css";

import PageLayout from "../layouts/PageLayout";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import {
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../firebase/firebase";
import { useAuth } from "../firebase/AuthContext";

export default function ServicePage() {
  const { serviceId, id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const actualServiceId = serviceId || id;

  const [service, setService] = useState(null);
  const [creator, setCreator] = useState(null);
  const [business, setBusiness] = useState(null);

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  const [activeMedia, setActiveMedia] = useState(null);

  // Close modal on ESC
    useEffect(() => {
      const handleKey = (e) => {
        if (e.key === "Escape") {
          setActiveMedia(null);
        }
      };

  window.addEventListener("keydown", handleKey);
  return () => window.removeEventListener("keydown", handleKey);
}, []);


  // Protect route
  useEffect(() => {
    if (!currentUser) navigate("/login");
  }, [currentUser, navigate]);

  // Load service
  useEffect(() => {
    if (!actualServiceId) return;

    const unsub = onSnapshot(doc(db, "services", actualServiceId), (snap) => {
      if (snap.exists()) setService({ id: snap.id, ...snap.data() });
      else navigate("/");
    });

    return () => unsub();
  }, [actualServiceId, navigate]);

  // Load users
  useEffect(() => {
    if (!service) return;

    const unsubCreator = onSnapshot(doc(db, "users", service.creatorId), (snap) => {
      if (snap.exists()) setCreator({ id: snap.id, ...snap.data() });
    });

    const unsubBusiness = onSnapshot(doc(db, "users", service.businessId), (snap) => {
      if (snap.exists()) setBusiness({ id: snap.id, ...snap.data() });
    });

    return () => {
      unsubCreator();
      unsubBusiness();
    };
  }, [service]);

  const isCreator = useMemo(
    () => !!currentUser?.uid && currentUser.uid === service?.creatorId,
    [currentUser, service]
  );

  const isBusiness = useMemo(
    () => !!currentUser?.uid && currentUser.uid === service?.businessId,
    [currentUser, service]
  );

  // Block access if user isn't on the service
  useEffect(() => {
    if (!currentUser || !service) return;
    if (!isCreator && !isBusiness) navigate("/not-found");
  }, [currentUser, service, isCreator, isBusiness, navigate]);

  if (!service || !creator || !business) {
    return (
      <PageLayout>
        <p style={{ padding: 40 }}>Loading...</p>
      </PageLayout>
    );
  }

  const status = service.status || "pending";

  // ACCEPT PROJECT
  const acceptProject = async () => {
    try {
      setActionLoading(true);
      await updateDoc(doc(db, "services", actualServiceId), {
        status: "in_progress",
        acceptedAt: serverTimestamp(),
      });
    } finally {
      setActionLoading(false);
    }
  };

  // CANCEL PROJECT
  const cancelProject = async () => {
    if (!window.confirm("Cancel this project? A full refund will be issued.")) return;

    try {
      setActionLoading(true);
      await updateDoc(doc(db, "services", actualServiceId), {
        status: "canceled_by_creator",
        canceledAt: serverTimestamp(),
      });
      // refund should be server-side
    } finally {
      setActionLoading(false);
    }
  };

  // MEDIA UPLOAD
  const uploadMedia = () => {
    if (!window.cloudinary?.createUploadWidget) {
      alert("Cloudinary widget not loaded.");
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: "dks4wgyhr",
        uploadPreset: "unsigned_uploads",
        folder: `services/${actualServiceId}`,
        multiple: true,
        resourceType: "auto",
      },
      async (err, result) => {
        if (err) {
          console.error(err);
          alert("Upload failed.");
          return;
        }

        if (result && result.event === "success") {
          await updateDoc(doc(db, "services", actualServiceId), {
            media: arrayUnion(result.info.secure_url),
          });
        }
      }
    );

    widget.open();
  };

  // REQUEST COMPLETION
  const requestCompletion = async () => {
    try {
      setActionLoading(true);
      await updateDoc(doc(db, "services", actualServiceId), {
        creatorRequestedCompletion: true,
        status: "awaiting_approval",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // APPROVE COMPLETION (server-side callable)
  const approveCompletion = async () => {
    if (!reviewText.trim()) {
      alert("Please write a short review message.");
      return;
    }

    try {
      setActionLoading(true);

      const fn = httpsCallable(functions, "completeServiceWithReview");
      const res = await fn({
        serviceId: actualServiceId,
        rating,
        reviewText: reviewText.trim(),
      });

      if (!res?.data?.ok) {
        throw new Error("Function did not return ok.");
      }

      alert("Service completed & review submitted!");
      setReviewText("");
      setRating(5);
    } catch (e) {
      console.error("Approve error:", e);
      alert(e?.message || "Failed to complete service.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="service-page">
        <div className="header-row">
          <div>
            <h1 className="service-title">Project</h1>
            <p className="muted">
              Service ID: <span className="mono">{actualServiceId}</span>
            </p>
          </div>

          <div className={`status-pill ${status}`}>
            {status.replaceAll("_", " ")}
          </div>
        </div>

        {/* USERS */}
        <div className="service-card user-row">
          <div className="user-box">
            <img
              src={creator.photo || "/default_user.png"}
              className="avatar"
              alt=""
              onError={(e) => (e.currentTarget.src = "/default_user.png")}
            />
            <div>
              <div className="user-name">{creator.name || "Creator"}</div>
              <div className="muted small">Creator</div>
            </div>
          </div>

          <div className="divider" />

          <div className="user-box">
            <img
              src={business.photo || "/default_user.png"}
              className="avatar"
              alt=""
              onError={(e) => (e.currentTarget.src = "/default_user.png")}
            />
            <div>
              <div className="user-name">{business.name || "Business"}</div>
              <div className="muted small">Business</div>
            </div>
          </div>
        </div>

        {/* TOP ACTIONS (Always show Open Chat) */}
        <div className="action-section">
          <button
            className="btn secondary"
            onClick={() => navigate(`/chat/${actualServiceId}`)}
          >
            Open Chat
          </button>
        </div>

        {/* CREATOR PENDING ACCEPT */}
        {isCreator && status === "pending" && (
          <div className="action-section">
            <button className="btn success" onClick={acceptProject} disabled={actionLoading}>
              Accept Project
            </button>
            <button className="btn danger" onClick={cancelProject} disabled={actionLoading}>
              Cancel & Refund
            </button>
          </div>
        )}

        {/* MEDIA */}
        <h2 className="section-title">Media</h2>

          {!service.media || service.media.length === 0 ? (
            <div className="empty-box">No media uploaded yet.</div>
          ) : (
            <div className="media-grid">
              {service.media.map((item, idx) => {
                const isVideo =
                  item.includes(".mp4") ||
                  item.includes(".mov") ||
                  item.includes(".webm") ||
                  item.includes("video/upload");

                return (
                  <div
                    key={idx}
                    className="media-item"
                    onClick={() => setActiveMedia(item)}
                  >
                    {isVideo ? (
                      <>
                        <video src={item} muted playsInline />
                        <div className="video-icon">▶</div>
                      </>
                    ) : (
                      <img src={item} alt="" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

        {/* CREATOR WORK ACTIONS */}
        {isCreator && status === "in_progress" && (
          <div className="action-section">
            <button className="btn primary" onClick={uploadMedia} disabled={actionLoading}>
              Upload Media
            </button>
            <button className="btn success" onClick={requestCompletion} disabled={actionLoading}>
              Request Completion
            </button>
          </div>
        )}

        {/* BUSINESS APPROVAL */}
        {isBusiness && status === "awaiting_approval" && (
          <div className="service-card approval-box">
            <h2 className="section-title" style={{ marginTop: 0 }}>
              Approve Delivery
            </h2>

            <label className="field-label">Rating</label>
            <select
              className="rating-select"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              disabled={actionLoading}
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} Star{r !== 1 ? "s" : ""}
                </option>
              ))}
            </select>

            <label className="field-label">Review</label>
            <textarea
              className="review-box"
              placeholder="Quick feedback the creator will see on their profile..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              disabled={actionLoading}
            />

            <button
              className="btn primary full"
              onClick={approveCompletion}
              disabled={actionLoading}
            >
              Approve & Complete
            </button>
          </div>
        )}

        {activeMedia && (
          <div className="media-modal" onClick={() => setActiveMedia(null)}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="modal-close"
                onClick={() => setActiveMedia(null)}
              >
                ✕
              </button>

              {(activeMedia.includes("video/upload") ||
                activeMedia.endsWith(".mp4") ||
                activeMedia.endsWith(".mov") ||
                activeMedia.endsWith(".webm")) ? (
                <video src={activeMedia} controls autoPlay />
              ) : (
                <img src={activeMedia} alt="" />
              )}
            </div>
          </div>
        )}

      </div>
    </PageLayout>
  );
}
