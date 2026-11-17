<script setup>
// Step 1: the camelCase line highlighted, step 2: the keys line (the highlighter in theme.css).
import Commandment from '../components/Commandment.vue'
import Zalgo from '../curse/Zalgo.vue'
import { useStep } from '@engine/useStep.js'

const { step } = useStep()
</script>

<template>
  <!-- Merged: aliases (old 6) and translation keys (the naming half of old 7). The folder half of
       old 7 now lives in III. -->
  <Commandment :n="6" spill>
    <template #title>Thy names: English camelCase aliases, PascalCase dotted keys.</template>
    <template #lead>Aliases are code. Code is English. End of discussion.</template>
    <template #points>
      <li :class="{ dim: step === 1 || step === 2 }">No more <span class="mono">x.<Zalgo text="NogetPaaDansk" :from="0.3" :to="0.8" :height="6" /> == "…"</span></li>
      <li :class="{ hl: step === 1, dim: step === 2 }"><span class="mark"><span class="mono">articleHeadline</span>, not <span class="mono">ArticleHeadline</span>. Danish goes in labels</span></li>
      <li :class="{ hl: step === 2, dim: step === 1 }"><span class="mark">Keys: <span class="mono">Site.Navigation.Home</span>. Consistent keys can feed other systems</span></li>
    </template>
  </Commandment>
</template>
