// The whole thing falls apart (deck.js `fallApart: n` on a scene: from its build step n). Every card of
// the talk drops off the bottom of the screen, each with its own delay and tumble, the way the
// reveal's backoffice chrome does (scenes/Reveal.vue); the scene after it (Thank you) comes back up
// as the camera flies in to it. Back to any earlier scene (or the overview) and it's all home again.
//
// The cards are the engine's own scene elements, so nothing here touches their classes or their
// transform (Vue owns those). Each card gets CSS variables, and :root gets `falling`; theme.css turns
// that into the individual `translate` (on the card: world px, so it falls straight down whatever its
// size) and `rotate` (on its .scene-frame: about its own middle) properties, which stack on top of
// the engine's transform.
import { watchEffect } from 'vue'
import { cam } from '@engine/cameraState.js'

function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Start it with the deck's state ({ scenes, idx, step, overview } from useDeck()). */
export function startFallApart({ scenes, idx, step, overview }) {
  const at = scenes.findIndex((s) => s.fallApart != null)
  if (at < 0 || typeof document === 'undefined') return
  const from = scenes[at].fallApart
  const after = at + 1 < scenes.length ? at + 1 : -1
  let laidOut = false

  const cards = () => [...document.querySelectorAll('.world > .scene')]

  // where each card ends up: just below the screen the camera shows when it starts, plus a little
  function layOut() {
    const rnd = mulberry32(20261125)
    const viewH = (cam.w * 9) / 16
    const bottom = cam.y + viewH / 2
    cards().forEach((el, i) => {
      const sc = scenes[i]
      const p = sc?.at ?? { x: 0, y: 0, s: 1 }
      const half = 540 * (p.s ?? 1)
      const dy = Math.max(0, bottom - ((p.y ?? 0) - half)) + viewH * (0.15 + rnd() * 0.35)
      const st = el.style
      st.setProperty('--fall-x', `${((rnd() - 0.5) * viewH * 0.25).toFixed(0)}px`)
      st.setProperty('--fall-y', `${dy.toFixed(0)}px`)
      st.setProperty('--fall-r', `${((rnd() < 0.5 ? -1 : 1) * (14 + rnd() * 50)).toFixed(1)}deg`)
      st.setProperty('--fall-d', `${(0.25 + rnd() * 1.1).toFixed(2)}s`)
      st.setProperty('--fall-t', `${(1.5 + rnd() * 0.9).toFixed(2)}s`)
      st.setProperty('--fall-on', '1')
    })
    laidOut = true
  }

  watchEffect(() => {
    const i = idx.value
    const falling = !overview.value && ((i === at && step.value >= from) || (after >= 0 && i === after))
    if (falling && !laidOut) layOut()
    if (!falling) laidOut = false
    document.documentElement.classList.toggle('falling', falling)
    // the scene after: home again, at once and smoothly, while the camera flies in to it
    const next = after >= 0 ? cards()[after] : null
    if (next) {
      next.style.setProperty('--fall-on', i === after ? '0' : '1')
      if (i === after) {
        next.style.setProperty('--fall-d', '0s')
        next.style.setProperty('--fall-t', '1.6s')
      }
    }
  })
}
