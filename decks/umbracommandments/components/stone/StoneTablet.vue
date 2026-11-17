<script setup>
// A commandment's tablet, drawn: a weathered slab (StoneSlab) with the Umbraco U carved at the top,
// THE UMBRACOMMANDMENTS, the King James line (rules.js KJV) and the engraving (Emblem). Designed
// at 528 × 880 and scaled to `height`.
//
// Corrections ({ old, new, at } segments in KJV) are made on stage: on build step `at` the chisel
// strikes the old words, they crumble, and the new ones are cut in their place (a word swap keeps
// its spot: both share one inline grid cell; `block` swaps a whole passage). Without the deck
// (thumbnails, ?sheet) the new words are already there.
import { computed } from 'vue'
import { useStep } from '@engine/useStep.js'
import StoneSlab from './StoneSlab.vue'
import Emblem from './Emblem.vue'
import { KJV } from '../../rules.js'

const props = defineProps({
  n: { type: Number, required: true },
  height: { type: Number, default: 880 },
})
const W = 528
const H = 880
const { step } = useStep()

const segments = KJV[props.n] ?? []
const length = segments.reduce((a, s) => a + (typeof s === 'string' ? s.length : Math.max(s.old.length, s.new.length)), 0)
// Cinzel is wide: these keep the longest line (II, before the chisel) inside its box
const size = length > 140 ? 26 : length > 110 ? 29 : length > 70 ? 33 : 38
const done = (s) => step.value >= s.at
const dust = Array.from({ length: 10 }, (_, i) => ({
  dx: Math.round(Math.cos(i * 2.3) * (26 + (i % 4) * 12)),
  dy: Math.round(Math.sin(i * 2.3) * (18 + (i % 3) * 10) - 16),
  s: 3 + (i % 3) * 2,
}))
const scale = computed(() => props.height / H)
</script>

<template>
  <div class="stone-tablet" :style="{ width: `${W * scale}px`, height: `${height}px` }" data-audit="ignore">
    <div class="inner" :style="{ transform: `scale(${scale})` }">
      <StoneSlab :w="W" :h="H" shape="slab" :seed="n * 7 + 3">
        <div class="seal"><span class="carved">U</span></div>
        <p class="title carved"><span class="the">THE</span>UMBRACOMMANDMENTS</p>
        <p class="kjv" :style="{ fontSize: `${size}px` }"><span class="flow">
          <template v-for="(s, i) in segments" :key="i">
            <span v-if="typeof s === 'string'" class="carved">{{ s }}</span>
            <span v-else class="fix" :class="{ go: done(s), block: s.block }" :style="{ '--delay': `${s.delay ?? 0}ms` }">
              <span class="scar" />
              <span class="old carved">{{ s.old }}</span>
              <span class="new carved">{{ s.new }}</span>
              <span v-for="(d, j) in dust" :key="j" class="dust" :style="{ '--dx': `${d.dx}px`, '--dy': `${d.dy}px`, width: `${d.s}px`, height: `${d.s}px` }" />
            </span>
          </template>
        </span></p>
        <div class="engraving"><Emblem :n="n" /></div>
      </StoneSlab>
    </div>
  </div>
</template>

<style scoped>
.stone-tablet { position: relative; flex: none; }
.inner { position: absolute; left: 0; top: 0; width: 528px; height: 880px; transform-origin: 0 0; }

