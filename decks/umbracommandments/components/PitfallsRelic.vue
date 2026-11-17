<script setup>
// Umbraco's own docs warned about VII and VIII all along: Common Pitfalls & Anti-Patterns.
// Shared by c7-relic and c8-relic (the same manuscript, zoomed to another passage); the boxes the
// camera zooms to are PITFALLS in ./relics.js, used by deck.js `frames`. `focus` says which passage
// makes the point on which build step (it's gilded once the camera lands there, see Manuscript.vue).
//
// Quotes are verbatim and short (docs.umbraco.com, fetched 27 Oct 2026). The v8 opener ("This
// section is ultra important!") is from Kaspar's memory of our.umbraco.com and NOT verified: the old
// URL redirects and the archive couldn't be reached. Check it, or drop it.
import { computed } from 'vue'
import { useStep } from '@engine/useStep.js'
import InlaySlide from './InlaySlide.vue'
import Manuscript from './Manuscript.vue'

const props = defineProps({
  focus: { type: Object, default: () => ({}) }, // build step → 'ultra' | 'descendants' | 'volatile'
})
const { step } = useStep()
// Infinity outside the deck (thumbnails, ?sheet): nothing gilded there
const lit = computed(() => (Number.isFinite(step.value) ? props.focus[step.value] ?? '' : ''))
</script>

<template>
  <InlaySlide class="slide--dark relic-card no-mark">
    <Manuscript
      source="docs.umbraco.com · the section nobody read"
      title="Common Pitfalls & Anti-Patterns"
      :filler="[[600, 2], [860, 5]]"
      :highlight="lit"
    >
      <p class="passage old" :class="{ lit: lit === 'ultra' }" style="left: 280px; top: 240px">
        “This section is ultra important!”<small>our.umbraco.com, the v8 docs</small>
      </p>
      <p class="passage" style="left: 280px; top: 380px; width: 1300px">“…memory leaks, instability, or poor performance on your site.”</p>
      <div class="passage" :class="{ lit: lit === 'descendants' }" style="left: 280px; top: 450px; width: 1300px">
        <p class="head">Querying with Descendants using DescendantsOrSelf</p>
        <p>“When using queries like this, you need to understand the implications.”</p>
      </div>
      <div class="passage" :class="{ lit: lit === 'volatile' }" style="left: 280px; top: 680px; width: 1200px">
        <p class="head">Using Umbraco content items for volatile data</p>
        <p>“When you need to store, write or track data that changes a lot, use a custom database table or another service.”</p>
      </div>
    </Manuscript>
  </InlaySlide>
</template>

<style scoped>
.relic-card { padding: 0; background: #17140f !important; }
.passage { font-size: 40px; line-height: 1.3; }
.passage p { margin: 0; }
.passage .head { margin-bottom: 14px; }
.old { font-size: 54px; font-style: italic; color: #6b1d0c; }
.old small { display: block; font: 700 26px var(--sans); letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.7; font-style: normal; }
.head { font-size: 46px; color: #2c1b0a; }
</style>
