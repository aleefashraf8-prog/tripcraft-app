# TripCraft — Full-Stack Reference Build

This is a **working scaffold**, not a production app. It exists so the engineering
team has real, runnable code implementing the core logic from the SRS —
itinerary generation, the multi-base stay-splitting logic, place hierarchy
scoring, budget calculation — instead of starting from a blank repo. Treat it
as a first draft to review, argue with, and rebuild pieces of as needed.

## Running it

No external dependencies, no `npm install` needed — everything runs on
Node's built-in modules.

```
node server.js
```

Then open `http://localhost:3001` in a browser. Default port is 3001
(override with `PORT=xxxx node server.js`).

## What's actually implemented

- **Itinerary engine** (`lib/engine.js`) — generates a day-by-day plan from
  destination, trip length, group size, stay tier, budget level, place
  preference mix, and max intensity. Implements:
  - **Place scoring** — composite score blending popularity, accessibility,
    food/stay availability; ranked against the traveler's popular/rare
    preference mix (SRS: Place Discovery & Scoring).
  - **Multi-base stay distribution** — clusters selected places by
    sub-location, orders clusters by distance from the base city, and
    allocates nights per cluster instead of defaulting to one base city for
    the whole trip (SRS: Stay Planning). Trims clusters that don't fit the
    trip length rather than overflowing the requested day count.
  - **Budget calculator** — computed from real stay-tier price ranges,
    per-day travel/food/activity costs, and group size (assumes 2
    travelers/room for stay cost).
- **Backend API** (`server.js`, no framework — plain `http` module) — see
  endpoint list below.
- **Persistence** (`lib/store.js`) — JSON-file backed (`data/db.json`,
  created on first write). Stand-in for a real database; the function
  signatures are the contract to preserve when swapping in Postgres/Mongo/etc.
- **Frontend** (`public/`) — plain HTML/CSS/JS, no build step, calls the API
  directly. Five tabs: Plan, Places, Agents, AI Assistant, Account.

## What's stubbed / needs real integration

These return clearly-marked placeholder data — they exist so the API shape
is right, not because the logic is done:

| Feature | Endpoint | What's needed |
|---|---|---|
| Live weather & alerts | `GET /api/weather` | Real weather API (e.g. OpenWeatherMap, IMD) |
| AI trip assistant | `POST /api/assistant/chat` | LLM integration (e.g. Anthropic API) with itinerary/budget as context |
| Sign/board translation | `POST /api/sign-translate` | OCR + translation API, image upload handling |
| Live hotel pricing/reviews | *(not built)* | Booking.com/OTA affiliate API or manual curation pipeline |
| Google-referenced price comparison | *(not built)* | Google Places/Maps API |

## Payments (Razorpay) — implemented

`lib/razorpay.js` implements real order creation and payment signature
verification against Razorpay's REST API, using only Node's built-in
`https`/`crypto` — no SDK install needed. Without keys set, it runs in a
clearly-labeled stub mode so the rest of the app still works.

**To activate real Test Mode payments:**

1. Sign up at https://dashboard.razorpay.com — email/phone only, **no
   business KYC required for Test Mode**.
2. In the dashboard: Settings → API Keys → Generate Test Key. You'll get a
   Key ID (starts `rzp_test_`) and a Key Secret.
3. Before starting the server, set both as environment variables:
   ```
   export RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
   export RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
   node server.js
   ```
   (On Windows Command Prompt, use `set` instead of `export`.)
4. Reload the app — the Account tab will show "Razorpay is configured" and
   the Subscribe buttons will open a real Razorpay Test Mode checkout. Use
   Razorpay's published test card numbers to complete a test payment (see
   their docs — no real money moves in Test Mode).
5. **Going live** (real customer payments) requires completing Razorpay's
   business KYC (PAN, bank account, business proof) and switching to Live
   Mode keys. That's a business step to do when you're ready, not a code
   change.

Endpoints added:
```
GET  /api/payments/plans
POST /api/payments/create-order   { planId, userId }
POST /api/payments/verify         { orderId, paymentId, signature, userId, planId }
```

Current implementation creates a one-time order per subscription period.
For real recurring billing (auto-charge every month), migrate to Razorpay's
Subscriptions API (Plans + Subscriptions objects) — flagged as a next step,
not built here.

