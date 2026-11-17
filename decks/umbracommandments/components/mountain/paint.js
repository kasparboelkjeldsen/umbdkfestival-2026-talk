// Mount Bellissima, painted. One fragment shader (components/paint/gl.js) ray-marches a real
// landscape into three pictures: day, dusk and night, the same geometry under three skies.
// scenes/Revelation.vue cross-fades them with the curse.
//
// The pictures are FILES (public/assets/mountain-day.jpg, -dusk, -night): the deck only shows
// them. The shader is their source and runs when you ask for it, on the dev server:
//
//   http://localhost:5180/?repaint#revelation/0     a quick look (1920 × 1080, not saved)
//   http://localhost:5180/?repaint&save#revelation/0   the real thing (2880 × 1620), written to
//                                                   public/assets/ (vite.config.js takes them)
//
// 2880 wide and JPEG on purpose. The browser decodes a picture again for every size it's drawn at,
// so a zoom through the mountain decodes each one a few times mid-flight: bigger pictures (or
// WebP, which can't be decoded straight to a smaller size the way JPEG can) cost frames there, and
// the mountain is a backdrop whenever the camera is closer than the whole card anyway.
//
// Why not paint at load, like the stone slabs: a shader this size takes Direct3D ten seconds or
// more to compile the first time, and the browser can't draw a frame meanwhile. Not on stage.
//
// The world, in metres, seen from a camera 1.2 m above the meadow (a shift lens: the horizon sits at
// y = 600 of the card's 1920 × 1080, verticals stay vertical):
//   - a meadow knoll under the camera: grass, flowers, boulders, the trail winding off to the left.
//     The hiker stands 4.2 m in, the signpost 5 m in on the left (both drawn on top as vectors; the
//     shader casts their shadows, so they stand IN the picture, see CAST below);
//   - beyond the knoll's edge the land drops 250 m into a valley with a lake;
//   - across it the massif (3 km away, its summit about 1100 m above the camera), forest on its
//     lower slopes, rock and snow above; a wooded ridge on the right; far ranges behind, in haze;
//   - cumulus placed by hand (clear of the tablets and the U-sun), stars at night.
//
// Everything is seeded: the picture is the same at every rehearsal. Card px → world: see GEOMETRY.
import { shallowReactive } from 'vue'
import { asset } from '@engine/asset.js'
import { paint } from '../paint/gl.js'


// The camera, shared with the vector art that stands in the picture (Hiker.vue, the signpost).
export const GEOMETRY = {
  f: 1400,          // focal length, card px
  cx: 960,          // principal point: the horizon is at y = cy
  cy: 600,
  eye: 1.2,         // camera height over the meadow, m
}
/** A point on the flat meadow (x m to the right, z m in front of the camera) → card px. */
export const onMeadow = (x, z) => ({ x: GEOMETRY.cx + (GEOMETRY.f * x) / z, y: GEOMETRY.cy + (GEOMETRY.f * GEOMETRY.eye) / z })

// What stands on the meadow and casts a shadow there: vertical capsules { x, z, from, to, r } in m.
// The hiker (feet at card 1035, 1000), his raised arms with the tablets, the signpost and its plank.
export const CAST = [
  { x: 0.225, z: 4.2, from: 0, to: 1.72, r: 0.22 },
  { x: 0.225, z: 4.2, from: 1.75, to: 2.5, r: 0.42 },
  { x: -1.93, z: 4.97, from: 0, to: 1.67, r: 0.055 },
  { x: -1.75, z: 4.97, from: 1.28, to: 1.52, r: 0.62 },
]

