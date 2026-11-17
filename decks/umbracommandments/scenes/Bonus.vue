<script setup>
// S22 · The bonus tablet (drawn: components/stone, its text in rules.js KJV[11]). Typos
// ("whateveth", "rightous") kept on purpose: they're on brand.
import StoneTablet from '../components/stone/StoneTablet.vue'
</script>

<template>
  <div class="slide slide--grey bonus">
    <span class="kicker rise">The bonus UmbraCommandment</span>
    <StoneTablet class="rise" style="--d: 1" :n="11" :height="880" />
  </div>
</template>

<style scoped>
.bonus { flex-direction: row; align-items: center; justify-content: center; gap: 90px; padding: 90px; }
.bonus .kicker { align-self: center; }
</style>
