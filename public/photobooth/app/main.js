import { EVENT, key } from "./config.js";
import { saveToPhone } from "./booth/camera.js";
import { bindForm, buildTypePicker, fillForm, saveEvent, shuffleCard } from "./booth/editor.js";
import { fileName, saveCard } from "./booth/gallery.js";
import { exportCanvas, render } from "./booth/preview.js";
import { printSingle } from "./booth/print.js";
import { ls } from "./core/session.js";
import { $ } from "./core/util.js";
import { closeWall, openWall } from "./wall/wall.js";
/* Fill the page's event text (title, headings, labels) from event.json */
const fromEvent = (path) => path.split(".").reduce((o, k) => o?.[k], EVENT) ?? "";
document.title = EVENT.brand.appName;
document.querySelectorAll("[data-text]").forEach((el) => { el.textContent = fromEvent(el.dataset.text); });
document.querySelectorAll("[data-html]").forEach((el) => { el.innerHTML = fromEvent(el.dataset.html); }); // event.json is our own file
document.querySelectorAll("[data-placeholder]").forEach((el) => { el.placeholder = fromEvent(el.dataset.placeholder); });
document.querySelectorAll("[data-alt]").forEach((el) => { el.alt = fromEvent(el.dataset.alt); });

export function setBooth(on) { document.body.classList.toggle("booth", on); }
export const routeView = () => {
  const h = location.hash;
  document.body.classList.toggle("wall-mode", h === "#board");
  setBooth(h !== "#admin");
  setTimeout(() => (h === "#board" ? openWall() : closeWall()), 0);
};
routeView();
window.addEventListener("hashchange", routeView);
$("viewerClose").addEventListener("click", () => { $("viewer").hidden = true; });
$("randomBtn").addEventListener("click", shuffleCard);
$("saveBtn").addEventListener("click", saveCard);
$("dlBtn").addEventListener("click", () => saveToPhone(exportCanvas(1.5).toDataURL("image/png"), fileName()));
$("printBtn").addEventListener("click", async () => { const e = await saveCard(); printSingle([e.url]); });

/* ---------- Boot ---------- */
{ const qp = new URLSearchParams(location.search);
  if (qp.has("fresh")) { try { localStorage.removeItem(key("seen")); } catch {} qp.delete("fresh"); history.replaceState(null, "", location.pathname + (qp.toString() ? "?" + qp : "") + location.hash); } }
{ const qp = new URLSearchParams(location.search), code = qp.get("code");
  if (code) { ls.set(key("pass"), code.trim()); qp.delete("code"); history.replaceState(null, "", location.pathname + (qp.toString() ? "?" + qp : "") + location.hash); } }
buildTypePicker(); bindForm(); fillForm(); saveEvent(); render();
(document.fonts?.ready || Promise.resolve()).then(() => {
  Promise.all([`italic 900 60px "Playfair Display"`, `800 40px "Playfair Display"`, `italic 700 24px "Playfair Display"`, `800 40px "Barlow Condensed"`, `italic 800 20px "Barlow Condensed"`, `800 40px Rubik`, `700 30px Rubik`, `italic 400 16px Rubik`, `500 16px Rubik`, `400 16px Rubik`].map(f => document.fonts.load(f).catch(() => {}))).then(render);
});
