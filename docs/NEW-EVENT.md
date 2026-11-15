# Running the booth for a new event

Everything about one event lives in `public/photobooth/events/<id>/`. A new event is a new
folder. You don't change any code.

## 1. Copy the event folder

```bash
cp -R public/photobooth/events/dhcny2027 public/photobooth/events/myevent
```

Use a short id: lowercase letters, numbers and dashes only (for example `sportsday2027`).

## 2. Edit `events/myevent/event.json`

| Section | What it controls |
|---|---|
| `storage.prefix` | Prefix for what each phone remembers (event code, settings). **Use a new one per event**, e.g. `"sd"`. |
| `storage.galleryDb`, `storage.filePrefix` | Name of the saved-cards store on each phone, and of downloaded files. |
| `brand` | App and wall names (the `…Html` versions may contain a `<span>` for the gold word), tagline, the footer line printed on every card, the banner on Holo Strike cards, how many cards in the set. |
| `labels` | Words on the booth form, e.g. "Your cluster" → "Your house". |
| `teams` | The groups people pick: label, full name, colours (`c1`, `c2`, `sym`) and icon (`glyph`: sparkle, cube, cloud, code, cursor, coin, star, or monkey for the mascot face). Mark one as hidden if it is only a fallback. |
| `everyoneTeam` | The team used for guests and mixed packs. |
| `defaultCard` | The moves, ability and stats on a fresh card. |
| `content` | Everything "New moves" shuffles through: moves per team and shared, abilities, species, flavour text, weaknesses, resistances, retreat costs, stages. |
| `text` | Small print on the card designs (magazine masthead, stamp text, wanted-poster motto…). `{team}` / `{TEAM}` are filled in with the person's team. |
| `designs.names` | Rename any design for this event, e.g. `{"strike": "Sports Day Holo"}`. |
| `packs` | The series line on the booster packs, and a tag line per team. |
| `wall.defaultBackground` | Which wall background a new screen starts with: `ink`, `goat`, `koi`, `fireworks`, `prosperity`, `lantern`, `neon`, `arena`, `classic`. |

Tip: check the file is valid JSON before deploying (`python3 -m json.tool event.json`).

## 3. Add the artwork

Put these in `events/myevent/assets/` (they stay out of the public git repo):

- `card-back.webp`: the back of the card, shown when packs open (750 × 1050).
- `pack-<team>.webp`: one booster-pack image per team, including the everyone team.

Without them the wall still works: it draws a plain card back, and packs show without art.

## 4. Point the page at the event

In `public/photobooth/index.html`, change:

```html
<meta name="event" content="myevent">
```

## 5. Give it its own storage and codes

So cards from different events never mix:

1. Create a new KV namespace in Cloudflare (Workers & Pages → KV), and put its id in `wrangler.toml`.
2. Set new secrets for the event code and organiser key:
   ```bash
   npx wrangler pages secret put BOARD_PASS --project-name <project>
   npx wrangler pages secret put ADMIN_KEY --project-name <project>
   ```
3. Deploy:
   ```bash
   npx wrangler pages deploy public --project-name <project> --branch main
   ```

## 6. Check before the day

- Open the booth on a phone, take a selfie, swipe through a few designs and colours.
- Open `…/photobooth/?demo#board` to see the wall with sample cards.
- Post one real card and watch it arrive on the wall.
- Run `node tools/check-css.mjs` and `node tools/test-api.mjs`.
