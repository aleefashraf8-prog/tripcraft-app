// Razorpay integration — order creation + payment verification.
//
// Uses only Node's built-in `https` and `crypto` modules (no npm install
// needed), consistent with the rest of this scaffold. Razorpay's API is
// plain REST, so this is a thin wrapper, not their official SDK.
//
// SETUP (see README for full steps):
//   1. Sign up at https://dashboard.razorpay.com — no business KYC needed
//      to get Test Mode keys.
//   2. Dashboard > Settings > API Keys > Generate Test Key.
//   3. Set environment variables before starting the server:
//        RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
//        RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
//   4. Restart the server. Until these are set, payment endpoints return a
//      clearly-marked stub response instead of failing outright, so the
//      rest of the app keeps working.

const https = require("https");
const crypto = require("crypto");

// Placeholder pricing — align with whatever you finalize in the SRS pricing
// table. Amounts are in INR; Razorpay's API wants paise (INR * 100).
const PLANS = {
  level1: { name: "Subscription — Level 1", priceINR: 149 },
  level2: { name: "Subscription — Level 2", priceINR: 299 },
  level3: { name: "Subscription — Level 3", priceINR: 499 }
};

function isConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function authHeader() {
  const token = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  return `Basic ${token}`;
}

function createOrder({ planId, receipt }) {
  return new Promise((resolve, reject) => {
    const plan = PLANS[planId];
    if (!plan) return reject(new Error(`Unknown plan: ${planId}`));

    if (!isConfigured()) {
      // Stubbed response so the rest of the flow (frontend, UI) can still be
      // built and demoed before real keys exist.
      return resolve({
        mocked: true,
        note: "Razorpay keys not set (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET). Returning a stub order — see README.",
        id: "order_STUB_" + crypto.randomBytes(6).toString("hex"),
        amount: plan.priceINR * 100,
        currency: "INR",
        plan: planId
      });
    }

    const payload = JSON.stringify({
      amount: plan.priceINR * 100,
      currency: "INR",
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1
    });

    const req = https.request(
      {
        hostname: "api.razorpay.com",
        path: "/v1/orders",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
          Authorization: authHeader()
        }
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 400) return reject(new Error(parsed.error?.description || "Razorpay order creation failed."));
            resolve({ ...parsed, plan: planId, mocked: false });
          } catch (e) {
            reject(new Error("Unexpected response from Razorpay."));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

// Verifies the signature Razorpay Checkout returns after a successful
// payment: HMAC-SHA256 of "order_id|payment_id" using the key secret.
function verifyPaymentSignature({ orderId, paymentId, signature }) {
  if (!isConfigured()) {
    return { verified: false, mocked: true, note: "Razorpay keys not set — cannot verify real signatures. See README." };
  }
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return { verified: expected === signature, mocked: false };
}

module.exports = { PLANS, isConfigured, createOrder, verifyPaymentSignature };
