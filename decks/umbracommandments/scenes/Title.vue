<template>
  <div class="slide slide--grey title">
    <div class="stripe" aria-hidden="true" />
    <span class="kicker rise">DK Festival</span>
    <h1 class="h1 rise" style="--d: 1">The 10<br />UmbraCommandments</h1>
    <p class="lead rise" style="--d: 2">We are all sinners</p>
    <p class="who rise" style="--d: 3">Kaspar Boel Kjeldsen · Kraftvaerk</p>
  </div>
</template>

<style scoped>
.title { justify-content: center; gap: 34px; }
.h1 { font-size: 160px; }
.lead { font-size: 60px; font-style: italic; }
.who { margin: 0; font-size: 36px; opacity: 0.8; position: relative; z-index: 2; }
/* the Kraftvaerk diagonal, in its green */
.stripe {
  position: absolute;
  inset: 0;
  background: var(--k-green);
  clip-path: polygon(78% 0, 100% 0, 100% 100%, 58% 100%);
}
</style>
