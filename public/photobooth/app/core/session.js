import { key } from "../config.js";
import { $ } from "./util.js";
/* ---------- Card Wall: post cards, everyone sees them ---------- */
export const API = "/api/cards";
export const ls = {
  get(k) { try { return localStorage.getItem(k) || ""; } catch { return ""; } },
  set(k, v) { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch {} },
};
export const getPass = () => ls.get(key("pass"));
export const getAdminKey = () => ls.get(key("admin"));
export const DEMO = new URLSearchParams(location.search).has("demo");
export const demoCards = new Map();
export function askCode(message) {
  return new Promise((resolve) => {
    const m = $("codeModal"), f = $("codeForm"), inp = $("codeInput");
    $("codeMsg").textContent = message || "It's shown at the booth. You only need to enter it once on this phone.";
    m.hidden = false; inp.value = ""; setTimeout(() => inp.focus(), 50);
    const done = (v) => { m.hidden = true; f.onsubmit = null; $("codeCancel").onclick = null; resolve(v); };
    f.onsubmit = (e) => { e.preventDefault(); const v = inp.value.trim(); if (!v) return; ls.set(key("pass"), v); done(v); };
    $("codeCancel").onclick = () => done(null);
  });
}
export async function ensureCode(msg) { return DEMO || getPass() ? true : !!(await askCode(msg)); }
/** A random id for this phone. The server also remembers the phone in its own cookie. */
export function deviceId() {
  let d = ls.get(key("device"));
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(d)) {
    d = crypto.randomUUID ? crypto.randomUUID()
      : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
    ls.set(key("device"), d);
  }
  return d;
}
export async function api(method, query = "", body, path = API) {
  const headers = { "x-pass": getPass(), "x-device": deviceId() };
  if (getAdminKey()) headers["x-admin"] = getAdminKey();
  if (body) headers["content-type"] = "application/json";
  try {
    const r = await fetch(path + query, { method, headers, body: body ? JSON.stringify(body) : undefined });
    let data = {}; try { data = await r.json(); } catch {}
    return { ok: r.ok, status: r.status, data };
  } catch { return { ok: false, status: 0, data: { error: "No connection. Check your Wi-Fi or data and try again." } }; }
}
