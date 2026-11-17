<script setup>
// Recovered scripture: a real web page as an old, scorched manuscript filling its card: a ragged
// paper edge (stone/outline.js), foxing, a fold, old-print type (IM Fell English), a red initial.
// The more cursed the deck, the older and darker it gets. The scene places the passages (short,
// verbatim, sourced) at fixed spots, so `frames` in deck.js can zoom the camera onto each one;
// faint ruled lines stand in for the rest of the page.
//
//   <Manuscript source="cultiv.nl · 2010" :highlight="key">
//     <p class="passage" data-key="warning" style="left: …; top: …">…</p>
//   </Manuscript>
//
// `highlight` names the passage that makes the point right now (the scene picks it per build step):
// once the camera has landed it gets a hand-laid wash of gold leaf behind it and a ☞ in the margin,
// and the rest of the page sinks back. No filters: they'd re-render every frame of the zoom.
import { computed } from 'vue'
import { outline } from './stone/outline.js'

const props = defineProps({
  source: { type: String, required: true },
  title: { type: String, required: true },
  filler: { type: Array, default: () => [] }, // [[top, count]] blocks of ruled lines (card px)
  highlight: { type: String, default: '' },
})
const rules = computed(() =>
  props.filler.flatMap(([top, count, left = 260, width = 1400]) =>
    Array.from({ length: count }, (_, i) => ({ top: top + i * 34, left, width: width * (0.62 + ((i * 37) % 38) / 100) })),
  ),
)
// the paper, 1640 × 980 at (140, 50): torn and scorched all round
const PW = 1640
const PH = 980
const edge = outline(PW, PH, { shape: 'slab', seed: 17, rough: 16, chips: 16, step: 6 })
const stains = [[220, 160, 90, 0.16], [1420, 760, 140, 0.2], [1180, 120, 60, 0.12], [380, 820, 110, 0.14], [900, 520, 200, 0.07]]
const uid = `ms-${Math.random().toString(36).slice(2, 7)}`
</script>

<template>
  <div class="manuscript" :class="{ focusing: !!highlight }">
    <svg class="paper" :viewBox="`0 0 ${PW} ${PH}`" aria-hidden="true">
      <defs>
        <linearGradient :id="`${uid}-p`" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stop-color="#f1e5c6" />
          <stop offset="0.6" stop-color="#e5d2a6" />
          <stop offset="1" stop-color="#cfb27a" />
        </linearGradient>
        <radialGradient :id="`${uid}-v`" cx="0.5" cy="0.46" r="0.62">
          <stop offset="0.6" stop-color="#5a2e08" stop-opacity="0" />
          <stop offset="1" stop-color="#5a2e08" stop-opacity="0.45" />
        </radialGradient>
        <radialGradient :id="`${uid}-s`">
          <stop offset="0" stop-color="#8a5a1c" stop-opacity="0.9" />
          <stop offset="0.7" stop-color="#8a5a1c" stop-opacity="0.35" />
          <stop offset="1" stop-color="#8a5a1c" stop-opacity="0" />
        </radialGradient>
        <clipPath :id="`${uid}-c`"><path :d="edge" /></clipPath>
      </defs>
      <!-- shadow under the sheet -->
      <path :d="edge" transform="translate(0 22)" fill="#000" fill-opacity="0.35" stroke="#000" stroke-opacity="0.12" stroke-width="40" stroke-linejoin="round" />
      <g :clip-path="`url(#${uid}-c)`">
        <rect :width="PW" :height="PH" :fill="`url(#${uid}-p)`" />
        <circle v-for="([x, y, r, o], i) in stains" :key="i" :cx="x" :cy="y" :r="r" :fill="`url(#${uid}-s)`" :opacity="o" />
        <rect :width="PW" :height="PH" :fill="`url(#${uid}-v)`" />
        <!-- the fold, and a crease across it -->
        <path :d="`M${PW * 0.5} 0V${PH}`" stroke="#7a5320" stroke-opacity="0.16" stroke-width="3" />
        <path :d="`M${PW * 0.5 + 3} 0V${PH}`" stroke="#fff8e6" stroke-opacity="0.35" stroke-width="2" />
        <!-- scorched edge: dark inside the tear, darker the more cursed -->
        <path :d="edge" fill="none" stroke="#2a1302" stroke-width="34" class="scorch" />
        <path :d="edge" fill="none" stroke="#1a0b01" stroke-width="8" stroke-opacity="0.8" />
      </g>
    </svg>
    <div class="age" aria-hidden="true" />
    <p class="provenance">{{ source }}</p>
    <h3 class="title"><span class="initial">{{ title[0] }}</span>{{ title.slice(1) }}</h3>
    <span v-for="(r, i) in rules" :key="i" class="rule" :style="{ top: `${r.top}px`, left: `${r.left}px`, width: `${r.width}px` }" />
    <slot />
  </div>
