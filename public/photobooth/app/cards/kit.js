import { cx } from "../booth/preview.js";
import { card, event, photo } from "../booth/state.js";
import { FILTERS, curDesign } from "./designs.js";
import { GOLD, SILVER } from "./palettes.js";
import { PHOTO } from "./renderer.js";
import { EVERYONE, TYPES, key, txt } from "../config.js";
import { CF, CJK, H, NF, W, fitFont, lighten, metal, rng, rr, shade, wrap } from "../core/util.js";
export function glyphPath(ctx, g, s) {
  ctx.beginPath();
  switch (g) {
    case "sparkle":
      ctx.moveTo(0, -s * 0.95);
      ctx.quadraticCurveTo(s * 0.12, -s * 0.12, s * 0.95, 0);
      ctx.quadraticCurveTo(s * 0.12, s * 0.12, 0, s * 0.95);
      ctx.quadraticCurveTo(-s * 0.12, s * 0.12, -s * 0.95, 0);
      ctx.quadraticCurveTo(-s * 0.12, -s * 0.12, 0, -s * 0.95);
      break;
    case "cube":
      ctx.moveTo(0, -s * 0.9); ctx.lineTo(s * 0.78, -s * 0.47); ctx.lineTo(0, -s * 0.04); ctx.lineTo(-s * 0.78, -s * 0.47); ctx.closePath();
      ctx.moveTo(-s * 0.82, -s * 0.33); ctx.lineTo(-s * 0.08, s * 0.1); ctx.lineTo(-s * 0.08, s * 0.95); ctx.lineTo(-s * 0.82, s * 0.52); ctx.closePath();
      ctx.moveTo(s * 0.82, -s * 0.33); ctx.lineTo(s * 0.82, s * 0.52); ctx.lineTo(s * 0.08, s * 0.95); ctx.lineTo(s * 0.08, s * 0.1); ctx.closePath();
      break;
    case "cloud":
      ctx.moveTo(-s * 0.1, s * 0.2); ctx.arc(-s * 0.45, s * 0.2, s * 0.35, 0, Math.PI * 2);
      ctx.moveTo(s * 0.55, -s * 0.1); ctx.arc(s * 0.05, -s * 0.1, s * 0.5, 0, Math.PI * 2);
      ctx.moveTo(s * 0.85, s * 0.2); ctx.arc(s * 0.5, s * 0.2, s * 0.35, 0, Math.PI * 2);
      ctx.rect(-s * 0.45, s * 0.1, s * 0.95, s * 0.45);
      break;
    case "code":
      ctx.moveTo(-s * 0.3, -s * 0.55); ctx.lineTo(-s * 0.92, 0); ctx.lineTo(-s * 0.3, s * 0.55); ctx.lineTo(-s * 0.16, s * 0.4); ctx.lineTo(-s * 0.62, 0); ctx.lineTo(-s * 0.16, -s * 0.4); ctx.closePath();
      ctx.moveTo(s * 0.3, -s * 0.55); ctx.lineTo(s * 0.16, -s * 0.4); ctx.lineTo(s * 0.62, 0); ctx.lineTo(s * 0.16, s * 0.4); ctx.lineTo(s * 0.3, s * 0.55); ctx.lineTo(s * 0.92, 0); ctx.closePath();
      ctx.moveTo(s * 0.08, -s * 0.75); ctx.lineTo(s * 0.24, -s * 0.75); ctx.lineTo(-s * 0.08, s * 0.75); ctx.lineTo(-s * 0.24, s * 0.75); ctx.closePath();
      break;
    case "cursor":
      ctx.moveTo(-s * 0.5, -s * 0.85); ctx.lineTo(s * 0.6, s * 0.12); ctx.lineTo(s * 0.08, s * 0.2); ctx.lineTo(s * 0.38, s * 0.72);
      ctx.lineTo(s * 0.16, s * 0.84); ctx.lineTo(-s * 0.12, s * 0.32); ctx.lineTo(-s * 0.5, s * 0.66); ctx.closePath();
      break;
    case "coin":
      ctx.arc(0, 0, s * 0.85, 0, Math.PI * 2);
      ctx.moveTo(s * 0.28, -s * 0.28); ctx.lineTo(-s * 0.28, -s * 0.28); ctx.lineTo(-s * 0.28, s * 0.28); ctx.lineTo(s * 0.28, s * 0.28); ctx.closePath();
      break;
    default: // star
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2, rad = i % 2 ? s * 0.4 : s * 0.9;
        i ? ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad) : ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
      }
      ctx.closePath();
  }
}
export const fillRule = (g) => (g === "coin") ? "evenodd" : "nonzero";

/* Glossy 3D energy orb */
export function energy(ctx, typeKey, cx, cy, r) {
  const t = TYPES[typeKey] || TYPES.normal;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.shadowColor = "rgba(0,0,0,.4)"; ctx.shadowBlur = r * 0.4; ctx.shadowOffsetY = r * 0.12;
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.45, r * 0.05, 0, 0, r * 1.05);
  g.addColorStop(0, lighten(t.sym, 0.6)); g.addColorStop(0.5, t.sym); g.addColorStop(1, shade(t.sym, 0.45));
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = g; ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.lineWidth = Math.max(1, r * 0.08); ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.stroke();
  if (t.glyph === "monkey") {
    monkeyMark(ctx, r * 0.42, "#ffffff", "rgba(0,0,0,.4)", "#ffffff");
  } else {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.4)"; ctx.shadowBlur = r * 0.15; ctx.shadowOffsetY = r * 0.05;
    glyphPath(ctx, t.glyph, r * 0.6);
    ctx.fillStyle = "#fff"; ctx.fill(fillRule(t.glyph));
    ctx.restore();
  }
  const sp = ctx.createRadialGradient(-r * 0.3, -r * 0.5, 0, -r * 0.3, -r * 0.5, r * 0.6);
  sp.addColorStop(0, "rgba(255,255,255,.8)"); sp.addColorStop(1, "rgba(255,255,255,0)");
  ctx.beginPath(); ctx.ellipse(-r * 0.25, -r * 0.45, r * 0.55, r * 0.3, -0.5, 0, Math.PI * 2);
  ctx.fillStyle = sp; ctx.fill();
  ctx.restore();
}

