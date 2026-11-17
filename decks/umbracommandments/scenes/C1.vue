<script setup>
import Commandment from '../components/Commandment.vue'
</script>

<template>
  <Commandment :n="1">
    <template #title>Content is not composable.</template>
    <template #lead>Compositions are contracts written in blood. Remove a composition, and all its data, on every page it is used on, is gone.</template>
    <template #points>
      <li>Block lists and grids share the data type, never the composition</li>
      <li>Safe to compose: settings, meta, CTAs, references</li>
      <li>Would the page still be a page without it?</li>
      <li>Could you derive a fallback from what's left?</li>
    </template>
  </Commandment>
</template>
