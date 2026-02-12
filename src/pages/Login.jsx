import "./Auth.css";
import { useState } from "react";
import { loginUser } from "../firebase/auth";
import PageLayout from "../layouts/PageLayout";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const { user } = await loginUser(email, password);

      if (!user.emailVerified) {
        // silently redirect to resend page instead of showing red error
        navigate("/resend-verification");
        return;
      }

      navigate("/");
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
          <h1 className="auth-title">Welcome Back</h1>

          {error && <p className="auth-error">{error}</p>}

          <form onSubmit={handleLogin} className="auth-form">
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

            {/* Clean subtle links row */}
            <div className="auth-links-row">
              <Link to="/forgot-password" className="auth-link">
                Forgot password?
              </Link>

              <Link to="/resend-verification" className="auth-link">
                Resend verification?
              </Link>
            </div>

            <button className="auth-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="auth-footer-text">
            Don’t have an account?{" "}
            <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
