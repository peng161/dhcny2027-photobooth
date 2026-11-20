// Likes: one per phone per card. Counts arrive with the card list; this phone remembers
// which cards it liked so the heart stays filled in.
import { key } from "../config.js";
import { DEMO, api, deviceId, ls } from "../core/session.js";
import { toast } from "../core/util.js";

let counts = null;                       // null = likes aren't switched on for this event
const listeners = new Set();
let pending = 0;                         // likes still on their way to the server
let liked = new Set((() => { try { return JSON.parse(ls.get(key("liked")) || "[]"); } catch { return []; } })());
const saveLiked = () => ls.set(key("liked"), JSON.stringify([...liked].slice(-2000)));
const notify = (id) => listeners.forEach((fn) => fn(id));

/** Call fn(id?) whenever like counts change. */
export const onLikes = (fn) => listeners.add(fn);
export const likesOn = () => counts !== null;
export const likeCount = (id) => counts?.get(id) || 0;
export const isLiked = (id) => liked.has(id);

/** Replace the counts with the server's (or null when the event has no likes).
 *  mine: the cards the server says this phone liked, which wins over what this phone remembers. */
export function setCounts(obj, mine) {
  if (obj === undefined) return;
  counts = obj ? new Map(Object.entries(obj).filter(([, n]) => Number.isFinite(n))) : null;
  if (Array.isArray(mine) && !pending) { liked = new Set(mine.filter((x) => typeof x === "string")); saveLiked(); }
  notify();
}
/** Sample counts for ?demo, so the wall can be previewed with likes. */
export function demoCounts(ids) {
  if (counts) return;
  counts = new Map(ids.map((id, i) => [id, (i * 7 + 3) % 17]));
  notify();
}

export { deviceId };

/** Like or unlike a card. Updates at once, then confirms with the server. */
export async function toggleLike(id) {
  if (!counts || !id) return;
  const want = !liked.has(id), before = likeCount(id);
  want ? liked.add(id) : liked.delete(id);
  counts.set(id, Math.max(0, before + (want ? 1 : -1)));
  saveLiked(); notify(id);
  if (DEMO) return;
  pending++;
  const r = await api("POST", "", { id, device: deviceId(), liked: want }, "/api/likes").finally(() => pending--);
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
