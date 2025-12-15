import "./PaymentCancel.css";
import { Link } from "react-router-dom";

export default function PaymentCancel() {
  return (
    <div className="cancel-container">
      <div className="cancel-card">
        <h1>❌ Payment Canceled</h1>

        <p className="cancel-message">
          Your payment was not completed.  
          If this was a mistake, you can try again below.
        </p>

        <Link to="/creators" className="cancel-btn">
          Back to Creators
        </Link>
      </div>
    </div>
  );
}
