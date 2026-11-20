import { fillForm } from "../booth/editor.js";
import { download } from "../booth/gallery.js";
import { postToWall } from "../booth/post.js";
import { render } from "../booth/preview.js";
import { doPrint, setPage } from "../booth/print.js";
import { card, event, photo } from "../booth/state.js";
import { drawMascotMark } from "../cards/kit.js";
import { EVENT, EVERYONE, PACK_ORDER, asset, key, txt } from "../config.js";
import { API, DEMO, api, askCode, demoCards, ensureCode, getAdminKey, getPass, ls } from "../core/session.js";
import { $, H, W, fitFont, rng, rr, toast, wrap } from "../core/util.js";
import { WALL_BGS, bgRaf, setWallBg, wallBg } from "./backgrounds.js";
import { makeDemoCard, makeDemoCards } from "./demo.js";
import { getPackArt, packKeyFor } from "./packart.js";
import { demoCounts, isLiked, likeCount, likesOn, onLikes, setCounts, toggleLike, topLiked } from "./likes.js";
/* --- wall data --- */
export let wallTimer = 0, cycleTimer = 0, demoTimer = 0, wallList = [], wallLoaded = false, featIdx = 0, holdUntil = 0;
export let wallMode = ls.get(key("wallmode")) || "show";
export let featId = "", gridSort = ls.get(key("wallsort")) || "new", nextBadge = "", cycleCount = 0;
/** TV mode: the big screen (shows the QR code). Otherwise it is a staff phone: tap cards, like them. */
export const isTV = () => new URLSearchParams(location.search).has("tv") || (matchMedia("(pointer: fine)").matches && innerWidth >= 900);
export const imgUrl = (id) => `${API}?id=${encodeURIComponent(id)}&pass=${encodeURIComponent(getPass())}`;
export const cardSrc = (id) => (DEMO ? demoCards.get(id) : imgUrl(id));
export function wallFigure(id) {
  const f = document.createElement("figure"); f.dataset.id = id;
  const img = document.createElement("img"); img.loading = "lazy"; img.alt = EVENT.brand.cardAlt; img.src = cardSrc(id);
  img.addEventListener("click", () => { $("wallViewImg").src = img.src; $("wallView").hidden = false; });
  f.append(img);
  const like = document.createElement("button"); like.type = "button"; like.className = "like-chip"; like.hidden = !likesOn();
  like.addEventListener("click", (e) => { e.stopPropagation(); toggleLike(id); like.classList.remove("pop"); void like.offsetWidth; like.classList.add("pop"); });
  const medal = document.createElement("span"); medal.className = "medal"; medal.hidden = true;
  f.append(like, medal); paintChip(f);
  if (getAdminKey() && !DEMO) {
    const del = document.createElement("button"); del.type = "button"; del.className = "btn del"; del.textContent = "Remove";
    del.addEventListener("click", async () => {
      if (!del.dataset.armed) { del.dataset.armed = "1"; del.textContent = "Tap again to remove"; setTimeout(() => { delete del.dataset.armed; del.textContent = "Remove"; }, 3000); return; }
      const r = await api("DELETE", `?id=${encodeURIComponent(id)}`);
      if (r.ok) { wallList = wallList.filter(x => x !== id); f.remove(); updateWallCount(); refreshShow(false); toast("Card removed"); } else toast(r.data.error || "Couldn't remove it.");
    });
    f.append(del);
  }
  return f;
}
export function updateWallCount() {
  const n = wallList.length;
  const txt = n ? `${n} card${n === 1 ? "" : "s"} · updates live` : "";
  $("wallCount").textContent = txt;
  $("showCount").textContent = n && likesOn() && !isTV() ? "Tap a card to see it · ❤️ to like" : txt;
  $("wallEmpty").hidden = n > 0;
  $("showEmpty").hidden = n > 0;
}
export async function fetchIds() {
  if (DEMO) { const ids = [...demoCards.keys()].sort().reverse(); demoCounts(ids); return ids; }
  const r = await api("GET");
  if (r.status === 401) { ls.set(key("pass"), ""); if (await askCode("Enter the event code to see the Card Wall.")) return fetchIds(); return null; }
  if (!r.ok) { $("wallCount").textContent = r.data.error || "Couldn't load the wall. Retrying…"; return null; }
  setCounts(r.data.likes ?? null, r.data.mine);
  return (Array.isArray(r.data.cards) ? r.data.cards : []).filter(id => typeof id === "string" && /^\d{13}-[a-z0-9]{1,8}-[a-z]{1,6}$/.test(id));
}
export async function loadWall() {
  const ids = await fetchIds(); if (!ids) return;
  const known = new Set(wallList), fresh = ids.filter(id => !known.has(id));
  wallList = ids;
  const grid = $("wallGrid"), live = new Set(ids);
  [...grid.children].forEach(f => { if (!live.has(f.dataset.id)) f.remove(); });
  const have = new Set([...grid.children].map(f => f.dataset.id));
  ids.slice().reverse().forEach(id => { if (!have.has(id)) grid.prepend(wallFigure(id)); });
  sortGrid(); updateWallCount();
  if (!wallLoaded) {
    const seen = new Set(), unseen = ids.slice();   // every visit replays the booster opening with all the cards
    ids.forEach(id => { if (seen.has(id)) revealed.add(id); });
    if (unseen.length && wallMode === "show") setTimeout(() => megaOpen(unseen), 700);
    else { unseen.forEach(id => revealed.add(id)); markSeen(unseen); }
  }
  else if (fresh.length) queueForPack(fresh);
  [...revealed].forEach(id => { if (!live.has(id)) revealed.delete(id); });
  packQueue = packQueue.filter(id => live.has(id));
  refreshShow(false);
  maybeOpenPack(); updatePackCount();
  wallLoaded = true;
} // lets the organiser preview all six packs from the console

