// Path helpers for the engravings on the tablets (EmblemArt.vue): small, readable glyphs drawn
// in a 200 × 190 panel. Everything returns SVG path data; the caller strokes it.

const f = (n) => Math.round(n * 10) / 10

export function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** An isometric cube centred on its front edge's top: { top, left, right } faces. */
export function cube(cx, cy, s) {
  const k = s * 0.866
  return {
    top: `M${f(cx)} ${f(cy - s)}L${f(cx + k)} ${f(cy - s / 2)}L${f(cx)} ${f(cy)}L${f(cx - k)} ${f(cy - s / 2)}Z`,
    left: `M${f(cx - k)} ${f(cy - s / 2)}L${f(cx)} ${f(cy)}L${f(cx)} ${f(cy + s)}L${f(cx - k)} ${f(cy + s / 2)}Z`,
    right: `M${f(cx)} ${f(cy)}L${f(cx + k)} ${f(cy - s / 2)}L${f(cx + k)} ${f(cy + s / 2)}L${f(cx)} ${f(cy + s)}Z`,
  }
}

/** A page with a folded corner, and its text lines. */
export function page(x, y, w = 26, h = 34) {
  const c = w * 0.3
  let lines = ''
  for (let i = 0; i < 3; i++) lines += `M${f(x + w * 0.2)} ${f(y + h * (0.42 + i * 0.17))}h${f(w * (i === 2 ? 0.4 : 0.6))}`
  return { body: `M${f(x)} ${f(y)}h${f(w - c)}l${f(c)} ${f(c)}v${f(h - c)}h${f(-w)}Z`, fold: `M${f(x + w - c)} ${f(y)}v${f(c)}h${f(c)}`, lines }
}

export function folder(x, y, w = 30, h = 22) {
  return `M${f(x)} ${f(y)}h${f(w * 0.38)}l${f(w * 0.1)} ${f(h * 0.18)}h${f(w * 0.52)}v${f(h * 0.82)}h${f(-w)}Z M${f(x)} ${f(y + h * 0.3)}h${f(w)}`
}

export function diamond(cx, cy, r) {
  return `M${f(cx)} ${f(cy - r)}l${f(r)} ${f(r)}l${f(-r)} ${f(r)}l${f(-r)} ${f(-r)}Z M${f(cx)} ${f(cy - r * 0.45)}l${f(r * 0.45)} ${f(r * 0.45)}l${f(-r * 0.45)} ${f(r * 0.45)}l${f(-r * 0.45)} ${f(-r * 0.45)}Z`
}

/** A jigsaw piece, s wide: a knob on the top and on the right. */
export function puzzle(x, y, s) {
  const q = s / 3, r = q * 0.48
  return `M${f(x)} ${f(y)}h${f(q)}a${f(r)} ${f(r)} 0 1 1 ${f(q)} 0h${f(q)}v${f(q)}a${f(r)} ${f(r)} 0 1 1 0 ${f(q)}v${f(q)}h${f(-s)}Z`
}

/** A scroll lying flat, rolled at both ends: { body, ends }. */
export function scroll(x, y, w, h) {
  const r = h * 0.18
  return {
    body: `M${f(x + r)} ${f(y)}h${f(w - 2 * r)}M${f(x + r)} ${f(y + h)}h${f(w - 2 * r)}`,
    ends: `M${f(x + r)} ${f(y)}a${f(r)} ${f(h / 2)} 0 1 0 0 ${f(h)}a${f(r)} ${f(h / 2)} 0 1 0 0 ${f(-h)}Z M${f(x + w - r)} ${f(y)}a${f(r)} ${f(h / 2)} 0 1 1 0 ${f(h)}a${f(r)} ${f(h / 2)} 0 1 1 0 ${f(-h)}Z`,
  }
}

/** A house: walls, roof, an arched door. */
export function house(x, base, w, h) {
  const roof = h * 0.55
  const d = w * 0.3
  return {
    walls: `M${f(x)} ${f(base)}V${f(base - h)}H${f(x + w)}V${f(base)}Z`,
    roof: `M${f(x - 5)} ${f(base - h)}L${f(x + w / 2)} ${f(base - h - roof)}L${f(x + w + 5)} ${f(base - h)}`,
    door: `M${f(x + w / 2 - d / 2)} ${f(base)}V${f(base - h * 0.42)}a${f(d / 2)} ${f(d / 2)} 0 0 1 ${f(d)} 0V${f(base)}`,
    shelf: `M${f(x + w * 0.2)} ${f(base - h * 0.78)}h${f(w * 0.6)}`,
  }
}

/** A crate with cross bracing. */
export function crate(x, y, s) {
  return `M${f(x)} ${f(y)}h${f(s)}v${f(s)}h${f(-s)}Z M${f(x)} ${f(y)}l${f(s)} ${f(s)} M${f(x + s)} ${f(y)}l${f(-s)} ${f(s)}`
}

/** A bumpy, cloud-like tree crown round (cx, cy). */
export function crown(cx, cy, r, bumps = 11, droop = 0) {
  let d = ''
  for (let i = 0; i <= bumps; i++) {
    const a = (i / bumps) * Math.PI * 2 - Math.PI / 2
    const rr = r * (1 + droop * Math.max(0, Math.sin(a)))
    const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.92
    if (i === 0) { d += `M${f(x)} ${f(y)}`; continue }
    const am = a - Math.PI / bumps
    const rm = r * 1.2 * (1 + droop * Math.max(0, Math.sin(am)))
    d += `Q${f(cx + Math.cos(am) * rm)} ${f(cy + Math.sin(am) * rm * 0.92)} ${f(x)} ${f(y)}`
  }
  return d + 'Z'
}

/** n points scattered inside a circle, seeded. */
export function scatter(cx, cy, r, n, seed) {
  const rnd = mulberry32(seed)
  const out = []
  while (out.length < n) {
    const x = (rnd() * 2 - 1) * r, y = (rnd() * 2 - 1) * r
    if (x * x + y * y > r * r) continue
    if (out.some(([px, py]) => Math.hypot(px - cx - x, py - cy - y) < r * 0.16)) continue
    out.push([f(cx + x), f(cy + y)])
  }
  return out
}

export const check = (x, y, s = 14) => `M${f(x)} ${f(y)}l${f(s * 0.35)} ${f(s * 0.38)}l${f(s * 0.65)} ${f(-s * 0.8)}`
export const cross = (x, y, s = 14) => `M${f(x)} ${f(y)}l${f(s)} ${f(s)}M${f(x + s)} ${f(y)}l${f(-s)} ${f(s)}`

/** A padlock: shackle and body, the keyhole cut out. */
export function padlock(cx, cy, s) {
  return {
    shackle: `M${f(cx - s * 0.32)} ${f(cy)}V${f(cy - s * 0.35)}a${f(s * 0.32)} ${f(s * 0.32)} 0 0 1 ${f(s * 0.64)} 0V${f(cy)}`,
    body: `M${f(cx - s / 2)} ${f(cy)}h${f(s)}v${f(s * 0.75)}h${f(-s)}Z`,
    hole: `M${f(cx)} ${f(cy + s * 0.25)}v${f(s * 0.25)}`,
  }
}

/** A hooded monk, seen from the side, feet at (0,0), 100 tall: one closed silhouette. */
export const MONK =
  'M-9 -100C4 -104 13 -94 11 -82C10 -77 8 -74 6 -72L4 -66C12 -60 20 -55 27 -53L25 -46C17 -48 10 -51 5 -54' +
  'C11 -36 17 -17 22 0L-26 0C-22 -26 -16 -52 -12 -72C-14 -82 -16 -96 -9 -100Z'
