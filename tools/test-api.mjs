// Security and behaviour tests for the Card Wall API (functions/api/*), run against in-memory
// stand-ins for Workers KV and D1. No network needed. Usage: node tools/test-api.mjs
import { onRequest as cardsApi } from "../functions/api/cards.js";
import { onRequest as likesApi } from "../functions/api/likes.js";

// --- in-memory Workers KV
const store = new Map();
const kv = {
  get: async (k) => store.get(k) ?? null, put: async (k, v) => store.set(k, v), delete: async (k) => store.delete(k),
  list: async () => ({ keys: [...store.keys(), "<img onerror=x>"].map((name) => ({ name })), list_complete: true }),
};
// --- tiny in-memory D1 that understands the statements the API uses
const T = { cards: new Map(), likes: new Map(), meta: new Map() };
const stmt = (sql, args = []) => ({
  bind: (...a) => stmt(sql, a),
  async all() {
    if (/^SELECT id FROM cards/.test(sql)) return { results: [...T.cards.keys()].sort().slice(0, 500).map((id) => ({ id })) };
    if (/^SELECT card, COUNT/.test(sql)) { const c = {}; for (const k of T.likes.keys()) { const id = k.split("|")[0]; c[id] = (c[id] || 0) + 1; } return { results: Object.entries(c).map(([card, n]) => ({ card, n })) }; }
    if (/^SELECT COUNT\(\*\) AS n FROM likes WHERE card/.test(sql)) return { results: [{ n: [...T.likes.keys()].filter((k) => k.startsWith(args[0] + "|")).length }] };
    return { results: [] };
  },
  async first() {
    if (/^SELECT v FROM meta/.test(sql)) return T.meta.has("backfilled") ? { v: "1" } : null;
    if (/^SELECT 1 AS ok FROM cards/.test(sql)) return T.cards.has(args[0]) ? { ok: 1 } : null;
    return null;
  },
  async run() {
    if (/^CREATE TABLE/.test(sql)) return {};
    if (/^INSERT OR IGNORE INTO cards/.test(sql)) T.cards.set(args[0], args[1]);
    else if (/^INSERT OR REPLACE INTO meta/.test(sql)) T.meta.set("backfilled", args[0]);
    else if (/^INSERT OR IGNORE INTO likes/.test(sql)) T.likes.set(`${args[0]}|${args[1]}`, args[2]);
    else if (/^DELETE FROM likes WHERE card = \? AND device/.test(sql)) T.likes.delete(`${args[0]}|${args[1]}`);
    else if (/^DELETE FROM likes WHERE card/.test(sql)) { for (const k of [...T.likes.keys()]) if (k.startsWith(args[0] + "|")) T.likes.delete(k); }
    else if (/^DELETE FROM cards/.test(sql)) T.cards.delete(args[0]);
    return {};
  },
});
const D1 = { prepare: (sql) => stmt(sql), batch: async (list) => Promise.all(list.map((s) => (/^SELECT/.test(s_sql(s)) ? s.all() : s.run()))) };
function s_sql(s) { return s.__sql; }
// keep the SQL text on each statement so batch() knows reads from writes
const _prep = D1.prepare; D1.prepare = (sql) => { const s = _prep(sql); s.__sql = sql; const b = s.bind; s.bind = (...a) => { const t = b(...a); t.__sql = sql; return t; }; return s; };

const env = { BOARD_PASS: "TESTCODE", ADMIN_KEY: "dh-adminsecret1", CARDS: kv, DB: D1 };
const envNoDb = { BOARD_PASS: "TESTCODE", ADMIN_KEY: "dh-adminsecret1", CARDS: kv };
const call = async (fn, method, path, q = "", headers = {}, body, ip = "1.1.1.1", e = env) => {
  const init = { method, headers: { "cf-connecting-ip": ip, ...headers } };
  if (body !== undefined) { init.body = typeof body === "string" ? body : JSON.stringify(body); init.headers["content-type"] ||= "application/json"; }
  const r = await fn({ request: new Request(`https://x.test/api/${path}${q}`, init), env: e });
  let t = ""; try { t = r.headers.get("content-type")?.includes("json") ? JSON.stringify(await r.json()) : `${(await r.arrayBuffer()).byteLength} bytes`; } catch {}
  return [r.status, t, r.headers.get("x-content-type-options"), r.headers.get("content-security-policy")];
};
const cards = (...a) => call(cardsApi, a[0], "cards", ...a.slice(1));
const likes = (...a) => call(likesApi, a[0], "likes", ...a.slice(1));
const jpeg = () => { const b = new Uint8Array(3000); b[0] = 0xff; b[1] = 0xd8; b[2] = 0xff; b[2998] = 0xff; b[2999] = 0xd9; return "data:image/jpeg;base64," + Buffer.from(b).toString("base64"); };
const P = { "x-pass": "testcode" };
const DEV = "3f2a1b4c-5d6e-4f70-8a9b-0c1d2e3f4a5b", DEV2 = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const out = [];
const t = async (name, p, expect) => { const r = await p; out.push(`${r[0] === expect ? "PASS" : "FAIL"}  ${name} -> ${r[0]} ${r[1].slice(0, 80)}`); return r; };

