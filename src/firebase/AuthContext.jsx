import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db, rtdb } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  ref,
  onValue,
  set,
  onDisconnect,
} from "firebase/database";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let rtdbStatusRef = null;
    let connectedRef = null;

    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // 🔹 Load Firestore profile
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        setProfile(snap.data());
      } else {
        // Ensure user doc exists
        await setDoc(userRef, {
          email: user.email,
          createdAt: new Date(),
          isOnline: true,
          lastSeen: new Date(),
        });
        setProfile({ email: user.email });
      }

      // PRESENCE SYSTEM STARTS HERE

      rtdbStatusRef = ref(rtdb, "/status/" + user.uid);
      connectedRef = ref(rtdb, ".info/connected");

      const isOffline = {
        state: "offline",
        last_changed: Date.now(),
      };

      const isOnline = {
        state: "online",
        last_changed: Date.now(),
      };

      // Listen to connection state
      onValue(connectedRef, async (snapshot) => {
        if (snapshot.val() === false) return;

        // When user disconnects
        await onDisconnect(rtdbStatusRef).set(isOffline);

        // When user connects
        await set(rtdbStatusRef, isOnline);
      });

      // Mirror RTDB → Firestore
      onValue(rtdbStatusRef, async (snapshot) => {
        const status = snapshot.val();
        if (!status) return;

        await updateDoc(userRef, {
          isOnline: status.state === "online",
          lastSeen: new Date(status.last_changed),
        });
      });

      setLoading(false);
    });

    return () => {
      unsub();
    };
  }, []);

  // 🔹 Logout
  async function logout() {
    if (currentUser) {
      const userRef = doc(db, "users", currentUser.uid);

      // Force offline immediately
      await updateDoc(userRef, {
        isOnline: false,
        lastSeen: new Date(),
      });
    }

    await signOut(auth);
    setCurrentUser(null);
    setProfile(null);
  }

  const value = {
    currentUser,
    profile,
    loading,
    logout,
    isCreator:
      profile?.role?.toLowerCase() === "creator" ||
      profile?.role?.toLowerCase() === "content creator",
    isBusiness: profile?.role?.toLowerCase() === "business",
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
