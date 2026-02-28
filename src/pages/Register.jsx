import "./Auth.css";
import { useState } from "react";
import { registerUser } from "../firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import PageLayout from "../layouts/PageLayout";
import { geocodeZip } from "../utils/geocodeZip";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [zip, setZip] = useState("");

  // 🔹 Creator-only fields
  const [serviceType, setServiceType] = useState("");
  const [price, setPrice] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      alert("Please enter your first and last name.");
      return;
    }

    if (!role) {
      alert("Please select a role.");
      return;
    }

    if (!/^\d{5}$/.test(zip)) {
      alert("Please enter a valid 5-digit ZIP code.");
      return;
    }

    // 🔹 Validate creator fields
    if (role === "creator") {
      if (!serviceType) {
        alert("Please select your service type.");
        return;
      }

      if (!price || Number(price) <= 0) {
        alert("Please enter a valid project price.");
        return;
      }
    }

    try {
      setLoading(true);

      const location = await geocodeZip(zip);

      const cred = await registerUser({
        email: email.trim(),
        password,
        role,
        zip,
        location,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        serviceType: role === "creator" ? serviceType : "",
        price: role === "creator" ? Number(price) : null,
      });

      // Wait until auth.currentUser exists
      if (cred?.user) {
        // Wait one tick so Firebase auth + Firestore listener fully sync
        await new Promise((resolve) => setTimeout(resolve, 200));
        navigate("/verify-email");
    }


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

            {/* First Name */}
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) =>
                  setFirstName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))
                }
                required
              />
            </div>

            {/* Last Name */}
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                placeholder="Smith"
                value={lastName}
                onChange={(e) =>
                  setLastName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))
                }
                required
              />
            </div>

            {/* Email */}
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

            {/* Password */}
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {/* ZIP Code */}
            <div className="form-group">
              <label>ZIP Code</label>
              <input
                type="text"
                placeholder="e.g. 45202"
                maxLength={5}
                value={zip}
                onChange={(e) =>
                  setZip(e.target.value.replace(/\D/g, ""))
                }
                required
              />
            </div>

            {/* Role */}
            <div className="form-group">
              <label>I am a:</label>
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setServiceType("");
                  setPrice("");
                }}
                required
              >
                <option value="">Select role</option>
                <option value="business">Business</option>
                <option value="creator">Content Creator</option>
              </select>
            </div>

            {/* 🔹 CREATOR-ONLY FIELDS */}
            {role === "creator" && (
              <>
                <div className="form-group">
                  <label>Service Type</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    required
                  >
                    <option value="">Select service type</option>
                    <option value="Photography">Photography</option>
                    <option value="Videography">Videography</option>
                    <option value="Both">Both</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Starting Project Price ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 250"
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value.replace(/\D/g, ""))
                    }
                    min="1"
                    required
                  />
                </div>
              </>
            )}

            <button className="auth-btn" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
