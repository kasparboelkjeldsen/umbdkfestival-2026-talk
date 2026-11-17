// The curse dial: one number, 0 (Kraftvaerk daylight) … 1 (DEMO TIME, fully consumed), that every
// effect keys off. It lives on :root as --curse (CurseLayer.vue writes it) and in `curse.value`.
//
// deck.js, per scene:
//   curse:   0…1, how cursed the deck is once this scene is on stage
//   cleanse: true, this scene lets the light back in: the curse drops to its `curse` value
//   sins:    true, the live demo drives the curse while this scene is on stage (sins.js: remaining
//            sins → curse), once the sin bridge is connected; otherwise the scripted value holds
//
// Rules:
//   - It only ever rises (a high-water mark), so flying back to an early card late in the talk shows
//     that card infected too. Only a `cleanse` scene lowers it.
//   - It doesn't jump on arrival: it follows the camera, so it's tweened over the flight itself
//     (progress = how far the camera has come from where it was, in position and zoom). That's
//     the live value (useCurse) and its 0.01 steps (useCurseFine: the mountain's time of day).
//     What the PAGE gets (useCurseStep: --curse on :root, zalgo, ghost text) moves in fewer, bigger
//     steps: a small rise (most flights: 0.02…0.1) lands whole as the flight sets off, a big change
//     (the cleanse after the demo) in quarters. Every change of --curse restyles the whole
//     document, about 50 ms on the talk's laptop: once while the camera is still slow, not three
//     or four times at full speed.
//   - While you stay on a card it creeps up by DRIFT per minute, never past the next scene's value.
//   - Keys: C purifies (curse 0, until pressed again); + and - nudge it by 0.1; S snaps back to
//     the script (the scene's own value, nudges and drift dropped). The engine's reset (R, the ↺
//     button) calls resetCurse() (CurseLayer.vue).
//
// Deck-local on purpose, but written so it could move to the engine: it only needs the deck's
// scenes and index (useDeck, handed in by CurseLayer.vue: importing useDeck here would be a
// circular import, since scenes import Zalgo, which imports this) and the shared camera.
import { reactive, computed, watch } from 'vue'
import { cam } from '@engine/cameraState.js'
import { sins } from './sins.js'

const DRIFT = 0.02 // per minute, while sitting on a card
const NUDGE = 0.1

const clamp = (v) => Math.min(1, Math.max(0, v))
const lerp = (a, b, t) => a + (b - a) * t

const state = reactive({
  base: 0,      // the high-water mark where the camera is heading
  from: 0,      // where the current flight started
  progress: 1,  // 0…1 along the current flight
  drift: 0,     // accumulated while sitting on the current card
  nudge: 0,     // + / - keys
  purified: false,
  bridged: false, // the scene on stage has `sins: true`
})

let started = false
let flightStart = null // { x, y, w } where the camera was when the scene changed
let driftTimer = null

// The curse a scene stands for, given what came before (deterministic, for a fresh load mid-deck)
function settledAt(scenes, i) {
  let peak = 0
  for (let k = 0; k <= i; k++) {
    const sc = scenes[k]
    if (sc.curse == null) continue
    peak = sc.cleanse ? sc.curse : Math.max(peak, sc.curse)
  }
  return peak
}

// The next value up the line, so drift never overtakes the script
function nextCurse(scenes, i) {
  for (let k = i + 1; k < scenes.length; k++) if (scenes[k].curse != null) return scenes[k].curse
  return 1
}

/** Start the controller with the deck's state ({ scenes, idx } from useDeck()). Once. */
export function startCurse({ scenes, idx }) {
  if (started) return
  started = true

  state.base = settledAt(scenes, idx.value)
  state.from = state.base

  watch(idx, (i, before) => {
    const sc = scenes[i]
    const current = value.value
    state.from = current
    state.drift = 0
    state.bridged = !!sc.sins
    if (sc.curse == null) state.base = Math.max(state.base, current)
    else state.base = sc.cleanse ? sc.curse : Math.max(state.base, sc.curse)
    state.progress = 0
    flightStart = { x: cam.x, y: cam.y, w: cam.w, target: sc.at ?? null, before }
  })

  // Follow the camera: progress is the share of the distance (in position and in zoom) covered.
  watch(() => [cam.x, cam.y, cam.w], ([x, y, w]) => {
    if (state.progress >= 1 || !flightStart) return
    const t = flightStart.target
    if (!t) { state.progress = 1; return }
    const tw = 1920 * (t.s ?? 1)
    const d0 = Math.hypot(t.x - flightStart.x, t.y - flightStart.y) / tw + Math.abs(Math.log(flightStart.w / tw))
    const d = Math.hypot(t.x - x, t.y - y) / tw + Math.abs(Math.log(w / tw))
    state.progress = d0 < 1e-3 ? 1 : clamp(1 - d / d0)
  })

  driftTimer = setInterval(() => {
    if (state.progress < 1) return
    const cap = Math.max(state.base, nextCurse(scenes, idx.value)) - state.base
    state.drift = Math.min(cap, state.drift + DRIFT / 60)
  }, 1000)

  state.bridged = !!scenes[idx.value].sins

  addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (e.key === 'c' || e.key === 'C') state.purified = !state.purified
    else if (e.key === 's' || e.key === 'S') {
      Object.assign(state, { base: settledAt(scenes, idx.value), drift: 0, nudge: 0, purified: false, progress: 1 })
    }
    else if (e.key === '+') state.nudge = clamp(state.nudge + NUDGE)
    else if (e.key === '-') state.nudge = Math.max(-1, state.nudge - NUDGE)
  })
}

// the curse with the flight `progress` (0…1) of the way done
function at(progress) {
  if (state.purified) return 0
  // the demo: the sins decide (tweened from wherever the flight in left the curse)
  if (state.bridged && sins.connected) return clamp(lerp(state.from, sins.curse, progress) + state.nudge)
  return clamp(lerp(state.from, state.base, progress) + state.drift + state.nudge)
}
const value = computed(() => at(state.progress))

// The flight's progress as the page hears it: all of a small change at once, a big one in quarters.
const SMALL = 0.12
const coarse = computed(() => {
  const p = state.progress
  if (p >= 1) return 1
  if (p <= 0) return 0
  return Math.abs(at(1) - at(0)) <= SMALL ? 1 : Math.min(1, Math.floor(p * 4) / 4 + 0.25)
})

/** Back to daylight (the engine's reset: R, the ↺ button). Not the high-water mark of the last run. */
export function resetCurse() {
  Object.assign(state, { base: 0, from: 0, drift: 0, nudge: 0, purified: false, progress: 1 })
}

// The curse as the page hears it (0.01 steps of the coarse progress above): what goes onto :root as
// --curse, and what the rest of the deck watches. Every change of --curse makes the browser
// recompute the style of the whole document (custom properties inherit), so it changes once or a
// few times per flight, and dependants only re-run when it does.
const stepped = computed(() => Math.round(at(coarse.value) * 100) / 100)
// … and following the camera all the way, for the little that can afford to (a few elements)
const fine = computed(() => Math.round(value.value * 100) / 100)

/** The curse as the page hears it (a computed): use this for anything that touches the DOM. */
export function useCurseStep() {
  return stepped
}

/** The curse in 0.01 steps along the flight (a computed): only for something small and cheap. */
export function useCurseFine() {
  return fine
}

/** The live curse (a computed 0…1). It stays 0 until CurseLayer.vue has started the controller. */
export function useCurse() {
  return value
}

export const curseState = state