const FRAG = /* glsl */ `
uniform float uK; // picture px per card px

const float F = ${GEOMETRY.f}.0;
const vec2 PP = vec2(${GEOMETRY.cx}.0, ${GEOMETRY.cy}.0);
const float EYE = ${GEOMETRY.eye};
const vec3 LDIR = normalize(vec3(0.74, 0.42, 0.22)); // the light: from the right, a little ahead
const float WATER = -247.0;
const vec2 SUN = vec2(1440.0, 210.0);                 // the U-sun, card px
const float TMAX = 42000.0;

vec3 srgb(float r, float g, float b) { return pow(vec3(r, g, b) / 255.0, vec3(2.2)); }

// ---------------------------------------------------------------- terrain
// fbm whose octaves are damped where the slope is already steep: ridges and worn valleys
float erode(vec2 p, int oct) {
  float a = 0.0, b = 1.0;
  vec2 d = vec2(0.0);
  for (int i = uZ; i < oct; i++) {
    vec3 n = noised(p);
    d += n.yz;
    a += b * n.x / (1.0 + dot(d, d));
    b *= 0.5;
    p = ROT * p * 2.0;
  }
  return a;
}

// signed distance (m, roughly) past the knoll's edge: < 0 on the meadow
float past(vec2 p) {
  return dot(p, vec2(0.9, 0.436)) - 7.0 + 2.4 * (noise(p / 11.0) - 0.5) + 5.0 * (noise(p / 47.0) - 0.5);
}
float trailX(float z) { return 0.3 - 0.11 * pow(max(z - 3.5, 0.0), 1.5) + 0.35 * sin(z * 0.45); }

// boulders on the meadow: x, z, radius
const int NB = 7;
const vec3 BOULDER[NB] = vec3[NB](
  vec3(-3.3, 6.6, 0.5), vec3(1.7, 7.0, 0.36), vec3(-1.2, 12.5, 0.62), vec3(-2.75, 3.75, 0.34),
  vec3(2.3, 3.9, 0.28), vec3(-6.5, 9.5, 0.55), vec3(1.25, 3.4, 0.15));
float boulders(vec2 p) {
  float h = 0.0;
  for (int i = uZ; i < NB; i++) {
    vec3 b = BOULDER[i];
    vec2 q = (p - b.xy) / b.z;
    float d = dot(q, q);
    if (d < 1.6) {
      float k = 0.75 + 0.5 * noise(p * 5.0 / b.z + float(i) * 7.0);
      h = max(h, b.z * 0.8 * sqrt(max(0.0, 1.0 - d / (k * k))));
    }
  }
  return h;
}

// where the forest grows (0…1), from the land without its trees
float forestAt(vec2 p, float h, float t, float s) {
  float alt = smoothstep(-250.0, -225.0, h) * (1.0 - smoothstep(110.0, 300.0, h + 120.0 * (t - 0.5)));
  if (alt <= 0.0 || s < 120.0) return 0.0;
  float m = smoothstep(0.36, 0.5, noise(p / 260.0 + 9.0) * 0.6 + noise(p / 70.0) * 0.4);
  return alt * m * smoothstep(120.0, 420.0, s);
}

// the land: x = height, y = forest (0…1), z = the erosion noise (for colour), w = past()
vec4 land(vec2 p, int oct) {
  float s = past(p);
  float h = 0.0;
  // the knoll: flat where the hiker and the signpost stand, rolling further out
  // (its small relief only where it can be seen: near, and on the meadow)
  if (s < 30.0) {
    float far = smoothstep(6.0, 34.0, length(p));
    h += (noise(p / 8.0 + 3.0) - 0.45) * 1.5 * far + (noise(p / 2.3) - 0.5) * 0.07;
  }
  // … then down into the valley
  h -= 258.0 * smoothstep(0.0, 380.0, s) + 14.0 * (1.0 - exp(-max(s, 0.0) / 9.0));
  float valley = smoothstep(120.0, 600.0, s);
  if (valley > 0.0) h += valley * 16.0 * (noise(p / 300.0 + 2.0) - 0.5);
  // the lake's basin, on the right
  vec2 lq = (p - vec2(1150.0, 2050.0)) / vec2(900.0, 640.0);
  h -= valley * 30.0 * exp(-dot(lq, lq) * dot(lq, lq));

  float t = erode(p / 1750.0 + vec2(7.3, 2.1), oct);
  // the massif
  vec2 q = (p - vec2(-1130.0, 3350.0)) * vec2(1.0, 1.2);
  float em = pow(clamp(1.0 - length(q) / 2500.0, 0.0, 1.0), 1.45);
  // its horn: a sharper cone on top, so there is one summit
  float horn = pow(clamp(1.0 - length(q) / 950.0, 0.0, 1.0), 1.25);
  // the wooded ridge on the right, and the low shoulders either side of the valley
  vec2 q2 = (p - vec2(1500.0, 3500.0)) * vec2(0.5, 1.5);
  float er = pow(clamp(1.0 - length(q2) / 1000.0, 0.0, 1.0), 1.3);
  vec2 q3 = (p - vec2(-2300.0, 1500.0)) * vec2(0.8, 1.0);
  float el = pow(clamp(1.0 - length(q3) / 1500.0, 0.0, 1.0), 1.3);
  // the far ranges
  float ef = smoothstep(6500.0, 12000.0, p.y + abs(p.x) * 0.15);
  float mount = em * (240.0 + 800.0 * t) + horn * (300.0 + 230.0 * t) + er * (180.0 + 300.0 * t) + el * (220.0 + 420.0 * t) + ef * (500.0 + 1700.0 * t);
  h += mount;
  return vec4(h, forestAt(p, h, t, s), t, s);
}

// the trees on it: one cone a cell
float canopy(vec2 p) {
  vec2 g = p / 8.5;
  vec2 c = floor(g);
  vec2 r = hash2(c);
  float d = length(fract(g) - 0.5 - (r - 0.5) * 0.45);
  return (9.0 + 9.0 * r.x) * clamp(1.0 - d * 2.4, 0.0, 1.0);
}

float terrain(vec2 p, int oct) {
  vec4 l = land(p, oct);
  float h = l.x;
  if (l.y > 0.0) h += l.y * canopy(p);
  if (p.y < 40.0 && l.w < 2.0) {
    h += boulders(p);
    // the trail, worn a little into the meadow
    h -= 0.035 * (1.0 - smoothstep(0.3, 0.62, abs(p.x - trailX(p.y))));
  }
  return max(h, WATER);
}

float march(vec3 ro, vec3 rd, float t, int steps) {
  // Nothing on the meadow reaches above 1 m: a ray looking down starts where it has sunk to that,
  // a ray looking up can only meet the mountains, half a kilometre off at the nearest.
  t = rd.y < 0.0 ? max(t, (ro.y - 1.0) / -rd.y) : 500.0;
  float before = t;
  bool hit = false;
  for (int i = uZ; i < steps; i++) {
    vec3 p = ro + rd * t;
    float h = p.y - terrain(p.xz, 6);
    if (h < 0.0007 * t) { hit = true; break; }
    before = t;
    // at least 0.5% further each step: a ray grazing the flat meadow would otherwise crawl
    t += max(h * 0.42, 0.005 * t);
    if (t > TMAX || (rd.y > 0.0 && p.y > 2100.0)) break;
  }
  if (!hit) return -1.0;
  // that last step may have gone well into the ground: home in on the surface between the two
  // (without this the far slopes come out in terraces, one per step)
  for (int i = uZ; i < 7; i++) {
    float mid = 0.5 * (before + t);
    vec3 p = ro + rd * mid;
    if (p.y - terrain(p.xz, 6) < 0.0) t = mid; else before = mid;
  }
  return t;
}

float shadow(vec3 p, float dist) {
  float res = 1.0;
  float t = 0.06 + dist * 0.004;
  for (int i = uZ; i < 44; i++) {
    vec3 q = p + LDIR * t;
    float h = q.y - terrain(q.xz, 5);
    res = min(res, 9.0 * h / t);
    if (res < 0.01 || q.y > 2400.0) break;
    t += clamp(h * 0.6, 0.05 + t * 0.03, 500.0);
  }
  return clamp(res, 0.0, 1.0);
}

// what stands on the meadow (the hiker, the signpost) shades the ground: a vertical capsule's shadow
float capsuleShade(vec2 p, vec2 at, float from, float to, float r) {
  vec2 dir = LDIR.xz / LDIR.y;                    // ground offset per metre of height
  vec2 a = at - dir * from, b = at - dir * to;    // where the capsule's ends fall
  vec2 pa = p - a, ba = b - a;
  float k = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  float d = length(pa - ba * k);
  float soft = r * 0.25 + 0.05 + 0.1 * mix(from, to, k); // the penumbra widens with height
  return smoothstep(r - soft, r + soft, d);
}
float standing(vec2 p) {
  float s = 1.0;
${CAST.map((c) => `  s *= capsuleShade(p, vec2(${c.x}, ${c.z}), ${c.from.toFixed(3)}, ${c.to.toFixed(3)}, ${c.r.toFixed(3)});`).join('\n')}
  return s;
}

// ---------------------------------------------------------------- the three lights
struct Light {
  vec3 sun, amb, bounce;       // the key light, the sky's light, light off the ground
  vec3 zenith, mid, horizon;   // the sky
  vec3 fog, mist;              // distance haze, the valley's mist
  vec3 glow;                   // round the U-sun
  vec3 cloudLit, cloudShade;
  float stars, expo, sat;
};
Light DAY, DUSK, NIGHT;
void lights() {
  DAY = Light(vec3(1.0, 0.94, 0.8) * 1.75, vec3(0.5, 0.66, 1.0) * 0.5, vec3(0.5, 0.52, 0.3) * 0.3,
    srgb(36.0, 106.0, 196.0), srgb(118.0, 184.0, 234.0), srgb(226.0, 240.0, 244.0),
    srgb(176.0, 208.0, 236.0), srgb(206.0, 226.0, 244.0), vec3(1.0, 0.93, 0.7),
    vec3(1.0, 0.99, 0.96), srgb(150.0, 174.0, 208.0), 0.0, 1.0, 1.12);
  DUSK = Light(vec3(1.0, 0.5, 0.24) * 1.8, vec3(0.5, 0.36, 0.62) * 0.55, vec3(0.5, 0.3, 0.2) * 0.25,
    srgb(50.0, 34.0, 94.0), srgb(170.0, 76.0, 114.0), srgb(246.0, 166.0, 92.0),
    srgb(196.0, 110.0, 108.0), srgb(240.0, 160.0, 120.0), vec3(1.0, 0.72, 0.4),
    srgb(255.0, 196.0, 150.0), srgb(104.0, 70.0, 116.0), 0.0, 1.0, 1.1);
  NIGHT = Light(vec3(0.5, 0.62, 1.0) * 0.3, vec3(0.16, 0.2, 0.42) * 0.24, vec3(0.1, 0.12, 0.2) * 0.1,
    srgb(2.0, 3.0, 9.0), srgb(9.0, 11.0, 29.0), srgb(26.0, 22.0, 50.0),
    srgb(8.0, 10.0, 24.0), srgb(16.0, 20.0, 40.0), srgb(170.0, 215.0, 70.0) * 0.5,
    srgb(60.0, 70.0, 104.0), srgb(14.0, 16.0, 32.0), 1.0, 1.15, 0.9);
}

// ---------------------------------------------------------------- sky
// a cumulus, in card px: density at c
float puff(vec2 c, vec3 at, float seed) {
  vec2 q = (c - at.xy) / vec2(at.z, at.z * 0.42);
  float d = 1.0 - length(q);
  d += (fbm(c / at.z * 2.6 + seed, 5) - 0.5) * 1.15;
  d -= smoothstep(0.05, 0.75, q.y) * 1.3; // a flat base
  return d;
}
const int NC = 8;
const vec3 CLOUD[NC] = vec3[NC](
  vec3(215.0, 150.0, 230.0), vec3(560.0, 250.0, 150.0), vec3(1715.0, 118.0, 250.0), vec3(1850.0, 352.0, 170.0),
  vec3(1300.0, 432.0, 110.0), vec3(60.0, 372.0, 150.0), vec3(1105.0, 52.0, 120.0), vec3(1590.0, 478.0, 90.0));

vec3 sky(vec2 c, vec3 rd, Light l) {
  float up = clamp(1.0 - (PP.y - c.y) / PP.y, 0.0, 1.0); // 0 at the top of the card, 1 on the horizon
  vec3 col = mix(l.zenith, l.mid, pow(up, 0.85));
  col = mix(col, l.horizon, smoothstep(0.62, 1.04, up));
  // stars
  if (l.stars > 0.0) {
    vec2 g = c / 15.0;
    vec2 r = hash2(floor(g));
    float d = length(fract(g) - 0.15 - r * 0.7);
    float big = hash(floor(g) + 17.0);
    float s = smoothstep(0.05 + 0.13 * big * big * big, 0.0, d) * step(0.8, hash(floor(g) + 43.0)) * (0.25 + 0.75 * big * big);
    col += l.stars * s * vec3(0.9, 0.95, 1.0) * (1.0 - smoothstep(0.7, 1.0, up)) * 1.6;
  }
  // the U-sun's glow
  float sd = length(c - SUN);
  col += l.glow * (0.95 * exp(-sd / 95.0) + 0.3 * exp(-sd / 340.0) + 0.1 * exp(-sd / 900.0));
  // high cirrus
  float ci = smoothstep(0.52, 0.8, fbm(vec2(c.x / 620.0, c.y / 70.0) + 4.0, 5)) * (1.0 - smoothstep(0.2, 0.75, up));
  col = mix(col, l.cloudLit, ci * 0.3);
  // cumulus: lit from the sun's side, flat and shaded underneath
  for (int i = uZ; i < NC; i++) {
    vec3 at = CLOUD[i];
    if (abs(c.x - at.x) > at.z * 1.5 || abs(c.y - at.y) > at.z) continue;
    float seed = float(i) * 13.7;
    float d = puff(c, at, seed);
    float a = smoothstep(0.0, 0.2, d);
    if (a <= 0.0) continue;
    float toSun = d - puff(c + normalize(SUN - at.xy + vec2(0.0, -160.0)) * at.z * 0.09, at, seed);
    float lit = smoothstep(-0.16, 0.2, toSun);
    float body = smoothstep(0.0, 0.9, d);
    vec3 cc = mix(l.cloudShade, l.cloudLit, clamp(lit * 0.8 + body * 0.25, 0.0, 1.0));
    cc = mix(cc, l.cloudShade * 0.92, smoothstep(0.0, 0.5, (c.y - at.y) / (at.z * 0.42)) * 0.55);
    col = mix(col, cc, a * 0.96);
  }
  return col;
}

// ---------------------------------------------------------------- the ground's colour
struct Surf { vec3 alb; float snow; float water; float rough; };

// Things that stand up in the meadow are drawn as upright sprites: cells that are square on screen
// (x in metres, depth by its logarithm), each with one thing at its true size for its distance.
// The ground point under the pixel picks the cell; flat ground is assumed (true where they grow).
vec2 spriteAt(vec2 w) { return PP + vec2(F * w.x / w.y, F * EYE / w.y); }

// flowers: rgb, a = cover
vec4 flowers(vec2 c, vec2 at) {
  vec4 best = vec4(0.0);
  vec2 g = vec2(at.x / 0.3, log(at.y) / 0.21);
  for (int j = uZ - 1; j <= 1; j++) for (int i = uZ - 1; i <= 1; i++) {
    vec2 cell = floor(g) + vec2(float(i), float(j));
    vec2 r = hash2(cell);
    vec2 r2 = hash2(cell + 57.0);
    // they grow in drifts
    if (r2.x > 0.25 + 0.6 * smoothstep(0.35, 0.65, noise(cell / 4.5))) continue;
    vec2 w = vec2((cell.x + 0.15 + 0.7 * r.x) * 0.3, exp((cell.y + 0.15 + 0.7 * r.y) * 0.21));
    float k = F / w.y;                                  // px per metre there
    vec2 base = spriteAt(w);
    float tall = (0.07 + 0.12 * r2.y) * k;
    vec2 head = base - vec2((r.x - 0.5) * 0.04 * k, tall);
    float rad = (0.017 + 0.016 * hash(cell + 3.0)) * k;
    // the stem
    float along = clamp((c.y - head.y) / tall, 0.0, 1.0);
    float sx = mix(head.x, base.x, along);
    if (c.y > head.y && c.y < base.y && abs(c.x - sx) < max(0.6, 0.0035 * k)) best = vec4(srgb(52.0, 104.0, 40.0), 0.9);
    float d = length(c - head) / rad;
    if (d > 1.0) continue;
    float kind = hash(cell + 91.0);
    vec3 col = kind < 0.34 ? srgb(255.0, 255.0, 250.0) : kind < 0.58 ? srgb(252.0, 212.0, 44.0) : kind < 0.74 ? srgb(150.0, 96.0, 220.0)
      : kind < 0.88 ? srgb(246.0, 128.0, 172.0) : srgb(84.0, 136.0, 240.0);
    // petals: a scalloped rim; a heart in the middle
    float petal = 0.82 + 0.18 * cos(atan(c.y - head.y, c.x - head.x) * (5.0 + floor(kind * 3.0)) + r.x * 6.0);
    if (d > petal) continue;
    col *= 0.8 + 0.25 * d;
    if (d < 0.36) col = kind < 0.34 ? srgb(250.0, 196.0, 36.0) : col * 0.6;
    best = vec4(col, 1.0);
  }
  return best;
}

// tufts: three blades fanning out of one root. a = cover, r = how light (tip → root)
vec2 tufts(vec2 c, vec2 at) {
  vec2 best = vec2(0.0);
  vec2 g = vec2(at.x / 0.42, log(at.y) / 0.3);
  for (int j = uZ - 1; j <= 1; j++) for (int i = uZ - 1; i <= 1; i++) {
    vec2 cell = floor(g) + vec2(float(i), float(j));
    vec2 r = hash2(cell + 211.0);
    if (hash(cell + 77.0) > 0.7) continue;
    vec2 w = vec2((cell.x + 0.15 + 0.7 * r.x) * 0.42, exp((cell.y + 0.15 + 0.7 * r.y) * 0.3));
    float k = F / w.y;
    vec2 base = spriteAt(w);
    float tall = (0.1 + 0.14 * r.y) * k;
    float y = (base.y - c.y) / tall;                    // 0 at the root, 1 at the tips
    if (y < 0.0 || y > 1.0) continue;
    float x = (c.x - base.x) / tall;
    for (int b = uZ - 1; b <= 1; b++) {
      float lean = float(b) * (0.28 + 0.2 * r.x) + (r.x - 0.5) * 0.3;
      float cx = lean * y * (0.6 + 0.6 * y);
      float wd = 0.075 * (1.0 - y) * (b == 0 ? 1.2 : 1.0);
      if (abs(x - cx) < wd) best = vec2(y, 1.0);
    }
  }
  return best;
}

Surf surface(vec2 c, vec3 p, vec3 nb, vec4 l3, float dist) {
  Surf s;
  s.snow = 0.0; s.water = 0.0; s.rough = 0.0;
  float h = l3.x, forest = l3.y, t = l3.z;
  float ps = l3.w;
  float steep = 1.0 - smoothstep(0.5, 0.74, nb.y);
  float tone = fbm(p.xz / 240.0, 4);

  // rock: pale dolomite, banded
  float band = noise(vec2(p.y / 60.0 + 9.0 * noise(p.xz / 150.0), 0.5)) * 0.16 + noise(p.xz / 34.0) * 0.44 + 0.4 * t;
  vec3 rock = mix(srgb(126.0, 122.0, 124.0), srgb(196.0, 180.0, 158.0), band);
  rock *= 0.84 + 0.32 * noise(p.xz / 11.0 + p.y / 13.0);
  // grass on the slopes: lush low down, tawny towards the tree line
  vec3 grass = mix(srgb(104.0, 148.0, 70.0), srgb(150.0, 152.0, 92.0), smoothstep(-200.0, 380.0, h + 200.0 * (tone - 0.5)));
  grass = mix(grass, srgb(126.0, 170.0, 84.0), smoothstep(0.45, 0.7, tone) * 0.5);
  // forest
  vec3 wood = mix(srgb(30.0, 70.0, 44.0), srgb(58.0, 104.0, 60.0), noise(p.xz / 5.0) * 0.6 + 0.2 * tone);

  vec3 alb = mix(grass, rock, max(steep, smoothstep(330.0, 560.0, h + 260.0 * (tone - 0.5))));
  alb = mix(alb, wood, forest * (1.0 - steep * 0.8));
  // scree and dry earth where the valley meets the slopes
  // snow: above the line, where it can lie
  float line = 520.0 + 260.0 * (noise(p.xz / 420.0) - 0.5) - 240.0 * (1.0 - steep);
  s.snow = smoothstep(0.0, 110.0, h - line) * smoothstep(0.34, 0.6, nb.y + 0.25 * (noise(p.xz / 14.0) - 0.5));

  // the meadow under the camera
  if (ps < 4.0 && dist < 260.0) {
    float m = 1.0 - smoothstep(0.0, 4.0, ps);
    vec3 lush = mix(srgb(62.0, 116.0, 40.0), srgb(116.0, 166.0, 62.0), fbm(p.xz / 1.9, 4));
    lush = mix(lush, srgb(44.0, 92.0, 36.0), smoothstep(0.46, 0.7, fbm(p.xz / 6.5 + 20.0, 4)) * 0.75);
    lush = mix(lush, srgb(158.0, 184.0, 80.0), smoothstep(0.55, 0.8, fbm(p.xz / 13.0 + 7.0, 3)) * 0.5);
    lush = mix(lush, srgb(96.0, 150.0, 96.0), smoothstep(0.6, 0.85, fbm(p.xz / 3.1 + 60.0, 3)) * 0.35);
    // blades: fine strokes standing up the picture, fading with distance
    float near = 1.0 - smoothstep(5.0, 38.0, dist);
    float blade = noise(vec2(p.x * 70.0 + 4.0 * noise(vec2(p.x * 11.0, log(p.z) * 40.0)), log(p.z) * 34.0));
    lush *= 1.0 + (blade - 0.5) * 0.42 * near;
    vec2 tf = tufts(c, p.xz);
    lush = mix(lush, mix(srgb(40.0, 86.0, 30.0), srgb(118.0, 168.0, 62.0), tf.x), tf.y * near);
    vec4 fl = flowers(c, p.xz);
    // far away the flowers are specks of colour
    float speck = step(0.9, hash(floor(c * 0.9))) * smoothstep(9.0, 30.0, dist) * (1.0 - smoothstep(60.0, 150.0, dist));
    lush = mix(lush, mix(srgb(250.0, 240.0, 190.0), srgb(214.0, 160.0, 226.0), hash(floor(c * 0.9) + 5.0)), speck * 0.75);

    // the trail: packed earth and gravel, grass creeping in from the sides
    float off = abs(p.x - trailX(p.z)) + (noise(p.xz * 3.0) - 0.5) * 0.22 + (noise(p.xz * 14.0) - 0.5) * 0.06;
    float tr = (1.0 - smoothstep(0.34, 0.52, off)) * (1.0 - smoothstep(60.0, 110.0, p.z));
    vec3 dirt = mix(srgb(168.0, 140.0, 98.0), srgb(214.0, 194.0, 150.0), fbm(p.xz * 2.2, 4));
    dirt *= 0.86 + 0.3 * noise(p.xz * 40.0);
    float pebble = step(0.86, noise(p.xz * 26.0)) * near;
    dirt = mix(dirt, srgb(150.0, 146.0, 140.0), pebble * 0.7);
    dirt = mix(dirt, lush * 0.9, smoothstep(0.1, 0.34, off) * 0.35);
    lush = mix(lush, dirt, tr);
    if (tr < 0.5) lush = mix(lush, fl.rgb, fl.a * (1.0 - smoothstep(26.0, 44.0, dist)));

    // boulders: lichened grey
    float b = boulders(p.xz);
    vec3 stone = mix(srgb(128.0, 126.0, 122.0), srgb(186.0, 180.0, 166.0), fbm(p.xz * 3.5 + 8.0, 4));
    stone = mix(stone, srgb(150.0, 160.0, 96.0), smoothstep(0.6, 0.75, noise(p.xz * 9.0)) * 0.5);
    lush = mix(lush, stone, smoothstep(0.01, 0.06, b));
    alb = mix(alb, lush, m);
    s.rough = near;
  }

  // water
  if (h <= WATER + 0.01) { s.water = 1.0; alb = srgb(24.0, 96.0, 128.0); }
  s.alb = alb;
  return s;
}

vec3 tonemap(vec3 c, Light l) {
  c *= l.expo;
  c = mix(c, 0.55 + 0.45 * (1.0 - exp(-(c - 0.55) / 0.45)), step(0.55, c)); // a soft shoulder
  c = pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2));
  float g = dot(c, vec3(0.3, 0.59, 0.11));
  c = mix(vec3(g), c, l.sat);
  return c * c * (3.0 - 2.0 * c) * 0.35 + c * 0.65; // a touch of contrast
}

vec3 shade(vec2 c, vec3 ro, vec3 rd, float t, vec3 p, vec3 n, Surf s, float sh, float ao, Light l) {
  if (t < 0.0) return sky(c, rd, l);
  vec3 alb = mix(s.alb, vec3(0.9, 0.93, 1.0), s.snow);
  float diff = clamp(dot(n, LDIR), 0.0, 1.0);
  float up = 0.5 + 0.5 * n.y;
  // cloud shadows lie over the far land in soft patches
  float cs = mix(1.0, 0.5 + 0.5 * smoothstep(0.38, 0.6, fbm(p.xz / 1100.0 + 5.0, 4)), smoothstep(150.0, 900.0, t));
  vec3 col = alb * (l.sun * diff * sh * cs + l.amb * up * ao + l.bounce * (1.0 - up * 0.6) * ao);
  // light through the grass and the flowers, from the sun's side
  col += alb * l.sun * 0.1 * s.rough * sh;
  // snow glints
  col += s.snow * l.sun * 0.12 * pow(diff, 4.0) * sh;
  if (s.water > 0.0) {
    // the lake: the sky in it, a darker deep, a bright line where the light lies on it
    vec3 r = reflect(rd, normalize(vec3((noise(p.xz / 9.0) - 0.5) * 0.06, 1.0, (noise(p.xz / 7.0 + 5.0) - 0.5) * 0.06)));
    vec3 refl = mix(l.mid, l.zenith, clamp(r.y * 2.2, 0.0, 1.0));
    float fres = 0.25 + 0.75 * pow(1.0 - clamp(-rd.y, 0.0, 1.0), 4.0);
    col = mix(alb * (l.amb + l.sun * 0.2), refl, fres);
    col += l.sun * 0.35 * pow(clamp(dot(r, LDIR), 0.0, 1.0), 60.0);
  }
  // haze: thicker with distance, warm towards the sun, and a mist lying in the valley
  float fogAmt = 1.0 - exp(-t / 15500.0);
  float toSun = pow(clamp(dot(rd, normalize(vec3(SUN - PP, F) * vec3(1.0, -1.0, 1.0))), 0.0, 1.0), 6.0);
  vec3 fogCol = mix(l.fog, l.fog + l.glow * 0.5, toSun);
  col = mix(col, fogCol, fogAmt);
  float b = 0.012;
  float ry = abs(rd.y) < 1e-4 ? 1e-4 : rd.y;
  float mistAmt = 0.0001 * exp(-(ro.y - WATER) * b) * (1.0 - exp(-t * ry * b)) / (ry * b);
  col = mix(col, l.mist, clamp(mistAmt, 0.0, 0.42) * smoothstep(60.0, 900.0, t));
  // the U-sun's glow lies over the land as well
  float sd = length(c - SUN);
  col += l.glow * (0.16 * exp(-sd / 300.0) + 0.05 * exp(-sd / 900.0));
  return col;
}

void main() {
  lights();
  vec2 c = PX() / uK; // card px
  vec3 ro = vec3(0.0, EYE, 0.0);
  vec3 rd = normalize(vec3((c.x - PP.x) / F, (PP.y - c.y) / F, 1.0));

  float t = march(ro, rd, 0.6, 300);
  vec3 p = ro + rd * t, n = vec3(0.0, 1.0, 0.0);
  Surf s = Surf(vec3(0.0), 0.0, 0.0, 0.0);
  float sh = 1.0, ao = 1.0;
  if (t > 0.0) {
    // four samples round the point give the normal (with all the detail the distance still shows),
    // the land's own slope (for what grows on it) and how hollow the spot is
    // (loops, not four calls each: every call site is another copy of the terrain to compile)
    float e = max(0.012, 0.0011 * t), eb = max(0.4, 0.004 * t), wide = max(1.5, 0.02 * t);
    vec3 hn = vec3(0.0), hb = vec3(0.0);
    vec4 here = vec4(0.0);
    float round_ = 0.0;
    for (int i = uZ; i < 3; i++) {
      vec2 dir = vec2(i == 1 ? 1.0 : 0.0, i == 2 ? 1.0 : 0.0);
      hn[i] = terrain(p.xz + dir * e, 10);
      vec4 l = land(p.xz + dir * eb, 8);
      hb[i] = l.x;
      if (i == 0) here = l;
      else round_ += terrain(p.xz + dir * wide, 6) + terrain(p.xz - dir * wide, 6);
    }
    n = normalize(vec3(hn[0] - hn[1], e, hn[0] - hn[2]));
    vec3 nb = normalize(vec3(hb[0] - hb[1], eb, hb[0] - hb[2]));
    s = surface(c, p, nb, here, t);
    if (s.water > 0.0) n = vec3(0.0, 1.0, 0.0);
    // near grass: break the light up a little
    if (s.rough > 0.0) n = normalize(n + s.rough * 0.22 * vec3(noise(p.xz * 30.0) - 0.5, 0.0, noise(p.xz * 30.0 + 9.0) - 0.5));
    sh = shadow(p + n * (0.02 + 0.002 * t), t);
    if (t < 40.0) sh *= standing(p.xz);
    ao = clamp(1.0 - (round_ - 4.0 * p.y) / (wide * 5.0), 0.35, 1.0);
  }

  // grain: a painted surface rather than a gradient, and no banding
  float g = (hash(PX()) - 0.5) * 0.022 + (noise(PX() / 2.3) - 0.5) * 0.02;
  vec3 res[3];
  for (int v = uZ; v < 3; v++) {
    Light l = DAY;
    if (v == 1) l = DUSK;
    if (v == 2) l = NIGHT;
    res[v] = tonemap(shade(c, ro, rd, t, p, n, s, sh, ao, l), l) + g * (v == 2 ? 0.6 : 1.0);
  }
  o0 = vec4(res[0], 1.0);
  o1 = vec4(res[1], 1.0);
  o2 = vec4(res[2], 1.0);
}
`

