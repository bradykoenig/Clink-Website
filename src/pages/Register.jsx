import "./Auth.css";
import { useState } from "react";
import { registerUser } from "../firebase/auth";
import { useNavigate } from "react-router-dom";
import PageLayout from "../layouts/PageLayout";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleRegister(e) {
  e.preventDefault();

  if (!role) {
    alert("Please select a role.");
    return;
  }

  try {
    setLoading(true);
    await registerUser({ email, password, role });

    // 🔥 Always finish onboarding first
    navigate("/profile-settings");
  } catch (err) {
    alert(err.message);
  } finally {
    setLoading(false);
  }
}


  return (
    <PageLayout>
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">
            Join Clink and start working with creators or businesses.
          </p>

          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>I am a:</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="">Select role</option>
                <option value="business">Business</option>
                <option value="creator">Content Creator</option>
              </select>
            </div>

            <button className="auth-btn" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account? <a href="/login">Log in</a>
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
