// The passages the camera zooms to on the relics (`frames` in deck.js), in the card's px.
// Keep them in step with PitfallsRelic.vue and C9Relic.vue. Each leaves room on the left for the ☞
// in the margin (Manuscript.vue).
export const PITFALLS = {
  ultra: { cx: 620, cy: 285, w: 860 },        // c7-relic step 1: "This section is ultra important!"
  descendants: { cx: 880, cy: 500, w: 1360 }, // c7-relic step 2: the Descendants warning
  volatile: { cx: 850, cy: 712, w: 1290 },    // c8-relic step 1: volatile data, custom tables
}

export const CULTIV = {
  warning: { cx: 740, cy: 310, w: 1080 },     // step 1: its own warning banner
  structure: { cx: 840, cy: 540, w: 1300 },   // step 2: a site root, Home beneath it
  fall: { cx: 880, cy: 685, w: 1400 },        // step 3: November 2012, the Fall
}
