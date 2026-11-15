import { EVERYONE, PACK_SERIES, SERIES_LINE, asset, key, txt } from "../config.js";
import { DEMO } from "../core/session.js";
import { CF, fitFont } from "../core/util.js";
import { PACK_SIZE } from "./wall.js";
export const packArt = {};
export function loadImg(src) { return new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; }); }
export async function getPackArt(key) {
  if (packArt[key]) return packArt[key];
  const im = await loadImg(`${asset(`pack-${PACK_SERIES[key] ? key : EVERYONE}.webp`)}?v=3`); if (!im) return null;
  const Wd = im.naturalWidth, Ht = im.naturalHeight;
  const c = document.createElement("canvas"); c.width = Wd; c.height = Ht;
  const g = c.getContext("2d"); g.drawImage(im, 0, 0);
  const sample = (x, y) => { const d = g.getImageData(Math.round(x), Math.round(y), 1, 1).data; return `rgb(${d[0]},${d[1]},${d[2]})`; };
  const spaced = (txt, x, y, px, sp, color, weight = 700, family = CF) => {
    g.font = `${weight} ${px}px ${family}`; g.fillStyle = color; g.textAlign = "center"; g.textBaseline = "alphabetic";
    try { g.letterSpacing = `${sp}px`; } catch {}
    g.fillText(txt, x, y);
    try { g.letterSpacing = "0px"; } catch {}
  };
  if (key === EVERYONE || !PACK_SERIES[key]) {
    // DH unity pack: rewrite the whole label panel
    const k = Wd / 1105;
    g.save(); g.scale(k, k);
    g.fillStyle = "#120d0c";
    g.beginPath(); g.moveTo(292, 1656); g.lineTo(812, 1656); g.lineTo(836, 1725); g.lineTo(812, 1794); g.lineTo(292, 1794); g.lineTo(268, 1725); g.closePath(); g.fill();
    spaced(SERIES_LINE, 552, 1694, 24, 5, "#e3b54f");
    fitFont(g, txt("packBrand"), 800, 84, `"Bricolage Grotesque", ${CF}`, 480, 40);
    const tg = g.createLinearGradient(0, 1712, 0, 1776); tg.addColorStop(0, "#fff0b8"); tg.addColorStop(1, "#e3b54f");
    g.fillStyle = tg; g.textAlign = "center"; g.fillText(txt("packBrand"), 552, 1774);
    g.restore();
  } else {
    // cluster packs: only the series line changes
    const y = Ht * 0.8088, h = Ht * 0.024, w = Wd * 0.5;
    g.fillStyle = sample(Wd * 0.235, y - h * 0.2);
    g.fillRect(Wd / 2 - w / 2, y - h * 0.62, w, h);
    const px = Math.round(Ht * 0.0128);
    g.font = `700 ${px}px ${CF}`;
    let sp = Math.round(px * 0.32);
    try { g.letterSpacing = `${sp}px`; while (g.measureText(SERIES_LINE).width > w * 0.98 && sp > 1) { sp--; g.letterSpacing = `${sp}px`; } g.letterSpacing = "0px"; } catch {}
    spaced(SERIES_LINE, Wd / 2, y + px * 0.38, px, sp, "#e3b54f");
  }
  // "N RANDOM CARDS" line, matching the pack size
  {
    const S = PACK_SERIES[key] || PACK_SERIES[EVERYONE], y = Ht * 0.9224, h = Ht * 0.021, w = Wd * 0.8;
    // blend the patch into the background: sample the plain dark area just below the line
    const x0 = Wd / 2 - w / 2, hg = g.createLinearGradient(x0, 0, x0 + w, 0);
    for (let t = 0; t <= 1.0001; t += 0.125) hg.addColorStop(Math.min(1, t), sample(x0 + t * (w - 1), y + h * 0.85));
    g.fillStyle = hg; g.fillRect(x0, y - h * 0.62, w, h * 1.1);
    const line = `${PACK_SIZE} RANDOM CARDS · ${S.tag}`, px = Math.round(Ht * 0.0142);
    g.font = `700 ${px}px ${CF}`;
    let sp = Math.round(px * 0.18);
    try { g.letterSpacing = `${sp}px`; while (g.measureText(line).width > w * 0.98 && sp > 0) { sp--; g.letterSpacing = `${sp}px`; } g.letterSpacing = "0px"; } catch {}
    spaced(line, Wd / 2, y + px * 0.36, px, sp, "#f4ece0");
  }
  g.textAlign = "left";
  packArt[key] = c.toDataURL("image/jpeg", 0.92);
  return packArt[key];
}
export const clusterOf = (id) => { const k = String(id).split("-").pop(); return PACK_SERIES[k] ? k : null; };
export function packKeyFor(ids) {
  const count = {};
  ids.forEach(id => { const k = clusterOf(id); if (k) count[k] = (count[k] || 0) + 1; });
  const best = Object.entries(count).sort((a, b) => b[1] - a[1])[0];
  // mixed pack: always the all-clusters One DH pack
  if (!best || best[1] <= ids.length / 2) return EVERYONE;
  // clear majority: usually that cluster's series, but about 1 in 3 packs surprise as One DH (the demo stays predictable)
  return !DEMO && Math.random() < 0.33 ? EVERYONE : best[0];
}
window.__packArt = getPackArt;
