import { card, event } from "../../booth/state.js";
import { drawBadge, drawFooter, drawMoves, drawPhoto, holo, stripText, textFx } from "../kit.js";
import { PHOTO } from "../renderer.js";
import { EVERYONE, TYPES, txt } from "../../config.js";
import { ls } from "../../core/session.js";
import { CF, H, NF, W, fitFont, rng, rr, wrap } from "../../core/util.js";
/* ---------- Magazine Cover: full photo with a masthead and cover lines ---------- */
export function drawCover(ctx, D) {
  const t = TYPES[card.type] || TYPES[EVERYONE], P = PHOTO, C = D.cv, M = C.mast;
  rr(ctx, 0, 0, W, H, 34); ctx.fillStyle = "#f4f2ee"; ctx.fill();
  ctx.save(); rr(ctx, P.x, P.y, P.w, P.h, 18); ctx.clip();
  drawPhoto(ctx, P, t, 470);
  let g = ctx.createLinearGradient(0, P.y, 0, P.y + 300); g.addColorStop(0, "rgba(0,0,0,.55)"); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fillRect(P.x, P.y, P.w, 300);
  g = ctx.createLinearGradient(0, 600, 0, H); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(0.4, "rgba(0,0,0,.62)"); g.addColorStop(1, "rgba(0,0,0,.92)");
  ctx.fillStyle = g; ctx.fillRect(P.x, 600, P.w, H - 600);
  g = ctx.createLinearGradient(P.x, 0, P.x + 380, 0); g.addColorStop(0, "rgba(0,0,0,.45)"); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fillRect(P.x, 260, 380, 400);
  if (card.holo) holo(ctx, P, 0.35);
  // top line + masthead
  ctx.font = `700 14px ${CF}`; ctx.fillStyle = "rgba(255,255,255,.95)";
  ctx.fillText(txt("coverTopLine"), 46, 60);
  ctx.textAlign = "right"; ctx.fillText(`ISSUE ${String(event.num).padStart(3, "0")}  ·  ${txt("coverPrice")}`, W - 46, 60); ctx.textAlign = "left";
  fitFont(ctx, txt("coverMasthead"), "900", 210, NF, W - 92, 80);
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6; ctx.fillStyle = M; ctx.fillText(txt("coverMasthead"), 40, 226); ctx.restore();
  // HP sticker under the badge
  drawBadge(ctx, W - 76, 282, 30);
  rr(ctx, W - 170, 326, 124, 44, 10); ctx.fillStyle = M; ctx.fill();
  ctx.fillStyle = C.mastInk; ctx.textAlign = "center"; ctx.font = `800 30px ${NF}`; ctx.fillText(`${card.hp || ""} HP`, W - 108, 358); ctx.textAlign = "left";
  // cover lines
  const m = card.attacks[0] || {};
  const lines = [["EXCLUSIVE", txt("coverExclusive", { team: t.label })], ["SPECIAL MOVE", `${m.name || "Secret move"}${m.dmg ? " · " + m.dmg : ""}`],
    [card.ability && card.ability.name ? "ABILITY" : "PLUS", (card.ability && card.ability.name) || card.species || txt("coverFallback")], ["WEAKNESS", card.weakTxt || "Monday mornings"]];
  let y = 322;
  for (const [k, v] of lines) {
    ctx.font = `800 26px ${NF}`; const ls = wrap(ctx, String(v).toUpperCase(), 320).slice(0, 2);
    if (y + 30 + ls.length * 28 > 700) break;
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,.75)"; ctx.shadowBlur = 6;
    ctx.font = `800 15px ${CF}`; ctx.fillStyle = M; ctx.fillText(k, 50, y);
    ctx.font = `800 26px ${NF}`; ctx.fillStyle = "#fff"; ls.forEach((ln, i) => ctx.fillText(ln, 50, y + 30 + i * 28));
    ctx.restore(); y += 30 + ls.length * 28 + 20;
  }
  // cover star
  const nm = card.name || "Your Name";
  fitFont(ctx, nm, 800, 66, CF, W - 100, 26); textFx(ctx, nm, 46, 774, true, "#fff");
  ctx.save(); fitFont(ctx, stripText(), "italic 600", 15, CF, W - 100, 10); ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.fillText(stripText(), 48, 802); ctx.restore();
  // one move, compact
  const sv = [card.ability, card.attack2]; card.ability = null; card.attack2 = false;
  ctx.save(); ctx.translate(48, 818); ctx.scale(0.8, 0.8); drawMoves(ctx, 0, 112 / 0.8, true, 0, (W - 96) / 0.8); ctx.restore();
  card.ability = sv[0]; card.attack2 = sv[1];
  // barcode
  const bx = W - 178, by = 936;
  ctx.fillStyle = "#fff"; ctx.fillRect(bx, by, 130, 60);
  const R = rng(event.num || 7); ctx.fillStyle = "#111";
  for (let x = bx + 8; x < bx + 122;) { const w = 1 + Math.floor(R() * 3); ctx.fillRect(x, by + 6, w, 36); x += w + 1 + Math.floor(R() * 3); }
  ctx.font = `700 11px ${NF}`; ctx.textAlign = "center"; ctx.fillText(`${txt("coverBarcode")} ${String(event.num).padStart(3, "0")}`, bx + 65, by + 55); ctx.textAlign = "left";
  ctx.restore();
  rr(ctx, P.x, P.y, P.w, P.h, 18); ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.lineWidth = 1.5; ctx.stroke();
  drawFooter(ctx, true, 46, W - 200, 1004);
}
