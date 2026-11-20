// ------------------------------------------------------------------
// The 10 UmbraCommandments (DK Festival edition). Order here = order on stage.
//
//   id       → URL hash (#c4/0)
//   steps    → number of build steps inside the scene (0 = none)
//   at       → place on the canvas: x/y = centre in world px, r = rotation (deg), s = scale
//   back     → the scene is the other side of that card: → turns the card over
//   frames   → per build step, the camera shows that box of the card (detail zooms)
//   (speaker notes live in notes.json, keyed by id — edit them on /notes)
//
// Deck-specific fields (the engine ignores them):
//   curse      → 0…1, how cursed the deck is once this scene is on stage (curse/curse.js). It only
//                rises, tweened along the flight, and creeps up while you stay on a card.
//   cleanse    → this scene lets the light back in (the curse drops to its `curse`)
//   sins       → the live demo drives the curse while this scene is on stage (curse/sins.js)
//   grainFrom  → no film grain while this scene is on stage before that build step (curse/CurseLayer.vue)
//   fallApart  → from that build step every card falls off the screen, and the next scene comes back
//                up as the camera flies in to it (curse/fallApart.js)
//   backoffice → { route, keys?, zoom?, …SLOT } or { tour: [ids] }: the one live backoffice
//                (components/BackofficeSurface.vue) lands on this card's slot. keys: 'site' hands
//                the clicker to the backoffice (the demo); Esc hands it back.
//
// Keys on top of the engine's: C purifies the curse (toggle), + / - nudge it, S snaps it back to
// the script, L hides the live backoffice. The reset (R, ↺) also resets the demo site: maximum sin.
//
// The layout (world.js): the talk lives inside the revelation. The top row (title, why,
// disclaimer, the mountain, the bonus, thanks) is at the mountain's size; the tablets card is what the
// hiker holds up; each commandment is set into its carved line, its sub-scenes
// on the stone beside it. DEMO TIME is the pit below the mountain. Nothing uses `parent`: the
// nesting is geometry, so every card can turn over and join the formation and the hand.
// ------------------------------------------------------------------
// Bundled locally (not Google Fonts) so the deck works without venue wifi.
import '@fontsource/libre-caslon-text/400.css'
import '@fontsource/libre-caslon-text/400-italic.css'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/700.css'
import '@fontsource/jetbrains-mono/400.css'
// Cinzel: Roman inscriptional capitals, the letters cut into the tablets
import '@fontsource/cinzel/500.css'
import '@fontsource/cinzel/700.css'
import '@fontsource/cinzel/900.css'
// IM Fell English: old print, for the relics
import '@fontsource/im-fell-english/400.css'
import '@fontsource/im-fell-english/400-italic.css'
import { defineAsyncComponent } from 'vue'
import { nest } from '@engine/layout.js'
import './theme.css'
import {
  TITLE, WHY, DISCLAIMER, REVELATION, BONUS, THANKS, DEMO_TIME, PULLBACK, TABLETS, RECAP,
  TINY_TEXT, TREE_CODE, REVEAL_HOLE, SLOT, DEMO_SLOT, commandmentAt, sideAt,
} from './world.js'
import { PITFALLS, CULTIV } from './components/relics.js'

// A spotlight target in the live backoffice (components/spotlight.js): a tree item, by its name.
// Every live evidence card gets one on its only press, so the room knows where to look before the
// card turns over or the talk moves on.
const treeItem = (label, more = {}) => ({ selector: 'uui-menu-item', label, ...more })

