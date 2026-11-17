<script setup>
// ONE live backoffice that travels between cards, rendered in the deck's `over` layer (deck.js
// `layers`), i.e. in world space above the cards. It's never reparented, so it never reloads: when
// a scene with a `backoffice` field comes on stage, the surface moves onto that card's slot and
// navigates the backoffice to the route in place. It boots with the deck (off on its first host),
// so the first flight into it is never a cold load.
//
//   backoffice: { route, keys?, zoom?, cx, cy, w }   lands on this card's slot (a 16:9 box in its
//                                                    1920×1080 space, which the card draws)
//   backoffice: { tour: ['c3-types', …] }            on build step k it goes to the k-th of those
//                                                    scenes' slots and routes (no scene uses it now)
//   backoffice: { …, byStep: { 1: { route, keys, theme, highlight } } }   from that build step on, those win
//                                                    (the demo: Settings first, a spotlight on press 1,
//                                                    the board on press 2)
//
// Its theme is Umbraco's own light one ('pure') everywhere, unless the host says otherwise:
// `theme: n` (a sin level 1…10) sets that once as it lands, then leaves the theme to the backoffice
// (the Penance Board picks its own level from the sins it finds, and every absolution lowers it);
// `theme: null` leaves whatever is there.
// `highlight` (in a byStep entry: it lasts until the next entry) puts a spotlight on something in the
// backoffice: components/spotlight.js.
//
// It shows on its host while that's on stage, and stays on it (as part of the card) while the
// camera flies to or from a neighbour. It hides when the card turns over (its back is a static
// "after"), during the formation and the hand (cards move, layers don't), on outer layers and in
// the overview. The presenter window has no layers, so it never boots a second backoffice.
import { ref, computed, watch, watchEffect } from 'vue'
import { useDeck } from '@engine/useDeck.js'
import { zoomOf } from '@engine/cameraState.js'
import LiveUmbraco from './LiveUmbraco.vue'
import { sins } from '../curse/sins.js'
import { STATIC } from './evidence.js'

const W = 1920
const H = 1080
const { scenes, idx, step, overview } = useDeck()
const byId = new Map(scenes.map((s, i) => [s.id, i]))

// the place and route for a scene at a step: { i (the scene whose slot it is), route, keys, zoom } | null
function placeFor(i, st) {
  const bo = scenes[i]?.backoffice
  if (!bo) return null
  if (bo.tour) {
    const k = Math.min(bo.tour.length, st) - 1
    return k < 0 ? null : placeFor(byId.get(bo.tour[k]), 0)
  }
  // byStep: the settings of the highest step reached win
  const at = Object.keys(bo.byStep ?? {}).map(Number).filter((k) => k <= st).sort((a, b) => b - a)[0]
  const over = at != null ? bo.byStep[at] : {}
  // (theme: null in a step means "leave it as it is", so it's looked up by key, not with ??)
  const theme = 'theme' in over ? over.theme : bo.theme ?? 'pure'
  return { ...bo, ...over, i, keys: over.keys ?? bo.keys ?? 'deck', zoom: bo.zoom ?? 0.6, theme }
}

const firstHost = scenes.findIndex((s) => s.backoffice && !s.backoffice.tour)
const place = ref(placeFor(firstHost, 0))
const here = computed(() => placeFor(idx.value, step.value))
watch(here, (p) => { if (p) place.value = p }, { immediate: true })

// a neighbour the surface may stay visible next to: an ordinary card, not the host's other face
const quiet = (i) => {
  const sc = scenes[i]
  return sc && !sc.formation && !sc.hand && !sc.outer && !sc.backoffice?.tour
}
const visible = computed(() => {
  if (overview.value || !place.value) return false
  const h = place.value.i
  const now = idx.value
  if (here.value) return here.value.i === h
  const sc = scenes[now]
  if (!quiet(now) || sc.back === scenes[h].id || scenes[h].back === sc.id) return false
  return Math.abs(now - h) <= 1
})
const onStage = computed(() => !!here.value && here.value.i === place.value?.i && !overview.value)