/* Ornaments */
export function twinkle(ctx, x, y, s, glow) {
  ctx.save(); ctx.translate(x, y); ctx.shadowColor = glow; ctx.shadowBlur = s * 2;
  ctx.fillStyle = "#fff"; glyphPath(ctx, "sparkle", s); ctx.fill(); ctx.restore();
}
export function xiangyun(ctx, x, y, s, color, lw) {
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = color; ctx.lineWidth = lw || s * 0.12; ctx.lineCap = "round";
  const spiral = (cx, cy, r, dir) => {
    ctx.beginPath();
    for (let t = 0; t <= 1.0001; t += 0.04) {
      const a = dir * t * Math.PI * 2.4 + Math.PI, rad = r * (1 - t * 0.8);
      const px = cx + Math.cos(a) * rad, py = cy + Math.sin(a) * rad;
      t ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
  };
  spiral(-s * 0.55, 0, s * 0.5, 1); spiral(s * 0.5, -s * 0.1, s * 0.6, -1); spiral(0, -s * 0.55, s * 0.38, 1);
  ctx.beginPath(); ctx.moveTo(-s * 1.05, s * 0.5); ctx.quadraticCurveTo(0, s * 0.75, s * 1.1, s * 0.45); ctx.stroke();
  ctx.restore();
}
export function lantern(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y);
  ctx.strokeStyle = "#f5c84c"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -s * 2); ctx.lineTo(0, -s * 0.8); ctx.stroke();
  ctx.shadowColor = "rgba(255,90,40,.8)"; ctx.shadowBlur = s * 0.9;
  const g = ctx.createRadialGradient(-s * 0.25, -s * 0.2, s * 0.1, 0, 0, s * 1.1);
  g.addColorStop(0, "#ff8a62"); g.addColorStop(0.6, "#d0161f"); g.addColorStop(1, "#7d0a10");
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.78, 0, 0, Math.PI * 2); ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(255,200,120,.5)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.5, s * 0.78, 0, 0, Math.PI * 2); ctx.moveTo(0, -s * 0.78); ctx.lineTo(0, s * 0.78); ctx.stroke();
  ctx.fillStyle = metal(ctx, -s * 0.45, 0, s * 0.45, 0, GOLD);
  ctx.fillRect(-s * 0.42, -s * 0.92, s * 0.84, s * 0.2); ctx.fillRect(-s * 0.42, s * 0.72, s * 0.84, s * 0.2);
  ctx.strokeStyle = "#c0141c"; ctx.lineWidth = 2; ctx.beginPath();
  for (let i = -2; i <= 2; i++) { ctx.moveTo(i * s * 0.08, s * 0.92); ctx.lineTo(i * s * 0.1, s * 1.6); }
  ctx.stroke();
  ctx.restore();
}
export function lightBurst(ctx, cx, cy, rad, n = 20) {
  ctx.save();
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
  g.addColorStop(0, "rgba(255,255,255,.8)"); g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g; ctx.beginPath();
  for (let i = 0; i < n; i++) { const a0 = (i / n) * Math.PI * 2, a1 = a0 + (Math.PI / n) * 0.55; ctx.moveTo(cx, cy); ctx.arc(cx, cy, rad, a0, a1); ctx.closePath(); }
  ctx.globalAlpha = 0.35; ctx.fill();
  ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.arc(cx, cy, rad * 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
/* Team background textures */
export function teamTexture(ctx, key, x, y, w, h, color, alpha) {
  const R = rng(key.length * 97 + 13);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineCap = "round"; ctx.lineJoin = "round";
  if (key === "ai") {
    const pts = Array.from({ length: 46 }, () => [x + R() * w, y + R() * h]);
    ctx.lineWidth = 1.6;
    pts.forEach((p) => {
      pts.map((q, j) => [j, (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2]).sort((a, b) => a[1] - b[1]).slice(1, 3)
        .forEach(([j]) => { ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(pts[j][0], pts[j][1]); ctx.stroke(); });
    });
    pts.forEach(p => { ctx.beginPath(); ctx.arc(p[0], p[1], 3 + R() * 5, 0, Math.PI * 2); ctx.fill(); });
  } else if (key === "ms") {
    const step = 64, cols = Math.ceil(w / step) + 2, rows = Math.ceil(h / step) + 2, g = [];
    for (let r = 0; r < rows; r++) { g[r] = []; for (let c = 0; c < cols; c++) g[r][c] = [x + (c - 0.5) * step + (R() - 0.5) * 22, y + (r - 0.5) * step + (R() - 0.5) * 22]; }
    ctx.lineWidth = 1.4; ctx.beginPath();
    for (let r = 0; r < rows - 1; r++) for (let c = 0; c < cols - 1; c++) {
      const a = g[r][c], b = g[r][c + 1], d = g[r + 1][c];
      ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(d[0], d[1]); ctx.closePath();
    }
    ctx.stroke();
  } else if (key === "cape") {
    for (let i = 0; i < 14; i++) {
      ctx.save(); ctx.translate(x + R() * w, y + R() * h); glyphPath(ctx, "cloud", 30 + R() * 70);
      ctx.globalAlpha = alpha * 0.5; ctx.fill(); ctx.globalAlpha = alpha; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    }
  } else if (key === "swe") {
    ctx.lineWidth = 2.2;
    const dirs = [[1, 0], [0, 1], [1, 1], [-1, 1]];
    for (let i = 0; i < 34; i++) {
      let px = x + Math.round(R() * w / 20) * 20, py = y + Math.round(R() * h / 20) * 20;
      ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(px, py);
      const segs = 2 + Math.floor(R() * 3);
      for (let s = 0; s < segs; s++) { const d = dirs[Math.floor(R() * 4)], len = 20 + Math.round(R() * 4) * 20; px += d[0] * len; py += d[1] * len; ctx.lineTo(px, py); }
      ctx.stroke(); ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.stroke();
    }
  } else if (key === "diux") {
    for (let gy = y; gy < y + h; gy += 22) for (let gx = x; gx < x + w; gx += 22) ctx.fillRect(gx, gy, 2, 2);
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const ax = x + R() * w, ay = y + R() * h, bx = x + R() * w, by = y + R() * h, c1x = x + R() * w, c1y = y + R() * h, c2x = x + R() * w, c2y = y + R() * h;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.bezierCurveTo(c1x, c1y, c2x, c2y, bx, by); ctx.stroke();
      ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(c1x, c1y); ctx.moveTo(bx, by); ctx.lineTo(c2x, c2y); ctx.stroke(); ctx.setLineDash([]);
      [[ax, ay], [bx, by]].forEach(([px, py]) => ctx.fillRect(px - 5, py - 5, 10, 10));
      [[c1x, c1y], [c2x, c2y]].forEach(([px, py]) => { ctx.beginPath(); ctx.arc(px, py, 4.5, 0, Math.PI * 2); ctx.fill(); });
    }
  } else {
    for (let i = 0; i < 22; i++) { ctx.save(); ctx.translate(x + R() * w, y + R() * h); glyphPath(ctx, "coin", 14 + R() * 18); ctx.fill("evenodd"); ctx.restore(); }
    for (let i = 0; i < 6; i++) xiangyun(ctx, x + R() * w, y + R() * h, 22 + R() * 20, color, 2.5);
  }
  ctx.restore();
}
/* Holo foil: rainbow sheen, light streaks and glowing sparkles */
export function holo(ctx, P, strength) {
  ctx.save(); ctx.beginPath(); ctx.rect(P.x, P.y, P.w, P.h); ctx.clip();
  ctx.globalCompositeOperation = "overlay"; ctx.globalAlpha = 0.35 * strength;
  const hg = ctx.createLinearGradient(P.x, P.y, P.x + P.w * 0.6, P.y + P.h);
  const hues = ["#ff6ec4", "#7873f5", "#4adede", "#a6ff7a", "#ffe66d", "#ff8a5c", "#ff6ec4", "#7873f5", "#4adede"];
  hues.forEach((c, i) => hg.addColorStop(i / (hues.length - 1), c));
  ctx.fillStyle = hg; ctx.fillRect(P.x, P.y, P.w, P.h);
  ctx.globalCompositeOperation = "soft-light"; ctx.globalAlpha = 0.45 * strength;
  ctx.save(); ctx.translate(P.x + P.w / 2, P.y + P.h / 2); ctx.rotate(-0.5); ctx.fillStyle = "#fff";
  for (let i = -7; i <= 7; i++) ctx.fillRect(i * 90 - 12, -P.h, 18 + Math.abs(i % 3) * 12, P.h * 2);
  ctx.restore();
  ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = 0.9 * strength;
  const R = rng(7);
  for (let i = 0; i < 40; i++) twinkle(ctx, P.x + R() * P.w, P.y + R() * P.h, 2 + R() * 6, "#fff");
  ctx.restore();
}

/* ---------- Card pieces ---------- */
export function clampPhoto(dw, dh) {
  const mx = Math.max(0, (dw - PHOTO.w) / 2), my = Math.max(0, (dh - PHOTO.h) / 2);
  photo.ox = Math.max(-mx, Math.min(mx, photo.ox));
  photo.oy = Math.max(-my, Math.min(my, photo.oy));
}
export function drawPhotoImage(ctx, P) {
  const iw = photo.img.naturalWidth || photo.img.width, ih = photo.img.naturalHeight || photo.img.height;
  const cover = Math.max(P.w / iw, P.h / ih);
  if (P.h > 900) {
    // Full-photo cards. Faces sit roughly 38% down a photo; place that point in the card's clear area.
    const focusY = P.focus || 390, k = ctx.getTransform().a || 1;
    const backdrop = () => { // plain team-colour background, never a second copy of the photo
      const sym = (TYPES[card.type] || TYPES[EVERYONE]).sym;
      const g = ctx.createLinearGradient(0, P.y, 0, P.y + P.h);
      g.addColorStop(0, shade(sym, 0.55)); g.addColorStop(0.5, shade(sym, 0.35)); g.addColorStop(1, shade(sym, 0.7));
      ctx.save(); ctx.filter = "none"; ctx.fillStyle = g; ctx.fillRect(P.x, P.y, P.w, P.h); ctx.restore();
    };
    if (iw / ih <= (P.w / P.h) * 1.3) {
      // tall photo: fill the whole card, no seams
      const sc = cover * photo.zoom, dw = iw * sc, dh = ih * sc;
      const bx = P.x + (P.w - dw) / 2, by = focusY - dh * 0.38;
      photo.ox = Math.max(P.x + P.w - dw - bx, Math.min(P.x - bx, photo.ox));
      photo.oy = Math.max(P.y + P.h - dh - by, Math.min(P.y - by, photo.oy));
      ctx.drawImage(photo.img, bx + photo.ox, by + photo.oy, dw, dh);
      return;
    }
    // wide/group photo: keep everyone in, fade top and bottom edges into the team colour
    backdrop();
    const fs = (P.w / iw) * photo.zoom, fw = iw * fs, fh = ih * fs;
    photo.ox = Math.max(-P.w, Math.min(P.w, photo.ox)); photo.oy = Math.max(-P.h, Math.min(P.h, photo.oy));
    const off = document.createElement("canvas");
    off.width = Math.max(1, Math.round(fw * k)); off.height = Math.max(1, Math.round(fh * k));
    const o = off.getContext("2d");
    o.drawImage(photo.img, 0, 0, off.width, off.height);
    o.globalCompositeOperation = "destination-in";
    const m = o.createLinearGradient(0, 0, 0, off.height);
    m.addColorStop(0, "rgba(0,0,0,0)"); m.addColorStop(0.14, "#000"); m.addColorStop(0.86, "#000"); m.addColorStop(1, "rgba(0,0,0,0)");
    o.fillStyle = m; o.fillRect(0, 0, off.width, off.height);
    ctx.drawImage(off, P.x + (P.w - fw) / 2 + photo.ox, focusY - fh / 2 + photo.oy, fw, fh);
    return;
  }
  const s = cover * photo.zoom, dw = iw * s, dh = ih * s;
  // until someone moves it, frame the upper part of the photo, where faces usually are
  if (!photo.userMoved) { photo.ox = 0; photo.oy = Math.max(0, (dh - P.h) / 2) * 0.45; }
  clampPhoto(dw, dh);
  ctx.drawImage(photo.img, P.x + (P.w - dw) / 2 + photo.ox, P.y + (P.h - dh) / 2 + photo.oy, dw, dh);
}
export function drawPhoto(ctx, P, t, textY) {
  if (photo.img) {
    ctx.filter = FILTERS[card.filter] || "none"; drawPhotoImage(ctx, P); ctx.filter = "none";
    return;
  }
  const pg = ctx.createLinearGradient(P.x, P.y, P.x + P.w, P.y + P.h);
  pg.addColorStop(0, t.c2); pg.addColorStop(1, shade(t.sym, 0.2));
  ctx.fillStyle = pg; ctx.fillRect(P.x, P.y, P.w, P.h);
  lightBurst(ctx, P.x + P.w / 2, textY - 40, Math.max(P.w, P.h) * 0.6);
  teamTexture(ctx, card.type, P.x, P.y, P.w, P.h, "#ffffff", 0.3);
  ctx.save(); ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.shadowColor = "rgba(0,0,0,.4)"; ctx.shadowBlur = 8;
  ctx.font = `800 32px ${CF}`; ctx.fillText("Your photo goes here", P.x + P.w / 2, textY); ctx.restore();
}
export function textFx(ctx, text, x, y, light, color) {
  if (light) {
    ctx.save(); ctx.lineJoin = "round"; ctx.lineWidth = 6; ctx.strokeStyle = "rgba(0,0,0,.55)";
    ctx.shadowColor = "rgba(0,0,0,.5)"; ctx.shadowBlur = 8; ctx.strokeText(text, x, y); ctx.restore();
  } else {
    ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.fillText(text, x, y + 1.5);
  }
  ctx.fillStyle = color; ctx.fillText(text, x, y);
}
export function drawHeader(ctx, light) {
  const ink = light ? "#fff" : "#16120e";
  ctx.font = `800 15px ${CF}`;
  const stg = card.stage || "", sw = ctx.measureText(stg).width + 26;
  rr(ctx, 44, 36, sw, 26, 13);
  ctx.fillStyle = metal(ctx, 44, 36, 44, 62, ["#ffffff", "#cfd4da", "#f4f6f8", "#9aa1aa"]); ctx.fill();
  ctx.lineWidth = 1.5; ctx.strokeStyle = "rgba(0,0,0,.45)"; ctx.stroke();
  ctx.fillStyle = "#1b1b1b"; ctx.textBaseline = "middle"; ctx.fillText(stg, 57, 50);
  if (card.evolves) {
    ctx.font = `italic 500 15px ${CF}`;
    ctx.save(); if (light) { ctx.shadowColor = "rgba(0,0,0,.7)"; ctx.shadowBlur = 4; }
    ctx.fillStyle = light ? "rgba(255,255,255,.92)" : "rgba(0,0,0,.65)";
    ctx.fillText("Evolves from " + card.evolves, 44 + sw + 10, 50); ctx.restore();
  }
  ctx.textBaseline = "alphabetic";
  drawBadge(ctx, W - 70, 80, 30);
  ctx.textAlign = "right";
  const hp = String(card.hp || "");
  ctx.font = `800 60px ${NF}`; const hpW = ctx.measureText(hp).width;
  textFx(ctx, hp, W - 106, 104, light, ink);
  ctx.font = `800 18px ${CF}`; textFx(ctx, "HP", W - 112 - hpW, 100, light, ink);
  ctx.textAlign = "left";
  const nm = card.name || "Your Name";
  fitFont(ctx, nm, 800, 48, CF, W - 48 - (hpW + 180), 22);
  textFx(ctx, nm, 44, 104, light, ink);
}
export const stripText = () => [`NO. ${String(event.num).padStart(3, "0")}`, card.species, card.height, card.weight].filter(Boolean).join("  ·  ");
export function drawMoves(ctx, top, bottom, light, x0, x1) {
  const ink = light ? "#fff" : "#16120e", sub = light ? "rgba(255,255,255,.92)" : "#2b251e";
  const moves = card.attack2 ? card.attacks : card.attacks.slice(0, 1), tw = x1 - x0;
  const blocks = [];
  if (card.ability && card.ability.name) {
    ctx.font = `500 18px ${CF}`;
    const lines = card.ability.text ? wrap(ctx, card.ability.text, tw).slice(0, 2) : [];
    blocks.push({ ab: card.ability, lines, h: 44 + lines.length * 23 });
  }
  moves.forEach(m => { ctx.font = `500 19px ${CF}`; const lines = m.text ? wrap(ctx, m.text, tw).slice(0, 3) : []; blocks.push({ m, lines, h: 48 + lines.length * 24 }); });
  const total = blocks.reduce((a, b) => a + b.h, 0) + (blocks.length - 1) * 16;
  let y = top + Math.max(0, (bottom - top - total) / 2);
  blocks.forEach((b, i) => {
    ctx.save(); if (light) { ctx.shadowColor = "rgba(0,0,0,.6)"; ctx.shadowBlur = 6; }
    if (b.ab) {
      // red ABILITY banner
      ctx.save(); ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
      ctx.beginPath(); ctx.moveTo(x0 + 10, y + 4); ctx.lineTo(x0 + 112, y + 4); ctx.lineTo(x0 + 102, y + 34); ctx.lineTo(x0, y + 34); ctx.closePath();
      const bg = ctx.createLinearGradient(0, y + 4, 0, y + 34); bg.addColorStop(0, "#e8343c"); bg.addColorStop(1, "#9c0f18");
      ctx.fillStyle = bg; ctx.fill(); ctx.restore();
      ctx.strokeStyle = metal(ctx, x0, y, x0 + 112, y, GOLD); ctx.lineWidth = 2; ctx.stroke();
      ctx.save(); ctx.shadowColor = "transparent"; ctx.fillStyle = "#ffe39a"; ctx.font = `italic 800 19px ${NF}`; ctx.letterSpacing = "1px";
      ctx.fillText("ABILITY", x0 + 18, y + 26); ctx.restore();
      fitFont(ctx, b.ab.name, 700, 30, CF, tw - 130, 16);
      ctx.fillStyle = light ? "#ffd56a" : "#b3121b"; ctx.fillText(b.ab.name, x0 + 126, y + 30);
      ctx.font = `500 18px ${CF}`; ctx.fillStyle = sub;
      b.lines.forEach((ln, k) => ctx.fillText(ln, x0, y + 62 + k * 23));
    } else {
      const { m, lines } = b, cost = Math.max(0, Math.min(4, +m.cost || 0));
      ctx.restore(); ctx.save();
      for (let c = 0; c < cost; c++) energy(ctx, card.type, x0 + 16 + c * 38, y + 20, 16);
      if (light) { ctx.shadowColor = "rgba(0,0,0,.6)"; ctx.shadowBlur = 6; }
      const nx = x0 + cost * 38 + (cost ? 14 : 0);
      ctx.fillStyle = ink; ctx.textAlign = "right"; ctx.font = `800 50px ${NF}`;
      ctx.fillText(m.dmg || "", x1, y + 38);
      const dw = m.dmg ? ctx.measureText(m.dmg).width + 20 : 0;
      ctx.textAlign = "left";
      fitFont(ctx, m.name || "", 700, 31, CF, x1 - dw - nx, 16);
      ctx.fillText(m.name || "", nx, y + 31);
      ctx.font = `500 19px ${CF}`; ctx.fillStyle = sub;
      lines.forEach((ln, k) => ctx.fillText(ln, x0, y + 64 + k * 24));
    }
    ctx.restore();
    y += b.h;
    if (i < blocks.length - 1) {
      const c = light ? "255,255,255" : "0,0,0", g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, `rgba(${c},0)`); g.addColorStop(0.5, `rgba(${c},.35)`); g.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = g; ctx.fillRect(x0, y + 7, tw, 2); y += 16;
    }
  });
}
export function drawStats(ctx, y, light, x0, x1) {
  const col = light ? "rgba(255,255,255,.8)" : "rgba(0,0,0,.62)", ink = light ? "#fff" : "#16120e", cw = (x1 - x0) / 3;
  const items = [["weakness", card.weakTxt, "×2"], ["resistance", card.resistTxt, "−30"], ["retreat", card.retreatTxt, ""]];
  items.forEach(([label, txt, tag], i) => {
    const cx = x0 + i * cw + 16, maxW = cw - 26;
    ctx.save(); if (light) { ctx.shadowColor = "rgba(0,0,0,.6)"; ctx.shadowBlur = 4; }
    ctx.font = `600 14px ${CF}`; ctx.fillStyle = col; ctx.fillText(label, cx, y);
    const val = (txt || "—") + (txt && tag ? "  " + tag : "");
    fitFont(ctx, val, 700, 18, CF, maxW, 10); ctx.fillStyle = ink; ctx.fillText(val, cx, y + 26);
    ctx.restore();
  });
}
export function rarityMark(ctx, x, y, color) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = color;
  if (card.rarity === "rare") { glyphPath(ctx, "star", 9); ctx.fill(); }
  else if (card.rarity === "uncommon") { ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(6, 0); ctx.lineTo(0, 6); ctx.lineTo(-6, 0); ctx.closePath(); ctx.fill(); }
  else { ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
export const numStr = () => `${String(event.num).padStart(3, "0")}/${String(event.total).padStart(3, "0")}`;
export function drawSeal(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4);
  ctx.shadowColor = "rgba(0,0,0,.4)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
  const g = ctx.createLinearGradient(-s, -s, s, s); g.addColorStop(0, "#ec3b42"); g.addColorStop(1, "#a50f17");
  ctx.fillStyle = g; ctx.fillRect(-s, -s, s * 2, s * 2);
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = metal(ctx, -s, -s, s, s, GOLD); ctx.lineWidth = 3; ctx.strokeRect(-s * 0.83, -s * 0.83, s * 1.66, s * 1.66);
  ctx.rotate(Math.PI); // 福 upside down: good fortune has arrived
  ctx.fillStyle = metal(ctx, -s, -s, s, s, GOLD); ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = `700 ${s * 1.25}px ${CJK}`; ctx.fillText("福", 0, s * 0.06);
  ctx.restore();
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
}
export function brushed(ctx, dark) {
  ctx.save(); rr(ctx, 0, 0, W, H, 34); ctx.clip();
  ctx.globalAlpha = 0.07; ctx.strokeStyle = dark ? "#fff" : "#000";
  for (let i = -H; i < W; i += 5) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke(); }
  ctx.restore();
}

