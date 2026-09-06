// TripCraft itinerary engine (Phase 1 reference implementation).
//
// This module implements two of the app's core, non-obvious pieces of logic:
//
// 1. PLACE SCORING (SRS "Place Discovery & Scoring"): each place has a
//    popularity/accessibility/intensity/food/stay profile. The traveler sets
//    a preference mix (e.g. 70% popular spots, 30% rare finds) and an
//    intensity ceiling, and we rank + filter places against that.
//
// 2. MULTI-BASE STAY DISTRIBUTION (SRS "Stay Planning"): rather than basing
//    the whole trip in one city and day-tripping out and back (the default
//    most travelers and generic planners fall into), we cluster selected
//    places by sub-location and distribute nights across those clusters,
//    ordered by distance from the primary base, to reduce total backtracking.
//
// Both pieces are intentionally simple/greedy implementations — good enough
// to demo and reason about, not a final optimization algorithm. Flagged in
// the README as a place engineering should revisit.

const destinations = require("../data/destinations");

function getDestination(id) {
  const d = destinations[id];
  if (!d) throw new Error(`Unknown destination: ${id}`);
  return d;
}

function listPlacesWithScores(destinationId) {
  const d = getDestination(destinationId);
  return d.places.map(p => ({
    ...p,
    // Composite score: blends popularity with accessibility/food/stay
    // support, since a "popular" place that's hard to actually visit
    // shouldn't outrank a well-supported moderate one.
    compositeScore: Math.round(
      (p.popularity * 0.5) + (p.accessibility * 0.2) + (p.foodAvailability * 0.15) + (p.stayAvailability * 0.15)
    )
  }));
}

// Rank places against a traveler's preference mix, intensity ceiling, and
// max radius (FR-3: traveler-selected max distance from the primary
// destination for suggested spots). Places without a distanceKm value
// (older destination entries) are never excluded by the radius filter —
// only Kozhikode currently has real distance data, since it's the pilot
// test market.
// preferenceMix: { popular: 0-1, rare: 0-1 } (moderate fills the remainder)
function rankPlacesForTraveler(destinationId, { preferenceMix = { popular: 0.6, rare: 0.2 }, maxIntensity = "high", maxRadiusKm = null } = {}) {
  const intensityRank = { low: 1, medium: 2, high: 3 };
  const ceiling = intensityRank[maxIntensity] || 3;
  let places = listPlacesWithScores(destinationId).filter(p => intensityRank[p.intensity] <= ceiling);

  if (maxRadiusKm) {
    places = places.filter(p => p.distanceKm === undefined || p.distanceKm <= maxRadiusKm);
  }

  const weight = (p) => {
    if (p.category === "popular") return p.compositeScore * (0.5 + preferenceMix.popular);
    if (p.category === "rare") return p.compositeScore * (0.5 + preferenceMix.rare);
    return p.compositeScore; // moderate: neutral weighting
  };

  return places.sort((a, b) => weight(b) - weight(a));
}

// Cluster places by sub-location and order clusters by distance from base,
// then allocate nights per cluster proportional to how many days of content
// it holds. This is the "don't day-trip Gulmarg and Pahalgam from Srinagar
// every day" logic.
//
// IMPORTANT: each cluster switch costs a travel day. With C clusters, at
// least (C-1) of the `days` are consumed by travel, so nights available for
// actually staying somewhere is (days - (C-1)). If there isn't enough budget
// for all clusters (each needs >=1 night), we drop the farthest/lowest-yield
// clusters until the trip length can actually support the plan.
function buildStayPlan(selectedPlaces, totalDays, baseCity) {
  const clusters = {};
  selectedPlaces.forEach(p => {
    if (!clusters[p.subLocation]) {
      clusters[p.subLocation] = { subLocation: p.subLocation, distanceFromBaseHrs: p.distanceFromBaseHrs, places: [] };
    }
    clusters[p.subLocation].places.push(p);
  });

  let ordered = Object.values(clusters).sort((a, b) => a.distanceFromBaseHrs - b.distanceFromBaseHrs);

  // Trim clusters so (nights >= 1 each) + (transitions = clusters.length-1) fits totalDays.
  // Minimum days needed for K clusters = 2K - 1. Solve for max K.
  const maxClusters = Math.max(1, Math.floor((totalDays + 1) / 2));
  if (ordered.length > maxClusters) {
    // Keep the base cluster (distance 0) plus the highest-content remaining ones, drop the rest.
    ordered = ordered.slice(0, maxClusters);
  }

  const travelDays = ordered.length - 1;
  const nightsBudget = Math.max(ordered.length, totalDays - travelDays); // at least 1 night each
  const totalPlaceCount = ordered.reduce((s, c) => s + c.places.length, 0) || 1;

  let nightsLeft = nightsBudget;
  const plan = ordered.map((c, i) => {
    const isLast = i === ordered.length - 1;
    let nights = Math.max(1, Math.round((c.places.length / totalPlaceCount) * nightsBudget));
    if (isLast) nights = Math.max(1, nightsLeft);
    else nightsLeft -= nights;
    return { ...c, nights };
  });

  // Places belonging to a dropped cluster don't get folded into a kept
  // cluster's day plan — doing so previously produced itineraries like
  // "Day 2 – Kozhikode City – Kappad Beach + Thusharagiri Waterfalls",
  // falsely implying a far-away place is a short hop from the base. For a
  // short trip, it's more honest to show fewer, reachable places than to
  // mislabel which base a place is actually near.
  return plan.length ? plan : [{ subLocation: baseCity, distanceFromBaseHrs: 0, places: selectedPlaces, nights: totalDays }];
}

