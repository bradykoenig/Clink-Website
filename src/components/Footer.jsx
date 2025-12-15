import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        © {new Date().getFullYear()} Clink. All rights reserved.
      </div>
    </footer>
  );
}
