import { gallery } from "./gallery.js";
import { $, toast } from "../core/util.js";
/* ---------- Printing ---------- */
export function setPage(css) {
  let s = $("page-style");
  if (!s) { s = document.createElement("style"); s.id = "page-style"; document.head.append(s); }
  s.textContent = css;
}
export function printSingle(urls) {
  const mode = $("printSize").value;
  const root = $("print-root");
  let pw, ph, cw;
  if (mode === "4x6-actual") { pw = 4; ph = 6; cw = 2.5; setPage("@page { size: 4in 6in; margin: 0; }"); }
  else if (mode === "4x6-big") { pw = 4; ph = 6; cw = 3.8; setPage("@page { size: 4in 6in; margin: 0; }"); }
  else { pw = 7.5; ph = 10; cw = 2.5; setPage("@page { margin: 0.5in; }"); }
  root.innerHTML = urls.map(u => `<div class="p-page" style="width:${pw}in;height:${ph}in"><img src="${u}" style="width:${cw}in;height:${cw * 1.4}in"></div>`).join("");
  doPrint();
}
export function printSheet() {
  const sel = gallery.filter(c => c.selected);
  if (!sel.length) { toast("Select cards first: click a saved card to select it"); return; }
  const paper = $("paper").value;
  setPage(`@page { size: ${paper === "A4" ? "A4" : "letter"}; margin: 0.25in; }`);
  const pages = [];
  for (let i = 0; i < sel.length; i += 9) pages.push(sel.slice(i, i + 9));
  $("print-root").innerHTML = pages.map(p => `<div class="p-page"><div class="p-sheet">${p.map(c => `<img src="${c.url}">`).join("")}</div></div>`).join("");
  doPrint();
}
export function doPrint() {
  const imgs = [...$("print-root").querySelectorAll("img")];
  Promise.all(imgs.map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))).then(() => setTimeout(() => window.print(), 50));
}
window.addEventListener("afterprint", () => { $("print-root").innerHTML = ""; });
