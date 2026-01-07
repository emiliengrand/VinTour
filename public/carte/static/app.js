/* global L */
const elStatus = document.getElementById("status");
const elRoutes = document.getElementById("routes");
const elSteps = document.getElementById("steps");
const elBusLine = document.getElementById("busLine");

const btnLocate = document.getElementById("btnLocate");
const btnRecalc = document.getElementById("btnRecalc");

const tabList = document.getElementById("tabList");
const tabDetail = document.getElementById("tabDetail");
const btnBack = document.getElementById("btnBack");
const detailTitle = document.getElementById("detailTitle");
const detailSub = document.getElementById("detailSub");

const listView = document.getElementById("listView");
const detailView = document.getElementById("detailView");

const sheet = document.getElementById("sheet");
const sheetHandle = document.getElementById("sheetHandle");

let userPos = null; // {lat, lon}
let bus = null;
let routes = [];
let selected = null;

const map = L.map("map", { zoomControl: false }).setView([50.43, 2.83], 12);
L.control.zoom({ position: "bottomleft" }).addTo(map);

// More "design" basemap (CARTO Voyager)
L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  subdomains: "abcd",
  maxZoom: 20,
  detectRetina: true,
  attribution: "&copy; OpenStreetMap &copy; CARTO"
}).addTo(map);

let userMarker = null;
let busMarker = null;
let routeLayers = L.layerGroup().addTo(map);

function escapeHtml(s) {
  return (s || "").toString()
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}

