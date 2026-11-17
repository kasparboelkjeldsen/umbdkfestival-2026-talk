<script setup>
// The engravings on the tablets: for each commandment a VIOLATION and an OBEDIENCE panel, in the
// spirit of a monastic woodcut, drawn as line art in a 200 × 190 box (the bonus: one 420 wide).
// Everything is currentColor, so Emblem.vue can draw it twice: once as the light lip of the cut,
// once as the groove.
import { computed } from 'vue'
import { cube, page, folder, diamond, puzzle, scroll, house, crate, crown, scatter, check, cross, padlock, MONK } from './shapes.js'

const props = defineProps({
  n: { type: Number, required: true },
  side: { type: String, default: 'v' }, // 'v' violation, 'o' obedience
  uid: { type: String, required: true }, // for the hatch pattern's id
})
const k = computed(() => `${props.n}${props.side}`)
const hatch = `${props.uid}-hatch`
const H = `url(#${hatch})`

// I
const c1v = cube(88, 96, 40)
const c1o = cube(100, 98, 42)
// II
const g2 = { page: page(28, 92, 22, 29), cube: cube(78, 112, 15), dia: diamond(128, 100, 15), puz: puzzle(140, 128, 24), fold: folder(40, 136, 30, 22), fold2: folder(92, 140, 30, 22), cube2: cube(156, 86, 12) }
const o2 = { page: page(42, 34, 26, 34), cube: cube(145, 46, 19), dia: diamond(55, 136, 19), puz: puzzle(130, 120, 30) }
// III
const h3 = [house(18, 166, 46, 46), house(77, 166, 46, 46), house(136, 166, 46, 46)]
const s3a = scroll(20, 154, 44, 12)
const s3b = scroll(58, 140, 36, 10)
// VI
const s6 = scroll(14, 70, 172, 46)
const s6a = scroll(14, 30, 172, 40)
const s6b = scroll(14, 104, 172, 40)
// VII
const fruit7 = scatter(100, 74, 50, 26, 7)
const path7 = 'M' + [...fruit7].sort((a, b) => a[1] - b[1] || a[0] - b[0]).map(([x, y]) => `${x} ${y}`).join('L')
// VIII
const crates8 = [[112, 92], [140, 112], [86, 112]]
// IX
const p9top = page(87, 18, 26, 34)
const p9 = [page(27, 118, 22, 29), page(89, 118, 22, 29), page(151, 118, 22, 29)]
const p9home = page(30, 116, 24, 31)
// X
const s10 = [{ x: 112, y: 64, r: -18 }, { x: 140, y: 100, r: 24 }, { x: 160, y: 50, r: -40 }]
const lock10 = padlock(100, 128, 26)
const lock5 = padlock(160, 116, 30)
// XI
const c11 = cube(300, 92, 40)
</script>

