import { cx } from "../../booth/preview.js";
import { card, photo } from "../../booth/state.js";
import { brushed, crystalFacets, drawEscort, drawFooter, drawHeader, drawMoves, drawPhoto, drawPhotoImage, drawSeal, drawStats, goldTone, holo, holoRing, lantern, stripText, twinkle, xiangyun } from "../kit.js";
import { BLACK, NAVY } from "../palettes.js";
import { PHOTO } from "../renderer.js";
import { EVERYONE, TYPES } from "../../config.js";
import { CF, H, W, fitFont, metal, rng, rr, shade } from "../../core/util.js";
/* ---------- Full-art layout: photo fills the card ---------- */
export function drawFull(ctx, D) {
  const t = TYPES[card.type] || TYPES[EVERYONE], P = PHOTO;
  rr(ctx, 0, 0, W, H, 34); ctx.fillStyle = metal(ctx, 0, 0, W, H, D.frame); ctx.fill();
  brushed(ctx, D.frame === BLACK || D.frame === NAVY);
  if (D.orn === "crystal") holoRing(ctx);
  const TINT = D.tint || t.sym;
  ctx.save(); rr(ctx, P.x, P.y, P.w, P.h, 20); ctx.clip();
  drawPhoto(ctx, P, t, 420);
  if (D.orn === "goldfoil") goldTone(ctx, P);
  if (D.orn === "crystal") crystalFacets(ctx, P);
  // tints for legibility
  const top = ctx.createLinearGradient(0, P.y, 0, P.y + 270);
  top.addColorStop(0, shade(TINT, 0.55, 0.85)); top.addColorStop(1, shade(TINT, 0.55, 0));
  ctx.fillStyle = top; ctx.fillRect(P.x, P.y, P.w, 270);
  const bot = ctx.createLinearGradient(0, 600, 0, H);
  bot.addColorStop(0, shade(TINT, 0.7, 0)); bot.addColorStop(0.35, shade(TINT, 0.7, 0.7)); bot.addColorStop(1, shade(TINT, 0.8, 0.95));
  ctx.fillStyle = bot; ctx.fillRect(P.x, 600, P.w, H - 600);
  // ornaments
  if (D.orn === "cny" || D.orn === "gold" || D.orn === "goldfoil") {
    ctx.save(); ctx.shadowColor = "rgba(255,200,80,.8)"; ctx.shadowBlur = 10;
    xiangyun(ctx, 92, 668, 26, "#f5c84c", 3.5); xiangyun(ctx, W - 230, 672, 22, "#f5c84c", 3.5);
    ctx.restore();
    const R = rng(11); for (let i = 0; i < 10; i++) twinkle(ctx, P.x + 20 + R() * (P.w - 40), 150 + R() * 480, 2 + R() * 4, "#ffd56a");
  }
  if (D.orn === "cny") { lantern(ctx, P.x + 36, 262, 19); lantern(ctx, P.x + P.w - 36, 236, 16); }
  if (D.orn === "tech") {
    ctx.save(); ctx.strokeStyle = D.neon || "#7fe0ff"; ctx.shadowColor = D.neon || "#2fb4e0"; ctx.shadowBlur = 10; ctx.lineWidth = 3;
    [[56, 166, 1, 1], [W - 56, 166, -1, 1], [56, 604, 1, -1], [W - 56, 604, -1, -1]].forEach(([cx, cy, dx, dy]) => {
      ctx.beginPath(); ctx.moveTo(cx + dx * 40, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + dy * 40); ctx.stroke();
    });
    const R = rng(5); ctx.lineWidth = 2; ctx.fillStyle = D.neon || "#7fe0ff";
    for (let i = 0; i < 10; i++) {
      const side = i % 2 ? 1 : -1; let px = side < 0 ? P.x + 6 : P.x + P.w - 6, py = 190 + R() * 380;
      ctx.beginPath(); ctx.moveTo(px, py); px += -side * (20 + R() * 40); ctx.lineTo(px, py);
      py += (R() < 0.5 ? -1 : 1) * (15 + R() * 30); px += -side * 15; ctx.lineTo(px, py); ctx.stroke();
      ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowColor = "transparent"; ctx.globalAlpha = 0.06; ctx.fillStyle = "#fff";
    for (let yy = P.y; yy < P.y + P.h; yy += 4) ctx.fillRect(P.x, yy, P.w, 1);
    ctx.restore();
  }
  if (card.holo) holo(ctx, P, 0.55);
  // frosted glass panel for the moves
  const gp = { x: 40, y: 692, w: W - 80, h: 212 };
  ctx.save(); rr(ctx, gp.x, gp.y, gp.w, gp.h, 18); ctx.clip();
  if (photo.img) { ctx.filter = "blur(16px) brightness(.8) saturate(1.5)"; drawPhotoImage(ctx, P); ctx.filter = "none"; }
  ctx.fillStyle = shade(TINT, 0.3, 0.5); ctx.fillRect(gp.x, gp.y, gp.w, gp.h);
  const hl = ctx.createLinearGradient(0, gp.y, 0, gp.y + gp.h);
  hl.addColorStop(0, "rgba(255,255,255,.2)"); hl.addColorStop(0.3, "rgba(255,255,255,.05)"); hl.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = hl; ctx.fillRect(gp.x, gp.y, gp.w, gp.h);
  ctx.restore();
  rr(ctx, gp.x, gp.y, gp.w, gp.h, 18); ctx.strokeStyle = metal(ctx, gp.x, gp.y, gp.x + gp.w, gp.y + gp.h, D.trim); ctx.lineWidth = 2.5; ctx.stroke();
  // monkey sits on the panel; seal under the name
  if (card.monkey !== "off") { const mr = 48; drawEscort(ctx, card.monkey === "left" ? 120 : W - 120, gp.y + 14 - mr * 2.15, mr); }
  if (card.seal) drawSeal(ctx, card.monkey === "left" ? W - 82 : 82, 206, 26);
  ctx.restore();
  rr(ctx, P.x, P.y, P.w, P.h, 20); ctx.strokeStyle = metal(ctx, 0, 0, W, H, D.trim); ctx.lineWidth = 3; ctx.stroke();

  drawHeader(ctx, true);
  const st = stripText();
  ctx.font = `italic 600 15px ${CF}`;
  const sw = Math.min(ctx.measureText(st).width + 34, W - 110);
  rr(ctx, W / 2 - sw / 2, 120, sw, 28, 14); ctx.fillStyle = "rgba(0,0,0,.42)"; ctx.fill();
  ctx.strokeStyle = metal(ctx, W / 2 - sw / 2, 0, W / 2 + sw / 2, 0, D.trim); ctx.lineWidth = 1.5; ctx.stroke();
  ctx.textAlign = "center"; fitFont(ctx, st, "italic 600", 15, CF, sw - 28, 10);
  ctx.fillStyle = "#fff"; ctx.fillText(st, W / 2, 139); ctx.textAlign = "left";

  drawMoves(ctx, gp.y + 6, gp.y + gp.h - 6, true, 66, W - 66);
  drawStats(ctx, 922, true, 44, W - 44);

  drawFooter(ctx, true, 50, W - 50, 1000);
}