const TIMES = ['day', 'dusk', 'night']

/** The three pictures: the files, or what a ?repaint has just painted. */
export const MOUNTAIN = shallowReactive(Object.fromEntries(TIMES.map((t) => [t, asset(`/assets/mountain-${t}.jpg`)])))

/**
 * Paint them again (dev only, see the top of this file): a quick look at 1920 × 1080, or with
 * `save` the real 2880 × 1620, written over the files in public/assets/.
 */
export async function repaintMountain({ save = false } = {}) {
  const res = save ? 1.5 : 1
  console.info(`[mountain] painting at ${1920 * res} × ${1080 * res}…`)
  const urls = await paint({
    w: Math.round(1920 * res),
    h: Math.round(1080 * res),
    frag: FRAG,
    uniforms: { uK: res },
    targets: 3,
    slice: 30,
    type: 'image/jpeg',
    quality: 0.93,
  })
  if (!urls[0]) return console.warn('[mountain] not painted (no WebGL2?)')
  TIMES.forEach((t, i) => { MOUNTAIN[t] = urls[i] })
  if (!save) return console.info('[mountain] painted (a look only: add &save to write the files)')
  // the dev server reloads the page when a file in public/ changes: don't paint again when it does
  history.replaceState(null, '', location.pathname + location.hash)
  for (const [i, t] of TIMES.entries()) {
    const blob = await (await fetch(urls[i])).blob()
    const r = await fetch(`/__paint/mountain-${t}.jpg`, { method: 'PUT', body: blob })
    console.info(`[mountain] mountain-${t}.jpg: ${r.ok ? `saved, ${Math.round(blob.size / 1024)} kB` : `NOT saved (${r.status})`}`)
  }
}

// ?repaint[&save] on the dev server
if (import.meta.env?.DEV && typeof location !== 'undefined') {
  const q = new URLSearchParams(location.search)
  if (q.has('repaint')) setTimeout(() => repaintMountain({ save: q.has('save') }), 1500)
}
