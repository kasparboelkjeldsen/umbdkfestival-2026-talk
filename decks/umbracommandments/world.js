// Where everything is. One picture, nested: the talk lives inside the revelation.
//
//   the revelation (Mount Bellissima, a huge card)
//     └─ the tablets card, in the hiker's hands (components/mountain/Hiker.vue holds it)
//          └─ ten commandment cards, set into the carved lines (five per tablet)
//               └─ their sub-scenes, on the stone beside them (or inside them)
//
// The nesting is geometry only (nest() from the engine), never `parent`: nested cards can't turn
// over or join the formation and the hand on their own, and here they need to. Each card fades in
// as the camera comes close (components/InlaySlide.vue), so from far away you only see the carving.
//
// Sizes are chosen so a commandment card comes out at about scale 1: the revelation is BIG× a card.
import { nest } from '@engine/layout.js'

export const BIG = 36
const U = 1920 * BIG * 1.2 // one step along the top row

// ---- the top row: daylight, at the revelation's size ----
export const TITLE = { x: -3 * U, y: 0, s: BIG }
export const WHY = { x: -2 * U, y: 0, s: BIG }
export const DISCLAIMER = { x: -1 * U, y: 0, s: BIG }
export const REVELATION = { x: 0, y: 0, s: BIG }
export const BONUS = { x: 1 * U, y: 0, s: BIG }
export const THANKS = { x: 2 * U, y: 0, s: BIG }

// ---- the pit: below the mountain ----
// far enough down that its zalgo columns never reach up into the daylight mountain
export const DEMO_TIME = { x: 0, y: 1080 * BIG * 1.9, s: BIG }

// The pull-back (S17): the mountain with some canvas round it, for the ghost text out there
export const PULLBACK = { ...REVELATION, s: BIG * 1.45 }

// ---- in the revelation: where he holds the tablets (revelation card px; Hiker.vue's hands sit under it) ----
export const TABLETS_SLOT = { cx: 1032, cy: 280, w: 390 }
// S5's detail zoom (frames): the tablets in his hands, his laughing face under them
export const TINY_TEXT = { cx: 1036, cy: 345, w: 640 }
export const TABLETS = nest(REVELATION, TABLETS_SLOT)

// ---- in the tablets card ----
export const TABLET_X = [675, 1305] // centre of the left and right tablet
export const STONE = { top: 40, bottom: 1050, w: 610 }
export const LINE_Y = [300, 460, 620, 780, 940]
export const INLAY_W = 260
export const SIDE_W = 150
export const SIDE_DX = 222 // from the line's centre to a side slot's centre

/** Commandment n (1…10): its line on the tablets, in the tablets card's px. */
export function line(n) {
  const t = n <= 5 ? 0 : 1
  return { cx: TABLET_X[t], cy: LINE_Y[(n - 1) % 5], w: INLAY_W }
}
/**
 * A slot on the stone beside line n: side -1 (left) or 1 (right). `stack` -1 / 1: the upper or lower
 * of two slots stacked on that side (a little smaller, so both fit between the lines: III's left
 * side holds the media root and the dictionary).
 */
export const STACK_W = 140
export const STACK_DY = 45
export function side(n, dir, stack = 0) {
  const l = line(n)
  if (stack) return { cx: l.cx + dir * SIDE_DX, cy: l.cy + stack * STACK_DY, w: STACK_W }
  return { cx: l.cx + dir * SIDE_DX, cy: l.cy, w: SIDE_W }
}

export const commandmentAt = (n) => nest(TABLETS, line(n))
export const sideAt = (n, dir, stack = 0) => nest(TABLETS, side(n, dir, stack))

// The recap: both tablets again, from a little further out (some sky round them)
export const RECAP_ZOOM = 1.3
export const RECAP = { ...TABLETS, s: TABLETS.s * RECAP_ZOOM }

// The reveal (S23): the dashboard's content area in the drawn backoffice, where the talk sits.
// It sits in the dashboard area of the drawn 1440 × 810 screen (x 395…1920, y 173…1080 on the card).
export const REVEAL_HOLE = { cx: 1158, cy: 627, w: 1470 }

// ---- inside sub-scenes ----
// c7: the navigation partial sits at the root of the tree it walks
export const TREE_CODE = { cx: 960, cy: 150, w: 420 }
// the box the travelling backoffice lands on (Evidence.vue)
export { SLOT, DEMO_SLOT } from './components/evidence.js'

export const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
