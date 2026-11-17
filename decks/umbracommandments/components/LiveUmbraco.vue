<script setup>
// The live Umbraco backoffice in a card: a same-origin iframe on the deck's own dev server
// (decks/umbracommandments/vite.config.js proxies /umbraco to the demo site).
//
// Same origin means the deck can reach in: contentWindow, the DOM, CSS custom properties, keys.
// It only loads while its scene is on stage or one away, and never in thumbnails or the
// presenter window (that would boot a second backoffice): those get a static placeholder.
//
// Keys (`keys` prop), so the clicker keeps working whatever has focus:
//   'deck' – the deck owns the clicker. Clicker keys pressed inside the backoffice are passed on
//            to the deck, and the Sinners package's own clicker listener is told to stand down
//            (<html data-sinners-keys="off"> in the iframe). Escape hands focus back to the deck.
//   'site' – the backoffice owns the clicker (DEMO TIME): while the scene is on stage, the deck's
//            clicker keys are passed into the backoffice instead of moving the deck. Escape (in
//            either window) bails out to 'deck' for the rest of this visit, and so does the
//            Penance Board's own "my script is done" message, which also moves the deck on.
//
// Written to be promotable: nothing in here is specific to this talk except the default route
// and the Sinners stand-down flag.
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useStep } from '@engine/useStep.js'
import { spotlight, deepQueryAll } from './spotlight.js'

const props = defineProps({
  route: { type: String, default: '/umbraco/section/settings/dashboard/penance' },
  // < 1 shows more of the backoffice: the iframe is laid out at width/zoom and scaled down
  zoom: { type: Number, default: 0.75 },
  keys: { type: String, default: 'deck', validator: (v) => ['deck', 'site'].includes(v) },
  // Outside a scene (e.g. in a deck layer) there's no useStep(): say yourself whether it's on stage
  onStage: { type: Boolean, default: undefined },
  // Umbraco's own theme in the backoffice: 'pure' (its light theme), a sin level 1…10 (the Sinners
  // package's "Abyss" themes, 10 = hellscape), or null to leave it to whoever sets it (the Penance
  // Board picks its level from the sins it finds).
  theme: { type: [String, Number], default: null },
  // A spotlight on something inside the backoffice (components/spotlight.js): a selector, or
  // { selector, text, label, all, expand, pad, dim }. null: none.
  highlight: { type: [String, Object], default: null },
})
const emit = defineEmits(['ready', 'routed'])

// The theme goes through Umbraco's own theme context, the way its user menu does it. (Never as
// inline colour variables on the iframe's <html>: those beat every theme, and the board's Abyss
// themes vanished under them.) The context lives inside the backoffice's own modules: load them
// in the iframe's realm (its import map), and ask for the context from an element inside the app.
const THEME_KEY = 'umb-theme-alias' // where Umbraco keeps the theme between loads
const alias = (t) => (t === 'pure' ? 'umb-light-theme' : `sinners-spooky-${t}`)

function deepHost(doc) {
  // the deepest app element we can reach: the context is provided somewhere under <umb-app>
  let el = doc.querySelector('umb-app')
  for (const tag of ['umb-backoffice', 'umb-backoffice-main']) {
    const next = el?.shadowRoot?.querySelector(tag) ?? el?.querySelector?.(tag)
    if (!next) break
    el = next
  }
  return el
}
async function themeContext(win) {
  if (win.__deckThemeContext) return win.__deckThemeContext
  const load = new win.Function('s', 'return import(s)')
  const [{ UMB_THEME_CONTEXT }, { UmbContextConsumer }] = await Promise.all([
    load('@umbraco-cms/backoffice/themes'),
    load('@umbraco-cms/backoffice/context-api'),
  ])
  const t0 = performance.now()
  for (;;) {
    const host = deepHost(win.document)
    if (host) {
      const ctx = await new Promise((resolve) => {
        const c = new UmbContextConsumer(host, UMB_THEME_CONTEXT, (v) => { if (v) { resolve(v); c.destroy() } })
        c.hostConnected()
        setTimeout(() => { c.destroy(); resolve(null) }, 500)
      })
      if (ctx) return (win.__deckThemeContext = ctx)
    }
    if (performance.now() - t0 > 30000) throw new Error('no theme context')
    await new Promise((r) => setTimeout(r, 400))
  }
}
// A theme is set ONCE, when it's asked for (on mount, and when the prop changes): after that the
// backoffice keeps it between its own page loads, and the Penance Board lowers it as sins are
// absolved. (It used to be set again on every load of the iframe: every exhibit page of the demo
// came up at level 10 however few sins were left, and the board flashed 10 before its own level.)
let themeDue = props.theme != null
async function applyTheme() {
  const win = frame.value?.contentWindow
  const t = props.theme
  if (!win || t == null) return
  try {
    win.localStorage.setItem(THEME_KEY, alias(t)) // a reload starts right
    const ctx = await themeContext(win)
    if (props.theme === t) {
      ctx.setThemeByAlias(alias(t))
      themeDue = false
    }
  } catch (e) {
    console.warn('[live-umbraco] could not set the theme:', e.message)
  }
}
watch(() => props.theme, () => { themeDue = true; applyTheme() })

