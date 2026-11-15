import { curDesign } from "./designs.js";
import { drawBlueprint } from "./layouts/blueprint.js";
import { drawClassic } from "./layouts/classic.js";
import { drawCover } from "./layouts/cover.js";
import { drawDeco } from "./layouts/deco.js";
import { drawDuel } from "./layouts/duel.js";
import { drawFull } from "./layouts/full.js";
import { drawIllus } from "./layouts/illus.js";
import { drawPolaroid } from "./layouts/polaroid.js";
import { drawRookie } from "./layouts/rookie.js";
import { drawScroll } from "./layouts/scroll.js";
import { drawStamp } from "./layouts/stamp.js";
import { drawStrike } from "./layouts/strike.js";
import { drawWanted } from "./layouts/wanted.js";
import { H, W } from "../core/util.js";
export let PHOTO = { x: 54, y: 120, w: 642, h: 420 };

export const LAYOUT_PHOTO = {
  mosaic: { x: 24, y: 24, w: W - 48, h: H - 48, focus: 440 }, illus: { x: 16, y: 16, w: W - 32, h: H - 32, focus: 440 },
  strike: { x: 22, y: 22, w: W - 44, h: H - 44, focus: 400 }, full: { x: 22, y: 22, w: W - 44, h: H - 44 },
  classic: { x: 54, y: 120, w: 642, h: 420 },
  blueprint: { x: 66, y: 152, w: 618, h: 448 }, cover: { x: 22, y: 22, w: W - 44, h: H - 44, focus: 470 },
  stamp: { x: 94, y: 176, w: 562, h: 420 }, polaroid: { x: 122, y: 172, w: 506, h: 420 },
  scroll: { x: 164, y: 158, w: 470, h: 470 }, deco: { x: 96, y: 166, w: 558, h: 450 },
  duel: { x: 74, y: 172, w: 602, h: 520 }, wanted: { x: 104, y: 244, w: 542, h: 368 }, rookie: { x: 30, y: 30, w: W - 60, h: 720 },
};
export const LAYOUT_DRAW = { illus: drawIllus, mosaic: drawIllus, strike: drawStrike, full: drawFull, classic: drawClassic,
  blueprint: drawBlueprint, cover: drawCover, duel: drawDuel, wanted: drawWanted, rookie: drawRookie, stamp: drawStamp, polaroid: drawPolaroid, scroll: drawScroll, deco: drawDeco };

export function drawCard(ctx, scale = 1) {
  const D = curDesign();
  PHOTO = { ...(LAYOUT_PHOTO[D.layout] || LAYOUT_PHOTO.classic) };
  ctx.save();
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  (LAYOUT_DRAW[D.layout] || drawClassic)(ctx, D);
  ctx.restore();
}
