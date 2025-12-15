import "./Auth.css";
import { useState } from "react";
import { registerUser } from "../firebase/auth";
import { saveUserProfile } from "../firebase/firestore";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const cred = await registerUser(email, password);

      await saveUserProfile(cred.user.uid, {
        email,
        role: "business", // default role
        createdAt: Date.now(),
      });

      alert("Account created!");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>

        <form onSubmit={handleRegister}>
          <label>Email</label>
          <input
            type="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn auth-btn" type="submit">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
