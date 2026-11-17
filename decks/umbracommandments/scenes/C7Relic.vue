<script setup>
// S13b: the Pitfalls page as a manuscript. Step 1 zooms to the v8 opener, step 2 to the
// Descendants warning (frames in deck.js, boxes in components/relics.js); each is gilded once the
// camera lands on it.
import PitfallsRelic from '../components/PitfallsRelic.vue'
</script>

<template>
  <PitfallsRelic :focus="{ 1: 'ultra', 2: 'descendants' }" />
</template>
