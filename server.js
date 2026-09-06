// TripCraft backend — reference implementation, zero external dependencies
// (built on Node's built-in http module so it runs anywhere without npm
// install). Swap in Express/Fastify/etc. in production if preferred; the
// route logic in lib/ is framework-agnostic and can move as-is.

const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const engine = require("./lib/engine");
const store = require("./lib/store");
const razorpay = require("./lib/razorpay");

const PORT = process.env.PORT || 3001;
const PUBLIC_DIR = path.join(__dirname, "public");

function sendJSON(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); } catch (e) { reject(new Error("Invalid JSON body")); }
    });
    req.on("error", reject);
  });
}

const MIME = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };

function serveStatic(req, res, pathname) {
  let filePath = path.join(PUBLIC_DIR, pathname === "/" ? "index.html" : pathname);
  if (!filePath.startsWith(PUBLIC_DIR)) { res.writeHead(403); return res.end("Forbidden"); }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const method = req.method;

  try {
    // ---- Destinations & places ----
    if (method === "GET" && pathname === "/api/destinations") {
      const list = Object.values(engine.destinations).map(d => ({
        id: d.id, name: d.name, baseCity: d.baseCity, bestMonths: d.bestMonths, stayTiers: d.stayTiers
      }));
      return sendJSON(res, 200, list);
    }

    let m = pathname.match(/^\/api\/destinations\/([\w-]+)\/places$/);
    if (method === "GET" && m) {
      return sendJSON(res, 200, engine.listPlacesWithScores(m[1]));
    }

    m = pathname.match(/^\/api\/destinations\/([\w-]+)$/);
    if (method === "GET" && m) {
      return sendJSON(res, 200, engine.getDestination(m[1]));
    }

    // ---- Itinerary generation ----
    if (method === "POST" && pathname === "/api/itinerary/generate") {
      const body = await readBody(req);
      const result = engine.generateItinerary(body);
      return sendJSON(res, 200, result);
    }

    if (method === "POST" && pathname === "/api/itinerary/save") {
      const body = await readBody(req);
      if (!body.userId || !body.itinerary) return sendJSON(res, 400, { error: "userId and itinerary are required." });
      const record = store.saveItinerary(body);
      return sendJSON(res, 201, record);
    }

    m = pathname.match(/^\/api\/itinerary\/([\w]+)$/);
    if (method === "GET" && m && m[1] !== "generate" && m[1] !== "save") {
      const record = store.getItinerary(m[1]);
      if (!record) return sendJSON(res, 404, { error: "Not found." });
      return sendJSON(res, 200, record);
    }

    if (method === "GET" && pathname === "/api/itinerary" && parsed.query.userId) {
      return sendJSON(res, 200, store.listItinerariesForUser(parsed.query.userId));
    }

    // ---- Auth ----
    if (method === "POST" && pathname === "/api/auth/signup") {
      const body = await readBody(req);
      const user = store.createUser(body);
      return sendJSON(res, 201, user);
    }
    if (method === "POST" && pathname === "/api/auth/login") {
      const body = await readBody(req);
      const user = store.authenticateUser(body);
      return sendJSON(res, 200, user);
    }

    // ---- Agents ----
    if (method === "POST" && pathname === "/api/agents/register") {
      const body = await readBody(req);
      const agent = store.registerAgent(body);
      return sendJSON(res, 201, agent);
    }
    if (method === "GET" && pathname === "/api/agents") {
      return sendJSON(res, 200, store.listAgents({ region: parsed.query.region, approvedOnly: parsed.query.all !== "true" }));
    }
    if (method === "POST" && pathname === "/api/agents/review") {
      const body = await readBody(req);
      const agent = store.reviewAgent(body);
      return sendJSON(res, 200, agent);
    }

    // ---- Payments (Razorpay) ----
    if (method === "GET" && pathname === "/api/payments/plans") {
      return sendJSON(res, 200, { plans: razorpay.PLANS, configured: razorpay.isConfigured() });
    }

    if (method === "POST" && pathname === "/api/payments/create-order") {
      const body = await readBody(req);
      if (!body.planId) return sendJSON(res, 400, { error: "planId is required." });
      const order = await razorpay.createOrder({ planId: body.planId, receipt: body.userId });
      return sendJSON(res, 200, { ...order, keyId: process.env.RAZORPAY_KEY_ID || null });
    }

    if (method === "POST" && pathname === "/api/payments/verify") {
      const body = await readBody(req);
      const { orderId, paymentId, signature, userId, planId } = body;
      if (!orderId || !paymentId || !signature || !userId || !planId) {
        return sendJSON(res, 400, { error: "orderId, paymentId, signature, userId, and planId are all required." });
      }
      const result = razorpay.verifyPaymentSignature({ orderId, paymentId, signature });
      if (!result.verified) {
        return sendJSON(res, 402, { error: "Payment could not be verified.", detail: result });
      }
      const subscription = store.setUserSubscription({ userId, plan: planId, orderId, paymentId });
      return sendJSON(res, 200, { success: true, subscription });
    }

    // ---- Stubs that need real third-party integration in production ----
    if (method === "GET" && pathname === "/api/weather") {
      const destId = parsed.query.destinationId;
      let dest;
      try { dest = engine.getDestination(destId); } catch (e) { return sendJSON(res, 404, { error: "Unknown destination." }); }
      return sendJSON(res, 200, {
        mocked: true,
        note: "Static placeholder — production needs a live weather API (see README).",
        destination: dest.name,
        bestMonths: dest.bestMonths,
        currentConditions: "Not implemented — requires live weather API integration.",
        alerts: []
      });
    }

    if (method === "POST" && pathname === "/api/assistant/chat") {
      const body = await readBody(req);
      return sendJSON(res, 200, {
        mocked: true,
        note: "Stubbed response — production should route this to an LLM (e.g. the Anthropic API) with itinerary/budget context, per SRS FR-31.",
        reply: `(stub) You asked: "${body.message || ""}". A real deployment would generate a grounded answer using the traveler's current itinerary and budget as context.`
      });
    }

    if (method === "POST" && pathname === "/api/sign-translate") {
      return sendJSON(res, 200, {
        mocked: true,
        note: "Stubbed — production needs OCR + translation API integration (see README, FR-17).",
        translatedText: "(stub) Photo received. Real deployment would return OCR + translated text here."
      });
    }

    // ---- Static frontend ----
    if (method === "GET") {
      return serveStatic(req, res, pathname);
    }

    sendJSON(res, 404, { error: "Not found." });
  } catch (err) {
    sendJSON(res, 400, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`TripCraft backend running at http://localhost:${PORT}`);
});