// The curtain: every page the backoffice loads by itself (the demo's exhibits and its returns to
// the board are full page loads) starts as a white page, then Umbraco's light shell, then the
// theme: a flashbang on a dark stage. So while a page loads, the card shows a flat panel in the
// colour the backoffice had, and lifts it when the new page wears that theme again (or after 4 s:
// a page whose theme really is different just appears a little later).
const curtain = ref(false)
const curtainColor = ref('#fff')
let curtainTimer
function look(win) {
  const cs = win.getComputedStyle(win.document.body)
  return {
    surface: cs.getPropertyValue('--uui-color-surface').trim(),
    background: cs.getPropertyValue('--uui-color-background').trim() || cs.backgroundColor,
  }
}
function onLeave() {
  const win = frame.value?.contentWindow
  if (!win) return
  let was
  try { was = look(win) } catch { return }
  const old = win.document
  curtainColor.value = was.background || '#fff'
  curtain.value = true
  const t0 = performance.now()
  clearInterval(curtainTimer)
  curtainTimer = setInterval(() => {
    let there = false
    try {
      const now = frame.value?.contentWindow
      // the new page, its shell drawn, in the theme the old one had
      there = !!now && now.document !== old && look(now).surface === was.surface && deepQueryAll(now.document, 'umb-backoffice-header').length > 0
    } catch { /* between documents */ }
    if (there || performance.now() - t0 > 4000) {
      clearInterval(curtainTimer)
      curtain.value = false
    }
  }, 50)
}

// The spotlight: on while `highlight` is set, again after every load of the iframe
let stopSpotlight = null
function applyHighlight() {
  stopSpotlight?.()
  stopSpotlight = null
  const win = frame.value?.contentWindow
  if (!win || !props.highlight) return
  try { stopSpotlight = spotlight(win, props.highlight) } catch (e) { console.warn('[live-umbraco] no spotlight:', e.message) }
}
watch(() => props.highlight, applyHighlight)

const step = useStep()
const active = computed(() => props.onStage ?? step.active.value)
const near = computed(() => props.onStage !== undefined || step.near.value)
const preview = step.preview
const frame = ref(null)
const live = computed(() => !preview.value && near.value)

// The first route is the iframe's src; later route changes navigate inside the backoffice
// (its router listens to history), which is far quicker than reloading the whole app.
const src = props.route
let routeTimer
watch(() => props.route, (to) => {
  const win = frame.value?.contentWindow
  if (!win) return
  const t0 = performance.now()
  win.history.pushState(null, '', to)
  win.dispatchEvent(new PopStateEvent('popstate', { state: null }))
  // "arrived" = the backoffice has re-titled the tab for the new route
  const before = win.document.title
  clearInterval(routeTimer)
  routeTimer = setInterval(() => {
    const now = frame.value?.contentWindow?.document.title
    if (now && now !== before) {
      clearInterval(routeTimer)
      emit('routed', { route: to, ms: Math.round(performance.now() - t0) })
    } else if (performance.now() - t0 > 4000) {
      clearInterval(routeTimer)
      emit('routed', { route: to, ms: null })
    }
  }, 16)
})
const size = computed(() => ({
  width: `${100 / props.zoom}%`,
  height: `${100 / props.zoom}%`,
  transform: `scale(${props.zoom})`,
}))

// 'site' mode can be bailed out of; it comes back the next time the scene comes on stage
const bailed = ref(false)
watch(active, (on) => { if (on) bailed.value = false })
// a later build step that hands the clicker to the backoffice again (keys back to 'site')
watch(() => props.keys, (k) => { if (k === 'site') bailed.value = false })
const mode = computed(() => (props.keys === 'site' && !bailed.value ? 'site' : 'deck'))

const CLICKER = new Set(['ArrowRight', 'ArrowDown', 'PageDown', 'ArrowLeft', 'ArrowUp', 'PageUp'])

function giveFocusBack() {
  frame.value?.blur()
  window.focus()
}

// Keys pressed inside the backoffice
function onInnerKey(e) {
  if (e.key === 'Escape') {
    bailed.value = true
    giveFocusBack()
    return
  }
  if (mode.value !== 'deck' || !CLICKER.has(e.key)) return
  e.preventDefault()
  e.stopImmediatePropagation()
  window.dispatchEvent(new KeyboardEvent('keydown', { key: e.key, repeat: e.repeat, bubbles: true }))
}

