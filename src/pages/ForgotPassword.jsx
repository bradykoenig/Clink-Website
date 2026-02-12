import "./Auth.css";
import { useState } from "react";
import PageLayout from "../layouts/PageLayout";
import { auth } from "../firebase/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      await sendPasswordResetEmail(auth, email);

      setMessage("Password reset email sent. Please check your inbox.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Reset Password</h1>

          <p className="auth-subtitle">
            Enter your email and we’ll send you a password reset link.
          </p>

          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-success">{message}</p>}

          <form onSubmit={handleReset} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button className="auth-btn" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Email"}
            </button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
