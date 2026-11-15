export const W = 750, H = 1050;
export const $ = (id) => document.getElementById(id);

export const pick = (a) => a[Math.floor(Math.random() * a.length)];
export const shuffled = (a) => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]);

/* ---------- State ---------- */
export const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

/* ---------- Drawing helpers ---------- */
export const CF = '"Rubik", "Avenir Next", "Helvetica Neue", Arial, sans-serif';
export const NF = '"Barlow Condensed", "Rubik", "Arial Narrow", sans-serif';
export const CJK = '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif';
export function rng(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
export function metal(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
  return g;
}
export const hexRgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
export function lighten(hex, a) { const [r, g, b] = hexRgb(hex); const f = (c) => Math.round(c + (255 - c) * a); return `rgb(${f(r)},${f(g)},${f(b)})`; }
export function shade(hex, a, alpha = 1) { const [r, g, b] = hexRgb(hex); const f = (c) => Math.round(c * (1 - a)); return `rgba(${f(r)},${f(g)},${f(b)},${alpha})`; }
export function wrap(ctx, text, maxW) {
  const words = String(text).split(/\s+/).filter(Boolean), lines = [];
  let line = "";
  for (const w of words) {
    const t = line ? line + " " + w : w;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}
export function fitFont(ctx, text, weight, size, family, maxW, min = 14) {
  let s = size;
  do { ctx.font = `${weight} ${s}px ${family}`; s -= 1; } while (ctx.measureText(text).width > maxW && s > min);
}

/* ---------- Illustration Art: the photo is everything, minimal text on top ---------- */
export const rgbaHex = (hex, a) => { const [r, g, b] = hexRgb(hex); return `rgba(${r},${g},${b},${a})`; };

/* ---------- Duel card: coloured frame, level stars, effect box, ATK / DEF ---------- */
export const lumHex = (h) => { const [r, g, b] = hexRgb(h); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };

/* ---------- Misc UI ---------- */
export let tt;
export function toast(msg) { const t = $("toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("on"), 2600); }