// --- cards: access and uploads
await t("no code", cards("GET"), 401);
await t("wrong code", cards("GET", "", { "x-pass": "nope" }), 401);
await t("code in URL for list is ignored", cards("GET", "?pass=TESTCODE"), 401);
const post = await t("valid jpeg post", cards("POST", "", P, { image: jpeg(), cluster: "ai" }), 200);
const id = JSON.parse(post[1]).id;
await t("list comes from the D1 index (bad KV keys never listed)", cards("GET", "", P), 200);
const img = await t("image with code in URL", cards("GET", `?id=${id}&pass=TESTCODE`), 200);
out.push(`      image headers: nosniff=${img[2]} csp=${img[3]}`);
await t("bad id format", cards("GET", `?id=${encodeURIComponent("../x")}&pass=TESTCODE`), 404);
await t("html disguised as jpeg", cards("POST", "", P, { image: "data:image/jpeg;base64," + Buffer.from("<html><script>alert(1)</script></html>".repeat(40)).toString("base64") }), 400);
await t("png rejected", cards("POST", "", P, { image: "data:image/png;base64,AAAA" }), 400);
await t("non-json body", cards("POST", "", { ...P, "content-type": "text/plain" }), 415);
await t("list without D1 still works (from KV, likes off)", cards("GET", "", P, undefined, "1.1.1.1", envNoDb), 200);

// --- likes
await t("like without code", likes("POST", "", {}, { id, device: DEV, liked: true }), 401);
await t("like with bad device id", likes("POST", "", P, { id, device: "<script>", liked: true }), 400);
await t("like with bad card id", likes("POST", "", P, { id: "../x", device: DEV, liked: true }), 400);
await t("like a card that doesn't exist", likes("POST", "", P, { id: "8000000000000-abc123-ai", device: DEV, liked: true }), 404);
await t("like needs liked:true/false", likes("POST", "", P, { id, device: DEV, liked: "yes" }), 400);
const l1 = await t("like", likes("POST", "", P, { id, device: DEV, liked: true }), 200);
const l2 = await t("liking twice from one phone counts once", likes("POST", "", P, { id, device: DEV, liked: true }), 200);
const l3 = await t("a second phone likes", likes("POST", "", P, { id, device: DEV2, liked: true }), 200);
out.push(`${JSON.parse(l2[1]).likes === 1 && JSON.parse(l3[1]).likes === 2 ? "PASS" : "FAIL"}  counts: one phone = 1, two phones = 2`);
const list = await cards("GET", "", P);
out.push(`${JSON.parse(list[1]).likes?.[id] === 2 ? "PASS" : "FAIL"}  card list includes like counts`);
const ul = await t("unlike", likes("POST", "", P, { id, device: DEV, liked: false }), 200);
out.push(`${JSON.parse(ul[1]).likes === 1 ? "PASS" : "FAIL"}  unlike lowers the count`);
await t("likes off without D1", likes("POST", "", P, { id, device: DEV, liked: true }, "1.1.1.1", envNoDb), 501);
await t("GET on likes not allowed", likes("GET", "", P), 405);

// --- organiser actions
await t("delete without admin", cards("DELETE", `?id=${id}`, P), 403);
await t("delete with wrong admin", cards("DELETE", `?id=${id}`, { ...P, "x-admin": "guess" }), 403);
await t("delete bad id as admin", cards("DELETE", "?id=..%2Fx", { "x-admin": "dh-adminsecret1" }), 400);
await t("delete as admin", cards("DELETE", `?id=${id}`, { "x-admin": "dh-adminsecret1" }), 200);
out.push(`${!T.cards.has(id) && ![...T.likes.keys()].some((k) => k.startsWith(id)) ? "PASS" : "FAIL"}  deleting a card also removes it from the index and its likes`);
for (let i = 0; i < 10; i++) await cards("DELETE", `?id=${id}`, { ...P, "x-admin": "guess" + i }, undefined, "9.9.9.9");
await t("admin brute force throttled", cards("DELETE", `?id=${id}`, { ...P, "x-admin": "guess-last" }, undefined, "9.9.9.9"), 429);
let last; for (let i = 0; i < 81; i++) last = await cards("POST", "", P, { image: jpeg(), cluster: "swe" }, "5.5.5.5");
out.push(`${last[0] === 429 ? "PASS" : "FAIL"}  81st post in 10 min from one network -> ${last[0]}`);
await t("other networks still post", cards("POST", "", P, { image: jpeg(), cluster: "swe" }, "6.6.6.6"), 200);
await t("PUT not allowed", cards("PUT", "", P), 405);

console.log(out.join("\n"));
const failed = out.filter((l) => l.startsWith("FAIL")).length;
console.log(failed ? `${failed} FAILED` : `all ${out.filter((l) => l.startsWith("PASS")).length} passed`);
process.exitCode = failed ? 1 : 0;
