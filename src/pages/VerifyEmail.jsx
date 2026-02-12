import "./Auth.css";
import PageLayout from "../layouts/PageLayout";
import { auth } from "../firebase/firebase";
import {
  sendEmailVerification,
  reload,
  onAuthStateChanged,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function VerifyEmail() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* Wait for Firebase auth to initialize */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoadingUser(false);
    });

    return () => unsub();
  }, []);

  /* Cooldown countdown */
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const resendEmail = async () => {
    if (!user) return;

    try {
      setError("");
      setMessage("");

      await sendEmailVerification(user);

      setMessage("Verification email successfully resent.");
      setCooldown(60); // 60 second cooldown
    } catch (err) {
      if (err.code === "auth/too-many-requests") {
        setError("Please wait before requesting another email.");
      } else {
        setError("Failed to resend email.");
      }
    }
  };

  const checkVerification = async () => {
    if (!user) return;

    try {
      setError("");
      setMessage("");

      await reload(user);

      if (user.emailVerified) {
        setMessage("Email verified successfully! Redirecting...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError("Your email is not verified yet.");
      }
    } catch (err) {
      setError("Verification check failed.");
    }
  };

  if (loadingUser) {
    return (
      <PageLayout>
        <div className="auth-page">
          <div className="auth-card">
            <p>Loading...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout>
        <div className="auth-page">
          <div className="auth-card">
            <p className="auth-error">
              You must be logged in to verify your email.
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Verify Your Email</h1>

          <p className="auth-subtitle">
            We’ve sent a verification link to your email address.
            Please click the link before continuing.
            
            <p>
              If not in inbox, be sure to check spam folder.
            </p>
          </p>

          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-success">{message}</p>}

          <div className="verify-actions">
            <button
              className="auth-btn"
              onClick={checkVerification}
            >
              I’ve Verified My Email
            </button>

            <button
              className="auth-btn secondary"
              onClick={resendEmail}
              disabled={cooldown > 0}
              type="button"
            >
              {cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend Email"}
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
