// Security tests for functions/api/cards.js, run against an in-memory store. Usage: node tools/test-api.mjs
import fs from "fs";
import os from "os";
import path from "path";
const tmp = path.join(os.tmpdir(), `cards-${process.pid}.mjs`);
fs.copyFileSync(new URL("../functions/api/cards.js", import.meta.url), tmp);
const { onRequest } = await import(tmp);
const store = new Map();
const kv = { get: async (k) => store.get(k) ?? null, put: async (k, v) => store.set(k, v), delete: async (k) => store.delete(k), list: async () => ({ keys: [...store.keys(), "<img onerror=x>"].map(name => ({ name })) }) };
const env = { BOARD_PASS: "TESTCODE", ADMIN_KEY: "dh-adminsecret1", CARDS: kv };
const call = async (method, q = "", headers = {}, body, ip = "1.1.1.1") => {
  const init = { method, headers: { "cf-connecting-ip": ip, ...headers } };
  if (body !== undefined) { init.body = typeof body === "string" ? body : JSON.stringify(body); init.headers["content-type"] = "application/json"; }
  const r = await onRequest({ request: new Request("https://x.test/api/cards" + q, init), env });
  let t = ""; try { t = r.headers.get("content-type")?.includes("json") ? JSON.stringify(await r.json()) : `${(await r.arrayBuffer()).byteLength} bytes`; } catch {}
  return [r.status, t, r.headers.get("x-content-type-options"), r.headers.get("content-security-policy")];
};
const jpeg = () => { const b = new Uint8Array(3000); b[0] = 0xff; b[1] = 0xd8; b[2] = 0xff; b[2998] = 0xff; b[2999] = 0xd9; return "data:image/jpeg;base64," + Buffer.from(b).toString("base64"); };
const P = { "x-pass": "testcode" };
const out = [];
const t = async (name, p, expect) => { const r = await p; out.push(`${r[0] === expect ? "PASS" : "FAIL"}  ${name} -> ${r[0]} ${r[1].slice(0, 70)}`); return r; };
await t("no code", call("GET"), 401);
await t("wrong code", call("GET", "", { "x-pass": "nope" }), 401);
await t("code in URL for list is ignored", call("GET", "?pass=TESTCODE"), 401);
const post = await t("valid jpeg post", call("POST", "", P, { image: jpeg(), cluster: "ai" }), 200);
const id = JSON.parse(post[1]).id;
await t("list hides bad keys", call("GET", "", P), 200);
const img = await t("image with code in URL", call("GET", `?id=${id}&pass=TESTCODE`), 200);
out.push(`      image headers: nosniff=${img[2]} csp=${img[3]}`);
await t("bad id format", call("GET", `?id=${encodeURIComponent("../x")}&pass=TESTCODE`), 404);
await t("html disguised as jpeg", call("POST", "", P, { image: "data:image/jpeg;base64," + Buffer.from("<html><script>alert(1)</script></html>".repeat(40)).toString("base64") }), 400);
await t("png rejected", call("POST", "", P, { image: "data:image/png;base64,AAAA" }), 400);
await t("non-json body", call("POST", "", { ...P, "content-type": "text/plain" }), 415);
await t("delete without admin", call("DELETE", `?id=${id}`, P), 403);
await t("delete with wrong admin", call("DELETE", `?id=${id}`, { ...P, "x-admin": "guess" }), 403);
await t("delete bad id as admin", call("DELETE", "?id=..%2Fx", { "x-admin": "dh-adminsecret1" }), 400);
await t("delete as admin", call("DELETE", `?id=${id}`, { "x-admin": "dh-adminsecret1" }), 200);
for (let i = 0; i < 10; i++) await call("DELETE", `?id=${id}`, { ...P, "x-admin": "guess" + i }, undefined, "9.9.9.9");
await t("admin brute force throttled", call("DELETE", `?id=${id}`, { ...P, "x-admin": "guess-last" }, undefined, "9.9.9.9"), 429);
let last; for (let i = 0; i < 81; i++) last = await call("POST", "", P, { image: jpeg(), cluster: "swe" }, "5.5.5.5");
out.push(`${last[0] === 429 ? "PASS" : "FAIL"}  81st post in 10 min from one network -> ${last[0]}`);
await t("other phones still post", call("POST", "", P, { image: jpeg(), cluster: "swe" }, "6.6.6.6"), 200);
await t("PUT not allowed", call("PUT", "", P), 405);
console.log(out.join("\n"));
const failed = out.filter((l) => l.startsWith("FAIL")).length;
console.log(failed ? `${failed} FAILED` : "all passed");
fs.unlinkSync(tmp);
process.exitCode = failed ? 1 : 0;
