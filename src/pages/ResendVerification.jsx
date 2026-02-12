import "./Auth.css";
import { useState } from "react";
import PageLayout from "../layouts/PageLayout";
import { auth } from "../firebase/firebase";
import {
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { Link } from "react-router-dom";

export default function ResendVerification() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResend = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      // 1️⃣ Check if account exists
      const methods = await fetchSignInMethodsForEmail(auth, email);

      if (methods.length === 0) {
        setError("No account found with this email. Please sign up.");
        return;
      }

      // 2️⃣ Sign in temporarily to check verification status
      const { user } = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (user.emailVerified) {
        setMessage("Your email is already verified. Please log in.");
        await signOut(auth);
        return;
      }

      // 3️⃣ Resend verification
      await sendEmailVerification(user);
      setMessage("Verification email resent successfully.");

      await signOut(auth);
    } catch (err) {
      setError("Invalid credentials or something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Resend Verification Email</h1>

          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-success">{message}</p>}

          <form onSubmit={handleResend} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="auth-btn" disabled={loading}>
              {loading ? "Processing..." : "Resend Verification"}
            </button>
          </form>

          <p className="auth-footer-text">
            Back to <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
