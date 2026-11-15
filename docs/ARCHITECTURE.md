# Architecture

A phone-first photo booth that turns a selfie into a collectible trading card, plus a live
Card Wall where posted cards open in booster packs. No build step: the browser loads the
ES modules directly, and Cloudflare Pages serves the files and one API function.

```
public/
  _headers                       security headers (CSP, no framing, HSTS…)
  photobooth/
    index.html                   page shell: markup only, no inline script
    styles/
      base.css                   theme colours, reset, buttons, panels, shared pop-ups
      booth.css                  the card booth
      wall.css                   the Card Wall
      print.css                  print layouts
    events/<id>/
      event.json                 EVERYTHING specific to one event (see NEW-EVENT.md)
      assets/                    pack art + card back (internal, not in git)
    app/
      main.js                    start-up: fills event text, routes #board / #admin
      config.js                  loads events/<id>/event.json, exports helpers
      core/
        util.js                  canvas + text helpers, local storage, toast
        session.js               event code, organiser key, API client
      cards/                     ── the card engine (no DOM, draws onto a canvas)
        palettes.js              metal/colour gradients
        designs.js               the 22 designs + 10 colour themes each
        kit.js                   shared card pieces: header, moves, stats, badge, footer…
        layouts/*.js             one file per card layout
        renderer.js              drawCard(ctx): picks the layout and draws
      booth/                     ── making a card
        state.js                 the card being edited, the photo, event settings
        preview.js               live preview + export at print size
        editor.js                design/colour picker, cluster, shuffle moves, organiser form
        camera.js                camera, snap, upload, save to phone
        photo-drag.js            swipe to change design, drag/zoom the photo
        gallery.js               saved cards (IndexedDB)
        print.js                 single card / 9-up sheet printing
        post.js                  post to the Card Wall
      wall/                      ── the Card Wall
        wall.js                  loading cards, packs, booster box, rivers, centre card
        packart.js               booster-pack artwork per team
        backgrounds.js           the 9 animated backgrounds
        demo.js                  sample cards for ?demo
functions/api/cards.js           the API: list / fetch / post / delete cards (Workers KV)
tools/                           checks you can run with node (see below)
```

## How the pieces depend on each other

```
main ──► booth/* ──► cards/* ──► core/*
   └───► wall/*  ──► cards/*      ▲
                └──► core/* ──────┘
everything ──► config.js ──► events/<id>/event.json
```

- **cards/** is the reusable engine. It only reads the current card (`booth/state.js`)
  and draws to whatever canvas it is given. It never touches the page.
- **booth/** and **wall/** are the two screens. They share the engine and `core/`,
  and never style each other (checked by `tools/check-css.mjs`).
- **config.js** is the only place that knows which event is running. Code asks it for
  text (`T("coverTopLine")`), storage keys (`key("pass")`), asset paths (`asset("pack-ai.webp")`)
  and the teams, moves and pack series.

## Adding things

- **A new card layout:** add `cards/layouts/<name>.js` exporting `draw<Name>(ctx, D)`,
  register it in `LAYOUT_DRAW` / `LAYOUT_PHOTO` in `cards/renderer.js`, and add a design
  that uses it in `cards/designs.js`. Use the pieces in `kit.js` for the header, moves,
  stats and footer so it matches the rest.
- **A new colour theme:** add it to `THEMES` in `cards/designs.js`; `themeFor()` maps it
  onto every layout.
- **A new wall background:** add a `bg<Name>(g, w, h, dt, t)` function in
  `wall/backgrounds.js` and list it in `WALL_BGS` / `drawBg()`.

## Checks

```bash
node tools/check-css.mjs     # the booth and wall stylesheets can't restyle each other
node tools/test-api.mjs      # 18 security tests for the API (no network needed)
```

## Data and privacy

- Cards are JPEGs in Workers KV, keyed `<reverse-timestamp>-<random>-<team>` so the
  newest sort first and the key says which pack a card opens in.
- The event code (`BOARD_PASS`) and organiser key (`ADMIN_KEY`) are Cloudflare secrets,
  never in the repo. The browser keeps them in localStorage under the event's prefix.
