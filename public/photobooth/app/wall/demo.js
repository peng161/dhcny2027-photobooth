import { fillForm, shuffleCard } from "../booth/editor.js";
import { exportCanvas, render } from "../booth/preview.js";
import { card, event, photo } from "../booth/state.js";
import { COLORS, DESIGNS, DESIGN_DEFAULTS } from "../cards/designs.js";
import { TEAM_KEYS } from "../config.js";
import { demoCards } from "../core/session.js";
import { rng } from "../core/util.js";
/* --- demo cards, so the wall can be previewed before anyone posts --- */
export function demoAvatar(i) {
  const R = rng(i * 31 + 7), c = document.createElement("canvas"); c.width = 900; c.height = 1200;
  const g = c.getContext("2d"), hue = Math.floor(R() * 360);
  const bg = g.createLinearGradient(0, 0, 0, 1200); bg.addColorStop(0, `hsl(${hue},45%,72%)`); bg.addColorStop(1, `hsl(${(hue + 40) % 360},35%,40%)`);
  g.fillStyle = bg; g.fillRect(0, 0, 900, 1200);
  const skins = ["#f1c9a5", "#e0ac84", "#c68c63", "#8d5a3b", "#f6d6bd"], hair = ["#1d130d", "#2a1b12", "#4a2f1d", "#121212"];
  const people = R() < 0.3 ? 2 : 1;
  for (let p = 0; p < people; p++) {
    const x = people === 1 ? 450 : 290 + p * 320, s = people === 1 ? 1 : 0.8;
    g.fillStyle = `hsl(${Math.floor(R() * 360)},50%,45%)`; g.beginPath(); g.ellipse(x, 1180, 300 * s, 440 * s, 0, 0, 7); g.fill();
    g.fillStyle = skins[Math.floor(R() * skins.length)]; g.beginPath(); g.ellipse(x, 470, 140 * s, 175 * s, 0, 0, 7); g.fill();
    g.fillStyle = hair[Math.floor(R() * hair.length)]; g.beginPath(); g.ellipse(x, 470 - 115 * s, 155 * s, 105 * s, 0, Math.PI, 0); g.fill();
    g.fillStyle = "#1a1a1a"; g.beginPath(); g.arc(x - 50 * s, 470, 13 * s, 0, 7); g.arc(x + 50 * s, 470, 13 * s, 0, 7); g.fill();
    g.strokeStyle = "#7a2f22"; g.lineWidth = 8 * s; g.beginPath(); g.arc(x, 535 * (1 + (s - 1) * 0.02), 48 * s, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke();
  }
  return new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.src = c.toDataURL("image/jpeg", 0.85); });
}
export async function makeDemoCard(i, forceType) {
  const names = ["Ada Tan", "Marcus Lim", "Priya Nair", "Jun Wei", "Siti Rahman", "Kevin & Mei", "Daniel Ong", "Hui Min", "Ravi Kumar", "Grace Teo", "Faizal", "Chloe Ng", "Wei Ling", "Arjun & Bala"];
  const keys = Object.keys(DESIGNS);
  photo.img = await demoAvatar(i); photo.zoom = 1; photo.ox = 0; photo.oy = 0; photo.userMoved = false;
  card.type = forceType || TEAM_KEYS[i % TEAM_KEYS.length]; card.frame = keys[i % keys.length]; Object.assign(card, DESIGN_DEFAULTS[card.frame]); card.color = Math.floor(Math.random() * (COLORS[card.frame] || [1]).length);
  shuffleCard(); card.name = names[i % names.length]; event.num = 1 + ((i * 17) % 199);
  demoCards.set("demo" + String(i).padStart(3, "0") + "-" + card.type, exportCanvas(0.6).toDataURL("image/jpeg", 0.85));
}
export async function makeDemoCards(n) {
  const saved = { card: JSON.parse(JSON.stringify(card)), photo: { ...photo }, num: event.num };
  for (let i = 0; i < n; i++) await makeDemoCard(i);
  Object.assign(card, saved.card); Object.assign(photo, saved.photo); event.num = saved.num; fillForm(); render();
}
