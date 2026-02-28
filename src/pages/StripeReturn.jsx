import PageLayout from "../layouts/PageLayout";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/firebase";
import { useAuth } from "../firebase/AuthContext";

export default function StripeReturn() {
  const { currentUser } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [msg, setMsg] = useState("Finalizing Stripe connection...");
  const [err, setErr] = useState("");

  useEffect(() => {
    const nonce = params.get("nonce");

    (async () => {
      try {
        if (!currentUser) throw new Error("You are not logged in.");
        if (!nonce) throw new Error("Missing nonce.");

        const fn = httpsCallable(functions, "finalizeStripeOnboarding");
        const res = await fn({ nonce });

        setMsg(
          res.data.verified
            ? "Stripe connected ✅"
            : "Stripe connected, but onboarding is incomplete."
        );

        setTimeout(() => navigate("/creator-dashboard"), 900);
      } catch (e) {
        const message =
          e?.message ||
          e?.details?.message ||
          "Could not finalize Stripe connection.";

        setErr(message);
        setMsg("Stripe connection could not be finalized.");
      }
    })();
  }, [currentUser]);

  return (
    <PageLayout>
      <div style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
        <h2>{msg}</h2>

        {err && (
          <div style={{ marginTop: 12 }}>
            <p style={{ color: "#c0392b", fontWeight: 600 }}>{err}</p>
            <p style={{ marginTop: 6 }}>
              If you were redirected into the wrong account, open a fresh
              incognito window (or a different Chrome profile), log into the
              correct creator, then click <b>Connect Stripe</b> again.
            </p>
          </div>
        )}

        {!err && (
          <p style={{ marginTop: 10 }}>
            Redirecting you back to your dashboard...
          </p>
        )}
      </div>
    </PageLayout>
  );
}
