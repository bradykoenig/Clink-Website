import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../firebase/AuthContext";
import { db } from "../firebase/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function Navbar() {
  const { currentUser, loading, logout } = useAuth();

  if (loading) return null;

  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
      setMobileOpen(false);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  // ✅ ROLE NOW ONLY FROM FIRESTORE SNAPSHOT
  const role = userData?.role;
  const isVerified = currentUser?.emailVerified;

  const dashboardRoute =
    role === "creator"
      ? "/creator-dashboard"
      : role === "business"
      ? "/business-dashboard"
      : "/";

  const showBusinessLinks = role === "business" && isVerified;
  const showCreatorPortfolio = role === "creator" && isVerified;

  return (
    <nav className="nav">
      <div className="nav-left">
        <Link
          to="/"
          className="nav-logo"
          onClick={() => {
            setDropdownOpen(false);
            setMobileOpen(false);
          }}
        >
          CLINK
        </Link>

        <div className="nav-desktop-links">
          {currentUser && isVerified && (
            <Link to={dashboardRoute} className="nav-link">
              Dashboard
            </Link>
          )}

          {showCreatorPortfolio && (
            <Link to="/portfolio" className="nav-link">
              Portfolio
            </Link>
          )}

          {showBusinessLinks && (
            <>
              <Link to="/creators" className="nav-link">
                Find Creators
              </Link>
              <Link to="/services" className="nav-link">
                Services
              </Link>
            </>
          )}

          {currentUser && !isVerified && (
            <Link to="/verify-email" className="nav-link verify-link">
              Verify Email
            </Link>
          )}
        </div>
      </div>

      <div className="nav-right">
        {!currentUser ? (
          <div className="nav-desktop-auth">
            <Link to="/login" className="btn-login-outline">
              Login
            </Link>
            <Link to="/register" className="btn-signup">
              Sign Up
            </Link>
          </div>
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
                {isVerified && (
                  <>
                    <Link
                      to={dashboardRoute}
                      className="dd-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>

                    {showCreatorPortfolio && (
                      <Link
                        to="/portfolio"
                        className="dd-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        My Portfolio
                      </Link>
                    )}
                  </>
                )}

                {!isVerified && (
                  <Link
                    to="/verify-email"
                    className="dd-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Verify Email
                  </Link>
                )}

                <Link
                  to="/profile-settings"
                  className="dd-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  Profile Settings
                </Link>

                <Link
                  to="/terms"
                  className="dd-item dd-terms"
                  onClick={() => setDropdownOpen(false)}
                >
                  Terms of Service
                </Link>

                <button className="dd-item logout" onClick={handleLogout}>
                  Log Out
                </button>
              </div>
            )}
          </div>
        )}

        <div
          className={`hamburger ${mobileOpen ? "active" : ""}`}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-menu">
          {currentUser && isVerified && (
            <Link to={dashboardRoute} onClick={() => setMobileOpen(false)}>
              Dashboard
            </Link>
          )}

          {showCreatorPortfolio && (
            <Link to="/portfolio" onClick={() => setMobileOpen(false)}>
              Portfolio
            </Link>
          )}

          {showBusinessLinks && (
            <>
              <Link to="/creators" onClick={() => setMobileOpen(false)}>
                Find Creators
              </Link>
              <Link to="/services" onClick={() => setMobileOpen(false)}>
                Services
              </Link>
            </>
          )}

          {!isVerified && currentUser && (
            <Link to="/verify-email" onClick={() => setMobileOpen(false)}>
              Verify Email
            </Link>
          )}

          <Link
            to="/terms"
            className="mobile-terms"
            onClick={() => setMobileOpen(false)}
          >
            Terms of Service
          </Link>

          {currentUser ? (
            <>
              <Link to="/profile-settings" onClick={() => setMobileOpen(false)}>
                Profile Settings
              </Link>
              <button onClick={handleLogout}>Log Out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                Login
              </Link>
              <Link
                to="/register"
                className="mobile-signup"
                onClick={() => setMobileOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