// card-local (cx, cy) → world: the card's centre plus the rotated, scaled offset from its middle
const style = computed(() => {
  const sc = scenes[place.value.i]
  const { x = 0, y = 0, r = 0, s = 1 } = sc.at ?? {}
  const { cx, cy, w } = sc.backoffice
  const h = (w * 9) / 16
  const a = (r * Math.PI) / 180
  const dx = (cx - W / 2) * s
  const dy = (cy - H / 2) * s
  const X = x + dx * Math.cos(a) - dy * Math.sin(a)
  const Y = y + dx * Math.sin(a) + dy * Math.cos(a)
  return {
    width: `${w}px`,
    height: `${h}px`,
    transform: `translate(${X - w / 2}px, ${Y - h / 2}px) rotate(${r}deg) scale(${s})`,
  }
})

// It materialises with its card: the same zoom band as the card's InlaySlide (Detail, default from
// 0.3, fading in from 0.7 × that), so a flight past it never shows a white backoffice hanging in
// space before the card around it. Written straight to the element: the camera moves every frame.
const FROM = 0.3
const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x))
const fade = ref(null)
watchEffect(() => {
  const el = fade.value
  if (!el || !place.value) return
  const z = zoomOf(scenes[place.value.i].at?.s ?? 1)
  const a = Math.round(smooth((z - FROM * 0.7) / (FROM * 0.3)) * 1000) / 1000
  el.style.opacity = a >= 1 ? '' : String(a)
})

// the site came back (after the deck's reset ran reset.ps1, or a restart): a fresh backoffice
// (only a comeback: not the first answer at boot). The deck's reset (R, ↺) reloads it at once too:
// the Penance Board keeps its place in memory, and CurseLayer has just wiped its stored state.
const boots = ref(0)
const { resets } = useDeck()
watch(resets, () => { boots.value++ })
// Only after a real outage (a restart takes a minute or two): a busy site can miss a status poll
// in the middle of a fix (grouping the dictionary keys), and a reload mid-demo threw the board out.
const OUTAGE = 20000 // ms
let up = false
let lostAt = 0
watch(() => sins.connected, (now) => {
  if (!now && up && !lostAt) lostAt = performance.now()
  if (now && lostAt) {
    if (performance.now() - lostAt > OUTAGE) boots.value++
    lostAt = 0
  }
  if (now) up = true
})

const lastRouted = ref(null)
function onRouted(e) {
  lastRouted.value = e
  console.log(`[backoffice-surface] ${e.route} in ${e.ms ?? '>4000'} ms`)
}

// Emergency: L hides the live backoffice (the card's fallback screenshots show underneath) and
// brings it back. It stays loaded while hidden.
const hidden = ref(false)
addEventListener('keydown', (e) => {
  if ((e.key === 'l' || e.key === 'L') && !e.ctrlKey && !e.metaKey && !e.altKey) hidden.value = !hidden.value
})
defineExpose({ lastRouted, hidden })
</script>

<template>
  <!-- not in a built deck: there is no site behind it (the cards show a stand-in on their slots) -->
  <div v-if="place && !STATIC" class="backoffice-surface" :class="{ 'on-stage': onStage, gone: hidden || !visible }" :style="style">
    <div ref="fade" class="fade">
      <LiveUmbraco :key="boots" :route="place.route" :on-stage="onStage && !hidden" :keys="place.keys" :zoom="place.zoom" :theme="place.theme" :highlight="place.highlight ?? null" @routed="onRouted" />
    </div>
  </div>
</template>

<style scoped>
.backoffice-surface {
  position: absolute;
  left: 0;
  top: 0;
  transform-origin: 50% 50%;
  transition: opacity 0.3s;
}
/* the zoom fade (and the shadow, so it fades with it); eased like the inlays (theme.css) */
.fade {
  width: 100%;
  height: 100%;
  border-radius: 18px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
  transition: opacity 0.45s ease-out;
}
/* hidden: fade out first, then jump (no flying across the world while invisible) */
/* 0.25 s: gone before a turning card starts to rotate (the engine turns it 300 ms in) */
.gone { opacity: 0; visibility: hidden; transition: opacity 0.25s, visibility 0s 0.25s; }
</style>
