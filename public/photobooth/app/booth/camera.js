import { shuffleCard } from "./editor.js";
import { download } from "./gallery.js";
import { resetPostBtn } from "./post.js";
import { render } from "./preview.js";
import { event, photo } from "./state.js";
import { $, toast } from "../core/util.js";
/* ---------- Camera ---------- */
export const video = $("video");
export let stream = null;
export async function startCamera(deviceId) {
  if (!navigator.mediaDevices?.getUserMedia) { $("camMsg").textContent = "This browser can't use the camera here. Open this file in Chrome or Safari, or use Upload photo."; return; }
  stopCamera();
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: deviceId ? { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1440 } } : { facingMode: "user", width: { ideal: 1920 }, height: { ideal: 1440 } },
      audio: false,
    });
    video.srcObject = stream; await video.play();
    $("camMsg").hidden = true; $("camBtn").textContent = "Stop camera";
    const devs = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === "videoinput");
    const sel = $("camSelect"), cur = stream.getVideoTracks()[0]?.getSettings().deviceId;
    sel.replaceChildren(...devs.map((d, i) => { const o = new Option(d.label || `Camera ${i + 1}`, d.deviceId); o.selected = d.deviceId === cur; return o; }));
  } catch (err) {
    $("camMsg").hidden = false;
    $("camMsg").textContent = err.name === "NotAllowedError" ? "Camera access was blocked. Allow the camera in your browser's address bar, then press Start camera again." : "Couldn't start the camera (" + err.name + "). Check that no other app is using it, or use Upload photo.";
  }
}
export function stopCamera() {
  if (stream) stream.getTracks().forEach(t => t.stop());
  stream = null; video.srcObject = null;
  $("camMsg").hidden = false; $("camMsg").textContent = "Camera is off."; $("camBtn").textContent = "Start camera";
}
export let counting = false;
export async function snap() {
  if (counting) return;
  if (!stream) { await startCamera($("camSelect").value); if (!stream) return; await new Promise(r => setTimeout(r, 400)); }
  counting = true; $("snapBtn").disabled = true;
  const n = +$("countSel").value;
  for (let i = n; i > 0; i--) { $("count").textContent = i; beep(660, 0.08); await new Promise(r => setTimeout(r, 1000)); }
  $("count").textContent = "";
  beep(1200, 0.15);
  const f = $("flash"); f.classList.remove("go"); void f.offsetWidth; f.classList.add("go");
  const c = document.createElement("canvas");
  c.width = video.videoWidth; c.height = video.videoHeight;
  const g = c.getContext("2d");
  if ($("mirror").checked) { g.translate(c.width, 0); g.scale(-1, 1); }
  g.drawImage(video, 0, 0);
  const img = new Image();
  img.onload = () => { setPhoto(img); counting = false; $("snapBtn").disabled = false; };
  img.src = c.toDataURL("image/jpeg", 0.92);
}
export function setPhoto(img) {
  photo.img = img; photo.zoom = 1; photo.ox = 0; photo.oy = 0; photo.userMoved = false; $("zoom").value = 1;
  $("adjustRow").hidden = false;
  setTimeout(() => typeof resetPostBtn === "function" && resetPostBtn(), 0);
  if (document.body.classList.contains("booth")) event.num = 1 + Math.floor(Math.random() * (event.total || 200));
  if (event.autoshuffle) shuffleCard(); else render();
  if (matchMedia("(max-width: 720px)").matches) $("tilt").scrollIntoView({ behavior: "smooth", block: "start" });
}
// Phone photos can be 12+ MP; shrink to 2000px on the long side so the page stays fast.
export function loadFile(f) {
  if (!f) return;
  const url = URL.createObjectURL(f);
  const img = new Image();
  img.onload = () => {
    const max = 2000, s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url);
    const out = new Image(); out.onload = () => setPhoto(out); out.src = c.toDataURL("image/jpeg", 0.92);
  };
  img.onerror = () => { URL.revokeObjectURL(url); toast("That photo couldn't be opened. Try another one."); };
  img.src = url;
}
export async function saveToPhone(url, name) {
  try {
    const blob = await (await fetch(url)).blob();
    const file = new File([blob], name, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: name }); return; }
  } catch (e) { if (e?.name === "AbortError") return; }
  if (matchMedia("(pointer: coarse)").matches) {
    $("viewerImg").src = url; $("viewer").hidden = false;
  } else download(url, name);
}
export let actx = null;
export function beep(freq, dur) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), gn = actx.createGain();
    o.frequency.value = freq; gn.gain.value = 0.08;
    o.connect(gn).connect(actx.destination); o.start(); o.stop(actx.currentTime + dur);
  } catch {}
}

$("camBtn").addEventListener("click", () => stream ? stopCamera() : startCamera($("camSelect").value));
$("camSelect").addEventListener("change", (e) => startCamera(e.target.value));
$("mirror").addEventListener("change", (e) => video.classList.toggle("mirror", e.target.checked));
$("snapBtn").addEventListener("click", snap);
["upload", "takePhoto"].forEach(id => $(id).addEventListener("change", (e) => { loadFile(e.target.files?.[0]); e.target.value = ""; }));
if (!matchMedia("(pointer: coarse)").matches) $("webcamBox").open = true;

document.addEventListener("keydown", (e) => {
  if (e.code !== "Space" && e.key !== "AudioVolumeUp") return;
  const tag = document.activeElement?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
  e.preventDefault(); snap();
});
