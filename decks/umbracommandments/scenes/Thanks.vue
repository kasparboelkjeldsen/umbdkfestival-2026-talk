<script setup>
// S24 · Thank you. Never cursed, and nothing over the QR code, so it scans.
import QrCode from '@engine/components/QrCode.vue'
</script>

<template>
  <div class="slide slide--dark thanks">
    <svg class="k" viewBox="0 0 100 120" aria-hidden="true">
      <polygon points="2,2 30,2 30,50 70,2 98,2 55,56 98,118 70,118 30,64 30,118 2,118" />
    </svg>
    <div class="text">
      <h2 class="h1 rise">Thank You</h2>
      <p class="where rise" style="--d: 1">Slides and code at<br /><span class="url">github.com/kasparboelkjeldsen/umbdkfestival-2026-talk</span></p>
    </div>
    <!-- layout none: the text on the left already says what and where (its own caption squeezed it) -->
    <QrCode class="qr" url="https://github.com/kasparboelkjeldsen/umbdkfestival-2026-talk" layout="none" :size="440" />
  </div>
</template>

<style scoped>
.thanks { flex-direction: row; align-items: center; justify-content: space-between; gap: 60px; padding: 100px 140px 120px; }
.text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 40px; position: relative; z-index: 2; }
.h1 { color: var(--k-green); font-size: 170px; }
.where { margin: 0; font-size: 40px; line-height: 1.35; }
.url { font: 400 30px var(--mono); opacity: 0.85; white-space: nowrap; }
.qr { flex: none; position: relative; z-index: 2; }
/* the Kraftvaerk K, in outline */
.k {
  position: absolute;
  left: -40px;
  top: 50%;
  width: 760px;
  height: 900px;
  transform: translateY(-50%);
  opacity: 0.22;
}
.k polygon { fill: none; stroke: var(--k-green); stroke-width: 0.8; stroke-linejoin: round; }
</style>