function generateItinerary({ destinationId, days, group, style = "Balanced", preferenceMix, maxIntensity, maxRadiusKm, stayTier, budgetLevel = "comfort" }) {
  const dest = getDestination(destinationId);
  days = Math.max(1, Math.min(21, days || 7));
  group = Math.max(1, Math.min(30, group || 1));

  const ranked = rankPlacesForTraveler(destinationId, { preferenceMix, maxIntensity, maxRadiusKm });
  // Take roughly 1.2 places per day so there's enough content to sequence,
  // without overloading any single day.
  const selectedCount = Math.min(ranked.length, Math.max(3, Math.round(days * 1.2)));
  const selected = ranked.slice(0, selectedCount);

  const stayPlan = buildStayPlan(selected, days, dest.baseCity);

  // Build the day-by-day sequence from the stay plan.
  const dayList = [];
  let dayNum = 1;
  for (let idx = 0; idx < stayPlan.length && dayNum <= days; idx++) {
    const cluster = stayPlan[idx];
    if (idx > 0 && dayNum <= days) {
      dayList.push({
        day: dayNum++,
        base: cluster.subLocation,
        isTravelDay: true,
        title: `Travel to ${cluster.subLocation}`,
        description: `Approx. ${cluster.distanceFromBaseHrs}h from ${dest.baseCity}.`,
        places: []
      });
    }
    const placesPerDay = Math.max(1, Math.ceil(cluster.places.length / cluster.nights));
    for (let n = 0; n < cluster.nights && dayNum <= days; n++) {
      const dayPlaces = cluster.places.slice(n * placesPerDay, (n + 1) * placesPerDay);
      dayList.push({
        day: dayNum++,
        base: cluster.subLocation,
        isTravelDay: false,
        title: dayPlaces.length ? dayPlaces.map(p => p.name).join(" + ") : `Leisure day in ${cluster.subLocation}`,
        description: dayPlaces.length ? dayPlaces.map(p => p.description).join(" ") : "Free time, optional local exploration.",
        places: dayPlaces.map(p => p.id)
      });
    }
  }
  // Fill any remaining days as free/leisure days in the last base.
  while (dayNum <= days) {
    const lastBase = stayPlan[stayPlan.length - 1]?.subLocation || dest.baseCity;
    dayList.push({ day: dayNum++, base: lastBase, isTravelDay: false, title: "Free day", description: "Explore at your own pace.", places: [] });
  }

  const budget = calculateBudget({ destinationId, days, group, stayTier, budgetLevel, nightsByCluster: stayPlan });

  return {
    destination: dest.name,
    baseCity: dest.baseCity,
    days,
    group,
    style,
    maxRadiusKm: maxRadiusKm || null,
    staySplit: stayPlan.map(c => ({ location: c.subLocation, nights: c.nights, distanceFromBaseHrs: c.distanceFromBaseHrs })),
    itinerary: dayList,
    budget,
    bestMonths: dest.bestMonths,
    permits: dest.permits,
    tips: dest.tips
  };
}

function calculateBudget({ destinationId, days, group, stayTier = "3star_bf", budgetLevel = "comfort" }) {
  const dest = getDestination(destinationId);
  const tier = dest.stayTiers[stayTier] || Object.values(dest.stayTiers)[0];
  const stayPerNight = (tier.min + tier.max) / 2;
  // Assume 2 travelers share a room.
  const rooms = Math.ceil(group / 2);
  const stayTotal = Math.round(stayPerNight * rooms * days);

  const travelTotal = Math.round(dest.travelPerDayINR * days * group * 0.4); // shared vehicles, not per-person full cost
  const foodTotal = Math.round((dest.foodPerDayINR[budgetLevel] || dest.foodPerDayINR.comfort) * days * group);
  const activitiesTotal = Math.round((dest.activitiesPerDayINR[budgetLevel] || dest.activitiesPerDayINR.comfort) * days * group);

  const total = stayTotal + travelTotal + foodTotal + activitiesTotal;
  return {
    total,
    perPerson: Math.round(total / group),
    breakdown: {
      stay: stayTotal,
      travel: travelTotal,
      food: foodTotal,
      activities: activitiesTotal
    },
    stayTierUsed: tier.label
  };
}

module.exports = { getDestination, listPlacesWithScores, rankPlacesForTraveler, generateItinerary, calculateBudget, destinations };