/* ---------- Fortune Squad poster layout ---------- */
export const SF = '"Playfair Display", Georgia, "Times New Roman", serif';

/* ---------- DH Squad Holo: angular black-and-yellow frame, chrome border ---------- */
export const YEL = "#ffd31a", INKP = "rgba(10,12,18,.88)";
export function polyPath(ctx, pts) { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); }

/* ---------- Gold Hyper Rare + Crystal Tera finishes ---------- */
export function goldTone(ctx, P) {
  ctx.save(); ctx.beginPath(); ctx.rect(P.x, P.y, P.w, P.h); ctx.clip();
  const g = ctx.createLinearGradient(P.x, P.y, P.x + P.w, P.y + P.h);
  g.addColorStop(0, "#e8c25a"); g.addColorStop(0.5, "#c9952f"); g.addColorStop(1, "#f3d77a");
  ctx.globalCompositeOperation = "color"; ctx.globalAlpha = 0.88; ctx.fillStyle = g; ctx.fillRect(P.x, P.y, P.w, P.h);
  ctx.globalCompositeOperation = "overlay"; ctx.globalAlpha = 0.3; ctx.fillRect(P.x, P.y, P.w, P.h);
  // etched crosshatch
  ctx.globalCompositeOperation = "soft-light"; ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5; ctx.strokeStyle = "#fff7d6"; ctx.beginPath();
  for (let i = -P.h; i < P.w; i += 7) { ctx.moveTo(P.x + i, P.y); ctx.lineTo(P.x + i + P.h, P.y + P.h); }
  ctx.stroke();
  ctx.globalAlpha = 0.28; ctx.strokeStyle = "#5a3c08"; ctx.beginPath();
  for (let i = 0; i < P.w + P.h; i += 7) { ctx.moveTo(P.x + i, P.y); ctx.lineTo(P.x + i - P.h, P.y + P.h); }
  ctx.stroke();
  // gold light sweep
  ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = 1;
  const sh = ctx.createLinearGradient(P.x, P.y, P.x + P.w, P.y + P.h);
  sh.addColorStop(0, "rgba(255,240,190,0)"); sh.addColorStop(0.42, "rgba(255,240,190,0)"); sh.addColorStop(0.5, "rgba(255,245,210,.45)"); sh.addColorStop(0.58, "rgba(255,240,190,0)"); sh.addColorStop(1, "rgba(255,240,190,0)");
  ctx.fillStyle = sh; ctx.fillRect(P.x, P.y, P.w, P.h);
  ctx.restore();
}
export function crystalFacets(ctx, P) {
  const R = rng(61), cs = 110, cols = Math.ceil(P.w / cs) + 1, rows = Math.ceil(P.h / cs) + 1, pts = [];
  for (let r = 0; r <= rows; r++) { pts[r] = []; for (let c = 0; c <= cols; c++) {
    const edge = r === 0 || c === 0 || r === rows || c === cols;
    pts[r][c] = [P.x + c * cs + (edge ? 0 : (R() - 0.5) * cs * 0.7), P.y + r * cs + (edge ? 0 : (R() - 0.5) * cs * 0.7)];
  } }
  const cx = P.x + P.w / 2, cy = (P.focus || 400) + 30;
  ctx.save(); ctx.beginPath(); ctx.rect(P.x, P.y, P.w, P.h); ctx.clip();
  ctx.globalCompositeOperation = "screen"; ctx.lineJoin = "round";
  const tri = (a, b, d) => {
    const mx = (a[0] + b[0] + d[0]) / 3, my = (a[1] + b[1] + d[1]) / 3;
    const dist = ((mx - cx) / (P.w / 2)) ** 2 + ((my - cy) / (P.h * 0.4)) ** 2;
    if (dist < 0.6) return;
    const al = Math.min(1, dist - 0.6) * 0.55, hue = Math.floor(R() * 360);
    const g = ctx.createLinearGradient(a[0], a[1], d[0], d[1]);
    g.addColorStop(0, `rgba(255,255,255,${al})`); g.addColorStop(1, `hsla(${hue},90%,80%,${al * 0.7})`);
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(d[0], d[1]); ctx.closePath();
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = `rgba(255,255,255,${Math.min(0.8, al * 1.4)})`; ctx.lineWidth = 1.5; ctx.stroke();
  };
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const a = pts[r][c], b = pts[r][c + 1], d = pts[r + 1][c + 1], e = pts[r + 1][c];
    if ((r + c) % 2) { tri(a, b, d); tri(a, d, e); } else { tri(a, b, e); tri(b, d, e); }
  }
  ctx.globalAlpha = 0.18; ctx.fillStyle = "#fff";
  ctx.translate(P.x + P.w / 2, P.y + P.h / 2); ctx.rotate(-0.7);
  [-260, -120, 140, 300].forEach((x, i) => ctx.fillRect(x, -P.h, 10 + i * 4, P.h * 2));
  ctx.restore();
}
export function holoRing(ctx) {
  ctx.save();
  ctx.beginPath(); ctx.moveTo(34, 0); ctx.arcTo(W, 0, W, H, 34); ctx.arcTo(W, H, 0, H, 34); ctx.arcTo(0, H, 0, 0, 34); ctx.arcTo(0, 0, W, 0, 34); ctx.closePath();
  ctx.moveTo(40, 20); ctx.arcTo(20, 20, 20, H - 20, 20); ctx.arcTo(20, H - 20, W - 20, H - 20, 20); ctx.arcTo(W - 20, H - 20, W - 20, 20, 20); ctx.arcTo(W - 20, 20, 20, 20, 20); ctx.closePath();
  ctx.clip("evenodd");
  ctx.globalCompositeOperation = "overlay"; ctx.globalAlpha = 0.75;
  const hg = ctx.createLinearGradient(0, 0, W, H);
  ["#ff6ec4", "#7873f5", "#4adede", "#a6ff7a", "#ffe66d", "#ff8a5c", "#ff6ec4", "#4adede"].forEach((c, i, a) => hg.addColorStop(i / (a.length - 1), c));
  ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
/* Same footer on every card: event line bottom-left, number + rarity bottom-right */
export function drawFooter(ctx, light, x0, x1, y) {
  ctx.save();
  if (light) { ctx.shadowColor = "rgba(0,0,0,.7)"; ctx.shadowBlur = 4; }
  const col = light ? "rgba(255,255,255,.92)" : "rgba(0,0,0,.78)";
  ctx.fillStyle = col; ctx.textAlign = "right"; ctx.font = `700 13px ${CF}`;
  const ns = numStr(); ctx.fillText(ns, x1 - 18, y); const nw = ctx.measureText(ns).width;
  ctx.textAlign = "left"; fitFont(ctx, event.set || "", 600, 13, CF, x1 - x0 - nw - 40, 8);
  ctx.fillText(event.set || "", x0, y);
  ctx.restore(); ctx.textAlign = "left";
  rarityMark(ctx, x1 - 6, y - 5, light ? "#fff" : "#16120e");
}
/* DH Monkey as an embossed foil mark: monochrome relief, no cartoon features */
export function monkeyMark(ctx, h, base, shadow, light) {
  const shape = () => {
    ctx.beginPath();
    ctx.arc(-h * 0.98, h * 0.06, h * 0.36, 0, Math.PI * 2);
    ctx.moveTo(h * 1.34, h * 0.06); ctx.arc(h * 0.98, h * 0.06, h * 0.36, 0, Math.PI * 2);
    ctx.moveTo(h, 0); ctx.arc(0, 0, h, 0, Math.PI * 2);
  };
  ctx.save(); ctx.translate(-h * 0.05, -h * 0.05); shape(); ctx.fillStyle = light; ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(h * 0.06, h * 0.06); shape(); ctx.fillStyle = shadow; ctx.fill(); ctx.restore();
  shape(); ctx.fillStyle = base; ctx.fill();
  // raised face mask and inner ears
  ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = light;
  ctx.beginPath();
  ctx.arc(-h * 0.34, -h * 0.08, h * 0.42, 0, Math.PI * 2);
  ctx.moveTo(h * 0.76, -h * 0.08); ctx.arc(h * 0.34, -h * 0.08, h * 0.42, 0, Math.PI * 2);
  ctx.moveTo(h * 0.62, h * 0.38); ctx.ellipse(0, h * 0.38, h * 0.62, h * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.35;
  [-1, 1].forEach(s => { ctx.beginPath(); ctx.arc(s * h * 0.98, h * 0.08, h * 0.2, 0, Math.PI * 2); ctx.fill(); });
  ctx.restore();
  // features, engraved in the shadow tone
  ctx.fillStyle = shadow; ctx.strokeStyle = shadow; ctx.lineCap = "round";
  [-1, 1].forEach(s => { ctx.beginPath(); ctx.ellipse(s * h * 0.31, -h * 0.05, h * 0.08, h * 0.1, 0, 0, Math.PI * 2); ctx.fill(); });
  ctx.beginPath(); ctx.ellipse(0, h * 0.24, h * 0.09, h * 0.055, 0, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = h * 0.05; ctx.beginPath(); ctx.arc(0, h * 0.3, h * 0.2, Math.PI * 0.22, Math.PI * 0.78); ctx.stroke();
  ctx.lineWidth = h * 0.05; ctx.beginPath(); ctx.moveTo(-h * 0.14, -h * 0.9); ctx.quadraticCurveTo(0, -h * 1.12, h * 0.18, -h * 0.96); ctx.stroke();
}
export function drawMascotMark(ctx, x, y, r, tone) {
  const silver = tone === "silver";
  const pal = silver ? SILVER : GOLD;
  const T = silver ? { base: "#a3abb4", shadow: "#545c66", light: "#ffffff", f0: "#eef1f4", f1: "#a9b0b8" }
                   : { base: "#c9952f", shadow: "#6e4a10", light: "#fff1c2", f0: "#f6d987", f1: "#b8862a" };
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = metal(ctx, x - r, y - r, x + r, y + r, pal); ctx.fill();
  ctx.restore();
  // beaded rim
  ctx.fillStyle = T.shadow; ctx.globalAlpha = 0.45;
  for (let i = 0; i < 36; i++) { const a = (i / 36) * Math.PI * 2; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9, r * 0.025, 0, Math.PI * 2); ctx.fill(); }
  ctx.globalAlpha = 1;
  // recessed field
  ctx.beginPath(); ctx.arc(x, y, r * 0.8, 0, Math.PI * 2);
  const f = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r * 0.85); f.addColorStop(0, T.f0); f.addColorStop(1, T.f1);
  ctx.fillStyle = f; ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,.28)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, r * 0.8 + 1.5, Math.PI * 0.9, Math.PI * 1.6); ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.save(); ctx.translate(x, y - r * 0.08); monkeyMark(ctx, r * 0.36, T.base, T.shadow, T.light); ctx.restore();
  ctx.fillStyle = T.shadow; ctx.textAlign = "center"; ctx.font = `800 ${r * 0.19}px ${NF}`;
  ctx.fillText(txt("mascotMark"), x, y + r * 0.62); ctx.textAlign = "left";
}
export function drawEscort() { /* medallion now lives in the top-right corner */ }

