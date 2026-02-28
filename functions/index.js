const admin = require("firebase-admin");
const Stripe = require("stripe");
const sgMail = require("@sendgrid/mail");

admin.initializeApp();
const db = admin.firestore();

// ---------------------------
// SendGrid Helper
// ---------------------------
let sendgridInitialized = false;

function initSendgrid() {
  if (!sendgridInitialized) {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("Missing SENDGRID_API_KEY");
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    sendgridInitialized = true;
  }
}

async function sendEmail({ to, subject, title, preview, bodyHtml }) {
  initSendgrid();

  const year = new Date().getFullYear();

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    
    <div style="display:none;max-height:0;overflow:hidden;">${preview}</div>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:30px 0;">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">

            <!-- Header -->
            <tr>
              <td style="background:#111827;padding:24px;text-align:center;">
                <img src="https://clinkapp.org/clink-logo.png"
                  width="140"
                  style="display:block;margin:auto;" />
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px 30px 10px 30px;">
                <h2 style="margin-top:0;color:#111827;">${title}</h2>
                ${bodyHtml}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px 30px 30px 30px;color:#6b7280;font-size:12px;">
                <hr style="border:none;border-top:1px solid #e5e7eb;margin-bottom:15px;" />
                <p style="margin:0;">
                  © ${year} Clink. All rights reserved.
                </p>
                <p style="margin:5px 0 0 0;">
                  You're receiving this email because you have an account on Clink.
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;

  await sgMail.send({
    to,
    from: "Clink <no-reply@clinkapp.org>",
    subject,
    html,
  });
}



const functions = require("firebase-functions");
const { onCall, onRequest } = require("firebase-functions/v2/https");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");

