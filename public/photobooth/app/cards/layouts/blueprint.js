import { card, event } from "../../booth/state.js";
import { drawBadge, drawFooter, drawMoves, drawPhoto, drawStats, holo, hpText, textFx } from "../kit.js";
import { PHOTO } from "../renderer.js";
import { EVERYONE, TYPES, txt } from "../../config.js";
import { CF, H, NF, W, fitFont, rgbaHex, rr } from "../../core/util.js";
/* ---------- Blueprint: engineering drawing ---------- */
export function drawBlueprint(ctx, D) {
  const t = TYPES[card.type] || TYPES[EVERYONE], P = PHOTO, B = D.bp, L = B.line;
  rr(ctx, 0, 0, W, H, 34);
  const g = ctx.createLinearGradient(0, 0, W * 0.4, H); g.addColorStop(0, B.bg); g.addColorStop(1, B.bg2);
  ctx.fillStyle = g; ctx.fill();
  ctx.save(); rr(ctx, 0, 0, W, H, 34); ctx.clip(); ctx.lineWidth = 1;
  [[15, 0.07], [75, 0.16]].forEach(([step, a]) => {
    ctx.strokeStyle = rgbaHex(L, a); ctx.beginPath();
    for (let x = 0; x <= W; x += step) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); }
    for (let y = 0; y <= H; y += step) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); }
    ctx.stroke();
  });
  ctx.restore();
  ctx.strokeStyle = rgbaHex(L, 0.9); ctx.lineWidth = 2.5; ctx.strokeRect(26, 26, W - 52, H - 52);
  ctx.lineWidth = 1; ctx.strokeRect(34, 34, W - 68, H - 68);
  // header
  ctx.fillStyle = rgbaHex(L, 0.75); ctx.font = `600 14px ${NF}`;
  ctx.fillText(`DWG NO. DH-${String(event.num).padStart(3, "0")}   ·   REV A   ·   SCALE 1:1`, 52, 62);
  const nm = card.name || "Your Name";
  fitFont(ctx, nm, 800, 46, CF, W - 300, 22); textFx(ctx, nm, 50, 114, true, "#fff");
  drawBadge(ctx, W - 76, 86, 28);
  hpText(ctx, W - 118, 114, 50, "#fff", true);
  // photo with a cool engineering tint
  ctx.save(); ctx.beginPath(); ctx.rect(P.x, P.y, P.w, P.h); ctx.clip();
  drawPhoto(ctx, P, t, P.y + P.h / 2 + 12);
  ctx.globalCompositeOperation = "multiply"; ctx.fillStyle = rgbaHex(B.bg, 0.22); ctx.fillRect(P.x, P.y, P.w, P.h);
  ctx.globalCompositeOperation = "source-over";
  if (card.holo) holo(ctx, P, 0.35);
  ctx.restore();
  ctx.strokeStyle = L; ctx.lineWidth = 2; ctx.strokeRect(P.x, P.y, P.w, P.h);
  ctx.lineWidth = 1.5; ctx.beginPath();
  [[P.x, P.y, -1, -1], [P.x + P.w, P.y, 1, -1], [P.x, P.y + P.h, -1, 1], [P.x + P.w, P.y + P.h, 1, 1]].forEach(([x, y, dx, dy]) => {
    ctx.moveTo(x + dx * 5, y); ctx.lineTo(x + dx * 16, y); ctx.moveTo(x, y + dy * 5); ctx.lineTo(x, y + dy * 16);
  });
  // dimension line above the photo
  const dy = P.y - 14;
  ctx.moveTo(P.x, dy); ctx.lineTo(P.x + P.w, dy); ctx.moveTo(P.x, dy - 6); ctx.lineTo(P.x, dy + 6); ctx.moveTo(P.x + P.w, dy - 6); ctx.lineTo(P.x + P.w, dy + 6);
  ctx.stroke();
  const dl = `${t.label.toUpperCase()} UNIT  ·  ${(card.stage || "BASIC").toUpperCase()}`;
  ctx.font = `700 14px ${NF}`; const dw = ctx.measureText(dl).width + 18;
  ctx.fillStyle = B.bg; ctx.fillRect(W / 2 - dw / 2, dy - 9, dw, 18);
  ctx.fillStyle = L; ctx.textAlign = "center"; ctx.fillText(dl, W / 2, dy + 5);
  // figure caption
  ctx.font = `600 15px ${NF}`; ctx.textAlign = "left"; ctx.fillStyle = rgbaHex(L, 0.85);
  ctx.fillText(`FIG. 1 — ${nm.toUpperCase()}`.slice(0, 40), P.x, P.y + P.h + 26);
  ctx.textAlign = "right"; fitFont(ctx, card.species || "", 600, 15, NF, 300, 10); ctx.fillText(card.species || "", P.x + P.w, P.y + P.h + 26);
  ctx.textAlign = "left";
  // moves in a dashed box
  ctx.setLineDash([8, 6]); ctx.strokeStyle = rgbaHex(L, 0.6); ctx.lineWidth = 1.5; ctx.strokeRect(50, 642, W - 100, 230); ctx.setLineDash([]);
  drawMoves(ctx, 650, 864, true, 68, W - 68);
  // title block
  const cw = (W - 100) / 3;
  ctx.strokeStyle = rgbaHex(L, 0.85); ctx.lineWidth = 1.5; ctx.strokeRect(50, 884, W - 100, 100);
  ctx.beginPath(); ctx.moveTo(50 + cw, 884); ctx.lineTo(50 + cw, 984); ctx.moveTo(50 + cw * 2, 884); ctx.lineTo(50 + cw * 2, 984); ctx.stroke();
  drawStats(ctx, 916, true, 50, W - 50);
  ctx.fillStyle = rgbaHex(L, 0.6); ctx.font = `600 12px ${NF}`; ctx.fillText(txt("blueprintChecked", { team: t.label }), 66, 972);
  drawFooter(ctx, true, 50, W - 50, 1010);
}
