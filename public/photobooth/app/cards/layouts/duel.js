import { card, event } from "../../booth/state.js";
import { FOIL_TXT, SF, brushed, drawBadge, drawFooter, drawPhoto, effectText, energy, foilEdge, hexPath, holo, starShape, twinkle } from "../kit.js";
import { GOLD } from "../palettes.js";
import { PHOTO } from "../renderer.js";
import { EVERYONE, STAGES, TYPES, txt } from "../../config.js";
import { CF, H, NF, W, fitFont, lighten, metal, rgbaHex, rng, rr, shade, wrap } from "../../core/util.js";
export function drawDuel(ctx, D) {
  const t = TYPES[card.type] || TYPES[EVERYONE], P = PHOTO, U = D.du;
  const glow = lighten(U.frame, 0.45);
  // chrome outer border with a rainbow foil edge
  rr(ctx, 0, 0, W, H, 34); ctx.fillStyle = metal(ctx, 0, 0, W, H, ["#e4e7eb", "#6f757d", "#f6f7f9", "#4a4f56", "#c3c8cf"]); ctx.fill();
  brushed(ctx, false); foilEdge(ctx, 16, 0.6);
  // glowing frame body with a hex pattern
  ctx.save(); rr(ctx, 16, 16, W - 32, H - 32, 22); ctx.clip();
  const bg = ctx.createRadialGradient(W / 2, 260, 40, W / 2, 520, 820);
  bg.addColorStop(0, lighten(U.frame, 0.3)); bg.addColorStop(0.45, U.frame); bg.addColorStop(1, U.frame2);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(255,255,255,.09)"; ctx.lineWidth = 1.2;
  const hr = 22, hw = hr * Math.sqrt(3);
  for (let row = 0, y = 0; y < H + hr; row++, y += hr * 1.5) for (let x = (row % 2) * hw / 2; x < W + hw; x += hw) hexPath(ctx, x, y, hr), ctx.stroke();
  ctx.globalCompositeOperation = "screen";
  [[0.18, 0.18], [0.5, 0.1], [0.8, 0.14]].forEach(([c, a]) => {
    const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(c - 0.08, "rgba(255,255,255,0)"); g.addColorStop(c, `rgba(255,255,255,${a})`); g.addColorStop(c + 0.08, "rgba(255,255,255,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  });
  ctx.restore();
  rr(ctx, 16, 16, W - 32, H - 32, 22); ctx.strokeStyle = metal(ctx, 0, 0, W, H, GOLD); ctx.lineWidth = 2.5; ctx.stroke();
  // dark glass name plate with foil lettering
  rr(ctx, 40, 36, W - 148, 70, 12); ctx.fillStyle = "rgba(6,6,10,.55)"; ctx.fill();
  ctx.strokeStyle = metal(ctx, 40, 36, W - 108, 106, GOLD); ctx.lineWidth = 2.5; ctx.stroke();
  const nm = card.name || "Your Name";
  fitFont(ctx, nm, 800, 46, SF, W - 196, 20);
  ctx.save(); ctx.lineJoin = "round"; ctx.lineWidth = 5; ctx.strokeStyle = "rgba(0,0,0,.6)"; ctx.strokeText(nm, 62, 87); ctx.restore();
  ctx.fillStyle = metal(ctx, 62, 50, 62 + ctx.measureText(nm).width, 92, FOIL_TXT); ctx.fillText(nm, 62, 87);
  // attribute orb: the DH medallion, glowing
  ctx.save(); ctx.shadowColor = glow; ctx.shadowBlur = 24; ctx.beginPath(); ctx.arc(W - 70, 71, 33, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,.15)"; ctx.fill(); ctx.restore();
  drawBadge(ctx, W - 70, 71, 32);
  // stage + cluster chip on the left, glowing stars on the right
  const lvl = Math.min(8, 2 + Math.max(0, STAGES.indexOf(card.stage || "BASIC")) + (card.hp >= 150 ? 1 : 0));
  for (let i = 0; i < lvl; i++) {
    const sx = W - 66 - i * 38, sy = 134;
    ctx.save(); ctx.shadowColor = "rgba(255,200,80,.9)"; ctx.shadowBlur = 12;
    starShape(ctx, sx, sy, 15); ctx.fillStyle = metal(ctx, sx - 15, sy - 15, sx + 15, sy + 15, ["#fff7d6", "#f5c84c", "#fff1b0", "#c08a1c"]); ctx.fill(); ctx.restore();
    starShape(ctx, sx, sy, 15); ctx.strokeStyle = "rgba(90,50,0,.8)"; ctx.lineWidth = 1.5; ctx.stroke();
  }
  ctx.font = `800 14px ${CF}`; const chip = `${t.label}  ·  ${(card.stage || "BASIC").toUpperCase()}`, cw = ctx.measureText(chip).width + 46;
  rr(ctx, 40, 120, cw, 28, 14); ctx.fillStyle = "rgba(6,6,10,.5)"; ctx.fill(); ctx.strokeStyle = "rgba(255,230,170,.6)"; ctx.lineWidth = 1.2; ctx.stroke();
  energy(ctx, card.type, 56, 134, 10); ctx.fillStyle = "#fff"; ctx.fillText(chip, 72, 139);
  // gold-bevelled photo window with energy brackets
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,.55)"; ctx.shadowBlur = 16; ctx.shadowOffsetY = 4;
  ctx.fillStyle = metal(ctx, P.x - 14, P.y - 14, P.x + P.w + 14, P.y + P.h + 14, GOLD); ctx.fillRect(P.x - 14, P.y - 14, P.w + 28, P.h + 28); ctx.restore();
  ctx.fillStyle = "#0b0a0d"; ctx.fillRect(P.x - 4, P.y - 4, P.w + 8, P.h + 8);
  ctx.save(); ctx.beginPath(); ctx.rect(P.x, P.y, P.w, P.h); ctx.clip();
  drawPhoto(ctx, P, t, P.y + P.h / 2 + 12);
  ctx.globalCompositeOperation = "screen";
  let g = ctx.createRadialGradient(P.x + P.w / 2, P.y + P.h + 40, 0, P.x + P.w / 2, P.y + P.h + 40, P.w * 0.75);
  g.addColorStop(0, rgbaHex(U.frame, 0.45)); g.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = g; ctx.fillRect(P.x, P.y, P.w, P.h);
  ctx.globalCompositeOperation = "source-over";
  g = ctx.createRadialGradient(P.x + P.w / 2, P.y + P.h / 2, P.h * 0.35, P.x + P.w / 2, P.y + P.h / 2, P.h * 0.85);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.35)"); ctx.fillStyle = g; ctx.fillRect(P.x, P.y, P.w, P.h);
  if (card.holo) holo(ctx, P, 0.45);
  ctx.restore();
  ctx.save(); ctx.strokeStyle = "#fff"; ctx.shadowColor = glow; ctx.shadowBlur = 12; ctx.lineWidth = 3.5;
  [[P.x + 12, P.y + 12, 1, 1], [P.x + P.w - 12, P.y + 12, -1, 1], [P.x + 12, P.y + P.h - 12, 1, -1], [P.x + P.w - 12, P.y + P.h - 12, -1, -1]].forEach(([x, y, dx, dy]) => {
    ctx.beginPath(); ctx.moveTo(x + dx * 34, y); ctx.lineTo(x, y); ctx.lineTo(x, y + dy * 34); ctx.stroke();
  });
  ctx.restore();
  // edition strip
  const ey = P.y + P.h + 34;
  ctx.font = `800 14px ${CF}`; ctx.fillStyle = metal(ctx, 44, ey - 14, 300, ey, FOIL_TXT);
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,.6)"; ctx.shadowBlur = 4; ctx.fillText(txt("duelEdition"), 46, ey); ctx.restore();
  ctx.textAlign = "right"; ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.fillText(`${txt("duelSerialPrefix")}${String(event.num).padStart(3, "0")}`, W - 46, ey); ctx.textAlign = "left";
  // dark glass effect box
  const bx = 40, by = ey + 16, bw = W - 80, bh = 980 - by;
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4;
  rr(ctx, bx, by, bw, bh, 14); const bgb = ctx.createLinearGradient(0, by, 0, by + bh); bgb.addColorStop(0, shade(U.frame2, 0.55, 0.9)); bgb.addColorStop(1, shade(U.frame2, 0.8, 0.95));
  ctx.fillStyle = bgb; ctx.fill(); ctx.restore();
  rr(ctx, bx, by, bw, bh, 14); ctx.strokeStyle = metal(ctx, bx, by, bx + bw, by + bh, GOLD); ctx.lineWidth = 2.5; ctx.stroke();
  const spc = (card.species || txt("duelFallbackType")).replace(/\s*Type$/i, "");
  const tl = `[ ${t.label} / ${spc} / Effect ]`;
  fitFont(ctx, tl, 800, 21, SF, bw - 40, 13); ctx.fillStyle = "#f5d27a"; ctx.fillText(tl, bx + 20, by + 34);
  ctx.fillStyle = "rgba(245,210,122,.35)"; ctx.fillRect(bx + 20, by + 46, bw - 40, 1.5);
  const parts = effectText(), room = bh - 122;
  let fs = 18, lines;
  do { ctx.font = `500 ${fs}px ${CF}`; lines = []; parts.forEach(p => lines.push(...wrap(ctx, p, bw - 40))); fs -= 0.5; } while (lines.length * (fs + 5) > room && fs > 12);
  ctx.fillStyle = "rgba(255,255,255,.95)"; lines.slice(0, Math.floor(room / (fs + 5))).forEach((ln, i) => ctx.fillText(ln, bx + 20, by + 74 + i * (fs + 5)));
  // ATK / DEF pills
  const hp = +card.hp || 100, atk = Math.round((hp * 20) / 50) * 50, def = Math.round((hp * 15) / 50) * 50;
  const pill = (x, label, val, col) => {
    const pw = 190, ph = 44, py = by + bh - 58;
    rr(ctx, x, py, pw, ph, 22); const pg = ctx.createLinearGradient(0, py, 0, py + ph); pg.addColorStop(0, lighten(col, 0.15)); pg.addColorStop(1, col);
    ctx.fillStyle = pg; ctx.fill(); ctx.strokeStyle = metal(ctx, x, py, x + pw, py + ph, GOLD); ctx.lineWidth = 2; ctx.stroke();
    ctx.font = `800 15px ${CF}`; ctx.fillStyle = "#ffe39a"; ctx.fillText(label, x + 20, py + 28);
    ctx.textAlign = "right"; ctx.font = `800 32px ${NF}`; ctx.fillStyle = "#fff"; ctx.fillText(val, x + pw - 20, py + 34); ctx.textAlign = "left";
  };
  pill(bx + bw - 400, "ATK", String(atk), "#a3141c"); pill(bx + bw - 200, "DEF", String(def), "#1f4f9a");
  ctx.font = `600 13px ${CF}`; ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.fillText(`${card.hp || ""} HP`, bx + 20, by + bh - 30);
  ctx.fillText(`weak to ${card.weakTxt || "Mondays"}`.slice(0, 28), bx + 20, by + bh - 12);
  // sparkles
  const R = rng(61); for (let i = 0; i < 9; i++) twinkle(ctx, 30 + R() * (W - 60), 150 + R() * 40 + (i % 2) * 560, 2 + R() * 4, "#fff6c8");
  drawFooter(ctx, true, 40, W - 40, 1012);
}
