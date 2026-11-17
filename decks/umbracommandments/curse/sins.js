// The sin bridge: the live demo (Umbraco.Community.Sinners' Penance Board) drives the curse.
//
//   GET /umbraco/sinners/status (dev-only, through the deck's proxy), polled every 2 s:
//     { commandments: [{ number, title, sins, pretended, blessed }], total }
//   postMessage from the board (in the live backoffice iframe) on every absolution:
//     { source: 'sinners', type: 'absolved', commandment, action, pretended }
//     → an immediate re-poll, and a one-shot effect (CurseLayer.vue: chisel strike, warm light).
//
// Curse from sins: each commandment weighs a tenth, its share is remaining ÷ the most we've seen
// for it. So maximum sin is 1, a fully absolved commandment takes 0.1 off, zero sins is 0.
// Pretend fixes count as absolved (the package reports them as 0 sins, `pretended: true`); their
// tablet lines keep flickering.
//
// No package (404) or no site: `connected` stays false, the deck falls back to the scripted
// curse and the + / - keys ("pretend it's fixed", which is on brand).
import { reactive } from 'vue'

// The save-me: `npm run dkfestival -- --demo 8` opens the deck at /?ff=8#demo/2. That tells the
// Penance Board (through the sessionStorage the backoffice iframe shares with this tab) to absolve
// everything before commandment 8 by itself and stop there, ready for the clicker
// (Umbraco.Community.Sinners, presenter.fastForward). The board starts with a clean memory; the
// parameter is taken off the address so a reload doesn't ask again.
try {
  const url = new URL(location.href)
  const ff = Number(url.searchParams.get('ff'))
  if (Number.isInteger(ff) && ff >= 1 && ff <= 10) {
    sessionStorage.removeItem('sinners-presenter-state')
    sessionStorage.setItem('sinners-fast-forward', String(ff))
    url.searchParams.delete('ff')
    history.replaceState(history.state, '', url)
  }
} catch {}

const URL_STATUS = '/umbraco/sinners/status'
const POLL = 2000
const KEY = 'umbracommandments:sin-max'

export const sins = reactive({
  connected: false,
  byNumber: {},   // n → { sins, pretended, blessed, max }
  curse: 1,
  absolutions: 0, // counts every absolve message (a watcher fires the effect)
  last: null,     // the last absolve message
  hell: false,    // the Penance Board has put on its hellscape (its 'hell' message): the grain may come
})

let max = {}
try { max = JSON.parse(localStorage.getItem(KEY) ?? '{}') } catch {}

function apply(data) {
  let total = 0
  for (const c of data.commandments ?? []) {
    const n = c.number
    // -1: the package couldn't count this one; keep what we had
    if (c.sins < 0) {
      const had = sins.byNumber[n]
      total += had?.max ? had.sins / had.max : 0
      continue
    }
    max[n] = Math.max(max[n] ?? 0, c.sins)
    sins.byNumber[n] = { sins: c.sins, pretended: !!c.pretended, blessed: c.blessed ?? 0, max: max[n] }
    total += max[n] ? c.sins / max[n] : 0
  }
  try { localStorage.setItem(KEY, JSON.stringify(max)) } catch {}
  sins.curse = Math.min(1, total / 10)
}

let inFlight = false
export async function poll() {
  if (inFlight) return
  inFlight = true
  try {
    const res = await fetch(URL_STATUS, { cache: 'no-store' })
    if (!res.ok) throw new Error(res.status)
    apply(await res.json())
    sins.connected = true
  } catch {
    sins.connected = false
  } finally {
    inFlight = false
  }
}

let started = false
export function startSins() {
  if (started) return
  started = true
  // a built deck has no proxy to the site: nothing to ask (the scripted curse and + / - carry it)
  if (import.meta.env.PROD) return
  // every 2 s while the site answers, every 10 s while it doesn't (fewer 502s in the console)
  const loop = () => poll().finally(() => setTimeout(loop, sins.connected ? POLL : POLL * 5))
  loop()
  addEventListener('message', (e) => {
    if (e.origin !== location.origin || e.data?.source !== 'sinners') return
    if (e.data.type === 'absolved') {
      sins.last = e.data
      sins.absolutions++
    }
    if (e.data.type === 'hell') sins.hell = true
    poll()
  })
}

/** Forget the high-water marks (rehearsal reset: maximum sin is whatever comes back next). */
export function resetSins() {
  max = {}
  sins.byNumber = {}
  sins.curse = 1
  try { localStorage.removeItem(KEY) } catch {}
  poll()
}

/**
 * Wipe the Penance Board's own memory, as its "0" panic reset does (Umbraco.Community.Sinners,
 * penance/presenter.ts): where it was (commandment, step, exhibits) lives in sessionStorage, which
 * the backoffice iframe shares with the deck's tab, so restarting the site doesn't touch it, and the
 * board came back on the commandment the last rehearsal ended on. The flag has the board ask the
 * server to forget its pretences (✨) the next time it loads.
 */
export function forgetBoard() {
  sins.hell = false
  try {
    sessionStorage.removeItem('sinners-presenter-state')
    sessionStorage.removeItem('sinners-welcome-seen') // the Welcome dashboard's staged reveal plays again
    sessionStorage.removeItem('sinners-avatar-turned') // …and the header avatar's turn into a pentagram
    sessionStorage.setItem('sinners-forget-pretences', '1')
    localStorage.removeItem('sinners-media-pretend') // where the board kept one pretence before
  } catch {}
}

/** Commandment n was "fixed" by pretending (✨): its line flickers forever. */
export const pretended = (n) => !!sins.byNumber[n]?.pretended
