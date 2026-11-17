<script setup>
// The commandment card: the numeral, the plain rule and its explanation on the left, the tablet on
// the right (drawn: components/stone/StoneTablet.vue, its King James line in rules.js), the
// Kraftvaerk wordmark bottom-left. Every one is the same layout, so the corruption reads as the
// same thing going wrong. The rule (#title) and the lines (#lead, #points) are slots, so a scene
// can infect any word with <Zalgo>.
//
// It's set into its carved line on the tablets (world.js), so it materialises as the camera
// comes close (InlaySlide). If the demo only pretended to absolve it (✨), the rule flickers.
import InlaySlide from './InlaySlide.vue'
import StoneTablet from './stone/StoneTablet.vue'
import { ROMAN } from '../world.js'
import { reached } from '../state.js'
import { pretended } from '../curse/sins.js'

const props = defineProps({
  n: { type: Number, required: true },
  spill: { type: Boolean, default: false }, // let Zalgo columns leave the card
  variant: { type: String, default: 'grey' },
})
const flicker = () => reached('demo') && pretended(props.n)
</script>

<template>
  <InlaySlide class="commandment" :class="[`slide--${variant}`, { spill }]">
    <div class="text">
      <span class="kicker rise">{{ ROMAN[n] }}</span>
      <h2 class="h2 rule rise" :class="{ flicker: flicker() }" style="--d: 1"><slot name="title" /></h2>
      <p v-if="$slots.lead" class="lead rise" style="--d: 2"><slot name="lead" /></p>
      <ul v-if="$slots.points" class="points rise" style="--d: 3"><slot name="points" /></ul>
      <slot />
    </div>
    <StoneTablet class="rise" style="--d: 1" :n="n" :height="880" />
  </InlaySlide>
</template>

<style scoped>
.commandment {
  flex-direction: row;
  align-items: center;
  gap: 80px;
  padding: 90px 110px 100px 130px;
}
.text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.kicker { font-size: 34px; padding: 10px 30px; font-family: var(--serif); letter-spacing: 0.08em; }
.rule { font-size: 88px; line-height: 1.04; }
.lead { font-size: 40px; font-style: italic; max-width: 1050px; }
.points { font-size: 38px; gap: 16px; }
.flicker { animation: flicker 2.7s steps(1) infinite; }
@keyframes flicker {
  0%, 100% { opacity: 1; }
  31% { opacity: 0.55; }
  33% { opacity: 1; }
  71% { opacity: 0.75; }
  72% { opacity: 1; }
}
</style>