/* Top-right badge, styled per design */
export function hexPath(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + (i * Math.PI) / 3; i ? ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
  ctx.closePath();
}
export function silhouette(ctx, x, y, h, col, line) {
  ctx.save(); ctx.translate(x, y); monkeyMark(ctx, h, col, line, col); ctx.restore();
}
export function drawBadge(ctx, x, y, r) {
  const D = curDesign(), kind = D.badge || "coin";
  const drop = () => { ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3; };
  ctx.save();
  if (kind === "hex" || kind === "hexgold") {
    const gold = kind === "hexgold";
    ctx.save(); drop(); hexPath(ctx, x, y, r); ctx.fillStyle = gold ? "#4a0a12" : "#111"; ctx.fill(); ctx.restore();
    hexPath(ctx, x, y, r); ctx.lineWidth = 4; ctx.strokeStyle = gold ? metal(ctx, x - r, y - r, x + r, y + r, GOLD) : YEL; ctx.stroke();
    hexPath(ctx, x, y, r * 0.78); ctx.lineWidth = 1.2; ctx.strokeStyle = gold ? "rgba(245,200,76,.5)" : "rgba(255,211,26,.5)"; ctx.stroke();
    silhouette(ctx, x, y + r * 0.04, r * 0.36, gold ? "#f5c84c" : "#ffffff", gold ? "#4a0a12" : "#111");
  } else if (kind === "glass") {
    ctx.save(); drop(); ctx.beginPath(); ctx.arc(x, y, r * 0.9, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,.18)"; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.arc(x, y, r * 0.9, 0, Math.PI * 2); ctx.lineWidth = 1.8; ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.stroke();
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 6; silhouette(ctx, x, y + r * 0.04, r * 0.34, "#ffffff", "rgba(0,0,0,.45)"); ctx.restore();
  } else if (kind === "lantern") {
    ctx.save(); ctx.shadowColor = "rgba(255,90,40,.8)"; ctx.shadowBlur = r * 0.8;
    const g = ctx.createRadialGradient(x - r * 0.25, y - r * 0.2, r * 0.1, x, y, r * 1.05);
    g.addColorStop(0, "#ff8a62"); g.addColorStop(0.6, "#d0161f"); g.addColorStop(1, "#7d0a10");
    ctx.beginPath(); ctx.ellipse(x, y, r * 0.95, r * 0.78, 0, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill(); ctx.restore();
    ctx.fillStyle = metal(ctx, x - r * 0.4, 0, x + r * 0.4, 0, GOLD);
    ctx.fillRect(x - r * 0.4, y - r * 0.92, r * 0.8, r * 0.18); ctx.fillRect(x - r * 0.4, y + r * 0.74, r * 0.8, r * 0.18);
    ctx.strokeStyle = "#f5c84c"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y - r * 0.92); ctx.lineTo(x, y - r * 1.4); ctx.stroke();
    ctx.strokeStyle = "#c0141c"; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let i = -2; i <= 2; i++) { ctx.moveTo(x + i * r * 0.07, y + r * 0.92); ctx.lineTo(x + i * r * 0.09, y + r * 1.35); }
    ctx.stroke();
    silhouette(ctx, x, y + r * 0.02, r * 0.3, "#f5c84c", "#7d0a10");
  } else if (kind === "lacquer") {
    ctx.save(); drop(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = metal(ctx, x - r, y - r, x + r, y + r, GOLD); ctx.fill(); ctx.restore();
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r * 0.85); g.addColorStop(0, "#e23b3f"); g.addColorStop(1, "#8a0d15");
    ctx.beginPath(); ctx.arc(x, y, r * 0.8, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
    silhouette(ctx, x, y + r * 0.04, r * 0.34, "#f5c84c", "#6e0a10");
  } else if (kind === "chop" || kind === "chopjade") {
    const jade = kind === "chopjade";
    ctx.translate(x, y); ctx.rotate(-0.08);
    ctx.save(); drop(); rr(ctx, -r, -r, r * 2, r * 2, r * 0.2);
    const g = ctx.createLinearGradient(-r, -r, r, r); g.addColorStop(0, jade ? "#2c9c78" : "#d6262f"); g.addColorStop(1, jade ? "#0f5a44" : "#8e0e16");
    ctx.fillStyle = g; ctx.fill(); ctx.restore();
    rr(ctx, -r * 0.82, -r * 0.82, r * 1.64, r * 1.64, r * 0.12); ctx.lineWidth = 2.5; ctx.strokeStyle = metal(ctx, -r, -r, r, r, GOLD); ctx.stroke();
    silhouette(ctx, 0, r * 0.04, r * 0.36, "#f5c84c", jade ? "#0a3d2e" : "#6e0a10");
  } else if (kind === "crystal") {
    ctx.save(); drop(); hexPath(ctx, x, y, r);
    const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r); g.addColorStop(0, "#f4f9ff"); g.addColorStop(0.5, "#a9c8f0"); g.addColorStop(1, "#d9c8ff");
    ctx.fillStyle = g; ctx.fill(); ctx.restore();
    ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 1.2; ctx.beginPath();
    for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + (i * Math.PI) / 3; ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
    ctx.stroke();
    hexPath(ctx, x, y, r); ctx.lineWidth = 2; ctx.strokeStyle = "rgba(120,150,200,.8)"; ctx.stroke();
    ctx.save(); ctx.shadowColor = "rgba(40,60,110,.6)"; ctx.shadowBlur = 5; silhouette(ctx, x, y + r * 0.04, r * 0.34, "#ffffff", "rgba(60,80,130,.8)"); ctx.restore();
  } else if (kind === "orb") {
    energy(ctx, card.type, x, y, r * 0.88);
  } else {
    drawMascotMark(ctx, x, y, r, "gold");
  }
  ctx.restore();
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
}
/* ---------- shared bits for the newer layouts ---------- */
export function hpText(ctx, x, y, size, color, light, align = "right") {
  const hp = String(card.hp || "");
  ctx.textAlign = align; ctx.font = `800 ${size}px ${NF}`; const hw = ctx.measureText(hp).width;
  textFx(ctx, hp, x, y, light, color);
  ctx.font = `800 ${Math.round(size * 0.34)}px ${CF}`;
  textFx(ctx, "HP", align === "right" ? x - hw - 6 : x + hw + 6, y - 3, light, color);
  ctx.textAlign = "left";
}
export function clusterLine(ctx, cx, y, color, maxW) {
  const t = TYPES[card.type] || TYPES[EVERYONE];
  fitFont(ctx, t.full, 700, 17, CF, maxW - 34, 11);
  const w = ctx.measureText(t.full).width + 30;
  energy(ctx, card.type, cx - w / 2 + 11, y - 6, 11);
  ctx.fillStyle = color; ctx.textAlign = "left"; ctx.fillText(t.full, cx - w / 2 + 28, y);
}
export function blossom(ctx, x, y, s, col, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = col;
  for (let k = 0; k < 5; k++) { ctx.rotate(Math.PI * 0.4); ctx.beginPath(); ctx.ellipse(0, -s * 0.55, s * 0.42, s * 0.56, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = "#ffd56a"; ctx.beginPath(); ctx.arc(0, 0, s * 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
export function plumBranch(ctx, P, col) {
  ctx.save(); ctx.strokeStyle = "rgba(58,30,24,.9)"; ctx.lineCap = "round"; ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 6;
  ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(P.x - 4, 168); ctx.quadraticCurveTo(150, 186, 262, 146); ctx.stroke();
  ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(150, 180); ctx.quadraticCurveTo(178, 228, 160, 276); ctx.stroke();
  ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(220, 160); ctx.quadraticCurveTo(250, 120, 300, 112); ctx.stroke();
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(P.x + P.w + 4, 560); ctx.quadraticCurveTo(W - 120, 540, W - 170, 470); ctx.stroke();
  ctx.restore();
  [[110, 176, 15, 0.2], [176, 214, 12, 1], [162, 270, 10, 2], [262, 146, 13, 0.6], [300, 112, 10, 1.4], [222, 168, 9, 2.2], [W - 112, 545, 14, 0.4], [W - 168, 474, 11, 1.8], [W - 140, 512, 8, 0.9]]
    .forEach(([x, y, s, r]) => blossom(ctx, x, y, s, col, r));
  const R = rng(73); ctx.save(); ctx.globalAlpha = 0.85;
  for (let i = 0; i < 14; i++) { ctx.fillStyle = col; ctx.save(); ctx.translate(P.x + 30 + R() * (P.w - 60), 200 + R() * 460); ctx.rotate(R() * 6); ctx.beginPath(); ctx.ellipse(0, 0, 4 + R() * 3, 2.5 + R() * 2, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  ctx.restore();
}
export function starShape(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rad = i % 2 ? r * 0.45 : r; i ? ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad) : ctx.moveTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); }
  ctx.closePath();
}
export function effectText() {
  const parts = [];
  if (card.ability && card.ability.name) parts.push(`${card.ability.name}: ${card.ability.text || ""}`);
  (card.attack2 ? card.attacks : card.attacks.slice(0, 1)).forEach(m => { if (m && m.name) parts.push(`${m.name}${m.dmg ? ` (${m.dmg})` : ""}: ${m.text || ""}`); });
  return parts;
}
export function foilEdge(ctx, inset, alpha) {
  ctx.save();
  ctx.beginPath(); rrPath(ctx, 0, 0, W, H, 34); rrPath(ctx, inset, inset, W - inset * 2, H - inset * 2, 22); ctx.clip("evenodd");
  ctx.globalCompositeOperation = "overlay"; ctx.globalAlpha = alpha;
  const hg = ctx.createLinearGradient(0, 0, W, H);
  ["#ff6ec4", "#7873f5", "#4adede", "#a6ff7a", "#ffe66d", "#ff8a5c", "#ff6ec4", "#4adede"].forEach((c, i, a) => hg.addColorStop(i / (a.length - 1), c));
  ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
export function rrPath(ctx, x, y, w, h, r) { ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
export const FOIL_TXT = ["#ffffff", "#ffe9a8", "#c8f0ff", "#ffd0f0", "#fff6c8", "#ffffff"];
