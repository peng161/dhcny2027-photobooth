// Likes on Card Wall cards: one like per phone per card. Needs the event code.
// POST { id, device, liked } -> { id, likes, liked }
import { ID_RE, db, guard, json, limited } from "../../lib/guard.js";

const DEVICE_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const g = guard(request, env, url);
  if (g.res) return g.res;
  if (request.method !== "POST") return json({ error: "Not supported." }, 405, { allow: "POST" });
  const D = await db(env);
  if (!D) return json({ error: "Likes aren't switched on for this event." }, 501);
  if (limited(`like:${g.ip}`, 600, 10 * 60_000)) return json({ error: "Lots of likes from this network just now. Try again in a minute." }, 429, { "retry-after": "60" });
  if (!(request.headers.get("content-type") || "").includes("application/json") || +(request.headers.get("content-length") || 0) > 2000) {
    return json({ error: "Bad request." }, 400);
  }
  let body;
  try { body = JSON.parse(await request.text()); } catch { return json({ error: "Bad request." }, 400); }
  const id = typeof body?.id === "string" ? body.id : "", device = typeof body?.device === "string" ? body.device.toLowerCase() : "";
  if (!ID_RE.test(id) || !DEVICE_RE.test(device) || typeof body?.liked !== "boolean") return json({ error: "Bad request." }, 400);
  const exists = await D.prepare("SELECT 1 AS ok FROM cards WHERE id = ?").bind(id).first();
  if (!exists) return json({ error: "That card isn't on the wall any more." }, 404);
  const change = body.liked
    ? D.prepare("INSERT OR IGNORE INTO likes (card, device, at) VALUES (?, ?, ?)").bind(id, device, Date.now())
    : D.prepare("DELETE FROM likes WHERE card = ? AND device = ?").bind(id, device);
  const [, count] = await D.batch([change, D.prepare("SELECT COUNT(*) AS n FROM likes WHERE card = ?").bind(id)]);
  return json({ id, likes: count.results[0]?.n ?? 0, liked: body.liked });
}
