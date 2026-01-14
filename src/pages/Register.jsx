import "./Auth.css";
import { useState } from "react";
import { registerUser } from "../firebase/auth";
import PageLayout from "../layouts/PageLayout";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await registerUser(email, password);
      alert("Account created successfully!");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <PageLayout>
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">
            Sign up to start hiring or offering services.
          </p>

          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@business.com"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="auth-btn" type="submit">
              Register
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account?{" "}
            <a href="/login">Log in</a>
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
