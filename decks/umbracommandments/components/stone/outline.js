// The outline of a weathered tablet: the ideal shape, walked every few px and pushed inwards by
// fractal noise, with a few sharp chips knocked out of the edge. Seeded, so a tablet keeps its
// chips across rehearsals. Pure geometry: an SVG path `d` in the tablet's own px (0,0 … w,h).
//
//   outline(528, 880, { shape: 'slab', seed: 3 })   a slab, top corners rounded
//   outline(610, 1010, { shape: 'round', seed: 1 }) the classic round-topped tablet

function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// the ideal outline, clockwise from the top-left, as points every ~step px
function ideal(w, h, shape, step) {
  const pts = []
  const line = (x0, y0, x1, y1) => {
    const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / step))
    for (let i = 0; i < n; i++) pts.push([x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n])
  }
  const arc = (cx, cy, rx, ry, a0, a1) => {
    const n = Math.max(2, Math.round((Math.abs(a1 - a0) * Math.max(rx, ry)) / step))
    for (let i = 0; i < n; i++) {
      const a = a0 + ((a1 - a0) * i) / n
      pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)])
    }
  }
  if (shape === 'round') {
    const ry = w * 0.36
    arc(w / 2, ry, w / 2, ry, Math.PI, Math.PI * 2)
    line(w, ry, w, h)
    line(w, h, 0, h)
    line(0, h, 0, ry)
  } else {
    const r = w * 0.09
    arc(r, r, r, r, Math.PI, Math.PI * 1.5)
    line(r, 0, w - r, 0)
    arc(w - r, r, r, r, Math.PI * 1.5, Math.PI * 2)
    line(w, r, w, h - r * 0.4)
    arc(w - r * 0.4, h - r * 0.4, r * 0.4, r * 0.4, 0, Math.PI * 0.5)
    line(w - r * 0.4, h, r * 0.4, h)
    arc(r * 0.4, h - r * 0.4, r * 0.4, r * 0.4, Math.PI * 0.5, Math.PI)
    line(0, h - r * 0.4, 0, r)
  }
  return pts
}

export function outline(w, h, { shape = 'slab', seed = 1, rough = 7, chips = 6, step = 5 } = {}) {
  const rnd = mulberry32(seed * 977 + 3)
  const pts = ideal(w, h, shape, step)
  const n = pts.length
  // periodic 1D fractal noise round the perimeter
  const octaves = [6, 13, 29, 61].map((k) => ({ k, g: Array.from({ length: k }, rnd) }))
  const noise = (t) => {
    let s = 0, amp = 1, norm = 0
    for (const { k, g } of octaves) {
      const x = t * k, i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f)
      s += amp * (g[i % k] + (g[(i + 1) % k] - g[i % k]) * u)
      norm += amp
      amp *= 0.5
    }
    return s / norm
  }
  const knocks = Array.from({ length: chips }, () => ({ t: rnd(), width: 0.008 + rnd() * 0.02, depth: 5 + rnd() * 12 }))
  const out = pts.map(([x, y], i) => {
    const t = i / n
    const [px, py] = pts[(i - 1 + n) % n]
    const [qx, qy] = pts[(i + 1) % n]
    // inward normal of a clockwise outline (screen coordinates): the tangent turned right
    let nx = -(qy - py), ny = qx - px
    const len = Math.hypot(nx, ny) || 1
    nx /= len; ny /= len
    let d = rough * noise(t)
    for (const c of knocks) {
      const dt = Math.min(Math.abs(t - c.t), 1 - Math.abs(t - c.t))
      if (dt < c.width) d += c.depth * (1 - dt / c.width) * (0.6 + 0.4 * rnd())
    }
    return [x + nx * d, y + ny * d]
  })
  return 'M' + out.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + 'Z'
}
