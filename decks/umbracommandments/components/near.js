// Heavy content only where it can be seen: on stage, one card away (so it's there before the
// camera arrives), and in thumbnails (?sheet, the presenter). Everywhere else it's faded out anyway
// (InlaySlide), and every element in the document is restyled each time --curse changes, so the
// web-component-heavy cards (Umbraco's UI) and the tree walk stay unmounted until they're needed.
//
//   const show = useNear()   →   <div v-if="show">…</div>
import { computed } from 'vue'
import { useStep } from '@engine/useStep.js'

export function useNear() {
  const { near, preview } = useStep()
  return computed(() => near.value || preview.value)
}
