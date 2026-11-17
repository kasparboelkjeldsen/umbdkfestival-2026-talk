// A phrase of ghost text as a small picture (a PNG data URL, drawn once on a 2D canvas and kept).
//
// Why pictures: text is rasterised again, glyph by glyph, at every new size, so on every frame of
// a zoom; and "not a cult" is a few hundred phrases, a quarter of them wearing a dozen combining
// marks per letter, some of them thousands of px tall on the canvas. A picture is one small quad
// at any size. They're a few kB each and there are only eight phrases, so nearly all are shared.
//
//   sprite('not a cult', '#f3efe3', 64)             the phrase, 64 px type in the picture
//   sprite('not a cult', '#f3efe3', 64, { seed })   smeared into zalgo (its own picture per seed)
//     → { url, w, h, cx, cy }   picture px; cx, cy: where the middle of the plain line is (0…1)
import { zalgo } from './zalgo.js'

export const font = (px) => `italic 400 ${px}px "Libre Caslon Text", Georgia, serif`

const cache = new Map()

export function sprite(text, colour, px, { seed = null, level = 0.7, height = 6 } = {}) {
  const key = `${text}|${colour}|${px}|${seed}`
  if (cache.has(key)) return cache.get(key)
  const shown = seed == null ? text : zalgo(text, { level, height, seed })
  const canvas = document.createElement('canvas')
  let ctx = canvas.getContext('2d')
  ctx.font = font(px)
  const m = ctx.measureText(shown)
  const plain = seed == null ? m : ctx.measureText(text)
  const pad = Math.ceil(px * 0.08) + 2
  const left = Math.ceil(m.actualBoundingBoxLeft) + pad
  const up = Math.ceil(m.actualBoundingBoxAscent) + pad
  canvas.width = left + Math.ceil(m.actualBoundingBoxRight) + pad
  canvas.height = up + Math.ceil(m.actualBoundingBoxDescent) + pad
  ctx = canvas.getContext('2d') // (resizing reset it)
  ctx.font = font(px)
  ctx.fillStyle = colour
  ctx.fillText(shown, left, up)
  const s = {
    url: canvas.toDataURL('image/png'),
    w: canvas.width,
    h: canvas.height,
    // the middle of the plain line: half its advance along, a third of the type size above the baseline
    cx: (left + plain.width / 2) / canvas.width,
    cy: (up - px * 0.3) / canvas.height,
  }
  cache.set(key, s)
  return s
}
