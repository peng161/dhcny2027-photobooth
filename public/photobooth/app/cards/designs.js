import { EVENT, key } from "../config.js";
import { card } from "../booth/state.js";
import { AMETHYST, BLACK, BLUEBAND, CYAN, GOLD, ICE, JADE, LIME, MAGENTA, NAVY, PINKBAND, PORCELAIN, RED, ROSE, SILVER, YELLOW } from "./palettes.js";
export const DESIGNS = {
  strike:   { name: "Holo Strike", badge: "hex",      layout: "strike",  frame: SILVER, trim: YELLOW, orn: null,  seal: false, monkey: "right", prop: "laptop" },
  illus:    { name: "Illustration Art", badge: "glass",   layout: "illus",   frame: SILVER, trim: SILVER, orn: null,  seal: false, monkey: "off",   prop: "laptop" },
  goldhr:   { name: "Gold Hyper Rare", badge: "coin",    layout: "full",    frame: GOLD,   trim: GOLD,   orn: "goldfoil", seal: false, monkey: "right", prop: "packet", tint: "#6e4a10" },
  duel:     { name: "Duel", badge: "coin",        layout: "duel",    frame: GOLD, trim: GOLD, seal: false, monkey: "off", prop: "laptop",
              du: { frame: "#c4682a", frame2: "#7e3c12", box: "#f3e6c8" } },
  blueprint:{ name: "Blueprint", badge: "glass",         layout: "blueprint", frame: SILVER, trim: SILVER, seal: false, monkey: "off", prop: "laptop",
              bp: { bg: "#1d4f9c", bg2: "#0e2e66", line: "#d6e6ff" } },
  lunar:    { name: "Lunar Full Art", badge: "lacquer",     layout: "full",    frame: GOLD,   trim: GOLD,   orn: "cny", seal: true,  monkey: "right", prop: "packet" },
  cover:    { name: "Magazine Cover", badge: "coin",     layout: "cover",   frame: SILVER, trim: SILVER, seal: false, monkey: "off", prop: "laptop",
              cv: { mast: "#e3262f", mastInk: "#ffffff" } },
  crimson:  { name: "Crimson Strike", badge: "hexgold",   layout: "strike",  frame: GOLD,   trim: GOLD,   orn: null,  seal: false, monkey: "right", prop: "packet",
              accent: "#f5c84c", ink: "rgba(70,6,14,.9)", band: ["#fff1b0", "#d9a93c", "#fff7d6", "#b8862a", "#f5d77a"] },
  stamp:    { name: "Postage Stamp", badge: "chop",      layout: "stamp",   frame: SILVER, trim: SILVER, seal: false, monkey: "off", prop: "packet",
              st: { bg: "#b8232b", paper: "#fbf6ea", ink: "#7a1016" } },
  wanted:   { name: "Most Wanted", badge: "chop",      layout: "wanted",  frame: GOLD, trim: GOLD, seal: false, monkey: "off", prop: "packet",
              wp: { paper: "#efdcb2", paper2: "#c9a46a", ink: "#3a2412", accent: "#8a1c14" } },
  lantern:  { name: "Lantern Night", badge: "lantern",      layout: "illus",   frame: GOLD,   trim: GOLD,   orn: "cny", seal: false, monkey: "off",   prop: "packet", leak: "#ff6a3d" },
  polaroid: { name: "Polaroid", badge: "orb",            layout: "polaroid", frame: SILVER, trim: SILVER, seal: false, monkey: "off", prop: "laptop",
              pl: { bg1: "#c9a77a", bg2: "#a3805a" } },
  crystal:  { name: "Crystal Tera", badge: "crystal",       layout: "full",    frame: ICE,    trim: ICE,    orn: "crystal", seal: false, monkey: "right", prop: "laptop" },
  scroll:   { name: "Ink Scroll", badge: "chop",         layout: "scroll",  frame: GOLD, trim: GOLD, seal: false, monkey: "off", prop: "packet",
              sc: { paper: "#f3ead6", ink: "#1d1a17", seal: "#c0262d" } },
  rookie:   { name: "Rookie Card", badge: "coin",      layout: "rookie",  frame: SILVER, trim: SILVER, seal: false, monkey: "off", prop: "laptop",
              rk: { c1: "#c3242f", c2: "#14245a", metal: SILVER } },
  neon:     { name: "Neon Circuit", badge: "crystal",    layout: "full",    frame: BLACK,  trim: CYAN,   orn: "tech", seal: false, monkey: "off", prop: "laptop", tint: "#04141c", neon: "#7fe0ff" },
  deco:     { name: "Art Deco", badge: "hexgold",        layout: "deco",    frame: GOLD, trim: GOLD, seal: false, monkey: "off", prop: "packet",
              dc: { bg: "#0b0a09", bg2: "#221d17", metal: GOLD, ink: "#f5d27a" } },
  classic:  { name: "Classic Holo", badge: "orb",       layout: "classic", frame: YELLOW, trim: SILVER, orn: null,  seal: false, monkey: "right", prop: "laptop" },
  jade:     { name: "Jade Dynasty", badge: "chopjade",   layout: "full",    frame: JADE,   trim: GOLD,   orn: "cny", seal: false, monkey: "off", prop: "packet", tint: "#0d3b2e" },
  midnight: { name: "Midnight Gold", badge: "coin",      layout: "full",    frame: BLACK,  trim: GOLD,   orn: "gold", seal: false, monkey: "off", prop: "packet", tint: "#0b0a0d" },
  plum:     { name: "Plum Blossom", badge: "lacquer",    layout: "illus",   frame: ROSE,   trim: ROSE,   orn: "petals", seal: false, monkey: "off", prop: "packet", leak: "#ff9ecb", petal: "#ffb3cf" },
  redpacket:{ name: "Red Packet", badge: "lacquer",      layout: "classic", frame: RED,    trim: GOLD,   orn: "cny", seal: true, monkey: "off", prop: "packet" },
};
/* Colour themes: the first entry is the design's own look; the rest override its colours */
export const COLORS = {
  strike:   [{ n: "Yellow", sw: "#ffd31a" }, { n: "Electric blue", sw: "#2fb4e0", band: BLUEBAND, accent: "#5fd0f5" }, { n: "Hot pink", sw: "#ff4f9a", band: PINKBAND, accent: "#ff7ab5" }, { n: "Lime", sw: "#7cc91c", band: LIME, accent: "#b6f23a" }],
  illus:    [{ n: EVENT.labels.teamColour, sw: "#c9abf0" }, { n: "Sunset", sw: "#ff7a3d", leak: "#ff7a3d" }, { n: "Ocean", sw: "#3db8ff", leak: "#3db8ff" }, { n: "Gold", sw: "#e3b54f", leak: "#ffcf6a", frame: GOLD, trim: GOLD }],
  goldhr:   [{ n: "Gold", sw: "#d9a93c" }, { n: "Rose gold", sw: "#c9806f", frame: ROSE, trim: ROSE, tint: "#6e2a3a", orn: "gold" }, { n: "Platinum", sw: "#b5bcc4", frame: SILVER, trim: SILVER, tint: "#2e3540", orn: null }],
  duel:     [{ n: "Amber", sw: "#c4682a" }, { n: "Sand", sw: "#c9a86a", du: { frame: "#cfae6e", frame2: "#8e6e34", box: "#f6ecd2" } }, { n: "Sapphire", sw: "#2a5aa8", du: { frame: "#2f62b4", frame2: "#13306a", box: "#e9eef8" } }, { n: "Violet", sw: "#7a4aa8", du: { frame: "#8452b4", frame2: "#41205e", box: "#f0e9f6" } }, { n: "Pearl", sw: "#e9e6df", du: { frame: "#efece6", frame2: "#bdb6a8", box: "#faf8f3" } }, { n: "Obsidian", sw: "#26232b", du: { frame: "#34303a", frame2: "#0e0c10", box: "#ebe7ee" } }],
  blueprint:[{ n: "Blueprint", sw: "#1d4f9c" }, { n: "Graphite", sw: "#3a3f47", bp: { bg: "#3d434c", bg2: "#1d2126", line: "#e8ecf0" } }, { n: "Green screen", sw: "#13553f", bp: { bg: "#145a43", bg2: "#08301f", line: "#c9f5df" } }, { n: "Red line", sw: "#8e1c22", bp: { bg: "#93222a", bg2: "#4f0a10", line: "#ffe0d6" } }],
  lunar:    [{ n: EVENT.labels.teamColour, sw: "#d9a93c" }, { n: "Imperial red", sw: "#8a0b12", tint: "#8a0b12" }, { n: "Midnight", sw: "#101a3a", tint: "#101a3a" }, { n: "Jade", sw: "#0f5a44", tint: "#0f5a44" }],
  cover:    [{ n: "Red", sw: "#e3262f" }, { n: "Yellow", sw: "#ffd31a", cv: { mast: "#ffd31a", mastInk: "#1a1400" } }, { n: "White", sw: "#ffffff", cv: { mast: "#ffffff", mastInk: "#111111" } }, { n: "Teal", sw: "#19c3b1", cv: { mast: "#19c3b1", mastInk: "#04201d" } }],
  crimson:  [{ n: "Crimson", sw: "#7a0b16" }, { n: "Midnight", sw: "#0a1230", ink: "rgba(8,14,40,.9)" }, { n: "Jade", sw: "#0b4a37", ink: "rgba(4,48,36,.9)" }, { n: "Royal purple", sw: "#3a0f5a", ink: "rgba(40,10,62,.9)" }],
  stamp:    [{ n: "Red", sw: "#b8232b" }, { n: "Teal", sw: "#16797a", st: { bg: "#16797a", paper: "#f6f8f2", ink: "#0c4a4b" } }, { n: "Mustard", sw: "#d79a1e", st: { bg: "#c98d16", paper: "#fdf8ec", ink: "#6a4806" } }, { n: "Navy", sw: "#22356e", st: { bg: "#22356e", paper: "#f7f6f1", ink: "#18265a" } }],
  wanted:   [{ n: "Teal chart", sw: "#3c6070" }, { n: "Sepia", sw: "#5a4632", wp: { paper: "#e2c9a0", paper2: "#a8835a", ink: "#2e1b0c", accent: "#6e1a10", sea: ["#6a5238", "#3a2a1a", "#1a120b"] } }, { n: "Navy chart", sw: "#1d2a4f", wp: { paper: "#efe6cf", paper2: "#cdbb92", ink: "#1d2a4f", accent: "#a81c22", sea: ["#2a3f72", "#14214a", "#070d24"] } }, { n: "Crimson chart", sw: "#8a1c14", wp: { paper: "#f1e1bd", paper2: "#cfa970", ink: "#3a1208", accent: "#a81c22", sea: ["#7a2020", "#420c0c", "#1e0505"] } }],
  lantern:  [{ n: "Lantern glow", sw: "#ff6a3d" }, { n: "Moonlight", sw: "#8fb8ff", leak: "#8fb8ff", frame: SILVER, trim: SILVER }, { n: "Plum", sw: "#d46bff", leak: "#d46bff" }, { n: "Jade", sw: "#38d39f", leak: "#38d39f" }],
  polaroid: [{ n: "Kraft", sw: "#c9a77a" }, { n: "Chalkboard", sw: "#2f4a3a", pl: { bg1: "#36523f", bg2: "#1d3226", dark: true } }, { n: "Blush", sw: "#f0c3c9", pl: { bg1: "#f3cdd2", bg2: "#e2a8b2" } }, { n: "Denim", sw: "#3d5a80", pl: { bg1: "#46648c", bg2: "#2a405f", dark: true } }],
  crystal:  [{ n: "Ice", sw: "#b9d3f0" }, { n: "Amethyst", sw: "#8e6cc9", frame: AMETHYST, trim: AMETHYST, tint: "#3e2470" }, { n: "Aqua", sw: "#2fb4e0", frame: CYAN, trim: CYAN, tint: "#0f5a70" }, { n: "Rose quartz", sw: "#e8a898", frame: ROSE, trim: ROSE, tint: "#6e2a44" }],
  scroll:   [{ n: "Ink", sw: "#1d1a17" }, { n: "Indigo", sw: "#25356a", sc: { paper: "#edf0f6", ink: "#1d2a4f", seal: "#c0262d" } }, { n: "Vermilion", sw: "#a8321e", sc: { paper: "#f7e9d9", ink: "#5a1a10", seal: "#b8262c" } }, { n: "Night", sw: "#26232b", sc: { paper: "#1f1d22", ink: "#efe6d2", seal: "#d4343b", dark: true } }],
  rookie:   [{ n: "Red & navy", sw: "#c3242f" }, { n: "Gold & black", sw: "#d9a93c", rk: { c1: "#d9a93c", c2: "#141217", metal: GOLD } }, { n: "Teal & orange", sw: "#16797a", rk: { c1: "#e0702a", c2: "#0e5a5b", metal: SILVER } }, { n: "Purple & gold", sw: "#6a3aa8", rk: { c1: "#e3b54f", c2: "#3f1f6e", metal: SILVER } }],
  neon:     [{ n: "Cyan", sw: "#2fb4e0" }, { n: "Magenta", sw: "#ff4fc8", trim: MAGENTA, neon: "#ff6ad5", tint: "#1c0420" }, { n: "Lime", sw: "#a6ff4d", trim: LIME, neon: "#a6ff4d", tint: "#0b1a04" }, { n: "Amber", sw: "#ffb84d", trim: GOLD, neon: "#ffb84d", tint: "#1c1004" }],
  deco:     [{ n: "Black & gold", sw: "#141210" }, { n: "Emerald", sw: "#0d4a3a", dc: { bg: "#06241c", bg2: "#0f4a3a", metal: GOLD, ink: "#f5d27a" } }, { n: "Navy & silver", sw: "#14234d", dc: { bg: "#060c1f", bg2: "#16264f", metal: SILVER, ink: "#e6ebf2" } }, { n: "Burgundy", sw: "#5a1020", dc: { bg: "#22060c", bg2: "#4f1120", metal: GOLD, ink: "#f5d27a" } }],
  classic:  [{ n: "Yellow", sw: "#f4c800" }, { n: "Silver", sw: "#b5bcc4", frame: SILVER }, { n: "Gold", sw: "#d9a93c", frame: GOLD, trim: GOLD }, { n: "Black", sw: "#141217", frame: BLACK }],
  jade:     [{ n: "Jade", sw: "#2f8f6e" }, { n: "Lacquer red", sw: "#b3121b", frame: RED, tint: "#4a060c", badge: "chop" }, { n: "Porcelain", sw: "#3a5fb0", frame: PORCELAIN, trim: SILVER, tint: "#0e2350", badge: "glass" }],
  midnight: [{ n: "Gold", sw: "#d9a93c" }, { n: "Silver", sw: "#b5bcc4", trim: SILVER, badge: "glass" }, { n: "Rose gold", sw: "#c9806f", trim: ROSE }],
  plum:     [{ n: "Blush", sw: "#ff9ecb" }, { n: "Snow", sw: "#eef1f4", frame: SILVER, trim: SILVER, leak: "#ffe7c2", petal: "#ffffff" }, { n: "Gold", sw: "#d9a93c", frame: GOLD, trim: GOLD, leak: "#ffcf6a", petal: "#ffd0dc" }],
  redpacket:[{ n: "Red", sw: "#d72a2a" }, { n: "Gold", sw: "#d9a93c", frame: GOLD }, { n: "Black", sw: "#141217", frame: BLACK }],
};
/* Ten shared colour themes, mapped onto each layout's own colour slots. Hand-tuned colours above come first. */
export const THEMES = [
  { n: "Imperial red", sw: "#c3242f", main: "#c3242f", dark: "#8a0f18", deep: "#3e050b", light: "#ff8a7a", accent: "#ff5a4f", metal: RED, neon: "#ff5a5a", paper: "#f8e7e1", alias: ["red", "crimson", "lacquer"] },
  { n: "Imperial gold", sw: "#d9a93c", main: "#c99a2e", dark: "#7a5a12", deep: "#2e2105", light: "#ffd98a", accent: "#f5c84c", metal: GOLD, neon: "#ffc84d", paper: "#f7eed8", alias: ["gold", "mustard", "amber", "yellow"] },
  { n: "Jade", sw: "#1f8a6a", main: "#1f8a6a", dark: "#11604a", deep: "#04241b", light: "#8fe8c4", accent: "#38d39f", metal: JADE, neon: "#4dffb8", paper: "#e7f3ec", alias: ["jade", "emerald", "green", "lime"] },
  { n: "Midnight blue", sw: "#2a4a9a", main: "#2a4a9a", dark: "#15296a", deep: "#040b22", light: "#9fb8ff", accent: "#6f9bff", metal: NAVY, neon: "#6fa0ff", paper: "#e8ecf6", alias: ["midnight", "sapphire", "navy", "indigo", "blue", "denim", "porcelain"] },
  { n: "Royal purple", sw: "#6a3aa8", main: "#6a3aa8", dark: "#3f1f6e", deep: "#17092b", light: "#c9a8ff", accent: "#b48bff", metal: AMETHYST, neon: "#c48bff", paper: "#efe8f7", alias: ["purple", "violet", "plum", "amethyst", "magenta"] },
  { n: "Rose", sw: "#d0607a", main: "#d0607a", dark: "#8e3046", deep: "#360d1a", light: "#ffb3c6", accent: "#ff7fa0", metal: ROSE, neon: "#ff8fb5", paper: "#f9e8ec", alias: ["rose", "blush", "pink"] },
  { n: "Ocean teal", sw: "#16797a", main: "#16797a", dark: "#0c4a4b", deep: "#032021", light: "#8fe0e0", accent: "#2fd0c8", metal: CYAN, neon: "#5ff0ff", paper: "#e4f2f1", alias: ["teal", "ocean", "aqua", "cyan"] },
  { n: "Platinum", sw: "#b5bcc4", main: "#7d858e", dark: "#454c55", deep: "#191d22", light: "#e6ebf0", accent: "#dfe5ec", metal: SILVER, neon: "#e8f0ff", paper: "#f1f2f3", alias: ["silver", "pearl", "platinum", "snow", "ice", "moonlight", "white"] },
  { n: "Onyx", sw: "#1c1a1f", main: "#3a3640", dark: "#1c1a1f", deep: "#070608", light: "#cfc6d6", accent: "#f5c84c", metal: BLACK, neon: "#f5c84c", paper: "#ece8e2", alias: ["onyx", "obsidian", "black", "graphite", "night", "ink"] },
  { n: "Sunrise", sw: "#e0702a", main: "#e0702a", dark: "#a2461a", deep: "#3e1706", light: "#ffc08a", accent: "#ff9a3d", metal: ["#ffd2a8", "#e0702a", "#ffe6cc", "#a2461a", "#f5a05f"], neon: "#ffa04d", paper: "#faeee2", alias: ["sunset", "sunrise", "orange"] },
  { n: "Spring green", sw: "#6aa82a", main: "#5f9a26", dark: "#3c6a14", deep: "#132605", light: "#c9f29a", accent: "#a6e05a", metal: LIME, neon: "#b6ff6a", paper: "#eef5e2", alias: ["spring"] },
];
export function themeFor(key, D, th) {
  const lum = (h) => (0.299 * parseInt(h.slice(1, 3), 16) + 0.587 * parseInt(h.slice(3, 5), 16) + 0.114 * parseInt(h.slice(5, 7), 16)) / 255;
  const rgba = (h, a) => `rgba(${parseInt(h.slice(1, 3), 16)},${parseInt(h.slice(3, 5), 16)},${parseInt(h.slice(5, 7), 16)},${a})`;
  const lightMetal = th.metal === BLACK ? GOLD : th.metal === NAVY ? SILVER : th.metal;
  switch (D.layout) {
    case "strike": return key === "crimson" ? { ink: rgba(th.deep, 0.92) } : { band: lightMetal, accent: th.accent };
    case "illus": return { leak: th.light, frame: th.metal, trim: th.metal, petal: th.light };
    case "full": return key === "neon" ? { trim: lightMetal, neon: th.neon, tint: th.deep }
      : { tint: th.deep, frame: th.metal, trim: key === "jade" || key === "midnight" ? lightMetal : th.metal, ...(key === "goldhr" ? { orn: th.metal === GOLD ? "goldfoil" : "gold" } : {}) };
    case "poster": return { poster: { bg: [th.main, th.dark, th.deep], deep: th.deep, ink: th.dark } };
    case "classic": return { frame: th.metal, trim: key === "redpacket" ? GOLD : D.trim };
    case "duel": return { du: { frame: th.main, frame2: th.deep, box: th.paper } };
    case "wanted": return { wp: { paper: "#efdcb2", paper2: "#c9a46a", ink: "#3a2412", accent: th.dark, sea: [th.main, th.dark, th.deep] } };
    case "rookie": return { rk: { c1: th.accent, c2: th.deep, metal: th.metal === GOLD ? GOLD : SILVER } };
    case "blueprint": return { bp: { bg: th.dark, bg2: th.deep, line: th.paper } };
    case "cover": return { cv: { mast: th.accent, mastInk: lum(th.accent) > 0.6 ? "#111111" : "#ffffff" } };
    case "stamp": return { st: { bg: th.main, paper: th.paper, ink: th.deep } };
    case "polaroid": return { pl: { bg1: th.main, bg2: th.dark, dark: lum(th.main) < 0.55 } };
    case "scroll": return { sc: { paper: th.paper, ink: th.deep, seal: "#c0262d" } };
    case "deco": return { dc: { bg: th.deep, bg2: th.dark, metal: lightMetal, ink: th.light } };
  }
  return {};
}
Object.keys(DESIGNS).forEach((k) => {
  const list = COLORS[k] || [{ n: "Original", sw: "#888888" }];
  for (const th of THEMES) {
    if (list.length >= 10) break;
    const names = list.map(c => c.n.toLowerCase()).join(" ");
    if (th.alias.some(a => names.includes(a))) continue;
    list.push({ n: th.n, sw: th.sw, ...themeFor(k, DESIGNS[k], th) });
  }
  COLORS[k] = list.slice(0, 10);
});
export function curDesign() {
  const base = DESIGNS[card.frame] || DESIGNS.strike, c = (COLORS[card.frame] || [])[card.color | 0];
  return c ? { ...base, ...c } : base;
}
for (const [k, n] of Object.entries(EVENT.designs?.names || {})) if (DESIGNS[k]) DESIGNS[k].name = n;
export const DESIGN_NAMES = Object.fromEntries(Object.entries(DESIGNS).map(([k, d]) => [k, d.name]));
export const DESIGN_DEFAULTS = Object.fromEntries(Object.entries(DESIGNS).map(([k, d]) => [k, { seal: d.seal, monkey: d.monkey, prop: d.prop }]));
export const FILTERS = {
  none: "none",
  vivid: "saturate(1.35) contrast(1.08)",
  warm: "sepia(0.18) saturate(1.2) brightness(1.03)",
  bw: "grayscale(1) contrast(1.12)",
  vintage: "sepia(0.45) contrast(0.95) brightness(1.05) saturate(0.9)",
};
