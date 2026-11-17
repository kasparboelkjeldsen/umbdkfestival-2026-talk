<script setup>
// The curse, over the whole stage (deck.js `layers.stage`): writes --curse onto :root so every card
// and the canvas can key off it, and draws what belongs to the screen rather than to a card:
// a vignette that closes in, a film grain that thickens, and the warm flash of an absolution.
//
// It's also where the deck's state reaches the scenes (state.js) and where the sin bridge starts
// (sins.js), since this is the one deck component that can call useDeck().
//
// The deck's reset (R, the ↺ button, from any window) resets everything: daylight again, and
// "maximum sin" on the demo site: it asks the rig in start.mjs to stop the site, run
// Umbraco.Community.Sinners' reset.ps1 (which also plants the sinful media) and start it again.
import { ref, computed, watch, watchEffect } from 'vue'
import { useDeck } from '@engine/useDeck.js'
import { useCurseStep, startCurse, resetCurse } from './curse.js'
import { sins, startSins, resetSins, forgetBoard } from './sins.js'
import { deckState } from '../state.js'
import { startFallApart } from './fallApart.js'

const deck = useDeck()
startCurse(deck)
startSins()
startFallApart(deck) // the end: everything falls apart (deck.js `fallApart`)
// --curse goes onto :root in 0.01 steps, and at most every 250 ms (the last value always lands).
// Changing any custom property on :root restyles the whole document, so during a flight this is a
// handful of restyles instead of one per frame.
const curse = useCurseStep()
const grainMoves = ref(false)
const WRITE_EVERY = 250
let lastWrite = 0
let pending = null
function write() {
  pending = null
  lastWrite = performance.now()
  const c = curse.value
  const root = document.documentElement
  root.style.setProperty('--curse', c.toFixed(2))
  // the grain only moves once there's something to see, the logo only shivers past 0.6
  grainMoves.value = c > 0.25
  root.classList.toggle('shivering', c > 0.6)
}
watch(curse, () => {
  if (pending) return
  const wait = WRITE_EVERY - (performance.now() - lastWrite)
  if (wait <= 0) write()
  else pending = setTimeout(write, wait)
}, { immediate: true })

// Film grain: a tile of noise, made once. (It used to be an SVG turbulence filter as a background
// image: the browser ran that filter again for every frame, over the grain's whole area, four
// stages' worth of pixels. A third of the frame time once the curse was up.)
function grainTile(size = 256) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  const img = ctx.createImageData(size, size)
  let seed = 20261125
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.round((rnd() * 0.65 + rnd() * 0.35) * 255)
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 140
  }
  ctx.putImageData(img, 0, 0)
  return `url("${c.toDataURL('image/png')}")`
}
const grain = grainTile()

// `grainFrom: n` on a scene (deck.js): no film grain while it's on stage before build step n (the
// demo: none over the pure Settings it opens on), and from then on not before the Penance Board
// has fallen: it lands spotless and turns to hell by itself a moment later, and says so (sins.hell).
const grainOff = computed(() => {
  const sc = deck.scenes[deck.idx.value]
  if (sc?.grainFrom == null || deck.overview.value) return false
  return deck.step.value < sc.grainFrom || !sins.hell
})
// (back on the pure page: the next landing is a fall again)
watchEffect(() => {
  const sc = deck.scenes[deck.idx.value]
  if (sc?.grainFrom != null && deck.step.value < sc.grainFrom) sins.hell = false
})

deckState.ids = deck.scenes.map((s) => s.id)
deckState.live = true
watchEffect(() => {
  deckState.idx = deck.idx.value
  deckState.step = deck.step.value
  deckState.overview = deck.overview.value
  // while the formation is up, the cards set into others show whatever their zoom (theme.css)
  const sc = deck.scenes[deck.idx.value]
  document.documentElement.classList.toggle('in-formation', !!sc?.formation && !deck.overview.value)
})

