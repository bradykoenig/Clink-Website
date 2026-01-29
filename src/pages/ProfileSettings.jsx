// src/pages/ProfileSettings.jsx
import "./ProfileSettings.css";
import { useState, useEffect } from "react";
import PageLayout from "../layouts/PageLayout";
import { useAuth } from "../firebase/AuthContext";
import { db } from "../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { geocodeZip } from "../utils/geocodeZip";

export default function ProfileSettings() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    role: "",
    serviceType: "",
    price: "",
    photo: "",
    zip: "",
    location: null,
  });

  const [loading, setLoading] = useState(true);

  // Load profile from Firestore
  useEffect(() => {
    if (!currentUser) return;

    const loadProfile = async () => {
      const ref = doc(db, "users", currentUser.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setProfile({
          name: data.name || "",
          bio: data.bio || "",
          role: data.role || "",
          serviceType: data.serviceType || "",
          price: data.price || 0,
          photo: data.photo || "",
          zip: data.zip || "",
          location: data.location || null,
        });
      }

      setLoading(false);
    };

    loadProfile();
  }, [currentUser]);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const saveProfile = async () => {
    if (!currentUser) return;

    if (!/^\d{5}$/.test(profile.zip)) {
      alert("Please enter a valid 5-digit ZIP code.");
      return;
    }

    try {
      const ref = doc(db, "users", currentUser.uid);

      // Only re-geocode if ZIP changed or location missing
      let location = profile.location;
      if (!location) {
        location = await geocodeZip(profile.zip);
      }

      await updateDoc(ref, {
        name: profile.name,
        bio: profile.bio,
        role: profile.role,
        zip: profile.zip,
        location,
        serviceType: profile.role === "creator" ? profile.serviceType : "",
        price: profile.role === "creator" ? profile.price : 0,
        photo: profile.photo || "",
      });

      alert("Profile updated successfully!");

      navigate(
        profile.role === "creator"
          ? "/creator-dashboard"
          : "/business-dashboard"
      );
    } catch (err) {
      console.error("Failed to save profile:", err);
      alert(err.message || "Failed to save profile changes.");
    }
  };

  const uploadPhoto = () => {
    if (!currentUser) return;

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: "dks4wgyhr",
        uploadPreset: "unsigned_uploads",
        folder: `users/${currentUser.uid}`,
        cropping: true,
        croppingAspectRatio: 1,
      },
      (error, result) => {
        if (!error && result.event === "success") {
          setProfile((prev) => ({
            ...prev,
            photo: result.info.secure_url,
          }));
        }
      }
    );

    widget.open();
  };

  if (loading) {
    return (
      <PageLayout>
        <div style={{ padding: "40px" }}>Loading profile…</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="profile-settings-container">
        <h1>Profile Settings</h1>

        <div className="profile-form">
          {/* Profile Photo */}
          <div className="photo-section">
            <img
              src={profile.photo || "/default_user.png"}
              alt=""
              className="profile-photo-edit"
              onError={(e) => {
                e.currentTarget.src = "/default_user.png";
              }}
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

          {/* ZIP */}
          <label>ZIP Code</label>
          <input
            type="text"
            maxLength={5}
            value={profile.zip}
            placeholder="e.g. 45202"
            onChange={(e) =>
              handleChange("zip", e.target.value.replace(/\D/g, ""))
            }
          />

          {/* Role */}
          <label>Your Role</label>
          <select
            value={profile.role}
            onChange={(e) => handleChange("role", e.target.value)}
          >
            <option value="">Select your role</option>
            <option value="creator">Content Creator</option>
            <option value="business">Business</option>
          </select>

          {/* Creator-only fields */}
          {profile.role === "creator" && (
            <>
              <label>Service Type</label>
              <select
                value={profile.serviceType}
                onChange={(e) =>
                  handleChange("serviceType", e.target.value)
                }
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
                onChange={(e) =>
                  handleChange("price", Number(e.target.value))
                }
              />
            </>
          )}

          <button className="btn save-btn" onClick={saveProfile}>
            Save Changes
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
