import { auth, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

/* ======================
   LOGIN
====================== */
export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);

  // Block unverified users
  if (!cred.user.emailVerified) {
    throw new Error("Email not verified");
  }

  const userRef = doc(db, "users", cred.user.uid);
  const snap = await getDoc(userRef);

  // Sync verification flag in Firestore
  if (snap.exists() && snap.data().emailVerified !== true) {
    await updateDoc(userRef, { emailVerified: true });
  }

  return {
    user: cred.user,
    profile: snap.exists() ? snap.data() : null,
  };
}

/* ======================
   REGISTER
====================== */
export async function registerUser({
  email,
  password,
  role,
  zip,
  location,
}) {
  const cred = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = cred.user;

  // Send verification email
  await sendEmailVerification(user, {
    url: window.location.origin,
  });

  // Create Firestore user WITH ZIP + LOCATION
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email,
    role,
    zip,
    location,
    name: "",
    bio: "",
    photo: "",
    serviceType: "",
    price: null,
    portfolio: [],
    emailVerified: false,
    createdAt: serverTimestamp(),
  });

  // 🚫 DO NOT SIGN OUT HERE

  return cred;
}

/* ======================
   LOGOUT
====================== */
export async function logoutUser() {
  await signOut(auth);
}
