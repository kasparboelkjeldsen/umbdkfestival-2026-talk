<script setup>
import Commandment from '../components/Commandment.vue'
import Zalgo from '../curse/Zalgo.vue'
</script>

<template>
  <!-- New. The title itself corrupts: a tall column spills above and below "search", out of the card,
       in lime round a clean word, so the title still reads.
       Source: Umbraco docs, Common Pitfalls & Anti-Patterns (the relic beside it). -->
  <Commandment :n="7" spill>
    <template #title>Views render; they don't <Zalgo text="search" :from="0.5" :to="0.6" :height="14" :seed="7" tint="rgba(195, 242, 64, 0.38)" />.</template>
    <template #lead>Your view should know where the fruit is, not climb every branch to find it.</template>
    <template #points>
      <li>No <span class="mono">Model.Root().Descendants&lt;…&gt;()</span> in a navigation partial</li>
      <li>Don't over-query: the same traversal in five partials</li>
      <li>No <span class="mono">IContentService</span> in a view: the cache is for reading</li>
      <li>If you must search, search something built for it</li>
    </template>
  </Commandment>
</template>
