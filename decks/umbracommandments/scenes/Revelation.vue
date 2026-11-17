<script setup>
// S4 · Mount Bellissima, and S5 · the tiny text (its build step, `frames` in deck.js: step 1 zooms
// onto the tablets, and once the camera has landed the right-hand one rewrites itself; that's the
// tablets card, which sits in the hiker's hands, world.js TABLETS_SLOT).
//
// The landscape is painted: the shader in components/mountain/paint.js ray-marches it into three
// pictures (day, dusk, night; files in public/assets/, see that file for painting them again) that
// cross-fade with --curse, so the whole scene goes from day through dusk to night as the deck is
// possessed and the stars come out; after the demo (curse 0) the sun is back up. Every time the
// camera pulls back far enough to see the mountain, you see the time of day. Three <img>s cost
// nothing in a flight, where the vector landscape they replaced was redrawn on every frame of a zoom.
//
// What must stay sharp when the camera goes in stays vector, on top: the U-sun, the signpost and
// the hiker (Hiker.vue). Their colours are palette entries mixed with --curse, so night falls on
// them too, and the painting casts their shadows on the meadow (paint.js CAST).
import { computed } from 'vue'
import { useStep } from '@engine/useStep.js'
import Detail from '@engine/components/Detail.vue'
import GhostText from '../curse/GhostText.vue'
import Hiker from '../components/mountain/Hiker.vue'
import { RAYS, SUN } from '../components/mountain/scene.js'
import { MOUNTAIN } from '../components/mountain/paint.js'
import { useCurseFine } from '../curse/curse.js'

const { step } = useStep()

// The time of day: dusk fades in over day, then night over both. Worked out here rather than in CSS
// so a picture that can't be seen (not faded in yet, or wholly covered by the next) isn't drawn at
// all: three full-size pictures on top of each other are three times the work for the GPU.
const curse = useCurseFine()
const ramp = (from, per) => Math.min(1, Math.max(0, (curse.value - from) * per))
const plates = computed(() => {
  const dusk = ramp(0.08, 3), night = ramp(0.42, 2.2)
  return [
    { time: 'day', opacity: 1, show: dusk < 1 },
    { time: 'dusk', opacity: dusk, show: dusk > 0 && night < 1 },
    { time: 'night', opacity: night, show: night > 0 },
  ]
})
// S5's punchline: a twinkle round the right-hand tablet as it rewrites itself (the tablets card)
const SPARKLES = [[1172, 196, 9, 0], [1150, 168, 6, 0.25], [1180, 300, 7, 0.5], [1184, 352, 5, 0.7], [1030, 160, 6, 0.4]]
const sparkle = (x, y, r) => `M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`

// the vector art's day colours (the signpost, the hiker); each becomes --name: mixed towards dusk,
// then night, by the curse (see the style)
const DAY = {
  wood: '#8a5a32', 'wood-lit': '#c08a52', 'wood-dark': '#55351b', 'sign-ink': '#2e1c0e',
  skin: '#ecb48c', 'skin-shade': '#bd8159', beard: '#f4f0e7', 'beard-shade': '#b3aa9b', hair: '#a89d8d', ink: '#2a1f18',
  shirt: '#b23a2e', 'shirt-dark': '#571a17', 'shirt-light': '#e07a62', pack: '#5f6d3c', strap: '#30391f', roll: '#d8a23c',
  pants: '#a8966f', 'pants-shade': '#75664a', boot: '#62432c', 'boot-dark': '#2b1d14', belt: '#2e2418', metal: '#d9d4c6',
  blush: '#e0765c', mouth: '#5c1f1a', teeth: '#fffdf6', rim: '#fff4cf',
}
const palette = Object.fromEntries(Object.entries(DAY).map(([k, v]) => [
  `--${k}`, `color-mix(in oklab, color-mix(in oklab, ${v}, #c25a38 var(--dusk)), #050917 var(--night))`,
]))
// The vectors show up to this zoom (the tablets card is 4.9×, the widest flight between two
// commandments about 10×, a commandment 36×) and are gone a third further in.
const VECTORS_UNTIL = 12
// where the hiker holds the tablets card, in this card's px: the ghost text keeps off it
const TABLETS = { x: 880, y: 160, w: 310, h: 260 }
</script>

