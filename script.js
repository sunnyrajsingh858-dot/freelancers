/* ---------- DATA ---------- */
const freelancers = [
  { id: 1, name: "Aisha Khan", title: "Full-Stack Web Developer", category: "Web Development", rating: 4.9, jobs: 87,
    skills: ["React", "Node.js", "MongoDB"], bio: "6+ years building fast, scalable web apps for startups and agencies.",
    services: [{ title: "Landing page", price: 120 }, { title: "Full website", price: 450 }, { title: "Bug fixing (per hour)", price: 25 }],
    portfolio: [{ t: "E-commerce store", c: "#6366f1" }, { t: "SaaS dashboard", c: "#0ea5e9" }, { t: "Booking app", c: "#10b981" }] },
  { id: 2, name: "Rohan Mehta", title: "UI/UX Designer", category: "Design", rating: 4.8, jobs: 64,
    skills: ["Figma", "Branding", "Prototyping"], bio: "I design clean, user-focused interfaces and brand identities.",
    services: [{ title: "Logo design", price: 60 }, { title: "Mobile app UI", price: 300 }, { title: "Brand kit", price: 180 }],
    portfolio: [{ t: "Fintech app", c: "#f59e0b" }, { t: "Brand identity", c: "#ec4899" }, { t: "Web redesign", c: "#8b5cf6" }] },
  { id: 3, name: "Sara Williams", title: "Content & SEO Writer", category: "Writing", rating: 4.7, jobs: 120,
    skills: ["SEO", "Blogging", "Copywriting"], bio: "Engaging, search-optimised content that converts readers into customers.",
    services: [{ title: "Blog article (1000 words)", price: 35 }, { title: "Website copy", price: 140 }, { title: "Product descriptions", price: 20 }],
    portfolio: [{ t: "Tech blog series", c: "#14b8a6" }, { t: "Landing copy", c: "#f97316" }, { t: "Email campaign", c: "#3b82f6" }] },
  { id: 4, name: "Arjun Singh", title: "Digital Marketer", category: "Marketing", rating: 4.6, jobs: 45,
    skills: ["Google Ads", "Social Media", "Analytics"], bio: "Data-driven campaigns that grow traffic and sales.",
    services: [{ title: "Social media plan", price: 90 }, { title: "Ad campaign setup", price: 200 }, { title: "Monthly management", price: 400 }],
    portfolio: [{ t: "Ad campaign", c: "#ef4444" }, { t: "Growth report", c: "#22c55e" }, { t: "Social launch", c: "#a855f7" }] },
  { id: 5, name: "Neha Verma", title: "Video Editor", category: "Video", rating: 4.9, jobs: 71,
    skills: ["Premiere Pro", "After Effects", "Reels"], bio: "Cinematic edits, reels and promo videos with quick turnaround.",
    services: [{ title: "Reel / short video", price: 40 }, { title: "YouTube edit", price: 110 }, { title: "Promo video", price: 280 }],
    portfolio: [{ t: "Travel reel", c: "#0891b2" }, { t: "Product promo", c: "#db2777" }, { t: "Vlog edit", c: "#65a30d" }] },
  { id: 6, name: "Karan Patel", title: "WordPress Developer", category: "Web Development", rating: 4.5, jobs: 52,
    skills: ["WordPress", "PHP", "WooCommerce"], bio: "Custom WordPress themes, plugins and online stores.",
    services: [{ title: "Blog setup", price: 70 }, { title: "WooCommerce store", price: 350 }, { title: "Speed optimisation", price: 45 }],
    portfolio: [{ t: "Online shop", c: "#7c3aed" }, { t: "Agency site", c: "#0284c7" }, { t: "News portal", c: "#d97706" }] }
];

const CURRENT_FREELANCER_ID = 1; // demo: freelancer dashboard shows requests for Aisha Khan

/* ---------- STATE (saved in localStorage) ---------- */
let state = { role: "client", requests: [] };
try { state = JSON.parse(localStorage.getItem("freelancehub")) || state; } catch (e) {}
const save = () => { try { localStorage.setItem("freelancehub", JSON.stringify(state)); } catch (e) {} };

/* ---------- HELPERS ---------- */
const $ = (s) => document.querySelector(s);
const initials = (n) => n.split(" ").map((w) => w[0]).join("");
const minPrice = (f) => Math.min(...f.services.map((s) => s.price));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const byId = (id) => freelancers.find((f) => f.id === id);

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg; t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}
function openModal(html) { $("#modalBody").innerHTML = html; $("#modal").classList.remove("hidden"); }
function closeModal() { $("#modal").classList.add("hidden"); }
$("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });

/* ---------- NAVIGATION ---------- */
function showView(v) {
  document.querySelectorAll(".view").forEach((s) => s.classList.add("hidden"));
  $("#" + v).classList.remove("hidden");
  document.querySelectorAll(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.view === v));
  if (v === "dashboard") renderDashboard();
}
document.querySelectorAll(".nav-btn").forEach((b) => b.addEventListener("click", () => showView(b.dataset.view)));
$("#roleSelect").value = state.role;
$("#roleSelect").addEventListener("change", (e) => {
  state.role = e.target.value; save();
  if (!$("#dashboard").classList.contains("hidden")) renderDashboard();
  toast("Switched to " + state.role + " mode");
});

