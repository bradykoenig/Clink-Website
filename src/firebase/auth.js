import { auth, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

// LOGIN
export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);

  const userRef = doc(db, "users", cred.user.uid);
  const snap = await getDoc(userRef);

  return {
    user: cred.user,
    profile: snap.exists() ? snap.data() : null,
  };
}

// REGISTER
export async function registerUser({ email, password, role }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    email,
    role,                 // "creator" | "business"
    name: "",
    bio: "",
    photo: "",
    serviceType: "",
    price: null,
    portfolio: [],
    createdAt: serverTimestamp(),
  });

  return cred;
}
