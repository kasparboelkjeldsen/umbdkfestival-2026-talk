<script setup>
// S3 · Disclaimer. On "definitely not cursed", one single-frame flicker (about 2.6 s after the card
// lands): the line shows its cursed self for 50 ms. Nobody should be sure they saw it.
import { asset } from '@engine/asset.js'
import Zalgo from '../curse/Zalgo.vue'
</script>

<template>
  <div class="slide slide--grey disclaimer">
    <div class="text">
      <span class="kicker rise">Disclaimer</span>
      <p class="lead rise" style="--d: 1">This is not meant to poke fun at anyone's beliefs or faith.</p>
      <p class="lead rise" style="--d: 2">It is all good fun, and a follow-up on Umbraco #NotACult.</p>
      <p class="lead last rise" style="--d: 4">
        <span class="clean">And also definitely not cursed.</span>
        <span class="cursed" aria-hidden="true"><Zalgo text="And also definitely not cursed." :amount="0.7" :height="8" :seed="3" :breathe="false" /></span>
      </p>
    </div>
    <img class="monks rise" style="--d: 1" :src="asset('/assets/not-a-cult-procession.jpg')" alt="Hooded monks in blue light, the first holding a tablet with a glowing Umbraco logo" />
  </div>
</template>

<style scoped>
.disclaimer { flex-direction: row; align-items: center; gap: 80px; }
.text { flex: 1; display: flex; flex-direction: column; gap: 40px; }
.lead { font-size: 50px; }
.last { font-style: italic; position: relative; }
.cursed { position: absolute; left: 0; top: 0; color: var(--k-green); opacity: 0; pointer-events: none; }
.is-active .cursed { animation: one-frame 0.05s steps(1) 2.6s 1 both; }
.is-active .clean { animation: one-frame-out 0.05s steps(1) 2.6s 1 both; }
@keyframes one-frame { 0% { opacity: 1; } 100% { opacity: 0; } }
@keyframes one-frame-out { 0% { opacity: 0; } 100% { opacity: 1; } }
.monks { height: 800px; border-radius: 20px; box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35); }
@media (prefers-reduced-motion: reduce) { .cursed, .clean { animation: none !important; } }
</style>
