<script setup>
// S23 · The reveal (an outer layer: `outer: { hole: REVEAL_HOLE }` in deck.js). Pull out past the
// end of the talk, and all of it (mountain, tablets, the pit) was sitting in a dashboard in the
// Umbraco backoffice, under Settings, next to the Penance Board. Which is a violation of VIII.
//
// The chrome is drawn to match the real Settings section of the 18.2 backoffice (its header,
// the Structure / Templating / Advanced tree, the dashboard tabs) at its real pixel sizes, as a
// 1440 × 810 screen scaled up to the card. The dashboard's content area is the hole the talk sits
// in (transparent, so the canvas shows); the grey round it is cut to REVEAL_HOLE (world.js).
//
// Step 1: it all falls apart. Every piece of the chrome drops off the screen with its own delay and
// tumble, the small ones first, the bars last; the talk's cards fall with it (curse/fallApart.js).
import { asset } from '@engine/asset.js'
import { useStep } from '@engine/useStep.js'
import { REVEAL_HOLE } from '../world.js'
import Zalgo from '../curse/Zalgo.vue'
import { useNear } from '../components/near.js'

const show = useNear()
const { step } = useStep()

// each piece's fall: a seeded drift, tumble and delay (`k` names the piece); `late` holds the bars
// back until what's on them has gone
function fall(k, late = 0) {
  let h = 2166136261
  for (const c of String(k)) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  const r = (n) => (((h = Math.imul(h ^ (h >>> 13), 1274126177)) >>> 0) % 1000) / 1000 + n * 0
  return {
    '--fx': `${((r(0) - 0.5) * 160).toFixed(0)}px`,
    '--fr': `${((r(0) < 0.5 ? -1 : 1) * (12 + r(0) * 55)).toFixed(1)}deg`,
    '--fd': `${(late + r(0) * 0.7).toFixed(2)}s`,
    '--ft': `${(1.3 + r(0) * 0.8).toFixed(2)}s`,
  }
}

// the screen: real backoffice px
const SCREEN = { w: 1440, h: 810 }
const Z = 1920 / SCREEN.w
const HEADER = 60
const SIDE = 296 // the tree, its border included
const TABS = 70  // the dashboard tabs under the header

const sections = ['Content', 'Media', 'Library', 'Settings', 'Packages', 'Users', 'Members', 'Translation']
// [label, icon, has children]
const groups = [
  ['Structure', [['Document Types', 'folder', true], ['Media Types', 'folder', true], ['Member Types', 'folder', true], ['Data Types', 'folder', true], ['Languages', 'globe'], ['Document Blueprints', 'folder']]],
  ['Templating', [['Templates', 'folder', true], ['Partial Views', 'folder', true], ['Stylesheets', 'folder', true], ['Scripts', 'folder']]],
  ['Advanced', [['Relations', 'relations'], ['Log Viewer', 'archive'], ['Extension Insights', 'wand'], ['Webhooks', 'webhook']]],
]
const tabs = ['Welcome', 'Examine Management', 'Published Status', 'Models Builder', 'Health Check', 'Profiling', 'Telemetry Data']

// line icons, 24 × 24, stroked in currentColor (the backoffice's own are the same kind)
const ICONS = {
  chevron: 'M9 6l6 6-6 6',
  folder: 'M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5Z',
  globe: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3',
  relations: 'M4 8h14l-3-3M20 16H6l3 3',
  archive: 'M3 5h18v4H3zM5 9v10h14V9M10 13h4',
  wand: 'M4 20L15 9M14 4v2M19 9h2M17.5 5.5l1.5-1.5M9 4l.5 1.5M19 13l1.5.5M12.5 7.5l4 4',
  webhook: 'M9 15.5a3.5 3.5 0 1 1-1.8-6.5L10 4.2M12 9.5a3.5 3.5 0 1 1 5.8 3.8L15 18.2M7 17h7.5a3.5 3.5 0 1 1 3 3.4',
  search: 'M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14M16 16l4.5 4.5',
  help: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.6M12 17h.01',
}

// the hole, and the grey content area round it (an even-odd polygon cut, in the area's own px)
const h = (REVEAL_HOLE.w * 9) / 16
const hole = { x: REVEAL_HOLE.cx - REVEAL_HOLE.w / 2, y: REVEAL_HOLE.cy - h / 2, w: REVEAL_HOLE.w, h }
const area = { x: SIDE * Z, y: (HEADER + TABS) * Z }
const x0 = hole.x - area.x, x1 = x0 + hole.w, y0 = hole.y - area.y, y1 = y0 + hole.h
const areaStyle = {
  left: `${area.x}px`,
  top: `${area.y}px`,
  clipPath: `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${x0}px ${y0}px, ${x0}px ${y1}px, ${x1}px ${y1}px, ${x1}px ${y0}px, ${x0}px ${y0}px)`,
}
const frameStyle = { left: `${hole.x}px`, top: `${hole.y}px`, width: `${hole.w}px`, height: `${hole.h}px` }
</script>

