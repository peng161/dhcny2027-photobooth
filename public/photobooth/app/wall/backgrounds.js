import { EVENT, key, txt } from "../config.js";
import { cv, cx } from "../booth/preview.js";
import { lantern, monkeyMark, xiangyun } from "../cards/kit.js";
import { GOLD } from "../cards/palettes.js";
import { ls } from "../core/session.js";
import { $, CF, CJK, metal, rng, rr } from "../core/util.js";
import { rebuildRivers } from "./wall.js";
/* --- animated wall backgrounds --- */
export const WALL_BGS = { ink: "Ink & Gold Mountains", goat: "Year of the Goat", koi: "Koi Pond", fireworks: "Fireworks Night", prosperity: "Prosperity Rain", lantern: "Lantern Night", neon: "Neon Grid", arena: "Holo Arena", classic: "Red Sunburst" };
export let wallBg = (new URLSearchParams(location.search).get("bg")) || ls.get(key("wallbg")) || EVENT.wall.defaultBackground;
if (!WALL_BGS[wallBg]) wallBg = EVENT.wall.defaultBackground;
export let bgRaf = 0, bgState = null;
export function setWallBg(k) {
  wallBg = k; ls.set(key("wallbg"), k);
  $("show").dataset.bg = k; $("bgBtn").innerHTML = `🎨<span class="lbl"> ${WALL_BGS[k]}</span>`; $("bgBtn").setAttribute("aria-label", `Background: ${WALL_BGS[k]}`);
  bgState = null; startBg();
}
export function startBg() {
  cancelAnimationFrame(bgRaf);
  const cv = $("bgCanvas");
  if (wallBg === "classic" || $("wall").hidden) { cv.hidden = true; return; }
  cv.hidden = false;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let last = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    drawBg(cv, dt, now / 1000);
    if (!still) bgRaf = requestAnimationFrame(loop);
  };
  bgRaf = requestAnimationFrame(loop);
}
export function sizeBg(cv) {
  const k = Math.min(1.5, devicePixelRatio || 1), w = innerWidth, h = innerHeight;
  if (cv.width !== Math.round(w * k) || cv.height !== Math.round(h * k)) { cv.width = Math.round(w * k); cv.height = Math.round(h * k); bgState = null; }
  return { k, w, h };
}
export function drawBg(cv, dt, t) {
  const { k, w, h } = sizeBg(cv), g = cv.getContext("2d");
  g.setTransform(k, 0, 0, k, 0, 0);
  if (wallBg === "lantern") bgLantern(g, w, h, dt, t);
  else if (wallBg === "ink") bgInk(g, w, h, dt, t);
  else if (wallBg === "arena") bgArena(g, w, h, dt, t);
  else if (wallBg === "goat") bgGoat(g, w, h, dt, t);
  else if (wallBg === "koi") bgKoi(g, w, h, dt, t);
  else if (wallBg === "fireworks") bgFireworks(g, w, h, dt, t);
  else if (wallBg === "prosperity") bgProsperity(g, w, h, dt, t);
  else if (wallBg === "neon") bgNeon(g, w, h, dt, t);
}
/* 1. Lantern Night: lanterns float upward at three depths */
export function bgLantern(g, w, h, dt, t) {
  if (!bgState) {
    const R = rng(3);
    bgState = { L: Array.from({ length: 46 }, () => ({ x: R() * w, y: R() * h * 1.2, z: 0.25 + R() * 0.75, ph: R() * 6.28 })), S: Array.from({ length: 70 }, () => ({ x: R() * w, y: R() * h, z: R(), ph: R() * 6.28 })) };
  }
  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#140a2a"); sky.addColorStop(0.55, "#3a0d22"); sky.addColorStop(1, "#6a1a1c");
  g.fillStyle = sky; g.fillRect(0, 0, w, h);
  const glow = g.createRadialGradient(w / 2, h * 1.05, 10, w / 2, h * 1.05, h * 0.9);
  glow.addColorStop(0, "rgba(255,150,60,.35)"); glow.addColorStop(1, "rgba(255,150,60,0)");
  g.fillStyle = glow; g.fillRect(0, 0, w, h);
  bgState.S.forEach(s => { const a = 0.2 + 0.5 * (0.5 + 0.5 * Math.sin(t * 1.5 + s.ph)) * s.z; g.fillStyle = `rgba(255,230,170,${a})`; g.fillRect(s.x, s.y * 0.6, 1.6, 1.6); });
  bgState.L.sort((a, b) => a.z - b.z).forEach(l => {
    l.y -= (8 + 30 * l.z) * dt; if (l.y < -60) { l.y = h + 60; l.x = Math.random() * w; }
    const x = l.x + Math.sin(t * 0.5 + l.ph) * 14 * l.z, y = l.y, s = 6 + 22 * l.z;
    const halo = g.createRadialGradient(x, y, 0, x, y, s * 3.2);
    halo.addColorStop(0, `rgba(255,140,60,${0.35 * l.z})`); halo.addColorStop(1, "rgba(255,140,60,0)");
    g.fillStyle = halo; g.beginPath(); g.arc(x, y, s * 3.2, 0, 7); g.fill();
    const body = g.createRadialGradient(x - s * 0.3, y - s * 0.3, s * 0.1, x, y, s * 1.1);
    body.addColorStop(0, `rgba(255,190,120,${0.5 + 0.5 * l.z})`); body.addColorStop(0.6, `rgba(220,40,40,${0.45 + 0.55 * l.z})`); body.addColorStop(1, `rgba(120,10,20,${0.4 + 0.6 * l.z})`);
    g.fillStyle = body; g.beginPath(); g.ellipse(x, y, s * 0.85, s, 0, 0, 7); g.fill();
    g.fillStyle = `rgba(245,200,76,${0.4 + 0.6 * l.z})`; g.fillRect(x - s * 0.4, y - s * 1.08, s * 0.8, s * 0.18); g.fillRect(x - s * 0.4, y + s * 0.92, s * 0.8, s * 0.16);
  });
}
/* 2. Ink & Gold Mountains: ink-wash ridges, drifting gold clouds, soft sun */
export function bgInk(g, w, h, dt, t) {
  if (!bgState) {
    const R = rng(8), ridges = [];
    for (let L = 0; L < 4; L++) {
      const pts = [], base = h * (0.5 + L * 0.12), amp = h * (0.16 - L * 0.025);
      for (let x = -20; x <= w + 20; x += 18) pts.push([x, base - amp * (0.5 + 0.5 * Math.sin(x / (120 + L * 40) + L * 2 + R())) - R() * amp * 0.25]);
      ridges.push(pts);
    }
    bgState = { ridges, clouds: Array.from({ length: 9 }, (_, i) => ({ x: R() * w, y: h * (0.25 + R() * 0.5), s: 26 + R() * 40, v: 6 + R() * 12, d: i % 2 ? 1 : -1 })), flakes: Array.from({ length: 50 }, () => ({ x: R() * w, y: R() * h, v: 6 + R() * 14, ph: R() * 6.28 })) };
  }
  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#2b0a12"); sky.addColorStop(0.6, "#4a1018"); sky.addColorStop(1, "#160608");
  g.fillStyle = sky; g.fillRect(0, 0, w, h);
  const sx = w * 0.72, sy = h * 0.3, sr = Math.min(w, h) * 0.12;
  const sun = g.createRadialGradient(sx, sy, sr * 0.2, sx, sy, sr * 3);
  sun.addColorStop(0, "rgba(255,214,120,.55)"); sun.addColorStop(0.35, "rgba(255,190,90,.18)"); sun.addColorStop(1, "rgba(255,190,90,0)");
  g.fillStyle = sun; g.beginPath(); g.arc(sx, sy, sr * 3, 0, 7); g.fill();
  g.fillStyle = "rgba(255,220,140,.75)"; g.beginPath(); g.arc(sx, sy, sr, 0, 7); g.fill();
  const tones = ["rgba(120,30,40,.55)", "rgba(80,18,28,.7)", "rgba(45,10,16,.85)", "rgba(20,6,9,.95)"];
  bgState.ridges.forEach((pts, L) => {
    g.beginPath(); g.moveTo(pts[0][0], h); pts.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(pts[pts.length - 1][0], h); g.closePath();
    const fill = g.createLinearGradient(0, h * 0.35, 0, h); fill.addColorStop(0, tones[L]); fill.addColorStop(1, "rgba(10,3,5,.95)");
    g.fillStyle = fill; g.fill();
    g.strokeStyle = `rgba(245,200,110,${0.28 - L * 0.05})`; g.lineWidth = 1.5; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
    // mist between layers
    const mist = g.createLinearGradient(0, pts[0][1] - 10, 0, pts[0][1] + h * 0.1);
    mist.addColorStop(0, "rgba(255,220,180,0)"); mist.addColorStop(0.5, "rgba(255,220,180,.06)"); mist.addColorStop(1, "rgba(255,220,180,0)");
    g.fillStyle = mist; g.fillRect(0, pts[0][1] - 10, w, h * 0.12);
  });
  g.save(); g.shadowColor = "rgba(255,200,90,.6)"; g.shadowBlur = 8;
  bgState.clouds.forEach(c => { c.x += c.v * c.d * dt; if (c.x > w + 120) c.x = -120; if (c.x < -120) c.x = w + 120; xiangyun(g, c.x, c.y, c.s, "rgba(245,200,76,.42)", 3); });
  g.restore();
  bgState.flakes.forEach(f => { f.y += f.v * dt; if (f.y > h) { f.y = -5; f.x = Math.random() * w; } g.fillStyle = "rgba(255,215,120,.55)"; g.fillRect(f.x + Math.sin(t + f.ph) * 6, f.y, 2, 2); });
}
/* 3. Holo Arena: perspective grid floor, rotating prismatic rays, floating card outlines */
export function bgArena(g, w, h, dt, t) {
  if (!bgState) { const R = rng(12); bgState = { cards: Array.from({ length: 16 }, () => ({ x: R() * w, y: R() * h, z: 0.3 + R() * 0.7, r: (R() - 0.5) * 0.6 })) }; }
  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#050a1e"); sky.addColorStop(0.6, "#0d1640"); sky.addColorStop(1, "#06081a");
  g.fillStyle = sky; g.fillRect(0, 0, w, h);
  // rotating rays
  const cx = w / 2, cy = h * 0.46;
  g.save(); g.translate(cx, cy); g.rotate(t * 0.05);
  for (let i = 0; i < 18; i++) {
    const a0 = (i / 18) * Math.PI * 2, hue = (i * 40 + t * 20) % 360;
    g.fillStyle = `hsla(${hue},90%,65%,.06)`; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, Math.max(w, h), a0, a0 + 0.12); g.closePath(); g.fill();
  }
  g.restore();
  const core = g.createRadialGradient(cx, cy, 0, cx, cy, h * 0.6); core.addColorStop(0, "rgba(140,200,255,.25)"); core.addColorStop(1, "rgba(140,200,255,0)");
  g.fillStyle = core; g.fillRect(0, 0, w, h);
  // grid floor
  const hy = h * 0.66;
  g.save(); g.beginPath(); g.rect(0, hy, w, h - hy); g.clip();
  const fl = g.createLinearGradient(0, hy, 0, h); fl.addColorStop(0, "rgba(10,20,60,.2)"); fl.addColorStop(1, "rgba(30,10,70,.8)");
  g.fillStyle = fl; g.fillRect(0, hy, w, h - hy);
  g.lineWidth = 1.2;
  for (let i = -20; i <= 20; i++) { g.strokeStyle = `rgba(90,200,255,${0.35 - Math.abs(i) * 0.012})`; g.beginPath(); g.moveTo(cx + i * 14, hy); g.lineTo(cx + i * w * 0.18, h); g.stroke(); }
  const off = (t * 0.35) % 1;
  for (let j = 0; j < 14; j++) { const p = (j + off) / 14, y = hy + (h - hy) * p * p; g.strokeStyle = `rgba(200,120,255,${0.15 + 0.4 * p})`; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.restore();
  g.strokeStyle = "rgba(140,220,255,.6)"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, hy); g.lineTo(w, hy); g.stroke();
  // floating card outlines
  bgState.cards.forEach(c => {
    c.y -= (6 + 16 * c.z) * dt; if (c.y < -80) { c.y = h + 80; c.x = Math.random() * w; }
    const ch = 40 + 50 * c.z, cw = ch * 0.714;
    g.save(); g.translate(c.x, c.y); g.rotate(c.r + Math.sin(t * 0.4 + c.x) * 0.1);
    g.strokeStyle = `rgba(160,220,255,${0.12 + 0.25 * c.z})`; g.lineWidth = 1.5; rr(g, -cw / 2, -ch / 2, cw, ch, 5); g.stroke();
    g.fillStyle = `rgba(160,220,255,${0.03 + 0.05 * c.z})`; g.fill();
    g.restore();
  });
}
/* 4. Year of the Goat: paper-cut goat and DH Monkey, lanterns, plum blossoms */
export function papercutGoat(g, x, y, s, facing) {
  g.save(); g.translate(x, y); g.scale(facing * s, s);
  const red = "#d8282c", gold = "#f5c84c";
  g.lineJoin = "round"; g.lineCap = "round";
  const body = () => {
    g.beginPath();
    g.moveTo(-0.95, -0.05);
    g.bezierCurveTo(-0.62, -0.42, 0.28, -0.44, 0.6, -0.3);            // back
    g.quadraticCurveTo(0.76, -0.55, 0.9, -0.76);                        // neck
    g.bezierCurveTo(1.05, -0.96, 1.36, -0.78, 1.44, -0.56);             // forehead to nose
    g.quadraticCurveTo(1.47, -0.45, 1.35, -0.43);                       // muzzle
    g.lineTo(1.2, -0.48); g.lineTo(1.17, -0.26); g.lineTo(1.09, -0.44); // chin + beard
    g.quadraticCurveTo(0.95, -0.34, 0.86, -0.1);                        // throat
    g.bezierCurveTo(0.82, 0.14, 0.62, 0.3, 0.52, 0.3);                  // chest
    g.lineTo(0.55, 0.84); g.lineTo(0.47, 0.93); g.lineTo(0.4, 0.92); g.lineTo(0.41, 0.34);   // front leg
    g.lineTo(0.27, 0.34); g.lineTo(0.2, 0.86); g.lineTo(0.12, 0.93); g.lineTo(0.06, 0.92); g.lineTo(0.12, 0.36); // front leg 2
    g.quadraticCurveTo(-0.2, 0.44, -0.46, 0.34);                        // belly
    g.lineTo(-0.44, 0.86); g.lineTo(-0.5, 0.93); g.lineTo(-0.57, 0.92); g.lineTo(-0.6, 0.32); // back leg
    g.lineTo(-0.72, 0.3); g.lineTo(-0.8, 0.86); g.lineTo(-0.87, 0.93); g.lineTo(-0.94, 0.92); g.lineTo(-0.88, 0.22); // back leg 2
    g.quadraticCurveTo(-1.02, 0.12, -0.95, -0.05);                      // rump
    g.closePath();
    g.moveTo(-0.93, -0.06); g.quadraticCurveTo(-1.14, -0.32, -1.02, -0.4); g.quadraticCurveTo(-0.96, -0.24, -0.86, -0.14); g.closePath(); // tail
    g.moveTo(1.0, -0.84); g.quadraticCurveTo(0.7, -1.3, 0.5, -0.92); g.quadraticCurveTo(0.74, -1.12, 0.93, -0.78); g.closePath();   // horn
    g.moveTo(0.94, -0.7); g.quadraticCurveTo(0.74, -0.74, 0.62, -0.6); g.quadraticCurveTo(0.8, -0.6, 0.94, -0.64); g.closePath();   // ear
  };
  body(); g.fillStyle = red; g.fill();
  g.strokeStyle = gold; g.lineWidth = 0.032; body(); g.stroke();
  // paper-cut details: wool scallops, flowers, horn rings
  g.strokeStyle = "rgba(255,226,150,.9)"; g.lineWidth = 0.024;
  g.beginPath(); for (let i = -0.7; i <= 0.45; i += 0.115) { g.moveTo(i - 0.06, -0.22); g.arc(i, -0.22, 0.06, Math.PI, 0); } g.stroke();
  g.beginPath(); for (let i = -0.38; i <= 0.38; i += 0.1) { g.moveTo(i - 0.05, 0.25); g.arc(i, 0.25, 0.05, 0, Math.PI); } g.stroke();
  [[-0.42, 0.03], [0.02, 0.04], [0.42, 0.0]].forEach(([cx, cy]) => {
    for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; g.beginPath(); g.ellipse(cx + Math.cos(a) * 0.065, cy + Math.sin(a) * 0.065, 0.045, 0.028, a, 0, Math.PI * 2); g.stroke(); }
    g.beginPath(); g.arc(cx, cy, 0.022, 0, Math.PI * 2); g.stroke();
  });
  g.beginPath(); [[0.86, -0.96], [0.72, -1.04], [0.6, -1.0]].forEach(([hx, hy]) => { g.moveTo(hx - 0.04, hy - 0.03); g.lineTo(hx + 0.04, hy + 0.03); }); g.stroke();
  g.fillStyle = "#2a0608"; g.beginPath(); g.ellipse(1.16, -0.7, 0.04, 0.03, -0.3, 0, Math.PI * 2); g.fill();
  g.restore();
}
export function papercutMonkey(g, x, y, s, facing) {
  g.save(); g.translate(x, y); g.scale(facing * s, s);
  const red = "#d8282c", gold = "#f5c84c";
  // sitting body, arms and curled tail
  const shape = () => {
    g.beginPath();
    g.ellipse(0, 0.62, 0.62, 0.55, 0, 0, Math.PI * 2);
    g.moveTo(0.55, 0.45); g.quadraticCurveTo(0.95, 0.55, 0.85, 0.95); g.lineTo(0.7, 0.95); g.quadraticCurveTo(0.75, 0.65, 0.45, 0.6);
    g.moveTo(-0.55, 0.85); g.quadraticCurveTo(-1.2, 1.0, -1.1, 0.45); g.quadraticCurveTo(-1.0, 0.2, -0.85, 0.35); g.quadraticCurveTo(-0.95, 0.75, -0.55, 0.7);
  };
  g.fillStyle = red; shape(); g.fill(); g.strokeStyle = gold; g.lineWidth = 0.035; shape(); g.stroke();
  g.strokeStyle = "rgba(255,225,150,.85)"; g.lineWidth = 0.025;
  g.beginPath(); g.arc(0, 0.62, 0.22, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(0, 0.62, 0.1, 0, Math.PI * 2); g.stroke();
  g.restore();
  g.save(); g.translate(x, y - s * 0.12); g.scale(facing, 1);
  monkeyMark(g, s * 0.42, red, "#6e0a10", "#f26a5a");
  g.beginPath(); g.arc(0, 0, s * 0.42, 0, Math.PI * 2); g.strokeStyle = gold; g.lineWidth = s * 0.03; g.stroke();
  g.restore();
}
export function papercutMedallion(g, x, y, r) {
  g.save(); g.translate(x, y);
  g.fillStyle = "rgba(255,210,150,.10)"; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
  g.strokeStyle = "rgba(245,200,76,.75)"; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 1.5; g.beginPath(); g.arc(0, 0, r * 0.92, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = "rgba(245,200,76,.35)";
  for (let i = 0; i < 16; i++) { g.save(); g.rotate((i / 16) * Math.PI * 2); g.beginPath(); g.ellipse(0, -r * 0.82, r * 0.06, r * 0.12, 0, 0, Math.PI * 2); g.stroke(); g.restore(); }
  g.restore();
}
/* 6. Koi Pond: koi glide under the water, ripples, lotus pads */
export const KOI_COLS = [{ body: "#ff7b2c", patch: "#fff4ea", fin: "rgba(255,150,80,.7)" }, { body: "#fbf6ef", patch: "#e2342a", fin: "rgba(255,255,255,.65)" }, { body: "#f5c84c", patch: "#fff1b0", fin: "rgba(245,200,76,.7)" }];
export function bgKoi(g, w, h, dt, t) {
  if (!bgState) {
    const R = rng(5);
    bgState = {
      koi: Array.from({ length: Math.max(6, Math.round((w * h) / 140000)) }, (_, i) => ({ x: R() * w, y: R() * h, a: R() * 6.28, v: 16 + R() * 20, s: 0.8 + R() * 0.7, turn: 0.25 + R() * 0.35, ph: R() * 6.28, c: i % 3 })),
      pads: Array.from({ length: Math.max(5, Math.round((w * h) / 110000)) }, () => ({ x: R() * w, y: R() * h, r: 26 + R() * 30, rot: R() * 6.28, flower: R() < 0.3 })),
      rip: [], next: 0,
    };
  }
  const S = bgState;
  const wg = g.createRadialGradient(w / 2, h * 0.45, 30, w / 2, h / 2, Math.max(w, h) * 0.8);
  wg.addColorStop(0, "#14595c"); wg.addColorStop(0.55, "#0a3639"); wg.addColorStop(1, "#031b1e");
  g.fillStyle = wg; g.fillRect(0, 0, w, h);
  // soft caustic light
  g.save(); g.globalCompositeOperation = "screen"; g.strokeStyle = "rgba(140,230,220,.05)"; g.lineWidth = 2;
  for (let i = 0; i < 14; i++) { g.beginPath(); for (let x = 0; x <= w; x += 30) { const y = (i / 14) * h + Math.sin(x / 90 + t * 0.6 + i) * 14; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  g.restore();
  // koi
  S.koi.forEach(k => {
    k.a += Math.sin(t * 0.35 + k.ph) * k.turn * dt; k.x += Math.cos(k.a) * k.v * dt; k.y += Math.sin(k.a) * k.v * dt;
    if (k.x < -80) k.x = w + 70; if (k.x > w + 80) k.x = -70; if (k.y < -80) k.y = h + 70; if (k.y > h + 80) k.y = -70;
    const C = KOI_COLS[k.c], L = 54 * k.s, Wd = 15 * k.s, wag = Math.sin(t * 5 + k.ph) * 0.35;
    g.save(); g.translate(k.x, k.y); g.rotate(k.a);
    g.save(); g.translate(6, 9); g.fillStyle = "rgba(0,0,0,.25)"; g.beginPath(); g.ellipse(0, 0, L * 0.5, Wd * 0.55, 0, 0, 6.28); g.fill(); g.restore();
    g.save(); g.translate(-L * 0.42, 0); g.rotate(wag); g.fillStyle = C.fin; g.beginPath(); g.moveTo(0, 0);
    g.quadraticCurveTo(-L * 0.25, -Wd * 1.1, -L * 0.45, -Wd * 0.8); g.quadraticCurveTo(-L * 0.3, 0, -L * 0.45, Wd * 0.8); g.quadraticCurveTo(-L * 0.25, Wd * 1.1, 0, 0); g.fill(); g.restore();
    g.fillStyle = C.fin; [-1, 1].forEach(sd => { g.save(); g.translate(L * 0.12, sd * Wd * 0.45); g.rotate(sd * (0.9 + wag * 0.5)); g.beginPath(); g.ellipse(0, sd * Wd * 0.3, Wd * 0.25, Wd * 0.55, 0, 0, 6.28); g.fill(); g.restore(); });
    g.save(); g.beginPath(); g.ellipse(0, 0, L * 0.5, Wd * 0.5, 0, 0, 6.28); g.fillStyle = C.body; g.fill(); g.clip();
    g.fillStyle = C.patch; [[L * 0.18, -Wd * 0.15, 0.32], [-L * 0.12, Wd * 0.2, 0.26], [L * 0.38, 0, 0.14]].forEach(([px, py, r]) => { g.beginPath(); g.ellipse(px, py, L * r, Wd * 0.42, 0.3, 0, 6.28); g.fill(); });
    const sh = g.createLinearGradient(0, -Wd / 2, 0, Wd / 2); sh.addColorStop(0, "rgba(255,255,255,.35)"); sh.addColorStop(0.5, "rgba(255,255,255,0)"); sh.addColorStop(1, "rgba(0,0,0,.2)");
    g.fillStyle = sh; g.fillRect(-L / 2, -Wd / 2, L, Wd); g.restore();
    g.restore();
  });
  // ripples
  if (t > S.next) { S.next = t + 0.5 + Math.random() * 0.9; S.rip.push({ x: Math.random() * w, y: Math.random() * h, r: 2, life: 1 }); }
  g.lineWidth = 1.5;
  S.rip = S.rip.filter(r => (r.life -= dt * 0.35) > 0);
  S.rip.forEach(r => { r.r += dt * 38; g.strokeStyle = `rgba(200,250,245,${r.life * 0.35})`; [1, 0.7].forEach(m => { g.beginPath(); g.ellipse(r.x, r.y, r.r * m, r.r * m * 0.6, 0, 0, 6.28); g.stroke(); }); });
  // lotus pads float on top
  S.pads.forEach((p, i) => {
    const bx = p.x + Math.sin(t * 0.3 + i) * 4, by = p.y + Math.cos(t * 0.25 + i) * 3;
    g.save(); g.translate(bx, by); g.rotate(p.rot + Math.sin(t * 0.2 + i) * 0.05);
    g.fillStyle = "rgba(0,0,0,.25)"; g.beginPath(); g.arc(4, 6, p.r, 0.2, 6.08); g.lineTo(4, 6); g.fill();
    const pg = g.createRadialGradient(-p.r * 0.3, -p.r * 0.3, 2, 0, 0, p.r); pg.addColorStop(0, "#5fae5a"); pg.addColorStop(1, "#24633a");
    g.fillStyle = pg; g.beginPath(); g.arc(0, 0, p.r, 0.2, 6.08); g.lineTo(0, 0); g.fill();
    g.strokeStyle = "rgba(200,240,170,.25)"; g.lineWidth = 1; g.beginPath(); for (let a = 0.6; a < 6; a += 0.7) { g.moveTo(0, 0); g.lineTo(Math.cos(a) * p.r * 0.9, Math.sin(a) * p.r * 0.9); } g.stroke();
    if (p.flower) {
      g.rotate(-p.rot); const fr = p.r * 0.45;
      for (let k = 0; k < 8; k++) { g.save(); g.rotate((k / 8) * 6.28 + t * 0.05); g.fillStyle = k % 2 ? "#f6a6c4" : "#ffd0e0"; g.beginPath(); g.ellipse(0, -fr * 0.6, fr * 0.32, fr * 0.7, 0, 0, 6.28); g.fill(); g.restore(); }
      g.fillStyle = "#ffd56a"; g.beginPath(); g.arc(0, 0, fr * 0.25, 0, 6.28); g.fill();
    }
    g.restore();
  });
}

/* 7. Fireworks Night: shells burst over a city skyline */
export const FW_COLS = ["#ffd36a", "#ff5a5a", "#ff7ad2", "#7fe0ff", "#a6ff7a", "#ffffff", "#ffa04d"];
export function bgFireworks(g, w, h, dt, t) {
  if (!bgState) {
    const R = rng(8), city = [];
    for (let x = -10; x < w + 10;) { const bw = 30 + R() * 70, bh = h * (0.06 + R() * 0.16); city.push({ x, w: bw, h: bh, lit: Array.from({ length: Math.floor((bw / 12) * (bh / 16)) }, () => R() < 0.35) }); x += bw + 2; }
    bgState = { stars: Array.from({ length: 140 }, () => ({ x: R() * w, y: R() * h * 0.75, z: R(), ph: R() * 6.28 })), city, shells: [], parts: [], next: 0 };
  }
  const S = bgState;
  const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, "#04051a"); sky.addColorStop(0.6, "#160a2e"); sky.addColorStop(1, "#3a1030");
  g.fillStyle = sky; g.fillRect(0, 0, w, h);
  S.stars.forEach(st => { g.fillStyle = `rgba(255,255,255,${0.25 + 0.5 * st.z * (0.6 + 0.4 * Math.sin(t * 2 + st.ph))})`; g.fillRect(st.x, st.y, 1 + st.z, 1 + st.z); });
  if (t > S.next) {
    S.next = t + 0.45 + Math.random() * 1.0;
    S.shells.push({ x: w * (0.08 + Math.random() * 0.84), y: h, vx: (Math.random() - 0.5) * 40, vy: -(h * (0.62 + Math.random() * 0.26)), col: FW_COLS[Math.floor(Math.random() * FW_COLS.length)], willow: Math.random() < 0.25 });
  }
  g.save(); g.globalCompositeOperation = "lighter";
  S.shells = S.shells.filter(sh => {
    sh.x += sh.vx * dt; sh.y += sh.vy * dt; sh.vy += h * 0.55 * dt;
    g.fillStyle = "rgba(255,230,180,.9)"; g.beginPath(); g.arc(sh.x, sh.y, 2.2, 0, 6.28); g.fill();
    g.fillStyle = "rgba(255,200,120,.25)"; g.fillRect(sh.x - 1, sh.y, 2, 18);
    if (sh.vy > -h * 0.05) {
      const n = sh.willow ? 70 : 90, sp = Math.min(w, h) * (sh.willow ? 0.18 : 0.26);
      for (let i = 0; i < n && S.parts.length < 1400; i++) { const a = (i / n) * 6.28 + Math.random() * 0.1, v = sp * (0.6 + Math.random() * 0.4); S.parts.push({ x: sh.x, y: sh.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: sh.willow ? 2.8 : 1.7, max: sh.willow ? 2.8 : 1.7, col: sh.willow ? "#ffcf6a" : sh.col, drag: sh.willow ? 0.96 : 0.975 }); }
      return false;
    }
    return true;
  });
  S.parts = S.parts.filter(p => {
    p.vx *= p.drag; p.vy = p.vy * p.drag + h * 0.12 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
    const a = Math.max(0, p.life / p.max);
    g.globalAlpha = a; g.fillStyle = p.col; g.beginPath(); g.arc(p.x, p.y, 1.5 + a * 2.2, 0, 6.28); g.fill();
    return p.life > 0;
  });
  g.restore();
  // skyline
  S.city.forEach(b => {
    g.fillStyle = "#07040f"; g.fillRect(b.x, h - b.h, b.w, b.h);
    let k = 0; g.fillStyle = "rgba(255,214,120,.55)";
    for (let y = h - b.h + 8; y < h - 8; y += 16) for (let x = b.x + 6; x < b.x + b.w - 8; x += 12) { if (b.lit[k++]) g.fillRect(x, y, 4, 6); }
  });
  const haze = g.createLinearGradient(0, h * 0.7, 0, h); haze.addColorStop(0, "rgba(120,40,90,0)"); haze.addColorStop(1, "rgba(120,40,90,.25)");
  g.fillStyle = haze; g.fillRect(0, h * 0.7, w, h * 0.3);
}

/* 8. Prosperity Rain: gold coins, ingots and red packets drift down over a red sunburst */
export function bgProsperity(g, w, h, dt, t) {
  if (!bgState) {
    const R = rng(12);
    bgState = { items: Array.from({ length: Math.max(26, Math.round(w / 26)) }, () => {
      const r = R();
      return { x: R() * w, y: R() * h, v: 30 + R() * 60, rot: R() * 6.28, vr: (R() - 0.5) * 1.6, flip: R() * 6.28, fs: 1 + R() * 2, kind: r < 0.62 ? "coin" : r < 0.85 ? "ingot" : "packet", s: 10 + R() * 12, sway: R() * 6.28 };
    }) };
  }
  const bg = g.createRadialGradient(w / 2, h * 0.45, 30, w / 2, h / 2, Math.max(w, h) * 0.8);
  bg.addColorStop(0, "#c3242f"); bg.addColorStop(0.5, "#7d0a12"); bg.addColorStop(1, "#2e0408");
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.save(); g.translate(w / 2, h * 0.45); g.rotate(t * 0.03); g.fillStyle = "rgba(255,210,120,.06)";
  for (let i = 0; i < 24; i++) { g.rotate(Math.PI / 12); g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.max(w, h), -40); g.lineTo(Math.max(w, h), 40); g.closePath(); g.fill(); }
  g.restore();
  g.strokeStyle = "rgba(245,200,76,.06)"; g.lineWidth = 1.5;
  for (let y = 0; y < h + 60; y += 60) for (let x = (y / 60) % 2 ? 30 : 0; x < w + 60; x += 60) { g.beginPath(); g.arc(x, y, 30, 0, 6.28); g.stroke(); }
  bgState.items.forEach(it => {
    it.y += it.v * dt; it.rot += it.vr * dt; it.flip += it.fs * dt;
    if (it.y > h + 40) { it.y = -40; it.x = Math.random() * w; }
    const x = it.x + Math.sin(t * 0.8 + it.sway) * 16, s = it.s;
    g.save(); g.translate(x, it.y); g.rotate(it.rot);
    g.shadowColor = "rgba(0,0,0,.35)"; g.shadowBlur = 6; g.shadowOffsetY = 3;
    if (it.kind === "coin") {
      g.scale(Math.max(0.15, Math.abs(Math.cos(it.flip))), 1);
      g.beginPath(); g.arc(0, 0, s, 0, 6.28); g.fillStyle = metal(g, -s, -s, s, s, GOLD); g.fill(); g.shadowColor = "transparent";
      g.strokeStyle = "rgba(120,80,10,.7)"; g.lineWidth = 1.5; g.beginPath(); g.arc(0, 0, s * 0.78, 0, 6.28); g.stroke();
      g.fillStyle = "#7a0a10"; g.fillRect(-s * 0.26, -s * 0.26, s * 0.52, s * 0.52);
    } else if (it.kind === "ingot") {
      const k = s * 1.3;
      g.beginPath(); g.moveTo(-k, -k * 0.15); g.quadraticCurveTo(-k * 1.05, -k * 0.6, -k * 0.6, -k * 0.35); g.quadraticCurveTo(0, -k * 0.95, k * 0.6, -k * 0.35); g.quadraticCurveTo(k * 1.05, -k * 0.6, k, -k * 0.15);
      g.quadraticCurveTo(k * 0.8, k * 0.55, 0, k * 0.55); g.quadraticCurveTo(-k * 0.8, k * 0.55, -k, -k * 0.15); g.closePath();
      g.fillStyle = metal(g, -k, -k, k, k, GOLD); g.fill(); g.shadowColor = "transparent";
      g.beginPath(); g.ellipse(0, -k * 0.35, k * 0.35, k * 0.3, 0, 0, 6.28); g.fillStyle = metal(g, -k * 0.3, -k * 0.6, k * 0.3, 0, ["#fff3c4", "#f5c84c", "#d9a93c"]); g.fill();
    } else {
      g.scale(Math.max(0.2, Math.abs(Math.cos(it.flip * 0.6))), 1);
      rr(g, -s * 0.75, -s, s * 1.5, s * 2, 3); g.fillStyle = "#d8262f"; g.fill(); g.shadowColor = "transparent";
      g.strokeStyle = "#f5c84c"; g.lineWidth = 1.2; g.stroke();
      g.beginPath(); g.arc(0, -s * 0.2, s * 0.32, 0, 6.28); g.fillStyle = "#f5c84c"; g.fill();
    }
    g.restore();
  });
}

/* 9. Neon Grid: retro digital horizon, striped sun, moving grid */
export function bgNeon(g, w, h, dt, t) {
  if (!bgState) { const R = rng(4); bgState = { stars: Array.from({ length: 110 }, () => ({ x: R() * w, y: R() * h * 0.5, z: R(), ph: R() * 6.28 })) }; }
  const hz = h * 0.58;
  const sky = g.createLinearGradient(0, 0, 0, hz); sky.addColorStop(0, "#07021a"); sky.addColorStop(0.7, "#2a0638"); sky.addColorStop(1, "#5a0f4a");
  g.fillStyle = sky; g.fillRect(0, 0, w, hz);
  bgState.stars.forEach(st => { g.fillStyle = `rgba(255,255,255,${0.2 + 0.5 * st.z * (0.6 + 0.4 * Math.sin(t * 1.5 + st.ph))})`; g.fillRect(st.x, st.y, 1 + st.z, 1 + st.z); });
  // striped sun
  const sr = Math.min(w, h) * 0.24, sx = w / 2, sy = hz - sr * 0.35;
  g.save(); g.beginPath(); g.rect(0, 0, w, hz); g.clip();
  g.shadowColor = "#ff3d8b"; g.shadowBlur = 60;
  const sg = g.createLinearGradient(0, sy - sr, 0, sy + sr); sg.addColorStop(0, "#ffe07a"); sg.addColorStop(0.55, "#ff7a4d"); sg.addColorStop(1, "#ff2d95");
  g.fillStyle = sg; g.beginPath(); g.arc(sx, sy, sr, 0, 6.28); g.fill(); g.shadowColor = "transparent";
  g.fillStyle = "#3a0840";
  for (let i = 0; i < 7; i++) { const yy = sy + sr * (0.05 + i * 0.14) + ((t * 6) % (sr * 0.14)), th = 2 + i * 1.6; g.fillRect(sx - sr, yy, sr * 2, th); }
  g.restore();
  // distant wireframe hills
  g.strokeStyle = "rgba(255,90,220,.5)"; g.lineWidth = 1.5; g.beginPath();
  for (let x = 0; x <= w; x += 12) { const y = hz - (Math.abs(Math.sin(x / 140)) * 40 + Math.abs(Math.sin(x / 57)) * 18); x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  // floor + grid
  const fl = g.createLinearGradient(0, hz, 0, h); fl.addColorStop(0, "#1a0330"); fl.addColorStop(1, "#05010d");
  g.fillStyle = fl; g.fillRect(0, hz, w, h - hz);
  g.save(); g.strokeStyle = "#ff3dd6"; g.shadowColor = "#ff3dd6"; g.shadowBlur = 8; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(0, hz); g.lineTo(w, hz); g.stroke();
  for (let i = -24; i <= 24; i++) { g.globalAlpha = 0.7; g.beginPath(); g.moveTo(sx + i * 20, hz); g.lineTo(sx + i * w * 0.16, h); g.stroke(); }
  const ph = (t * 0.6) % 1;
  for (let k = 0; k < 14; k++) { const z = (k + ph) / 14, y = hz + (h - hz) * z * z; g.globalAlpha = 0.25 + z * 0.7; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.restore();
  const glow = g.createLinearGradient(0, hz - 40, 0, hz + 60); glow.addColorStop(0, "rgba(255,61,214,0)"); glow.addColorStop(0.5, "rgba(255,61,214,.18)"); glow.addColorStop(1, "rgba(255,61,214,0)");
  g.fillStyle = glow; g.fillRect(0, hz - 40, w, 100);
}

export function goatZones(w, h) {
  const box = (el) => { if (!el || el.hidden) return null; const r = el.getBoundingClientRect(); return r.width && r.height ? r : null; };
  const tr = box(document.querySelector("#show .mq")), br = box(document.querySelector("#show .mq-bot")), qr = box($("wallQr"));
  const featEl = document.querySelector("#show .feat"), fw = featEl ? featEl.offsetWidth : 0;
  const y0 = tr ? tr.bottom + 6 : h * 0.2, y1 = br ? br.top - 6 : h * 0.8;
  const cw = fw || Math.min(h * 0.5, w * 1.18) * 0.714;
  const cl = w / 2 - cw / 2 - 28, cr = w / 2 + cw / 2 + 28;
  let ry1 = y1, rx1 = w - 12;
  if (qr && qr.top < y1 && qr.bottom > y0) { if (qr.top - y0 > (y1 - y0) * 0.55) ry1 = qr.top - 10; else rx1 = qr.left - 10; }
  const fcEl = document.querySelector(".feat-cap"), fc = box(fcEl), fcw = fcEl ? fcEl.offsetWidth : 0;
  const under = fc ? { y0: fc.top, y1: fc.top + fcEl.offsetHeight, capL: w / 2 - Math.max(60, fcw / 2) - 8, capR: w / 2 + Math.max(60, fcw / 2) + 8 } : { y0: 0, y1: 0, capL: 0, capR: 0 };
  return { left: { x0: 12, x1: cl, y0, y1 }, right: { x0: cr, x1: rx1, y0, y1: ry1 }, under };
}
export function bgGoat(g, w, h, dt, t) {
  if (!bgState) {
    const R = rng(27);
    bgState = { petals: Array.from({ length: 40 }, () => ({ x: R() * w, y: R() * h, v: 12 + R() * 22, r: R() * 6.28, sz: 3 + R() * 4, ph: R() * 6.28 })) };
  }
  const bg = g.createRadialGradient(w / 2, h * 0.45, 40, w / 2, h * 0.5, Math.max(w, h) * 0.8);
  bg.addColorStop(0, "#8e1620"); bg.addColorStop(0.55, "#5c0c14"); bg.addColorStop(1, "#2a0509");
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  // faint paper-cut lattice
  g.strokeStyle = "rgba(245,200,76,.06)"; g.lineWidth = 1;
  g.beginPath(); for (let x = -h; x < w; x += 46) { g.moveTo(x, 0); g.lineTo(x + h, h); g.moveTo(x + h, 0); g.lineTo(x, h); } g.stroke();
  // lanterns along the top
  const n = Math.max(4, Math.round(w / 260));
  for (let i = 0; i < n; i++) {
    const lx = (i + 0.5) * (w / n), sway = Math.sin(t * 0.9 + i) * 0.05;
    g.save(); g.translate(lx, 0); g.rotate(sway); lantern(g, 0, h * 0.11, Math.min(w, h) * 0.028); g.restore();
  }
  // the goat and the monkey sit in the open space beside the centre card, between the card rows
  if (!bgState.zones || t - bgState.zt > 0.5) { bgState.zones = goatZones(w, h); bgState.zt = t; }
  if (!bgState.zs) bgState.zs = JSON.parse(JSON.stringify(bgState.zones));
  const ease = Math.min(1, dt * 2.5);
  const glide = (a, b) => { for (const key in b) { if (typeof b[key] === "object") glide(a[key], b[key]); else a[key] += (b[key] - a[key]) * ease; } };
  glide(bgState.zs, bgState.zones);
  const Z = bgState.zs, bob = Math.sin(t * 1.4) * 4;
  const fit = (z) => Math.min((z.x1 - z.x0) / 3.0, (z.y1 - z.y0) / 3.45, h * 0.2);
  const sL = fit(Z.left), sR = fit(Z.right), s = Math.min(sL, sR);
  if (s >= 26) {
    const gx = (Z.left.x0 + Z.left.x1) / 2, gy = (Z.left.y0 + Z.left.y1) / 2 - s * 0.22;
    const mx = (Z.right.x0 + Z.right.x1) / 2, my = (Z.right.y0 + Z.right.y1) / 2 - s * 0.22;
    papercutMedallion(g, gx, gy, s * 1.4); papercutMedallion(g, mx, my, s * 1.4);
    papercutGoat(g, gx - s * 0.03, gy + s * 0.15 + bob, s * 0.95, 1);
    papercutMonkey(g, mx + s * 0.03, my - s * 0.25 - bob, s * 0.95, -1);
    g.fillStyle = "#f5c84c"; g.textAlign = "center"; g.font = `700 ${Math.round(s * 0.36)}px ${CJK}`;
    g.fillText(txt("goatBlessing"), gx, gy + s * 1.78);
    g.font = `800 ${Math.round(s * 0.2)}px ${CF}`; g.fillText(txt("goatCaption"), mx, my + s * 1.72);
    g.textAlign = "left";
  } else if (Z.under && Math.min((Z.under.y1 - Z.under.y0) / 3.0, (Z.under.capL - 10) / 3.0) >= 14) {
    // phones: the goat and monkey flank the caption in the strip under the centre card
    const U = Z.under, ps = Math.min((U.y1 - U.y0) / 3.0, (U.capL - 10) / 3.0, 34), cy = (U.y0 + U.y1) / 2;
    const gx = (10 + U.capL) / 2, mx = (U.capR + w - 10) / 2, pb = Math.sin(t * 1.4) * 2;
    papercutMedallion(g, gx, cy, ps * 1.42); papercutMedallion(g, mx, cy, ps * 1.42);
    papercutGoat(g, gx - ps * 0.03, cy + ps * 0.15 + pb, ps * 0.95, 1);
    papercutMonkey(g, mx + ps * 0.03, cy - ps * 0.25 - pb, ps * 0.95, -1);
  } else {
    // no room at all: the pair becomes a large soft watermark that shows between the cards
    const ws = Math.min(w * 0.2, h * 0.11), cy = h * 0.5;
    g.save(); g.globalAlpha = 0.5;
    papercutMedallion(g, w * 0.27, cy - ws * 2.2, ws * 1.55); papercutMedallion(g, w * 0.73, cy + ws * 2.2, ws * 1.55);
    papercutGoat(g, w * 0.26, cy - ws * 2.05 + bob, ws * 0.95, 1);
    papercutMonkey(g, w * 0.74, cy + ws * 1.95 - bob, ws * 0.95, -1);
    g.restore();
  }
  // drifting plum-blossom petals
  bgState.petals.forEach(p => {
    p.y += p.v * dt; p.r += dt; if (p.y > h + 10) { p.y = -10; p.x = Math.random() * w; }
    const x = p.x + Math.sin(t * 0.8 + p.ph) * 20;
    g.save(); g.translate(x, p.y); g.rotate(p.r); g.fillStyle = "rgba(255,170,190,.75)";
    for (let k = 0; k < 5; k++) { g.rotate(Math.PI * 0.4); g.beginPath(); g.ellipse(0, -p.sz * 0.6, p.sz * 0.42, p.sz * 0.6, 0, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "#ffd56a"; g.beginPath(); g.arc(0, 0, p.sz * 0.22, 0, Math.PI * 2); g.fill();
    g.restore();
  });
}
addEventListener("resize", () => { bgState = null; });
{ // a big jump in screen width is a fold or unfold: replay a short re-form animation
  let lastW = innerWidth, t = 0;
  addEventListener("resize", () => {
    const w = innerWidth; if (!lastW || !w) { lastW = w; return; }
    const jump = Math.abs(w - lastW) / lastW > 0.3; lastW = w;
    if (!jump || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.body.classList.remove("unfold"); void document.body.offsetWidth; document.body.classList.add("unfold");
    clearTimeout(t); t = setTimeout(() => document.body.classList.remove("unfold"), 700);
    if (!$("wall").hidden) { rebuildRivers(); }   // rebuild the card rivers for the new width
  });
}
