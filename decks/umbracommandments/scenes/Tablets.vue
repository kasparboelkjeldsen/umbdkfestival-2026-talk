<script setup>
// S6 · The tablets. This card IS what the hiker holds up on Mount Bellissima: it sits in his
// hands in the revelation (world.js TABLETS_SLOT), so from S4 on you're looking at it.
//   - before S6 it carries the tiny text ("if you can read this, …"), and when the revelation
//     zooms in (its step 1) the right-hand tablet rewrites itself (S5);
//   - on S6 the tiny text crumbles and the ten are carved in, line by line.
// Each carved line is where a commandment card sits (world.js line()); the cards fade in as the
// camera comes close. The ghost text scrawled over the stone is what you see between the cards.
import { computed } from 'vue'
import StoneTablets from '../components/StoneTablets.vue'
import Detail from '@engine/components/Detail.vue'
import GhostText from '../curse/GhostText.vue'
import { TABLET_X, STONE, LINE_Y } from '../world.js'
import { CARVED } from '../rules.js'
import { deckState, reached, onStage } from '../state.js'
import { pretended } from '../curse/sins.js'

const flicker = (n) => reached('demo') && pretended(n)
const phase = computed(() => (reached('tablets') ? 'ten' : 'tiny'))
// the zoom (S5) is the cue: the rewrite starts by itself once the camera has landed (StoneTablets)
const rewrite = computed(() => onStage('revelation') && deckState.step >= 1)
// the recap draws the tablets again, bigger, on top: step aside so no edge shows behind them
const aside = computed(() => onStage('recap'))
</script>

<template>
  <div class="slide chromeless no-mark tablets" :class="{ aside }">
    <StoneTablets
      :centres="TABLET_X"
      :width="STONE.w"
      :top="STONE.top"
      :bottom="STONE.bottom"
      :lines="LINE_Y"
      :rules="CARVED"
      :num-size="38"
      :rule-size="26"
      :line-width="520"
      :flicker="flicker"
      :phase="phase"
      :rewrite="rewrite"
    />
    <!-- (not from the mountain or further out: there it's ninety phrases a few px tall, drawn again on
         every frame for nothing) -->
    <Detail :from="0.35" class="scrawl">
      <GhostText :count="90" :size="[14, 48]" :from="0.2" :to="0.9" :opacity="0.65" :seed="6" :sharp="150" />
    </Detail>
  </div>
</template>

<style scoped>
.tablets { padding: 0; background: transparent; --ghost: #f3efe3; transition: opacity 0.6s; }
.aside { opacity: 0; }
.scrawl { position: absolute; inset: 0; pointer-events: none; }
</style>
