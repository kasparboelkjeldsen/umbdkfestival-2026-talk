<script setup>
// The tablet still carries the old wording ("only a Repository at the root"): step 1 zooms onto it
// (frames in deck.js) and the chisel carves the new line (rules.js KJV[9]). Whole lines start to go here.
import Commandment from '../components/Commandment.vue'
import Zalgo from '../curse/Zalgo.vue'
</script>

<template>
  <Commandment :n="9" spill>
    <template #title>A root node is not a rendering node.</template>
    <template #lead>What editors see at the top of the tree should be structure, not content.</template>
    <template #points>
      <li>Every root is a template-less shell, pages beneath it: <span class="mono">www/home</span>, <span class="mono">site-a/home</span></li>
      <li>The root holds its site's settings and shared content</li>
      <li>Permissions: one node per site</li>
      <li class="lost"><s>Collisions are now <Zalgo class="infected" text="impossible" :from="0.6" :to="0.85" :height="9" :seed="9" /></s></li>
    </template>
  </Commandment>
</template>

<style scoped>
.lost { opacity: 0.8; }
.lost .infected { text-shadow: 0 0 18px rgba(195, 242, 64, 0.8); }
</style>
