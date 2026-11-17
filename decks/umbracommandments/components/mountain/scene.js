// What's drawn over the painted Mount Bellissima as vectors (scenes/Revelation.vue), in the
// revelation card's 1920 × 1080 px: the U-sun and its turning rays. The landscape itself is the
// shader in paint.js; the hiker is Hiker.vue.
const r1 = (n) => Math.round(n * 10) / 10

/** The U-sun. paint.js paints its glow round the same point. */
export const SUN = { x: 1440, y: 210, r: 80 }

/** Its rays: 26 thin wedges, every other one wider, every third longer. */
export const RAYS = Array.from({ length: 26 }, (_, i) => {
  const a = (i / 26) * Math.PI * 2
  const w = i % 2 ? 0.045 : 0.075
  const R = i % 3 === 0 ? 1500 : 1100
  return `M${r1(SUN.x + Math.cos(a - w) * 96)} ${r1(SUN.y + Math.sin(a - w) * 96)}L${r1(SUN.x + Math.cos(a) * R)} ${r1(SUN.y + Math.sin(a) * R)}L${r1(SUN.x + Math.cos(a + w) * 96)} ${r1(SUN.y + Math.sin(a + w) * 96)}Z`
})
