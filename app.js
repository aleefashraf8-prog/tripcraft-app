const TripCraft = (() => {
  const state = { mix: [0.6, 0.2], currentUser: null };

  function $(id) { return document.getElementById(id); }

  async function api(path, opts = {}) {
    const res = await fetch(path, {
      headers: { "Content-Type": "application/json" },
      ...opts
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  }

  function initTabs() {
    document.querySelectorAll(".tabs button").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        $("panel-" + btn.dataset.tab).classList.add("active");
      });
    });
  }

  function initMixChips() {
    document.querySelectorAll("#mixChips .chip").forEach(chip => {
      chip.addEventListener("click", () => {
        document.querySelectorAll("#mixChips .chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        state.mix = chip.dataset.mix.split(",").map(Number);
      });
    });
  }

  async function loadStayTiers() {
    const destId = $("destination").value;
    const dest = await api(`/api/destinations/${destId}`);
    const sel = $("stayTier");
    sel.innerHTML = "";
    Object.entries(dest.stayTiers).forEach(([key, t]) => {
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = `${t.label} (₹${t.min.toLocaleString("en-IN")}–₹${t.max.toLocaleString("en-IN")}/night)`;
      sel.appendChild(opt);
    });
  }

  async function generate() {
    $("planError").textContent = "";
    try {
      const body = {
        destinationId: $("destination").value,
        days: parseInt($("days").value, 10),
        group: parseInt($("group").value, 10),
        stayTier: $("stayTier").value,
        budgetLevel: $("budgetLevel").value,
        maxIntensity: $("maxIntensity").value,
        maxRadiusKm: $("maxRadiusKm").value ? parseInt($("maxRadiusKm").value, 10) : null,
        preferenceMix: { popular: state.mix[0], rare: state.mix[1] }
      };
      const result = await api("/api/itinerary/generate", { method: "POST", body: JSON.stringify(body) });
      renderResult(result);
    } catch (e) {
      $("planError").textContent = e.message;
    }
  }

  function renderResult(r) {
    const staySplitHtml = r.staySplit.map(s => `<span class="tag moderate" style="margin-right:6px;">${s.location} · ${s.nights}n</span>`).join("");
    const daysHtml = r.itinerary.map(d => `
      <div class="day-card ${d.isTravelDay ? "travel" : ""}">
        <div class="num">Day ${d.day} · ${d.base}</div>
        <div class="t">${d.title}</div>
        <div class="d">${d.description}</div>
      </div>
    `).join("");

    $("result").innerHTML = `
      <div class="card">
        <h3 style="margin-top:0;">${r.destination} · ${r.days} days · ${r.group} travelers${r.maxRadiusKm ? ` · within ${r.maxRadiusKm}km` : ""}</h3>
        <div style="margin-bottom:12px;">${staySplitHtml}</div>
        <div class="stat-row">
          <div class="stat"><div class="n">₹${r.budget.total.toLocaleString("en-IN")}</div><div class="l">Total estimate</div></div>
          <div class="stat"><div class="n">₹${r.budget.perPerson.toLocaleString("en-IN")}</div><div class="l">Per person</div></div>
          <div class="stat"><div class="n">${r.budget.stayTierUsed}</div><div class="l">Stay tier</div></div>
        </div>
        <div class="stat-row">
          <div class="stat"><div class="n">₹${r.budget.breakdown.stay.toLocaleString("en-IN")}</div><div class="l">Stay</div></div>
          <div class="stat"><div class="n">₹${r.budget.breakdown.travel.toLocaleString("en-IN")}</div><div class="l">Travel</div></div>
          <div class="stat"><div class="n">₹${r.budget.breakdown.food.toLocaleString("en-IN")}</div><div class="l">Food</div></div>
          <div class="stat"><div class="n">₹${r.budget.breakdown.activities.toLocaleString("en-IN")}</div><div class="l">Activities</div></div>
        </div>
        ${r.permits.length ? `<div class="note">Permits: ${r.permits.join(" ")}</div>` : ""}
        ${r.tips.length ? `<div class="note">Tips: ${r.tips.join(" ")}</div>` : ""}
        <div class="note">Best months: ${r.bestMonths.join(", ")}</div>
      </div>
      <div class="card">${daysHtml}</div>
    `;
  }

  async function loadDestinationOptions(selectEl) {
    const list = await api("/api/destinations");
    selectEl.innerHTML = list.map(d => `<option value="${d.id}">${d.name}</option>`).join("");
  }

  async function loadPlaces() {
    const destId = $("placesDestination").value;
    const places = await api(`/api/destinations/${destId}/places`);
    $("placesList").innerHTML = places
      .sort((a, b) => b.compositeScore - a.compositeScore)
      .map(p => `
        <div class="place-row">
          <div>
            <div style="font-weight:700;">${p.name} <span class="tag ${p.category}">${p.category}</span></div>
            <div style="font-size:12px; color:var(--muted);">${p.subLocation} · ${p.description}</div>
          </div>
          <div style="text-align:right; font-size:11.5px; color:var(--muted);">
            score ${p.compositeScore}<br>intensity: ${p.intensity}
          </div>
        </div>
      `).join("");
  }

  async function registerAgent() {
    try {
      const agent = await api("/api/agents/register", {
        method: "POST",
        body: JSON.stringify({
          name: $("agentName").value, email: $("agentEmail").value,
          phone: $("agentPhone").value, region: $("agentRegion").value
        })
      });
      alert(`Registered. Status: ${agent.status}`);
    } catch (e) { alert(e.message); }
  }

  async function loadAgents() {
    const agents = await api("/api/agents?all=true");
    $("agentsList").innerHTML = `<button class="ghost" onclick="TripCraft.loadAgents()">Refresh</button>` +
      (agents.length
        ? agents.map(a => `<div class="place-row"><div>${a.name} · ${a.region}</div><div>${a.status} · ★ ${a.averageRating ?? "—"}</div></div>`).join("")
        : `<div class="note">No agents yet.</div>`);
  }

  async function sendChat() {
    const input = $("chatInput");
    const msg = input.value.trim();
    if (!msg) return;
    $("chatBox").innerHTML += `<div class="msg user">${msg}</div>`;
    input.value = "";
    const res = await api("/api/assistant/chat", { method: "POST", body: JSON.stringify({ message: msg }) });
    $("chatBox").innerHTML += `<div class="msg bot">${res.reply}</div>`;
    $("chatBox").scrollTop = $("chatBox").scrollHeight;
  }

  async function signup() {
    $("authError").textContent = "";
    try {
      const user = await api("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name: $("suName").value, email: $("suEmail").value, password: $("suPassword").value })
      });
      state.currentUser = user;
      $("authResult").textContent = `Account created: ${user.name} (${user.email}). Plan: ${user.subscription.plan}.`;
    } catch (e) {
      $("authError").textContent = e.message;
    }
  }

  async function loadPlans() {
    const { plans, configured } = await api("/api/payments/plans");
    $("razorpayNote").textContent = configured
      ? "Razorpay is configured — real Test Mode checkout will open."
      : "Razorpay keys aren't set yet — this will run in stub mode (no real checkout). See README to add real Test Mode keys.";
    $("plansGrid").innerHTML = Object.entries(plans).map(([id, p]) => `
      <div class="card" style="margin-bottom:0;">
        <div style="font-weight:800;">${p.name}</div>
        <div style="font-size:22px; margin:6px 0;">₹${p.priceINR}<span style="font-size:12px; color:var(--muted);">/mo</span></div>
        <button class="primary" onclick="TripCraft.subscribe('${id}')">Subscribe</button>
      </div>
    `).join("");
  }

  async function subscribe(planId) {
    $("paymentError").textContent = "";
    $("paymentResult").textContent = "";
    if (!state.currentUser) {
      $("paymentError").textContent = "Sign up first — subscriptions are tied to an account.";
      return;
    }
    try {
      const order = await api("/api/payments/create-order", {
        method: "POST",
        body: JSON.stringify({ planId, userId: state.currentUser.id })
      });

      if (order.mocked) {
        // No real Razorpay keys configured — simulate the flow so the UI can
        // still be demoed end to end.
        $("paymentResult").textContent = `[stub] Order created (${order.id}). No real keys configured, so no checkout modal will open — see README.`;
        return;
      }

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "TripCraft",
        description: planId,
        order_id: order.id,
        handler: async function (response) {
          try {
            const verify = await api("/api/payments/verify", {
              method: "POST",
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                userId: state.currentUser.id,
                planId
              })
            });
            $("paymentResult").textContent = `Payment verified. Subscription now: ${verify.subscription.plan}.`;
          } catch (e) {
            $("paymentError").textContent = "Payment succeeded but verification failed: " + e.message;
          }
        },
        prefill: { name: state.currentUser.name, email: state.currentUser.email },
        theme: { color: "#FF7A45" }
      };
      const rzp = new Razorpay(options);
      rzp.open();
    } catch (e) {
      $("paymentError").textContent = e.message;
    }
  }

  async function init() {
    initTabs();
    initMixChips();
    $("destination").addEventListener("change", loadStayTiers);
    await loadStayTiers();
    await loadDestinationOptions($("placesDestination"));
    await loadPlans();
  }

  document.addEventListener("DOMContentLoaded", init);

  return { generate, loadPlaces, registerAgent, loadAgents, sendChat, signup, subscribe };
})();
