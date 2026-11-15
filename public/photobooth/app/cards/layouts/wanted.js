import { cx } from "../../booth/preview.js";
import { card } from "../../booth/state.js";
import { SF, brushed, drawBadge, drawFooter, drawMoves, drawPhoto, holo, polyPath } from "../kit.js";
import { GOLD } from "../palettes.js";
import { PHOTO } from "../renderer.js";
import { EVERYONE, TYPES, txt } from "../../config.js";
import { CF, H, NF, W, fitFont, metal, rgbaHex, rng, rr } from "../../core/util.js";
/* ---------- Wanted poster: aged parchment, bounty, "crimes" ---------- */
export function compassRose(ctx, x, y, r, col) {
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 8; i++) {
    ctx.save(); ctx.rotate((i * Math.PI) / 4); const L = i % 2 ? r * 0.6 : r * 1.05;
    ctx.beginPath(); ctx.moveTo(0, -L); ctx.lineTo(r * 0.1, 0); ctx.lineTo(0, r * 0.1); ctx.lineTo(-r * 0.1, 0); ctx.closePath(); i % 2 ? ctx.stroke() : ctx.fill(); ctx.restore();
  }
  ctx.font = `800 ${r * 0.28}px ${SF}`; ctx.textAlign = "center"; ctx.fillText("N", 0, -r * 1.12); ctx.restore(); ctx.textAlign = "left";
}
export function drawWanted(ctx, D) {
  const t = TYPES[card.type] || TYPES[EVERYONE], P = PHOTO, Q = D.wp, INK = Q.ink, SEA = Q.sea || ["#3c6070", "#1c3540", "#0b171d"];
  // gold card frame
  rr(ctx, 0, 0, W, H, 34); ctx.fillStyle = metal(ctx, 0, 0, W, H, GOLD); ctx.fill(); brushed(ctx, false);
  // old sea chart
  const ix = 20, iy = 20, iw = W - 40, ih = H - 40;
  ctx.save(); rr(ctx, ix, iy, iw, ih, 22); ctx.clip();
  const sg = ctx.createRadialGradient(W / 2, H * 0.45, 60, W / 2, H / 2, 760); sg.addColorStop(0, SEA[0]); sg.addColorStop(0.6, SEA[1]); sg.addColorStop(1, SEA[2]);
  ctx.fillStyle = sg; ctx.fillRect(ix, iy, iw, ih);
  ctx.strokeStyle = "rgba(255,240,200,.06)"; ctx.lineWidth = 1; ctx.beginPath();
  for (let x = ix; x < ix + iw; x += 60) { ctx.moveTo(x, iy); ctx.lineTo(x, iy + ih); } for (let y = iy; y < iy + ih; y += 60) { ctx.moveTo(ix, y); ctx.lineTo(ix + iw, y); } ctx.stroke();
  ctx.strokeStyle = "rgba(255,230,170,.1)"; ctx.beginPath();
  [[110, 880], [W - 120, 260]].forEach(([cx, cy]) => { for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 1200, cy + Math.sin(a) * 1200); } }); ctx.stroke();
  ctx.strokeStyle = "rgba(255,240,210,.14)"; ctx.lineWidth = 1.5; const R = rng(77);
  for (let i = 0; i < 26; i++) { const x = ix + R() * iw, y = iy + R() * ih; ctx.beginPath(); ctx.arc(x, y, 7, Math.PI * 1.1, Math.PI * 1.9); ctx.arc(x + 12, y, 7, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
  compassRose(ctx, W - 108, H - 132, 58, "rgba(245,210,122,.55)");
  ctx.restore();
  rr(ctx, ix, iy, iw, ih, 22); ctx.strokeStyle = "rgba(60,40,10,.6)"; ctx.lineWidth = 2; ctx.stroke();
  // HUB CREW ribbon
  const rx0 = 150, rx1 = W - 150, ry = 34, rh = 40;
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
  polyPath(ctx, [[rx0 - 30, ry + 6], [rx0, ry + 6], [rx0, ry + rh + 6], [rx0 - 30, ry + rh + 6], [rx0 - 16, ry + rh / 2 + 6]]); ctx.fillStyle = "#7d0a10"; ctx.fill();
  polyPath(ctx, [[rx1 + 30, ry + 6], [rx1, ry + 6], [rx1, ry + rh + 6], [rx1 + 30, ry + rh + 6], [rx1 + 16, ry + rh / 2 + 6]]); ctx.fill();
  rr(ctx, rx0, ry, rx1 - rx0, rh, 4); const rg = ctx.createLinearGradient(0, ry, 0, ry + rh); rg.addColorStop(0, "#e8343c"); rg.addColorStop(1, "#9c0f18"); ctx.fillStyle = rg; ctx.fill(); ctx.restore();
  ctx.fillStyle = "#ffe39a"; ctx.textAlign = "center"; ctx.font = `800 18px ${CF}`; ctx.fillText(`${txt("wantedRibbon")}  ·  ${(card.stage || "BASIC").toUpperCase()}  ·  ${card.hp || ""} HP`, W / 2, ry + 27); ctx.textAlign = "left";
  // the poster, nailed on at a slight tilt
  const px = 64, py = 90, pw = W - 128, ph = 714;
  ctx.save(); ctx.translate(W / 2, py + ph / 2); ctx.rotate(-0.018); ctx.translate(-W / 2, -(py + ph / 2));
  const Rr = rng(13), jag = (n) => (Rr() - 0.5) * n, edge = () => {
    ctx.beginPath(); ctx.moveTo(px, py);
    for (let x = px; x <= px + pw; x += 16) ctx.lineTo(x, py + jag(6)); for (let y = py; y <= py + ph; y += 16) ctx.lineTo(px + pw + jag(6), y);
    for (let x = px + pw; x >= px; x -= 16) ctx.lineTo(x, py + ph + jag(6)); for (let y = py + ph; y >= py; y -= 16) ctx.lineTo(px + jag(6), y); ctx.closePath();
  };
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,.6)"; ctx.shadowBlur = 22; ctx.shadowOffsetY = 8; edge();
  const pg = ctx.createRadialGradient(W / 2, py + ph * 0.45, 100, W / 2, py + ph / 2, 520); pg.addColorStop(0, Q.paper); pg.addColorStop(1, Q.paper2);
  ctx.fillStyle = pg; ctx.fill(); ctx.restore();
  ctx.save(); edge(); ctx.clip();
  ctx.shadowColor = "rgba(70,30,5,.9)"; ctx.shadowBlur = 40; ctx.lineWidth = 26; ctx.strokeStyle = "rgba(90,45,10,.45)"; edge(); ctx.stroke(); ctx.shadowColor = "transparent";
  const Rs = rng(29); for (let i = 0; i < 12; i++) { const sx = px + Rs() * pw, sy = py + Rs() * ph, sr = 20 + Rs() * 60; const st = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr); st.addColorStop(0, "rgba(120,80,30,.13)"); st.addColorStop(1, "rgba(120,80,30,0)"); ctx.fillStyle = st; ctx.fillRect(sx - sr, sy - sr, sr * 2, sr * 2); }
  ctx.restore();
  [[px + 22, py + 22], [px + pw - 22, py + 22]].forEach(([x, y]) => { ctx.save(); ctx.shadowColor = "rgba(0,0,0,.5)"; ctx.shadowBlur = 4; ctx.shadowOffsetY = 2; ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fillStyle = metal(ctx, x - 8, y - 8, x + 8, y + 8, ["#d8d8d8", "#6a6a6a", "#bdbdbd"]); ctx.fill(); ctx.restore(); });
  ctx.textAlign = "center"; ctx.fillStyle = INK;
  fitFont(ctx, "WANTED", "900", 126, SF, pw - 90, 50);
  ctx.save(); ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillText("WANTED", W / 2, py + 132); ctx.restore(); ctx.fillText("WANTED", W / 2, py + 130);
  // photo
  ctx.save(); ctx.beginPath(); ctx.rect(P.x, P.y, P.w, P.h); ctx.clip(); drawPhoto(ctx, P, t, P.y + P.h / 2 + 12);
  ctx.globalCompositeOperation = "multiply"; ctx.fillStyle = "rgba(205,155,85,.2)"; ctx.fillRect(P.x, P.y, P.w, P.h); ctx.globalCompositeOperation = "source-over";
  if (card.holo) holo(ctx, P, 0.35); ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.strokeRect(P.x - 7, P.y - 7, P.w + 14, P.h + 14); ctx.lineWidth = 1.5; ctx.strokeRect(P.x, P.y, P.w, P.h);
  // ALIVE & HUAT, name, bounty
  const ay = P.y + P.h + 42;
  ctx.textAlign = "center"; ctx.fillStyle = INK; ctx.font = `800 26px ${SF}`; const aw = ctx.measureText(txt("wantedMotto")).width;
  ctx.fillText(txt("wantedMotto"), W / 2, ay);
  ctx.fillRect(px + 40, ay - 10, W / 2 - aw / 2 - px - 60, 2.5); ctx.fillRect(W / 2 + aw / 2 + 20, ay - 10, W / 2 - aw / 2 - px - 60, 2.5);
  const nm = (card.name || "Your Name").toUpperCase();
  fitFont(ctx, nm, "900", 56, SF, pw - 80, 22); ctx.fillText(nm, W / 2, ay + 56);
  const bounty = Math.round(((+card.hp || 120) * 8888888) / 120).toLocaleString("en-US");
  ctx.font = `800 54px ${NF}`; const bw = ctx.measureText(bounty + "-").width; ctx.font = `800 28px ${SF}`; const cw = ctx.measureText(`${txt("wantedCurrency")} `).width;
  const bx0 = W / 2 - (bw + cw) / 2; ctx.textAlign = "left";
  ctx.fillStyle = Q.accent; ctx.fillText(txt("wantedCurrency"), bx0, ay + 110);
  ctx.font = `800 54px ${NF}`; ctx.fillStyle = INK; ctx.fillText(bounty + "-", bx0 + cw, ay + 110);
  ctx.font = `700 12px ${CF}`; ctx.textAlign = "center"; ctx.fillStyle = rgbaHex(INK, 0.75);
  ctx.fillText(txt("wantedLastSeen", { team: t.label }), W / 2, ay + 132);
  ctx.textAlign = "left";
  ctx.restore();
  drawBadge(ctx, W - 64, 62, 26);
  // moves on a dark glass panel
  const gy = 812, gh = 172;
  rr(ctx, 40, gy, W - 80, gh, 14); ctx.fillStyle = "rgba(6,12,16,.72)"; ctx.fill();
  ctx.strokeStyle = metal(ctx, 40, gy, W - 40, gy + gh, GOLD); ctx.lineWidth = 2.5; ctx.stroke();
  ctx.font = `800 13px ${CF}`; ctx.fillStyle = "#f5d27a"; ctx.fillText("WANTED FOR", 60, gy + 24);
  ctx.save(); ctx.translate(58, gy + 28); ctx.scale(0.82, 0.82); drawMoves(ctx, 0, (gh - 34) / 0.82, true, 0, (W - 116) / 0.82); ctx.restore();
  drawFooter(ctx, true, 40, W - 40, 1012);
}
