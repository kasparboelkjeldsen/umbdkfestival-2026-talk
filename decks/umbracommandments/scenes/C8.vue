<script setup>
import Commandment from '../components/Commandment.vue'
import Zalgo from '../curse/Zalgo.vue'
import GhostText from '../curse/GhostText.vue'
</script>

<template>
  <!-- New. Source: the same Pitfalls page (volatile data, custom tables). Ghost text behind the left
       half. It sets up X: your data doesn't belong in the tree, your settings not only in the database. -->
  <Commandment :n="8" spill>
    <GhostText class="behind" :box="{ x: -100, y: -60, w: 1080, h: 1020 }" :count="26" :size="[40, 120]" :from="0.5" :to="0.7" :opacity="0.22" :seed="8" />
    <template #title>Umbraco is not your <Zalgo text="database" :from="0.6" :to="0.9" :height="8" :seed="8" />.</template>
    <template #lead>The content tree is for content. Not your form submissions, not your order log, not your import of 40,000 products.</template>
    <template #points>
      <li>Bulk imports go into custom tables</li>
      <li>If it changes every minute, it isn't content</li>
      <li>If an editor will never open it, it isn't content</li>
    </template>
  </Commandment>
</template>

<style scoped>
.behind { z-index: 0; }
</style>
