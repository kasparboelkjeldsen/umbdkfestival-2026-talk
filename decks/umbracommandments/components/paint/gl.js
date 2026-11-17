// A tiny WebGL2 painter: fragment shaders that run ONCE and leave a picture behind (a blob URL for
// an <img>). The deck's heavy art (the stone slabs, Mount Bellissima) is painted this way at load
// instead of being drawn as live SVG: vector art that size is re-rasterised on every frame of a
// zoom, a picture is one textured quad.
//
//   paint({ w, h, frag, uniforms, textures, slice, hold, targets, type, quality })
//     →  Promise<blob URL | ''>, or with `targets: n` an array of n of them
//
// - `frag` is the body of a GLSL ES 3.0 fragment shader. It gets `uRes` (px), `px` via PX() (image
//   coordinates: origin top left, y down), the helpers in LIB (hash, noise, fbm) and writes `o`.
// - `targets: n`: one run of the shader paints n pictures at once (it writes `o0` … instead of
//   `o`): the same geometry under different light costs its ray march only once.
// - `uniforms`: { name: number | [x, y] | [x, y, z] | [x, y, z, w] }
// - `textures`: { name: canvas | ImageBitmap } (uploaded as they are, not flipped, linear, clamped)
// - `slice`: for a heavy shader. Paint in horizontal bands of about that many ms of GPU time each,
//   each sent only once the one before has finished (a fence, polled), so the GPU is never asked
//   for more than a sliver of a frame at a time and the page keeps animating while it paints.
// - `hold`: () => boolean, asked before every band: while it says true, nothing is painted (the
//   mountain holds while the camera flies).
//
// Loops in a shader start at the uniform `uZ` (0) instead of a literal 0: on Windows the shader is
// compiled by Direct3D, which unrolls every loop it can count, and a ray march of a few hundred
// steps round a noise function then takes minutes to compile (with the page frozen meanwhile).
//
// One context for everything. Jobs run one after another, each in a task of its own with a breath
// between them, and none before the deck is up and idle: painting never competes with the first
// frames. A job may be a function (sync or async) that returns the job: its preparation (a mask
// drawn on a 2D canvas, say) then also happens when its turn comes, not when it's asked for.
// Without WebGL2 (or outside a browser: `npm run check` loads the scenes in Node) every paint
// resolves to '', and the callers show their plain fallback.
const browser = typeof document !== 'undefined'

export const LIB = /* glsl */ `
float hash(vec2 p) {
  uvec2 q = uvec2(ivec2(floor(p))) * uvec2(1597334673U, 3812015801U);
  uint n = (q.x ^ q.y) * 1597334673U;
  return float(n) * (1.0 / 4294967295.0);
}
vec2 hash2(vec2 p) {
  uvec2 q = uvec2(ivec2(floor(p))) * uvec2(1597334673U, 3812015801U);
  uint n = (q.x ^ q.y) * 1597334673U;
  uvec2 r = uvec2(n, n * 48271U) * uvec2(2246822519U, 3266489917U);
  return vec2(r) * (1.0 / 4294967295.0);
}
// value noise, 0…1
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
// value noise with its derivatives: (value, d/dx, d/dy)
vec3 noised(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);
  float a = hash(i), b = hash(i + vec2(1, 0)), c = hash(i + vec2(0, 1)), d = hash(i + vec2(1, 1));
  return vec3(a + (b - a) * u.x + (c - a) * u.y + (a - b - c + d) * u.x * u.y,
              du * (vec2(b - a, c - a) + (a - b - c + d) * u.yx));
}
const mat2 ROT = mat2(0.8, -0.6, 0.6, 0.8);
float fbm(vec2 p, int oct) {
  float a = 0.5, s = 0.0;
  for (int i = uZ; i < oct; i++) { s += a * noise(p); p = ROT * p * 2.02 + 11.7; a *= 0.5; }
  return s;
}
`

const VERT = `#version 300 es
in vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }`

const head = (targets) => `#version 300 es
precision highp float;
precision highp int;
uniform vec2 uRes;
uniform int uZ; // always 0: loops start at it, so the compiler can't unroll them (see below)
${targets > 1 ? Array.from({ length: targets }, (_, i) => `layout(location = ${i}) out vec4 o${i};`).join(' ') : 'out vec4 o;'}
#define PX() vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y)
${LIB}
`

let canvas = null
let gl = null
let dead = !browser
const programs = new Map()

function context() {
  if (gl || dead) return gl
  try {
    canvas = document.createElement('canvas')
    gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' })
    if (!gl) throw new Error('no webgl2')
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    canvas.addEventListener('webglcontextlost', () => { dead = true; gl = null })
  } catch (e) {
    console.warn('[paint] WebGL2 not available, the plain art stays:', e.message)
    dead = true
    gl = null
  }
  return gl
}

const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms))

// Compiled in the background where the browser can (KHR_parallel_shader_compile): asking for the
// status only once it's done, so even a slow compile never blocks the page.
async function program(frag, targets) {
  if (programs.has(frag)) return programs.get(frag)
  const compile = (type, src) => {
    const s = gl.createShader(type)
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return s
  }
  const p = gl.createProgram()
  const vs = compile(gl.VERTEX_SHADER, VERT)
  const fs = compile(gl.FRAGMENT_SHADER, head(targets) + frag)
  gl.attachShader(p, vs)
  gl.attachShader(p, fs)
  gl.bindAttribLocation(p, 0, 'a')
  gl.linkProgram(p)
  const ext = gl.getExtension('KHR_parallel_shader_compile')
  if (ext) {
    const t0 = performance.now()
    while (!gl.getProgramParameter(p, ext.COMPLETION_STATUS_KHR)) {
      if (performance.now() - t0 > 60000) throw new Error('shader compile timed out')
      await tick(30)
      if (dead) throw new Error('context lost')
    }
  }
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getShaderInfoLog(fs) || gl.getShaderInfoLog(vs) || gl.getProgramInfoLog(p))
  }
  programs.set(frag, p)
  return p
}