/* --- booster packs: new cards collect into packs of 5, then the pack opens on the wall --- */
export const PACK_SIZE = 3, PACK_MAX_WAIT = 120000;
export let packQueue = [], packFirstAt = 0, packPlaying = false, revealed = new Set(), cardBackUrl = "";
export function makeCardBack() {
  if (cardBackUrl) return cardBackUrl;
  const c = document.createElement("canvas"); c.width = 375; c.height = 525;
  const g = c.getContext("2d"); g.scale(0.5, 0.5);
  // dark blue border
  rr(g, 0, 0, W, H, 34); g.fillStyle = "#1c2f8f"; g.fill();
  const ix = 40, iy = 40, iw = W - 80, ih = H - 80, cx = W / 2, cy = H / 2;
  g.save(); rr(g, ix, iy, iw, ih, 14); g.clip();
  const bg = g.createRadialGradient(cx, cy, 40, cx, cy, 700); bg.addColorStop(0, "#9cc4ff"); bg.addColorStop(0.45, "#3f7fe0"); bg.addColorStop(1, "#1a49b0");
  g.fillStyle = bg; g.fillRect(ix, iy, iw, ih);
  // swirling vortex: soft wide strokes, then crisp fine ones
  const R = rng(5);
  const swirl = (n, wMin, wMax, alpha, blur) => {
    g.save(); g.filter = blur ? `blur(${blur}px)` : "none"; g.lineCap = "round";
    for (let i = 0; i < n; i++) {
      const a0 = R() * Math.PI * 2, r0 = 60 + R() * 120, turns = 0.5 + R() * 0.7;
      g.beginPath();
      for (let t = 0; t <= 1.0001; t += 0.02) {
        const a = a0 + t * turns * Math.PI * 2, r = r0 + t * (420 + R() * 4);
        const x = cx + Math.cos(a) * r * 1.05, y = cy + Math.sin(a) * r * 1.25;
        t ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.strokeStyle = `rgba(255,255,255,${alpha * (0.5 + R() * 0.5)})`; g.lineWidth = wMin + R() * (wMax - wMin); g.stroke();
    }
    g.restore();
  };
  swirl(26, 18, 46, 0.35, 10); swirl(40, 2, 6, 0.45, 1.5); swirl(20, 8, 16, 0.25, 4);
  const vg = g.createRadialGradient(cx, cy, 300, cx, cy, 720); vg.addColorStop(0, "rgba(10,30,90,0)"); vg.addColorStop(1, "rgba(10,30,90,.45)");
  g.fillStyle = vg; g.fillRect(ix, iy, iw, ih);
  g.restore();
  rr(g, ix, iy, iw, ih, 14); g.strokeStyle = "#13246f"; g.lineWidth = 4; g.stroke();
  // DIGITAL HUB lettering, top and upside-down at the bottom
  const word = (y, flip) => {
    g.save(); g.translate(cx, y); if (flip) g.rotate(Math.PI); g.rotate(-0.06);
    g.textAlign = "center"; g.textBaseline = "middle";
    fitFont(g, txt("cardBack"), "italic 900", 112, `"Rubik", "Arial Black", sans-serif`, iw - 60, 60);
    g.lineJoin = "round";
    g.lineWidth = 30; g.strokeStyle = "#13246f"; g.strokeText(txt("cardBack"), 0, 6);
    g.lineWidth = 18; g.strokeStyle = "#3a6fd8"; g.strokeText(txt("cardBack"), 0, 0);
    const yg = g.createLinearGradient(0, -50, 0, 50); yg.addColorStop(0, "#ffe14a"); yg.addColorStop(1, "#ffb800");
    g.fillStyle = yg; g.fillText(txt("cardBack"), 0, 0);
    g.restore();
  };
  word(250, false); word(H - 250, true);
  // centre: glowing DH Monkey medallion
  const gl = g.createRadialGradient(cx, cy, 60, cx, cy, 260); gl.addColorStop(0, "rgba(255,255,255,.75)"); gl.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gl; g.beginPath(); g.arc(cx, cy, 260, 0, Math.PI * 2); g.fill();
  drawMascotMark(g, cx, cy, 150, "gold");
  cardBackUrl = c.toDataURL("image/jpeg", 0.92);
  return cardBackUrl;
}
export function updatePackCount() {
  const el = $("packCount");
  el.textContent = packQueue.length && !packPlaying ? `🎁 Next pack: ${packQueue.length} / ${PACK_SIZE} cards` : "";
}
export function queueForPack(ids) {
  ids.forEach(id => { if (!revealed.has(id) && !packQueue.includes(id)) packQueue.push(id); });
  if (packQueue.length && !packFirstAt) packFirstAt = Date.now();
  maybeOpenPack();
  updatePackCount();
}
export function maybeOpenPack() {
  if (packPlaying || !packQueue.length) return;
  if (wallMode !== "show") { const q = packQueue.splice(0); q.forEach(id => revealed.add(id)); markSeen(q); packFirstAt = 0; refreshShow(false); return; }
  if (packQueue.length >= PACK_SIZE || Date.now() - packFirstAt > PACK_MAX_WAIT) {
    const ids = packQueue.splice(0, PACK_SIZE);
    packFirstAt = packQueue.length ? Date.now() : 0;
    openPack(ids);
  }
}
export const sleep = (ms) => new Promise(r => setTimeout(r, ms));
/* Wall rarity: every card gets a rarity on reveal (no commons); very rare packs glitter */
export const RARITY = [null,
  { s: "★", name: "RARE" }, { s: "★★", name: "DOUBLE RARE" },
  { s: "★★★", name: "ULTRA RARE" }, { s: "👑", name: "CROWN RARE" }];
export function rollRarity(isLast) {
  const r = Math.random();
  if (isLast) return DEMO ? (r < 0.6 ? 3 : 4) : (r < 0.55 ? 2 : r < 0.85 ? 3 : 4); // last card: at least ★★
  return r < 0.5 ? 1 : r < 0.82 ? 2 : r < 0.95 ? 3 : 4;
}
export function glitterBurst(count) {
  const stage = $("packStage"), pack = $("pack").getBoundingClientRect(), sr = stage.getBoundingClientRect();
  const x0 = pack.left - sr.left + pack.width / 2, y0 = pack.top - sr.top + pack.height * 0.07;
  for (let i = 0; i < count; i++) {
    const b = document.createElement("i"); b.className = "glit";
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4, d = 120 + Math.random() * 320;
    b.style.left = `${x0 + (Math.random() - 0.5) * pack.width * 0.8}px`; b.style.top = `${y0}px`;
    b.style.setProperty("--dx", `${Math.cos(a) * d}px`); b.style.setProperty("--dy", `${Math.sin(a) * d}px`);
    b.style.setProperty("--c", `hsl(${Math.floor(Math.random() * 360)},95%,72%)`);
    b.style.animationDelay = `${Math.random() * 0.25}s`;
    stage.append(b); setTimeout(() => b.remove(), 1900);
  }
}
/* A real rip: the top strip peels up along a jagged foil edge, light pours out, flakes fly */
export function tearPack(dur, special) {
  const pack = $("pack"), art = $("packImg"), top = $("packTop"), cut = $("packCut"), TY = 6.5, STRIP = 9;
  const R = rng(Math.floor(Math.random() * 1e6)), N = 34, pts = [];
  for (let i = 0; i <= N; i++) pts.push([(i / N) * 100, TY + (i % 2 ? 0.7 : -0.45) + (R() - 0.5) * 0.7]);
  top.style.height = STRIP + "%";
  top.style.clipPath = "polygon(0 0, 100% 0, " + pts.slice().reverse().map(([x, y]) => `${x.toFixed(2)}% ${(y / STRIP * 100).toFixed(2)}%`).join(", ") + ")";
  top.style.transformOrigin = "100% 75%";
  cut.style.opacity = "1"; cut.classList.toggle("rainbow", !!special);
  let lastBit = 0;
  const start = performance.now();
  return new Promise((res) => {
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur), e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2, cx = e * 100;
      const edge = pts.filter(([x]) => x <= cx).map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`);
      art.style.clipPath = `polygon(${edge.length ? edge.join(", ") + ", " : "0% " + TY + "%, "}${cx.toFixed(2)}% ${TY}%, ${cx.toFixed(2)}% 0%, 100% 0%, 100% 100%, 0% 100%)`;
      top.style.transform = `rotate(${(e * 7).toFixed(2)}deg) translateY(${(-e * 1.4).toFixed(2)}vh)`;
      cut.style.transform = `scaleX(${e.toFixed(3)})`;
      if (now - lastBit > 35 && p < 1) {
        lastBit = now;
        for (let j = 0; j < 2; j++) {
          const b = document.createElement("i"); b.className = "bit";
          b.style.left = cx + "%"; b.style.top = TY + "%";
          b.style.setProperty("--dx", `${Math.round(Math.random() * 70 - 15)}px`);
          b.style.setProperty("--dy", `${Math.round(-30 - Math.random() * 70)}px`);
          b.style.setProperty("--r", `${Math.round(Math.random() * 720)}deg`);
          if (special) { const c = `hsl(${Math.floor(Math.random() * 360)},95%,72%)`; b.style.background = c; b.style.boxShadow = `0 0 8px ${c}`; }
          pack.append(b); setTimeout(() => b.remove(), 1000);
        }
      }
      if (p < 1) requestAnimationFrame(step); else res();
    };
    requestAnimationFrame(step);
  });
}
export async function openPack(ids) {
  packPlaying = true; updatePackCount(); holdUntil = Date.now() + 120000;
  const T = DEMO ? 0.6 : 1; // the demo runs a little faster
  const stage = $("packStage"), pack = $("pack"), cardsBox = $("packCards"), burst = $("packBurst"), cap = $("packCaption"), cut = $("packCut");
  const flash = (top) => { burst.className = "pack-burst" + (top ? " top" : ""); void burst.offsetWidth; burst.classList.add("go"); };
  $("featWrap").style.visibility = "hidden"; document.querySelector(".feat-cap").style.visibility = "hidden";
  cardsBox.innerHTML = ""; cap.textContent = ""; pack.className = "pack"; cut.className = "pack-cut";
  { const pt = $("packTop"); ["transform", "opacity", "transition", "clipPath", "height", "transformOrigin"].forEach(k => pt.style[k] = ""); $("packImg").style.clipPath = ""; cut.style.cssText = ""; }
  cardsBox.classList.add("behind");
  const key = packKeyFor(ids), art = await getPackArt(key);
  const rar = ids.map((_, i) => rollRarity(i === ids.length - 1 && ids.length > 1)), best = Math.max(...rar), special = best >= 3;
  if (art) { $("packImg").src = art; $("packTop").style.backgroundImage = `url("${art}")`; }
  stage.hidden = false;
  // 1. pack drops in and settles
  void pack.offsetWidth; pack.classList.add("in");
  if (special) pack.classList.add("special");
  await sleep(1500 * T);
  // 2. a glowing line slowly slices across the top of the wrapper
  cap.textContent = best >= 4 ? "👑 Something legendary…" : special ? "✨ Something special…" : "Opening…";
  await tearPack(special ? 2000 : 1700, special);
  pack.classList.add("torn"); flash(true);
  if (special) glitterBurst(best >= 4 ? 110 : 70);
  cut.style.transition = "opacity .5s"; cut.style.opacity = "0";
  { const pt = $("packTop"); pt.style.transition = "transform .9s cubic-bezier(.2,.8,.2,1), opacity .9s"; pt.style.transform = "translate(9vh, -26vh) rotate(32deg)"; pt.style.opacity = "0"; }
  // 3. the stack rises out of the opening, then the wrapper slides away
  const back = asset("card-back.webp"), n = ids.length;
  const els = ids.map((id, i) => {
    const el = document.createElement("div"); el.className = `pcard rar-${rar[i]}`;
    el.innerHTML = `<div class="pc-inner"><img class="pc-face pc-front" alt="New card"><div class="pc-face pc-shine"></div><img class="pc-face pc-back" alt=""></div><div class="rar-tag"><span class="st">${RARITY[rar[i]].s}</span> ${RARITY[rar[i]].name}</div>`;
    el.querySelector(".pc-front").src = cardSrc(id);
    const bk = el.querySelector(".pc-back"); bk.onerror = () => { bk.onerror = null; bk.src = makeCardBack(); }; bk.src = back;
    el.style.zIndex = String(100 - i);
    el.style.transform = `translate(-50%, -50%) translateY(6vh) scale(.92)`;
    cardsBox.append(el); return el;
  });
  await sleep(60);
  els.forEach((el, i) => {
    el.style.opacity = "1"; el.style.transitionDuration = "1.4s";
    el.style.transform = `translate(-50%, -50%) translate(${i * 3}px, calc(-24vh - ${i * 3}px)) rotate(${(i % 2 ? 1 : -1) * i * 0.8}deg) scale(.92)`;
  });
  cap.textContent = "";
  await sleep(1700 * T);
  pack.classList.add("gone");
  await sleep(250);
  cardsBox.classList.remove("behind");
  els.forEach((el, i) => { el.style.transitionDuration = ""; el.style.transform = `translate(-50%, -50%) translate(${i * 4}px, ${-i * 4}px) rotate(${(i % 2 ? 1 : -1) * i * 1.4}deg) scale(.95)`; });
  await sleep(1000 * T);
  // 4. reveal one card at a time, then tuck it into the row below
  for (let i = 0; i < n; i++) {
    const el = els[i], last = i === n - 1 && n > 1;
    el.style.zIndex = "300";
    cap.textContent = last ? "✨ Last card…" : `Card ${i + 1} of ${n}`;
    el.style.transform = "translate(-50%, -50%) translateY(-2vh) scale(1.1)";
    await sleep(450 * T);
    el.classList.add("tease");                       // a moment of suspense: tremble + glowing edge
    await sleep((last ? 1100 : 450) * T);
    el.classList.remove("tease");
    if (last) el.classList.add("rare");
    el.classList.add("flipped");
    setTimeout(() => el.classList.add("shown"), last ? 900 : 560);
    if (last) setTimeout(() => { flash(false); cap.textContent = rar[i] >= 4 ? "👑 Crown pull!" : "✨ Rare pull!"; stage.classList.remove("shake"); void stage.offsetWidth; stage.classList.add("shake"); }, 780);
    else if (rar[i] >= 3) setTimeout(() => { flash(false); glitterBurst(30); }, 420);
    await sleep((last ? 3400 : 2100) * T);
    el.style.zIndex = String(10 + i);
    el.style.setProperty("--off", String(i - (n - 1) / 2));
    el.classList.add("inrow");
    await sleep(550 * T);
  }
  cap.textContent = "Welcome to the wall! 🎉";
  await sleep(2000 * T);
  cap.textContent = "";
  // 5. into the card rivers
  prepareRivers(ids); stage.classList.add("landing");
  await sleep(350);
  await Promise.all(els.map((el, i) => sleep(i * 160).then(() => {
    const r = el.getBoundingClientRect();
    el.style.transition = "none"; el.style.visibility = "hidden";
    return landInRiver(ids[i], { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.height * (750 / 1050) }, { dur: 1150 });
  })));
  await sleep(400);
  stage.hidden = true; stage.classList.remove("landing"); cardsBox.innerHTML = "";
  markSeen(ids); releaseRivers();
  $("featWrap").style.visibility = ""; document.querySelector(".feat-cap").style.visibility = "";
  packPlaying = false; holdUntil = 0;
  await pullToCentre(ids[ids.length - 1], true); holdUntil = Date.now() + 6000;
  updatePackCount();
  maybeOpenPack();
}

/* --- booster-box opening: cards this screen hasn't shown yet, 10 per pack, opened in one go --- */
export const SEEN_KEY = key("seen"), MEGA_PACK = 10;
export function loadSeen() { try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || "[]")); } catch { return new Set(); } }
export function markSeen(ids) {
  if (DEMO || !ids.length) return;
  const s = loadSeen(); ids.forEach(i => s.add(i));
  try { localStorage.setItem(SEEN_KEY, JSON.stringify([...s].slice(-3000))); } catch {}
}
export async function megaOpen(ids) {
  packPlaying = true; updatePackCount(); holdUntil = Date.now() + 600000;
  const stage = $("packStage"), cap = $("packCaption"), box = $("megaPacks"), cardsBox = $("packCards");
  const groups = []; for (let i = 0; i < ids.length; i += MEGA_PACK) groups.push(ids.slice(i, i + MEGA_PACK));
  const n = groups.length;
  const per = Math.max(700, Math.min(2400, 16000 / n));          // 1-6 packs: ~2.4s each; many packs: shorter, never rushed
  const fly = Math.min(3200, per * 1.4 + 900);
  $("featWrap").style.visibility = "hidden"; document.querySelector(".feat-cap").style.visibility = "hidden";
  $("pack").style.display = "none"; cardsBox.innerHTML = ""; box.innerHTML = "";
  // size the packs so they all fit on screen
  const cols = Math.min(n, Math.ceil(Math.sqrt(n * (innerWidth / innerHeight) * 0.9))), rows = Math.ceil(n / cols);
  const mh = Math.min(innerHeight * 0.42, (innerHeight * 0.6) / rows, ((innerWidth * 0.9) / cols - 12) / 0.5525);
  box.style.setProperty("--mh", `${Math.floor(mh)}px`);
  const arts = await Promise.all(groups.map(g => getPackArt(packKeyFor(g))));
  const packs = groups.map((g, i) => {
    const p = document.createElement("div"); p.className = "mpack"; p.style.animationDelay = `${i * Math.min(140, 1200 / n)}ms`;
    p.innerHTML = `<img alt=""><div class="mp-top"></div>`;
    if (arts[i]) { p.querySelector("img").src = arts[i]; p.querySelector(".mp-top").style.backgroundImage = `url("${arts[i]}")`; }
    box.append(p); return p;
  });
  cap.textContent = `📦 ${ids.length} card${ids.length === 1 ? "" : "s"} waiting · ${n} pack${n === 1 ? "" : "s"}`;
  prepareRivers(ids);
  stage.hidden = false;
  await sleep(1800 + Math.min(1000, n * 60));
  cap.textContent = "Opening…"; stage.classList.add("landing");
  const sr = stage.getBoundingClientRect(), flights = [];
  const fan = Math.round(fly * 0.62), hop = Math.max(700, Math.min(1300, per * 0.75));
  for (let i = 0; i < n; i++) {
    const p = packs[i], r = p.getBoundingClientRect();
    p.classList.add("rip");
    const cx = r.left - sr.left + r.width / 2, cy = r.top - sr.top + r.height * 0.3;
    const cw = Math.max(46, Math.min(r.width * 0.8, innerWidth * 0.16));
    groups[i].forEach((id, k) => {
      const m = document.createElement("img"); m.className = "mcard"; m.alt = ""; m.src = cardSrc(id);
      const spread = (k - (groups[i].length - 1) / 2);
      const dx = spread * cw * 0.32, dy = -r.height * 0.45 - Math.abs(spread) * 4, rot = spread * 7, lag = k * Math.min(110, per / 14);
      m.style.cssText = `left:${cx}px;top:${cy}px;width:${cw}px;--dx:${dx}px;--dy:${dy}px;--r:${rot}deg;--d:${fan}ms;animation-delay:${lag}ms`;
      cardsBox.append(m);
      flights.push(sleep(fan + lag + k * 40).then(() => {
        m.remove();
        return landInRiver(id, { x: sr.left + cx + dx, y: sr.top + cy + dy - 10, w: cw }, { dur: hop, rot });
      }));
    });
    setTimeout(() => p.classList.add("done"), Math.min(per * 0.85, 1600));
    await sleep(per);
  }
  await Promise.all(flights);
  markSeen(ids); releaseRivers();
  cap.textContent = `✨ ${ids.length} card${ids.length === 1 ? "" : "s"} revealed!`;
  await sleep(2500);
  stage.hidden = true; stage.classList.remove("landing"); box.innerHTML = ""; cardsBox.innerHTML = ""; cap.textContent = "";
  $("pack").style.display = ""; $("featWrap").style.visibility = ""; document.querySelector(".feat-cap").style.visibility = "";
  packPlaying = false; holdUntil = 0;
  await pullToCentre(ids[0], false);
  updatePackCount();
  maybeOpenPack();
}

/* --- showcase --- */
export function fillTrack(el, ids) {
  el.innerHTML = "";
  if (!ids.length) return;
  let list = ids.slice(); while (list.length < 10) list = list.concat(ids); // enough to fill wide screens
  [...list, ...list].forEach(id => { const im = document.createElement("img"); im.src = cardSrc(id); im.alt = ""; im.loading = "lazy"; im.dataset.id = id; if (riverPending.has(id)) im.classList.add("pending"); el.append(im); });
  el.style.animationDuration = `${Math.max(40, list.length * 5)}s`;
}
export let trackSig = "", riverPending = new Set(), featBusy = false;
export const calmMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
/* the copy of a card in the rivers that is on screen and closest to x */
export function riverSlot(id, x) {
  const sel = `img[data-id="${CSS.escape(String(id))}"]`;
  const imgs = [...$("mqTop").querySelectorAll(sel), ...$("mqBot").querySelectorAll(sel)];
  let img = null, bd = Infinity;
  for (const im of imgs) {
    const r = im.getBoundingClientRect();
    if (!r.width || r.right < innerWidth * 0.07 || r.left > innerWidth * 0.93) continue;
    const d = Math.abs(r.left + r.width / 2 - x);
    if (d < bd) { bd = d; img = im; }
  }
  return { img, imgs };
}
/* fly a flat copy of a card from one spot to another along a gentle arc; resolves with the copy (caller removes it) */
export function flyCard(src, from, to, { dur = 1000, rot = 0, fade = false, lift = 0.22 } = {}) {
  const f = new Image(); f.src = src; f.className = "flyer"; f.alt = "";
  f.style.width = `${from.w}px`; f.style.left = `${from.x - from.w / 2}px`; f.style.top = `${from.y - (from.w * 1.4) / 2}px`;
  document.body.append(f);
  const dx = to.x - from.x, dy = to.y - from.y, sc = to.w / from.w;
  const arc = dy > 0 ? -Math.max(30, dy * lift) : Math.min(0, -dy * 0.06 - 10);  // downward: arc up first; upward: glide straight in
  const kf = [
    { transform: `rotate(${rot}deg)`, opacity: 1 },
    { transform: `translate(${dx * 0.4}px, ${dy * 0.4 + arc}px) rotate(${rot * 0.3}deg) scale(${((1 + sc) / 2) * 1.08})`, opacity: 1, offset: 0.45 },
    { transform: `translate(${dx}px, ${dy}px) scale(${sc})`, opacity: fade ? 0 : 1 }];
  return new Promise(res => {
    let done = false; const fin = () => { if (!done) { done = true; res(f); } };
    try { const a = f.animate(kf, { duration: dur, easing: "cubic-bezier(.5,0,.25,1)", fill: "forwards" }); a.onfinish = fin; } catch { fin(); }
    setTimeout(fin, dur + 300);
  });
}
/* send a card from the pack into its own slot in the top or bottom river */
export async function landInRiver(id, from, opts = {}) {
  const { img, imgs } = riverSlot(id, from.x);
  let to;
  if (img) { const r = img.getBoundingClientRect(); to = { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }; }
  else {                                            // its copies are off screen: glide into the right river and fade
    const row = (imgs[0] ? imgs[0].closest(".mq") : document.querySelector(".show .mq")).getBoundingClientRect();
    to = { x: innerWidth * (0.15 + Math.random() * 0.7), y: row.top + row.height / 2, w: row.height * 0.55 };
  }
  const f = await flyCard(cardSrc(id), from, to, { ...opts, fade: !img });
  riverPending.delete(id);
  imgs.forEach(im => im.classList.remove("pending"));
  if (img) { img.classList.remove("landed"); void img.offsetWidth; img.classList.add("landed"); }
  f.remove();
}
/* hold new cards back from the rivers until they land, and pause the rivers so the slots stay put */
export function prepareRivers(ids) {
  ids.forEach(id => { revealed.add(id); riverPending.add(id); });
  refreshShow(false);
  $("show").classList.add("hold-rivers");
}
export function releaseRivers() {
  riverPending.clear();
  document.querySelectorAll(".track img.pending").forEach(im => im.classList.remove("pending"));
  $("show").classList.remove("hold-rivers");
}
/* lift a card out of the river and bring it to the centre; the old centre card sinks away */
export async function pullToCentre(id, isNew) {
  const wrap = $("featWrap"), img = $("featImg");
  if (featBusy) return;
  const slot = calmMotion() || document.hidden || !img.getAttribute("src") || wrap.style.visibility === "hidden" ? null : riverSlot(id, innerWidth / 2).img;
  if (!slot) { feature(id, isNew); return; }
  featBusy = true;
  featIdx = Math.max(0, shownList().indexOf(id));
  const fr = img.getBoundingClientRect(), sr = slot.getBoundingClientRect();
  const target = { x: fr.left + fr.width / 2, y: fr.top + fr.height / 2, w: fr.height * (750 / 1050) };
  const fromTop = sr.top < fr.top;
  wrap.classList.remove("flip", "arrive");
  const out = wrap.animate([{ transform: "none", opacity: 1 },
    { transform: `translateY(${fromTop ? 14 : -14}vh) scale(.55) rotate(${fromTop ? 5 : -5}deg)`, opacity: 0 }],
    { duration: 650, easing: "cubic-bezier(.5,0,.75,0)", fill: "forwards" });
  slot.classList.add("out");
  const pre = new Image(); pre.src = cardSrc(id);
  await sleep(120);
  const f = await flyCard(cardSrc(id), { x: sr.left + sr.width / 2, y: sr.top + sr.height / 2, w: sr.width }, target, { dur: 1150, lift: 0.1 });
  img.src = cardSrc(id); setFeatured(id, isNew);
  try { await img.decode(); } catch {}
  out.cancel(); void wrap.offsetWidth; wrap.classList.add("arrive");
  if (isNew) holdUntil = Date.now() + 9000;
  f.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, fill: "forwards" });
  setTimeout(() => f.remove(), 300);
  setTimeout(() => slot.classList.remove("out"), 450);
  setTimeout(() => wrap.classList.remove("arrive"), 1000);
  featBusy = false;
}
export const shownList = () => wallList.filter(id => revealed.has(id));
export function rebuildRivers() { trackSig = ""; refreshShow(false); }
export function refreshShow(isNew, newId) {
  const ids = shownList();
  const sig = ids.join(",");
  if (sig !== trackSig) {
    trackSig = sig;
    const half = Math.ceil(ids.length / 2);
    fillTrack($("mqTop"), ids.length > 3 ? ids.slice(0, half) : ids);
    fillTrack($("mqBot"), ids.length > 3 ? ids.slice(half) : ids.slice().reverse());
  }
  if (!ids.length) return;
  if (isNew && newId) { feature(newId, true); return; }
  if (!$("featImg").getAttribute("src")) feature(ids[0], false);
}
export function feature(id, isNew) {
  const wrap = $("featWrap"), img = $("featImg");
  featIdx = Math.max(0, shownList().indexOf(id));
  wrap.classList.remove("flip"); void wrap.offsetWidth; wrap.classList.add("flip");
  img.src = cardSrc(id); setFeatured(id, isNew);
  if (isNew) holdUntil = Date.now() + 9000;
}
/* the centre card: its badge and like button */
function setFeatured(id, isNew) {
  featId = id;
  const badge = isNew ? "✨ New card!" : nextBadge; nextBadge = "";
  $("featBadge").textContent = badge; $("featBadge").hidden = !badge;
  paintLikeBtn();
}
function paintLikeBtn() {
  const b = $("likeBtn"); b.hidden = !likesOn() || !featId;
  if (b.hidden) return;
  const on = isLiked(featId);
  b.setAttribute("aria-pressed", String(on));
  b.setAttribute("aria-label", `${on ? "Unlike" : "Like"} this card. ${likeCount(featId)} likes`);
  $("likeWord").textContent = on ? "Liked" : "Like"; $("likeN").textContent = likeCount(featId);
  // first time on a phone: point at the button once
  if (!isTV() && !ls.get(key("liketip")) && $("likeTip").hidden && !packPlaying) {
    $("likeTip").hidden = false; ls.set(key("liketip"), "1");
    setTimeout(() => { $("likeTip").hidden = true; }, 7000);
  }
}
function paintChip(f) {
  const id = f.dataset.id, chip = f.querySelector(".like-chip"); if (!chip) return;
  chip.hidden = !likesOn();
  chip.textContent = `${isLiked(id) ? "❤️" : "🤍"} ${likeCount(id)}`;
  chip.setAttribute("aria-pressed", String(isLiked(id)));
  chip.setAttribute("aria-label", `${isLiked(id) ? "Unlike" : "Like"} this card. ${likeCount(id)} likes`);
}
/** Grid order: newest first, or most liked first with medals for the top three. */
export function sortGrid() {
  const grid = $("wallGrid"), figs = [...grid.children];
  const top = likesOn() ? topLiked(wallList, 3) : [];
  figs.forEach(f => { const m = f.querySelector(".medal"), r = top.indexOf(f.dataset.id); if (m) { m.hidden = r < 0; m.textContent = ["🥇", "🥈", "🥉"][r] || ""; } paintChip(f); });
  const byLikes = gridSort === "likes" && likesOn();
  figs.sort((a, b) => (byLikes ? likeCount(b.dataset.id) - likeCount(a.dataset.id) : 0) || (a.dataset.id < b.dataset.id ? -1 : 1));
  figs.forEach(f => grid.append(f));
  $("sortBtn").hidden = !likesOn();
  $("sortBtn").innerHTML = gridSort === "likes" ? "🔥<span class=\"lbl\"> Most liked</span>" : "🕒<span class=\"lbl\"> Newest</span>";
  $("sortBtn").setAttribute("aria-label", gridSort === "likes" ? "Sorted by most liked. Switch to newest" : "Sorted by newest. Switch to most liked");
}
onLikes((id) => {
  paintLikeBtn(); updateWallCount();
  if (id) { const f = $("wallGrid").querySelector(`figure[data-id="${CSS.escape(id)}"]`); if (f) paintChip(f); }
  if (!id || gridSort === "likes") sortGrid();
});
export function cycle() {
  const list = shownList();
  if (!list.length || packPlaying || Date.now() < holdUntil) return;
  const [best] = likesOn() ? topLiked(list, 1) : [];
  if (best && ++cycleCount % 5 === 0 && best !== featId) { nextBadge = `🏆 Most liked · ❤️ ${likeCount(best)}`; pullToCentre(best, false); return; }
  pullToCentre(list[(featIdx + 1) % list.length], false);
}
export function setWallMode(m) {
  wallMode = m; ls.set(key("wallmode"), m);
  if (m !== "show") setTimeout(maybeOpenPack, 0);
  $("wall").classList.toggle("show-mode", m === "show");
  $("modeShow").setAttribute("aria-pressed", String(m === "show"));
  $("modeGrid").setAttribute("aria-pressed", String(m === "grid"));
}
export function makeSparks() {
  const box = $("sparks"); if (box.childElementCount) return;
  const R = rng(99);
  for (let i = 0; i < 46; i++) {
    const s = document.createElement("span");
    s.style.left = `${R() * 100}%`; s.style.animationDuration = `${9 + R() * 12}s`; s.style.animationDelay = `${-R() * 20}s`;
    const z = 2 + R() * 5; s.style.width = s.style.height = `${z}px`; s.style.opacity = String(0.35 + R() * 0.5);
    box.append(s);
  }
}
export let wakeLock = null, idleTimer = 0;
export async function keepAwake() { try { if (!wakeLock && navigator.wakeLock) { wakeLock = await navigator.wakeLock.request("screen"); wakeLock.addEventListener("release", () => { wakeLock = null; }); } } catch {} }
document.addEventListener("visibilitychange", () => { if (!document.hidden && !$("wall").hidden) keepAwake(); });
export function wallActive() { $("wall").classList.remove("idle"); clearTimeout(idleTimer); if (matchMedia("(pointer: fine)").matches) idleTimer = setTimeout(() => $("wall").classList.add("idle"), 3000); }
["mousemove", "pointerdown", "keydown", "touchstart"].forEach(ev => addEventListener(ev, () => { if (!$("wall").hidden) wallActive(); }, { passive: true }));
export function makeWallQr() {
  // only the big screen needs a QR: a wide screen driven by a mouse (TV/laptop), or forced with ?tv
  if (!isTV()) { $("wallQr").hidden = true; return; }
  const base = `${location.origin}${location.pathname}`;
  const url = getPass() && !DEMO ? `${base}?code=${encodeURIComponent(getPass())}` : base;
  try { const q = qrcode(0, "M"); q.addData(url); q.make(); $("qrImg").src = q.createDataURL(8, 2); $("wallQr").hidden = false; } catch { $("wallQr").hidden = true; }
}
/* Organiser tools: download every card as a ZIP, or print them 9 to a page */
export async function downloadAllCards() {
  const ids = wallList.slice().reverse(), btn = $("dlAllBtn");
  if (!ids.length) { toast("No cards on the wall yet"); return; }
  if (typeof JSZip === "undefined") { toast("Download isn't available. Check the connection and reload."); return; }
  btn.disabled = true;
  const zip = new JSZip();
  let done = 0, failed = 0;
  for (const id of ids) {
    btn.textContent = `Preparing ${done + failed + 1} / ${ids.length}…`;
    try { const r = await fetch(cardSrc(id)); if (!r.ok) throw 0; zip.file(`${EVENT.storage.filePrefix}-card-${String(done + 1).padStart(3, "0")}.jpg`, await r.blob()); done++; } catch { failed++; }
  }
  btn.textContent = "Zipping…";
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  download(url, `${EVENT.storage.filePrefix}-cards-${new Date().toISOString().slice(0, 10)}.zip`);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  btn.disabled = false; btn.textContent = "⬇ Download all";
  toast(failed ? `Downloaded ${done} cards (${failed} couldn't be fetched)` : `Downloaded all ${done} cards`);
}
export function printAllCards() {
  const ids = wallList.slice().reverse();
  if (!ids.length) { toast("No cards on the wall yet"); return; }
  setPage(`@page { size: ${$("paper").value === "A4" ? "A4" : "letter"}; margin: 0.25in; }`);
  const pages = [];
  for (let i = 0; i < ids.length; i += 9) pages.push(ids.slice(i, i + 9));
  $("print-root").innerHTML = pages.map(p => `<div class="p-page"><div class="p-sheet">${p.map(id => `<img src="${cardSrc(id)}">`).join("")}</div></div>`).join("");
  toast(`Preparing ${ids.length} cards on ${pages.length} page${pages.length === 1 ? "" : "s"}…`);
  doPrint();
}
export async function openWall() {
  { const org = !!getAdminKey() && !DEMO; $("dlAllBtn").hidden = !org; $("printAllBtn").hidden = !org; }
  keepAwake(); wallActive(); setTimeout(makeWallQr, 0);
  setTimeout(() => setWallBg(wallBg), 0);
  new Image().src = asset("card-back.webp");
  setTimeout(() => PACK_ORDER.forEach(k => getPackArt(k)), 1500);
  $("wall").hidden = false;
  setWallMode(wallMode); makeSparks();
  if (!(await ensureCode("Enter the event code to see the Card Wall."))) { location.hash = ""; return; }
  if (DEMO && !demoCards.size) { $("showCount").textContent = "Preparing sample cards…"; await makeDemoCards(24); }
  wallList = []; wallLoaded = false; trackSig = ""; revealed = new Set(); riverPending.clear(); featBusy = false; $("show").classList.remove("hold-rivers"); packQueue = []; packFirstAt = 0; packPlaying = false; $("packStage").hidden = true; $("featWrap").style.visibility = ""; $("wallGrid").innerHTML = ""; $("featImg").removeAttribute("src");
  await loadWall();
  clearInterval(wallTimer); wallTimer = setInterval(loadWall, DEMO ? 60000 : 20000);
  clearInterval(cycleTimer); cycleTimer = setInterval(cycle, 6000);
  if (DEMO) {
    // demo: open one pack of each series in turn, so every wrapper can be seen
    clearTimeout(demoTimer);
    let p = 0, k = 12;
    const demoPack = async () => {
      const cl = PACK_ORDER[p % PACK_ORDER.length];
      const saved = { card: JSON.parse(JSON.stringify(card)), photo: { ...photo }, num: event.num };
      for (let j = 0; j < PACK_SIZE; j++) await makeDemoCard(k++, cl === EVERYONE ? null : cl);
      Object.assign(card, saved.card); Object.assign(photo, saved.photo); event.num = saved.num; fillForm(); render();
      p++;
      await loadWall();
      const waitDone = () => { if (packPlaying) demoTimer = setTimeout(waitDone, 500); else if (p < PACK_ORDER.length) demoTimer = setTimeout(demoPack, 1200); };
      demoTimer = setTimeout(waitDone, 1000);
    };
    demoTimer = setTimeout(demoPack, 14000); // after the booster-box opening
  }
}
export function closeWall() { cancelAnimationFrame(bgRaf); $("wall").hidden = true; clearInterval(wallTimer); clearInterval(cycleTimer); clearTimeout(demoTimer); }
$("postBtn").addEventListener("click", postToWall);
$("wallViewClose").addEventListener("click", () => { $("wallView").hidden = true; });
$("modeShow").addEventListener("click", () => setWallMode("show"));
$("dlAllBtn").addEventListener("click", downloadAllCards);
$("printAllBtn").addEventListener("click", printAllCards);
$("bgBtn").addEventListener("click", () => { const keys = Object.keys(WALL_BGS); setWallBg(keys[(keys.indexOf(wallBg) + 1) % keys.length]); });
$("modeGrid").addEventListener("click", () => setWallMode("grid"));
// staff phones: tap any card in the rows to bring it to the centre, then like it
["mqTop", "mqBot"].forEach(r => $(r).addEventListener("click", (e) => {
  const im = e.target.closest("img[data-id]");
  if (!im || packPlaying || im.classList.contains("pending")) return;
  holdUntil = Date.now() + 25000;               // keep it there while they decide
  pullToCentre(im.dataset.id, false);
}));
function likeFeatured(fromCard) {
  if (!featId || !likesOn()) return;
  holdUntil = Math.max(holdUntil, Date.now() + 12000);
  $("likeTip").hidden = true;
  if (fromCard && isLiked(featId)) { burst(); return; }      // double-tap only ever likes, never unlikes
  toggleLike(featId);
  if (isLiked(featId)) burst();
  const b = $("likeBtn"); b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop");
}
function burst() { const h = $("heartBurst"); h.classList.remove("go"); void h.offsetWidth; h.classList.add("go"); }
$("likeBtn").addEventListener("click", () => likeFeatured(false));
$("likeTip").addEventListener("click", () => { $("likeTip").hidden = true; });
$("sortBtn").addEventListener("click", () => { gridSort = gridSort === "likes" ? "new" : "likes"; ls.set(key("wallsort"), gridSort); sortGrid(); });
$("fullBtn").addEventListener("click", () => { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.().catch(() => {}); } catch {} });
// centre card: double-tap likes it; a single tap opens it full size
let lastTap = 0, tapTimer = 0;
$("featImg").addEventListener("click", () => {
  const now = Date.now();
  if (likesOn() && now - lastTap < 320) { clearTimeout(tapTimer); lastTap = 0; likeFeatured(true); return; }
  lastTap = now;
  clearTimeout(tapTimer);
  tapTimer = setTimeout(() => { $("wallViewImg").src = $("featImg").src; $("wallView").hidden = false; }, likesOn() ? 330 : 0);
});
$("e-admin").value = getAdminKey();
$("e-admin").addEventListener("input", (e) => ls.set(key("admin"), e.target.value.trim()));
