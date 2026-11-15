# Card Booth

A phone-first photo booth that turns a photo into a collectible trading card, plus a live **Card Wall** where everyone's cards appear, with booster-pack openings for the big screen. Built for the Digital Hub CNY 2027 event, and reusable for any event: everything event-specific lives in one `event.json`.

**Live:** https://dhcny2027.pages.dev/photobooth

## What's in it
- **Booth** (`/photobooth/`): take or choose a photo, swipe through 22 card designs with 10 colour themes each, pick your name and team, then print, save or post.
- **Card Wall** (`/photobooth/#board`): booster-box opening, card rivers, a spotlight card, 9 animated backgrounds, and a grid view.
- **Organiser page** (`/photobooth/#admin`): every card setting, plus a key that lets that device remove, download or print all cards.
- **Demo wall** (`/photobooth/?demo#board`): sample cards, for previewing the wall on a TV.
- **Sample event** (`/photobooth/?event=example-sportsday`): the same app re-skinned as a sports day, from its own `event.json`.

## Docs
- [docs/NEW-EVENT.md](docs/NEW-EVENT.md): run the booth for a new event (no code changes).
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): how the code is organised and how to add designs, colours and backgrounds.

## Project layout
```
public/photobooth/index.html          page shell
public/photobooth/app/                ES modules: core, cards (engine), booth, wall
public/photobooth/styles/             base, booth, wall and print styles
public/photobooth/events/<id>/        event.json + internal artwork per event
functions/api/cards.js                Card Wall API (Cloudflare Pages Function + Workers KV)
tools/                                check-css.mjs, test-api.mjs
```

## Artwork not included
Pack art and the card back are internal and aren't in this repo. Put your own in `public/photobooth/events/<id>/assets/`:
- `card-back.webp` (about 750 × 1050). Without it, a drawn card back is used.
- `pack-<team>.webp` for each team in `event.json` (about 1105 × 2000).

## Checks
```bash
node tools/check-css.mjs    # booth and wall styles can't restyle each other
node tools/test-api.mjs     # API security tests
```

## Deploy (Cloudflare Pages)
```bash
npx wrangler kv namespace create cards           # put the id in wrangler.toml
npx wrangler pages project create <name> --production-branch main
npx wrangler pages secret put BOARD_PASS --project-name <name>   # event code staff enter
npx wrangler pages secret put ADMIN_KEY --project-name <name>    # organiser key for removing cards
npx wrangler pages deploy public --project-name <name> --branch main
```