<template>
  <defs>
    <pattern :id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
      <path d="M0 0V5" stroke="currentColor" stroke-width="1.4" />
    </pattern>
  </defs>
  <g fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
    <!-- I · a block that loses its content with its composition / a block that keeps its own -->
    <g v-if="k === '1v'">
      <path :d="c1v.top" /><path :d="c1v.left" /><path :d="c1v.right" :fill="H" />
      <path d="M122 82L111 94L117 101L102 113L108 121L92 133" stroke-width="3.4" />
      <path d="M110 146l8 -5l4 8l-9 3z M95 158l8 1l-1 8l-8 -2z M121 164l6 -1l1 6l-6 1z" />
      <circle cx="104" cy="174" r="1.4" fill="currentColor" /><circle cx="132" cy="150" r="1.2" fill="currentColor" />
      <g transform="rotate(16 162 30)"><path d="M150 24h8a4 4 0 1 1 8 0h8v8a4 4 0 1 1 0 8v8h-24z" /></g>
      <path d="M118 32h18M122 41h16M126 50h12" stroke-width="2" />
      <path d="M22 178H180" />
    </g>
    <g v-else-if="k === '1o'">
      <path :d="c1o.top" /><path :d="c1o.left" /><path :d="c1o.right" :fill="H" />
      <path d="M70 92l24 14M70 102l24 14M70 112l16 9" stroke-width="2.2" />
      <path d="M100 36V24M80 41l-8 -7M120 41l8 -7M89 37l-4 -9M111 37l4 -9" stroke-width="2.2" />
      <path d="M22 178H180" />
    </g>

    <!-- II · seven, right out / the four sacred types -->
    <g v-else-if="k === '2v'">
      <g transform="rotate(-14 40 106)"><path :d="g2.page.body" /><path :d="g2.page.fold" /></g>
      <path :d="g2.cube.top" /><path :d="g2.cube.left" /><path :d="g2.cube.right" :fill="H" />
      <path :d="g2.dia" />
      <g transform="rotate(12 152 140)"><path :d="g2.puz" /></g>
      <g transform="rotate(8 55 147)"><path :d="g2.fold" /></g>
      <g transform="rotate(-10 107 151)"><path :d="g2.fold2" /></g>
      <path :d="g2.cube2.top" /><path :d="g2.cube2.left" /><path :d="g2.cube2.right" />
      <path d="M26 40L174 172M174 40L26 172" stroke-width="5" />
    </g>
    <g v-else-if="k === '2o'">
      <rect x="14" y="12" width="80" height="78" rx="8" stroke-width="2" />
      <rect x="106" y="12" width="80" height="78" rx="8" stroke-width="2" />
      <rect x="14" y="100" width="80" height="78" rx="8" stroke-width="2" />
      <rect x="106" y="100" width="80" height="78" rx="8" stroke-width="2" />
      <path :d="o2.page.body" /><path :d="o2.page.fold" /><path :d="o2.page.lines" stroke-width="2" />
      <path :d="o2.cube.top" /><path :d="o2.cube.left" /><path :d="o2.cube.right" :fill="H" />
      <path :d="o2.dia" />
      <path :d="o2.puz" />
    </g>

    <!-- III · everything at the root, a monk tripping over it / every thing in its house -->
    <g v-else-if="k === '3v'">
      <path d="M118 140h46v30h-46z M118 140q23 -18 46 0 M118 152h46 M141 140v30" />
      <circle cx="141" cy="158" r="2.6" fill="currentColor" />
      <path :d="s3a.body" /><path :d="s3a.ends" />
      <g transform="rotate(-24 76 145)"><path :d="s3b.body" /><path :d="s3b.ends" /></g>
      <path d="M168 120l22 4l-6 46l-22 -4z M172 128l12 2l-4 30l-12 -2z" stroke-width="2" />
      <g transform="translate(100 170) rotate(40) scale(0.66)"><path :d="MONK" :fill="H" stroke-width="4" /><path d="M-8 -92q8 -4 14 6" stroke-width="3.4" /></g>
      <path d="M86 112l-6 -8M94 108l2 -10" stroke-width="2" />
      <path d="M10 178H190" />
    </g>
    <g v-else-if="k === '3o'">
      <template v-for="(h, i) in h3" :key="i">
        <path :d="h.walls" /><path :d="h.roof" /><path :d="h.door" stroke-width="2.2" /><path :d="h.shelf" stroke-width="2" />
      </template>
      <path d="M33 162h16M92 162h16M151 162h16" stroke-width="4" />
      <path d="M8 178H192" />
    </g>

    <!-- IV · Program.cs, the dustbin / the composer at the lectern -->
    <g v-else-if="k === '4v'">
      <path d="M60 90h80l-8 82h-64z M80 98l3 66M100 98v66M120 98l-3 66" />
      <path d="M54 82l40 -26l4 6l-40 26z" />
      <path :d="scroll(84, 66, 40, 12).body" /><path :d="scroll(84, 66, 40, 12).ends" />
      <circle cx="122" cy="78" r="10" /><circle cx="122" cy="78" r="3.5" />
      <path d="M122 64v-4M122 92v4M108 78h-4M136 78h4M112 68l-3 -3M132 88l3 3M132 68l3 -3M112 88l-3 3" stroke-width="2.2" />
      <path d="M150 170l14 -6l3 7l-12 4z M36 168l10 -3l3 8l-10 2z" />
      <text x="100" y="135" text-anchor="middle" class="t mono" fill="currentColor" stroke="none" transform="rotate(-3 100 135)">Program.cs</text>
      <path d="M20 178H180" />
    </g>
    <g v-else-if="k === '4o'">
      <path d="M44 86l56 -14l56 14l-6 18h-100z" />
      <path d="M100 72v32" stroke-width="2" />
      <path d="M56 84l36 -9M56 90l36 -9M56 96l36 -9 M108 75l36 9M108 81l36 9M108 87l36 9" stroke-width="1.4" />
      <circle cx="70" cy="80" r="2.4" fill="currentColor" stroke="none" /><circle cx="82" cy="83" r="2.4" fill="currentColor" stroke="none" />
      <circle cx="120" cy="84" r="2.4" fill="currentColor" stroke="none" /><circle cx="134" cy="84" r="2.4" fill="currentColor" stroke="none" />
      <path d="M94 104h12v54h-12z M76 172h48 M84 158h32l8 14H76z" />
      <path d="M152 58l26 -22" stroke-width="2.6" /><circle cx="152" cy="58" r="3" fill="currentColor" />
      <text x="100" y="40" text-anchor="middle" class="t ital" fill="currentColor" stroke="none">IComposer</text>
      <path d="M22 178H178" />
    </g>

    <!-- V · a crowned bug on the throne / the sealed release -->
    <g v-else-if="k === '5v'">
      <ellipse cx="100" cy="118" rx="26" ry="34" /><path d="M100 86V152" />
      <path d="M100 104q-12 6 -22 4M100 104q12 6 22 4" stroke-width="1.8" />
      <circle cx="100" cy="76" r="11" />
      <path d="M94 66q-8 -14 -18 -14M106 66q8 -14 18 -14" stroke-width="2" />
      <path d="M88 60l4 -14l8 8l8 -8l4 14z" :fill="H" />
      <path d="M76 104l-16 -8l-6 -10M74 120l-20 0l-8 6M78 136l-16 10l-4 12M124 104l16 -8l6 -10M126 120l20 0l8 6M122 136l16 10l4 12" />
      <text x="100" y="180" text-anchor="middle" class="t mono" fill="currentColor" stroke="none">debug</text>
    </g>
    <g v-else-if="k === '5o'">
      <path d="M44 34h70v116h-70z" />
      <path d="M38 34a6 6 0 0 1 6 -6h70a6 6 0 0 1 0 12M38 150a6 6 0 0 0 6 6h70a6 6 0 0 0 0 -12" />
      <path d="M54 66h50M54 78h50M54 90h44M54 102h50M54 114h30" stroke-width="1.8" />
      <text x="79" y="56" text-anchor="middle" class="t mono" fill="currentColor" stroke="none">release</text>
      <circle cx="104" cy="140" r="13" :fill="H" /><path d="M98 152l-6 20M110 152l6 20" />
      <path :d="lock5.shackle" /><path :d="lock5.body" :fill="H" /><path :d="lock5.hole" stroke-width="3.4" />
    </g>

    <!-- VI · Danish in the alias / English camelCase, dotted PascalCase keys -->
    <g v-else-if="k === '6v'">
      <path :d="s6.body" /><path :d="s6.ends" />
      <text x="100" y="99" text-anchor="middle" class="t ital big" fill="currentColor" stroke="none">produktDetaljer</text>
      <path d="M40 46L160 140M160 46L40 140" stroke-width="4.4" />
    </g>
    <g v-else-if="k === '6o'">
      <path :d="s6a.body" /><path :d="s6a.ends" />
      <text x="88" y="56" text-anchor="middle" class="t mono" fill="currentColor" stroke="none">productDetail</text>
      <path :d="check(160, 46, 16)" stroke-width="3.4" />
      <path :d="s6b.body" /><path :d="s6b.ends" />
      <text x="90" y="128" text-anchor="middle" class="t mono smaller" fill="currentColor" stroke="none">Site.Navigation.Home</text>
      <path :d="check(160, 118, 16)" stroke-width="3.4" />
    </g>

    <!-- VII · climbing every branch with a lantern / one fruit, picked from the ledger -->
    <g v-else-if="k === '7v'">
      <path :d="crown(100, 74, 60)" />
      <path d="M100 178V112M100 140l-18 -22M100 128l20 -20M100 118l-6 -22" />
      <circle v-for="([x, y], i) in fruit7" :key="i" :cx="x" :cy="y" r="3.4" fill="currentColor" stroke="none" />
      <path :d="path7" stroke-width="1.6" stroke-dasharray="2 4" />
      <path d="M128 178l14 -62M142 178l14 -62M131 166h14M134 152h14M137 138h14M140 124h14" stroke-width="2" />
      <path d="M150 104h10v12h-10z M150 104l5 -5l5 5" stroke-width="2" />
      <path d="M40 178H160" />
    </g>
    <g v-else-if="k === '7o'">
      <path :d="crown(110, 70, 56)" />
      <path d="M110 178V108M110 136l-18 -20M110 124l20 -18" />
      <circle v-for="([x, y], i) in fruit7.slice(0, 18)" :key="i" :cx="x + 10" :cy="y - 4" r="3" fill="currentColor" stroke="none" opacity="0.35" />
      <circle cx="140" cy="88" r="5" fill="currentColor" stroke="none" /><circle cx="140" cy="88" r="11" stroke-width="2" />
      <path d="M18 132h42v40h-42z M24 142h30M24 150h30M24 158h22" stroke-width="1.8" />
      <path d="M60 140Q100 120 130 94" stroke-width="2" /><path d="M120 92l10 2l-2 10" stroke-width="2" />
      <path d="M12 178H188" />
    </g>

    <!-- VIII · a tree bowing under crates / the crates in a cellar of their own -->
    <g v-else-if="k === '8v'">
      <path d="M62 178Q74 120 118 72" stroke-width="4" />
      <path :d="crown(124, 62, 44, 11, 0.25)" />
      <path d="M86 132l-2 8l6 4l-3 8" stroke-width="2" />
      <template v-for="([x, y], i) in crates8" :key="i">
        <path :d="`M${x + 9} ${y - 18}V${y}`" stroke-width="1.6" /><path :d="crate(x, y, 18)" stroke-width="2.2" />
      </template>
      <path d="M150 172h20v-20h-20z M126 172h20v-14h-20z" stroke-width="2" />
      <path d="M20 178H180" />
    </g>
    <g v-else-if="k === '8o'">
      <path d="M50 178V100" stroke-width="4" /><path :d="crown(50, 72, 34)" />
      <path d="M50 120l-14 -14M50 112l12 -12" stroke-width="2.4" />
      <path d="M96 178Q96 108 146 108Q196 108 196 178" />
      <path d="M124 178V150a22 22 0 0 1 44 0V178" />
      <path :d="crate(130, 160, 16)" stroke-width="2" /><path :d="crate(148, 160, 16)" stroke-width="2" /><path :d="crate(139, 146, 14)" stroke-width="2" />
      <path d="M110 92h72v16h-72z M128 108v6M164 108v6" stroke-width="2" />
      <text x="146" y="104" text-anchor="middle" class="t tiny" fill="currentColor" stroke="none">CUSTOM TABLE</text>
      <path d="M8 178H90" />
    </g>

    <!-- IX · a page that renders at the root / a bare root, Home beneath it -->
    <g v-else-if="k === '9v'">
      <path :d="p9top.body" :fill="H" /><path :d="p9top.fold" />
      <path d="M100 12V4M78 22l-8 -6M122 22l8 -6M76 38h-9M124 38h9" stroke-width="2" />
      <path d="M100 52V82M38 82H162M38 82v34M100 82v34M162 82v34" stroke-width="2.2" />
      <template v-for="(p, i) in p9" :key="i"><path :d="p.body" /><path :d="p.fold" /></template>
      <text x="100" y="168" text-anchor="middle" class="t ital" fill="currentColor" stroke="none">Home, at the root</text>
      <path :d="cross(170, 14, 14)" stroke-width="3.4" />
    </g>
    <g v-else-if="k === '9o'">
      <circle cx="100" cy="34" r="17" stroke-dasharray="5 4" />
      <path d="M100 51V82M42 82H162M42 82v32M100 82v32M162 82v32" stroke-width="2.2" />
      <path :d="p9home.body" /><path :d="p9home.fold" /><path :d="p9home.lines" stroke-width="1.6" />
      <circle cx="100" cy="132" r="11" /><circle cx="100" cy="132" r="4" />
      <path d="M100 117v-4M100 147v4M85 132h-4M115 132h4M90 122l-3 -3M110 142l3 3M110 122l3 -3M90 142l-3 3" stroke-width="2" />
      <path :d="folder(147, 120, 30, 23)" />
      <text x="100" y="178" text-anchor="middle" class="t ital" fill="currentColor" stroke="none">the root holds; Home renders</text>
      <path :d="check(160, 26, 16)" stroke-width="3.4" />
    </g>

    <!-- X · changes blown away in the wind / bound in a chest that travels -->
    <g v-else-if="k === '10v'">
      <path d="M22 72a14 14 0 0 1 14 -22a18 18 0 0 1 32 -2a14 14 0 0 1 14 20a12 12 0 0 1 -8 18h-44a12 12 0 0 1 -8 -14z" />
      <circle cx="44" cy="62" r="2" fill="currentColor" stroke="none" /><circle cx="60" cy="62" r="2" fill="currentColor" stroke="none" />
      <circle cx="80" cy="72" r="5" />
      <path d="M90 66q30 -10 50 6q14 12 0 20q-12 4 -14 -6M90 82q34 4 52 30q8 14 -6 16M88 96q20 14 18 40" stroke-width="2" />
      <template v-for="(s, i) in s10" :key="i">
        <g :transform="`rotate(${s.r} ${s.x + 14} ${s.y + 5})`"><path :d="scroll(s.x, s.y, 30, 10).body" /><path :d="scroll(s.x, s.y, 30, 10).ends" /></g>
      </template>
      <text x="100" y="172" text-anchor="middle" class="t ital" fill="currentColor" stroke="none">whispers in the wind</text>
    </g>
    <g v-else-if="k === '10o'">
      <path d="M40 110h120v60h-120z M40 110q60 -46 120 0 M40 128h120 M70 110v60M130 110v60" />
      <path :d="lock10.shackle" /><path :d="lock10.body" :fill="H" /><path :d="lock10.hole" stroke-width="3" />
      <path d="M40 120q-14 18 -6 40M160 120q14 18 6 40" stroke-width="2" stroke-dasharray="5 3" />
      <text x="100" y="164" text-anchor="middle" class="t mono" fill="currentColor" stroke="none">git</text>
      <path :d="scroll(68, 50, 64, 14).body" /><path :d="scroll(68, 50, 64, 14).ends" />
      <text x="100" y="62" text-anchor="middle" class="t mono small" fill="currentColor" stroke="none">uSync</text>
      <path d="M20 178H180" />
    </g>

    <!-- XI · the bonus: thy duck, thy glowing work -->
    <g v-else-if="n === 11">
      <path d="M44 132q-4 -40 40 -38q4 -34 34 -32q26 2 26 30q0 12 -10 20q30 -6 32 20q0 36 -56 40h-30q-34 -2 -36 -40z" />
      <path d="M144 84l22 4l-20 8" :fill="H" /><circle cx="122" cy="80" r="3.5" fill="currentColor" stroke="none" />
      <path d="M72 128q20 18 54 6" stroke-width="2.2" />
      <path :d="c11.top" /><path :d="c11.left" /><path :d="c11.right" :fill="H" />
      <path d="M300 34V18M268 44l-10 -10M332 44l10 -10M250 92h-16M350 92h16M262 132l-10 10M338 132l10 10" stroke-width="2.4" />
      <path d="M30 178H390" />
    </g>
  </g>
</template>

<style scoped>
.t { font-family: 'Libre Caslon Text', Georgia, serif; font-size: 15px; }
.mono { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 15px; font-weight: 700; }
.ital { font-style: italic; }
.big { font-size: 20px; }
.small { font-size: 12.5px; }
.smaller { font-size: 11px; }
.tiny { font-size: 10px; letter-spacing: 0.08em; }
</style>