// ----------------------------------------------------------
// Create Stripe Checkout Session
// ----------------------------------------------------------
exports.createCheckoutSession = onCall(
  {
    region: "us-central1",
    secrets: ["STRIPE_SECRET_KEY", "SENDGRID_API_KEY"],
  },
  async (request) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    if (!request.auth) throw new Error("Not authenticated.");

    const businessId = request.auth.uid;
    const { creatorId } = request.data;

    if (!creatorId) throw new Error("Missing creatorId.");

    // Pull business (for name)
    const businessSnap = await db.collection("users").doc(businessId).get();
    if (!businessSnap.exists) throw new Error("Business user not found.");
    const business = businessSnap.data();

    // Pull creator (for price + stripeAccountId)
    const creatorSnap = await db.collection("users").doc(creatorId).get();
    if (!creatorSnap.exists) throw new Error("Creator not found.");
    const creator = creatorSnap.data();

    const price = Number(creator.price);
    if (Number.isNaN(price) || price <= 0) {
      throw new Error("Creator price missing/invalid.");
    }

    // Creator must have Stripe Connect acct for payouts
    const destination = creator.stripeAccountId;
    if (!destination) {
      throw new Error("Creator has not connected Stripe.");
    }

    // Create service immediately so dashboards show it
    const serviceRef = await db.collection("services").add({
      creatorId,
      creatorName: creator.name || "Creator",
      creatorPhoto: creator.photo || "",
      businessId,
      businessName: business.name || "Business",
      businessPhoto: business.photo || "",
      price,
      status: "payment_pending",
      paymentStatus: "unpaid",
      createdAt: Date.now(),
      stripeSessionId: null,
      stripePaymentIntentId: null,
      platformFeePercent: 0.12, // 12% cut
      media: [],
      revisionCount: 0,
      creatorRequestedCompletion: false,
      completedAt: null,
    });

    const serviceId = serviceRef.id;

    // Pick base URL dynamically (dev vs prod)
    const origin =
      request.rawRequest?.headers?.origin ||
      request.rawRequest?.headers?.referer ||
      "https://clinkapp.org";

    const baseUrl = String(origin).includes("localhost")
      ? "http://localhost:5173"
      : "https://clinkapp.org";

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],

        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: Math.round(price * 100),
              product_data: {
                name: `Clink Project – ${creator.name || "Creator"}`,
              },
            },
            quantity: 1,
          },
        ],

        // 12% platform fee + payout to creator
        payment_intent_data: {
          application_fee_amount: Math.round(price * 0.12 * 100),
          transfer_data: { destination },
        },

        success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&serviceId=${serviceId}`,
        cancel_url: `${baseUrl}/payment-cancel?serviceId=${serviceId}`,

        metadata: {
          serviceId,
          creatorId,
          businessId,
          price: String(price),
        },
      });

      await serviceRef.update({
        stripeSessionId: session.id,
      });

      return { url: session.url, serviceId };
    } catch (err) {
      console.error("Stripe session creation failed:", err);

      await serviceRef.update({
        status: "payment_failed",
        paymentStatus: "failed",
      });

      throw new Error(
        err?.raw?.message || err?.message || "Stripe checkout failed."
      );
    }
  }
);

exports.finalizeStripeOnboarding = onCall(
  {
    region: "us-central1",
    secrets: ["STRIPE_SECRET_KEY", "SENDGRID_API_KEY"],
  },
  async (request) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    if (!request.auth) throw new Error("Not authenticated.");

    const uid = request.auth.uid;
    const { nonce } = request.data || {};
    if (!nonce) throw new Error("Missing nonce.");

    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) throw new Error("User not found.");

    const user = userSnap.data();

    // If the browser restored the wrong Firebase user, this FAILS here.
    if (!user.stripeOnboardingNonce || user.stripeOnboardingNonce !== nonce) {
      throw new Error(
        "Stripe onboarding session mismatch. Log out and log into the correct account, then try again."
      );
    }

    if (!user.stripeAccountId) throw new Error("Missing stripeAccountId.");

    const acct = await stripe.accounts.retrieve(user.stripeAccountId);

    const verified =
      acct.details_submitted === true &&
      acct.charges_enabled === true &&
      acct.payouts_enabled === true;

    await userRef.update({
      stripeVerified: verified,
      stripeChargesEnabled: !!acct.charges_enabled,
      stripePayoutsEnabled: !!acct.payouts_enabled,
      stripeDetailsSubmitted: !!acct.details_submitted,
      stripeOnboardingNonce: admin.firestore.FieldValue.delete(),
      stripeOnboardedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { ok: true, verified };
  }
);


// ----------------------------------------------------------
// Complete Service - Customer Reviews (v2)
// ----------------------------------------------------------
exports.completeServiceWithReview = onCall(
  {
    region: "us-central1",
    secrets: ["SENDGRID_API_KEY"],
  },
  async (request) => {
    if (!request.auth) {
      throw new Error("Not logged in.");
    }

    const { serviceId, rating, reviewText } = request.data;

    if (!serviceId) {
      throw new Error("Missing serviceId.");
    }

    const r = Number(rating);
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      throw new Error("Rating must be 1-5.");
    }

    const text = (reviewText || "").trim();
    if (!text) {
      throw new Error("Review text required.");
    }

    const serviceRef = db.collection("services").doc(serviceId);
    const serviceSnap = await serviceRef.get();

    if (!serviceSnap.exists) {
      throw new Error("Service not found.");
    }

    const service = serviceSnap.data();

    // Only business can complete
    if (service.businessId !== request.auth.uid) {
      throw new Error("Not allowed.");
    }

    if (service.status === "completed") {
      return { ok: true, alreadyCompleted: true };
    }

    const creatorId = service.creatorId;
    const creatorRef = db.collection("users").doc(creatorId);
    const businessRef = db.collection("users").doc(service.businessId);

    const [creatorSnap, businessSnap] = await Promise.all([
      creatorRef.get(),
      businessRef.get(),
    ]);

    const businessName = businessSnap.exists
      ? businessSnap.data().name || "Business"
      : "Business";

    const reviewsRef = creatorRef.collection("reviews");

    await db.runTransaction(async (tx) => {
      const newReviewDoc = reviewsRef.doc();

      tx.set(newReviewDoc, {
        rating: r,
        text,
        businessId: service.businessId,
        businessName,
        serviceId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const creatorData = creatorSnap.exists ? creatorSnap.data() : {};
      const prevCount = Number(creatorData.reviewCount || 0);
      const prevAvg = Number(creatorData.rating || 0);

      const prevTotal = prevAvg * prevCount;
      const newCount = prevCount + 1;
      const newAvg = (prevTotal + r) / newCount;

      tx.set(
        creatorRef,
        {
          rating: Number(newAvg.toFixed(2)),
          reviewCount: newCount,
        },
        { merge: true }
      );

      tx.update(serviceRef, {
        status: "completed",
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    // ---------------------------
    // Notify creator of review
    // ---------------------------
    if (creatorSnap.exists) {
      await sendEmail({
        to: creatorSnap.data().email,
        subject: "You received a new review ⭐",
        title: "New Review Received",
        preview: "A client has left you feedback.",
        bodyHtml: `
          <p><strong>${businessName}</strong> left you a review.</p>

          <div style="background:#f9fafb;padding:15px;border-radius:8px;margin:20px 0;">
            <p style="margin:0;font-size:18px;"><strong>${"⭐".repeat(r)}</strong></p>
            <blockquote style="margin:10px 0 0 0;font-style:italic;color:#374151;">
              "${text}"
            </blockquote>
          </div>

          <p>Keep up the great work and continue building your reputation on Clink.</p>

          <div style="text-align:center;margin:25px 0;">
            <a href="https://clinkapp.org/profile"
              style="background:#111827;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">
              View Your Profile
            </a>
          </div>
        `,
      });
    }

    return { ok: true };
  }
);


exports.createStripeAccountLink = onCall(
  {
    region: "us-central1",
    secrets: ["STRIPE_SECRET_KEY", "SENDGRID_API_KEY"],
  },
  async (request) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    if (!request.auth) throw new Error("Authentication required.");

    const uid = request.auth.uid;
    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) throw new Error("User not found.");

    const user = userSnap.data();

    // Only creators can connect Stripe
    if (user.role !== "creator") {
      throw new Error("Only creators can connect Stripe.");
    }

    let accountId = user.stripeAccountId;

    // Create Stripe Connect account if not exists
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email,
      });

      accountId = account.id;
      await userRef.update({ stripeAccountId: accountId });
    }

    // One-time nonce to bind return flow to this uid
    const nonce =
      Math.random().toString(36).slice(2) + Date.now().toString(36);

    await userRef.update({
      stripeOnboardingNonce: nonce,
      stripeOnboardingStartedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Base URL (dev vs prod)
    const origin =
      request.rawRequest?.headers?.origin ||
      request.rawRequest?.headers?.referer ||
      "https://clinkapp.org";

    const baseUrl = String(origin).includes("localhost")
      ? "http://localhost:5173"
      : "https://clinkapp.org";

    // IMPORTANT: return to stripe-return with nonce
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/stripe-refresh`,
      return_url: `${baseUrl}/stripe-return?nonce=${encodeURIComponent(nonce)}`,
      type: "account_onboarding",
    });

    return { url: accountLink.url };
  }
);

