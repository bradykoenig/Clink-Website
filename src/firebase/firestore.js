import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";

// Create or update user profile
export const saveUserProfile = async (userId, data) => {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, data, { merge: true });
};

// Fetch single user profile
export const getUserProfile = async (userId) => {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data() : null;
};

// Get all creators
export const getCreators = async () => {
  const querySnap = await getDocs(collection(db, "creators"));
  return querySnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Create review
export const addReview = async (creatorId, reviewData) => {
  const ref = collection(db, "creators", creatorId, "reviews");
  await addDoc(ref, reviewData);
};
