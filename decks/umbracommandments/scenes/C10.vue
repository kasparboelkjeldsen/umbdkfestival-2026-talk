<script setup>
import Commandment from '../components/Commandment.vue'
import Zalgo from '../curse/Zalgo.vue'
import GhostText from '../curse/GhostText.vue'
</script>

<template>
  <!-- Pushed harder: everything the solution needs travels with the repo, including settings you invented. -->
  <Commandment :n="10" spill>
    <GhostText class="behind" :count="34" :size="[36, 110]" :from="0.75" :to="0.88" :opacity="0.2" :seed="10" />
    <template #title>It is a sin not to uSync when not on Umbraco Cloud.</template>
    <template #lead>If the solution needs it to work, it travels with the repository. Including the settings you invented.</template>
    <template #points>
      <li>Schema via uSync, or Deploy on Cloud. Never both</li>
      <li>Settings in custom tables need a uSync handler, or a JSON file on disk</li>
      <li>Developer settings don't go in a Site Settings node: content doesn't travel with git</li>
      <li>Either way: in source control, <Zalgo class="blood" text="no exceptions" :from="0.7" :to="0.86" :height="12" :above="0.12" :below="1.4" :seed="10" /></li>
    </template>
  </Commandment>
</template>

<style scoped>
.behind { z-index: 0; }
.blood { color: #fff; text-shadow: 2px 0 0 var(--blood), -2px 0 0 var(--blood), 0 0 16px rgba(216, 32, 58, 0.8); }
</style>
