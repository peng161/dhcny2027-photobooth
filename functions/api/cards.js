// Card Wall API on Cloudflare Pages Functions, storing card images in Workers KV (binding CARDS).
// Access needs the event code (BOARD_PASS); deleting needs the organiser key (ADMIN_KEY).
const MAX_BYTES = 2_500_000;
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const BOARD = env.BOARD_PASS || "", ADMIN = env.ADMIN_KEY || "";
  const isAdmin = ADMIN && request.headers.get("x-admin") === ADMIN;
  const pass = request.headers.get("x-pass") || url.searchParams.get("pass") || "";
  if (BOARD && pass.trim().toUpperCase() !== BOARD.toUpperCase() && !isAdmin) {
    return json({ error: "That event code isn't right. Check the code shown at the booth." }, 401);
  }
  const kv = env.CARDS;

  if (request.method === "GET") {
    const id = url.searchParams.get("id");
    if (id) {
      const data = await kv.get(id, { type: "arrayBuffer" });
      if (!data) return new Response("Not found", { status: 404 });
      return new Response(data, { headers: { "content-type": "image/jpeg", "cache-control": "private, max-age=86400" } });
    }
    const { keys } = await kv.list({ limit: 1000 });
    return json({ cards: keys.map((k) => k.name).sort().slice(0, 500) }); // keys sort newest first
  }

  if (request.method === "POST") {
    let body;
    try { body = await request.json(); } catch { return json({ error: "The card didn't arrive. Try posting again." }, 400); }
    const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(body?.image || "");
    if (!m) return json({ error: "Only card images can be posted." }, 400);
    const bin = atob(m[1]);
    if (bin.length > MAX_BYTES) return json({ error: "That card is too large to post." }, 413);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const cluster = /^[a-z]{2,6}$/.test(body?.cluster || "") ? body.cluster : "x"; // picks which booster pack the card opens in
    const id = `${String(9999999999999 - Date.now()).padStart(13, "0")}-${Math.random().toString(36).slice(2, 8)}-${cluster}`;
    await kv.put(id, bytes.buffer);
    return json({ id });
  }

  if (request.method === "DELETE") {
    if (!isAdmin) return json({ error: "Only the organiser can remove cards." }, 403);
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "Missing card id." }, 400);
    await kv.delete(id);
    return json({ ok: true });
  }
  return json({ error: "Not supported." }, 405);
}