import Title from './scenes/Title.vue'
import Why from './scenes/Why.vue'
import Disclaimer from './scenes/Disclaimer.vue'
import Revelation from './scenes/Revelation.vue'
import Tablets from './scenes/Tablets.vue'
import C1 from './scenes/C1.vue'
import C1Demo from './scenes/C1Demo.vue'
import C2 from './scenes/C2.vue'
import C2Types from './scenes/C2Types.vue'
import C3 from './scenes/C3.vue'
import C3Types from './scenes/C3Types.vue'
import C3TypesAfter from './scenes/C3TypesAfter.vue'
import C3Media from './scenes/C3Media.vue'
import C3MediaAfter from './scenes/C3MediaAfter.vue'
import C4 from './scenes/C4.vue'
import C4Code from './scenes/C4Code.vue'
import C4Clean from './scenes/C4Clean.vue'
import C5 from './scenes/C5.vue'
import C6 from './scenes/C6.vue'
import C6Dict from './scenes/C6Dict.vue'
import C6DictAfter from './scenes/C6DictAfter.vue'
import C7 from './scenes/C7.vue'
import C7Code from './scenes/C7Code.vue'
import C7Tree from './scenes/C7Tree.vue'
import C7Relic from './scenes/C7Relic.vue'
import C8 from './scenes/C8.vue'
import C8Warehouse from './scenes/C8Warehouse.vue'
import C8Relic from './scenes/C8Relic.vue'
import C9 from './scenes/C9.vue'
import C9Relic from './scenes/C9Relic.vue'
import C9Root from './scenes/C9Root.vue'
import C10 from './scenes/C10.vue'
import Pullback from './scenes/Pullback.vue'
import DemoTime from './scenes/DemoTime.vue'
import Demo from './scenes/Demo.vue'
import Recap from './scenes/Recap.vue'
import Bonus from './scenes/Bonus.vue'
import Reveal from './scenes/Reveal.vue'
import Thanks from './scenes/Thanks.vue'

// Layers read the deck's state (useDeck), which imports this file: load them lazily
const CurseLayer = defineAsyncComponent(() => import('./curse/CurseLayer.vue'))
const GhostWorld = defineAsyncComponent(() => import('./curse/GhostWorld.vue'))
const BackofficeSurface = defineAsyncComponent(() => import('./components/BackofficeSurface.vue'))

const L = -1 // the stone to the left of a commandment's card
const R = 1  // … and to the right
const WHOLE = { cx: 960, cy: 540, w: 1920 }
// the King James line on a commandment card's tablet (measured: components/stone/StoneTablet.vue)
const KJV_BOX = { cx: 1549, cy: 485, w: 620 }

