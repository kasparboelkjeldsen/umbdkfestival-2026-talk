<script setup>
import Commandment from '../components/Commandment.vue'
import Zalgo from '../curse/Zalgo.vue'
</script>

<template>
  <!-- First infection: CORS (light zalgo and a strike-glitch). -->
  <Commandment :n="4" spill>
    <template #title>Compose in your IComposer, not in Program.cs.</template>
    <template #lead>Program.cs uses the minimal hosting model. Let's keep it minimal.</template>
    <template #points>
      <li>IComposers are ordered, discoverable and dependency-aware</li>
      <li>A bloated Program.cs means nobody agreed where things go</li>
      <li>Not Umbraco (App Insights, <Zalgo class="glitch" text="CORS" :from="0.2" :to="0.55" :height="6" />)? An extension method on the builder</li>
    </template>
  </Commandment>
</template>

<style scoped>
.glitch { animation: glitch 3.1s steps(1) infinite; }
@keyframes glitch {
  0%, 100% { transform: none; text-decoration: none; }
  62% { transform: translate(3px, -2px) skewX(-12deg); text-decoration: line-through 4px var(--blood); }
  64% { transform: translate(-2px, 1px); text-decoration: none; }
  65% { transform: none; }
}
@media (prefers-reduced-motion: reduce) { .glitch { animation: none; } }
</style>
