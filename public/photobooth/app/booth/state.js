import { EVENT, key } from "../config.js";
import { store } from "../core/util.js";
export const event = Object.assign({ set: EVENT.brand.setLine, banner: EVENT.brand.banner, num: 1, total: EVENT.brand.totalCards, autoshuffle: true }, store.get(key("event"), {}));

export const card = {
  name: "", ...structuredClone(EVENT.defaultCard),
  frame: "strike", color: 0, filter: "none", holo: true, seal: false, monkey: "right", prop: "laptop",
};
export const photo = { img: null, zoom: 1, ox: 0, oy: 0 };
