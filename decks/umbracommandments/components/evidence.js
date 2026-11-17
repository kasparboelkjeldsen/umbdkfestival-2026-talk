// The box the travelling backoffice (BackofficeSurface.vue) lands on, in a card's 1920×1080 space.
// Shared by the cards that draw it (Evidence.vue, Demo.vue) and deck.js (`backoffice`).
export const SLOT = { cx: 960, cy: 600, w: 1600 }
// The demo's: nearly the whole card (the dashed border still fits round it)
export const DEMO_SLOT = { cx: 960, cy: 540, w: 1820 }
// A built deck (npm run deck -- build / compile) has no dev server, so no proxy to the demo site and
// no live backoffice: the travelling surface stays away and the cards say so on their slots.
export const STATIC = import.meta.env.PROD
export const slotBox = ({ cx, cy, w } = SLOT) => {
  const h = (w * 9) / 16
  return { left: `${cx - w / 2}px`, top: `${cy - h / 2}px`, width: `${w}px`, height: `${h}px` }
}
