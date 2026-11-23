# Umbraco.Community.Sinners

### The 10 UmbraCommandments — a conference talk that escaped containment

This is a **development-time Umbraco 18 package** (built against 18.2.1) made as the live demo
for the talk *"The 10 UmbraCommandments"*. It audits your Umbraco installation against ten
opinionated architectural rules on a **Penance Board** dashboard in the Settings section,
judges you, and offers to absolve your sins — one clicker press at a time.

It is a sermon delivered as software. It is not a product.

The talk itself (the slides, a demo site with every sin planted, and one command that starts both)
is in [umbdkfestival-2026-talk](https://github.com/kasparboelkjeldsen/umbdkfestival-2026-talk). The
slides are made with [can-present](https://github.com/kasparboelkjeldsen/can-present).

---

## ⚠️ Thou shalt not run this anywhere that matters

Read this part twice:

- **A web request can edit your `.csproj` and rewrite your `Program.cs`.** On purpose.
  For comedy. On a stage. If that sentence didn't make you close the tab, you're our kind of sinner,
  but you still shouldn't install it.
- It **moves your document types and data types around**, creates folders, strips
  `AllowedAsRoot`, folds composition properties into page types, and saves every affected
  content node as a draft while doing it.
- It hijacks PageDown, PageUp, the arrow keys, `.`, Escape and the number keys across the
  whole backoffice, so a presentation clicker can drive the demo. Typing in a text field
  while it's installed is a penance of its own.
- With `Sinners:AutoLoginEmail` set (Development only, local requests only) it **logs you into
  the backoffice without a password**, every time the login page shows up. That's the point:
  the demo is always logged in. It is also exactly what it sounds like.
- The **Exodus** (commandment VIII) exports content to JSON and then **deletes those nodes**
  and prunes old versions. With `Sinners:SeedSins` on it also plants hundreds of nodes at boot.
- `GET /umbraco/sinners/status` answers **without authentication** (Development only, local
  requests only), so the talk's deck can poll it.
- It is deliberately **not** on NuGet and **not** tagged for the Umbraco Marketplace,
  and it never will be. The only way it gets into a solution is if you put it there
  with your own hands, knowing exactly what it is.

Use it on a throwaway site. Steal ideas from it. Laugh at it. Do not deploy it.

## The Ten UmbraCommandments

The talk's numbering (it differs from [commandments.md](commandments.md) on purpose):

| # | Commandment | What the Board audits | The fix |
|---|---|---|---|
| I | Content is not composable | BlockList/BlockGrid/RichText on compositions | **Fold In** (value-preserving) or **Bless** |
| II | Four content types: Page, Block, Data, Composition | Every document type classified and in its root folder. Neither more nor fewer shalt thou count, for five is right out | Classify + auto-categorize into folders |
| III | The root is bare, and a folder is only a folder | Data types loose at the root · media items at the media root · dotted dictionary keys at the root without a parent | Data types auto-organized, no mercy · keys grouped under a folder-only parent · media: ✨ *pretend it's fixed* ✨ |
| IV | Compose in your IComposer, not Program.cs | `UseUmbraco()` saved in a variable, extra middleware or endpoints | One-click cleanse |
| V | A production site runs in production mode | Five settings in `appsettings*.json` | Bless the missing settings |
| VI | Thy names: aliases English camelCase; translation keys PascalCase, dot-separated | Hunspell-verified, no `nogetPaaDansk` | Bless the false positives |
| VII | Views render; they don't search | `.Descendants(`, `DescendantsOrSelf(` and `@inject IContentService` in `Views/**/*.cshtml`, one sin per line | **Confess** (the Board shows file, line and code; code can't be fixed from a web request) |
| VIII | Umbraco is not your database | A parent with more than 500 children of one type, a node with more than 100 versions | **Exodus**: export to JSON, delete the children, prune the versions |
| IX | A root node is not a rendering node | Root nodes whose type has a template | Seek Root Sanctuary: a templateless `siteRoot` type in `Pages/Roots`, a published "Site" node per site, and the site moved in. Still published, and still at `/` (a site without hostnames gets the relative domain `/`) |
| X | uSync when not on Umbraco Cloud | No uSync or Umbraco.Deploy in the csproj | ✨ Also pretend ✨ (a real csproj injection, see warning above) |

There used to be six sacred types. Umbraco 18's Library took up the burden of the
Repositories, and they ascended. We do not mourn them; we count to four.

The full doctrine lives in [commandments.md](commandments.md), the slide headlines in
[gospel.md](gospel.md), and the original pre-repentance design in [spec.md](spec.md)
(a historical document — see its header for how far we strayed).

## The presenter rig (the part you actually cloned this for)

The whole demo runs on one button: the "next" button of an ordinary presentation clicker.
There is no on-screen rig, so the backoffice looks like plain Umbraco from first press to last.

| Key | What it does |
|---|---|
| **PageDown** / **→** (clicker next) | The next beat of the demo (see below) |
| **PageUp** / **←** (clicker back) | Nothing, on purpose. A misclick can't undo a fold-in |
| **`.`** (the clicker's blank button) | Exhibit the sin (on the Board) / return to the Board (anywhere else) |
| **Escape** | Nothing (swallowed, so a clicker's Esc can't close the exhibit you're showing) |
| `1` · `2` · `3` · `4` | Laptop fallback: next fix step · next commandment · exhibit/return · reload |
| `0` | Full demo reset: forget progress, back to the Board |

**Next** walks one script per commandment, I to X: *exhibit the sin* (jump to where it lives
in Umbraco), *a spotlight on it* (a lime ring round the thing the page is there to show, the rest
dimmed: a mouse cursor is no use on a projector), *return to the Board*, *each fix step*, *next
commandment*. The Board itself arrives spotless (ten green ticks, 0 sins) and falls to its real
state a moment later, with fire. Before a fix runs, mock mouse pointers fly in and click the
buttons it stands for, so a room sees that the fix is something the backoffice lets you do by
hand. Some fixes get an exhibit of their own afterwards (the same property after Fold In, no longer
"Inherited from" a composition, the folders Auto categorize made,
the dictionary keys under their new parents), with a spotlight too. III has three sins and
walks them one at a time: the loose data type → organize, the flat dictionary → group, the
media root → ✨. VII exhibits the sinful partial in the backoffice's partial view editor, VIII
the "Form submissions" collection. Commandments with nothing to exhibit (IV, V, VI, X) go
straight to their fixes. Off the Board, next always means "take me back to the Board". After
the last fix on X, next tells the talk's deck the script is over (`end`, see the sin bridge), so
the deck can take the clicker back. The keys work even with a text field focused, because
exhibit pages autofocus their name field.

While any sin is left, Umbraco itself is a little possessed (`penance/haunt.ts`): names in the
trees flicker into something else for a second (Recycle Sin, Tongues, Dismember Types), a few
buttons too (Save and perish), and the "Welcome to Umbraco" dashboard in Content turns, card by
card, about ten seconds after you arrive: a pawn that ran out of options, a webinar stage its
speaker has walked off ("where did he go?"), a keynote with three empty stools, and the community
photo with a rabbit that has seen things. Umbraco's news feed decides which cards there are that
day; a picture card the package has never seen goes dark and says so. The "A" of your avatar, top right, shakes,
swells and becomes a glowing pentagram about five seconds after the Board first opens (and a
letter again at zero sins), and in VII's partial view a comment nobody wrote types itself after
the lines that walk the tree. Nothing is changed for good, it all stops at
zero sins, and `localStorage.setItem('sinners-eggs', 'off')` switches it off without a build.

Progress lives in `sessionStorage`, so the full-page jumps between the Board and the
exhibits pick up where they left off. And should a demo die halfway: set
`sessionStorage['sinners-fast-forward']` to a commandment's number and open the Board. It
absolves everything before that commandment by itself and stops there (the talk's deck does this
for `npm run dkfestival -- --demo 8`). If the clicker dies, the fallback is walking over to
the laptop and pressing a number.

## Blessings live in a file

**Bless** ("this is fine, I accept this sin") is a decision, and decisions belong in source
control. Every blessing (I's composition properties, V's settings, VI's aliases and
translation keys) is written to `sinners.blessings.json` in the site's content root
(`Sinners:BlessingsPath` to move it), not to the database. Pretty-printed, every section always
present, values sorted, LF line endings, so `git diff sinners.blessings.json` on stage reads
like a confession:

```json
{
  "I": {
    "rule": "Content is not composable",
    "compositionProperties": [
      "contactForm.errorMessage"
    ]
  },
  "V": { "rule": "A production site runs in production mode", "settings": [] },
  "VI": { "rule": "Thy names", "aliases": [], "translationKeys": [] }
}
```

`reset.ps1` deletes it. (The old `Sinners*Blessing` tables are still created by the migrations
but no longer read.)

## The sin bridge (for the talk's deck)

The deck shows the backoffice in a same-origin iframe and keeps its own sin counter. Two halves:

**`GET /umbraco/sinners/status`**: anonymous, but only in Development and only for requests from
this machine (the same guard as the auto-login; the deck's Vite proxy counts). Added as an
Umbraco pipeline filter, so Program.cs stays sinful. `Cache-Control: no-store`; the server
caches the counts for 1.5 s and drops that cache on every Sinners API call that changes
something, so it's cheap to poll every couple of seconds and never stale after an action.

```json
{
  "commandments": [
    { "number": 1, "title": "Content is not composable", "sins": 5, "pretended": false, "blessed": 0 },
    …all ten…
  ],
  "total": 112
}
```

`sins` is what is still unabsolved: blessed, confessed and pretended-away sins don't count.
`pretended` is true while a ✨ fix is holding the commandment up (III's media root, X's uSync).
`blessed` counts blessed items that would otherwise be sins. A commandment that fails to count
reports `sins: -1`. Before the install has finished the endpoint answers 503.

**`postMessage`**: when the Board runs framed, it posts to `window.parent` (target origin
`location.origin`):

- `{ source: 'sinners', type: 'board' }` when the Penance Board mounts
- `{ source: 'sinners', type: 'absolved', commandment: 1-10, action, pretended }` after every
  absolving action has finished on the server, so a re-poll already sees it. Actions:
  `fold-in`, `bless` (I, V, VI), `classify`, `auto-categorize` (II), `organize-data-types`,
  `group-dictionary`, `pretend-media` (III, `pretended: true`), `cleanse-program-cs` (IV),
  `confess` (VII), `exodus` (VIII), `root-sanctuary` (IX), `pretend-usync` (X, `pretended: true`).
  Unblessing posts nothing.
- `{ source: 'sinners', type: 'end' }` when next is pressed with nothing left in the script
  (every step of X done), and again on every further press: the deck takes the clicker back

## Running it (on something you do not love)

1. Clone. Scaffold a throwaway Umbraco 18.2.1+ site under `Umbraco/<version>/` (SQLite,
   unattended install, the [Clean starter kit](https://www.nuget.org/packages/Clean) gives
   you beautifully sinful content to fix). Add a `ProjectReference` to
   `Umbraco.Community.Sinners.Backend` — see `CLAUDE.md` for the exact wiring, including
   the target that copies the frontend bundle into `App_Plugins`.
   In the site's `appsettings.Development.json`, set `"Sinners": { "SeedSins": true }` so
   commandment VIII has something to lead out (and `AutoLoginEmail` if you want the stage rig).
2. Run `.\reset.ps1 -Version <version>` — deletes the site's `umbraco` data folder and
   `sinners.blessings.json`, strips uSync from the csproj, vandalizes `Program.cs` with a
   zalgo-cursed variable and plants `Views/Partials/megaMenu.cshtml`, a mega menu that walks
   the whole tree (VII). Maximum sin, reproducibly.
3. `dotnet build`, boot, log in, go to **Settings → P̸e̷n̴a̵n̸c̶e̷**. On the first boot the seeder
   plants its sins in the background (~20 s): three media items loose at the media root for III
   ("final-final-v2.jpg", "Brochure 2019.pdf" and "logo"), and for VIII a "Form submissions"
   collection with 600 submissions and a "Visitor counter" published 120 times.
4. Press `0` and confess.

Thresholds for VIII: `Sinners:ExodusChildThreshold` (500) and `Sinners:ExodusVersionThreshold`
(100); the seeder plants threshold + 100 children and threshold + 20 versions. Exodus exports
land in `umbraco/Data/sinners-exodus/` (`Sinners:ExodusPath`), which the reset wipes.

Frontend dev loop: `npm run build` in `Umbraco.Community.Sinners.Extension/`.

## FAQ

**Can I use this in production?**
No.

**But what if—**
No.

**It found 46 sins in my project.**
That is not a question. Seek sanctuary.

**Is the fold-in safe?**
It preserved every content value in testing, saves drafts only, runs in one transaction (all
of it or none of it), and was built in two days for a talk. You already know the answer.

**Didn't this used to be voice-controlled?**
It did, for one trial run. Shouting at a laptop turned out to be less fun than it sounds.
The clicker won. We do not speak of the walrus.

---

## License

[MIT](LICENSE).

*Built for the talk. Blessed by no one. `git blame` knows what you did.*