// ----------------------------------------------------------
// Stripe Webhook
// ----------------------------------------------------------
exports.stripeWebhook = onRequest(
  {
    region: "us-central1",
    secrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "SENDGRID_API_KEY"],
  },
  async (req, res) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      // Only trust verified events past this point

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        const { serviceId } = session.metadata;

        if (!serviceId) {
          console.error("Missing serviceId in metadata");
          return res.sendStatus(400);
        }

        const serviceRef = db.collection("services").doc(serviceId);
        const serviceSnap = await serviceRef.get();

        if (!serviceSnap.exists) {
          console.error("Service not found for session:", session.id);
          return res.sendStatus(400);
        }

        await serviceRef.update({
          paymentStatus: "paid",
          status: "pending",
          paidAt: Date.now(),
          stripePaymentIntentId: session.payment_intent || null,
        });

        // ---------------------------
        // Send payment confirmation emails
        // ---------------------------
        const serviceSnap2 = await serviceRef.get();
        const serviceData = serviceSnap2.data();

        const creatorSnap = await db.collection("users").doc(serviceData.creatorId).get();
        const businessSnap = await db.collection("users").doc(serviceData.businessId).get();

        if (creatorSnap.exists && businessSnap.exists) {
          const creator = creatorSnap.data();
          const business = businessSnap.data();

          await sendEmail({
            to: creator.email,
            subject: "You’ve been hired on Clink 🎉",
            title: "You’ve Been Hired!",
            preview: "A new project has been created for you.",
            bodyHtml: `
              <p><strong>${business.name}</strong> has hired you for a project.</p>

              <div style="background:#f9fafb;padding:15px;border-radius:8px;margin:20px 0;">
                <p style="margin:0;"><strong>Project Price:</strong> $${Number(serviceData.price).toFixed(2)}</p>
                <p style="margin:5px 0 0 0;"><strong>Status:</strong> Payment confirmed</p>
              </div>

              <p>You can now begin communicating with the business and uploading your work.</p>

              <div style="text-align:center;margin:25px 0;">
                <a href="https://clinkapp.org/dashboard"
                  style="background:#111827;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">
                  View Project
                </a>
              </div>
            `,
          });

          await sendEmail({
            to: business.email,
            subject: "Payment Confirmed – Clink",
            title: "Payment Successful",
            preview: "Your payment was processed successfully.",
            bodyHtml: `
              <p>Your payment has been successfully processed.</p>

              <div style="background:#f9fafb;padding:15px;border-radius:8px;margin:20px 0;">
                <p style="margin:0;"><strong>Creator:</strong> ${creator.name}</p>
                <p style="margin:5px 0 0 0;"><strong>Amount Paid:</strong> $${Number(serviceData.price).toFixed(2)}</p>
              </div>

              <p>The creator has been notified and your project is now active.</p>

              <div style="text-align:center;margin:25px 0;">
                <a href="https://clinkapp.org/dashboard"
                  style="background:#111827;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">
                  View Project
                </a>
              </div>
            `,
          });
        }

        console.log("Service marked paid:", serviceId);
      }

      res.sendStatus(200);
    } catch (err) {
      console.error("Webhook handler error:", err);
      res.sendStatus(500);
    }
  }
);