/* ---------- DISCOVER: SEARCH / FILTER / SORT ---------- */
function renderGrid() {
  const q = $("#search").value.toLowerCase().trim();
  const cat = $("#category").value;
  const max = Number($("#maxPrice").value) || Infinity;
  const sort = $("#sort").value;

  let list = freelancers.filter((f) => {
    const text = [f.name, f.title, ...f.skills, ...f.services.map((s) => s.title)].join(" ").toLowerCase();
    return (!q || text.includes(q)) && (!cat || f.category === cat) && minPrice(f) <= max;
  });
  if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
  if (sort === "low") list.sort((a, b) => minPrice(a) - minPrice(b));
  if (sort === "high") list.sort((a, b) => minPrice(b) - minPrice(a));

  $("#resultCount").textContent = list.length + " freelancer(s) found";
  $("#grid").innerHTML = list.length ? list.map((f) => `
    <div class="card" onclick="openProfile(${f.id})">
      <div class="card-head">
        <div class="avatar">${initials(f.name)}</div>
        <div><h3>${f.name}</h3><div class="muted">${f.title}</div></div>
      </div>
      <div class="rating">★ ${f.rating} <span class="muted">(${f.jobs} jobs)</span></div>
      <div class="tags">${f.skills.map((s) => `<span class="tag">${s}</span>`).join("")}</div>
      <div class="card-foot"><span class="muted">Starting at</span><span class="price">$${minPrice(f)}</span></div>
    </div>`).join("") : `<div class="empty" style="grid-column:1/-1">No freelancers match your filters.</div>`;
}
["search", "category", "maxPrice", "sort"].forEach((id) => $("#" + id).addEventListener("input", renderGrid));

/* ---------- FREELANCER PROFILE ---------- */
function openProfile(id) {
  const f = byId(id);
  openModal(`
    <div class="profile-head">
      <div class="avatar big">${initials(f.name)}</div>
      <div>
        <h2>${f.name}</h2>
        <div class="muted">${f.title} • ${f.category}</div>
        <div class="rating">★ ${f.rating} <span class="muted">(${f.jobs} completed jobs)</span></div>
      </div>
    </div>
    <p>${f.bio}</p>
    <div class="tags">${f.skills.map((s) => `<span class="tag">${s}</span>`).join("")}</div>
    <h4>Service listings</h4>
    ${f.services.map((s) => `<div class="service-row"><span>${s.title}</span><b>$${s.price}</b></div>`).join("")}
    <h4>Portfolio</h4>
    <div class="portfolio">${f.portfolio.map((p) => `<div class="port-item" style="background:${p.c}">${p.t}</div>`).join("")}</div>
    <br><button class="btn" onclick="openRequestForm(${f.id})">Send project request</button>`);
}

/* ---------- PROJECT REQUEST FORM (client) ---------- */
function openRequestForm(id) {
  const f = byId(id);
  openModal(`
    <h2>Project request</h2>
    <p class="muted">To: ${f.name} – ${f.title}</p>
    <form onsubmit="submitRequest(event, ${f.id})">
      <label>Project title</label>
      <input id="rTitle" required placeholder="e.g. Build a portfolio website">
      <label>Related service</label>
      <select id="rService">${f.services.map((s) => `<option>${s.title} ($${s.price})</option>`).join("")}<option>Custom project</option></select>
      <label>Project requirements</label>
      <textarea id="rDesc" required placeholder="Describe what you need, features, references..."></textarea>
      <div class="row2">
        <div><label>Budget (USD)</label><input id="rBudget" type="number" min="5" required placeholder="200"></div>
        <div><label>Deadline</label><input id="rDeadline" type="date" required></div>
      </div>
      <br><button class="btn" type="submit">Submit request</button>
    </form>`);
  $("#rDeadline").min = new Date().toISOString().split("T")[0];
}
function submitRequest(e, fid) {
  e.preventDefault();
  state.requests.unshift({
    id: Date.now(), freelancerId: fid, title: $("#rTitle").value, service: $("#rService").value,
    desc: $("#rDesc").value, budget: Number($("#rBudget").value), deadline: $("#rDeadline").value,
    status: "Pending", proposal: null, created: new Date().toLocaleDateString()
  });
  save(); closeModal(); toast("Request sent! Track it in your dashboard.");
}

