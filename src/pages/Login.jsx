import "./Auth.css";
import { useState } from "react";
import { loginUser } from "../firebase/auth";
import PageLayout from "../layouts/PageLayout";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await loginUser(email, password);
      navigate("/"); // later: role-based dashboard
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">
            Log in to manage your services and projects.
          </p>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@business.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
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
