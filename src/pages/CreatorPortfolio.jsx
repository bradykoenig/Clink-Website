import "./CreatorPortfolio.css";
import { useEffect, useState } from "react";
import { useAuth } from "../firebase/AuthContext";
import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import PageLayout from "../layouts/PageLayout";

export default function CreatorPortfolio() {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "users", currentUser.uid, "portfolio"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setItems(list);
    });

    return () => unsub();
  }, [currentUser]);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "unsigned_uploads");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dks4wgyhr/auto/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Cloudinary error:", data);
        throw new Error(data.error?.message || "Upload failed.");
      }

      await addDoc(
        collection(db, "users", currentUser.uid, "portfolio"),
        {
          url: data.secure_url,
          type: data.resource_type, // image or video
          createdAt: serverTimestamp(),
        }
      );
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed. Check console for details.");
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  }

  async function handleDelete(id) {
    await deleteDoc(
      doc(db, "users", currentUser.uid, "portfolio", id)
    );
  }

  return (
    <PageLayout>
      <div className="portfolio-container">
        <h1>My Portfolio</h1>

        <label className="upload-btn">
          {uploading ? "Uploading..." : "Upload Media"}
          <input
            type="file"
            hidden
            accept="image/*,video/*"
            onChange={handleUpload}
          />
        </label>

        <div className="portfolio-grid">
          {items.map((item) => (
            <div key={item.id} className="portfolio-item">
              {item.type === "video" ? (
                <video src={item.url} controls />
              ) : (
                <img src={item.url} alt="" />
              )}

              <button onClick={() => handleDelete(item.id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
