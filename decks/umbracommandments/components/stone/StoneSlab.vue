<script setup>
// A weathered stone slab, w × h px: limestone cut to a chipped outline (outline.js), with a worn
// bevel, cracks, lichen, its own thickness and shadow, and the curse settling on it as the deck
// darkens. Carving goes on top (slot), in the same px.
//
//   <StoneSlab :w="528" :h="880" shape="slab" :seed="3">…carved text…</StoneSlab>
//
// It's a picture: slab.js paints it once at load (relief lit in a shader) and this shows the
// result as an <img>. Live SVG that size (a clipped texture, wide strokes for the bevel and the
// shadow) was re-rasterised on every frame of a zoom and cost most of the frame rate round the
// tablets; a picture is one quad. Until it's painted (and without WebGL) a plain cut shows.
import { slabArt } from './slab.js'

const props = defineProps({
  w: { type: Number, required: true },
  h: { type: Number, required: true },
  shape: { type: String, default: 'slab' }, // 'slab' | 'round'
  seed: { type: Number, default: 1 },
  res: { type: Number, default: 2 },        // picture px per card px (more is sharper close up, and dearer on every zoom)
})

const art = slabArt(props)
const d = art.d
const url = art.url
const pad = art.pad
</script>

<template>
  <div class="stone-slab" :style="{ width: `${w}px`, height: `${h}px` }">
    <img
      v-if="url"
      class="face"
      :src="url"
      alt=""
      draggable="false"
      :style="{ left: `${-pad}px`, top: `${-pad}px`, width: `${w + pad * 2}px`, height: `${h + pad * 2}px` }"
    />
    <svg v-else :width="w" :height="h" :viewBox="`0 0 ${w} ${h}`" aria-hidden="true">
      <path :d="d" fill="#b3ab9b" stroke="#6f685c" stroke-width="3" />
    </svg>
    <div class="carving"><slot /></div>
    <!-- the curse settles on the stone: darker, colder (over the carving too) -->
    <svg class="night" :width="w" :height="h" :viewBox="`0 0 ${w} ${h}`" aria-hidden="true">
      <path :d="d" />
    </svg>
  </div>
</template>

<style scoped>
.stone-slab { position: relative; flex: none; }
.stone-slab > svg { position: absolute; inset: 0; display: block; overflow: visible; }
.face { position: absolute; display: block; max-width: none; pointer-events: none; user-select: none; }
.carving { position: absolute; inset: 0; }
.night { pointer-events: none; }
.night path {
  fill: #070912;
  opacity: calc(var(--curse, 0) * 0.55);
}
</style>
