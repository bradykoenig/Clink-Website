import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PresenceManager from "../components/PresenceManager";

export default function PageLayout({ children }) {
  return (
    <div className="page-wrapper">
      <PresenceManager /> {/* GLOBAL PRESENCE */}
      <Navbar />
      <main className="page-content">{children}</main>
      <Footer />

      
    </div>
  );
}
