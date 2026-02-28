import "./PaymentSuccess.css";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/firebase";
import { useAuth } from "../firebase/AuthContext";
import PageLayout from "../layouts/PageLayout";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function finalize() {
      try {
        if (!currentUser) {
          navigate("/login");
          return;
        }

        const sessionId = searchParams.get("session_id");
        const serviceId = searchParams.get("serviceId");

        if (!sessionId || !serviceId) {
          throw new Error("Missing session information.");
        }

        const finalizeCheckout = httpsCallable(
          functions,
          "finalizeCheckout"
        );

        const res = await finalizeCheckout({
          sessionId,
          serviceId,
        });

        if (!res.data?.ok) {
          throw new Error("Payment verification failed.");
        }

        setLoading(false);
      } catch (err) {
        console.error("Finalize error:", err);
        setError(err.message);
        setLoading(false);
      }
    }

    finalize();
  }, [currentUser, searchParams, navigate]);

  if (loading) {
    return (
      <PageLayout>
        <div className="success-container">
          <div className="success-card">
            <h1>Processing Payment...</h1>
            <p>Please wait while we finalize your project.</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="success-container">
          <div className="success-card">
            <h1>Payment Error</h1>
            <p>{error}</p>
            <button
              className="success-btn"
              onClick={() => navigate("/business-dashboard")}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="success-container">
        <div className="success-card">
          <h1>🎉 Payment Successful!</h1>

          <p className="success-message">
            Your project has been successfully created and is now waiting for the creator to accept it.
          </p>

          <button
            className="success-btn"
            onClick={() => navigate("/business-dashboard")}
          >
            Go to Your Dashboard
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
