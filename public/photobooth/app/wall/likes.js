// Likes: one per phone per card. Counts arrive with the card list; this phone remembers
// which cards it liked so the heart stays filled in.
import { key } from "../config.js";
import { DEMO, api, ls } from "../core/session.js";
import { toast } from "../core/util.js";

let counts = null;                       // null = likes aren't switched on for this event
const listeners = new Set();
const liked = new Set((() => { try { return JSON.parse(ls.get(key("liked")) || "[]"); } catch { return []; } })());
const saveLiked = () => ls.set(key("liked"), JSON.stringify([...liked].slice(-2000)));
const notify = (id) => listeners.forEach((fn) => fn(id));

/** Call fn(id?) whenever like counts change. */
export const onLikes = (fn) => listeners.add(fn);
export const likesOn = () => counts !== null;
export const likeCount = (id) => counts?.get(id) || 0;
export const isLiked = (id) => liked.has(id);

/** Replace the counts with the server's (or null when the event has no likes). */
export function setCounts(obj) {
  if (obj === undefined) return;
  counts = obj ? new Map(Object.entries(obj).filter(([, n]) => Number.isFinite(n))) : null;
  notify();
}
/** Sample counts for ?demo, so the wall can be previewed with likes. */
export function demoCounts(ids) {
  if (counts) return;
  counts = new Map(ids.map((id, i) => [id, (i * 7 + 3) % 17]));
  notify();
}

/** A random id for this phone, so each phone can like a card once. */
export function deviceId() {
  let d = ls.get(key("device"));
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(d)) {
    d = crypto.randomUUID ? crypto.randomUUID()
      : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
    ls.set(key("device"), d);
  }
  return d;
}

/** Like or unlike a card. Updates at once, then confirms with the server. */
export async function toggleLike(id) {
  if (!counts || !id) return;
  const want = !liked.has(id), before = likeCount(id);
  want ? liked.add(id) : liked.delete(id);
  counts.set(id, Math.max(0, before + (want ? 1 : -1)));
  saveLiked(); notify(id);
  if (DEMO) return;
  const r = await api("POST", "", { id, device: deviceId(), liked: want }, "/api/likes");
  if (r.ok && Number.isFinite(r.data.likes)) { counts.set(id, r.data.likes); notify(id); return; }
  // didn't go through: put it back
  want ? liked.delete(id) : liked.add(id);
  counts.set(id, before); saveLiked(); notify(id);
  toast(r.data.error || "Couldn't save your like. Try again.");
}

/** The most-liked cards first (only cards with at least one like). */
export function topLiked(ids, n = 3) {
  return ids.filter((id) => likeCount(id) > 0).sort((a, b) => likeCount(b) - likeCount(a) || (a < b ? -1 : 1)).slice(0, n);
}
