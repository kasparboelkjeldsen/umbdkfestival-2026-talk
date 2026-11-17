<script setup>
// Steps 1–4: the four lines highlighted in turn (data types, media, document types, dictionary),
// the highlighter in theme.css.
import Commandment from '../components/Commandment.vue'
import { useStep } from '@engine/useStep.js'

const { step } = useStep()
const on = (n) => ({ hl: step.value === n, dim: step.value >= 1 && step.value <= 4 && step.value !== n })
</script>

<template>
  <!-- Merged: data types in folders, no media at the root, the folder clause of the old 7. -->
  <Commandment :n="3">
    <template #title>The root is bare, and a folder is only a folder.</template>
    <template #lead>Your data-type folder is a window into how much you respect the next developer.</template>
    <template #points>
      <li :class="on(1)"><span class="mark">Data types in <span class="mono">Custom/&lt;editor alias&gt;</span></span></li>
      <li :class="on(2)"><span class="mark">No media at the media root</span></li>
      <li :class="on(3)"><span class="mark">Document types in their type folders</span></li>
      <li :class="on(4)"><span class="mark">A dictionary parent holds no value of its own</span></li>
    </template>
    <p class="free rise" style="--d: 4">Folders are free. Regret is not.</p>
  </Commandment>
</template>

<style scoped>
.free { margin: 0; font: italic 400 40px var(--serif); }
</style>
