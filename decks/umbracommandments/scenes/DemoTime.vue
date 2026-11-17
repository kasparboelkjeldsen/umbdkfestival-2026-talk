<script setup>
// The corruption has won: all black, DEMO in lime, TIME in red, both buried in towering columns,
// and the chant everywhere behind them.
import Zalgo from '../curse/Zalgo.vue'

// fixed positions so every rehearsal looks the same
const chant = [
  [120, 140, -8, 0.16], [980, 90, 6, 0.12], [1460, 260, -3, 0.2], [260, 760, 4, 0.14],
  [1300, 820, -6, 0.18], [700, 940, 2, 0.1], [60, 470, 10, 0.12], [1560, 560, -12, 0.14],
]
</script>

<template>
  <div class="slide slide--dark spill demo-time">
    <div class="chants" aria-hidden="true" data-audit="ignore">
      <span
        v-for="([x, y, r, o], i) in chant"
        :key="i"
        class="chant"
        :style="{ left: `${x}px`, top: `${y}px`, transform: `rotate(${r}deg)`, opacity: o }"
      >not a cult · not a cult · Not a cult</span>
    </div>
    <h1 class="h1 words">
      <Zalgo class="demo" text="DEMO" :amount="1" :height="16" :seed="23" />
      <Zalgo class="time" text="TIME" :amount="1" :height="16" :seed="42" />
    </h1>
  </div>
</template>

<style scoped>
.demo-time { background: #000 !important; justify-content: center; align-items: center; }
.words { font: 700 260px/1 var(--sans); letter-spacing: 0.04em; display: flex; gap: 70px; z-index: 2; }
.demo { color: var(--k-green); }
.time { color: var(--blood); }
.chants { position: absolute; inset: 0; overflow: hidden; }
.chant {
  position: absolute;
  font: italic 400 46px var(--serif);
  color: var(--k-light);
  white-space: nowrap;
  pointer-events: none;
}
</style>
