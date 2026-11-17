<script setup>
// The root of a card that's set into something bigger (world.js): a commandment in its carved
// line, a sub-scene on the stone beside it. It materialises as the camera comes close (it's
// invisible while the card is under `from` of the screen wide), so from further out you only see
// what it's set into: the carving, the stone. In a formation or the hand it always shows
// (theme.css), and thumbnails are at zoom 1, so ?sheet shows every card.
//
//   <InlaySlide class="slide--grey my-scene">…</InlaySlide>   instead of <div class="slide …">
import Detail from '@engine/components/Detail.vue'

defineProps({ from: { type: Number, default: 0.3 } })
</script>

<template>
  <Detail :from="from" class="slide inlay"><slot /></Detail>
</template>
