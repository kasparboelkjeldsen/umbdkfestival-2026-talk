<script setup>
// S15a: Sebastiaan Janssen described the separate site root in December 2010 (cultiv.nl), and the
// post carries its own warning label. A comment from November 2012 is "the Fall": the moment the
// knowledge was lost, with a timestamp. Quotes are verbatim and short (fetched 27 Oct 2026).
// Steps zoom to the banner, the structure, then the Fall (frames in deck.js, boxes in relics.js);
// each passage is gilded once the camera lands on it (Manuscript.vue).
import { computed } from 'vue'
import { useStep } from '@engine/useStep.js'
import InlaySlide from '../components/InlaySlide.vue'
import Manuscript from '../components/Manuscript.vue'

const { step } = useStep()
const FOCUS = { 1: 'warning', 2: 'structure', 3: 'fall' }
// Infinity outside the deck (thumbnails, ?sheet): nothing gilded there
const lit = computed(() => (Number.isFinite(step.value) ? FOCUS[step.value] ?? '' : ''))
</script>

<template>
  <InlaySlide class="slide--dark relic-card no-mark">
    <Manuscript
      source="cultiv.nl · Sebastiaan Janssen · 19 December 2010"
      title="Tip of the week: The “ultimate” site structure setup"
      :filler="[[400, 2], [880, 4]]"
      :highlight="lit"
    >
      <p class="passage warning" :class="{ lit: lit === 'warning' }" style="left: 280px; top: 255px">“…very likely completely outdated… You have been warned. :-)”</p>
      <div class="passage structure" :class="{ lit: lit === 'structure' }" style="left: 280px; top: 470px">
        <p>“Basically, there will always be two nodes: ‘Site settings’ and ‘Home’”</p>
        <p class="tree">▾ <b>Site</b> <i>(no template)</i><br />&nbsp;&nbsp;&nbsp;▸ Site settings<br />&nbsp;&nbsp;&nbsp;▸ Home</p>
      </div>
      <div class="passage fall" :class="{ lit: lit === 'fall' }" style="left: 280px; top: 720px">
        <p class="when">14 November 2012, a comment</p>
        <p>“This is exactly what I used to do... up until today.”</p>
      </div>
      <p class="stamp" :class="{ on: step >= 3 }" style="left: 1110px; top: 730px">OMG so smart!</p>
    </Manuscript>
  </InlaySlide>
</template>

<style scoped>
.relic-card { padding: 0; background: #17140f !important; }
.passage { font-size: 38px; line-height: 1.3; }
.passage p { margin: 0; }
.warning {
  padding: 16px 26px;
  border: 3px solid #8a3b12;
  border-radius: 8px;
  background: rgba(255, 210, 120, 0.45);
  font-size: 36px;
}
.structure { display: flex; flex-direction: column; gap: 14px; width: 1300px; }
.tree { font: 400 32px/1.4 var(--sans); padding: 10px 22px; border-left: 4px solid rgba(90, 50, 10, 0.4); }
.fall { width: 820px; display: flex; flex-direction: column; gap: 8px; }
.when { font: 700 28px var(--sans); letter-spacing: 0.06em; text-transform: uppercase; opacity: 0.75; }
/* candle-lit lettering */
.stamp {
  position: absolute;
  margin: 0;
  z-index: 2;
  /* 60px: "OMG so smart!" has to end inside the third zoom's frame (relics.js CULTIV.fall, x ≤ 1580) */
  font: italic 400 60px/1 var(--serif);
  white-space: nowrap;
  color: #ffcf6b;
  text-shadow: 0 0 18px rgba(255, 170, 40, 0.9), 0 0 60px rgba(255, 120, 20, 0.6);
  transform: rotate(-6deg) scale(1.6);
  opacity: 0;
  transition: opacity 0.4s, transform 0.5s var(--ease-spring);
}
.stamp.on { opacity: 1; transform: rotate(-6deg) scale(1); animation: candle 2.4s ease-in-out 0.5s infinite; }
@keyframes candle {
  0%, 100% { text-shadow: 0 0 18px rgba(255, 170, 40, 0.9), 0 0 60px rgba(255, 120, 20, 0.6); }
  50% { text-shadow: 0 0 12px rgba(255, 170, 40, 0.7), 0 0 40px rgba(255, 120, 20, 0.45); }
}
</style>
