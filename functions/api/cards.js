// Card Wall API on Cloudflare Pages Functions, storing card images in Workers KV (binding CARDS).
// Access needs the event code (BOARD_PASS); deleting needs the organiser key (ADMIN_KEY).
const MAX_BYTES = 2_500_000;          // decoded JPEG
const MAX_BODY = 3_600_000;           // base64 JSON body
const ID_RE = /^\d{13}-[a-z0-9]{1,8}-[a-z]{1,6}$/;
const SEC = { "x-content-type-options": "nosniff", "referrer-policy": "no-referrer" };
const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), { status, headers: { ...SEC, "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra } });

// Constant-time comparison so the codes can't be guessed from response timing.
function same(a, b) {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] || 0) ^ (y[i] || 0);
  return diff === 0;
}

// Best-effort limits kept in this worker's memory (each Cloudflare location keeps its own count).
// Generous on purpose: staff on the same office Wi-Fi share one IP address.
const hits = new Map();
function limited(key, max, windowMs) {
  const now = Date.now(), h = hits.get(key);
  if (!h || now - h.t > windowMs) { hits.set(key, { t: now, n: 1 }); if (hits.size > 5000) hits.clear(); return false; }
  h.n += 1;
  return h.n > max;
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const BOARD = env.BOARD_PASS || "", ADMIN = env.ADMIN_KEY || "";
  const sentAdmin = request.headers.get("x-admin") || "";
  const isAdmin = !!ADMIN && !!sentAdmin && same(sentAdmin, ADMIN);
  // Images are loaded by <img>, which can't send headers, so only image GETs may carry the code in the URL.
  const imageGet = request.method === "GET" && url.searchParams.has("id");
  const pass = (request.headers.get("x-pass") || (imageGet ? url.searchParams.get("pass") : "") || "").trim().toUpperCase();
  const passOk = !BOARD || same(pass, BOARD.toUpperCase());

  if (sentAdmin && !isAdmin) {
    if (limited(`bad-admin:${ip}`, 10, 10 * 60_000)) return json({ error: "Too many tries. Wait a few minutes." }, 429, { "retry-after": "600" });
    return json({ error: "That organiser key isn't right." }, 403);
  }
  if (!passOk && !isAdmin) {
    if (limited(`bad-pass:${ip}`, 60, 10 * 60_000)) return json({ error: "Too many tries. Wait a few minutes." }, 429, { "retry-after": "600" });
    return json({ error: "That event code isn't right. Check the code shown at the booth." }, 401);
  }
  const kv = env.CARDS;

  if (request.method === "GET") {
    if (imageGet) {
      const id = url.searchParams.get("id");
      if (!ID_RE.test(id)) return new Response("Not found", { status: 404, headers: SEC });
      const data = await kv.get(id, { type: "arrayBuffer" });
      if (!data) return new Response("Not found", { status: 404, headers: SEC });
      return new Response(data, { headers: { ...SEC, "content-type": "image/jpeg", "content-disposition": "inline", "content-security-policy": "default-src 'none'; sandbox", "cache-control": "private, max-age=86400" } });
    }
    const { keys } = await kv.list({ limit: 1000 });
    return json({ cards: keys.map((k) => k.name).filter((n) => ID_RE.test(n)).sort().slice(0, 500) }); // keys sort newest first
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
    return json({ id });
  }

  if (request.method === "DELETE") {
    if (!isAdmin) return json({ error: "Only the organiser can remove cards." }, 403);
    const id = url.searchParams.get("id") || "";
    if (!ID_RE.test(id)) return json({ error: "Missing card id." }, 400);
    await kv.delete(id);
    return json({ ok: true });
  }
  return json({ error: "Not supported." }, 405, { allow: "GET, POST, DELETE" });
}
