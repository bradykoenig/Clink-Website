import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PageLayout({ children }) {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">
        {children}
      </main>
      <Footer />
    </div>
  );
}