.seal {
  position: absolute;
  left: 50%;
  top: 34px;
  width: 86px;
  height: 86px;
  margin-left: -43px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  /* a carved ring: shadow inside the top of the cut, light on its lower lip */
  box-shadow: inset 0 3px 3px rgba(20, 14, 8, 0.55), inset 0 -2px 2px rgba(255, 247, 230, 0.3), 0 1.5px 0 rgba(255, 247, 230, 0.35);
  font: 700 58px/1 'DM Sans', system-ui, sans-serif;
}
.title {
  position: absolute;
  left: 0;
  right: 0;
  top: 132px;
  margin: 0;
  text-align: center;
  font: 900 25px/1.2 var(--chisel);
  letter-spacing: 0.05em;
}
.the { display: block; font-size: 21px; letter-spacing: 0.2em; }
.kjv {
  position: absolute;
  left: 46px;
  right: 40px;
  top: 214px;
  height: 352px;
  margin: 0;
  /* short lines sit in the middle of their space, long ones fill it */
  display: flex;
  align-items: center;
  font-family: var(--chisel);
  font-weight: 700; /* bold: it has to read on a projector */
  line-height: 1.28;
  letter-spacing: 0.01em;
}
.flow { display: block; }
.engraving { position: absolute; left: 22px; right: 24px; top: 586px; }

/* a correction: old and new share one cell, so the line doesn't jump */
.fix { position: relative; display: inline-grid; vertical-align: top; }
.fix.block { display: grid; }
.fix > .old, .fix > .new, .fix > .scar { grid-area: 1 / 1; }
/* where the old words were: the surface chiselled back, rougher and a little deeper */
.scar {
  margin: 0.12em -0.12em 0.05em;
  border-radius: 40% 55% 45% 60% / 60% 40% 55% 45%;
  background: #4d463c;
  box-shadow: inset 0 2px 3px rgba(15, 10, 6, 0.5), inset 0 -1px 1px rgba(255, 247, 230, 0.25);
  opacity: 0;
}
.fix.go .scar { animation: scar 0.4s ease-out calc(var(--delay) + 0.45s) both; }
@keyframes scar { from { opacity: 0; } to { opacity: 0.32; } }
.fix .new { opacity: 0; }
.fix .old { position: relative; }
.fix.go .old { animation: crumble 0.5s ease-in calc(var(--delay) + 0.5s) both; }
.fix.go .old::after {
  content: '';
  position: absolute;
  left: -4%;
  top: 52%;
  width: 108%;
  height: 4px;
  border-radius: 2px;
  background: #241b12;
  box-shadow: 0 1px 0 rgba(255, 247, 230, 0.4);
  transform-origin: left center;
  animation: strike 0.24s ease-out var(--delay) both;
}
.fix.block.go .old::after { display: none; }
.fix.block.go .old { text-decoration: line-through 3px #241b12; animation-duration: 0.9s; }
/* the new words: the soft mask sweep (theme.css carve-x / carve-y) */
.fix.go .new {
  opacity: 1;
  -webkit-mask-size: 300% 100%;
  mask-size: 300% 100%;
  -webkit-mask-image: linear-gradient(90deg, #000 40%, transparent 56%);
  mask-image: linear-gradient(90deg, #000 40%, transparent 56%);
  -webkit-mask-position: 100% 0;
  mask-position: 100% 0;
  animation: carve-x 0.75s cubic-bezier(0.3, 0.1, 0.3, 1) calc(var(--delay) + 0.8s) both;
}
.fix.block.go .new {
  -webkit-mask-size: 100% 300%;
  mask-size: 100% 300%;
  -webkit-mask-image: linear-gradient(180deg, #000 40%, transparent 56%);
  mask-image: linear-gradient(180deg, #000 40%, transparent 56%);
  -webkit-mask-position: 0 100%;
  mask-position: 0 100%;
  animation: carve-y 1.6s cubic-bezier(0.3, 0.1, 0.3, 1) calc(var(--delay) + 1.2s) both;
}
.dust {
  position: absolute;
  left: 50%;
  top: 50%;
  border-radius: 50%;
  background: #ece6d8;
  opacity: 0;
}
.fix.go .dust { animation: dust 0.75s ease-out calc(var(--delay) + 0.05s) both; }
@keyframes strike { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes crumble {
  from { opacity: 1; transform: none; filter: none; }
  to { opacity: 0; transform: translateY(6px) scale(0.98); filter: blur(1.5px); }
}
@keyframes dust {
  0% { transform: translate(-50%, -50%); opacity: 0.95; }
  100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy) + 44px)); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) { .dust { display: none; } }
</style>
