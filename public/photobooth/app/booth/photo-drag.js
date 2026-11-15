import { cycleDesign, setColor } from "./editor.js";
import { cv, render } from "./preview.js";
import { card, photo } from "./state.js";
import { $, H, W, toast } from "../core/util.js";
/* ---------- Photo drag/zoom on card ---------- */
export function toCard(e) {
  const r = cv.getBoundingClientRect();
  return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
}
/* Swipe the card to change design; "Move photo" mode drags the photo instead */
export let drag = null, swipe = null, panMode = false;
export function setPan(on) {
  panMode = on && !!photo.img;
  $("tilt").classList.toggle("pan", panMode);
  $("panBtn").classList.toggle("on", panMode); $("panBtn").setAttribute("aria-pressed", String(panMode));
  $("panBtn").textContent = panMode ? "✓ Done moving" : "✋ Move photo";
  $("hint").textContent = panMode ? "Drag the photo inside the window to reposition it" : "Swipe the card left or right for a new design · tap a colour below";
}
$("panBtn").addEventListener("click", () => { if (!photo.img) { toast("Take a photo first"); return; } setPan(!panMode); });
cv.addEventListener("pointerdown", (e) => {
  if (panMode) {
    const p = toCard(e);
    drag = { x: p.x, y: p.y, ox: photo.ox, oy: photo.oy };
    cv.setPointerCapture(e.pointerId);
    return;
  }
  swipe = { x: e.clientX, y: e.clientY };
});
cv.addEventListener("pointerup", (e) => {
  if (swipe) {
    const dx = e.clientX - swipe.x, dy = e.clientY - swipe.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) cycleDesign(dx < 0 ? 1 : -1);
    else if (e.pointerType === "mouse" && Math.abs(dy) > 40 && Math.abs(dy) > Math.abs(dx) * 1.2) setColor((card.color | 0) + (dy < 0 ? 1 : -1));
  }
  swipe = null; drag = null;
});
cv.addEventListener("pointercancel", () => { swipe = null; drag = null; });
cv.addEventListener("pointermove", (e) => {
  if (drag) { photo.userMoved = true; const p = toCard(e); photo.ox = drag.ox + (p.x - drag.x); photo.oy = drag.oy + (p.y - drag.y); render(); return; }
  if (e.pointerType !== "mouse" || swipe) return;
  if (!card.holo || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const r = cv.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
  $("tilt").style.transform = `rotateY(${px * 10}deg) rotateX(${-py * 10}deg)`;
  $("tilt").querySelector(".shine").style.backgroundPosition = `${50 + px * 80}% ${50 + py * 80}%`;
});
cv.addEventListener("pointerleave", () => { if (!drag) $("tilt").style.transform = ""; });
cv.addEventListener("wheel", (e) => {
  if (!photo.img) return;
  e.preventDefault();
  photo.zoom = Math.max(1, Math.min(3, photo.zoom * (e.deltaY < 0 ? 1.05 : 0.95)));
  $("zoom").value = photo.zoom; render();
}, { passive: false });
$("zoom").addEventListener("input", (e) => { photo.zoom = +e.target.value; render(); });
