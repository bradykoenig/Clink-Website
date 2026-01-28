import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        setProfile(snap.exists() ? snap.data() : null);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  // ✅ LOGOUT FUNCTION (THIS WAS MISSING)
  async function logout() {
    await signOut(auth);
    setCurrentUser(null);
    setProfile(null);
  }

  const value = {
    currentUser,
    profile,
    loading,
    logout, // ✅ EXPOSE IT
    isCreator: profile?.role === "creator",
    isBusiness: profile?.role === "business",
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
