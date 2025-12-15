import "./PaymentSuccess.css";
import { Link } from "react-router-dom";

export default function PaymentSuccess() {
  return (
    <div className="success-container">
      <div className="success-card">
        <h1>🎉 Payment Successful!</h1>

        <p className="success-message">
          Thank you for your payment.  
          Your project has been created and is now waiting for the creator to accept it.
        </p>

        <Link to="/business-dashboard" className="success-btn">
          Go to Your Dashboard
        </Link>
      </div>
    </div>
  );
}
