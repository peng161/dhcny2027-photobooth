import { card, photo } from "../../booth/state.js";
import { FILTERS } from "../designs.js";
import { brushed, drawEscort, drawFooter, drawHeader, drawPhoto, drawPhotoImage, drawStats, energy, holo, lantern, plumBranch, textFx, twinkle } from "../kit.js";
import { PHOTO } from "../renderer.js";
import { EVERYONE, TYPES } from "../../config.js";
import { CF, H, NF, W, fitFont, metal, rgbaHex, rng, rr, wrap } from "../../core/util.js";
export function drawIllus(ctx, D) {
  const t = TYPES[card.type] || TYPES[EVERYONE], P = PHOTO;
  if (D.mosaic) marbleBorder(ctx, D.marble);
  else { rr(ctx, 0, 0, W, H, 34); ctx.fillStyle = metal(ctx, 0, 0, W, H, D.frame); ctx.fill(); brushed(ctx, false); }
  ctx.save(); rr(ctx, P.x, P.y, P.w, P.h, 16); ctx.clip();
  if (D.mosaic && photo.img) drawMosaic(ctx, P); else drawPhoto(ctx, P, t, 420);
  // dreamy grade: team-coloured light leak, warm glow, soft shading for text
  ctx.save(); ctx.globalCompositeOperation = "screen";
  let g = ctx.createRadialGradient(P.x + P.w * 0.85, P.y + 60, 0, P.x + P.w * 0.85, P.y + 60, 560);
  g.addColorStop(0, rgbaHex(D.leak || t.c2, 0.6)); g.addColorStop(1, rgbaHex(D.leak || t.c2, 0));
  ctx.fillStyle = g; ctx.fillRect(P.x, P.y, P.w, P.h);
  g = ctx.createRadialGradient(P.x + 40, P.y + P.h - 120, 0, P.x + 40, P.y + P.h - 120, 520);
  g.addColorStop(0, "rgba(255,190,120,.35)"); g.addColorStop(1, "rgba(255,190,120,0)");
  ctx.fillStyle = g; ctx.fillRect(P.x, P.y, P.w, P.h);
  // floating bokeh
  const R = rng(23);
  for (let i = 0; i < 26; i++) {
    const bx = P.x + R() * P.w, by = P.y + R() * P.h, br = 4 + R() * 16;
    const bg = ctx.createRadialGradient(bx, by, 0, bx, by, br);
    bg.addColorStop(0, `rgba(255,255,255,${0.25 + R() * 0.3})`); bg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  g = ctx.createLinearGradient(0, P.y, 0, P.y + 170); g.addColorStop(0, "rgba(0,0,0,.35)"); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fillRect(P.x, P.y, P.w, 170);
  g = ctx.createLinearGradient(0, 690, 0, H); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(0.5, "rgba(0,0,0,.4)"); g.addColorStop(1, "rgba(0,0,0,.7)");
  ctx.fillStyle = g; ctx.fillRect(P.x, 690, P.w, H - 690);
  if (D.orn === "cny") {
    lantern(ctx, P.x + 44, 250, 20); lantern(ctx, P.x + P.w - 44, 226, 16); lantern(ctx, P.x + P.w - 92, 300, 12);
    const R2 = rng(19); for (let i = 0; i < 12; i++) twinkle(ctx, P.x + 20 + R2() * (P.w - 40), 160 + R2() * 520, 2 + R2() * 4, "#ffd56a");
  }
  if (D.orn === "petals") plumBranch(ctx, P, D.petal || "#ffb3cf");
  if (card.holo) holo(ctx, P, 0.4);
  if (card.monkey !== "off") drawEscort(ctx, card.monkey === "left" ? 130 : W - 130, 600, 46);
  ctx.restore();
  rr(ctx, P.x, P.y, P.w, P.h, 16); ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.lineWidth = 1.5; ctx.stroke();

  drawHeader(ctx, true);

  // one move, straight on the photo
  const m = card.attacks[0] || {}, cost = Math.max(0, Math.min(4, +m.cost || 0)), my = 832;
  for (let c = 0; c < cost; c++) energy(ctx, card.type, 66 + c * 40, my - 12, 17);
  const nx = 52 + cost * 40 + (cost ? 18 : 0);
  ctx.textAlign = "right"; ctx.font = `800 56px ${NF}`;
  textFx(ctx, m.dmg || "", W - 54, my + 6, true, "#fff");
  const dw = m.dmg ? ctx.measureText(m.dmg).width + 24 : 0;
  ctx.textAlign = "left"; fitFont(ctx, m.name || "", 700, 34, CF, W - 54 - dw - nx, 16);
  textFx(ctx, m.name || "", nx, my, true, "#fff");
  if (m.text) {
    ctx.save(); ctx.font = `500 17px ${CF}`; ctx.fillStyle = "rgba(255,255,255,.95)"; ctx.shadowColor = "rgba(0,0,0,.8)"; ctx.shadowBlur = 5;
    wrap(ctx, m.text, W - 110).slice(0, 2).forEach((ln, k) => ctx.fillText(ln, 54, my + 34 + k * 21));
    ctx.restore();
  }

  // fine print: stats left, flavour right, footer
  ctx.save(); ctx.translate(40, 912); ctx.scale(0.72, 0.72); drawStats(ctx, 12, true, 0, 330 / 0.72); ctx.restore();
  if (card.flavor) {
    ctx.save(); ctx.font = `italic 500 12.5px ${CF}`; ctx.fillStyle = "rgba(255,255,255,.88)"; ctx.shadowColor = "rgba(0,0,0,.8)"; ctx.shadowBlur = 4;
    wrap(ctx, card.flavor, 300).slice(0, 3).forEach((ln, k) => ctx.fillText(ln, 400, 932 + k * 16));
    ctx.restore();
  }
  drawFooter(ctx, true, 44, W - 44, 1004);
}

/* ---------- Mosaic Art: photo rebuilt from tiles, marble swirl border ---------- */
export function marbleBorder(ctx, pal) {
  rr(ctx, 0, 0, W, H, 34);
  const g = ctx.createLinearGradient(0, 0, W, H);
  (pal || ["#f6c6ea", "#c9d8ff", "#bff3e6", "#fff1b8", "#f9c9c0", "#d9c8ff", "#f6c6ea"]).forEach((c, i, a) => g.addColorStop(i / (a.length - 1), c));
  ctx.fillStyle = g; ctx.fill();
  ctx.save(); rr(ctx, 0, 0, W, H, 34); ctx.clip();
  const R = rng(31), cols = ["rgba(255,255,255,.75)", "rgba(140,120,255,.4)", "rgba(255,120,200,.35)", "rgba(80,200,220,.35)", "rgba(255,210,120,.4)"];
  ctx.lineCap = "round";
  for (let i = 0; i < 70; i++) {
    const x = R() * W, y = R() * H;
    ctx.strokeStyle = cols[Math.floor(R() * cols.length)]; ctx.lineWidth = 2 + R() * 7;
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + (R() - 0.5) * 260, y + (R() - 0.5) * 260, x + (R() - 0.5) * 260, y + (R() - 0.5) * 260, x + (R() - 0.5) * 200, y + (R() - 0.5) * 200);
    ctx.stroke();
  }
  ctx.restore();
}
export function drawMosaic(ctx, P) {
  const k = ctx.getTransform().a || 1, cs = 15;
  // 1. the photo, placed the same way as other full-photo cards
  const off = document.createElement("canvas");
  off.width = Math.round(P.w * k); off.height = Math.round(P.h * k);
  const o = off.getContext("2d"); o.scale(k, k); o.translate(-P.x, -P.y);
  o.filter = FILTERS[card.filter] || "none"; drawPhotoImage(o, P); o.filter = "none";
  ctx.drawImage(off, P.x, P.y, P.w, P.h);
  // 2. average colour per tile
  const cols = Math.ceil(P.w / cs) + 1, rows = Math.ceil(P.h / cs) + 1;
  const small = document.createElement("canvas"); small.width = cols; small.height = rows;
  const sctx = small.getContext("2d"); sctx.drawImage(off, 0, 0, cols * cs * k, rows * cs * k, 0, 0, cols, rows);
  let data; try { data = sctx.getImageData(0, 0, cols, rows).data; } catch { return; }
  // 3. irregular tiles that share corners, so they fit like a real mosaic
  const R = rng(77), pts = [];
  for (let r = 0; r <= rows; r++) { pts[r] = []; for (let c = 0; c <= cols; c++) {
    const edge = r === 0 || c === 0 || r === rows || c === cols;
    pts[r][c] = [P.x + c * cs + (edge ? 0 : (R() - 0.5) * cs * 0.6), P.y + r * cs + (edge ? 0 : (R() - 0.5) * cs * 0.6)];
  } }
  ctx.save(); ctx.beginPath(); ctx.rect(P.x, P.y, P.w, P.h); ctx.clip();
  ctx.lineJoin = "round";
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const i = (r * cols + c) * 4, a = pts[r][c], b = pts[r][c + 1], d = pts[r + 1][c + 1], e = pts[r + 1][c];
    const lift = (R() - 0.5) * 18;
    const cr = Math.max(0, Math.min(255, data[i] + lift)), cg = Math.max(0, Math.min(255, data[i + 1] + lift)), cb = Math.max(0, Math.min(255, data[i + 2] + lift));
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(d[0], d[1]); ctx.lineTo(e[0], e[1]); ctx.closePath();
    ctx.fillStyle = `rgba(${cr},${cg},${cb},.72)`; ctx.fill();
    ctx.strokeStyle = "rgba(38,28,22,.55)"; ctx.lineWidth = 1.8; ctx.stroke();
  }
  // glassy sheen on the tiles
  ctx.globalCompositeOperation = "soft-light";
  const sh = ctx.createLinearGradient(P.x, P.y, P.x + P.w, P.y + P.h);
  sh.addColorStop(0, "rgba(255,255,255,.5)"); sh.addColorStop(0.5, "rgba(255,255,255,0)"); sh.addColorStop(1, "rgba(255,255,255,.35)");
  ctx.fillStyle = sh; ctx.fillRect(P.x, P.y, P.w, P.h);
  ctx.restore();
}
