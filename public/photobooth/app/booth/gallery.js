import { EVENT } from "../config.js";
import { saveToPhone } from "./camera.js";
import { saveEvent } from "./editor.js";
import { exportCanvas, render } from "./preview.js";
import { printSheet, printSingle } from "./print.js";
import { card, event } from "./state.js";
import { $, toast } from "../core/util.js";
/* ---------- Gallery (kept in IndexedDB so a page refresh doesn't lose cards) ---------- */
export let gallery = [];
export let db = null;
export function openDB() {
  return new Promise((res) => {
    try {
      const rq = indexedDB.open(EVENT.storage.galleryDb, 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore("cards", { keyPath: "id" });
      rq.onsuccess = () => res(rq.result);
      rq.onerror = () => res(null);
    } catch { res(null); }
  });
}
export function dbOp(mode, fn) {
  if (!db) return Promise.resolve(null);
  return new Promise((res) => {
    try {
      const tx = db.transaction("cards", mode), st = tx.objectStore("cards");
      const rq = fn(st);
      tx.oncomplete = () => res(rq?.result ?? null);
      tx.onerror = () => res(null);
    } catch { res(null); }
  });
}
export function renderGallery() {
  const g = $("gallery");
  g.innerHTML = "";
  if (!gallery.length) { g.innerHTML = '<div class="empty" style="grid-column:1/-1">Saved cards appear here. Select several to print them 9 to a page.</div>'; return; }
  gallery.slice().reverse().forEach((c) => {
    const f = document.createElement("figure");
    if (c.selected) f.classList.add("selected");
    const img = document.createElement("img"); img.src = c.url; img.alt = c.name; img.title = "Click to select for the print sheet";
    img.addEventListener("click", () => { c.selected = !c.selected; f.classList.toggle("selected", c.selected); });
    const acts = document.createElement("div"); acts.className = "acts";
    const mk = (label, fn) => { const b = document.createElement("button"); b.className = "btn"; b.type = "button"; b.textContent = label; b.addEventListener("click", fn); return b; };
    acts.append(
      mk("Print", () => printSingle([c.url])),
      mk("Save", () => saveToPhone(c.url, c.file)),
      mk("✕", async () => { gallery = gallery.filter(x => x !== c); await dbOp("readwrite", st => st.delete(c.id)); renderGallery(); }),
    );
    f.append(img, acts); g.append(f);
  });
}
export function fileName() {
  return `card-${String(event.num).padStart(3, "0")}-${(card.name || "guest").replace(/[^\w-]+/g, "_")}.png`;
}
export async function saveCard() {
  const url = exportCanvas(1.5).toDataURL("image/png");
  const entry = { id: Date.now() + "-" + Math.random().toString(36).slice(2, 6), url, name: card.name, file: fileName(), selected: true };
  gallery.push(entry);
  await dbOp("readwrite", st => st.put({ id: entry.id, url, name: entry.name, file: entry.file }));
  event.num = Math.min(999, event.num + 1); $("e-num").value = event.num; saveEvent();
  renderGallery(); render();
  toast(`Saved ${entry.name || "card"}`);
  return entry;
}
export function download(url, name) {
  const a = document.createElement("a"); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
}
$("printSheetBtn").addEventListener("click", printSheet);
$("selAllBtn").addEventListener("click", () => { const all = gallery.every(c => c.selected); gallery.forEach(c => c.selected = !all); renderGallery(); });
export const clearBtn = $("clearBtn");
clearBtn.addEventListener("click", async () => {
  if (clearBtn.dataset.armed) {
    gallery = []; await dbOp("readwrite", st => st.clear()); renderGallery();
    delete clearBtn.dataset.armed; clearBtn.textContent = "Clear all"; toast("All saved cards removed");
  } else {
    clearBtn.dataset.armed = "1"; clearBtn.textContent = "Click again to delete all";
    setTimeout(() => { delete clearBtn.dataset.armed; clearBtn.textContent = "Clear all"; }, 3000);
  }
});
openDB().then(async (d) => {
  db = d;
  const rows = (await dbOp("readonly", st => st.getAll())) || [];
  gallery = rows.sort((a, b) => a.id.localeCompare(b.id)).map(r => ({ ...r, selected: false }));
  renderGallery();
});
