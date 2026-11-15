import { card } from "./state.js";
import { drawCard } from "../cards/renderer.js";
import { $, H, W } from "../core/util.js";
/* ---------- Preview ---------- */
export const cv = $("card"), cx = cv.getContext("2d");
export let raf = 0;
export function render() {
  if (raf) return;
  raf = requestAnimationFrame(() => { raf = 0; drawCard(cx, 1); $("tilt").classList.toggle("holo", card.holo); });
}
export function exportCanvas(scale = 1.5) {
  const c = document.createElement("canvas");
  c.width = W * scale; c.height = H * scale;
  drawCard(c.getContext("2d"), scale);
  return c;
}
