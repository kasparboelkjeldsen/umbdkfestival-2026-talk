<script setup>
// About me + Why, merged: the DK Festival crowd knows Kaspar. The why is the new framing:
// these rules aren't new, they were known once and lost.
import { asset } from '@engine/asset.js'
</script>

<template>
  <div class="slide slide--red why">
    <div class="text">
      <span class="kicker rise">Why</span>
      <h2 class="h2 rise" style="--d: 1">Things that were known once, and lost.</h2>
      <ul class="points rise" style="--d: 2">
        <li>Find a fun angle, and anything is fun. Even guiding principles.</li>
        <li>Strong opinions, loosely held. Argue with me.</li>
      </ul>
      <p class="who rise" style="--d: 3">Kaspar Boel Kjeldsen · Kraftvaerk · Umbraco MVP · CMS Advisory Board</p>
    </div>
    <div class="photo rise" style="--d: 1">
      <img :src="asset('/assets/about-me.jpg')" alt="Kaspar on a lookout platform above a forested valley" />
    </div>
  </div>
</template>

<style scoped>
.why { flex-direction: row; padding: 0; }
.text {
  flex: 1;
  padding: 110px 60px 110px 130px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 40px;
}
.h2 { font-size: 96px; }
.who { margin: 0; font-size: 30px; opacity: 0.85; }
.photo {
  width: 760px;
  flex: none;
  clip-path: polygon(22% 0, 100% 0, 100% 100%, 0 100%);
  position: relative;
}
.photo::before {
  /* the lime cut line */
  content: '';
  position: absolute;
  inset: 0;
  background: var(--k-green);
  clip-path: polygon(22% 0, 24% 0, 2% 100%, 0 100%);
  z-index: 1;
}
.photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
</style>
