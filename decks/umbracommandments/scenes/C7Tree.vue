<script setup>
// S13a, part 2: the tree Descendants() walks. The navigation partial (C7Code) sits at the root; the
// flight here pulls back to show thousands of nodes. Step 1: the walk lights every node, in order,
// fast, while only the five menu items (ringed) were ever needed. Compressible.
import { computed } from 'vue'
import { useStep } from '@engine/useStep.js'
import InlaySlide from '../components/InlaySlide.vue'
import { TREE_CODE } from '../world.js'
import { useNear } from '../components/near.js'

const { step } = useStep()
// ~2,900 nodes: only mounted while the tree is on stage or next (components/near.js)
const show = useNear()

function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rnd = mulberry32(77)

// root (the partial) → 5 menu pages → 9 → 9 → 6: about 2,900 nodes, laid out top-down, each
// subtree in its own share of the width, leaves scattered in a band at the bottom
const ROOT = { x: TREE_CODE.cx, y: TREE_CODE.cy + (TREE_CODE.w * 9) / 32 }
const LEVELS = [
  { n: 5, y: 380, r: 13 },
  { n: 9, y: 520, r: 6 },
  { n: 9, y: 680, r: 3.2 },
  { n: 6, y: 820, r: 2.2, band: 230 },
]
const nodes = []
const edges = []
function grow(parent, depth, x0, x1) {
  const L = LEVELS[depth]
  if (!L) return
  const w = (x1 - x0) / L.n
  for (let i = 0; i < L.n; i++) {
    const x = x0 + w * (i + 0.5) + (rnd() - 0.5) * w * 0.5
    const y = L.y + (L.band ? rnd() * L.band : (rnd() - 0.5) * 30)
    const node = { x, y, r: L.r, depth, order: nodes.length }
    nodes.push(node)
    if (depth < 3) edges.push({ x1: parent.x, y1: parent.y, x2: x, y2: y, depth })
    grow(node, depth + 1, x0 + w * i, x0 + w * (i + 1))
  }
}
grow(ROOT, 0, 60, 1860)
const total = nodes.length
const DUR = 6 // seconds for the whole walk
const walking = computed(() => step.value >= 1)
// the edges never move: two paths (one per stroke weight) instead of ~450 lines
const EDGE_PATHS = [0, 1, 2].map((depth) => edges.filter((e) => e.depth === depth)
  .map((e) => `M${e.x1.toFixed(1)} ${e.y1.toFixed(1)}L${e.x2.toFixed(1)} ${e.y2.toFixed(1)}`).join(''))
</script>

<template>
  <InlaySlide class="slide--dark tree-walk">
    <svg v-if="show" class="tree" viewBox="0 0 1920 1080" :class="{ walking }" aria-hidden="true">
      <path v-for="(d, depth) in EDGE_PATHS" :key="'e' + depth" :d="d" :class="`edge d${depth}`" fill="none" />
      <circle
        v-for="n in nodes"
        :key="n.order"
        :cx="n.x"
        :cy="n.y"
        :r="n.r"
        class="node"
        :class="{ menu: n.depth === 0 }"
        :style="{ '--d': `${(n.order / total) * DUR}s` }"
      />
    </svg>
    <p class="tally" :class="{ walking }">
      <span>Visited: <b>{{ total.toLocaleString('en') }}</b></span>
      <span>Needed: <b class="need">5</b></span>
    </p>
  </InlaySlide>
</template>

<style scoped>
.tree-walk { padding: 0; background: #0d0e10 !important; }
.tree { position: absolute; inset: 0; width: 100%; height: 100%; }
.edge { stroke: rgba(255, 255, 255, 0.16); stroke-width: 2; }
.edge.d2 { stroke-width: 0.8; stroke: rgba(255, 255, 255, 0.1); }
.node { fill: #5d5f66; }
.menu { fill: #e6e3da; stroke: var(--k-green); stroke-width: 6; }
.walking .node:not(.menu) { animation: visit 0.5s linear var(--d) both; }
@keyframes visit {
  0% { fill: #5d5f66; }
  10% { fill: #fff6c4; }
  100% { fill: #8db52a; }
}
.tally {
  position: absolute;
  right: 70px;
  top: 60px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: right;
  font: 400 44px var(--sans);
  color: var(--k-light);
  opacity: 0;
  transition: opacity 0.6s 6.2s;
}
.tally.walking { opacity: 1; }
.need { color: var(--k-green); }
@media (prefers-reduced-motion: reduce) { .walking .node:not(.menu) { animation-duration: 0s; } }
</style>
