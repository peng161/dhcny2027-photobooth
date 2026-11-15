import { card } from "../../booth/state.js";
import { brushed, drawEscort, drawFooter, drawHeader, drawMoves, drawPhoto, drawSeal, drawStats, holo, lightBurst, stripText, teamTexture, xiangyun } from "../kit.js";
import { BLACK } from "../palettes.js";
import { PHOTO } from "../renderer.js";
import { EVERYONE, TYPES } from "../../config.js";
import { CF, H, W, fitFont, lighten, metal, rr, wrap } from "../../core/util.js";
/* ---------- Classic layout: photo window ---------- */
export function drawClassic(ctx, D) {
  const t = TYPES[card.type] || TYPES[EVERYONE], P = PHOTO;
  rr(ctx, 0, 0, W, H, 34); ctx.fillStyle = metal(ctx, 0, 0, W, H, D.frame); ctx.fill();
  brushed(ctx, D.frame === BLACK);
  rr(ctx, 19, 19, W - 38, H - 38, 21); ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 2; ctx.stroke();
  const ix = 24, iy = 24, iw = W - 48, ih = H - 48;
  ctx.save(); rr(ctx, ix, iy, iw, ih, 18); ctx.clip();
  const bg = ctx.createLinearGradient(ix, iy, ix + iw * 0.4, iy + ih);
  bg.addColorStop(0, t.c1); bg.addColorStop(0.45, t.c2); bg.addColorStop(1, lighten(t.c2, 0.35));
  ctx.fillStyle = bg; ctx.fillRect(ix, iy, iw, ih);
  lightBurst(ctx, W / 2, 330, 560, 24);
  teamTexture(ctx, card.type, ix, iy, iw, ih, t.sym, 0.14);
  if (D.orn === "cny") {
    [[110, 620], [640, 700], [130, 960], [600, 880]].forEach(([x, y]) => xiangyun(ctx, x, y, 42, "rgba(184,134,42,.45)", 4));
  }
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.18)");
  ctx.fillStyle = vg; ctx.fillRect(ix, iy, iw, ih);
  ctx.restore();
  rr(ctx, ix, iy, iw, ih, 18); ctx.strokeStyle = "rgba(0,0,0,.35)"; ctx.lineWidth = 2.5; ctx.stroke();

  drawHeader(ctx, false);

  // bevelled photo frame
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4;
  rr(ctx, P.x - 10, P.y - 10, P.w + 20, P.h + 20, 6); ctx.fillStyle = metal(ctx, P.x, P.y, P.x + P.w, P.y + P.h, D.trim); ctx.fill(); ctx.restore();
  rr(ctx, P.x - 10, P.y - 10, P.w + 20, P.h + 20, 6); ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.rect(P.x, P.y, P.w, P.h); ctx.clip();
  drawPhoto(ctx, P, t, P.y + P.h / 2 + 12);
  if (card.holo) holo(ctx, P, 1);
  ctx.shadowColor = "rgba(0,0,0,.6)"; ctx.shadowBlur = 16; ctx.lineWidth = 20; ctx.strokeStyle = "rgba(0,0,0,.6)";
  ctx.strokeRect(P.x - 10, P.y - 10, P.w + 20, P.h + 20); // inner shadow
  ctx.shadowColor = "transparent";
  const mr = D.bigMonkey ? 66 : 54;
  if (card.monkey !== "off") drawEscort(ctx, card.monkey === "left" ? P.x + mr * 1.6 : P.x + P.w - mr * 1.6, P.y + P.h - mr * 2.3, mr);
  if (card.seal) drawSeal(ctx, card.monkey === "left" ? P.x + P.w - 56 : P.x + 56, P.y + 56, 28);
  ctx.restore();
  ctx.strokeStyle = "rgba(0,0,0,.4)"; ctx.lineWidth = 1.5; ctx.strokeRect(P.x - 0.5, P.y - 0.5, P.w + 1, P.h + 1);

  // info ribbon
  const sy = P.y + P.h + 18;
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,.3)"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
  ctx.beginPath(); ctx.moveTo(P.x + 24, sy); ctx.lineTo(P.x + P.w - 6, sy); ctx.lineTo(P.x + P.w - 24, sy + 30); ctx.lineTo(P.x + 6, sy + 30); ctx.closePath();
  ctx.fillStyle = metal(ctx, P.x, sy, P.x + P.w, sy + 30, D.trim); ctx.fill(); ctx.restore();
  const st = stripText();
  ctx.textAlign = "center"; fitFont(ctx, st, "italic 600", 17, CF, P.w - 70, 11);
  ctx.fillStyle = "#1b1712"; ctx.fillText(st, P.x + P.w / 2, sy + 21); ctx.textAlign = "left";

  drawMoves(ctx, sy + 44, 834, false, 62, W - 58);

  rr(ctx, 44, 842, W - 88, 62, 12); ctx.fillStyle = "rgba(255,255,255,.45)"; ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,.15)"; ctx.lineWidth = 1.5; ctx.stroke();
  drawStats(ctx, 862, false, 44, W - 44);

  if (card.flavor) {
    const fx = 300, fy = 916, fw = W - 46 - fx, fh = 72;
    rr(ctx, fx, fy, fw, fh, 8); ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.fill();
    ctx.strokeStyle = metal(ctx, fx, fy, fx + fw, fy + fh, D.trim); ctx.lineWidth = 3; ctx.stroke();
    let fs = 15, lines;
    do { ctx.font = `italic 500 ${fs}px ${CF}`; lines = wrap(ctx, card.flavor, fw - 20); fs -= 0.5; } while (lines.length * (fs + 3) > fh - 10 && fs > 10);
    ctx.fillStyle = "#1b1712";
    const lh = fs + 3.5, startY = fy + (fh - lines.length * lh) / 2 + lh - 4;
    lines.forEach((ln, k) => ctx.fillText(ln, fx + 10, startY + k * lh));
  }
  drawFooter(ctx, false, 50, W - 50, 1006);
}
