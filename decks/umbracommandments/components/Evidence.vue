<script setup>
// Live evidence (set in beside its commandment, world.js): a card the travelling backoffice lands on (deck.js `backoffice`). Underneath the
// slot sit the before → after screenshots, so if the live backoffice is down (or hidden with L),
// the card still makes its point. A card that turns over has none: its slot is white, the
// backoffice's own background, so the backoffice fades to white as the card starts to turn.
import { asset } from '@engine/asset.js'
import { slotBox, STATIC } from './evidence.js'
import InlaySlide from './InlaySlide.vue'

defineProps({
  label: { type: String, required: true },
  shots: { type: Array, default: () => [] }, // [{ src, alt }]
})
</script>

<template>
  <!-- no-mark: the wordmark would sit on top of the live backoffice in the slot -->
  <InlaySlide class="slide--dark evidence no-mark">
    <span class="kicker">Evidence · {{ label }}</span>
    <div class="slot" :class="{ blank: !shots.length && !STATIC }" :style="slotBox()">
      <!-- a built deck has no live backoffice: a card without screenshots says what was here -->
      <p v-if="STATIC && !shots.length" class="absent">
        On stage, this is the real Umbraco backoffice, live.<br />
        <small>It needs the demo site: clone the repository and run <code>npm run dkfestival</code>.</small>
      </p>
      <div class="shots">
        <template v-for="(s, i) in shots" :key="s.src">
          <span v-if="i" class="arrow">→</span>
          <img :src="asset(s.src)" :alt="s.alt" />
        </template>
      </div>
    </div>
  </InlaySlide>
</template>

<style scoped>
.evidence { padding: 56px 80px; }
.slot {
  position: absolute;
  border-radius: 18px;
  background: #11131a;
  outline: 4px dashed rgba(255, 255, 255, 0.25);
  outline-offset: 10px;
  display: grid;
  place-items: center;
  overflow: hidden;
}
.slot.blank { background: #fff; }
.absent { margin: 0; padding: 0 120px; text-align: center; color: var(--k-light); font: 700 44px/1.35 var(--sans); }
.absent small { display: block; margin-top: 28px; font-size: 32px; font-weight: 400; opacity: 0.75; }
.absent code { font: 400 30px var(--mono); color: var(--k-green); }
.shots { display: flex; align-items: center; gap: 40px; height: 86%; }
.shots img { height: 100%; border-radius: 10px; box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5); }
.arrow { font: 700 120px var(--sans); color: var(--k-green); }
</style>
