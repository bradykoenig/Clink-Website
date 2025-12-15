import "./Creators.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function Creators() {
  const [creators, setCreators] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const q = query(
      collection(db, "users"),
      where("role", "==", "creator")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) =>
        list.push({
          id: doc.id,
          ...doc.data(),
        })
      );
      setCreators(list);
    });

    return () => unsub();
  }, []);

  const filteredCreators =
    filter === "All"
      ? creators
      : creators.filter((c) => c.serviceType === filter);

  return (
    <div className="creators-container">
      <h1 className="page-title">Find Content Creators</h1>

      <div className="filter-bar">
        {["All", "Photography", "Videography", "Both"].map((type) => (
          <button
            key={type}
            className={`filter-btn ${filter === type ? "active" : ""}`}
            onClick={() => setFilter(type)}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="creators-grid">
        {filteredCreators.map((creator) => (
          <div className="creator-card" key={creator.id}>
            <img
              src={creator.photo || "/default_user.png"}
              alt={creator.name}
              className="creator-photo"
            />

            <div className="creator-info">
              <h3 className="creator-name">{creator.name}</h3>
              <p className="creator-type">{creator.serviceType}</p>
              <p className="creator-rating">⭐ {creator.rating ?? "New"}</p>
              <p className="creator-price">${creator.price}</p>

              <Link
                to={`/creator/${creator.id}`}
                className="view-btn"
              >
                View Profile
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
