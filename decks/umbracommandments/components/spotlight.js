// A spotlight on something INSIDE the live backoffice (components/LiveUmbraco.vue, same origin, so
// the deck can reach into the iframe): a lime ring round the element, a soft pulse, and everything
// else dimmed. For "look, this button" on a projector, where a mouse cursor is no help.
//
//   deck.js:  backoffice: { …, byStep: { 1: { highlight: 'uui-tab[href$="/dashboard/penance"]' } } }
//             highlight: { selector, text?, label?, all?, expand?, pad?, dim? }
//               selector  a CSS selector, looked for through every shadow root (the backoffice is
//                         web components all the way down)
//               text      only elements whose text contains this (or any of these)
//               label     only elements whose `label` attribute is exactly this (or one of these):
//                         a tree item by its name, { selector: 'uui-menu-item', label: 'Data Types' }
//               all       the ring goes round ALL the matches together, not just the first
//               expand    a closed tree item is opened first, so the ring holds its children too
//                         (and closed again when the spotlight goes)
//               pad       px of air between the element and the ring (default 6)
//               dim       false: the ring only, nothing dimmed
//
//   const stop = spotlight(iframe.contentWindow, target)   →   stop() takes it away
//
// The ring is its own element on the iframe's <body> (fixed, on top, click-through), not a style on
// the target: shadow DOM and overflow would clip an outline, and nothing of Umbraco's is touched.
// It follows the element (the backoffice re-lays itself out as it loads) and waits for it to exist.
// It is shown as a popover, which puts it in the browser's top layer: Umbraco's modals are <dialog>s
// up there, and no z-index gets above them.
// The demo's own exhibits are lit by the Penance Board's clicker script, with the same ring
// (Umbraco.Community.Sinners, penance/spotlight.ts): change the look in both.

const list = (v) => (v == null ? [] : Array.isArray(v) ? v : [v])

/** Every element matching `selector` (and the text / label asked for), in `root` or any shadow root under it. */
export function deepQueryAll(root, selector, text, label) {
  const texts = list(text)
  const labels = list(label)
  // (code editors write their spaces as non-breaking ones)
  const said = (el) => (el.textContent ?? '').replace(/ /g, ' ')
  const ok = (el) =>
    (!texts.length || texts.some((t) => said(el).includes(t))) &&
    (!labels.length || labels.includes(el.getAttribute?.('label') ?? ''))
  const found = []
  const stack = [root]
  while (stack.length) {
    const scope = stack.pop()
    for (const el of scope.querySelectorAll(selector)) if (ok(el)) found.push(el)
    for (const el of scope.querySelectorAll('*')) if (el.shadowRoot) stack.push(el.shadowRoot)
  }
  return found
}

const LIME = '#c3f240'

export function spotlight(win, target) {
  const { selector, text, label, all = false, expand = false, pad = 6, dim = true } = typeof target === 'string' ? { selector: target } : target
  const doc = win.document
  const ring = doc.createElement('div')
  ring.setAttribute('data-deck-spotlight', '')
  Object.assign(ring.style, {
    position: 'fixed',
    zIndex: '2147483647',
    pointerEvents: 'none',
    // (a popover comes with a border, padding, a background and centring of its own)
    inset: 'auto',
    margin: '0',
    padding: '0',
    border: '0',
    background: 'transparent',
    overflow: 'visible',
    borderRadius: '10px',
    boxShadow: `0 0 0 4px ${LIME}, 0 0 26px 10px rgba(195, 242, 64, 0.75)${dim ? ', 0 0 0 200vmax rgba(6, 11, 30, 0.55)' : ''}`,
    opacity: '0',
    transition: 'opacity 0.35s ease-out, left 0.2s, top 0.2s, width 0.2s, height 0.2s',
  })
  let pulse = null
  let warned = false
  const opened = new Set()
  const t0 = performance.now()

  function place() {
    const els = deepQueryAll(doc, selector, text, label)
    if (expand) {
      // open it the way a click on its caret would (once)
      for (const el of els) {
        if (opened.has(el) || el.hasAttribute('show-children')) continue
        opened.add(el)
        el.shadowRoot?.querySelector('#caret-button')?.click()
      }
    }
    const rects = els.map((el) => el.getBoundingClientRect()).filter((r) => r.width > 0 && r.height > 0)
    const use = all ? rects : rects.slice(0, 1)
    if (!use.length) {
      if (!warned && performance.now() - t0 > 8000) {
        console.warn(`[spotlight] nothing in the backoffice matches "${selector}"`, { text, label })
        warned = true // say it once
      }
      return
    }
    // the part of the target that's on screen: a long list runs off the bottom, the ring doesn't
    const left = Math.max(Math.min(...use.map((r) => r.left)) - pad, 4)
    const top = Math.max(Math.min(...use.map((r) => r.top)) - pad, 4)
    const right = Math.min(Math.max(...use.map((r) => r.right)) + pad, win.innerWidth - 4)
    const bottom = Math.min(Math.max(...use.map((r) => r.bottom)) + pad, win.innerHeight - 4)
    if (right <= left || bottom <= top) return
    if (!ring.isConnected) {
      doc.body.appendChild(ring)
      try {
        ring.setAttribute('popover', 'manual')
        ring.showPopover()
      } catch { /* no popover API: it's still on top of everything but a modal */ }
    }
    Object.assign(ring.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${right - left}px`,
      height: `${bottom - top}px`,
      opacity: '1',
    })
    // a slow breath, so the eye finds it (a big ring swells less than a small one)
    const swell = 1 + Math.min(0.08, 14 / Math.max(right - left, bottom - top))
    pulse ??= ring.animate([{ transform: 'scale(1)' }, { transform: `scale(${swell})` }, { transform: 'scale(1)' }], { duration: 1500, iterations: Infinity, easing: 'ease-in-out' })
  }
  place()
  const timer = setInterval(place, 200)

  return function stop() {
    clearInterval(timer)
    pulse?.cancel()
    // what it opened it closes again: the same backoffice travels on to the next card, and an open
    // tree there pushes that card's own evidence down the sidebar
    for (const el of opened) {
      if (el.isConnected && el.hasAttribute('show-children')) el.shadowRoot?.querySelector('#caret-button')?.click()
    }
    opened.clear()
    ring.style.opacity = '0'
    setTimeout(() => ring.remove(), 400)
  }
}
