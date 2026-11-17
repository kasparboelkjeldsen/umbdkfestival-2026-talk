<script setup>
// "not a cult", scrawled over whatever it sits on: rotated, overlapping, in every case, some of it
// smeared into zalgo. It grows with the curse: each phrase has its own threshold, so the density
// rises, and each fades in over a short band above it. Pure CSS on --curse (no re-render while
// the curse moves).
//
//   <GhostText :box="{ x: 0, y: 0, w: 1920, h: 1080 }" :count="40" :size="[40, 120]" />
//
// Each phrase is a small PICTURE of the text (scrawl.js), not text. Text is rasterised again at
// every new size, so on every frame of a zoom, and this is a few hundred phrases, a quarter of
// them with a dozen combining marks a letter, some thousands of px tall out on the canvas: the
// dark half of the talk stuttered on exactly that. `sharp` is the type size in the picture: more
// where the camera comes close (the stone), less where it's only ever small.
//
// Even so, whoever places one should keep it from being drawn where it can't be seen
// (curse/GhostWorld.vue, scenes/Revelation.vue, scenes/Tablets.vue each do). And don't give it a
// compositor layer (will-change) to save the drawing: a layer keeps the size it was first drawn
// at, so one made while the camera is far in is enormous once it pulls back, and the browser then
// drops other things off the screen to pay for it.
//
// Positions come from a seeded PRNG, so every rehearsal looks the same. `avoid` boxes keep it off
// things that must stay readable; phrases that land in one are dropped. Outside the deck window
// there's no --curse: it's invisible (thumbnails, ?sheet).
import { ref, computed, onMounted } from 'vue'
import { sprite, font } from './scrawl.js'
import { useCurseStep } from './curse.js'
import { deckState } from '../state.js'

const props = defineProps({
  box: { type: Object, default: () => ({ x: 0, y: 0, w: 1920, h: 1080 }) },
  count: { type: Number, default: 30 },
  size: { type: Array, default: () => [40, 110] },  // type size range, px in the parent's space
  from: { type: Number, default: 0.25 },             // the first phrase appears here …
  to: { type: Number, default: 0.9 },                // … the last one here
  opacity: { type: Number, default: 0.5 },           // at full strength
  avoid: { type: Array, default: () => [] },         // [{ x, y, w, h }]
  seed: { type: Number, default: 1 },
  smear: { type: Number, default: 0.25 },            // share of phrases that are zalgo'd
  colour: { type: String, default: '' },             // default: the --ghost of where it sits
  clip: { type: Boolean, default: true },            // keep it inside what it's drawn on
  sharp: { type: Number, default: 64 },              // type size in the pictures, px
})

const PHRASES = ['not a cult', 'Not a cult', 'NOT A CULT', 'not a cult.', 'definitely not a cult', 'not a cult', '#NotACult', 'NOT a cult']

function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const inside = (x, y, b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h

const items = computed(() => {
  const rnd = mulberry32(props.seed * 7919 + 13)
  const { x, y, w, h } = props.box
  const [lo, hi] = props.size
  const out = []
  for (let i = 0; i < props.count * 3 && out.length < props.count; i++) {
    const px = x + rnd() * w
    const py = y + rnd() * h
    const size = lo + Math.pow(rnd(), 1.6) * (hi - lo)
    const rot = (rnd() - 0.5) * 50
    const text = PHRASES[Math.floor(rnd() * PHRASES.length)]
    const smear = rnd() < props.smear
    const strength = 0.45 + rnd() * 0.55
    if (props.avoid.some((b) => inside(px, py, b))) continue
    out.push({ px, py, size, rot, text, smear, strength, k: out.length })
  }
  // thresholds spread evenly, in a shuffled order, so the density grows everywhere at once
  const n = out.length
  const order = out.map((_, i) => i).sort(() => rnd() - 0.5)
  order.forEach((idx, rank) => {
    out[idx].t = props.from + ((props.to - props.from) * rank) / Math.max(1, n - 1)
  })
  return out
})

// The pictures need the type to be loaded and a colour to draw in: both known once it's mounted.
const root = ref(null)
const ink = ref(props.colour)
const ready = ref(false)
const picture = (g) => sprite(g.text, ink.value, props.sharp, g.smear ? { seed: g.k + props.seed } : undefined)
// Every picture is made ahead of time, one per idle moment after load. Made only when first needed,
// a flight that takes the curse past many thresholds at once would stop to draw them.
const idle = (fn) => (typeof requestIdleCallback === 'function' ? requestIdleCallback(fn, { timeout: 3000 }) : setTimeout(fn, 150))
function warm(i = 0) {
  if (!deckState.live || i >= items.value.length) return
  picture(items.value[i])
  idle(() => warm(i + 1))
}
onMounted(() => {
  if (!ink.value) ink.value = getComputedStyle(root.value).getPropertyValue('--ghost').trim() || '#e9e6dc'
  const go = () => { ready.value = true; setTimeout(() => idle(() => warm()), 2500) }
  document.fonts.load(font(props.sharp)).then(go, go)
})

// Only the phrases the curse has (nearly) reached exist (and get their picture made): every element
// is restyled when --curse changes, and early in the talk most of these would be invisible anyway.
// Outside the deck (no curse, ?sheet) none are shown.
const curse = useCurseStep()
const shown = computed(() => {
  if (!deckState.live || !ready.value || !ink.value) return []
  return items.value.filter((g) => curse.value >= g.t - 0.05).map((g) => {
    const s = picture(g)
    const k = g.size / props.sharp
    return {
      k: g.k,
      url: s.url,
      style: {
        left: `${g.px}px`,
        top: `${g.py}px`,
        width: `${s.w * k}px`,
        height: `${s.h * k}px`,
        // the middle of the line sits on its spot, and it turns about that
        transformOrigin: `${s.cx * 100}% ${s.cy * 100}%`,
        transform: `translate(${-s.cx * 100}%, ${-s.cy * 100}%) rotate(${g.rot}deg)`,
        '--t': g.t,
        '--a': g.strength * props.opacity,
      },
    }
  })
})
</script>

<template>
  <div ref="root" class="ghost-text" :class="{ clip }" aria-hidden="true" data-audit="ignore">
    <img v-for="g in shown" :key="g.k" class="ghost" :src="g.url" :style="g.style" alt="" draggable="false" />
  </div>
</template>

<style scoped>
.ghost-text {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: visible;
}
.clip { overflow: hidden; }
.ghost {
  position: absolute;
  display: block;
  max-width: none;
  /* fades in over a 0.08 band above its own threshold */
  opacity: calc(clamp(0, (var(--curse, 0) - var(--t)) * 12.5, 1) * var(--a));
  transition: opacity 0.4s;
}
</style>