// ---- an absolution: warm light and a chisel strike ----
const flash = ref(0)
let audio
function chisel() {
  try {
    audio ??= new AudioContext()
    const t = audio.currentTime
    // the strike: a short burst of noise through a bandpass, and a stony ring
    const len = Math.floor(audio.sampleRate * 0.25)
    const buf = audio.createBuffer(1, len, audio.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6)
    const noise = audio.createBufferSource()
    noise.buffer = buf
    const band = audio.createBiquadFilter()
    band.type = 'bandpass'
    band.frequency.value = 2400
    band.Q.value = 0.9
    const gain = audio.createGain()
    gain.gain.value = 0.9
    noise.connect(band).connect(gain).connect(audio.destination)
    noise.start(t)
    const ring = audio.createOscillator()
    const rg = audio.createGain()
    ring.frequency.value = 1350
    rg.gain.setValueAtTime(0.12, t)
    rg.gain.exponentialRampToValueAtTime(0.0001, t + 0.5)
    ring.connect(rg).connect(audio.destination)
    ring.start(t)
    ring.stop(t + 0.5)
  } catch {}
}
watch(() => sins.absolutions, () => {
  chisel()
  flash.value++
})

// ---- rehearsal: maximum sin everywhere ----
const toast = ref('')
let toastTimer
function say(msg, ms = 6000) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), ms)
}
watch(deck.resets, async () => {
  resetCurse()
  resetSins()
  forgetBoard() // the board starts at the beginning again (the live backoffice reloads with it)
  try {
    const res = await fetch('/__rig/reset', { method: 'POST' })
    if (!res.ok) throw new Error(res.status)
    say('Maximum sin: the demo site is resetting (a minute or two).')
  } catch {
    say('Deck reset. The demo site wasn’t: run reset.ps1 by hand (or start the talk with npm run dkfestival).')
  }
})
</script>

<template>
  <div class="curse-stage" aria-hidden="true">
    <div class="vignette" />
    <div class="grain" :class="{ moving: grainMoves && !grainOff, off: grainOff }" :style="{ backgroundImage: grain }" />
    <div v-if="flash" :key="flash" class="absolve" />
    <p v-if="toast" class="toast" data-audit="ignore">{{ toast }}</p>
  </div>
</template>

<style scoped>
.curse-stage {
  overflow: clip; /* the grain overhangs the stage and moves: it must never count as scrollable */
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
}
.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 45%, rgba(0, 0, 0, 0.92) 100%);
  opacity: calc(var(--curse, 0) * var(--curse, 0) * 1.1);
}
/* grain: a tile of noise (made in the script); it shimmers by stepping its offset */
.grain {
  position: absolute;
  inset: -50%;
  background-size: 256px 256px;
  opacity: calc(max(0, var(--curse, 0) - 0.25) * 0.5);
  mix-blend-mode: overlay;
}
.grain { transition: opacity 0.6s; }
.grain.off { opacity: 0; }
/* a class on the grain itself: scoped :global(.x) .grain compiles to just .x, which moved the whole page */
.grain.moving { animation: grain 0.9s steps(6) infinite; }
@keyframes grain {
  0% { transform: translate(0, 0); }
  20% { transform: translate(-3%, 2%); }
  40% { transform: translate(2%, -4%); }
  60% { transform: translate(-4%, -1%); }
  80% { transform: translate(3%, 3%); }
  100% { transform: translate(0, 0); }
}
/* warm light breaking through, once per absolution */
.absolve {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 40%, rgba(255, 214, 140, 0.75), rgba(255, 170, 60, 0.25) 45%, transparent 75%);
  mix-blend-mode: screen;
  animation: absolve 1.6s ease-out forwards;
}
@keyframes absolve {
  0% { opacity: 0; }
  12% { opacity: 1; }
  100% { opacity: 0; }
}
.toast {
  position: absolute;
  left: 50%;
  bottom: 40px;
  transform: translateX(-50%);
  margin: 0;
  padding: 14px 26px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  font: 600 22px var(--sans);
}
@media (prefers-reduced-motion: reduce) { .grain { animation: none; } }
</style>
