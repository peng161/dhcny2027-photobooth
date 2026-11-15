# OneDH Card Booth

A phone-first photo booth that turns a photo into a collectible trading card, plus a live **Card Wall** where everyone's cards appear, with booster-pack openings for the big screen. Built for the Digital Hub CNY 2027 event.

**Live:** https://dhcny2027.pages.dev/photobooth

## What's in it
- **Booth** (`/photobooth/`): take or choose a photo, swipe through 10 card designs, pick your name and cluster, then print or save.
- **Card Wall** (`/photobooth/#board`): a Showcase view (spotlight card, scrolling card rivers, booster packs that open one card at a time) and a Grid view.
- **Organiser page** (`/photobooth/#admin`): every card setting, plus a key that lets that device remove cards from the wall.
- **Demo wall** (`/photobooth/?demo#board`): sample cards, for previewing the wall on a TV.

## Project layout
```
public/index.html              redirects to /photobooth/
public/photobooth/index.html   the whole booth and Card Wall (single file)
functions/api/cards.js         Card Wall API (Cloudflare Pages Function + Workers KV)
wrangler.toml                  Cloudflare Pages config
```

## Artwork not included
The card back and booster-pack images are internal and aren't in this repo. To use your own, add these to `public/photobooth/`:
- `card-back.webp` (card back, about 750 × 1050). Without it, a drawn card back is used.
- `pack-onedh.webp`, `pack-ai.webp`, `pack-cape.webp`, `pack-ms.webp`, `pack-swe.webp`, `pack-diux.webp` (pack art, about 1105 × 2000).

## Deploy (Cloudflare Pages)
```bash
npx wrangler kv namespace create cards           # put the id in wrangler.toml
npx wrangler pages project create <name> --production-branch main
npx wrangler pages secret put BOARD_PASS --project-name <name>   # event code staff enter
npx wrangler pages secret put ADMIN_KEY --project-name <name>    # organiser key for removing cards
npx wrangler pages deploy public --project-name <name> --branch main
```
