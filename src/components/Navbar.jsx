import "./Navbar.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../firebase/AuthContext";
import { db } from "../firebase/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
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

  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to="/" className="nav-logo">CLINK</Link>
        <Link to="/creators" className="nav-link">Find Creators</Link>
        <Link to="/services" className="nav-link">Services</Link>
      </div>

      <div className="nav-right">
        {!currentUser ? (
          <Link to="/login" className="btn-login">Login</Link>
        ) : (
          <div className="nav-user-section">
            <img
              src={userData?.photo || "/default_user.png"}
              alt="avatar"
              className="nav-avatar"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            />

            {dropdownOpen && (
              <div className="nav-dropdown">
                {userData?.role === "creator" ? (
                  <Link to="/creator-dashboard" className="dd-item">
                    Creator Dashboard
                  </Link>
                ) : (
                  <Link to="/business-dashboard" className="dd-item">
                    Business Dashboard
                  </Link>
                )}

                <Link to="/profile-settings" className="dd-item">
                  Profile Settings
                </Link>

                <button onClick={logout} className="dd-item logout">
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
