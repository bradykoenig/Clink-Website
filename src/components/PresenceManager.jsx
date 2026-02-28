import { useEffect } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  ref,
  onValue,
  onDisconnect,
  set,
  serverTimestamp as rtdbTimestamp,
} from "firebase/database";
import { db, rtdb } from "../firebase/firebase";
import { useAuth } from "../firebase/AuthContext";

export default function PresenceManager() {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser?.uid) return;

    const uid = currentUser.uid;

    const userRef = doc(db, "users", uid);

    const statusRef = ref(rtdb, `/status/${uid}`);
    const connectedRef = ref(rtdb, ".info/connected");

    const onlineState = {
      state: "online",
      last_changed: rtdbTimestamp(),
    };

    const offlineState = {
      state: "offline",
      last_changed: rtdbTimestamp(),
    };

    const unsubscribe = onValue(connectedRef, async (snap) => {
      if (snap.val() === false) return;

      // When connection drops, auto mark offline
      await onDisconnect(statusRef).set(offlineState);

      // Mark online in RTDB
      await set(statusRef, onlineState);

      // Mirror to Firestore
      try {
        await updateDoc(userRef, {
          isOnline: true,
          lastSeen: serverTimestamp(),
        });
      } catch (err) {
        console.warn("Firestore online update failed:", err.message);
      }
    });

    // Cleanup
    return () => {
      unsubscribe();

      set(statusRef, offlineState);

      updateDoc(userRef, {
        isOnline: false,
        lastSeen: serverTimestamp(),
      }).catch(() => {});
    };
  }, [currentUser]);

  return null;
}
