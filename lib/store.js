// Minimal JSON-file persistence, standing in for a real database.
// Swap this out for Postgres/Mongo/etc. — the read/write interface below is
// the contract the rest of the app relies on, so routes shouldn't need to
// change much when the real DB is wired in.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DB_FILE = path.join(__dirname, "..", "data", "db.json");

function load() {
  if (!fs.existsSync(DB_FILE)) {
    return { users: [], agents: [], itineraries: [], agentReviews: [] };
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function save(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function id() {
  return crypto.randomBytes(8).toString("hex");
}

function hashPassword(pw) {
  return crypto.createHash("sha256").update(pw).digest("hex");
}

// ---- Users ----
function createUser({ name, email, password }) {
  const db = load();
  if (db.users.find(u => u.email === email)) {
    throw new Error("An account with this email already exists.");
  }
  const user = {
    id: id(), name, email, passwordHash: hashPassword(password),
    subscription: { plan: "free", updatedAt: new Date().toISOString() },
    createdAt: new Date().toISOString()
  };
  db.users.push(user);
  save(db);
  return { id: user.id, name: user.name, email: user.email, subscription: user.subscription };
}

function authenticateUser({ email, password }) {
  const db = load();
  const user = db.users.find(u => u.email === email);
  if (!user || user.passwordHash !== hashPassword(password)) {
    throw new Error("Invalid email or password.");
  }
  return { id: user.id, name: user.name, email: user.email, subscription: user.subscription || { plan: "free" } };
}

function setUserSubscription({ userId, plan, orderId, paymentId }) {
  const db = load();
  const user = db.users.find(u => u.id === userId);
  if (!user) throw new Error("User not found.");
  user.subscription = { plan, orderId, paymentId, updatedAt: new Date().toISOString() };
  save(db);
  return user.subscription;
}

// ---- Agents ----
function registerAgent({ name, email, region, phone }) {
  const db = load();
  const agent = {
    id: id(), name, email, phone, region,
    status: "pending_background_check", // pending_background_check | approved | rejected
    creditPoints: 0,
    ratingSum: 0,
    ratingCount: 0,
    createdAt: new Date().toISOString()
  };
  db.agents.push(agent);
  save(db);
  return agent;
}

function listAgents({ region, approvedOnly = true } = {}) {
  const db = load();
  return db.agents
    .filter(a => (!region || a.region === region))
    .filter(a => (!approvedOnly || a.status === "approved"))
    .map(a => ({
      ...a,
      averageRating: a.ratingCount ? +(a.ratingSum / a.ratingCount).toFixed(1) : null
    }));
}

function reviewAgent({ agentId, rating, comment, userId }) {
  const db = load();
  const agent = db.agents.find(a => a.id === agentId);
  if (!agent) throw new Error("Agent not found.");
  agent.ratingSum += rating;
  agent.ratingCount += 1;
  agent.creditPoints += 1;
  db.agentReviews.push({ id: id(), agentId, userId, rating, comment, createdAt: new Date().toISOString() });
  save(db);
  return agent;
}

// ---- Saved itineraries ----
function saveItinerary({ userId, itinerary }) {
  const db = load();
  const record = { id: id(), userId, itinerary, savedAt: new Date().toISOString() };
  db.itineraries.push(record);
  save(db);
  return record;
}

function getItinerary(itineraryId) {
  const db = load();
  return db.itineraries.find(i => i.id === itineraryId) || null;
}

function listItinerariesForUser(userId) {
  const db = load();
  return db.itineraries.filter(i => i.userId === userId);
}

module.exports = {
  createUser, authenticateUser, setUserSubscription,
  registerAgent, listAgents, reviewAgent,
  saveItinerary, getItinerary, listItinerariesForUser
};
