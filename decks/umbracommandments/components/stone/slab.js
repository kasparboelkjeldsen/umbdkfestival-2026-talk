// A stone slab, painted once (components/paint/gl.js) and shown as a picture.
//
// The 2D canvas draws what only it can: the chipped outline (outline.js), filled sharp (R), filled
// and blurred (G: how far in from the edge, i.e. the worn bevel's profile) and the cracks and pits
// (B: grooves). The shader turns that into relief: a height field (bevel + undulation + grain −
// grooves), its normals lit from the top left, weathered limestone on it (warm and cool patches,
// rain streaks, mineral specks, lichen, dirt in the hollows), the slab's thickness showing along
// the right and the bottom, and a soft shadow underneath. All baked: at run time it's an <img>.
//
//   slabArt({ w, h, shape, seed, res })  →  { d, pad, url }   url: a shallowRef, '' until painted
import { shallowRef } from 'vue'
import { outline } from './outline.js'
import { paint } from '../paint/gl.js'
import { atRest, flying } from '../paint/hold.js'

export const PAD = 56 // design px round the slab, for the thickness and the shadow

function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// fractures: in from the edge, wandering, thinning, the odd branch
function fractures(w, h, seed) {
  const rnd = mulberry32(seed * 131 + 17)
  const out = []
  const walk = (x, y, a, len, width, depth) => {
    const pts = [[x, y]]
    const steps = Math.max(4, Math.round(len / 9))
    for (let i = 0; i < steps; i++) {
      a += (rnd() - 0.5) * (i % 3 === 2 ? 1.5 : 0.35) // mostly straight runs, the odd sharp turn
      x += Math.cos(a) * (len / steps)
      y += Math.sin(a) * (len / steps)
      pts.push([x, y])
      if (depth < 1 && i > 1 && rnd() < 0.07) walk(x, y, a + (rnd() < 0.5 ? 0.9 : -0.9), len * 0.3, width * 0.55, depth + 1)
    }
    out.push({ pts, width })
  }
  const n = 1 + (seed % 3)
  for (let i = 0; i < n; i++) {
    const side = Math.floor(rnd() * 4)
    const t = 0.15 + rnd() * 0.7
    const [x, y, a] = side === 0 ? [0, h * t, 0] : side === 1 ? [w, h * t, Math.PI] : side === 2 ? [w * t, h, -Math.PI / 2] : [w * t, h * 0.12, Math.PI / 2]
    walk(x, y, a + (rnd() - 0.5) * 0.7, w * (0.12 + rnd() * 0.22), 2.2 + rnd() * 1.4, 0)
  }
  return out
}

function mask(w, h, d, seed, res) {
  const W = Math.round((w + PAD * 2) * res), H = Math.round((h + PAD * 2) * res)
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  // (kept in memory, not on the GPU: it's uploaded as a texture straight away)
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, W, H)
  const path = new Path2D(d)
  // G: the slab, soft: 0.5 on the edge, 1 a bevel's width in. Blurred on a canvas a quarter the
  // size (a blur this wide on the full one takes a tenth of a second), then stretched over
  const q = 4
  const small = document.createElement('canvas')
  small.width = Math.ceil(W / q)
  small.height = Math.ceil(H / q)
  const sc = small.getContext('2d', { willReadFrequently: true })
  const bevel = Math.max(9, w / 44)
  sc.filter = `blur(${(bevel * res * 0.5) / q}px)`
  sc.setTransform(res / q, 0, 0, res / q, (PAD * res) / q, (PAD * res) / q)
  sc.fillStyle = '#0f0'
  sc.fill(path)
  ctx.globalCompositeOperation = 'lighter'
  ctx.drawImage(small, 0, 0, small.width * q, small.height * q)
  ctx.setTransform(res, 0, 0, res, PAD * res, PAD * res)
  // R: the slab
  ctx.fillStyle = '#f00'
  ctx.fill(path)
  // B: grooves
  ctx.strokeStyle = '#00f'
  ctx.fillStyle = '#00f'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const f of fractures(w, h, seed)) {
    for (let i = 1; i < f.pts.length; i++) {
      ctx.lineWidth = Math.max(0.7, f.width * (1 - (i - 1) / f.pts.length))
      ctx.beginPath()
      ctx.moveTo(...f.pts[i - 1])
      ctx.lineTo(...f.pts[i])
      ctx.stroke()
    }
  }
  const rnd = mulberry32(seed * 53 + 5)
  const pits = Math.round((w * h) / 5200)
  for (let i = 0; i < pits; i++) {
    const r = 0.8 + rnd() * rnd() * 3.2
    ctx.globalAlpha = 0.45 + rnd() * 0.55
    ctx.beginPath()
    ctx.ellipse(rnd() * w, rnd() * h, r, r * (0.6 + rnd() * 0.5), rnd() * 3, 0, Math.PI * 2)
    ctx.fill()
  }
  return c
}

