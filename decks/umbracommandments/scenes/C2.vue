<script setup>
// Steps 1–4: Page, Block, Data, Composition, highlighted in turn (a highlighter sweep, the rest dim).
// The tablet still says six (and "seven is right out"): step 5 zooms onto it (frames in deck.js),
// step 6 the chisel corrects it (rules.js KJV[2]), step 7 backs out to the whole card, and step 8
// Repository and Repository Item ascend.
import Commandment from '../components/Commandment.vue'
import { useStep } from '@engine/useStep.js'

const { step } = useStep()
</script>

<template>
  <Commandment :n="2" spill>
    <template #title>There are four content types.</template>
    <template #lead>Each gets a root folder. After that, I don't care.</template>
    <template #points>
      <li :class="{ hl: step === 1, dim: step >= 2 && step <= 4 }"><span class="mark"><b>Page</b>: renders, can be composed onto</span></li>
      <li :class="{ hl: step === 2, dim: step === 1 || step === 3 || step === 4 }"><span class="mark"><b>Block</b>: renders in a list or grid, never composed onto</span></li>
      <li :class="{ hl: step === 3, dim: step === 1 || step === 2 || step === 4 }"><span class="mark"><b>Data</b>: an element that never renders on its own</span></li>
      <li :class="{ hl: step === 4, dim: step >= 1 && step <= 3 }"><span class="mark"><b>Composition</b>: only ever composed</span></li>
    </template>
    <!-- they float up out of the card on purpose: the audit leaves them alone -->
    <div class="ascension rise" :class="{ up: step >= 8 }" style="--d: 4" data-audit="ignore">
      <span class="folder"><i class="halo" />Repository</span>
      <span class="folder f2"><i class="halo" />Repository Item</span>
    </div>
  </Commandment>
</template>

<style scoped>
.ascension { display: flex; gap: 40px; margin-top: 6px; }
.folder {
  position: relative;
  display: inline-flex;
  align-items: center;
  font: 700 30px var(--sans);
  padding: 14px 22px 14px 74px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.35);
  transition: transform 4.5s cubic-bezier(0.5, 0, 0.75, 0.2), opacity 4.5s ease-in;
}
.folder::before {
  content: '';
  position: absolute;
  left: 18px;
  top: 50%;
  width: 40px;
  height: 30px;
  transform: translateY(-50%);
  border-radius: 3px 6px 6px 6px;
  background: linear-gradient(#e7c45a, #c99a2a);
  box-shadow: inset 0 6px 0 rgba(255, 255, 255, 0.35);
}
.halo {
  position: absolute;
  left: 50%;
  top: -26px;
  width: 140px;
  height: 22px;
  transform: translateX(-50%);
  border-radius: 50%;
  border: 5px solid #ffd76a;
  box-shadow: 0 0 24px 6px rgba(255, 215, 106, 0.8);
  opacity: 0;
  transition: opacity 0.8s;
}
.up .halo { opacity: 1; }
.up .folder { transform: translate(60px, -1500px) rotate(-6deg); opacity: 0.2; }
.up .f2 { transform: translate(-40px, -1600px) rotate(5deg); transition-delay: 0.4s; }
</style>
