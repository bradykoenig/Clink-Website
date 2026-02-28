import PageLayout from "../layouts/PageLayout";
import { auth, db } from "../firebase/firebase";
import { reload } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function VerificationConfirmation() {
  const [status, setStatus] = useState("Finalizing verification...");

  useEffect(() => {
    const finalize = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          setStatus("No authenticated user found.");
          return;
        }

        // Force refresh auth state
        await reload(user);

        const freshUser = auth.currentUser;

        if (!freshUser?.emailVerified) {
          setStatus("Email is not verified yet.");
          return;
        }

        // Update Firestore flag
        await updateDoc(doc(db, "users", freshUser.uid), {
          emailVerified: true,
        });

        // Get role
        const snap = await getDoc(doc(db, "users", freshUser.uid));
        const role = snap.exists() ? snap.data()?.role : null;

        setStatus("Verification successful! Redirecting...");

        setTimeout(() => {
            window.location.href = "/";
        }, 1000);

      } catch (err) {
        console.error(err);
        setStatus("Verification failed.");
      }
    };

    finalize();
  }, []);

  return (
    <PageLayout>
      <div style={{ padding: 60, textAlign: "center" }}>
        <h1>Email Verification</h1>
        <p style={{ marginTop: 20 }}>{status}</p>
      </div>
    </PageLayout>
  );
}
