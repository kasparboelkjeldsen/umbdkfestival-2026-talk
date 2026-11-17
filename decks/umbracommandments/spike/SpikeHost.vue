<script setup>
// SPIKE step 5: a card that hosts the travelling backoffice. It only draws the slot; the
// backoffice itself is the BackofficeSurface layer, placed on this box by deck.js `backoffice`.
defineProps({ label: { type: String, default: '' } })
</script>

<template>
  <div class="slide slide--dark spike-host">
    <span class="kicker">Spike · one backoffice, many cards</span>
    <h2 class="h2">{{ label }}</h2>
    <div class="slot" />
  </div>
</template>

<style scoped>
.spike-host { padding: 60px 80px; }
/* matches backoffice: { cx: 1100, cy: 600, w: 1500 } in deck.js */
.slot {
  position: absolute;
  left: 350px;
  top: 178px;
  width: 1500px;
  height: 844px;
  border: 4px dashed rgba(255, 255, 255, 0.35);
  border-radius: 18px;
}
</style>
