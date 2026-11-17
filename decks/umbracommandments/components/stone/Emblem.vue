<script setup>
// A commandment's engraving, cut into the tablet: THE VIOLATION next to THE OBEDIENCE (the bonus
// has one wide panel). Each line is drawn twice, the way a cut in stone catches the light: a pale
// lip a pixel down and right, then the dark groove over it.
import EmblemArt from './EmblemArt.vue'

const props = defineProps({ n: { type: Number, required: true } })
const uid = `em${props.n}-${Math.random().toString(36).slice(2, 7)}`
const single = props.n === 11
const panels = single ? [{ side: 'v', x: 0 }] : [{ side: 'v', x: 0, label: 'THE VIOLATION' }, { side: 'o', x: 220, label: 'THE OBEDIENCE' }]
const layers = [
  { cls: 'lip', transform: 'translate(1.2 1.7)' },
  { cls: 'groove', transform: '' },
]
</script>

<template>
  <svg class="emblem" viewBox="0 0 420 216" aria-hidden="true">
    <g v-for="l in layers" :key="l.cls" :class="l.cls" :transform="l.transform">
      <g v-for="p in panels" :key="p.side" :transform="`translate(${p.x} 0)`">
        <EmblemArt :n="n" :side="p.side" :uid="`${uid}-${l.cls}-${p.side}`" />
        <text v-if="p.label" x="100" y="210" text-anchor="middle" class="label">{{ p.label }}</text>
      </g>
      <path v-if="!single" d="M210 14V196" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="1 5" stroke-linecap="round" />
    </g>
  </svg>
</template>

<style scoped>
.emblem { display: block; width: 100%; height: auto; overflow: visible; }
.lip { color: rgba(255, 247, 230, 0.4); }
.groove { color: rgba(34, 26, 18, 0.86); }
.label {
  fill: currentColor;
  font: 700 15px 'DM Sans', system-ui, sans-serif;
  letter-spacing: 0.14em;
}
</style>
