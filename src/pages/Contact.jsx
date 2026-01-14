import "./Contact.css";
import { useState } from "react";
import PageLayout from "../layouts/PageLayout";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent! We'll get back to you soon.");
  };

  return (
    <PageLayout>
      <div className="contact-container">
        <div className="contact-card">
          <h1>Contact Us</h1>
          <p className="contact-subtext">
            Have a question? Need help? Send us a message.
          </p>

          <form onSubmit={handleSubmit}>
            <label>Name</label>
            <input name="name" required onChange={handleChange} />

            <label>Email</label>
            <input name="email" type="email" required onChange={handleChange} />

            <label>Subject</label>
            <input name="subject" required onChange={handleChange} />

            <label>Message</label>
            <textarea
              name="message"
              rows="5"
              required
              onChange={handleChange}
            />

            <button className="btn submit-btn">Send Message</button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