const FRAG = /* glsl */ `
uniform sampler2D uMask;
uniform float uScale;   // px per design px
uniform float uSeed;
uniform vec2 uThick;    // the slab's thickness on the picture, px
uniform float uBevel;   // design px

float surface(vec2 d) {
  float big = fbm(d / 120.0 + uSeed, 3);
  float mid = fbm(d / 26.0 + uSeed * 1.7 + 7.0, 4);
  float fine = fbm(d / 4.5 + 3.0, 4);
  float pit = smoothstep(0.6, 0.78, fbm(d / 10.0 + 31.0 + uSeed, 4));
  return big * 5.0 + mid * 2.2 + fine * 0.9 - pit * 1.2;
}
float height(vec2 p) {
  vec4 m = texture(uMask, p / uRes);
  float edge = smoothstep(0.5, 0.97, m.g);
  return pow(edge, 0.55) * uBevel + surface(p / uScale) - m.b * 3.2;
}

void main() {
  vec2 p = PX();
  vec2 d = p / uScale;
  vec4 m = texture(uMask, p / uRes);

  // ---- the face ----
  float e = 1.0;
  float h0 = height(p);
  vec3 n = normalize(vec3(-(height(p + vec2(e, 0)) - h0) * uScale / e, -(height(p + vec2(0, e)) - h0) * uScale / e, 1.0));
  vec3 L = normalize(vec3(-0.52, -0.66, 0.56));
  float diff = clamp(dot(n, L), 0.0, 1.0);
  // a little light bounced from below right, so the shadow side isn't dead
  float bounce = clamp(dot(n, normalize(vec3(0.5, 0.6, 0.4))), 0.0, 1.0);

  float tone = fbm(d / 170.0 + uSeed * 3.0, 4);
  vec3 warm = vec3(0.86, 0.79, 0.66), cool = vec3(0.74, 0.71, 0.64);
  vec3 alb = mix(cool, warm, smoothstep(0.32, 0.68, tone));
  // rain streaks, running down from the top
  float streak = smoothstep(0.5, 0.78, fbm(vec2(d.x / 22.0, d.y / 260.0) + uSeed * 5.0, 4));
  alb = mix(alb, alb * vec3(0.74, 0.7, 0.63), streak * 0.42);
  // mineral specks
  vec2 cell = floor(p / 1.6);
  alb *= 1.0 - 0.22 * step(0.94, hash(cell));
  alb += 0.09 * step(0.972, hash(cell + 91.0));
  // lichen: pale and ochre patches with ragged edges
  float blotch = fbm(d / 60.0 + 40.0 + uSeed * 2.0, 4);
  float ragged = fbm(d / 6.0 + 11.0, 3);
  float lichen = smoothstep(0.62, 0.7, blotch + (ragged - 0.5) * 0.25);
  alb = mix(alb, mix(vec3(0.74, 0.7, 0.42), vec3(0.8, 0.82, 0.72), step(0.5, fract(blotch * 7.0))), lichen * 0.42);
  // dirt and moss creeping up from the bottom and sitting in the bevel
  float edge = smoothstep(0.5, 0.97, m.g);
  float low = smoothstep(0.78, 1.0, (d.y - ${PAD}.0) / (uRes.y / uScale - ${PAD * 2}.0) + (ragged - 0.5) * 0.3);
  alb = mix(alb, vec3(0.33, 0.38, 0.22), low * 0.45);
  alb *= mix(0.72, 1.0, edge);
  // grooves are dark inside
  alb *= 1.0 - 0.55 * m.b;

  vec3 face = alb * (0.3 + 1.02 * diff + 0.1 * bounce);
  // broad light across the slab: brightest top left
  face *= 1.08 - 0.22 * smoothstep(0.0, 1.0, (p.x / uRes.x + p.y / uRes.y) * 0.5);
  float fa = m.r;

  // ---- the thickness: the outline again, pushed back down and right ----
  float side = 0.0, depth = 0.0;
  for (int i = uZ + 1; i <= 10; i++) {
    float t = float(i) / 10.0;
    float s = texture(uMask, (p - uThick * t) / uRes).r;
    if (s > side) { side = s; depth = t; }
  }
  float strata = fbm(vec2(d.x / 40.0, d.y / 3.0) + uSeed, 3);
  vec3 sideCol = vec3(0.4, 0.37, 0.32) * (0.55 + 0.5 * strata) * (1.0 - 0.45 * depth);

  // ---- the shadow it casts ----
  vec2 sp = p - uThick * 1.9 - vec2(0.0, 7.0 * uScale);
  float sh = smoothstep(0.08, 0.9, texture(uMask, sp / uRes).g) * 0.42;

  // shadow, then the side, then the face (premultiplied)
  vec4 c = vec4(0.0, 0.0, 0.0, sh);
  c = mix(c, vec4(sideCol, 1.0), side);
  c = mix(c, vec4(face, 1.0), fa);
  // a breath of dither against banding
  c.rgb += (hash(p) - 0.5) / 255.0;
  o = vec4(c.rgb * c.a, c.a);
}
`

const cache = new Map()

/** The slab's outline and its painted picture (shared by every slab of the same cut). */
export function slabArt({ w, h, shape = 'slab', seed = 1, res = 2 }) {
  const key = `${shape}|${seed}|${Math.round(w)}|${Math.round(h)}|${res}`
  if (cache.has(key)) return cache.get(key)
  const d = outline(w, h, { shape, seed, rough: Math.max(5, w / 70) })
  const art = { d, pad: PAD, url: shallowRef('') }
  cache.set(key, art)
  // painted when its turn comes (one slab a task), and never while the camera flies
  paint(async () => {
    await atRest()
    const m = mask(w, h, d, seed, res)
    return {
      w: m.width,
      h: m.height,
      frag: FRAG,
      textures: { uMask: m },
      uniforms: { uScale: res, uSeed: (seed * 7.31) % 97, uThick: [w * 0.014 * res, w * 0.024 * res], uBevel: Math.max(5, w / 80) },
      hold: flying,
      type: 'image/webp',
      quality: 0.9,
    }
  }).then((url) => { art.url.value = url })
  return art
}
