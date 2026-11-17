<script setup>
// Zalgo text that grows with the curse.
//
//   <Zalgo text="CORS" />                     infects from curse 0.2, fully at 1
//   <Zalgo text="production" :from="0.35" />  starts later
//   <Zalgo text="DEMO" :amount="1" :height="14" />   per-word override: this much, whatever the curse
//
// Deterministic: the marks come from a PRNG seeded by the text and `seed`, so every rehearsal looks
// the same at the same curse. The intensity is quantized (20 levels), so it re-renders a few times
// per flight, not every frame. The columns may spill well past the line, and past the card when
// the slide has the `spill` class (theme.css); the audit ignores them (data-audit="ignore").
//
// Readable curses:
//   :above / :below   scale the columns up and down separately (e.g. :above="0.2" :below="1.3"
//                     spills downward only, clear of the line above)
//   tint="…"          the marks in their own colour, behind a clean copy of the word: the letters
//                     stay crisp in the text colour, the rot is around them (a second layer, the
//                     plain text drawn exactly over the zalgo's base letters)
import { computed } from 'vue'
import { useCurseStep } from './curse.js'
import { zalgo } from './zalgo.js'

const props = defineProps({
  text: { type: String, required: true },
  from: { type: Number, default: 0.2 },     // curse at which it starts
  to: { type: Number, default: 1 },         // curse at which it's at full height
  amount: { type: Number, default: null },  // 0…1 override, ignores the curse
  height: { type: Number, default: 9 },     // max combining marks above and below a letter, at full
  seed: { type: Number, default: 1 },
  breathe: { type: Boolean, default: true },
  above: { type: Number, default: 1 },
  below: { type: Number, default: 1 },
  tint: { type: String, default: '' },
})

const curse = useCurseStep()
const level = computed(() => {
  const raw = props.amount ?? (curse.value - props.from) / Math.max(0.01, props.to - props.from)
  return Math.round(Math.min(1, Math.max(0, raw)) * 20) / 20
})

const out = computed(() => zalgo(props.text, { level: level.value, height: props.height, seed: props.seed, above: props.above, below: props.below }))
</script>

<template>
  <span v-if="tint && level > 0" class="zalgo tinted" :class="{ breathe }" :data-text="text" data-audit="ignore">
    <span class="rot" :style="{ color: tint }">{{ out }}</span><span class="clean">{{ text }}</span>
  </span>
  <span v-else class="zalgo" :class="{ breathe: breathe && level > 0 }" :data-text="text" data-audit="ignore">{{ out }}</span>
</template>

<style scoped>
.zalgo { display: inline; }
/* the rot underneath (its own colour, base letters included), the clean word exactly on top */
.tinted { position: relative; display: inline-block; }
.tinted .clean { position: absolute; left: 0; top: 0; color: inherit; white-space: pre; }
.tinted .rot { white-space: pre; }
.breathe {
  display: inline-block;
  animation: zalgo-breathe 3.2s ease-in-out infinite;
}
@keyframes zalgo-breathe {
  0%, 100% { transform: scaleY(1); filter: none; }
  45% { transform: scaleY(1.035); }
  50% { filter: drop-shadow(2px 0 0 rgba(195, 242, 64, 0.5)) drop-shadow(-2px 0 0 rgba(255, 60, 60, 0.4)); }
  55% { transform: scaleY(0.985); filter: none; }
}
@media (prefers-reduced-motion: reduce) { .breathe { animation: none; } }
</style>
