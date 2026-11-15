import { card, event } from "../../booth/state.js";
import { INKP, YEL, brushed, drawBadge, drawEscort, drawFooter, drawMoves, drawPhoto, drawStats, holo, polyPath, stripText, textFx } from "../kit.js";
import { PHOTO } from "../renderer.js";
import { EVENT, EVERYONE, TYPES } from "../../config.js";
import { CF, H, NF, W, fitFont, metal, rr, shade } from "../../core/util.js";
export function drawStrike(ctx, D) {
  const t = TYPES[card.type] || TYPES[EVERYONE], P = PHOTO, AC = D.accent || YEL, INKS = D.ink || INKP;
  const BAND = D.band || ["#ffe45c", "#ffd31a", "#fff1a0", "#f2b900", "#ffd31a"];
  // chrome border with rainbow holo
  rr(ctx, 0, 0, W, H, 34); ctx.fillStyle = metal(ctx, 0, 0, W, H, D.frame); ctx.fill();
  brushed(ctx, false);
  ctx.save();
  ctx.beginPath(); ctx.moveTo(34, 0); ctx.arcTo(W, 0, W, H, 34); ctx.arcTo(W, H, 0, H, 34); ctx.arcTo(0, H, 0, 0, 34); ctx.arcTo(0, 0, W, 0, 34); ctx.closePath();
  ctx.moveTo(40, 20); ctx.arcTo(20, 20, 20, H - 20, 20); ctx.arcTo(20, H - 20, W - 20, H - 20, 20); ctx.arcTo(W - 20, H - 20, W - 20, 20, 20); ctx.arcTo(W - 20, 20, 20, 20, 20); ctx.closePath();
  ctx.clip("evenodd");
  ctx.globalCompositeOperation = "overlay"; ctx.globalAlpha = 0.7;
  const hg = ctx.createLinearGradient(0, 0, W, H);
  ["#ff6ec4", "#7873f5", "#4adede", "#a6ff7a", "#ffe66d", "#ff8a5c", "#ff6ec4", "#4adede"].forEach((c, i, a) => hg.addColorStop(i / (a.length - 1), c));
  ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // photo is the hero
  ctx.save(); rr(ctx, P.x, P.y, P.w, P.h, 18); ctx.clip();
  drawPhoto(ctx, P, t, 420);
  if (card.holo) holo(ctx, P, 0.5);
  // slim name bar
  polyPath(ctx, [[22, 22], [728, 22], [728, 102], [472, 102], [446, 128], [22, 128]]); ctx.fillStyle = INKS; ctx.fill();
  // dark fade so the moves float on the photo
  const fade = ctx.createLinearGradient(0, 590, 0, H);
  fade.addColorStop(0, "rgba(8,10,16,0)"); fade.addColorStop(0.3, "rgba(8,10,16,.7)"); fade.addColorStop(1, "rgba(8,10,16,.93)");
  ctx.fillStyle = fade; ctx.fillRect(P.x, 590, P.w, H - 590);
  const tint = ctx.createLinearGradient(0, 700, 0, H); tint.addColorStop(0, shade(t.sym, 0.3, 0)); tint.addColorStop(1, shade(t.sym, 0.3, 0.3));
  ctx.fillStyle = tint; ctx.fillRect(P.x, 700, P.w, H - 700);
  if (card.monkey !== "off") { const mr = 42; drawEscort(ctx, card.monkey === "left" ? 120 : W - 104, 562, mr); }
  ctx.restore();

  // bold yellow angular corner pieces
  const band = (pts) => {
    polyPath(ctx, pts);
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
    ctx.fillStyle = metal(ctx, 0, 0, W, H, BAND); ctx.fill(); ctx.restore();
    polyPath(ctx, pts); ctx.strokeStyle = "#111"; ctx.lineWidth = 3; ctx.lineJoin = "miter"; ctx.stroke();
  };
  band([[22, 128], [446, 128], [472, 102], [500, 102], [462, 144], [42, 144], [42, 500], [22, 530]]); // top-left L
  band([[728, 470], [708, 496], [708, 1006], [540, 1006], [520, 1028], [728, 1028]]);                // bottom-right L
  rr(ctx, P.x, P.y, P.w, P.h, 18); ctx.strokeStyle = "#111"; ctx.lineWidth = 3; ctx.stroke();

  // stage pill + slanted banner
  ctx.font = `800 14px ${CF}`;
  const stg = card.stage || "BASIC", sw = ctx.measureText(stg).width + 22;
  rr(ctx, 40, 34, sw, 24, 12); ctx.fillStyle = metal(ctx, 40, 34, 40, 58, ["#ffffff", "#cfd4da", "#f4f6f8", "#9aa1aa"]); ctx.fill();
  ctx.fillStyle = "#111"; ctx.textBaseline = "middle"; ctx.fillText(stg, 51, 47); ctx.textBaseline = "alphabetic";
  const bx = 40 + sw + 12, bt = (event.banner || EVENT.brand.banner).toUpperCase();
  ctx.font = `italic 800 22px ${NF}`; const btw = Math.min(ctx.measureText(bt).width, 220) + 48;
  polyPath(ctx, [[bx + 12, 32], [bx + btw, 32], [bx + btw - 12, 60], [bx, 60]]);
  ctx.fillStyle = AC; ctx.fill(); ctx.strokeStyle = "#111"; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = "#111"; fitFont(ctx, bt, "italic 800", 22, NF, 220, 12); ctx.fillText(bt, bx + 24, 55);

  // HP + type orb
  drawBadge(ctx, W - 58, 62, 28);
  ctx.textAlign = "right";
  const hp = String(card.hp || ""); ctx.font = `800 54px ${NF}`; const hpW = ctx.measureText(hp).width;
  textFx(ctx, hp, W - 94, 82, true, "#fff");
  ctx.font = `800 16px ${CF}`; textFx(ctx, "HP", W - 98 - hpW, 80, true, AC);
  ctx.textAlign = "left";

  // name + chrome DH badge
  const nm = card.name || "Your Name";
  fitFont(ctx, nm, "italic 800", 42, CF, 300, 20);
  textFx(ctx, nm, 42, 112, true, "#fff");
  const nw = ctx.measureText(nm).width;
  ctx.save(); ctx.font = `italic 900 42px ${NF}`; ctx.lineJoin = "round";
  ctx.lineWidth = 9; ctx.strokeStyle = "#111"; ctx.strokeText("DH", 54 + nw, 112);
  ctx.lineWidth = 5; ctx.strokeStyle = "#d0161f"; ctx.strokeText("DH", 54 + nw, 112);
  ctx.fillStyle = metal(ctx, 0, 80, 0, 114, ["#ffffff", "#aab2bb", "#ffffff", "#7d858e"]); ctx.fillText("DH", 54 + nw, 112);
  ctx.restore();
  const st = stripText();
  ctx.save(); fitFont(ctx, st, "italic 600", 12, CF, 230, 8); ctx.fillStyle = "rgba(255,255,255,.8)";
  ctx.textAlign = "right"; ctx.fillText(st, W - 40, 96); ctx.restore();

  // moves float on the photo, a little smaller
  const k = 0.86, mt = 676, mb = 900;
  ctx.save(); ctx.translate(58, mt); ctx.scale(k, k);
  drawMoves(ctx, 0, (mb - mt) / k, true, 0, (W - 58 - 60) / k);
  ctx.restore();
  ctx.fillStyle = AC; ctx.fillRect(58, 906, W - 136, 1.5);
  ctx.save(); ctx.translate(46, 918); ctx.scale(0.9, 0.9); drawStats(ctx, 12, true, 0, (W - 140) / 0.9); ctx.restore();
  drawFooter(ctx, true, 46, W - 64, 994);
}
