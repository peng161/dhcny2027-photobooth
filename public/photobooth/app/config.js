// Loads the event this booth is running. Everything event-specific comes from
// events/<id>/event.json; the code never names a particular event.
// The event id comes from <meta name="event" content="..."> in index.html.
// The event id comes from <meta name="event">; ?event=<id> previews another event folder.
const id = (new URLSearchParams(location.search).get("event") || document.querySelector('meta[name="event"]')?.content || "").trim();
if (!/^[a-z0-9-]{1,40}$/.test(id)) throw new Error(`Bad event id "${id}" in <meta name="event">`);

const res = await fetch(`events/${id}/event.json`, { cache: "no-cache" });
if (!res.ok) throw new Error(`Couldn't load events/${id}/event.json (${res.status})`);
export const EVENT = await res.json();
EVENT.id = id;

/** Path to a file in this event's assets folder (pack art, card back...). */
export const asset = (file) => `events/${id}/assets/${file}`;
/** localStorage key for this event, e.g. key("pass") -> "dh-pass". */
export const key = (name) => `${EVENT.storage.prefix}-${name}`;
/** Event text, with {team} / {TEAM} filled in. */
export const txt = (name, vars = {}) =>
  String(EVENT.text[name] ?? "").replace(/\{(team|TEAM)\}/g, (_, k) => (k === "TEAM" ? String(vars.team ?? "").toUpperCase() : String(vars.team ?? "")));

// Teams (clusters, houses, tables, sides of the family...)
export const TYPES = EVENT.teams;
export const TEAM_KEYS = Object.keys(TYPES).filter((k) => !TYPES[k].hidden);
/** The "everyone" team: guests, mixed packs and the fallback look. */
export const EVERYONE = EVENT.everyoneTeam;

// Card content to shuffle through. A team without its own list falls back to the shared one,
// so a new event only has to fill in what it wants to customise.
const C = EVENT.content;
for (const [name, fallback] of [["teamMoves", C.sharedMoves], ["abilities", C.abilities?.shared], ["fortunes", C.fortunes?.shared],
  ["flavor", C.flavor?.shared], ["weaknesses", C.weaknesses?.shared], ["resistances", C.resistances?.shared], ["species", ["Guest Type"]]]) {
  C[name] ||= {};
  for (const k of Object.keys(TYPES)) if (!Array.isArray(C[name][k]) || !C[name][k].length) C[name][k] = fallback || [];
}
export const TEAM_MOVES = C.teamMoves, SHARED_MOVES = C.sharedMoves, ABILITIES = C.abilities, SPECIES = C.species,
  FLAVOR = C.flavor, STATS = C.stats, WEAK = C.weaknesses, RESIST = C.resistances, RETREAT = C.retreats,
  STAGES = C.stages, FORTUNES = C.fortunes, LUCKY = C.luckyNumbers;

// Booster packs
export const SERIES_LINE = EVENT.packs.seriesLine;
export const PACK_SERIES = EVENT.packs.series;
export const PACK_ORDER = Object.keys(PACK_SERIES);
