import { key } from "../config.js";
import { exportCanvas } from "./preview.js";
import { card, photo } from "./state.js";
import { api, askCode, ensureCode, ls } from "../core/session.js";
import { $, toast } from "../core/util.js";
export let postedSig = "";
export const cardSig = () => [photo.img?.src?.length, photo.img?.src?.slice(-24), card.name, card.type, card.frame, card.color].join("|");
export function resetPostBtn() { const b = $("postBtn"); if (b && postedSig && postedSig !== cardSig()) { postedSig = ""; b.disabled = false; b.textContent = "📌 Post to Card Wall"; } }
export async function postToWall() {
  if (!photo.img) { toast("Take a photo first"); return; }
  if (!card.name.trim()) { toast("Type your name first, then post"); $("boothName").focus(); return; }
  if (postedSig === cardSig()) { toast("This card is already on the wall"); return; }
  if (!(await ensureCode())) return;
  const btn = $("postBtn"); btn.disabled = true; btn.textContent = "Posting…";
  const image = exportCanvas(1).toDataURL("image/jpeg", 0.85);
  let r = await api("POST", "", { image, cluster: card.type });
  if (r.status === 401) { ls.set(key("pass"), ""); if (await askCode("That code didn't work. Check the code shown at the booth.")) r = await api("POST", "", { image, cluster: card.type }); }
  if (r.ok) {
    postedSig = cardSig(); btn.textContent = "✓ Posted to the wall";
    toast("Posted! 🎉 Watch for it in the next pack on the Card Wall");
  } else {
    btn.disabled = false; btn.textContent = "📌 Post to Card Wall";
    if (r.status !== 401) toast(r.data.error || "Couldn't post. Try again.");
  }
}
