<script setup>
// The two tablets the hiker holds up (the tablets card, and bigger in the recap): two round-topped
// slabs from the stone kit (components/stone), the Umbraco U carved at the top of each.
//
// phase 'tiny': what's carved when you first see them on the mountain, "if you can read this, …";
//               `rewrite` cuts the right-hand one anew (the S5 joke).
// phase 'ten':  the ten commandments, five a side. Switching to it carves them in, line by line,
//               while the tiny text crumbles. A line whose sin was only pretended away flickers.
import StoneSlab from './stone/StoneSlab.vue'
import { ROMAN } from '../world.js'

const props = defineProps({
  centres: { type: Array, required: true },   // x of each tablet's centre
  width: { type: Number, required: true },
  top: { type: Number, required: true },
  bottom: { type: Number, required: true },
  lines: { type: Array, required: true },     // y of each line's centre (5), in this card's px
  rules: { type: Array, required: true },     // 10 strings
  lineWidth: { type: Number, default: 500 },
  numSize: { type: Number, default: 40 },
  ruleSize: { type: Number, default: 30 },
  flicker: { type: Function, default: () => false },
  phase: { type: String, default: 'ten' },    // 'tiny' | 'ten'
  rewrite: { type: Boolean, default: false },
})

const h = props.bottom - props.top
const tablets = props.centres.map((cx, t) => {
  const left = cx - props.width / 2
  return {
    t,
    left,
    lines: props.lines.map((y, i) => ({ n: t * 5 + i + 1, x: cx - left, y: y - props.top, i: t * 5 + i })),
  }
})
</script>

<template>
  <div class="stone-tablets" :class="phase">
    <div v-for="tb in tablets" :key="tb.t" class="tablet" :style="{ left: `${tb.left}px`, top: `${top}px` }">
      <StoneSlab :w="width" :h="h" shape="round" :seed="tb.t * 5 + 2">
        <div class="seal" :style="{ top: `${h * 0.045}px` }"><span class="carved">U</span></div>

        <!-- what the hiker shows you first -->
        <div class="tiny" :class="{ rewritten: tb.t === 1 && rewrite }">
          <p v-if="tb.t === 0" class="tiny-text carved">if you can<br />read this,</p>
          <template v-else>
            <p class="tiny-text carved old">you’ve downloaded my slides or have very very good eye-sight</p>
            <p class="tiny-text carved new">I built an entire presentation engine just to zoom in here. Worth it.</p>
          </template>
        </div>

        <!-- the ten -->
        <p
          v-for="l in tb.lines"
          :key="l.n"
          class="line"
          :class="{ flicker: flicker(l.n) }"
          :style="{ left: `${l.x}px`, top: `${l.y}px`, width: `${lineWidth}px`, '--i': l.i }"
        >
          <span class="num carved" :style="{ fontSize: `${numSize}px` }">{{ ROMAN[l.n] }}</span>
          <span class="rule carved" :style="{ fontSize: `${ruleSize}px` }">{{ rules[l.n - 1] }}</span>
        </p>
      </StoneSlab>
    </div>
  </div>
</template>

<style scoped>
.stone-tablets { position: absolute; inset: 0; }
.tablet { position: absolute; }
.seal {
  position: absolute;
  left: 50%;
  width: 120px;
  height: 120px;
  margin-left: -60px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  box-shadow: inset 0 4px 4px rgba(20, 14, 8, 0.55), inset 0 -2px 2px rgba(255, 247, 230, 0.3), 0 2px 0 rgba(255, 247, 230, 0.35);
  font: 700 80px/1 'DM Sans', system-ui, sans-serif;
}
.line {
  position: absolute;
  margin: 0;
  transform: translate(-50%, -50%);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-family: var(--chisel);
  font-weight: 700; /* bold: it has to read on a projector */
  line-height: 1.14;
  letter-spacing: 0.02em;
}
.num { font-weight: 900; letter-spacing: 0.08em; }

/* the tiny text: big letters on the stone, small on the mountain */
.tiny { position: absolute; inset: 0; }
.tiny-text {
  position: absolute;
  left: 9%;
  right: 9%;
  top: 30%;
  margin: 0;
  text-align: center;
  font: 700 66px/1.14 var(--chisel);
}
/* S5: the zoom lands (~1.4 s), a beat to read the joke, the old words crumble, the new ones
   are cut in from the top */
.tiny .new { opacity: 0; }
.rewritten .old { animation: crumble 0.5s ease-in 2s both; }
.rewritten .new {
  opacity: 1;
  -webkit-mask-size: 100% 300%;
  mask-size: 100% 300%;
  -webkit-mask-image: linear-gradient(180deg, #000 40%, transparent 56%);
  mask-image: linear-gradient(180deg, #000 40%, transparent 56%);
  -webkit-mask-position: 0 100%;
  mask-position: 0 100%;
  animation: carve-y 1.1s cubic-bezier(0.3, 0.1, 0.3, 1) 2.3s both;
}

/* switching phases: the tiny text crumbles, then the ten are cut in, one line quickly after another
   (the soft mask sweep: theme.css carve-x) */
.tiny { transition: opacity 0.6s, filter 0.6s; }
.ten .tiny { opacity: 0; filter: blur(3px); pointer-events: none; }
.line { opacity: 0; }
.ten .line {
  opacity: 1;
  -webkit-mask-size: 300% 100%;
  mask-size: 300% 100%;
  -webkit-mask-image: linear-gradient(90deg, #000 40%, transparent 56%);
  mask-image: linear-gradient(90deg, #000 40%, transparent 56%);
  -webkit-mask-position: 100% 0;
  mask-position: 100% 0;
  animation: carve-x 0.6s cubic-bezier(0.3, 0.1, 0.3, 1) calc(0.35s + var(--i) * 0.09s) both;
}

/* the flicker replaces the carve-in animation, and that's what opens the line's mask: a flickering
   line is shown fully carved, or a pretended sin's line (the ✨ ones) vanished from the tablets */
.flicker { animation: flicker 2.7s steps(1) infinite !important; }
.ten .line.flicker { -webkit-mask-position: 0 0; mask-position: 0 0; }
@keyframes flicker {
  0%, 100% { opacity: 1; }
  31% { opacity: 0.5; }
  33% { opacity: 1; }
  71% { opacity: 0.7; }
  72% { opacity: 1; }
}
@keyframes crumble {
  from { opacity: 1; transform: none; filter: none; }
  to { opacity: 0; transform: translateY(8px); filter: blur(2px); }
}
@media (prefers-reduced-motion: reduce) { .flicker { animation: none !important; opacity: 0.75; } }
</style>
