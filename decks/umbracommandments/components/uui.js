// Umbraco's own UI library, the version the Umbraco 18.2 backoffice runs (@umbraco-ui/uui 2.0.2):
// importing it registers every <uui-*> element, and the light theme puts UUI's tokens and Lato on
// :root. The cards that show "the backoffice" (UuiTree, the warehouse, the reveal) use the real
// components, so they look exactly like it. vite.config.js tells Vue they're web components.
//
// UUI is sized for a 14px UI; on a 1920×1080 card wrap it in an element with `zoom` (2–2.3) so it
// reads from the back of the room. Use px there, not %: zoom doesn't scale percentages.
//
// Browser only: `npm run check` loads deck.js in Node, where UUI can't load (it needs window).
// The elements upgrade as soon as it's in.
if (typeof window !== 'undefined') {
  import('@umbraco-ui/uui')
  import('@umbraco-ui/uui/themes/light.css')
}
