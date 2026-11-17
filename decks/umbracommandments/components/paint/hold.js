// "Not now": painting waits while the camera flies (a flight needs the GPU and the main thread to
// itself). The camera has moved if it isn't where it was the last time this was asked.
import { cam } from '@engine/cameraState.js'

let seen = ''
export const flying = () => {
  const now = `${cam.x}|${cam.y}|${cam.w}|${cam.r}`
  const moved = now !== seen
  seen = now
  return moved
}

/** Resolves once the camera has been still for a moment. */
export async function atRest() {
  while (flying()) await new Promise((r) => setTimeout(r, 160))
}
