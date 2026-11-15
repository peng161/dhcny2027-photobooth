import { card } from "../../booth/state.js";
import { SF, drawBadge, drawFooter, drawMoves, drawPhoto, drawStats, holo, hpText } from "../kit.js";
import { PHOTO } from "../renderer.js";
import { EVERYONE, TYPES, txt } from "../../config.js";
import { H, W, fitFont, rng, rr } from "../../core/util.js";
/* ---------- Polaroid: taped snapshot on kraft paper or chalkboard ---------- */
export function drawPolaroid(ctx, D) {
  const t = TYPES[card.type] || TYPES[EVERYONE], P = PHOTO, Q = D.pl, dark = !!Q.dark, ink = dark ? "#f4efe6" : "#2a1d12";
  rr(ctx, 0, 0, W, H, 34);
  const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, Q.bg1); g.addColorStop(1, Q.bg2); ctx.fillStyle = g; ctx.fill();
  ctx.save(); rr(ctx, 0, 0, W, H, 34); ctx.clip(); const R = rng(41);
  for (let i = 0; i < 1100; i++) { ctx.fillStyle = R() < 0.5 ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)"; ctx.fillRect(R() * W, R() * H, 1 + R() * 2, 1 + R() * 2); }
  if (dark) for (let i = 0; i < 6; i++) { ctx.fillStyle = "rgba(255,255,255,.035)"; ctx.beginPath(); ctx.ellipse(R() * W, R() * H, 80 + R() * 160, 30 + R() * 60, R() * 3, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  const nm = card.name || "Your Name";
  fitFont(ctx, nm, "italic 800", 50, SF, W - 290, 22); ctx.fillStyle = ink; ctx.fillText(nm, 48, 106);
  drawBadge(ctx, W - 72, 80, 28);
  hpText(ctx, W - 114, 106, 50, ink, dark);
  // the snapshot
  ctx.save(); ctx.translate(W / 2, 420); ctx.rotate(-0.035); ctx.translate(-W / 2, -420);
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 22; ctx.shadowOffsetY = 8;
  ctx.fillStyle = "#fbfaf6"; ctx.fillRect(P.x - 26, P.y - 26, P.w + 52, P.h + 118); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(P.x, P.y, P.w, P.h); ctx.clip();
  drawPhoto(ctx, P, t, P.y + P.h / 2 + 12); if (card.holo) holo(ctx, P, 0.3);
  const v = ctx.createRadialGradient(P.x + P.w / 2, P.y + P.h / 2, P.h * 0.3, P.x + P.w / 2, P.y + P.h / 2, P.h * 0.85);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(50,25,0,.25)"); ctx.fillStyle = v; ctx.fillRect(P.x, P.y, P.w, P.h);
  ctx.restore();
  ctx.strokeStyle = "rgba(0,0,0,.12)"; ctx.lineWidth = 1; ctx.strokeRect(P.x, P.y, P.w, P.h);
  const cap = txt("polaroidCaption", { team: t.label });
  ctx.textAlign = "center"; fitFont(ctx, cap, "italic 700", 28, SF, P.w - 40, 14); ctx.fillStyle = "#3a2c22"; ctx.fillText(cap, W / 2, P.y + P.h + 60); ctx.textAlign = "left";
  const tape = (x, y, r) => { ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.fillStyle = "rgba(246,236,200,.75)"; ctx.fillRect(-58, -16, 116, 32); ctx.strokeStyle = "rgba(0,0,0,.06)"; ctx.strokeRect(-58, -16, 116, 32); ctx.restore(); };
  tape(P.x + 6, P.y - 20, -0.6); tape(P.x + P.w - 6, P.y - 20, 0.6);
  ctx.restore();
  // moves on a sheet of lined paper
  const nx = 52, ny = 714, nw = W - 104, nh = 238;
  ctx.save(); ctx.translate(W / 2, ny + nh / 2); ctx.rotate(0.012); ctx.translate(-W / 2, -(ny + nh / 2));
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,.3)"; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4; ctx.fillStyle = "#fffdf4"; ctx.fillRect(nx, ny, nw, nh); ctx.restore();
  ctx.strokeStyle = "rgba(70,120,200,.2)"; ctx.lineWidth = 1; ctx.beginPath(); for (let y = ny + 34; y < ny + nh; y += 28) { ctx.moveTo(nx, y); ctx.lineTo(nx + nw, y); } ctx.stroke();
  ctx.strokeStyle = "rgba(220,60,60,.35)"; ctx.beginPath(); ctx.moveTo(nx + 30, ny); ctx.lineTo(nx + 30, ny + nh); ctx.stroke();
  drawMoves(ctx, ny + 8, ny + nh - 8, false, nx + 44, nx + nw - 18);
  ctx.restore();
  ctx.save(); ctx.translate(40, 962); ctx.scale(0.74, 0.74); drawStats(ctx, 12, dark, 0, (W - 80) / 0.74); ctx.restore();
  drawFooter(ctx, dark, 48, W - 48, 1016);
}
