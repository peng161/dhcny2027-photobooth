import { resetPostBtn } from "./post.js";
import { render } from "./preview.js";
import { card, event } from "./state.js";
import { COLORS, DESIGN_DEFAULTS, DESIGN_NAMES } from "../cards/designs.js";
import { energy } from "../cards/kit.js";
import { ABILITIES, EVERYONE, FLAVOR, FORTUNES, LUCKY, RESIST, RETREAT, SHARED_MOVES, SPECIES, STATS, TEAM_KEYS, TEAM_MOVES, TYPES, WEAK, key } from "../config.js";
import { $, pick, shuffled, store } from "../core/util.js";
/* ---------- Editor binding ---------- */
export function buildTypePicker() {
  const tp = $("typePicker");
  tp.innerHTML = "";
  TEAM_KEYS.forEach((k) => {
    const t = TYPES[k];
    const b = document.createElement("button");
    b.type = "button"; b.dataset.type = k;
    const c = document.createElement("canvas"); c.width = 44; c.height = 44;
    energy(c.getContext("2d"), k, 22, 22, 20);
    b.append(c, document.createTextNode(t.label));
    b.addEventListener("click", () => { card.type = k; syncTypes(); render(); });
    tp.append(b);
  });
  const teamOpts = TEAM_KEYS.map(k => `<option value="${k}">${TYPES[k].full}</option>`).join("");
  $("teamSel").innerHTML = teamOpts;
  const designOpts = Object.entries(DESIGN_NAMES).map(([k, n]) => `<option value="${k}">${n}</option>`).join("");
  $("f-frame").innerHTML = designOpts;
}
export function syncTypes() {
  document.querySelectorAll("#typePicker button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.type === card.type)));
  $("teamSel").value = card.type;
}
export function buildAttacks() {
  const box = $("attacks");
  box.innerHTML = "";
  card.attacks.forEach((a, i) => {
    const d = document.createElement("div");
    d.className = "attack full";
    d.innerHTML = `
      <div class="attack-title"><span>Move ${i + 1}</span>${i === 1 ? `<label class="check"><input type="checkbox" id="a2on" ${card.attack2 ? "checked" : ""}> Show</label>` : ""}</div>
      <label class="field">Cost <select id="a${i}-cost">${[0,1,2,3,4].map(n => `<option ${n == a.cost ? "selected" : ""}>${n}</option>`).join("")}</select></label>
      <label class="field">Name <input id="a${i}-name" maxlength="24"></label>
      <label class="field">Damage <input id="a${i}-dmg" maxlength="5"></label>
      <label class="field full">Effect text <textarea id="a${i}-text" maxlength="110"></textarea></label>`;
    box.append(d);
    $(`a${i}-name`).value = a.name; $(`a${i}-dmg`).value = a.dmg; $(`a${i}-text`).value = a.text;
    ["cost", "name", "dmg", "text"].forEach(f => $(`a${i}-${f}`).addEventListener("input", (e) => { a[f] = f === "cost" ? +e.target.value : e.target.value; render(); }));
  });
  $("a2on").addEventListener("change", (e) => { card.attack2 = e.target.checked; render(); });
}
export const FIELD = { name: "f-name", hp: "f-hp", stage: "f-stage", evolves: "f-evolves", species: "f-species", height: "f-height", weight: "f-weight", flavor: "f-flavor", weakTxt: "f-weak", resistTxt: "f-resist", retreatTxt: "f-retreat", rarity: "f-rarity", frame: "f-frame", filter: "f-filter", monkey: "f-monkey", prop: "f-prop" };
export function fillForm() {
  Object.entries(FIELD).forEach(([k, id]) => { $(id).value = card[k]; });
  $("f-holo").checked = card.holo; $("f-seal").checked = card.seal;
  $("teamSel").value = card.type; updateDesignNav();
  $("boothName").value = card.name;
  $("abOn").checked = !!card.ability; $("abName").value = card.ability?.name || ""; $("abText").value = card.ability?.text || "";
  syncTypes(); buildAttacks();
}
export function bindForm() {
  Object.entries(FIELD).forEach(([k, id]) => {
    $(id).addEventListener("input", (e) => {
      card[k] = (k === "hp") ? (parseInt(e.target.value, 10) || 0) : e.target.value;
      if (k === "name") $("boothName").value = card.name;
      render();
    });
  });
  $("f-holo").addEventListener("change", (e) => { card.holo = e.target.checked; render(); });
  $("f-seal").addEventListener("change", (e) => { card.seal = e.target.checked; render(); });
  const abSync = () => { card.ability = $("abOn").checked ? { name: $("abName").value, text: $("abText").value } : null; render(); };
  ["abOn", "abName", "abText"].forEach(id => $(id).addEventListener("input", abSync));
  $("abOn").addEventListener("change", abSync);
  $("f-frame").addEventListener("change", (e) => setDesign(e.target.value));
  $("teamSel").addEventListener("change", (e) => { card.type = e.target.value; shuffleCard(); resetPostBtn(); });
  $("boothName").addEventListener("input", (e) => { card.name = e.target.value; $("f-name").value = card.name; render(); resetPostBtn(); });

  const ev = { set: "e-set", banner: "e-banner", num: "e-num", total: "e-total" };
  Object.entries(ev).forEach(([k, id]) => {
    $(id).value = event[k];
    $(id).addEventListener("input", (e) => { event[k] = (k === "num" || k === "total") ? (parseInt(e.target.value, 10) || 1) : e.target.value; saveEvent(); render(); });
  });
  $("e-autoshuffle").checked = event.autoshuffle;
  $("e-autoshuffle").addEventListener("change", (e) => { event.autoshuffle = e.target.checked; saveEvent(); });
}
export function saveEvent() { store.set(key("event"), event); $("eventLabel").textContent = event.set; }

export function shuffleCard() {
  const team = TYPES[card.type] && !TYPES[card.type].hidden ? card.type : EVERYONE;
  card.type = team;
  const m1 = pick(TEAM_MOVES[team]);
  let m2 = pick(Math.random() < 0.6 ? SHARED_MOVES : TEAM_MOVES[team]);
  while (m2[0] === m1[0]) m2 = pick(SHARED_MOVES);
  card.attacks[0] = { cost: 1 + Math.floor(Math.random() * 2), name: m1[0], dmg: m1[1], text: m1[2] };
  card.attacks[1] = { cost: 2 + Math.floor(Math.random() * 2), name: m2[0], dmg: m2[1], text: m2[2] };
  card.luck = pick(LUCKY);
  card.fortune = pick(Math.random() < 0.6 ? FORTUNES[team] : FORTUNES.shared);
  // half the cards get an Ability + 1 move, the rest get 2 moves
  if (Math.random() < 0.5) {
    const ab = pick(Math.random() < 0.65 ? ABILITIES[team] : ABILITIES.shared);
    card.ability = { name: ab[0], text: ab[1] }; card.attack2 = false;
    if (Math.random() < 0.5) card.attacks[0] = card.attacks[1];
  } else { card.ability = null; card.attack2 = true; }
  card.hp = 60 + Math.floor(Math.random() * 15) * 10;
  card.species = pick(SPECIES[team]);
  card.flavor = pick(Math.random() < 0.7 ? FLAVOR[team] : FLAVOR.shared);
  const [s1, s2] = shuffled(STATS); card.height = s1; card.weight = s2;
  card.weakTxt = pick(Math.random() < 0.5 ? WEAK[team] : WEAK.shared);
  card.resistTxt = pick(Math.random() < 0.5 ? RESIST[team] : RESIST.shared);
  card.retreatTxt = pick(RETREAT);
  card.rarity = pick(["common", "uncommon", "rare", "rare"]);
  fillForm(); render();
}

export const DESIGN_ORDER = Object.keys(DESIGN_NAMES);
export function setDesign(v) { card.frame = v; card.color = 0; Object.assign(card, DESIGN_DEFAULTS[v] || {}); fillForm(); render(); }
export function setColor(k) {
  const n = (COLORS[card.frame] || []).length || 1;
  card.color = ((k % n) + n) % n; updateDesignNav(); render();
}
export function updateDesignNav() {
  $("designName").textContent = DESIGN_NAMES[card.frame] || "";
  const cols = COLORS[card.frame] || [], ci = Math.min(card.color | 0, Math.max(0, cols.length - 1));
  $("designDots").textContent = `Design ${DESIGN_ORDER.indexOf(card.frame) + 1} of ${DESIGN_ORDER.length}${cols[ci] ? "  ·  " + cols[ci].n : ""}`;
  $("colorRow").hidden = cols.length < 2;
  $("colorRow").innerHTML = cols.map((c, k) => `<button type="button" role="radio" aria-checked="${k === ci}" aria-label="${c.n}" title="${c.n}" data-k="${k}" style="--sw:${c.sw}"></button>`).join("");
}
export function cycleDesign(dir) {
  const i = DESIGN_ORDER.indexOf(card.frame);
  setDesign(DESIGN_ORDER[(i + dir + DESIGN_ORDER.length) % DESIGN_ORDER.length]);
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches && $("tilt").animate) {
    $("tilt").animate([{ transform: `translateX(${dir * 60}px)`, opacity: 0.2 }, { transform: "none", opacity: 1 }], { duration: 240, easing: "ease-out" });
  }
}
$("prevDesign").addEventListener("click", () => cycleDesign(-1));
$("colorRow").addEventListener("click", (e) => { const b = e.target.closest("button[data-k]"); if (b) setColor(+b.dataset.k); });
document.addEventListener("keydown", (e) => {
  if (!["ArrowUp", "ArrowDown"].includes(e.key) || location.hash) return;
  const tag = document.activeElement?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
  e.preventDefault(); setColor((card.color | 0) + (e.key === "ArrowDown" ? 1 : -1));
});
$("nextDesign").addEventListener("click", () => cycleDesign(1));
