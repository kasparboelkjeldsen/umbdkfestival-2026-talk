<script setup>
// "not a cult" on the canvas itself (deck.js `layers.under`, world space, under every card): round
// the mountain and between the cards of the top row, where the camera only passes mid-flight. The
// tablets and the revelation carry their own (TabletsCard.vue, Revelation.vue), at their own scale.
//
// It's under the cards, but the browser draws it all the same: with the camera inside the mountain
// (anywhere from the tablets in) these letters are thousands of px tall behind it, rasterised on
// every frame of every flight. So it's switched off whenever one of the big cards covers the view.
import { ref, computed, watchEffect } from 'vue'
import { cam } from '@engine/cameraState.js'
import GhostText from './GhostText.vue'
import { REVELATION, TITLE, WHY, DISCLAIMER, BONUS, THANKS, DEMO_TIME, BIG } from '../world.js'

const halfW = 960 * BIG
const halfH = 540 * BIG
// the whole top row, and the air round the mountain the pull-back shows
const row = { x: TITLE.x - halfW * 1.3, y: -halfH * 1.8, w: BONUS.x + halfW * 1.3 - (TITLE.x - halfW * 1.3), h: halfH * 3.6 }
const mountain = { x: REVELATION.x - halfW * 1.5, y: REVELATION.y - halfH * 1.5, w: halfW * 3, h: halfH * 3 }

const CARDS = [TITLE, WHY, DISCLAIMER, REVELATION, BONUS, THANKS, DEMO_TIME]
const covered = computed(() => {
  const hw = cam.w / 2 - 1, hh = (cam.w * 9) / 32 - 1
  return CARDS.some((c) => Math.abs(cam.x - c.x) + hw <= halfW && Math.abs(cam.y - c.y) + hh <= halfH)
})
const el = ref(null)
// written straight to the element: the camera moves every frame, this flips a few times a talk
watchEffect(() => { if (el.value) el.value.style.visibility = covered.value ? 'hidden' : '' }, { flush: 'post' })
</script>

<template>
  <div ref="el" class="ghost-world">
    <GhostText :box="row" :count="70" :size="[1400, 4200]" :from="0.35" :to="0.92" :opacity="0.4" :seed="101" :clip="false" />
    <GhostText :box="mountain" :count="60" :size="[900, 3000]" :from="0.3" :to="0.9" :opacity="0.5" :seed="202" :clip="false" />
  </div>
</template>

<style scoped>
.ghost-world {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
  overflow: visible;
  pointer-events: none;
  --ghost: #d9d4c4;
}
</style>