// Keys pressed in the deck while this card is on stage
function onOuterKey(e) {
  if (!active.value || mode.value !== 'site') return
  if (e.key === 'Escape') { bailed.value = true; return }
  if (!CLICKER.has(e.key) && e.key !== '.') return
  // the clicker is the backoffice's: even while it (re)loads, a press must never move the deck on
  // (it did: a reload mid-demo, a press in that second, and the demo jumped ahead or ended)
  e.preventDefault()
  e.stopImmediatePropagation()
  frame.value?.contentWindow?.dispatchEvent(new KeyboardEvent('keydown', { key: e.key, repeat: e.repeat, bubbles: true }))
}

function syncSinnersFlag() {
  const root = frame.value?.contentDocument?.documentElement
  if (root) root.dataset.sinnersKeys = mode.value === 'deck' ? 'off' : 'on'
}
watch(mode, syncSinnersFlag)

// Every navigation inside the iframe is a new document: re-attach on each load
function onLoad() {
  const win = frame.value?.contentWindow
  if (!win) return
  // a navigation that left the deck's origin (e.g. a redirect to https://) can't be reached into
  try {
    win.addEventListener('keydown', onInnerKey, true)
    win.addEventListener('beforeunload', onLeave)
    win.addEventListener('pagehide', onLeave)
  } catch {
    console.warn('[live-umbraco] the backoffice left the deck origin:', frame.value.src)
    return
  }
  syncSinnersFlag()
  if (themeDue) applyTheme()
  applyHighlight()
  emit('ready', frame.value)
}

// Clicking into the backoffice moves focus into the iframe; give it back when the scene leaves.
watch(active, (on) => {
  if (!on && frame.value && document.activeElement === frame.value) giveFocusBack()
})
// The Penance Board says its script is done (next pressed after the last fix): hand the clicker
// back to the deck and take that press as the deck's own next.
function onMessage(e) {
  if (e.origin !== location.origin || e.data?.source !== 'sinners' || e.data.type !== 'end') return
  if (!active.value || mode.value !== 'site') return
  bailed.value = true
  giveFocusBack()
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
}

// When something inside the backoffice asks to be scrolled into view (scrollIntoView, a focus), the
// browser scrolls every box around it that can scroll, and that includes the deck's own clipped
// boxes around the iframe (the stage went up by 391 px once, the card with it). None of them is
// ever meant to scroll: put any of them straight back.
function unscroll(e) {
  const box = e.target
  if (box instanceof Element && frame.value && box.contains(frame.value) && (box.scrollTop || box.scrollLeft)) {
    box.scrollTop = 0
    box.scrollLeft = 0
  }
}

onMounted(() => {
  window.addEventListener('keydown', onOuterKey, true)
  window.addEventListener('message', onMessage)
  document.addEventListener('scroll', unscroll, true)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onOuterKey, true)
  window.removeEventListener('message', onMessage)
  document.removeEventListener('scroll', unscroll, true)
  clearInterval(routeTimer)
  clearInterval(curtainTimer)
  stopSpotlight?.()
  frame.value?.blur()
})

defineExpose({ frame, mode })
</script>

<template>
  <div class="live-umbraco" :class="{ 'is-active': active }" :data-keys="mode">
    <!-- sandboxed without allow-top-navigation: nothing in the backoffice (a login redirect, a stray
         script) can navigate the deck's own tab away. Seen once while the site was being reset. -->
    <iframe
      v-if="live"
      ref="frame"
      :src="src"
      :style="size"
      title="Umbraco backoffice"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads"
      @load="onLoad"
    />
    <div v-if="live" class="curtain" :class="{ on: curtain }" :style="{ background: curtainColor }" />
    <div v-else class="placeholder" data-audit="ignore">
      <span>Umbraco backoffice (live on stage)</span>
    </div>
  </div>
</template>

<style scoped>
.live-umbraco {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 18px;
  background: #1b264f;
}
iframe {
  position: absolute;
  top: 0;
  left: 0;
  border: 0;
  transform-origin: 0 0;
  background: #fff;
  pointer-events: none; /* clickable only while its scene is on stage */
}
.is-active iframe { pointer-events: auto; }
/* over the backoffice while one of its pages loads: down at once, lifted gently */
.curtain {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease-out;
}
.curtain.on {
  opacity: 1;
  transition: opacity 0.08s linear;
}
.placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #fff;
  font: 600 40px/1.2 var(--sans);
  opacity: 0.6;
}
</style>
