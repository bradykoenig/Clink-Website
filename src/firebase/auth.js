import { auth, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile,
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

  if (!cred.user.emailVerified) {
    throw new Error("Email not verified");
  }

  const userRef = doc(db, "users", cred.user.uid);
  const snap = await getDoc(userRef);

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
  firstName,
  lastName,
  fullName,
  serviceType,
  price,
}) {
  const cred = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = cred.user;

  // ✅ Update Firebase Auth display name
  await updateProfile(user, {
    displayName: fullName,
  });

  // ✅ Send verification email
  await sendEmailVerification(user, {
    url: window.location.origin,
  });

  // ✅ Create Firestore user
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email,
    role,
    zip,
    location,

    // Name fields
    firstName,
    lastName,
    fullName,
    name: fullName,

    // Creator-only fields
    serviceType: role === "creator" ? serviceType || "" : "",
    price: role === "creator" ? price || null : null,

    // Shared profile fields
    bio: "",
    photo: "",
    portfolio: [],

    emailVerified: false,
    createdAt: serverTimestamp(),
  });

  return cred;
}

/* ======================
   LOGOUT
====================== */
export async function logoutUser() {
  await signOut(auth);
}
