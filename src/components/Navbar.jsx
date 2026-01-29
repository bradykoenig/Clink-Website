// src/components/Navbar.jsx
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../firebase/AuthContext";
import { db } from "../firebase/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function Navbar() {
  const { currentUser, profile, logout } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setUserData(null);
      return;
    }

    const ref = doc(db, "users", currentUser.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setUserData({ id: snap.id, ...snap.data() });
      }
    });

    return () => unsub();
  }, [currentUser]);

  async function handleLogout() {
    try {
      await logout();
      setDropdownOpen(false);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to="/" className="nav-logo">CLINK</Link>

        {/* 👀 Visible to logged-out users and businesses ONLY */}
        {(!currentUser || profile?.role === "business") && (
          <Link to="/creators" className="nav-link">
            Find Creators
          </Link>
        )}

        <Link to="/services" className="nav-link">
          Services
        </Link>
      </div>

      <div className="nav-right">
        {!currentUser ? (
          <Link to="/login" className="btn-login">
            Login
          </Link>
        ) : (
          <div className="nav-user-section">
            <img
              src={userData?.photo || "/default_user.png"}
              alt="avatar"
              className="nav-avatar"
              onClick={() => setDropdownOpen((prev) => !prev)}
            />

            {dropdownOpen && (
              <div className="nav-dropdown">
                {profile?.role === "creator" ? (
                  <Link
                    to="/creator-dashboard"
                    className="dd-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Creator Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/business-dashboard"
                    className="dd-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Business Dashboard
                  </Link>
                )}

                <Link
                  to="/profile-settings"
                  className="dd-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  Profile Settings
                </Link>

                <button
                  className="dd-item logout"
                  onClick={handleLogout}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
