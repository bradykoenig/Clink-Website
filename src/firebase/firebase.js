import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBZ_zg-2ExnOG14q9SWit6UrQmBHjBvcLU",
  authDomain: "clink-ae106.firebaseapp.com",
  projectId: "clink-ae106",
  storageBucket: "clink-ae106.firebasestorage.app",
  messagingSenderId: "915781530146",
  appId: "1:915781530146:web:2f5f62300590300c8bd07b",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;
