// The deck's position, for scenes. Scenes can't import useDeck() (it imports deck.js, which imports
// the scenes), so the stage layer (curse/CurseLayer.vue, loaded lazily) copies it in here.
// Outside the deck window (?sheet, the presenter's thumbnails) there's no layer: `live` stays false
// and everything shows its finished, uncursed state.
import { shallowReactive } from 'vue'

export const deckState = shallowReactive({
  live: false,
  idx: 0,
  step: 0,
  overview: false,
  ids: [],
})

const indexOf = (id) => deckState.ids.indexOf(id)

/** The deck has reached scene `id` (it's on stage or behind us). Always true outside the deck. */
export const reached = (id) => !deckState.live || deckState.idx >= indexOf(id)
/** Scene `id` is the one on stage. */
export const onStage = (id) => deckState.live && !deckState.overview && deckState.ids[deckState.idx] === id