</template>

<style scoped>
.manuscript {
  position: absolute;
  inset: 0;
  color: #3a2a17;
  font-family: 'IM Fell English', var(--serif);
}
.paper { position: absolute; left: 140px; top: 50px; width: 1640px; height: 980px; overflow: visible; }
.scorch { opacity: calc(0.28 + var(--curse, 0) * 0.4); }
/* the curse ages it: a brown dusk over the whole sheet */
.age {
  position: absolute;
  inset: 50px 140px;
  background: radial-gradient(ellipse at 50% 45%, rgba(60, 30, 6, 0.1), rgba(40, 18, 2, 0.5));
  opacity: calc(var(--curse, 0) * 0.9);
  pointer-events: none;
  z-index: 3;
}
.provenance {
  position: absolute;
  left: 260px;
  top: 100px;
  margin: 0;
  font: 700 26px var(--sans);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.65;
}
.title { position: absolute; left: 260px; top: 150px; margin: 0; font-size: 62px; font-weight: 400; }
/* a rubricated initial */
.initial { color: #8e1d0a; font-size: 1.35em; line-height: 0.8; margin-right: 2px; }
.rule {
  position: absolute;
  height: 12px;
  border-radius: 6px;
  background: rgba(70, 45, 15, 0.14);
}

/* the passages, and the one making the point */
.manuscript :deep(.passage) {
  position: absolute;
  margin: 0;
  isolation: isolate;
  transition: opacity 0.8s ease 0.6s;
}
.focusing :deep(.passage),
.focusing .title,
.focusing .provenance,
.focusing .rule { opacity: 0.32; transition: opacity 0.8s ease 0.6s; }
.focusing :deep(.passage.lit) { opacity: 1; }
/* gold leaf, laid on by hand behind the words */
.manuscript :deep(.passage.lit)::before {
  content: '';
  position: absolute;
  inset: -10px -22px -8px;
  z-index: -1;
  border-radius: 46% 34% 42% 38% / 34% 48% 30% 44%;
  background:
    radial-gradient(ellipse at 30% 40%, rgba(255, 236, 160, 0.55), transparent 60%),
    linear-gradient(98deg, rgba(222, 168, 52, 0) 0%, rgba(222, 168, 52, 0.5) 5%, rgba(236, 190, 80, 0.42) 92%, rgba(222, 168, 52, 0) 100%);
  transform-origin: left center;
  animation: gild 1.1s cubic-bezier(0.3, 0.1, 0.2, 1) 0.7s both;
}
/* and a hand in the margin pointing at it */
.manuscript :deep(.passage.lit)::after {
  content: '☞';
  position: absolute;
  left: -72px;
  top: -0.12em;
  font: 400 56px/1 'IM Fell English', var(--serif);
  color: #8e1d0a;
  animation: point 0.6s ease-out 1.2s both;
}
@keyframes gild { from { transform: scaleX(0); opacity: 0; } 30% { opacity: 1; } to { transform: scaleX(1); opacity: 1; } }
@keyframes point { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .manuscript :deep(.passage.lit)::before, .manuscript :deep(.passage.lit)::after { animation: none; }
}
</style>
