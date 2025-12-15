// ----------------------------------------------------------
// Firebase Functions v2 + Stripe Backend for Clink
// ----------------------------------------------------------

const admin = require("firebase-admin");
const stripe = require("stripe")("sk_test_51RRGfkQVciB6nxqTYOyjKQol5mHtLAFtZbL4PBBuovGWrXBGyPfws9PNbMfwSu0UsIU2S75S13KgzsqxpCGSf0EX00at6FLOeP"); // replace this with live key in production when finished

admin.initializeApp();
const db = admin.firestore();

// v2 Imports
const { onCall, onRequest } = require("firebase-functions/v2/https");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");

// Allow raw body for Stripe Webhooks
exports.configure = onRequest(
  {
    timeoutSeconds: 5,
    memory: "256MiB",
    region: "us-central1",
    maxInstances: 5,
  },
  (req, res) => res.sendStatus(200)
);


// ----------------------------------------------------------
// 1. Create Stripe Checkout Session (v2)
// ----------------------------------------------------------
exports.createCheckoutSession = onCall(
  { region: "us-central1" },
  async (request) => {
    const { creatorId, creatorStripeAccountId, price, businessId } = request.data;

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],

        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: price * 100,
              product_data: { name: "Clink Project Payment" },
            },
            quantity: 1,
          },
        ],

        payment_intent_data: {
          application_fee_amount: Math.round(price * 0.07 * 100), // 7% fee
          transfer_data: { destination: creatorStripeAccountId },
        },

        success_url: "https://clinkapp.org/payment-success",
        cancel_url: "https://clinkapp.org/payment-cancel",

        metadata: { creatorId, businessId, price },
      });

      return { sessionUrl: session.url };
    } catch (err) {
      console.error("CheckoutSession error:", err);
      throw new Error(err.message);
    }
  }
);


// ----------------------------------------------------------
// 2. Stripe Webhook — Creates Service After Payment (v2)
// ----------------------------------------------------------
exports.stripeWebhook = onRequest(
  {
    region: "us-central1",
    maxInstances: 5,
  },
  async (req, res) => {
    let event = req.body;

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        const creatorId = session.metadata.creatorId;
        const businessId = session.metadata.businessId;
        const price = Number(session.metadata.price);

        await db.collection("services").add({
          creatorId,
          businessId,
          price,
          status: "pending",
          paymentStatus: "paid",
          createdAt: Date.now(),
          stripeSessionId: session.id,
        });

        console.log("Service created for successful payment:", session.id);
      }

      res.sendStatus(200);
    } catch (err) {
      console.error("Webhook Error:", err);
      res.sendStatus(400);
    }
  }
);


// ----------------------------------------------------------
// 3. Refund Trigger — Functions v2 Firestore (Eventarc)
// ----------------------------------------------------------
exports.refundPayment = onDocumentUpdated(
  {
    document: "services/{serviceId}",
    region: "us-central1",
  },
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();

    if (!before || !after) return;

    // Only trigger on creator decline
    if (
      before.status !== "canceled_by_creator" &&
      after.status === "canceled_by_creator"
    ) {
      console.log("Creator declined — issuing refund...");

      const sessionId = after.stripeSessionId;
      if (!sessionId) {
        console.error("Missing stripeSessionId");
        return;
      }

      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const paymentIntentId = session.payment_intent;

        await stripe.refunds.create({
          payment_intent: paymentIntentId,
        });

        await event.data.after.ref.update({
          paymentStatus: "refunded",
          status: "canceled_refunded",
        });

        console.log("Refund successful for:", paymentIntentId);
      } catch (err) {
        console.error("Refund Error:", err);
      }
    }
  }
);
