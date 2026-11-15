import { cx } from "../../booth/preview.js";
import { card } from "../../booth/state.js";
import { SF, clusterLine, drawBadge, drawFooter, drawMoves, drawPhoto, drawStats, holo, stripText } from "../kit.js";
import { PHOTO } from "../renderer.js";
import { EVERYONE, TYPES, txt } from "../../config.js";
import { CF, H, NF, W, fitFont, rgbaHex, rr } from "../../core/util.js";
/* ---------- Postage Stamp: perforated paper, postmark ---------- */
export function drawStamp(ctx, D) {
  const t = TYPES[card.type] || TYPES[EVERYONE], P = PHOTO, S = D.st, INK = S.ink;
  rr(ctx, 0, 0, W, H, 34); ctx.fillStyle = S.bg; ctx.fill();
  ctx.save(); rr(ctx, 0, 0, W, H, 34); ctx.clip(); ctx.strokeStyle = "rgba(255,255,255,.07)"; ctx.lineWidth = 1;
  for (let i = 0; i < 46; i++) { ctx.beginPath(); ctx.arc(W / 2, H / 2, 30 + i * 15, 0, Math.PI * 2); ctx.stroke(); }
  ctx.restore();
  const x0 = 38, y0 = 38, x1 = W - 38, y1 = H - 38, pr = 9, step = 26;
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,.4)"; ctx.shadowBlur = 16; ctx.shadowOffsetY = 5;
  ctx.fillStyle = S.paper; ctx.fillRect(x0, y0, x1 - x0, y1 - y0); ctx.restore();
  ctx.fillStyle = S.bg;
  const holes = (ax, ay, bx, by) => { const n = Math.round(Math.hypot(bx - ax, by - ay) / step); for (let i = 0; i <= n; i++) { ctx.beginPath(); ctx.arc(ax + ((bx - ax) * i) / n, ay + ((by - ay) * i) / n, pr, 0, Math.PI * 2); ctx.fill(); } };
  holes(x0, y0, x1, y0); holes(x0, y1, x1, y1); holes(x0, y0, x0, y1); holes(x1, y0, x1, y1);
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(64, 64, W - 128, H - 128);
  ctx.lineWidth = 1; ctx.strokeRect(72, 72, W - 144, H - 144);
  ctx.fillStyle = INK; ctx.textAlign = "center"; ctx.font = `800 15px ${CF}`;
  ctx.fillText(txt("stampTop"), W / 2, 102);
  const nm = card.name || "Your Name";
  fitFont(ctx, nm, "italic 800", 46, SF, W - 190, 22); ctx.fillText(nm, W / 2, 154); ctx.textAlign = "left";
  ctx.save(); ctx.beginPath(); ctx.rect(P.x, P.y, P.w, P.h); ctx.clip();
  drawPhoto(ctx, P, t, P.y + P.h / 2 + 12); if (card.holo) holo(ctx, P, 0.35);
  // postmark
  const cx = P.x + P.w - 116, cy = P.y + P.h - 78, r = 56;
  ctx.save(); ctx.globalAlpha = 0.62; ctx.strokeStyle = "#151515"; ctx.fillStyle = "#151515";
  ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, r - 9, 0, Math.PI * 2); ctx.stroke();
  ctx.textAlign = "center"; ctx.font = `800 16px ${CF}`; ctx.fillText(txt("stampPostmark"), cx, cy - 2); ctx.font = `700 12px ${CF}`; ctx.fillText(txt("stampPostmarkSub"), cx, cy + 18);
  ctx.lineWidth = 2.5;
  for (let k = 0; k < 4; k++) { ctx.beginPath(); const yy = cy - 24 + k * 16; for (let x = 0; x <= 190; x += 4) { const px = cx - r - 12 - x, py = yy + Math.sin(x / 11) * 4; x ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); }
  ctx.restore();
  ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(P.x, P.y, P.w, P.h);
  // value box
  rr(ctx, P.x + 12, P.y + 12, 118, 66, 8); ctx.fillStyle = S.paper; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = INK; ctx.textAlign = "center"; ctx.font = `800 42px ${NF}`; ctx.fillText(String(card.hp || ""), P.x + 71, P.y + 54);
  ctx.font = `800 12px ${CF}`; ctx.fillText("HP", P.x + 71, P.y + 71); ctx.textAlign = "left";
  drawBadge(ctx, P.x + P.w - 46, P.y + 46, 28);
  clusterLine(ctx, W / 2, P.y + P.h + 30, INK, W - 200);
  ctx.save(); ctx.textAlign = "center"; fitFont(ctx, stripText(), "italic 600", 13, CF, W - 200, 9); ctx.fillStyle = rgbaHex(INK, 0.75); ctx.fillText(stripText(), W / 2, P.y + P.h + 52); ctx.restore();
  drawMoves(ctx, 670, 884, false, 96, W - 96);
  drawStats(ctx, 906, false, 84, W - 84);
  drawFooter(ctx, false, 92, W - 92, 966);
}