function fmtMeters(m) {
  if (!Number.isFinite(m)) return "";
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m/1000).toFixed(1)} km`;
}

function fmtDuration(sec){
  const m = Math.round(sec/60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m/60);
  const mm = m % 60;
  return `${h} h ${mm} min`;
}

async function fetchJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  const ct = (res.headers.get("content-type") || "").toLowerCase();
  const txt = await res.text();

  if (!res.ok) throw new Error(txt || `HTTP ${res.status}`);
  if (!ct.includes("application/json")) throw new Error("Réponse non-JSON (probable erreur PHP). Détail: " + txt.slice(0, 200));

  try { return JSON.parse(txt); }
  catch {
    const iObj = txt.indexOf("{");
    const iArr = txt.indexOf("[");
    const i = (iObj === -1) ? iArr : (iArr === -1 ? iObj : Math.min(iObj, iArr));
    if (i >= 0) return JSON.parse(txt.slice(i));
    throw new Error("JSON invalide. Début reçu: " + txt.slice(0, 80));
  }
}

function openSheetMax() {
  sheet.classList.remove("sheet--min", "sheet--mid");
  sheet.classList.add("sheet--max");
}
function openSheetMid() {
  sheet.classList.remove("sheet--min", "sheet--max");
  sheet.classList.add("sheet--mid");
}
function toggleSheet() {
  if (sheet.classList.contains("sheet--max")) openSheetMid();
  else openSheetMax();
}
if (sheetHandle) sheetHandle.addEventListener("click", toggleSheet);

function setUserMarker(lat, lon) {
  if (userMarker) userMarker.remove();
  userMarker = L.circleMarker([lat, lon], { radius: 8 }).addTo(map).bindPopup("Tu es ici");
}
function setBusMarker(lat, lon, label) {
  if (busMarker) busMarker.remove();
  busMarker = L.marker([lat, lon]).addTo(map).bindPopup(label || "Tadao vin'tour");
}

function clearRouteLayers(){
  routeLayers.clearLayers();
}

function addLine(points, opts){
  const line = L.polyline(points, opts || {});
  routeLayers.addLayer(line);
  return line;
}

function addDot(lat, lon, label){
  const m = L.circleMarker([lat, lon], { radius: 6 });
  if (label) m.bindPopup(label);
  routeLayers.addLayer(m);
  return m;
}

function fitRoute(){
  try{
    const bounds = routeLayers.getBounds();
    if (bounds && bounds.isValid && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }catch(e){}
}
async function loadBus() {
  bus = await fetchJson("./api/bus.php");
  if (!bus || !bus.lat || !bus.lon) throw new Error("bus.json invalide");
  setBusMarker(bus.lat, bus.lon, `${bus.name || "Tadao vin'tour"}${bus.city ? " – " + bus.city : ""}`);
  if (elBusLine) elBusLine.textContent = `Destination : ${bus.city ? bus.city + " · " : ""}${bus.name || "Tadao vin'tour"}`;
}
loadBus().catch(console.warn);

function showList() {
  selected = null;
  tabList.classList.add("tab--active");
  tabDetail.classList.remove("tab--active");
  tabDetail.disabled = true;
  listView.style.display = "";
  detailView.style.display = "none";
}

function showDetail(route) {
  selected = route;
  tabDetail.disabled = false;
  tabDetail.classList.add("tab--active");
  tabList.classList.remove("tab--active");
  listView.style.display = "none";
  detailView.style.display = "";
  openSheetMax();
}

function routeTitle(route){
  if (route.type === "walk_only") return "À pied";
  const fr = route.recommended_start?.stop?.stop_name || "Départ";
  return fr;
}

function renderRoutes() {
  elRoutes.innerHTML = "";
  if (!routes.length) {
    elRoutes.innerHTML = `<div class="route-card"><div class="route-time">Aucun itinéraire</div><div class="route-dur">—</div></div>`;
    return;
  }

  routes.forEach(r => {
    const sum = r.summary;
    const dep = r.departure_time ? `Départ ${escapeHtml(r.departure_time)}` : "Départ maintenant";
    const transfers = sum.transfers || 0;
    const rides = sum.ride_legs || 0;
    const modeLabel = r.type === "walk_only" ? "Marche" : `Bus · ${rides} trajet(s)`;

    const lineNames = (r.itinerary || [])
      .filter(s => s.type === "ride")
      .map(s => s.route?.short_name || s.route?.long_name || "Ligne");
    const uniqueLines = [...new Set(lineNames)].slice(0, 4);
    const linesChip = uniqueLines.length ? `<span class="badge">🧾 <strong>${uniqueLines.map(escapeHtml).join(" → ")}</strong></span>` : "";

    const card = document.createElement("div");
    card.className = "route-card";
    card.innerHTML = `
      <div class="route-top">
        <div class="route-time">${dep} · ${escapeHtml(routeTitle(r))}</div>
        <div class="route-dur">${escapeHtml(fmtDuration(sum.total_seconds))}</div>
      </div>
      <div class="route-mid">
        <span class="badge">⏱️ <strong>${escapeHtml(fmtDuration(sum.total_seconds))}</strong></span>
        <span class="badge">🔁 <strong>${transfers}</strong> correspondance(s)</span>
        <span class="badge">🚶 <strong>${escapeHtml(fmtMeters(sum.total_walk_m))}</strong></span>
        <span class="badge">🚌 <strong>${escapeHtml(modeLabel)}</strong></span>
        ${linesChip}
      </div>
    `;
    card.addEventListener("click", () => openRoute(r));
    elRoutes.appendChild(card);
  });
}

function renderSteps(route) {
  const sum = route.summary;

  detailTitle.textContent = route.type === "walk_only" ? "Itinéraire à pied" : "Détails du trajet";
  detailSub.textContent = `${fmtDuration(sum.total_seconds)} · ${sum.transfers} correspondance(s) · marche ${fmtMeters(sum.total_walk_m)}`;

  const steps = route.itinerary || [];
  elSteps.innerHTML = steps.map(st => {
    if (st.type === "walk") {
      const label =
        st.from === "user" ? `Marche jusqu’à ${escapeHtml(st.to_stop?.stop_name || "un arrêt")}` :
        st.to === "bus" ? `Marche jusqu’au bus` :
        `Marche (correspondance)`;
      const meta = `${fmtMeters(st.distance_m)} · ~${fmtDuration(st.duration_seconds)}`;
      const where = st.from_stop && st.to_stop ? `${escapeHtml(st.from_stop.stop_name)} → ${escapeHtml(st.to_stop.stop_name)}` : "";
      return `
        <div class="step">
          <div class="step-title">🚶 ${label}</div>
          <div class="step-sub">${escapeHtml(meta)}</div>
          ${where ? `<div class="step-meta">${where}</div>` : ""}
        </div>
      `;
    }
    if (st.type === "ride") {
      const line = st.route?.short_name || st.route?.long_name || "Ligne";
      const head = st.headsign ? ` · ${escapeHtml(st.headsign)}` : "";
      return `
        <div class="step">
          <div class="step-title">🚌 ${escapeHtml(line)}${head}</div>
          <div class="step-sub">
            ${escapeHtml(st.from.departure_time)} : monter à <strong>${escapeHtml(st.from.stop.stop_name)}</strong><br/>
            ${escapeHtml(st.to.arrival_time)} : descendre à <strong>${escapeHtml(st.to.stop.stop_name)}</strong>
          </div>
          
        </div>
      `;
    }
    return "";
  }).join("");
}

async function osrmGeom(coords){
  const url = `./api/route/osrm_proxy.php?coords=${encodeURIComponent(coords)}`;
  const data = await fetchJson(url);
  const geom = data.geometry || [];
  if (!geom.length) return null;
  return geom.map(c => [c[1], c[0]]); // [lat,lon]
}

async function drawStreetTrace(route){
  if (!userPos || !bus) return;

  clearRouteLayers();

  // Context points
  addDot(userPos.lat, userPos.lon, "Départ (toi)");
  addDot(bus.lat, bus.lon, "Tadao vin'tour");

  const steps = route.itinerary || [];
  if (!steps.length) { fitRoute(); return; }

  const stopPoint = (s) => ({ lat: s.stop_lat, lon: s.stop_lon });

  const tasks = [];
  const markers = [];

  for (const st of steps){
    if (st.type === "walk") {
      let a, b, labelA=null, labelB=null;

      if (st.from === "user") {
        a = { lat: userPos.lat, lon: userPos.lon };
        b = stopPoint(st.to_stop);
        labelB = "Arrêt de départ";
      } else if (st.to === "bus") {
        a = stopPoint(st.from_stop);
        b = { lat: bus.lat, lon: bus.lon };
        labelA = "Dernier arrêt";
      } else {
        a = stopPoint(st.from_stop);
        b = stopPoint(st.to_stop);
        labelA = "Correspondance";
        labelB = "Correspondance";
      }

      if (labelA) markers.push({ p: a, label: labelA });
      if (labelB) markers.push({ p: b, label: labelB });

      const coordsStr = `${a.lon},${a.lat};${b.lon},${b.lat}`;
      tasks.push({
        kind: "walk",
        coordsStr,
        fallbackPts: [[a.lat,a.lon],[b.lat,b.lon]],
        opts: { dashArray: "6 8" } // walking dashed
      });
    }

    if (st.type === "ride") {
      const a = stopPoint(st.from.stop);
      const b = stopPoint(st.to.stop);

      markers.push({ p: a, label: `Monter ici (${st.from.departure_time})` });
      markers.push({ p: b, label: `Descendre ici (${st.to.arrival_time})` });

      const coordsStr = `${a.lon},${a.lat};${b.lon},${b.lat}`;
      tasks.push({
        kind: "ride",
        coordsStr,
        fallbackPts: [[a.lat,a.lon],[b.lat,b.lon]],
        opts: { weight: 5 } // bus thicker
      });
    }
  }

  // Draw segments sequentially (one OSRM call per segment)
  for (const t of tasks){
    try{
      const pts = await osrmGeom(t.coordsStr);
      if (pts) addLine(pts, t.opts);
      else addLine(t.fallbackPts, t.opts);
    }catch(e){
      addLine(t.fallbackPts, t.opts);
    }
  }

  // Add markers (dedupe)
  const seen = new Set();
  for (const m of markers){
    const key = `${m.p.lat.toFixed(6)},${m.p.lon.toFixed(6)},${m.label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    addDot(m.p.lat, m.p.lon, m.label);
  }

  fitRoute();
}

