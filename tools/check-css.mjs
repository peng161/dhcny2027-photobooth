// Checks that the booth and wall stylesheets can't restyle each other's elements.
// A clash is a class one component styles on its own (e.g. ".show { ... }") that the
// other component also uses. That is how ".stage" and ".show" broke the page before.
// Modifier classes always written together with a component class (".pack-burst.go") are fine.
// Usage: node tools/check-css.mjs
import fs from "fs";
const dir = new URL("../public/photobooth/styles/", import.meta.url);
const files = ["booth.css", "wall.css"];
const info = Object.fromEntries(files.map((f) => [f, { bare: new Set(), any: new Set() }]));
for (const f of files) {
  const css = fs.readFileSync(new URL(f, dir), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  for (const block of css.split("}")) {
    let sel = block.split("{").slice(-2, -1)[0] ?? block.split("{")[0];
    if (!sel || /@keyframes|^\s*(from|to|\d+%)\s*$/.test(sel)) continue;
    sel = sel.replace(/:not\([^)]*\)/g, ""); // :not(.x) doesn't style .x
    for (const compound of sel.split(/[\s,>+~]+/).filter(Boolean)) {
      const cls = [...compound.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]);
      const qualified = /^[a-zA-Z#*]/.test(compound) || cls.length > 1;
      cls.forEach((c) => { info[f].any.add(c); if (!qualified) info[f].bare.add(c); });
    }
  }
}
// shared building blocks from base.css (buttons, panels...) may be fine-tuned by either component
const base = new Set([...fs.readFileSync(new URL("base.css", dir), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]));
const [a, b] = files, clashes = [];
for (const [x, y] of [[a, b], [b, a]]) for (const c of info[x].bare) if (info[y].any.has(c) && !base.has(c)) clashes.push(`.${c}: styled on its own in ${x}, also used in ${y}`);
if (clashes.length) { console.log("Style-name clashes:\n  " + clashes.join("\n  ")); process.exitCode = 1; }
else console.log("No style-name clashes between booth.css and wall.css.");
