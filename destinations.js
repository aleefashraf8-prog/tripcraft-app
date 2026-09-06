// Seed data for Phase 1 pilot destinations.
// This is hand-curated placeholder content standing in for the real
// curator/agent-sourced database described in the SRS (FR-23/FR-24, and the
// new Place Discovery & Scoring section). Replace with real DB records.

const destinations = {
  kozhikode: {
    id: "kozhikode",
    name: "Kozhikode (Calicut)",
    baseCity: "Kozhikode",
    bestMonths: ["November", "December", "January", "February", "March"],
    permits: [],
    tips: ["Kozhikode is the pilot test market — this destination is deliberately the most detailed for the M1/M2 radius testing phase."],
    travelPerDayINR: 1100,
    foodPerDayINR: { budget: 400, comfort: 650, premium: 1100 },
    activitiesPerDayINR: { budget: 250, comfort: 500, premium: 1000 },
    stayTiers: {
      "4star": { min: 4000, max: 7000, label: "4-Star Hotel" },
      "3star_bf": { min: 2500, max: 4000, label: "3-Star, with breakfast" },
      "3star": { min: 1800, max: 2800, label: "3-Star, room only" },
      "homestay": { min: 1200, max: 2200, label: "Homestay" },
      "local": { min: 700, max: 1300, label: "Local Guesthouse" },
      "dorm": { min: 400, max: 800, label: "Dormitory / Hostel" }
    },
    // distanceKm powers the radius filter (FR-3). distanceFromBaseHrs still
    // drives the multi-base clustering logic, same as other destinations.
    places: [
      { id: "kz1", name: "Kozhikode Beach & Lighthouse", subLocation: "Kozhikode City", distanceKm: 2, distanceFromBaseHrs: 0.1, category: "popular", popularity: 8, accessibility: 10, intensity: "low", foodAvailability: 10, stayAvailability: 10, description: "Sunset spot, walking promenade, right in the city." },
      { id: "kz2", name: "Mananchira Square & Old Town", subLocation: "Kozhikode City", distanceKm: 1, distanceFromBaseHrs: 0.1, category: "moderate", popularity: 6, accessibility: 10, intensity: "low", foodAvailability: 10, stayAvailability: 10, description: "Historic square, Kuttichira heritage walk, legendary local food street." },
      { id: "kz3", name: "Kadalundi Bird Sanctuary", subLocation: "Kadalundi", distanceKm: 15, distanceFromBaseHrs: 0.4, category: "moderate", popularity: 5, accessibility: 7, intensity: "low", foodAvailability: 3, stayAvailability: 2, description: "Estuary bird sanctuary, boat rides, quiet and uncrowded." },
      { id: "kz4", name: "Beypore Port & Uru Shipyard", subLocation: "Beypore", distanceKm: 10, distanceFromBaseHrs: 0.3, category: "moderate", popularity: 6, accessibility: 8, intensity: "low", foodAvailability: 7, stayAvailability: 3, description: "Historic port where traditional wooden Uru ships are still hand-built." },
      { id: "kz5", name: "Kappad Beach", subLocation: "Kappad", distanceKm: 16, distanceFromBaseHrs: 0.4, category: "popular", popularity: 6, accessibility: 8, intensity: "low", foodAvailability: 4, stayAvailability: 4, description: "Historic beach where Vasco da Gama first landed in India." },
      { id: "kz6", name: "Peruvannamuzhi Dam & Wildlife Sanctuary", subLocation: "Peruvannamuzhi", distanceKm: 45, distanceFromBaseHrs: 1.1, category: "rare", popularity: 3, accessibility: 5, intensity: "medium", foodAvailability: 2, stayAvailability: 2, description: "Quiet dam, garden, and deer park — well under the radar." },
      { id: "kz7", name: "Thusharagiri Waterfalls", subLocation: "Thusharagiri", distanceKm: 50, distanceFromBaseHrs: 1.25, category: "popular", popularity: 7, accessibility: 6, intensity: "medium", foodAvailability: 4, stayAvailability: 3, description: "Multi-tier waterfalls with short trekking trails." },
      { id: "kz8", name: "Nilambur Teak Museum & Forests", subLocation: "Nilambur", distanceKm: 50, distanceFromBaseHrs: 1.3, category: "rare", popularity: 3, accessibility: 5, intensity: "low", foodAvailability: 3, stayAvailability: 3, description: "World's first teak plantation, teak museum, quiet forest drives." },
      { id: "kz9", name: "Kakkayam Dam & Kakkadampoyil", subLocation: "Kakkayam", distanceKm: 55, distanceFromBaseHrs: 1.4, category: "rare", popularity: 3, accessibility: 4, intensity: "high", foodAvailability: 2, stayAvailability: 2, description: "Reservoir and trekking area in the Western Ghats, minimal crowds." },
      { id: "kz10", name: "Banasura Sagar Dam, Wayanad", subLocation: "Wayanad", distanceKm: 95, distanceFromBaseHrs: 2.4, category: "moderate", popularity: 6, accessibility: 6, intensity: "medium", foodAvailability: 5, stayAvailability: 6, description: "India's largest earthen dam, boating, viewpoint trek." },
      { id: "kz11", name: "Chembra Peak & Sultan Bathery, Wayanad", subLocation: "Wayanad", distanceKm: 100, distanceFromBaseHrs: 2.6, category: "popular", popularity: 7, accessibility: 5, intensity: "high", foodAvailability: 5, stayAvailability: 6, description: "Heart-shaped lake trek, one of Wayanad's signature hikes; needs a forest permit slot." }
    ]
  },

  kashmir: {
    id: "kashmir",
    name: "Kashmir",
    baseCity: "Srinagar",
    bestMonths: ["April", "May", "June", "September", "October"],
    permits: ["Inner-line permit required for parts of Ladakh border areas if extending the trip."],
    tips: ["A local Kashmir-only SIM is commonly needed — national carriers often have limited or restricted service in the valley."],
    travelPerDayINR: 1400,
    foodPerDayINR: { budget: 500, comfort: 800, premium: 1400 },
    activitiesPerDayINR: { budget: 300, comfort: 600, premium: 1200 },
    stayTiers: {
      "5star": { min: 8000, max: 15000, label: "5-Star Hotel" },
      "4star": { min: 5000, max: 8000, label: "4-Star Hotel" },
      "3star_bf": { min: 3500, max: 5000, label: "3-Star, with breakfast" },
      "3star": { min: 2500, max: 3800, label: "3-Star, room only" },
      "houseboat": { min: 3000, max: 6000, label: "Dal Lake Houseboat" },
      "homestay": { min: 1500, max: 2800, label: "Homestay" },
      "local": { min: 900, max: 1600, label: "Local Guesthouse" },
      "dorm": { min: 450, max: 900, label: "Dormitory / Hostel" }
    },
    places: [
      { id: "k1", name: "Dal Lake & Houseboats", subLocation: "Srinagar", distanceFromBaseHrs: 0, category: "popular", popularity: 10, accessibility: 10, intensity: "low", foodAvailability: 9, stayAvailability: 10, description: "Iconic houseboat stay and shikara rides." },
      { id: "k2", name: "Mughal Gardens (Shalimar & Nishat)", subLocation: "Srinagar", distanceFromBaseHrs: 0, category: "popular", popularity: 9, accessibility: 10, intensity: "low", foodAvailability: 8, stayAvailability: 10, description: "Historic terraced gardens." },
      { id: "k3", name: "Gulmarg Gondola", subLocation: "Gulmarg", distanceFromBaseHrs: 1.5, category: "popular", popularity: 9, accessibility: 8, intensity: "medium", foodAvailability: 6, stayAvailability: 6, description: "Cable car up Apharwat Peak." },
      { id: "k4", name: "Betaab & Aru Valley", subLocation: "Pahalgam", distanceFromBaseHrs: 3, category: "popular", popularity: 8, accessibility: 7, intensity: "medium", foodAvailability: 6, stayAvailability: 7, description: "Scenic valleys near Pahalgam." },
      { id: "k5", name: "Thajiwas Glacier", subLocation: "Sonmarg", distanceFromBaseHrs: 3, category: "moderate", popularity: 6, accessibility: 6, intensity: "high", foodAvailability: 4, stayAvailability: 4, description: "Short trek/pony ride to a glacier." },
      { id: "k6", name: "Doodhpathri Meadow", subLocation: "Doodhpathri", distanceFromBaseHrs: 2.5, category: "rare", popularity: 3, accessibility: 5, intensity: "medium", foodAvailability: 2, stayAvailability: 2, description: "Quiet alpine meadow, far fewer tourists than Gulmarg/Sonmarg." },
      { id: "k7", name: "Yusmarg", subLocation: "Yusmarg", distanceFromBaseHrs: 2, category: "rare", popularity: 3, accessibility: 5, intensity: "medium", foodAvailability: 2, stayAvailability: 2, description: "Lesser-visited meadow with pine forests, good for a quiet day trip." },
      { id: "k8", name: "Old Srinagar Markets", subLocation: "Srinagar", distanceFromBaseHrs: 0, category: "moderate", popularity: 6, accessibility: 9, intensity: "low", foodAvailability: 9, stayAvailability: 10, description: "Local market walk, pashmina and saffron shopping." }
    ]
  },

  kerala: {
    id: "kerala",
    name: "Kerala",
    baseCity: "Kochi",
    bestMonths: ["September", "October", "November", "December", "January", "February"],
    permits: [],
    tips: ["Backwater houseboat trips typically require booking a day ahead in peak season."],
    travelPerDayINR: 1200,
    foodPerDayINR: { budget: 450, comfort: 700, premium: 1200 },
    activitiesPerDayINR: { budget: 300, comfort: 550, premium: 1000 },
    stayTiers: {
      "5star": { min: 7000, max: 13000, label: "5-Star Hotel" },
      "4star": { min: 4500, max: 7000, label: "4-Star Hotel" },
      "3star_bf": { min: 3000, max: 4500, label: "3-Star, with breakfast" },
      "3star": { min: 2200, max: 3400, label: "3-Star, room only" },
      "houseboat": { min: 4000, max: 9000, label: "Backwater Houseboat" },
      "homestay": { min: 1400, max: 2600, label: "Homestay" },
      "local": { min: 800, max: 1400, label: "Local Guesthouse" },
      "dorm": { min: 400, max: 800, label: "Dormitory / Hostel" }
    },
    places: [
      { id: "ke1", name: "Fort Kochi Heritage Walk", subLocation: "Kochi", distanceFromBaseHrs: 0, category: "popular", popularity: 9, accessibility: 10, intensity: "low", foodAvailability: 9, stayAvailability: 10, description: "Chinese fishing nets, colonial architecture, Jew Town." },
      { id: "ke2", name: "Munnar Tea Gardens", subLocation: "Munnar", distanceFromBaseHrs: 4, category: "popular", popularity: 9, accessibility: 8, intensity: "low", foodAvailability: 7, stayAvailability: 8, description: "Rolling tea estates and viewpoints." },
      { id: "ke3", name: "Periyar Wildlife Sanctuary", subLocation: "Thekkady", distanceFromBaseHrs: 4, category: "popular", popularity: 8, accessibility: 7, intensity: "medium", foodAvailability: 6, stayAvailability: 6, description: "Boat safari and spice plantation walks." },
      { id: "ke4", name: "Alleppey Backwaters", subLocation: "Alleppey", distanceFromBaseHrs: 1.5, category: "popular", popularity: 10, accessibility: 9, intensity: "low", foodAvailability: 8, stayAvailability: 9, description: "The signature Kerala houseboat cruise." },
      { id: "ke5", name: "Vagamon Hills", subLocation: "Vagamon", distanceFromBaseHrs: 4.5, category: "rare", popularity: 3, accessibility: 5, intensity: "medium", foodAvailability: 3, stayAvailability: 3, description: "Quiet hill station, far fewer tourists than Munnar." },
      { id: "ke6", name: "Kumarakom Bird Sanctuary", subLocation: "Kumarakom", distanceFromBaseHrs: 2, category: "moderate", popularity: 5, accessibility: 7, intensity: "low", foodAvailability: 6, stayAvailability: 6, description: "Backwater bird sanctuary, quieter than Alleppey." }
    ]
  },

  goa: {
    id: "goa", name: "Goa", baseCity: "Panaji",
    bestMonths: ["November", "December", "January", "February"],
    permits: [], tips: ["Bike rentals need a valid driving license on hand at all times — checkpoints are common."],
    travelPerDayINR: 1000,
    foodPerDayINR: { budget: 450, comfort: 700, premium: 1300 },
    activitiesPerDayINR: { budget: 400, comfort: 700, premium: 1500 },
    stayTiers: {
      "5star": { min: 7500, max: 14000, label: "5-Star Resort" },
      "4star": { min: 4500, max: 7500, label: "4-Star Hotel" },
      "3star_bf": { min: 2800, max: 4200, label: "3-Star, with breakfast" },
      "3star": { min: 2000, max: 3200, label: "3-Star, room only" },
      "homestay": { min: 1200, max: 2400, label: "Homestay / Guesthouse" },
      "local": { min: 700, max: 1300, label: "Local Room" },
      "dorm": { min: 400, max: 800, label: "Dormitory / Hostel" }
    },
    places: [
      { id: "g1", name: "Baga & Calangute Beaches", subLocation: "North Goa", distanceFromBaseHrs: 0.5, category: "popular", popularity: 9, accessibility: 10, intensity: "low", foodAvailability: 10, stayAvailability: 10, description: "The classic North Goa beach strip." },
      { id: "g2", name: "Palolem Beach", subLocation: "South Goa", distanceFromBaseHrs: 1.5, category: "moderate", popularity: 6, accessibility: 7, intensity: "low", foodAvailability: 7, stayAvailability: 7, description: "Quieter, more scenic South Goa beach." },
      { id: "g3", name: "Old Goa Churches", subLocation: "Old Goa", distanceFromBaseHrs: 0.5, category: "popular", popularity: 7, accessibility: 9, intensity: "low", foodAvailability: 5, stayAvailability: 4, description: "Basilica of Bom Jesus and colonial churches." },
      { id: "g4", name: "Dudhsagar Falls", subLocation: "Dudhsagar", distanceFromBaseHrs: 2, category: "moderate", popularity: 6, accessibility: 5, intensity: "high", foodAvailability: 2, stayAvailability: 1, description: "Jeep safari + waterfall trek." },
      { id: "g5", name: "Cotigao Wildlife Sanctuary", subLocation: "South Goa", distanceFromBaseHrs: 2, category: "rare", popularity: 2, accessibility: 4, intensity: "medium", foodAvailability: 1, stayAvailability: 1, description: "Rarely visited sanctuary, good for a quiet nature day." }
    ]
  },

  manali: {
    id: "manali", name: "Manali", baseCity: "Manali Town",
    bestMonths: ["March", "April", "May", "June", "October"],
    permits: ["Rohtang Pass requires an online permit, subject to daily vehicle quotas."],
    tips: ["Network connectivity is patchy beyond Manali town — download offline maps in advance."],
    travelPerDayINR: 1300,
    foodPerDayINR: { budget: 450, comfort: 700, premium: 1200 },
    activitiesPerDayINR: { budget: 400, comfort: 800, premium: 1600 },
    stayTiers: {
      "4star": { min: 4000, max: 7000, label: "4-Star Hotel" },
      "3star_bf": { min: 2600, max: 4000, label: "3-Star, with breakfast" },
      "3star": { min: 1800, max: 2800, label: "3-Star, room only" },
      "homestay": { min: 1200, max: 2200, label: "Homestay" },
      "local": { min: 700, max: 1300, label: "Local Guesthouse" },
      "dorm": { min: 400, max: 800, label: "Dormitory / Hostel" }
    },
    places: [
      { id: "m1", name: "Old Manali & Hadimba Temple", subLocation: "Manali Town", distanceFromBaseHrs: 0, category: "popular", popularity: 8, accessibility: 10, intensity: "low", foodAvailability: 9, stayAvailability: 10, description: "Cafes, temple, riverside walks." },
      { id: "m2", name: "Solang Valley", subLocation: "Solang", distanceFromBaseHrs: 0.75, category: "popular", popularity: 8, accessibility: 8, intensity: "medium", foodAvailability: 5, stayAvailability: 3, description: "Adventure sports valley." },
      { id: "m3", name: "Rohtang Pass", subLocation: "Rohtang", distanceFromBaseHrs: 1.5, category: "popular", popularity: 7, accessibility: 5, intensity: "high", foodAvailability: 2, stayAvailability: 0, description: "High-altitude pass, permit + seasonal access required." },
      { id: "m4", name: "Kasol & Parvati Valley", subLocation: "Kasol", distanceFromBaseHrs: 2.5, category: "moderate", popularity: 6, accessibility: 6, intensity: "medium", foodAvailability: 6, stayAvailability: 5, description: "Riverside town popular with backpackers." },
      { id: "m5", name: "Naggar Castle", subLocation: "Naggar", distanceFromBaseHrs: 1, category: "rare", popularity: 3, accessibility: 6, intensity: "low", foodAvailability: 3, stayAvailability: 3, description: "Quiet heritage site, art gallery, few crowds." }
    ]
  },

  ladakh: {
    id: "ladakh", name: "Ladakh", baseCity: "Leh",
    bestMonths: ["June", "July", "August", "September"],
    permits: ["Inner-line permit required for Nubra Valley, Pangong Lake, and other border areas."],
    tips: ["Plan a mandatory 1-day acclimatization stop in Leh before any high-altitude travel — altitude sickness risk is real."],
    travelPerDayINR: 1800,
    foodPerDayINR: { budget: 550, comfort: 850, premium: 1500 },
    activitiesPerDayINR: { budget: 400, comfort: 750, premium: 1600 },
    stayTiers: {
      "4star": { min: 5500, max: 9000, label: "4-Star Hotel" },
      "3star_bf": { min: 3500, max: 5500, label: "3-Star, with breakfast" },
      "3star": { min: 2500, max: 3800, label: "3-Star, room only" },
      "homestay": { min: 1800, max: 3200, label: "Homestay" },
      "camp": { min: 2000, max: 4500, label: "Fixed Camp (Nubra/Pangong)" },
      "local": { min: 1200, max: 2000, label: "Local Guesthouse" }
    },
    places: [
      { id: "l1", name: "Leh Monasteries (Thiksey & Shey)", subLocation: "Leh", distanceFromBaseHrs: 0, category: "popular", popularity: 8, accessibility: 9, intensity: "low", foodAvailability: 8, stayAvailability: 10, description: "Iconic monasteries near Leh." },
      { id: "l2", name: "Nubra Valley & Sand Dunes", subLocation: "Nubra", distanceFromBaseHrs: 5, category: "popular", popularity: 9, accessibility: 6, intensity: "high", foodAvailability: 4, stayAvailability: 5, description: "Khardung La crossing, camel safari on sand dunes." },
      { id: "l3", name: "Pangong Lake", subLocation: "Pangong", distanceFromBaseHrs: 5, category: "popular", popularity: 10, accessibility: 6, intensity: "high", foodAvailability: 3, stayAvailability: 4, description: "The famous high-altitude lake." },
      { id: "l4", name: "Magnetic Hill & Sangam", subLocation: "Leh", distanceFromBaseHrs: 1, category: "moderate", popularity: 6, accessibility: 8, intensity: "low", foodAvailability: 3, stayAvailability: 1, description: "Short excursions near Leh." },
      { id: "l5", name: "Turtuk Village", subLocation: "Nubra", distanceFromBaseHrs: 6.5, category: "rare", popularity: 2, accessibility: 4, intensity: "medium", foodAvailability: 2, stayAvailability: 2, description: "Remote Balti village near the border, rarely on standard itineraries." }
    ]
  }
};

module.exports = destinations;