async function openRoute(route) {
  showDetail(route);
  renderSteps(route);
  await drawStreetTrace(route);
}

async function compute() {
  if (!userPos) return;
  if (!bus) await loadBus();

  elStatus.textContent = "Recherche des itinéraires…";
  elRoutes.innerHTML = "";
  showList();
  openSheetMax();

  const when = new Date().toISOString();
  const url = `./api/route/options.php?lat=${encodeURIComponent(userPos.lat)}&lon=${encodeURIComponent(userPos.lon)}&when=${encodeURIComponent(when)}&k=8`;
  try {
    const res = await fetchJson(url);
    routes = res.routes || [];
    renderRoutes();
    if (!routes.length) {
      elStatus.textContent = res.notice || "Aucun itinéraire en bus.";
    } else {
      elStatus.textContent = "";
    }
    btnRecalc.disabled = false;

    if (routes.length) {
      await drawStreetTrace(routes[0]);
    }
  } catch (e) {
    routes = [];
    elStatus.textContent = "Erreur : " + e.message;
  }
}

btnLocate.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      userPos = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      setUserMarker(userPos.lat, userPos.lon);
      map.setView([userPos.lat, userPos.lon], 14);
      await compute();
    },
    (err) => alert("Géolocalisation impossible : " + err.message),
    { enableHighAccuracy: true, timeout: 12000 }
  );
});

btnRecalc.addEventListener("click", compute);

tabList.addEventListener("click", () => showList());
tabDetail.addEventListener("click", () => selected && showDetail(selected));
btnBack.addEventListener("click", () => showList());
