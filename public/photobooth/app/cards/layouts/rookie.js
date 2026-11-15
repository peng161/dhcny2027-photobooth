import { card, event } from "../../booth/state.js";
import { brushed, drawBadge, drawFooter, drawPhoto, holo, polyPath } from "../kit.js";
import { PHOTO } from "../renderer.js";
import { EVERYONE, TYPES, txt } from "../../config.js";
import { CF, H, NF, W, fitFont, metal, rr, wrap } from "../../core/util.js";
/* ---------- Rookie sports card: chrome, team stripes, jersey number, stat line ---------- */
export function drawRookie(ctx, D) {
  const t = TYPES[card.type] || TYPES[EVERYONE], P = PHOTO, K = D.rk;
  rr(ctx, 0, 0, W, H, 34); ctx.fillStyle = metal(ctx, 0, 0, W, H, K.metal); ctx.fill(); brushed(ctx, false);
  ctx.save(); rr(ctx, P.x, P.y, P.w, P.h, 14); ctx.clip();
  drawPhoto(ctx, P, t, P.y + P.h / 2);
  if (card.holo) holo(ctx, P, 0.4);
  // jersey number
  const num = `#${String(event.num).padStart(2, "0")}`;
  ctx.save(); ctx.font = `italic 900 150px ${NF}`; ctx.textAlign = "right"; ctx.globalAlpha = 0.85; ctx.lineWidth = 5; ctx.strokeStyle = "#fff"; ctx.shadowColor = "rgba(0,0,0,.5)"; ctx.shadowBlur = 10;
  ctx.strokeText(num, P.x + P.w - 22, P.y + P.h - 40); ctx.restore();
  // team stripes sweeping up from the bottom-left
  const sy = P.y + P.h;
  polyPath(ctx, [[P.x, sy - 210], [P.x + 330, sy], [P.x, sy]]); ctx.fillStyle = K.c2; ctx.fill();
  polyPath(ctx, [[P.x, sy - 250], [P.x + 400, sy], [P.x + 360, sy], [P.x, sy - 222]]); ctx.fillStyle = "#fff"; ctx.fill();
  polyPath(ctx, [[P.x, sy - 300], [P.x + 480, sy], [P.x + 418, sy], [P.x, sy - 262]]); ctx.fillStyle = K.c1; ctx.fill();
  ctx.restore();
  rr(ctx, P.x, P.y, P.w, P.h, 14); ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 3; ctx.stroke();
  // rookie shield + series
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
  polyPath(ctx, [[54, 50], [150, 50], [150, 128], [102, 152], [54, 128]]); ctx.fillStyle = K.c1; ctx.fill(); ctx.restore();
  polyPath(ctx, [[54, 50], [150, 50], [150, 128], [102, 152], [54, 128]]); ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = `italic 900 46px ${NF}`; ctx.fillText("RC", 102, 106); ctx.font = `800 11px ${CF}`; ctx.fillText(txt("rookieShield"), 102, 126);
  drawBadge(ctx, W - 74, 78, 30);
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,.7)"; ctx.shadowBlur = 5; ctx.font = `800 13px ${CF}`; ctx.fillText(txt("rookieSeries"), W - 74, 128); ctx.restore();
  ctx.textAlign = "left";
  // name bar
  const ny = P.y + P.h + 12;
  polyPath(ctx, [[30, ny], [W - 30, ny], [W - 54, ny + 70], [30, ny + 70]]); ctx.fillStyle = K.c2; ctx.fill();
  polyPath(ctx, [[W - 220, ny], [W - 30, ny], [W - 54, ny + 70], [W - 244, ny + 70]]); ctx.fillStyle = K.c1; ctx.fill();
  const nm = (card.name || "Your Name").toUpperCase();
  fitFont(ctx, nm, "italic 900", 46, NF, W - 300, 20); ctx.fillStyle = "#fff"; ctx.fillText(nm, 50, ny + 51);
  ctx.textAlign = "center"; fitFont(ctx, t.label, "italic 900", 30, NF, 150, 14); ctx.fillText(t.label, W - 136, ny + 34);
  ctx.font = `800 12px ${CF}`; ctx.fillText("POSITION", W - 138, ny + 56); ctx.textAlign = "left";
  // stat panel
  const sx = 30, sy2 = ny + 82, sw = W - 60, sh = H - 34 - sy2 - 26;
  rr(ctx, sx, sy2, sw, sh, 10); ctx.fillStyle = "rgba(255,255,255,.92)"; ctx.fill(); ctx.strokeStyle = "rgba(0,0,0,.2)"; ctx.lineWidth = 1.5; ctx.stroke();
  const m = card.attacks[0] || {};
  const cols = [["HP", String(card.hp || "")], ["SIGNATURE MOVE", m.name || "—"], ["DMG", m.dmg || "—"], ["STAGE", (card.stage || "BASIC").toUpperCase()]];
  const widths = [0.13, 0.5, 0.13, 0.24]; let cx = sx + 18;
  ctx.fillStyle = K.c2; ctx.fillRect(sx, sy2, sw, 26);
  cols.forEach(([k, v], i) => {
    const cw = (sw - 36) * widths[i];
    ctx.font = `800 13px ${CF}`; ctx.fillStyle = "#fff"; ctx.fillText(k, cx, sy2 + 18);
    fitFont(ctx, v, "italic 800", 30, NF, cw - 12, 12); ctx.fillStyle = "#111"; ctx.fillText(v, cx, sy2 + 60);
    cx += cw;
  });
  const rep = card.ability && card.ability.name ? `${card.ability.name}: ${card.ability.text}` : (m.text || card.flavor || "");
  ctx.font = `800 12px ${CF}`; ctx.fillStyle = K.c1 === "#ffffff" ? "#111" : K.c1; ctx.fillText("SCOUTING REPORT", sx + 18, sy2 + 86);
  ctx.font = `italic 500 15px ${CF}`; ctx.fillStyle = "#333"; wrap(ctx, rep, sw - 36).slice(0, 2).forEach((ln, i) => ctx.fillText(ln, sx + 18, sy2 + 106 + i * 19));
  drawFooter(ctx, false, 40, W - 40, H - 30);
}
