// Card Wall API on Cloudflare Pages Functions. Card images live in Workers KV (binding CARDS);
// the card index and likes live in D1 (binding DB) when it is set up.
// Access needs the event code (BOARD_PASS); deleting needs the organiser key (ADMIN_KEY).
import { ID_RE, SEC, db, guard, json, limited, phone } from "../../lib/guard.js";

const MAX_BYTES = 2_500_000;          // decoded JPEG
const MAX_BODY = 3_600_000;           // base64 JSON body

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const g = guard(request, env, url);
  if (g.res) return g.res;
  const { ip, isAdmin, imageGet } = g;
  const kv = env.CARDS;

  if (request.method === "GET") {
    if (imageGet) {
      const id = url.searchParams.get("id");
      if (!ID_RE.test(id)) return new Response("Not found", { status: 404, headers: SEC });
      const data = await kv.get(id, { type: "arrayBuffer" });
      if (!data) return new Response("Not found", { status: 404, headers: SEC });
      return new Response(data, { headers: { ...SEC, "content-type": "image/jpeg", "content-disposition": "inline", "content-security-policy": "default-src 'none'; sandbox", "cache-control": "private, max-age=86400" } });
    }
    const D = await db(env);
    if (D) {
      const { device, cookie } = phone(request);
      const [cards, likes, mine] = await D.batch([
        D.prepare("SELECT id FROM cards ORDER BY id LIMIT 500"),                       // ids sort newest first
        D.prepare("SELECT card, COUNT(*) AS n FROM likes GROUP BY card"),
        D.prepare("SELECT card FROM likes WHERE device = ?").bind(device),            // what this phone already liked
      ]);
      return json({
        cards: cards.results.map((r) => r.id).filter((n) => ID_RE.test(n)),
        likes: Object.fromEntries(likes.results.map((r) => [r.card, r.n])),
        mine: mine.results.map((r) => r.card),
      }, 200, cookie);
    }
    const { keys } = await kv.list({ limit: 1000 });
    return json({ cards: keys.map((k) => k.name).filter((n) => ID_RE.test(n)).sort().slice(0, 500), likes: null });
  }

  if (request.method === "POST") {
    if (!isAdmin && limited(`post:${ip}`, 80, 10 * 60_000)) return json({ error: "Lots of cards from this network just now. Wait a few minutes, then post again." }, 429, { "retry-after": "300" });
    const len = +(request.headers.get("content-length") || 0);
    if (len > MAX_BODY) return json({ error: "That card is too large to post." }, 413);
    if (!(request.headers.get("content-type") || "").includes("application/json")) return json({ error: "Only card images can be posted." }, 415);
    let body;
    try { const text = await request.text(); if (text.length > MAX_BODY) return json({ error: "That card is too large to post." }, 413); body = JSON.parse(text); }
    catch { return json({ error: "The card didn't arrive. Try posting again." }, 400); }
    const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/]+={0,2})$/.exec(typeof body?.image === "string" ? body.image : "");
    if (!m) return json({ error: "Only card images can be posted." }, 400);
    let bin;
    try { bin = atob(m[1]); } catch { return json({ error: "Only card images can be posted." }, 400); }
    if (bin.length > MAX_BYTES) return json({ error: "That card is too large to post." }, 413);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    // must really be a JPEG: starts with FF D8 FF and ends with FF D9
    const n = bytes.length;
    if (n < 1000 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff || bytes[n - 2] !== 0xff || bytes[n - 1] !== 0xd9) {
      return json({ error: "Only card images can be posted." }, 400);
    }
    const cluster = typeof body?.cluster === "string" && /^[a-z]{2,6}$/.test(body.cluster) ? body.cluster : "x"; // picks which booster pack the card opens in
    const rand = [...crypto.getRandomValues(new Uint8Array(6))].map((b) => (b % 36).toString(36)).join("");
    const id = `${String(9999999999999 - Date.now()).padStart(13, "0")}-${rand}-${cluster}`;
    await kv.put(id, bytes.buffer);
    const D = await db(env);
    if (D) await D.prepare("INSERT OR IGNORE INTO cards (id, team, at) VALUES (?, ?, ?)").bind(id, cluster, Date.now()).run();
    return json({ id });
  }

  if (request.method === "DELETE") {
    if (!isAdmin) return json({ error: "Only the organiser can remove cards." }, 403);
    const id = url.searchParams.get("id") || "";
    if (!ID_RE.test(id)) return json({ error: "Missing card id." }, 400);
    await kv.delete(id);
    const D = await db(env);
    if (D) await D.batch([D.prepare("DELETE FROM cards WHERE id = ?").bind(id), D.prepare("DELETE FROM likes WHERE card = ?").bind(id)]);
    return json({ ok: true });
  }
  return json({ error: "Not supported." }, 405, { allow: "GET, POST, DELETE" });
}
