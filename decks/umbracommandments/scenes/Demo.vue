<script setup>
// The live demo. The travelling backoffice lands on the slot (deck.js `backoffice`): nearly the
// whole card, on Settings, still pure. Press 1 spotlights the Penance tab, press 2 opens the Penance Board at maximum sin and the
// clicker now drives it (Umbraco.Community.Sinners' own clicker script: exhibit, spotlight, return,
// fix, next commandment). When that script is over, or on Escape, the clicker is the deck's again
// and the next scene is the recap.
import { computed } from 'vue'
import { useStep } from '@engine/useStep.js'
import { slotBox, DEMO_SLOT, STATIC } from '../components/evidence.js'

const { step } = useStep()
// what the live backoffice shows at each step (the fallback text, if it's not there)
const showing = computed(() => (step.value >= 2 ? 'The Penance Board' : 'Settings'))
</script>

<template>
  <!-- no-mark: the wordmark would sit on top of the live backoffice in the slot -->
  <div class="slide slide--dark demo no-mark">
    <!-- what shows if the live backoffice isn't there -->
    <div class="slot" :style="slotBox(DEMO_SLOT)">
      <!-- a built deck: there is no site to be down -->
      <span v-if="STATIC">
        The live demo: the Penance Board absolves an Umbraco site of its sins, one commandment at a time.<br />
        <small>It needs the demo site: clone the repository and run <code>npm run dkfestival</code>.</small>
      </span>
      <span v-else>{{ showing }} (live). If you can read this, the demo site is down: alt-tab to the backup tab.</span>
    </div>
  </div>
</template>

<style scoped>
.demo { background: #000 !important; }
.slot {
  position: absolute;
  display: grid;
  place-items: center;
  padding: 80px;
  text-align: center;
  border-radius: 18px;
  outline: 4px dashed rgba(195, 242, 64, 0.4);
  outline-offset: 10px;
  color: var(--k-light);
  font: 700 40px/1.35 var(--sans);
}
.slot small { display: block; margin-top: 28px; font-size: 32px; font-weight: 400; opacity: 0.75; }
.slot code { font: 400 30px var(--mono); color: var(--k-green); }
</style>