/* ---------- DASHBOARDS ---------- */
function renderDashboard() {
  const isClient = state.role === "client";
  const reqs = isClient ? state.requests : state.requests.filter((r) => r.freelancerId === CURRENT_FREELANCER_ID);
  $("#dashTitle").textContent = isClient ? "Client dashboard" : "Freelancer dashboard – " + byId(CURRENT_FREELANCER_ID).name;

  const count = (s) => reqs.filter((r) => r.status === s).length;
  const earnings = reqs.filter((r) => r.status === "Completed").reduce((t, r) => t + r.proposal.price, 0);
  $("#stats").innerHTML = `
    <div class="stat"><b>${reqs.length}</b>Total requests</div>
    <div class="stat"><b>${count("Pending")}</b>Pending</div>
    <div class="stat"><b>${count("Proposal")}</b>Proposals sent</div>
    <div class="stat"><b>${count("Accepted")}</b>In progress</div>
    <div class="stat"><b>${isClient ? count("Completed") : "$" + earnings}</b>${isClient ? "Completed" : "Earned"}</div>`;

  $("#requestList").innerHTML = reqs.length ? reqs.map((r) => {
    const f = byId(r.freelancerId);
    const label = r.status === "Proposal" ? "Proposal received" : r.status;
    return `
    <div class="req">
      <div class="req-top">
        <div><h3>${esc(r.title)}</h3><span class="muted">${isClient ? "Freelancer: " + f.name : "Service: " + esc(r.service)}</span></div>
        <span class="badge ${r.status}">${isClient ? label : (r.status === "Proposal" ? "Proposal sent" : r.status)}</span>
      </div>
      <p>${esc(r.desc)}</p>
      <div class="meta"><span>💰 Budget: <b>$${r.budget}</b></span><span>📅 Deadline: <b>${r.deadline}</b></span><span>🕒 Sent: ${r.created}</span></div>
      ${r.proposal ? `<div class="proposal"><b>Proposal:</b> $${r.proposal.price} • ${r.proposal.days} days<br>${esc(r.proposal.msg)}</div>` : ""}
      <div class="actions">${actionButtons(r, isClient)}</div>
    </div>`;
  }).join("") : `<div class="empty">${isClient ? "You haven't sent any requests yet. Go to Discover and hire a freelancer!" : "No requests received yet. Switch to Client mode, send a request to Aisha Khan, then come back."}</div>`;
}

function actionButtons(r, isClient) {
  if (isClient) {
    if (r.status === "Proposal") return `<button class="btn success small" onclick="setStatus(${r.id},'Accepted')">Accept proposal</button>
      <button class="btn danger small" onclick="setStatus(${r.id},'Declined')">Decline</button>`;
    if (r.status === "Pending") return `<span class="muted">Waiting for the freelancer's proposal...</span>`;
    return "";
  }
  if (r.status === "Pending") return `<button class="btn small" onclick="openProposalForm(${r.id})">Submit proposal</button>
    <button class="btn danger small" onclick="setStatus(${r.id},'Declined')">Decline</button>`;
  if (r.status === "Accepted") return `<button class="btn success small" onclick="setStatus(${r.id},'Completed')">Mark as completed</button>`;
  if (r.status === "Proposal") return `<span class="muted">Waiting for client's response...</span>`;
  return "";
}

function setStatus(id, status) {
  state.requests.find((r) => r.id === id).status = status;
  save(); renderDashboard(); toast("Status updated: " + status);
}

/* ---------- PROPOSAL SUBMISSION (freelancer) ---------- */
function openProposalForm(id) {
  const r = state.requests.find((x) => x.id === id);
  openModal(`
    <h2>Submit proposal</h2>
    <p class="muted">${esc(r.title)} – client budget $${r.budget}</p>
    <form onsubmit="submitProposal(event, ${id})">
      <div class="row2">
        <div><label>Your price (USD)</label><input id="pPrice" type="number" min="1" value="${r.budget}" required></div>
        <div><label>Delivery time (days)</label><input id="pDays" type="number" min="1" required></div>
      </div>
      <label>Cover message</label>
      <textarea id="pMsg" required placeholder="Explain how you will approach this project..."></textarea>
      <br><button class="btn" type="submit">Send proposal</button>
    </form>`);
}
function submitProposal(e, id) {
  e.preventDefault();
  const r = state.requests.find((x) => x.id === id);
  r.proposal = { price: Number($("#pPrice").value), days: Number($("#pDays").value), msg: $("#pMsg").value };
  r.status = "Proposal";
  save(); closeModal(); renderDashboard(); toast("Proposal submitted!");
}

/* ---------- INIT ---------- */
renderGrid();