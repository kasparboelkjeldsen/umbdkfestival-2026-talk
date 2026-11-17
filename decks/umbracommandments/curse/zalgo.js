// Zalgo: a text with combining marks stacked on its letters. Deterministic: the marks come from a
// PRNG seeded by the text and `seed`, and the same sequence is drawn at every level, so marks are
// only ever added as the level rises, never reshuffled. Used by Zalgo.vue (text that rots with the
// curse) and scrawl.js (the smeared "not a cult").
const ABOVE = [...'̀́̂̃̄̅̆̇̈̊̋̌̍̎̏̐̑̒̓̔̽̾̿̀́͂̓̈́͆͊͋͌͐͑͒͗͛ͣͤͥͦͧͨͩͪͫͬͭͮͯ']
const BELOW = [...'̖̗̘̙̜̝̞̟̠̣̤̥̦̩̪̫̬̭̮̯̰̱̲̳̹̺̻̼͇͈͉͍͎͓͔͕͖͙͚ͅ']
const MIDDLE = [...'̴̵̶̷̸']

function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const hash = (s) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7)

/**
 * `text` with marks: `level` 0…1 of `height` marks above and below each letter (scaled separately
 * by `above` / `below`), and a strike through the middle past 0.6.
 */
export function zalgo(text, { level = 1, height = 9, seed = 1, above = 1, below = 1 } = {}) {
  if (level <= 0) return text
  const rnd = mulberry32(hash(text) ^ seed)
  return [...text].map((ch) => {
    // draw the same sequence at every level, so marks only ever get added, never reshuffled
    const up = Math.round(height * above * (0.4 + rnd() * 0.6))
    const down = Math.round(height * below * (0.4 + rnd() * 0.6))
    const picks = Array.from({ length: up + down + 1 }, () => rnd())
    if (ch === ' ') return ch
    const n = (k) => Math.round(k * level)
    let s = ch
    for (let i = 0; i < n(up); i++) s += ABOVE[Math.floor(picks[i] * ABOVE.length)]
    for (let i = 0; i < n(down); i++) s += BELOW[Math.floor(picks[up + i] * BELOW.length)]
    if (level > 0.6) s += MIDDLE[Math.floor(picks[up + down] * MIDDLE.length)]
    return s
  }).join('')
}