<template>
  <div class="slide no-mark reveal" :class="{ apart: step >= 1 }">
    <!-- the dashboard area: the backoffice's background grey everywhere but the hole -->
    <div class="area piece" :style="[areaStyle, fall('area', 0.9)]" />
    <div class="frame piece" :style="[frameStyle, fall('frame', 0.5)]" />

    <div v-if="show" class="ui" :style="{ zoom: Z, width: `${SCREEN.w}px`, height: `${SCREEN.h}px` }" data-audit="ignore">
      <header class="header piece" :style="[{ height: `${HEADER}px` }, fall('header', 1.1)]">
        <!-- the backoffice's own logo (its /security/back-office/graphics/logo), kept in public/assets -->
        <img class="logo piece" :src="asset('/assets/umbraco-logo.svg')" alt="" aria-hidden="true" :style="fall('logo')" />
        <nav class="sections">
          <span v-for="s in sections" :key="s" class="piece" :class="{ on: s === 'Settings' }" :style="fall(s)">{{ s }}</span>
        </nav>
        <span class="tools">
          <svg class="tool piece" viewBox="0 0 24 24" :style="fall('search')"><path :d="ICONS.search" /></svg>
          <svg class="tool piece" viewBox="0 0 24 24" :style="fall('help')"><path :d="ICONS.help" /></svg>
          <span class="avatar piece" :style="fall('avatar')">A</span>
        </span>
      </header>

      <aside class="side piece" :style="[{ top: `${HEADER}px`, width: `${SIDE}px` }, fall('side', 1)]">
        <section v-for="[title, items] in groups" :key="title" class="group">
          <h3 class="piece" :style="fall(title)">{{ title }}</h3>
          <div v-for="[label, icon, kids] in items" :key="label" class="item piece" :style="fall(label)">
            <svg v-if="kids" class="chev" viewBox="0 0 24 24"><path :d="ICONS.chevron" /></svg>
            <svg class="icon" viewBox="0 0 24 24"><path :d="ICONS[icon]" /></svg>
            <span>{{ label }}</span>
          </div>
        </section>
      </aside>

      <div class="tabs piece" :style="[{ top: `${HEADER}px`, left: `${SIDE}px`, height: `${TABS}px` }, fall('tabs', 0.95)]">
        <span v-for="t in tabs" :key="t" class="tab piece" :style="fall('tab ' + t)">{{ t }}</span>
        <span class="tab penance piece" :style="fall('penance')"><Zalgo text="Penance" :amount="0.45" :height="4" :seed="3" :breathe="false" /></span>
        <span class="tab on piece" :style="fall('umbracommandments', 0.2)">UmbraCommandments</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* text on the canvas round the talk: only the chrome is opaque, the dashboard is a hole */
.reveal { background: transparent !important; padding: 0; }
.area { position: absolute; right: 0; bottom: 0; background: #f4f4f4; }
.frame { position: absolute; outline: 1.5px solid #e4e4e7; }
/* px, not %: zoom scales lengths but not percentages */
.ui {
  position: absolute;
  left: 0;
  top: 0;
  font-family: Lato, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  color: #1b264f;
  -webkit-font-smoothing: antialiased;
}
svg { fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }

/* ---- the header ---- */
.header {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  display: flex;
  align-items: center;
  padding: 0 24px;
  background: #1b264f;
  color: #fff;
}
.logo { flex: none; display: block; width: 36px; height: 36px; }
.sections { display: flex; gap: 30px; margin-left: 31px; font-size: 16px; }
.sections span { opacity: 0.86; }
.sections .on { opacity: 1; font-weight: 700; }
.tools { margin-left: auto; display: flex; align-items: center; gap: 20px; }
.tool { width: 22px; height: 22px; }
.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 15px;
}

/* ---- the tree ---- */
.side {
  position: absolute;
  left: 0;
  bottom: 0;
  padding-top: 22px;
  background: #fff;
  border-right: 1px solid #e4e4e7;
  color: #000;
}
.group { margin-bottom: 27px; }
.group h3 { margin: 0 0 14px; padding-left: 20px; font-size: 14px; font-weight: 700; }
.item { position: relative; display: flex; align-items: center; gap: 7px; height: 36px; padding-left: 23px; }
.item .chev { position: absolute; left: 4px; width: 14px; height: 14px; stroke-width: 2; }
.item .icon { width: 16px; height: 16px; }

/* ---- the dashboard tabs ---- */
.tabs {
  position: absolute;
  right: 0;
  display: flex;
  align-items: center;
  padding-left: 16px;
  background: #fff;
  border-bottom: 1px solid #e4e4e7;
  white-space: nowrap;
  color: #000;
}
.tab { position: relative; padding: 0 15px; height: 100%; display: flex; align-items: center; }
.tab.on::after {
  content: '';
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 0;
  height: 4px;
  border-radius: 3px 3px 0 0;
  background: #f5c1bc;
}
.penance { color: #1b264f; font-size: 13px; }

/* ---- step 1: it all falls apart (gravity: ease-in). 1400 px is off the bottom from anywhere ---- */
.apart .piece {
  translate: var(--fx) 1400px;
  rotate: var(--fr);
  transition: translate var(--ft) cubic-bezier(0.55, 0.085, 0.68, 0.53) var(--fd), rotate var(--ft) ease-in var(--fd);
}
</style>