<template>
  <div class="slide slide--bleed no-mark revelation" :style="palette">
    <img
      v-for="p in plates"
      v-show="p.show"
      :key="p.time"
      class="art plate"
      :src="MOUNTAIN[p.time]"
      :style="{ opacity: p.opacity }"
      alt=""
      draggable="false"
    />
    <!-- Everything vector, and the ghost text: only while the camera is near enough to see them. With
         the camera down at a commandment (36× in) they'd still be redrawn every frame of a flight,
         off screen or behind the stone. -->
    <Detail :to="VECTORS_UNTIL" class="art vectors">
    <!-- the rays turn on their own layer, over the picture -->
    <svg class="art rays" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" overflow="visible" aria-hidden="true">
      <defs>
        <radialGradient id="rv-ray" cx="1440" cy="210" r="1300" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#fffbe6" stop-opacity="0.75" />
          <stop offset="1" stop-color="#fffbe6" stop-opacity="0" />
        </radialGradient>
      </defs>
      <path :d="RAYS.join('')" fill="url(#rv-ray)" />
    </svg>
    <svg class="art" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g class="sun">
        <circle :cx="SUN.x" :cy="SUN.y" :r="SUN.r + 9" class="sun-ring" />
        <circle :cx="SUN.x" :cy="SUN.y" :r="SUN.r" class="sun-disc" />
        <path :transform="`translate(${SUN.x} ${SUN.y + 4})`" d="M-36 -34h18v32a18 18 0 0 0 36 0v-32h18v32a36 36 0 0 1 -72 0z" class="sun-u" />
      </g>

      <!-- the signpost -->
      <!-- (it stands in the painting like the hiker: 5 m in, lit from the right, its shadow painted) -->
      <g class="sign">
        <defs>
          <linearGradient id="rv-post" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" style="stop-color: var(--wood-dark)" />
            <stop offset="0.45" style="stop-color: var(--wood)" />
            <stop offset="0.85" style="stop-color: var(--wood-lit)" />
            <stop offset="1" style="stop-color: var(--wood)" />
          </linearGradient>
          <linearGradient id="rv-plank" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style="stop-color: var(--wood-lit)" />
            <stop offset="0.7" style="stop-color: var(--wood-lit)" />
            <stop offset="1" style="stop-color: var(--wood)" />
          </linearGradient>
        </defs>
        <ellipse cx="415" cy="939" rx="26" ry="5" fill="#0c1a08" opacity="0.5" />
        <path d="M400 474Q415 456 430 474V940H400Z" fill="url(#rv-post)" />
        <path d="M407 500V930M421 480V930" fill="none" style="stroke: var(--wood-dark)" stroke-width="1.6" opacity="0.3" />
        <!-- the plank's own thickness along its lower edge, and its shadow on the post -->
        <rect x="400" y="582" width="30" height="20" fill="#0b0a14" opacity="0.32" />
        <path d="M262 578H646L678 544L682 550L650 587H266Z" style="fill: var(--wood-dark)" />
        <!-- the plank: the text has a fixed length (textLength), so it always fits before the point -->
        <path d="M262 510H646L678 544L646 578H262Z" fill="url(#rv-plank)" />
        <path d="M262 510H646L678 544" fill="none" style="stroke: var(--rim)" stroke-width="2" opacity="0.45" />
        <path d="M276 521C380 518 500 524 624 520M270 533C360 536 470 530 640 535M280 566C380 562 520 568 630 563M300 572H560" fill="none" style="stroke: var(--wood-dark)" stroke-width="1.5" opacity="0.3" />
        <ellipse cx="610" cy="528" rx="7" ry="3.4" fill="none" style="stroke: var(--wood-dark)" stroke-width="1.5" opacity="0.4" />
        <g style="fill: var(--metal)"><circle cx="408" cy="530" r="3.4" /><circle cx="422" cy="558" r="3.4" /></g>
        <g style="fill: var(--wood-dark)"><circle cx="409" cy="531" r="1.4" /><circle cx="423" cy="559" r="1.4" /></g>
        <!-- carved: a light lip under dark letters -->
        <text x="291.5" y="555.5" textLength="330" lengthAdjust="spacingAndGlyphs" class="sign-text lip">MOUNT BELLISSIMA</text>
        <text x="290" y="554" textLength="330" lengthAdjust="spacingAndGlyphs" class="sign-text">MOUNT BELLISSIMA</text>
      </g>

      <Hiker />
      <g v-if="step >= 1" class="sparkles">
        <path v-for="([x, y, r, d], i) in SPARKLES" :key="'sk' + i" :d="sparkle(x, y, r)" :style="{ '--d': `${d + 3.4}s` }" />
      </g>
    </svg>
    <GhostText :box="{ x: 0, y: 0, w: 1920, h: 1080 }" :avoid="[TABLETS]" :count="70" :size="[8, 70]" :from="0.25" :to="0.92" :opacity="0.55" :seed="4" />
    </Detail>
  </div>
</template>

<style scoped>
.revelation {
  --ghost: #fdf8e8;
  /* how far towards dusk, then night: the palette mixes by these */
  --dusk: calc(clamp(0, (var(--curse, 0) - 0.12) * 3.2, 1) * (1 - clamp(0, (var(--curse, 0) - 0.55) * 3, 1)) * 30%);
  --night: calc(clamp(0, (var(--curse, 0) - 0.4) * 1.9, 1) * 82%);
  --sky-dusk: calc(clamp(0, (var(--curse, 0) - 0.08) * 3, 1) * 100%);
  --sky-night: calc(clamp(0, (var(--curse, 0) - 0.42) * 2.2, 1) * 100%);
  --sick: calc(clamp(0, (var(--curse, 0) - 0.35) * 2.2, 1) * 100%);
}
.art { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
/* the rays overhang the card as they turn: cut here, so the card never counts as overflowing */
.vectors { overflow: clip; }

.plate { object-fit: cover; user-select: none; pointer-events: none; }
.rays {
  opacity: calc(0.32 * (1 - clamp(0, (var(--curse, 0) - 0.25) * 2.2, 1)));
  /* the sun's centre, as a share of the card */
  transform-origin: 75% 19.44%;
  overflow: visible;
  animation: rays 160s linear infinite;
}
.sun-ring { fill: none; stroke: color-mix(in oklab, #ffffff, #c3ee56 var(--sick)); stroke-width: 6; opacity: 0.85; }
.sun-disc { fill: color-mix(in oklab, #3544b1, #1b2b10 calc(var(--sick) * 0.8)); }
.sun-u { fill: color-mix(in oklab, #ffffff, #cdf06c var(--sick)); }
.sign-text { font: 700 28px 'DM Sans', system-ui, sans-serif; fill: var(--sign-ink); }
.sign-text.lip { fill: var(--rim); opacity: 0.5; }

.sparkles path {
  fill: #fffbe0;
  transform-box: fill-box;
  transform-origin: center;
  animation: twinkle 1.6s ease-in-out var(--d) infinite both;
}
@keyframes twinkle {
  0%, 100% { opacity: 0; transform: scale(0.3) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(45deg); }
}
@keyframes rays { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .rays, .sparkles path { animation: none; } }
</style>
