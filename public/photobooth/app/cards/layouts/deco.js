import { card } from "../../booth/state.js";
import { SF, clusterLine, drawBadge, drawFooter, drawMoves, drawPhoto, drawStats, holo, hpText, polyPath } from "../kit.js";
import { PHOTO } from "../renderer.js";
import { EVERYONE, TYPES, txt } from "../../config.js";
import { CF, H, W, fitFont, metal, rr } from "../../core/util.js";
/* ---------- Art Deco: geometric metalwork, octagon window ---------- */
export function drawDeco(ctx, D) {
  const t = TYPES[card.type] || TYPES[EVERYONE], P = PHOTO, K = D.dc, ACC = K.ink;
  const mt = (x0, y0, x1, y1) => metal(ctx, x0, y0, x1, y1, K.metal);
  rr(ctx, 0, 0, W, H, 34);
  const g = ctx.createRadialGradient(W / 2, 300, 50, W / 2, 500, 820); g.addColorStop(0, K.bg2); g.addColorStop(1, K.bg); ctx.fillStyle = g; ctx.fill();
  ctx.save(); rr(ctx, 0, 0, W, H, 34); ctx.clip();
  ctx.globalAlpha = 0.3; ctx.strokeStyle = mt(0, 0, W, 300); ctx.lineWidth = 1.5;
  for (let i = 0; i <= 28; i++) { const a = Math.PI + (i / 28) * Math.PI; ctx.beginPath(); ctx.moveTo(W / 2, 200); ctx.lineTo(W / 2 + Math.cos(a) * 560, 200 + Math.sin(a) * 560); ctx.stroke(); }
  [70, 110, 150].forEach(rad => { ctx.beginPath(); ctx.arc(W / 2, 200, rad, Math.PI, 0); ctx.stroke(); });
  ctx.globalAlpha = 0.18;
  for (let x = 40; x < W; x += 22) { ctx.beginPath(); ctx.moveTo(x, H - 120); ctx.lineTo(x, H - 40); ctx.stroke(); }
  ctx.restore();
  rr(ctx, 18, 18, W - 36, H - 36, 24); ctx.strokeStyle = mt(0, 0, W, H); ctx.lineWidth = 5; ctx.stroke();
  rr(ctx, 30, 30, W - 60, H - 60, 16); ctx.lineWidth = 1.5; ctx.stroke();
  const corner = (x, y, sx, sy) => { ctx.beginPath(); for (let k = 0; k < 3; k++) { const o = 44 + k * 12; ctx.moveTo(x + sx * o, y + sy * 12); ctx.lineTo(x + sx * o, y + sy * o); ctx.lineTo(x + sx * 12, y + sy * o); } ctx.stroke(); };
  ctx.lineWidth = 2; corner(30, 30, 1, 1); corner(W - 30, 30, -1, 1); corner(30, H - 30, 1, -1); corner(W - 30, H - 30, -1, -1);
  // header
  ctx.fillStyle = ACC; ctx.textAlign = "center"; ctx.font = `700 14px ${CF}`; ctx.fillText(txt("decoTop"), W / 2, 72);
  const nm = (card.name || "Your Name").toUpperCase();
  fitFont(ctx, nm, 800, 44, SF, W - 330, 20);
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,.6)"; ctx.shadowBlur = 8; ctx.fillStyle = mt(0, 92, 0, 132); ctx.fillText(nm, W / 2, 128); ctx.restore();
  ctx.textAlign = "left";
  hpText(ctx, 60, 126, 42, ACC, true, "left");
  drawBadge(ctx, W - 84, 104, 28);
  // octagon window
  const oct = (x, y, w, h, c) => polyPath(ctx, [[x + c, y], [x + w - c, y], [x + w, y + c], [x + w, y + h - c], [x + w - c, y + h], [x + c, y + h], [x, y + h - c], [x, y + c]]);
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,.6)"; ctx.shadowBlur = 20; oct(P.x - 14, P.y - 14, P.w + 28, P.h + 28, 54); ctx.fillStyle = mt(P.x, P.y, P.x + P.w, P.y + P.h); ctx.fill(); ctx.restore();
  oct(P.x - 6, P.y - 6, P.w + 12, P.h + 12, 48); ctx.fillStyle = K.bg; ctx.fill();
  ctx.save(); oct(P.x, P.y, P.w, P.h, 44); ctx.clip(); drawPhoto(ctx, P, t, P.y + P.h / 2 + 12); if (card.holo) holo(ctx, P, 0.35); ctx.restore();
  oct(P.x, P.y, P.w, P.h, 44); ctx.strokeStyle = mt(P.x, P.y, P.x + P.w, P.y + P.h); ctx.lineWidth = 1.5; ctx.stroke();
  // divider with the cluster
  const dy = P.y + P.h + 36;
  ctx.strokeStyle = mt(0, 0, W, 0); ctx.lineWidth = 1.5; ctx.beginPath();
  ctx.moveTo(70, dy - 6); ctx.lineTo(W / 2 - 180, dy - 6); ctx.moveTo(W / 2 + 180, dy - 6); ctx.lineTo(W - 70, dy - 6); ctx.stroke();
  clusterLine(ctx, W / 2, dy, ACC, 340);
  drawMoves(ctx, 678, 894, true, 76, W - 76);
  ctx.fillStyle = mt(0, 0, W, 0); ctx.fillRect(70, 904, W - 140, 1.5);
  drawStats(ctx, 930, true, 60, W - 60);
  drawFooter(ctx, true, 54, W - 54, 1000);
}