// -------------------------------
// Finalize Checkout (marks service as paid)
// Call this from PaymentSuccess page
// -------------------------------
exports.finalizeCheckout = onCall(
  {
    region: "us-central1",
    secrets: ["STRIPE_SECRET_KEY", "SENDGRID_API_KEY"],
  },
  async (request) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    if (!request.auth) throw new Error("Not authenticated.");

    const { sessionId, serviceId } = request.data;
    if (!sessionId || !serviceId) throw new Error("Missing sessionId/serviceId.");

    const serviceRef = db.collection("services").doc(serviceId);
    const serviceSnap = await serviceRef.get();
    if (!serviceSnap.exists) throw new Error("Service not found.");

    const service = serviceSnap.data();

    // Only the business who started it can finalize
    if (service.businessId !== request.auth.uid) throw new Error("Not authorized.");

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Stripe fields to check
    const paid =
      session.payment_status === "paid" ||
      session.status === "complete";

    if (!paid) {
      return { ok: false, status: session.payment_status || session.status };
    }

    await serviceRef.update({
      paymentStatus: "paid",
      status: "pending", // now it becomes a real job request
      paidAt: Date.now(),
      stripePaymentIntentId: session.payment_intent || null,
    });

    return { ok: true };
  }
);

// ----------------------------------------------------------
// Refund Trigger
// ----------------------------------------------------------
exports.refundPayment = onDocumentUpdated(
  {
    document: "services/{serviceId}",
    region: "us-central1",
    secrets: ["STRIPE_SECRET_KEY", "SENDGRID_API_KEY"],
  },
  async (event) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const before = event.data.before.data();
    const after = event.data.after.data();

    if (!before || !after) return;

    if (
      before.status !== "canceled_by_creator" &&
      after.status === "canceled_by_creator"
    ) {
      const sessionId = after.stripeSessionId;
      if (!sessionId) return;

      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        await stripe.refunds.create({
          payment_intent: session.payment_intent,
        });

        await event.data.after.ref.update({
          paymentStatus: "refunded",
          status: "canceled_refunded",
        });

        // ---------------------------
        // Notify business of refund
        // ---------------------------
        const service = after;

        const businessSnap = await db.collection("users").doc(service.businessId).get();

        if (businessSnap.exists) {
          await sendEmail({
            to: businessSnap.data().email,
            subject: "Your Clink payment was refunded",
            title: "Refund Processed",
            preview: "Your payment has been refunded.",
            bodyHtml: `
              <p>The creator has canceled your project.</p>

              <div style="background:#f9fafb;padding:15px;border-radius:8px;margin:20px 0;">
                <p style="margin:0;"><strong>Amount Refunded:</strong> $${Number(service.price).toFixed(2)}</p>
                <p style="margin:5px 0 0 0;">Funds will appear back in your original payment method within 5–10 business days.</p>
              </div>

              <p>If you’d like to hire another creator, you can explore available creators anytime.</p>

              <div style="text-align:center;margin:25px 0;">
                <a href="https://clinkapp.org/creators"
                  style="background:#111827;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">
                  Browse Creators
                </a>
              </div>
            `,
          });
        }

        console.log("Refund successful.");
      } catch (err) {
        console.error("Refund failed:", err);
      }
    }
  }
);

