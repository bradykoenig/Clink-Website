import "./NotFound.css";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="notfound-container">
      <h1 className="nf-code">404</h1>
      <h2 className="nf-title">Page Not Found</h2>
      <p className="nf-text">
        The page you're looking for doesn't exist or may have been moved.
      </p>

      <Link to="/" className="nf-btn">
        Return Home
      </Link>
    </div>
  );
}