export default {
  id: 'umbracommandments',
  title: 'The 10 UmbraCommandments',
  icon: '📜',
  layers: { under: GhostWorld, over: BackofficeSurface, stage: CurseLayer },
  scenes: [
    // ---- daylight ----
    { id: 'title', title: 'S1 · Title', component: Title, curse: 0, at: TITLE },
    { id: 'why', title: 'S2 · About me + why', component: Why, curse: 0, at: WHY },
    { id: 'disclaimer', title: 'S3 · Disclaimer', component: Disclaimer, curse: 0.02, at: DISCLAIMER },

    // ---- the revelation, and the tiny text (S5: its steps) ----
    { id: 'revelation', title: 'S4–5 · Mount Bellissima', component: Revelation, steps: 1, curse: 0.05, at: REVELATION, frames: { 1: TINY_TEXT } },
    { id: 'tablets', title: 'S6 · The tablets', component: Tablets, curse: 0.06, at: TABLETS },

    // ---- the left tablet: I–V ----
    { id: 'c1', title: 'S7 · I. Content is not composable', component: C1, curse: 0.08, at: commandmentAt(1) },
    { id: 'c1-demo', title: 'S7a · The composition demo', component: C1Demo, steps: 7, curse: 0.1, at: sideAt(1, R) },
    {
      id: 'c2', title: 'S8 · II. Four content types', component: C2, steps: 8, curse: 0.15, at: commandmentAt(2),
      frames: { 5: KJV_BOX, 7: WHOLE },
    },
    {
      id: 'c2-types', title: 'S8 · Document types, live', component: C2Types, steps: 1, curse: 0.17, at: sideAt(2, R),
      // zoom 2 (every evidence card): laid out at 800×450, so 14px backoffice text reads ~28px on the card
      // press 1: the folders Clean sorts its document types into
      backoffice: {
        route: '/umbraco/section/settings/workspace/document-type-root', zoom: 2, ...SLOT,
        byStep: { 1: { highlight: treeItem('Document Types', { expand: true }) } },
      },
    },
    { id: 'c3', title: 'S9 · III. The root is bare', component: C3, steps: 4, curse: 0.22, at: commandmentAt(3) },
    {
      id: 'c3-types', title: 'S9a · Data types, live', component: C3Types, steps: 1, curse: 0.23, at: sideAt(3, R),
      // 70% of the other cards' zoom: more of the data type tree fits (14px text reads ~20px on the card)
      // press 1: every data type, loose in the root
      backoffice: {
        route: '/umbraco/section/settings/workspace/data-type-root', zoom: 1.4, ...SLOT,
        byStep: { 1: { highlight: treeItem('Data Types', { expand: true }) } },
      },
    },
    // press 1: a comment from Umbraco's own discussions, asking for the same (C3TypesAfter.vue)
    { id: 'c3-types-after', title: 'S9a · Data types, after', component: C3TypesAfter, steps: 1, curse: 0.24, back: 'c3-types', flip: { axis: 'y' } },
    {
      id: 'c3-media', title: 'S9b · Media root, live', component: C3Media, steps: 1, curse: 0.25, at: sideAt(3, L, -1),
      // press 1: the loose files at the root
      backoffice: {
        route: '/umbraco/section/media', zoom: 2, ...SLOT,
        byStep: { 1: { highlight: treeItem(['final-final-v2.jpg', 'Brochure 2019.pdf', 'logo'], { all: true }) } },
      },
    },
    { id: 'c3-media-after', title: 'S9b · Media, after', component: C3MediaAfter, curse: 0.26, back: 'c3-media', flip: { axis: 'y', dir: -1 } },
    // the dictionary: a folder is only a folder (III), under the media root on the same side
    {
      id: 'c6-dict', title: 'S9c · The dictionary, live', component: C6Dict, steps: 1, curse: 0.27, at: sideAt(3, L, 1),
      // press 1: every key at the root, no parents
      backoffice: {
        route: '/umbraco/section/translation', zoom: 2, ...SLOT,
        byStep: { 1: { highlight: 'umb-tree' } },
      },
    },
    { id: 'c6-dict-after', title: 'S9c · The dictionary, after', component: C6DictAfter, curse: 0.28, back: 'c6-dict', flip: { axis: 'y', dir: -1 } },
    { id: 'c4', title: 'S10 · IV. Compose in your IComposer', component: C4, curse: 0.3, at: commandmentAt(4) },
    { id: 'c4-code', title: 'S10a · Program.cs, as found', component: C4Code, curse: 0.32, at: sideAt(4, R) },
    { id: 'c4-clean', title: 'S10a · Program.cs, clean', component: C4Clean, curse: 0.33, back: 'c4-code', flip: { axis: 'y' } },
    { id: 'c5', title: 'S11 · V. Production mode', component: C5, curse: 0.38, at: commandmentAt(5) },

    // ---- the right tablet: VI–X, getting darker ----
    { id: 'c6', title: 'S12 · VI. Thy names', component: C6, steps: 2, curse: 0.46, at: commandmentAt(6) },
    { id: 'c7', title: 'S13 · VII. Views render', component: C7, curse: 0.56, at: commandmentAt(7) },
    { id: 'c7-code', title: 'S13a · The navigation partial', component: C7Code, curse: 0.57, at: nest(sideAt(7, R), TREE_CODE) },
    { id: 'c7-tree', title: 'S13a · The tree walk', component: C7Tree, steps: 1, curse: 0.58, at: sideAt(7, R) },
    {
      id: 'c7-relic', title: 'S13b · Relic: the Pitfalls docs', component: C7Relic, steps: 2, curse: 0.6, at: sideAt(7, L),
      frames: { 1: PITFALLS.ultra, 2: PITFALLS.descendants },
    },
    { id: 'c8', title: 'S14 · VIII. Not your database', component: C8, curse: 0.66, at: commandmentAt(8) },
    { id: 'c8-warehouse', title: 'S14a · The warehouse', component: C8Warehouse, steps: 3, curse: 0.68, at: sideAt(8, R) },
    {
      id: 'c8-relic', title: 'S14 · Relic: volatile data', component: C8Relic, steps: 1, curse: 0.7, at: sideAt(7, L), onlyOnStage: true,
      frames: { 1: PITFALLS.volatile },
    },
    {
      id: 'c9', title: 'S15 · IX. The root does not render', component: C9, steps: 2, curse: 0.76, at: commandmentAt(9),
      // 1: onto the tablet, the chisel carves the new line; 2: back out to the whole card
      frames: { 1: KJV_BOX, 2: WHOLE },
    },
    {
      id: 'c9-relic', title: 'S15a · Relic: cultiv.nl, 2010', component: C9Relic, steps: 3, curse: 0.78, at: sideAt(9, L),
      frames: { 1: CULTIV.warning, 2: CULTIV.structure, 3: CULTIV.fall },
    },
    {
      id: 'c9-root', title: 'S15b · The content root, live', component: C9Root, steps: 1, curse: 0.8, at: sideAt(9, R),
      // press 1: Home, rendering, at the root
      backoffice: {
        route: '/umbraco/section/content', zoom: 2, ...SLOT,
        byStep: { 1: { highlight: treeItem('Home') } },
      },
    },
    { id: 'c10', title: 'S16 · X. uSync', component: C10, curse: 0.86, at: commandmentAt(10) },

    // ---- the descent ----
    { id: 'pullback', title: 'S17 · Pull-back', component: Pullback, curse: 0.92, at: PULLBACK, onlyOnStage: true },
    { id: 'demo-time', title: 'S18 · DEMO TIME', component: DemoTime, curse: 1, at: DEMO_TIME, formation: { shape: 'ring', spin: 60 } },
    {
      id: 'demo', title: 'S19 · The Penance Board (live)', component: Demo, steps: 2, curse: 1, sins: true, at: DEMO_TIME, onlyOnStage: true, grainFrom: 2,
      // It lands on Settings (still pure, the deck keeps the clicker). Press 1 puts a spotlight on the
      // Penance tab; press 2 opens the Penance Board, still in Umbraco's light theme (theme: null: the
      // board sets its own). It shows a spotless backoffice for a beat and then falls to maximum sin by
      // itself (the Sinners package's descent: lights fail, fire, the hellscape theme); the film grain
      // waits for that too (curse/sins.js, sins.hell). The clicker is the board's from this press. The demo ends there: when the board's script is over (the press after X's
      // fix; Esc any time) the clicker is the deck's again and that press flies on to the recap.
      // (The board's own exhibits get their spotlights from the board's clicker script, in the
      // Sinners package: evidence belongs to a commandment, there is none after the last one.)
      // Zoom 1.19 on a 1820 px slot: laid out like a 1530 px screen, so the board reads bigger
      backoffice: {
        route: '/umbraco/section/settings', keys: 'deck', zoom: 1.19, ...DEMO_SLOT,
        byStep: {
          1: { highlight: 'uui-tab[href$="/dashboard/penance"]' },
          2: { route: '/umbraco/section/settings/dashboard/penance', keys: 'site', theme: null },
        },
      },
    },

    // ---- daylight ----
    { id: 'recap', title: 'S21 · Recap', component: Recap, curse: 0, cleanse: true, at: RECAP, onlyOnStage: true },
    { id: 'bonus', title: 'S22 · The bonus commandment', component: Bonus, curse: 0, at: BONUS, hand: true },
    // press 1: the whole thing falls apart (curse/fallApart.js); Thank you comes back up as the camera flies in
    { id: 'reveal', title: 'S23 · The reveal', component: Reveal, steps: 1, fallApart: 1, curse: 0, outer: { hole: REVEAL_HOLE } },
    { id: 'thanks', title: 'S24 · Thank you', component: Thanks, curse: 0, at: THANKS },
  ],
}