// the GPU has finished everything sent so far (asked without blocking the page)
async function settled() {
  const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0)
  gl.flush()
  for (;;) {
    await tick()
    if (dead) return
    const st = gl.clientWaitSync(sync, 0, 0)
    if (st !== gl.TIMEOUT_EXPIRED) break
  }
  gl.deleteSync(sync)
}

async function run({ w, h, frag, uniforms = {}, textures = {}, slice = 0, hold = null, targets = 1, type = 'image/webp', quality = 0.92 }) {
  const none = targets > 1 ? Array(targets).fill('') : ''
  if (!context()) return none
  const t0 = performance.now()
  const p = await program(frag, targets)
  const t1 = performance.now()
  canvas.width = w
  canvas.height = h
  gl.viewport(0, 0, w, h)
  gl.useProgram(p)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  gl.uniform2f(gl.getUniformLocation(p, 'uRes'), w, h)
  gl.uniform1i(gl.getUniformLocation(p, 'uZ'), 0)
  for (const [name, v] of Object.entries(uniforms)) {
    const loc = gl.getUniformLocation(p, name)
    if (loc == null) continue
    if (typeof v === 'number') gl.uniform1f(loc, v)
    else gl[`uniform${v.length}f`](loc, ...v)
  }
  const made = []
  Object.entries(textures).forEach(([name, src], unit) => {
    const t = gl.createTexture()
    made.push(t)
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, t)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.uniform1i(gl.getUniformLocation(p, name), unit)
  })
  // several pictures at once: a framebuffer with one texture each
  let fbo = null
  const shots = []
  if (targets > 1) {
    fbo = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    for (let i = 0; i < targets; i++) {
      const t = gl.createTexture()
      shots.push(t)
      gl.activeTexture(gl.TEXTURE0 + 15)
      gl.bindTexture(gl.TEXTURE_2D, t)
      gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, w, h)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, t, 0)
    }
    gl.drawBuffers(shots.map((_, i) => gl.COLOR_ATTACHMENT0 + i))
  }
  gl.disable(gl.BLEND)
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.enable(gl.SCISSOR_TEST)
  // bands from the bottom up; with `slice` their height follows what the last one cost
  let rows = slice ? 2 : h
  let busy = 0
  for (let y = 0; y < h;) {
    if (hold) while (hold()) await tick(150)
    if (dead) return none
    const n = Math.min(rows, h - y)
    gl.scissor(0, y, w, n)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    y += n
    if (slice) {
      const s0 = performance.now()
      await settled()
      const ms = performance.now() - s0
      busy += ms
      rows = Math.max(1, Math.min(48, Math.round(rows * Math.min(1.6, slice / Math.max(ms, 1)))))
    }
  }
  gl.disable(gl.SCISSOR_TEST)
  made.forEach((t) => gl.deleteTexture(t))
  // out of the GL canvas at once (the next job reuses it), encoded off the main thread
  const grab = () => {
    const copy = document.createElement('canvas')
    copy.width = w
    copy.height = h
    copy.getContext('2d').drawImage(canvas, 0, 0)
    return new Promise((r) => copy.toBlob((blob) => r(blob ? URL.createObjectURL(blob) : ''), type, quality))
  }
  if (!fbo) return grab()
  const out = []
  for (let i = 0; i < targets; i++) {
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, fbo)
    gl.readBuffer(gl.COLOR_ATTACHMENT0 + i)
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null)
    gl.blitFramebuffer(0, 0, w, h, 0, 0, w, h, gl.COLOR_BUFFER_BIT, gl.NEAREST)
    out.push(grab())
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.deleteFramebuffer(fbo)
  shots.forEach((t) => gl.deleteTexture(t))
  gl.finish()
  console.debug(`[paint] ${w}×${h} ×${targets}: compiled in ${Math.round(t1 - t0)} ms, painted in ${Math.round(performance.now() - t1)} ms (${Math.round(busy)} ms of it on the GPU)`)
  return Promise.all(out)
}

// the deck is up and has had a moment to itself
const whenIdle = () => new Promise((r) => {
  if (!browser) return
  const go = () => setTimeout(r, 400)
  if (typeof requestIdleCallback === 'function') requestIdleCallback(go, { timeout: 1500 })
  else setTimeout(go, 300)
})

let queue = null

/**
 * Paint a picture with a fragment shader: `job` as described at the top, or a function returning
 * it (or a promise of it). Resolves to a blob URL, or '' if it can't be done.
 */
export function paint(job) {
  const none = job.targets > 1 ? Array(job.targets).fill('') : ''
  if (dead) return Promise.resolve(none)
  queue ??= whenIdle()
  const next = queue.then(() => tick(24)).then(async () => run(typeof job === 'function' ? await job() : job)).catch((e) => {
    console.warn('[paint] failed, the plain art stays:', e)
    return none
  })
  queue = next
  return next
}
