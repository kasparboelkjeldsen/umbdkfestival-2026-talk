<script setup>
// SPIKE (section 4 of the handoff): the live backoffice in a card. Not part of the talk;
// `skip: true` in deck.js keeps it out of normal navigation.
import LiveUmbraco from '../components/LiveUmbraco.vue'

defineProps({
  route: { type: String, default: '/umbraco/section/settings/dashboard/penance' },
  keys: { type: String, default: 'deck' },
})
</script>

<template>
  <div class="slide slide--dark spike">
    <span class="kicker">Spike · live backoffice · keys: {{ keys }}</span>
    <div class="screen"><LiveUmbraco :route="route" :keys="keys" /></div>
  </div>
</template>

<style scoped>
.spike { padding: 60px 80px; gap: 24px; }
.screen { flex: 1; min-height: 0; }
</style>
