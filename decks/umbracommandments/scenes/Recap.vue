<script setup>
// S21 · Recap, in daylight (deck.js: cleanse, curse 0). Both tablets again, from a little further
// out so the sky shows round them, carved bigger so all ten read from the back of the room. Only
// there while it's on stage: it covers the working tablets underneath. Pretend-fixed lines
// (the demo's ✨) still flicker.
import StoneTablets from '../components/StoneTablets.vue'
import { STONE, LINE_Y, RECAP_ZOOM } from '../world.js'
import { PLAIN } from '../rules.js'
import { reached } from '../state.js'
import { pretended } from '../curse/sins.js'

// the tablets card's geometry, seen from RECAP_ZOOM× further out, then the stones made a bit bigger
const k = 1 / RECAP_ZOOM
const grow = 1.18
const centres = [960 - 318, 960 + 318]
const top = 540 + (STONE.top - 540) * k * grow
const bottom = 540 + (STONE.bottom - 540) * k * grow
const lines = LINE_Y.map((y) => 540 + (y - 540) * k * grow)
const flicker = (n) => reached('demo') && pretended(n)
</script>

<template>
  <div class="slide chromeless no-mark recap">
    <StoneTablets
      :centres="centres"
      :width="STONE.w * k * grow"
      :top="top"
      :bottom="bottom"
      :lines="lines"
      :rules="PLAIN"
      :line-width="520"
      :num-size="32"
      :rule-size="26"
      :flicker="flicker"
    />
  </div>
</template>

<style scoped>
.recap { background: transparent; padding: 0; }
</style>
