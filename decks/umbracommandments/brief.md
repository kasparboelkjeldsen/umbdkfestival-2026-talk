# The 10 UmbraCommandments (Umbraco DK Festival 2026)

Kaspar Boel Kjeldsen (Kraftvaerk). Subtitle: *We are all sinners.* Built from the "Build handover:
The 10 UmbraCommandments (DK Festival 2026)" (story, layout, systems, every scene, notes style),
on top of Kaspar's PowerPoint (`Umbraco.Community.Sinners/talk.pptx`, described in
`docs/handover-umbracommandments.md`).

## The story

Kaspar climbed Mount Bellissima. A shining U revealed two **ancient** tablets: lost knowledge, ten
commandments the elders knew and everyone forgot. As the sermon goes on, the deck is possessed:
the sky goes from day to night, text rots into zalgo, "not a cult" spreads over the canvas. It
peaks at an all-black DEMO TIME (yes, it's a LOOK AT THIS THING I MADE talk after all), with every
card in a summoning circle. The live Penance Board absolves the sins and each absolution lets the
light back in. Daylight recap, the bonus commandment ("I'm not your mum"), and a final pull-out:
the whole talk was a dashboard in the Umbraco backoffice. A violation of VIII. We are all sinners.

Filter for every commandment: "is everyone guilty?", not "will people argue?".

## Visual language

- **Kraftvaerk, as the victim.** Pleasant Grey cards, Functional Black, Athletic Green, the
  wordmark bottom-left. Libre Caslon, DM Sans, JetBrains Mono (bundled via `@fontsource`).
- **The curse** (`curse/`): one number 0…1 as `--curse`. Light cards darken a little up to 0.5,
  then the lights go out (near-black, light text, contrast ≥ 4.5:1 measured). The sky on the
  mountain goes dusk then night and the U-sun turns sickly; vignette, grain, the logo shivers.
- **Lime is the infection.** Blood red only from X on.
- **Zalgo**: seeded, deterministic, breathes, may spill past the card.
- **Ghost text** "not a cult": on the canvas, on the mountain, on the stone between the cards.
  Its density follows the curse, so it's mostly seen mid-flight.
- **Flip = absolution** (live "before" → static "after"). **Chisel = doctrine changed** (II, IX).
- **Relics**: real pages as aged manuscripts, short verbatim quotes, the camera zooms to passages.
- **Painted in code, not generated.** No illustrations from an image pipeline. Mount Bellissima is
  a real landscape, ray-marched by a fragment shader (`components/mountain/paint.js`): the meadow
  with its trail, flowers and boulders, the valley and its lake, the massif, forests, far ranges,
  cumulus. It's baked into three pictures (day, dusk, night: `public/assets/mountain-*.jpg`) that
  cross-fade with the curse, down to stars and a sickly U-sun. The hiker and the signpost are
  vector on top (the camera goes right up to his face) and stand IN the picture: same camera, same
  light, their shadows cast by the painting. The hiker holds the real tablets card. The tablets
  are stone slabs painted at load by a small shader (`components/stone/slab.js`): relief lit from
  the top left, a worn bevel, cracks, lichen, their own thickness and shadow; the letters are
  engraved (a dark cut with a lit lip), and each commandment has an engraved VIOLATION / OBEDIENCE
  emblem.
- **Pictures, not live vectors, for anything big.** The landscape and the slabs used to be SVG
  and were re-rasterised on every frame of a zoom: round the tablets that was most of the frame
  rate (20 fps where it's now 50–60). An `<img>` is one quad. What stays vector on the mountain is
  hidden while the camera is too far in to see it (`<Detail :to>` in `scenes/Revelation.vue`). And
  no filters on anything live: a blur scales with the camera and re-renders every frame of a flight.
- **Umbraco's own UI** (`@umbraco-ui/uui` 2.0.2, the version the 18.2 backoffice runs) for
  everything that shows the backoffice without being it: the "after" trees, the warehouse, the
  reveal's chrome. Zoomed up with CSS `zoom` (sized for a 14px UI).

## The world (`world.js`)

The talk lives inside the revelation:

```
 title  why  disclaimer  [ MOUNT BELLISSIMA ]  bonus  thanks        (all at the mountain's size)
                          └ the tablets card, in the hiker's hands (he holds the real thing)
                              └ I–V and VI–X, each set into its carved line
                                  └ sub-scenes on the stone beside it (or inside: VII's code
                                    sits at the root of the tree it walks)
                         [ DEMO TIME ]  the pit below the mountain (the demo shares its spot)
 the reveal: an outer layer round all of it
```

Nesting is geometry only (`nest()` without `parent`), so every card can still turn over and join
the formation and the hand. Cards set into others fade in as the camera comes close
(`InlaySlide.vue`), so from further out you only see the carving. Commandment cards come out at
about scale 1; the mountain is 36×.

## Systems (deck components)

| File | What it is |
|---|---|
| `curse/curse.js` | the dial: per-scene `curse` / `cleanse` / `sins`, follows the camera, high-water mark (flying back shows old cards infected), drift 0.02/min capped at the next value. The page (`--curse`, zalgo, ghost text) hears of it in few steps: a small rise lands whole as the flight sets off, a big change (the cleanse) in quarters, because every change of `--curse` restyles the whole document (~50 ms); only the mountain's time of day follows the flight all the way. Keys: C purify, + / − nudge, S snap to the script, R resets it |
| `curse/sins.js` | the sin bridge: polls `/umbraco/sinners/status` (2 s, 10 s while down), listens for the Board's `postMessage`; curse = mean over the ten of remaining ÷ most seen |
| `curse/CurseLayer.vue` | `layers.stage`: `--curse`, vignette, grain (a tile of noise made once: as an SVG turbulence filter it was recomputed every frame), the absolution flash and chisel sound (WebAudio), the reset (R, ↺: daylight, the demo site back to maximum sin via the rig, and the Penance Board's own progress forgotten: `sins.js` forgetBoard, as its "0" reset does), copies the deck's position into `state.js` |
| `curse/Zalgo.vue` + `zalgo.js`, `curse/GhostText.vue` + `scrawl.js`, `curse/GhostWorld.vue` | zalgo (the marks: `zalgo.js`); "not a cult" (CSS on `--curse`, seeded; each phrase is a small picture of the text from `scrawl.js`, because text is rasterised again at every zoom step and there are a few hundred of them; hidden wherever it can't be seen); the canvas's own (`layers.under`) |
| `components/BackofficeSurface.vue` + `LiveUmbraco.vue` | ONE live backoffice (`layers.over`), boots with the deck, travels between hosts, `tour` per step (a scene that visits other cards' slots: built for a lap of honour that has been cut, unused now), `byStep` (other settings from a build step on: the demo's route, keys and theme), hides on flips, the formation, the hand and outer layers; Umbraco's own theme, set through its theme context: its light theme everywhere, until the demo's first press sets the Sinners package's level 10 (fire and brimstone) and leaves the level to the Penance Board (never inline colour variables: they beat every theme; a theme is set once when asked for, not on every page load, so the demo's exhibit pages keep the board's current level); a `highlight` in a `byStep` entry puts a spotlight on something in the backoffice (`components/spotlight.js`: `{ selector, text, label, all, expand }`, shown as a popover so it sits above Umbraco's modals; a tree it opened closes again when it goes); a curtain in the backoffice's own colour covers the card while one of its pages loads (the demo's exhibits are full page loads: white page, light shell, then the theme) and lifts when the new page wears the same theme, 4 s at most; sandboxed so it can't navigate the deck's tab |
| `components/InlaySlide.vue` | a card set into another: fades in by zoom |
| `components/paint/` | `gl.js`: a one-shot WebGL2 painter (a fragment shader in, a picture out as a blob URL; shaders compile in the background, heavy ones paint in time-sliced bands; several pictures from one run) and `hold.js` (painting waits while the camera flies) |
| `components/stone/` | the stone kit: `slab.js` (a slab painted at load: the 2D canvas draws the chipped outline, its soft bevel profile, cracks and pits as a mask; the shader lights it as relief and adds the weathering, the thickness and the shadow), `outline.js` (chipped outlines), `StoneSlab.vue` (shows the picture, a plain cut until it's there; the curse on it), `StoneTablet.vue` (a commandment's tablet: seal, title, King James line with on-stage corrections, engraving), `Emblem.vue` + `EmblemArt.vue` + `shapes.js` (the engravings, drawn as line art, cut as lip + groove) |
| `components/mountain/` | `paint.js` (Mount Bellissima's shader, its camera and what casts shadows in it; **the pictures are files**: after changing the shader, open `http://localhost:5180/?repaint#revelation/0` for a look, `?repaint&save` to write `public/assets/mountain-{day,dusk,night}.jpg`; it isn't painted at load because a shader that size takes Direct3D 10 s or more to compile the first time, with the page frozen), `Hiker.vue` (the hiker: 4.2 m into the picture, palms under the tablets card), `scene.js` (the U-sun and its rays) |
| `components/StoneTablets.vue`, `Manuscript.vue`, `PitfallsRelic.vue`, `UuiTree.vue`, `Commandment.vue`, `Evidence.vue` | the pair of tablets (tiny-text phase, then the ten carved in), the aged manuscript, the shared Pitfalls relic, a UUI tree, the commandment layout, … |
| `state.js`, `world.js`, `rules.js`, `components/relics.js` | the deck's position for scenes; the layout; the ten as carved, as said, and the King James lines (with the chisel's corrections); the passages the relic zooms hit |
| `start.mjs` | `npm run dkfestival`: site + deck, plus the rig on :5181 (the deck's reset, R or ↺: stop site, `reset.ps1`, start). The save-me: `npm run dkfestival -- --demo 8` takes over a run that is stuck, resets the site only if VIII or later is already absolved (`--reset` forces it), and opens the deck at `/?ff=8#demo/2`, where the board absolves I–VII by itself and stops on VIII; `--dry-run` says what it would do |
| `vite.config.js` | the proxy to the site keeps its connections alive on both legs (a keep-alive agent, hop-by-hop headers dropped, 2 min idle): without that every backoffice request cost a new local port, and mid-demo the laptop ran out of them (the browser hung with both servers fine) |
| `vite.config.js` | proxy `/umbraco`, `/App_Plugins` → the demo site, `/__rig` → the rig; `customElements: ['uui-']`; dev only: `PUT /__paint/<name>.jpg` saves a painted picture into `public/assets/` |

**Engine candidates** (Kaspar decides): the curse dial (a per-scene value tweened along the flight:
mood, colour temperature, music volume); `state.js` (scenes can't import `useDeck`); InlaySlide
(cards set into cards by geometry: could be an engine `inlay: true`); GhostText (seeded scatter on
a CSS variable); the travelling live surface with per-step tours; `LiveUmbraco`'s key modes.
Already done in the engine for this deck: `layers`, a deck's own Vite config (now with
`customElements`), and `check` understanding inlays and wrapper components.

## Running it

**`npm run dkfestival`** starts the demo site (unless it's up), waits, then the deck on
http://localhost:5180 (`-- --no-open` to not open a browser). Ctrl+C stops both. The site signs
you in by itself (`Sinners:AutoLoginEmail`). Before a rehearsal: R in the deck (or
`reset.ps1 -Version 18.2.1` by hand) for maximum sin. The site needs `Sinners:SeedSins = true` in
its dev settings for VII and VIII to have sins (the warehouse and the planted partial).

By hand: the site in `Umbraco.Community.Sinners/Umbraco/18.2.1` (`dotnet run`, with
`BackOfficeHost = http://localhost:5180`, `Global:TimeOut = 1.00:00:00`, `KeepUserLoggedIn`), then
`npm run deck -- dev umbracommandments --port 5180 --strictPort`.

## Sharing it

The talk has its own repository, [umbdkfestival-2026-talk](https://github.com/kasparboelkjeldsen/umbdkfestival-2026-talk)
(private until the day of the talk; the QR code on the last scene points at it). It holds a copy of
the engine, this deck, the Sinners package and the demo site, so `npm install` and
`npm run dkfestival` work in it by themselves, plus `dist/umbracommandments.html`, the deck in one
file.

**`npm run share-dkfestival`** (`share.mjs`) refreshes a checkout of it beside this repository from
this one and from `../Umbraco.Community.Sinners`, and compiles the one-file deck into it. It leaves
that repository's README, LICENSE, `.gitignore`, lock file and demo site (`sinners/Umbraco`) alone,
and commits nothing: look at `git status` there, then commit and push. `start.mjs` looks for the
site in `sinners/Umbraco/18.2.1` inside the repository first, then beside it.

A built deck (`build`, `compile`) has no proxy and so no live backoffice (`STATIC` in
`components/evidence.js`): the travelling surface stays away, the evidence cards without screenshots
and the demo card say what was there, and the sin poll doesn't run.

## Scenes

| # | id | curse | What |
|---|---|---|---|
| S1 | title | 0 | |
| S2 | why | 0 | about me + why, merged: lost knowledge |
| S3 | disclaimer | 0.02 | one-frame flicker on "definitely not cursed" |
| S4–5 | revelation | 0.05 | Mount Bellissima (painted; day, dusk and night follow the curse); step: zoom onto the tablets in his hands; once it lands the right one rewrites itself |
| S6 | tablets | 0.06 | the tiny text crumbles, the ten are carved in, line by line |
| S7 | c1, c1-demo | 0.08–0.1 | I + the composition demo, built in UUI (7 steps: highlight the document type, its Body, the page; data type swap keeps the blocks; composition swap warns, then deletes them; highlight the history) |
| S8 | c2, c2-types | 0.15–0.17 | II; steps: Page, Block, Data, Composition highlighted in turn; zoom on the tablet; chisel six→four, seven→five; back out; Repository ascends; doc types live (one press: a spotlight on Clean's document type folders) |
| S9 | c3, c3-types(-after), c3-media(-after), c6-dict(-after) | 0.22–0.28 | III (4 steps: its four lines highlighted in turn) + three flips (live → UUI "after"): data types on the right, media and the dictionary stacked on the left; each live card takes one press before it turns: a spotlight on the loose data types, the loose files, the parentless keys |
| S10 | c4, c4-code(-clean) | 0.3–0.33 | IV, CORS rots; flip messy → clean Program.cs |
| S11 | c5 | 0.38 | V, "production" rots |
| S12 | c6 | 0.46 | VI, NogetPaaDansk rots (2 steps: the camelCase line, then the keys line, highlighted) |
| S13 | c7, c7-code, c7-tree, c7-relic | 0.56–0.6 | VII, the title rots, lights out; the tree walk; Pitfalls relic (2 zooms) |
| S14 | c8, c8-warehouse, c8-relic | 0.66–0.7 | VIII; the warehouse (3 steps); the same relic, volatile data |
| S15 | c9, c9-relic, c9-root | 0.76–0.8 | IX; chisel, then back out to the whole card; cultiv 2010 (banner, structure, the Fall); content root live (one press: a spotlight on Home) |
| S16 | c10 | 0.86 | X, "no exceptions" in blood |
| S17 | pullback | 0.92 | night, "not a cult" everywhere |
| S18 | demo-time | 1 | DEMO TIME, the ring of every card |
| S19 | demo | sins | live, nearly the whole card: lands on Settings (pure, no grain); press 1 spotlights the Penance tab (`components/spotlight.js`: a ring on anything inside the live backoffice, the rest dimmed), press 2 opens the Penance Board, which lands spotless (Umbraco's light theme, ten green ticks, 0 sins) and about two seconds later falls to maximum sin by itself (the package's descent: lights fail, fire, hellscape; the deck's grain waits for the board's `hell` message, `sins.hell`) and the clicker drives it; every fix press first shows mock mouse pointers clicking the buttons it stands for; on IX's Content exhibit the first three presses are refused (the page says NO and turns one Welcome card each), the fourth lights the spotlight: each exhibit page takes one press for its spotlight (the board's own clicker script, in the Sinners package) and one to go back; I, II, III and IX come back to the same page after their fix (I: the property that was inherited from a composition is the document type's own); exhibit pages wear the board's current sin level, and a curtain hides each page load; the package's easter eggs run while sins remain: about five seconds after the board opens the avatar top right shakes, swells and becomes a pentagram; tree names and buttons flicker; on VII's exhibit a ghost comment types itself after the sinful lines (about nine seconds); on IX's exhibit the Welcome dashboard turns (about ten seconds: wait for it); when the board's script is over (the press after X's fix; Esc any time) the clicker is the deck's again and that press flies to the recap |
| S21 | recap | 0 | both tablets in daylight, bigger text |
| S22 | bonus | 0 | drawn from a hand of every card |
| S23 | reveal | 0 | outer layer: the talk is a dashboard in the backoffice (drawn like the real Settings section); press 1: it all falls apart, chrome and cards, `curse/fallApart.js` |
| S24 | thanks | 0 | QR, uncursed; it rises back up out of the fall as the camera flies in |

**Compressible** (tagged CUT OK in the notes): S5 (one press), S9b, S13a, S14a.

## Assets needed

- Nothing. The mountain, every tablet and the composition demo are made in code (the mountain's
  three pictures are in `public/assets/`, painted by its own shader: see `components/mountain/`
  above); the photos left are the about-me picture, the procession, and the fallback screenshots
  under the live cards.

## Open questions (for Kaspar)

- Slot length: ~2,200 spoken words ≈ 17 min, plus the demo and flights: ~30–35 min. The CUT OK
  beats save about 2–3 min with their flights and animations.
- "Launched at Codegarden last year" (disclaimer): still accurate for #NotACult?
- The v8 Pitfalls opener "This section is ultra important!": not verified (the old URL redirects,
  the archive was unreachable from here). The current page's quotes on the relic are verified.
- Is Sebastiaan in the room? (optional line in `c9-relic`)
- Doctrine vs the repo: `commandments.md` and `gospel.md` still have the old ten. Different now:
  3 (was "no custom data type at the data-type root", now the bare root + folder-holds-nothing, absorbing
  old 7's folder clause and old 8's media), 6 (now also translation keys, old 7's naming half),
  7 (was translation keys, now "views render; they don't search"), 8 (was media in folders, now
  "Umbraco is not your database"), and 2's wording (commandments.md says "4 document types",
  the talk says content types). The package itself already follows the new numbering.
- IX: Seek Root Sanctuary leaves the count at 1 until the nodes are moved by hand, so the curse
  never quite reaches 0 in the demo (the recap cleanses anyway).
