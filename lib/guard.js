// Shared by the Card Wall API endpoints: responses, code checks, rate limits, the card index.
export const ID_RE = /^\d{13}-[a-z0-9]{1,8}-[a-z]{1,6}$/;
export const SEC = { "x-content-type-options": "nosniff", "referrer-policy": "no-referrer" };
export const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), { status, headers: { ...SEC, "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra } });

// Constant-time comparison so the codes can't be guessed from response timing.
export function same(a, b) {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] || 0) ^ (y[i] || 0);
  return diff === 0;
}

// Best-effort limits kept in this worker's memory (each Cloudflare location keeps its own count).
// Generous on purpose: staff on the same office Wi-Fi share one IP address.
const hits = new Map();
export function limited(key, max, windowMs) {
  const now = Date.now(), h = hits.get(key);
  if (!h || now - h.t > windowMs) { hits.set(key, { t: now, n: 1 }); if (hits.size > 5000) hits.clear(); return false; }
  h.n += 1;
  return h.n > max;
}

/**
 * Checks the event code / organiser key. Returns { ip, isAdmin, imageGet } or { res } with the error to send.
 * Images are loaded by <img>, which can't send headers, so only image GETs may carry the code in the URL.
 */
export function guard(request, env, url) {
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const BOARD = env.BOARD_PASS || "", ADMIN = env.ADMIN_KEY || "";
  const sentAdmin = request.headers.get("x-admin") || "";
  const isAdmin = !!ADMIN && !!sentAdmin && same(sentAdmin, ADMIN);
  const imageGet = request.method === "GET" && url.searchParams.has("id");
  const pass = (request.headers.get("x-pass") || (imageGet ? url.searchParams.get("pass") : "") || "").trim().toUpperCase();
  const passOk = !BOARD || same(pass, BOARD.toUpperCase());
  if (sentAdmin && !isAdmin) {
    if (limited(`bad-admin:${ip}`, 10, 10 * 60_000)) return { res: json({ error: "Too many tries. Wait a few minutes." }, 429, { "retry-after": "600" }) };
    return { res: json({ error: "That organiser key isn't right." }, 403) };
  }
  if (!passOk && !isAdmin) {
    if (limited(`bad-pass:${ip}`, 60, 10 * 60_000)) return { res: json({ error: "Too many tries. Wait a few minutes." }, 429, { "retry-after": "600" }) };
    return { res: json({ error: "That event code isn't right. Check the code shown at the booth." }, 401) };
  }
  return { ip, isAdmin, imageGet };
}

/**
 * Which phone is this? The server keeps its own long-lived cookie (HttpOnly, so page code can't
 * read or reset it) and prefers it over the id the page sends. Leaving and coming back, or the
 * page's storage being wiped, then still counts as the same phone. A private tab or a second
 * browser is still a new phone: only a sign-in could stop that.
 */
export const DEVICE_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const COOKIE = "wall_device";
export function phone(request, sent = request.headers.get("x-device")) {
  const fromCookie = new RegExp(`(?:^|;\\s*)${COOKIE}=([0-9a-f-]{36})(?:;|$)`).exec(request.headers.get("cookie") || "")?.[1];
  const s = typeof sent === "string" ? sent.toLowerCase() : "";
  const device = DEVICE_RE.test(fromCookie || "") ? fromCookie : DEVICE_RE.test(s) ? s : crypto.randomUUID();
  // refreshed on every reply; 400 days is the most browsers allow
  return { device, cookie: { "set-cookie": `${COOKIE}=${device}; Path=/api; Max-Age=34560000; HttpOnly; Secure; SameSite=Strict` } };
}

/**
 * The card index and likes live in D1 (binding DB) when it is set up: listing from D1 is cheap,
 * while listing Workers KV is limited to 1,000 a day on the free plan. Without DB everything
 * still works from KV, just without likes.
 */
let schemaReady = false;
export async function db(env) {
  if (!env.DB) return null;
  if (!schemaReady) {
    await env.DB.batch([
      env.DB.prepare("CREATE TABLE IF NOT EXISTS cards (id TEXT PRIMARY KEY, team TEXT NOT NULL, at INTEGER NOT NULL)"),
      env.DB.prepare("CREATE TABLE IF NOT EXISTS likes (card TEXT NOT NULL, device TEXT NOT NULL, at INTEGER NOT NULL, PRIMARY KEY (card, device))"),
      env.DB.prepare("CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL)"),
    ]);
    // first run: copy the cards that were posted before the index existed
    const done = await env.DB.prepare("SELECT v FROM meta WHERE k = 'backfilled'").first();
    if (!done) {
      let cursor;
      do {
        const page = await env.CARDS.list({ limit: 1000, cursor });
        const rows = page.keys.map((k) => k.name).filter((n) => ID_RE.test(n));
        if (rows.length) await env.DB.batch(rows.map((n) => env.DB.prepare("INSERT OR IGNORE INTO cards (id, team, at) VALUES (?, ?, ?)").bind(n, n.split("-").pop(), Date.now())));
        cursor = page.list_complete ? null : page.cursor;
      } while (cursor);
      await env.DB.prepare("INSERT OR REPLACE INTO meta (k, v) VALUES ('backfilled', ?)").bind(String(Date.now())).run();
    }
    schemaReady = true;
  }
  return env.DB;
}
