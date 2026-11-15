import { cx } from "../../booth/preview.js";
import { card } from "../../booth/state.js";
import { SF, clusterLine, drawBadge, drawFooter, drawMoves, drawPhoto, drawStats, holo, hpText, stripText } from "../kit.js";
import { PHOTO } from "../renderer.js";
import { EVERYONE, TYPES, txt } from "../../config.js";
import { CF, CJK, H, W, fitFont, rgbaHex, rng, rr } from "../../core/util.js";
/* ---------- Ink Scroll: rice paper, ink-wash hills, moon window ---------- */
export function drawScroll(ctx, D) {
  const t = TYPES[card.type] || TYPES[EVERYONE], P = PHOTO, S = D.sc, dark = !!S.dark, INK = S.ink;
  rr(ctx, 0, 0, W, H, 34); ctx.fillStyle = S.paper; ctx.fill();
  ctx.save(); rr(ctx, 0, 0, W, H, 34); ctx.clip();
  const R = rng(57); ctx.lineCap = "round";
  for (let i = 0; i < 170; i++) {
    ctx.strokeStyle = rgbaHex(INK, 0.03 + R() * 0.03); ctx.lineWidth = 0.6 + R();
    const x = R() * W, y = R() * H; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + (R() - 0.5) * 40, y + (R() - 0.5) * 20, x + (R() - 0.5) * 80, y + (R() - 0.5) * 30); ctx.stroke();
  }
  [[0.09, 520, 1.0], [0.14, 575, 0.8], [0.2, 630, 0.6]].forEach(([a, base, amp], k) => {
    ctx.fillStyle = rgbaHex(INK, a); ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 10) ctx.lineTo(x, base - amp * (60 * Math.sin(x / 90 + k * 2) + 40 * Math.sin(x / 37 + k) + 40));
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
  });
  const fade = ctx.createLinearGradient(0, 600, 0, 690); fade.addColorStop(0, rgbaHex(S.paper, 0)); fade.addColorStop(1, rgbaHex(S.paper, 1));
  ctx.fillStyle = fade; ctx.fillRect(0, 600, W, H - 600);
  ctx.restore();
  const nm = card.name || "Your Name";
  fitFont(ctx, nm, 800, 48, SF, W - 300, 22); ctx.fillStyle = INK; ctx.fillText(nm, 52, 106);
  drawBadge(ctx, W - 74, 80, 28);
  hpText(ctx, W - 116, 106, 48, INK, dark);
  ctx.save(); ctx.lineCap = "round";
  for (let k = 0; k < 4; k++) { ctx.strokeStyle = rgbaHex(INK, 0.18 + k * 0.15); ctx.lineWidth = 4 - k * 0.8; ctx.beginPath(); ctx.moveTo(52 + k * 6, 128 + k * 0.6); ctx.quadraticCurveTo(W / 2, 122 + k, W - 52 - k * 10, 130 - k * 0.5); ctx.stroke(); }
  ctx.restore();
  // vertical calligraphy: 同心协力, hearts and hands together
  ctx.fillStyle = rgbaHex(INK, 0.85); ctx.font = `700 34px ${CJK}`; ctx.textAlign = "center";
  txt("scrollCalligraphy").split("").forEach((ch, i) => ctx.fillText(ch, 80, 226 + i * 52));
  ctx.textAlign = "left";
  const cx = P.x + P.w / 2, cy = P.y + P.h / 2, r = P.w / 2;
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip(); drawPhoto(ctx, P, t, cy + 12); if (card.holo) holo(ctx, P, 0.3); ctx.restore();
  ctx.save(); ctx.lineCap = "round";
  for (let k = 0; k < 5; k++) { ctx.strokeStyle = rgbaHex(INK, 0.22 + k * 0.13); ctx.lineWidth = 2 + (4 - k) * 2.2; const a0 = -0.4 + k * 0.35; ctx.beginPath(); ctx.arc(cx + (k - 2) * 1.2, cy + (k - 2), r + 5 + k * 1.5, a0, a0 + Math.PI * 2 - 0.5 - k * 0.2); ctx.stroke(); }
  ctx.restore();
  // red seal with the cluster
  ctx.save(); ctx.translate(cx + r * 0.74, cy + r * 0.78); ctx.rotate(-0.06);
  rr(ctx, -40, -40, 80, 80, 6); ctx.fillStyle = S.seal; ctx.fill();
  ctx.strokeStyle = rgbaHex(S.paper, 0.85); ctx.lineWidth = 2; ctx.strokeRect(-32, -32, 64, 64);
  ctx.fillStyle = S.paper; ctx.textAlign = "center"; ctx.textBaseline = "middle"; fitFont(ctx, t.label, 800, 26, CF, 58, 12); ctx.fillText(t.label, 0, 2);
  ctx.restore(); ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  clusterLine(ctx, W / 2, 678, INK, W - 140);
  ctx.save(); ctx.textAlign = "center"; fitFont(ctx, stripText(), "italic 600", 13, CF, W - 140, 9); ctx.fillStyle = rgbaHex(INK, 0.7); ctx.fillText(stripText(), W / 2, 700); ctx.restore();
  drawMoves(ctx, 712, 904, dark, 64, W - 64);
  drawStats(ctx, 926, dark, 52, W - 52);
  drawFooter(ctx, dark, 50, W - 50, 1006);
}