## Data model

`data/destinations.js` holds six destinations. **Kozhikode is the pilot test
market** (per the Development Roadmap's M1/M2 milestones) and is the only
one with real `distanceKm` values per place, which powers the radius filter
below. The other five (Kashmir, Kerala, Goa, Manali, Ladakh) are the
longer-term pilot destinations from the pitch deck and don't yet have
distance data — the radius filter is a no-op for them until that's added.

Each destination has:
- `stayTiers` — price ranges per accommodation type (5-star through
  dormitory/homestay), matching the SRS's stay-type budget tiering.
- `places[]` — each place has `subLocation`, `distanceFromBaseHrs` (drives
  multi-base clustering), `distanceKm` (drives the radius filter, Kozhikode
  only), `category` (popular/moderate/rare), and scores for popularity,
  accessibility, intensity, food/stay availability.

This is hand-written placeholder content standing in for the real
curator/agent-sourced database. Real data will need a proper schema —
see the open question below.

## Radius filtering (FR-3)

`POST /api/itinerary/generate` accepts `maxRadiusKm` (e.g. `50` or `100`).
When set, places beyond that distance from Kozhikode are excluded before
ranking — this is the actual mechanism behind the roadmap's 50km/100km test
tiers. Places without a `distanceKm` value are never excluded, so this only
affects Kozhikode until other destinations get real distance data.

## API endpoints

```
GET  /api/destinations
GET  /api/destinations/:id
GET  /api/destinations/:id/places
POST /api/itinerary/generate      { destinationId, days, group, stayTier, budgetLevel, maxIntensity, preferenceMix }
POST /api/itinerary/save          { userId, itinerary }
GET  /api/itinerary/:id
GET  /api/itinerary?userId=...
POST /api/auth/signup             { name, email, password }
POST /api/auth/login              { email, password }
POST /api/agents/register         { name, email, phone, region }
GET  /api/agents                  ?region=...&all=true
POST /api/agents/review           { agentId, rating, comment, userId }
GET  /api/payments/plans
POST /api/payments/create-order   { planId, userId }
POST /api/payments/verify         { orderId, paymentId, signature, userId, planId }
GET  /api/weather                 ?destinationId=...        [stub]
POST /api/assistant/chat          { message }                [stub]
POST /api/sign-translate                                     [stub]
```

## Going live (deploying off your laptop)

The server already reads `process.env.PORT`, so it works on hosting
platforms that assign their own port — no code changes needed.

**Recommended: Render.com free tier** (no credit card required):

1. Put this code in a GitHub repository (create a free GitHub account if
   you don't have one, create a new repo, upload these files via the GitHub
   website's drag-and-drop upload — no command line needed).
2. Sign up at render.com (can sign up with your GitHub account directly).
3. New → Web Service → connect your GitHub repo.
4. Settings: Environment = Node, Build Command = *(leave blank)*, Start
   Command = `node server.js`, Instance Type = Free.
5. Deploy. You'll get a live URL like `https://your-app-name.onrender.com`.

**Known free-tier limitations, fine for pilot testing, not for real launch:**
- The free instance "sleeps" after inactivity; the first request after a
  quiet period takes ~30-50 seconds to wake up.
- Storage is not persistent across deploys — `data/db.json` (signups, saved
  itineraries, agent registrations) resets whenever the service restarts or
  redeploys. Fine for a short pilot test window; needs a real database
  (e.g. Render's managed Postgres) before relying on it longer-term.

## Known simplifications / open questions for the team

1. **Auth is unhashed-token-free** — login just returns the user record, no
   session/JWT. Needs real auth before anything resembling production.
2. **No image upload handling** — the sign-translation endpoint doesn't
   accept a file yet; needs multipart handling once OCR is wired in.
3. **Multi-base clustering is a simple greedy algorithm**, not a real route
   optimizer — good enough to demo the concept, not tuned for genuinely
   minimal travel time. Worth a real look once there's more place density
   per destination.
4. **Place/agent data schema** — real agent-submitted place data will need a
   moderation/approval flow before it affects what travelers see; this
   scaffold has agents submit but doesn't yet route their contributions into
   the places dataset. That queue is the next piece to design.
5. **No tests** — this is scaffold code, not tested code. Add a test suite
   before building on top of it seriously.
