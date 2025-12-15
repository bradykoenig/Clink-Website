import "./ProfileSettings.css";
import { useState, useEffect } from "react";
import { useAuth } from "../firebase/AuthContext";
import { db } from "../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function ProfileSettings() {
  const { currentUser } = useAuth();

  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    role: "",
    serviceType: "",
    price: "",
    photo: "",
  });

  const [loading, setLoading] = useState(true);

  // Load profile from Firestore
  useEffect(() => {
    const load = async () => {
      if (!currentUser) return;

      const ref = doc(db, "users", currentUser.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setProfile(snap.data());
      }

      setLoading(false);
    };

    load();
  }, [currentUser]);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const saveProfile = async () => {
    if (!currentUser) return;

    const ref = doc(db, "users", currentUser.uid);
    await updateDoc(ref, profile);

    alert("Profile updated successfully!");
  };

  const uploadPhoto = () => {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: "dks4wgyhr",
        uploadPreset: "unsigned_uploads",
        folder: `users/${currentUser.uid}`,
      },
      async (error, result) => {
        if (!error && result.event === "success") {
          const url = result.info.secure_url;
          setProfile((prev) => ({ ...prev, photo: url }));
        }
      }
    );

    widget.open();
  };

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div className="profile-settings-container">
      <h1>Profile Settings</h1>

      <div className="profile-form">

        {/* Profile Photo */}
        <div className="photo-section">
          <img
            src={profile.photo || "/default_user.png"}
            alt="profile"
            className="profile-photo-edit"
          />
          <button className="btn upload-btn" onClick={uploadPhoto}>
            Change Photo
          </button>
        </div>

        {/* Name */}
        <label>Name</label>
        <input
          type="text"
          value={profile.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />

        {/* Bio */}
        <label>Bio</label>
        <textarea
          value={profile.bio}
          onChange={(e) => handleChange("bio", e.target.value)}
        />

        {/* Role Selection */}
        <label>Your Role</label>
        <select
          value={profile.role}
          onChange={(e) => handleChange("role", e.target.value)}
        >
          <option value="">Select your role</option>
          <option value="creator">Content Creator</option>
          <option value="business">Business</option>
        </select>

        {/* Creator Only Fields */}
        {profile.role === "creator" && (
          <>
            <label>Service Type</label>
            <select
              value={profile.serviceType}
              onChange={(e) => handleChange("serviceType", e.target.value)}
            >
              <option value="">Select service</option>
              <option value="Photography">Photography</option>
              <option value="Videography">Videography</option>
              <option value="Both">Both</option>
            </select>

            <label>Project Price ($)</label>
            <input
              type="number"
              value={profile.price}
              onChange={(e) => handleChange("price", Number(e.target.value))}
            />
          </>
        )}

        <button className="btn save-btn" onClick={saveProfile}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