// ----------------------------------------------------------
// Notify Business When Creator Accepts
// ----------------------------------------------------------
exports.notifyBusinessOnAcceptance = onDocumentUpdated(
  {
    document: "services/{serviceId}",
    region: "us-central1",
    secrets: ["SENDGRID_API_KEY"],
  },
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();

    if (!before || !after) return;

    // Detect pending -> in_progress transition
    if (
      before.status === "pending" &&
      after.status === "in_progress"
    ) {
      const service = after;

      const businessSnap = await db
        .collection("users")
        .doc(service.businessId)
        .get();

      const creatorSnap = await db
        .collection("users")
        .doc(service.creatorId)
        .get();

      if (!businessSnap.exists || !creatorSnap.exists) return;

      const business = businessSnap.data();
      const creator = creatorSnap.data();

      await sendEmail({
        to: business.email,
        subject: "Your Project Has Been Accepted 🎉",
        title: "Creator Accepted Your Project",
        preview: "Your creator is ready to begin.",
        bodyHtml: `
          <p><strong>${creator.name}</strong> has accepted your project.</p>

          <div style="background:#f9fafb;padding:15px;border-radius:8px;margin:20px 0;">
            <p style="margin:0;"><strong>Project Price:</strong> $${Number(service.price).toFixed(2)}</p>
            <p style="margin:5px 0 0 0;"><strong>Status:</strong> In Progress</p>
          </div>

          <p>You can now communicate and begin collaborating.</p>

          <div style="text-align:center;margin:25px 0;">
            <a href="https://clinkapp.org/service/${event.params.serviceId}"
              style="background:#111827;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">
              View Project
            </a>
          </div>
        `,
      });

      console.log("Acceptance email sent.");
    }
  }
);
