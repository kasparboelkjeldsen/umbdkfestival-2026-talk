# Umbraco.Community.Sinners

Dev-time Umbraco package for a talk: "The 10 UmbraCommandments". Enforces opinionated architectural rules in the backoffice.

## Target

- Umbraco 18 — `net10.0` single target, no multi-targeting, no version guards. Backend references `Umbraco.Cms` `[18.2.1,19.0.0)` (compiles against 18.2.1, the latest stable as of Oct 2026); frontend `@umbraco-cms/backoffice` 18.2.1. Umbraco 17 is no longer supported (the doctrine is Library-era anyway).
- Test sites live under `Umbraco/` (local, not in this repo). Current demo target: `18.2.1/` (Clean 8.0.1 starter kit, uSync 18.1.5 in its props, admin@example.com / 1234567890, https://localhost:44343, http on 8699 is rejected by the backoffice login). It was created by copying `18.1.1/` (the 18.2.1 project template only differs in version numbers); older `17.x/` and `18.1.1/` folders may still exist locally but aren't in the solution.
- The site consumes Sinners via ProjectReference; a `CopySinnersUiAssets` target in its csproj copies `Backend/ui/**` into `wwwroot/App_Plugins/umbraco.community.sinners.frontend/` on every build.
- **Demo reset ritual**: `.\reset.ps1 -Version 18.2.1` (deletes `Umbraco/18.2.1/umbraco` data folder — DB, pretences, confessions, Exodus exports — and `sinners.blessings.json`, strips uSync from csproj/props, overwrites Program.cs with the zalgo sin, writes the Rule VII sinner `Views/Partials/megaMenu.cshtml`) → `dotnet build` → boot (unattended install + Clean import, ~90s; then `DemoSinSeeder` plants III's root media and VIII in the background, ~20 s) → press `0` in the backoffice (clears browser demo state and the server's media pretence). No manual upload any more: the seeder puts three media items at the media root. Run it with the PowerShell tool, not `powershell -ExecutionPolicy Bypass` (blocked).
- The 18.2.1 site's local `appsettings.Development.json` sets `Sinners:SeedSins = true` (reset.ps1 warns when it's missing).
- Umbraco 18 auth note (for scripted Management API access): tokens are redacted into encrypted HttpOnly cookies (`__Host-umbAccessToken` etc.). Send `Authorization: Bearer [redacted]` (literal) plus the cookie jar — middleware substitutes the real token. Access tokens expire in ~5 min.

## Solution structure

```
Umbraco.Community.Sinners.Backend/   # C# package
  Composers/        # IComposer registrations (AutoLoginComposer adds both stage-rig middlewares)
  Controllers/      # Management API controller (SinnersManagementApiController) + InvalidateSinStatusAttribute
  Middleware/       # AutoLoginMiddleware (always logged in) + SinStatusMiddleware (the deck's sin bridge), dev + loopback only
  Dictionaries/     # Embedded Hunspell en_US.aff + en_US.dic (for Rule VI)
  Migrations/       # AsyncMigrationBase migrations + PackageMigrationPlan
  Models/           # NPoco DTOs
  Services/         # Business logic, one service per audit, plus BlessingStore, PenanceStateStore,
                    # SinStatusService (+ SinStatusCache) and DemoSinSeeder

Umbraco.Community.Sinners.Extension/ # Frontend package (Vite + Lit)
  src/
    index.ts                         # Entry point: registers manifests via onInit, listenForClicker()
    penance/
      penance-dashboard.element.ts   # The board's shell: title, verdict, sin tally, a row of ten tiles, the panes below
      presenter.ts                   # Clicker script: exhibits (+ what each one spotlights), steps per tab/part, sessionStorage state
      spotlight.ts                   # The ring an exhibit page gets on its first press
      pointer.ts                     # Mock mouse pointers that click a fix step's buttons before it runs
      descent.ts                     # The Board's fall from spotless to maximum sin (lights fail, fire)
      haunt.ts                       # Easter eggs while sins remain: Welcome dashboard, whispering tree names, cursed buttons, pentagram avatar, ghost comment
      bridge.ts                      # postMessage to the deck (absolved / board)
      commandments/
        content-not-composable.element.ts  # I
        four-sacred-types.element.ts       # II
        data-types-in-folders.element.ts   # III (part data-types)
        translation-audit.element.ts       # mode="grouping": III (part dictionary); mode="naming": VI (part keys)
        root-media.element.ts              # III (part media, the ✨ pretend)
        program-cs-clean.element.ts        # IV
        production-settings.element.ts     # V
        alias-audit.element.ts             # VI (part aliases)
        views-confession.element.ts        # VII
        exodus.element.ts                  # VIII
        root-content.element.ts            # IX
        usync-audit.element.ts             # X
```

## Architecture conventions

### Backend
- Controllers extend `ManagementApiControllerBase` (from `Umbraco.Cms.Api.Management.Controllers`).
- Route prefix: `umbraco/management/api/v{version:apiVersion}/sinners`.
- Migrations use `AsyncMigrationBase` with `MigrateAsync()` override.
- Migration plan uses `PackageMigrationPlan` from `Umbraco.Cms.Core.Packaging` with `DefinePlan()`.
- Register migration plan: `builder.PackageMigrationPlans().Add<SinnersMigrationPlan>()`.
- DB access via `IScopeProvider` + NPoco (`scope.Database.Fetch<T>()`, Insert, Update, Delete).
- Document type containers/folders: inject `IContentTypeContainerService`, call `GetAllAsync()`. **Do NOT use** `IEntityService.GetAll(UmbracoObjectTypes.DocumentTypeContainer)` — throws `NotSupportedException` in v17.
- Moving content types between folders: `IContentTypeService.MoveAsync(contentTypeKey, containerKey)`.
- Saving/updating content types: `await contentTypeService.UpdateAsync(item, Constants.Security.SuperUserKey)` — `Save()` is obsolete in v17.
- Deleting content types: `await contentTypeService.DeleteAsync(key, Constants.Security.SuperUserKey)`.
- Getting a data type: `await dataTypeService.GetAsync(Guid key)`.
- Property group types: `PropertyGroupType.Group` (= 0) and `PropertyGroupType.Tab` (= 1), in `Umbraco.Cms.Core.Models`. When adding a property to a page type that composes a group with a given alias, **the group type must match** or Umbraco throws `InvalidCompositionException`. After `AddPropertyType(prop, groupAlias, groupName)`, find the group and set its `Type` to match the composition's group.
- Creating a new property type from an existing data type: `new PropertyType(IShortStringHelper, IDataType)`, inject `IShortStringHelper`.
- `IContentService.GetPagedOfType` — interface signature has non-nullable filter but implementation accepts `null!`.
- Getting root media items: `IMediaService.GetRootMedia()` (synchronous).
- Dictionary (translation) items: `IDictionaryItemService`. Key methods:
  - `GetDescendantsAsync(null)` — returns ALL dictionary items flat (null parentId = all)
  - `GetAtRootAsync()` — root items only
  - `CreateAsync(new DictionaryItem(parentId, itemKey), userKey)` — create item
  - `MoveAsync(item, parentGuid, userKey)` — re-parents without changing `ItemKey`
  - `IDictionaryItem.Key` = Guid identifier; `.ItemKey` = string key (e.g. "Article.By"); `.ParentId` = Guid?
- `IWebHostEnvironment.ContentRootPath` for locating `Program.cs` and `appsettings*.json`.

### Frontend
- Framework: Lit 3 web components, TypeScript, bundled by Vite.
- Context: `UmbElementMixin` + `consumeContext(UMB_AUTH_CONTEXT, ...)` for auth token.
- Authenticated fetch: `authCtx.getLatestToken()` → `Authorization: Bearer <token>`.
- Dashboard registered programmatically in `onInit` with `element: PenanceDashboardElement` (class ref, not string) — avoids URL module import error.
- **One file per commandment** under `src/penance/commandments/`. Each is a self-contained custom element with its own styles, state, and API calls. `penance-dashboard.element.ts` is a thin shell that imports and renders them.
- **Sized for a projector** (the Board is shown framed in the talk's deck, on a big screen): the shell's own chrome is set large — title 38px, the verdict line 24px, the total sin tally 62px (sum of every part's `issueCount`, shown once all parts have reported), and the tabs as a row of ten tiles (`grid-template-columns: repeat(10, 1fr)`, Roman numeral + count badge; the tab's full label is the tile's `title` and the heading of its pane; `.absolved` rings a kept commandment). The panes are drawn at a 12–13px UI size and scaled as a whole with `zoom: 1.6` on `.tab-content`, so **a pane has about 740 CSS px of width** in the deck's frame: no fixed column wider than ~170px, and nothing under 12px. `.tab-content` also sets `--uui-type-h5-size` (the `uui-box` headline, i.e. the commandment's name) and the box paddings. To change how big it all is, change that one `zoom`.
- **Text on the theme's bright fills** (danger / positive badges, tags, banners) uses `color: var(--sinners-on-bright, white)`: the spooky themes set it dark from level 5 up, where those fills turn fiery orange and sulphur yellow and white stops reading. Amber (`#f0ac00`) fills take `#1d0d00`. Don't hard-code light-page colours in a pane (V's rows mix amber into `--uui-color-surface`).
- **Tab layout**: all commandment elements always in DOM (`display:none` for inactive) so status events fire for all tabs on initial load. Do NOT use `uui-tab-group` — it has a 352px fixed shadow-DOM width that clips tabs.
- **Status events**: each commandment dispatches `sinners-status` (`{ issueCount: number, severity: 'ok' | 'warning' | 'error' }`) with `bubbles: true, composed: true`. Dashboard renders a badge per tab. Merged commandments (III: data-types, dictionary, media; VI: aliases, keys) render one element per part in the same pane; the dashboard keys statuses by part (`'III.media'`) and the tab badge is the sum (worst severity), shown once every part has reported. **The server's `SinStatusService` counts the same way** — change one, change the other.
- **The theme across page loads**: Umbraco deletes its stored theme alias on every load, because it looks the alias up before this package has registered its themes (it still applies the theme once they're registered). `keepSpookyTheme()` in `index.ts` puts the key back, so the exhibit pages and the Board both start in the level the Board last set. The Board itself doesn't touch the theme until every part has counted (`#applyTheme`): before, a freshly loaded Board went light, then level 1, 2, 3… up to its own, a flash on every return.
- **Easter eggs** (`haunt.ts`, one `haunt(host)` call in `index.ts`; `EGGS` switches each off, `localStorage['sinners-eggs'] = 'off'` all of them): active at sin level > 0, read from the theme alias. Whispers and buttons swap the `label` PROPERTY of `uui-menu-item` / `uui-button` for a second and put the attribute's value back. The Welcome dashboard (`umb-news-card`, matched by its image URL: Umbraco's news feed decides the cards and changes without notice: it swapped two of them two days before the talk. `POSSESSIONS` is the list, in the order they turn; a picture card that matches none gets `UNKNOWN` (the picture darkens, the card says it is new), a card without a picture is left alone. A card with a real person on it is never redrawn: either the whole picture is replaced by a drawn scene without them (the webinar stage, the keynote's stools) or it is a `photo` that only goes dark) gets our stylesheet and an overlay in its shadow root, and its text nodes' `data` swapped (never `textContent`: Lit's markers live there). The reveal is staged for a room (`BEAT`, `GAP`, `EYES`): once per demo run, later visits find it already turned (`sessionStorage['sinners-welcome-seen']`, cleared by `presenter.reset()` and the deck's reset). The rabbit's eyes are placed in % of that one photo. The avatar (`uui-avatar` in the header) turns with Web Animations on the element itself plus an SVG child in its slot, staged once per run (`AVATAR_BEAT`, `sessionStorage['sinners-avatar-turned']`, cleared by both resets), already turned on later pages. The ghost comment is a span appended to Monaco's `.view-line` (re-added whenever the editor redraws the line): the model, the file and Save are untouched; `GHOSTS` says after which code and what. Each egg only looks at the DOM on the pages it can be on (path checks in the tick). After a rebuild, RELOAD the backoffice page: `dist.js` has no cache headers, so a plain navigation can run the previous build.
- **Sin bridge** (`bridge.ts`): `absolved(commandment, action, pretended?)` posts `{ source: 'sinners', type: 'absolved', … }` to `window.parent` (only when framed, target `location.origin`); call it only after the server call (and the element's reload) finished, because the deck re-polls `/umbraco/sinners/status` on the message. `boardMounted()` posts `{ source: 'sinners', type: 'board' }` from the dashboard's `connectedCallback`; `scriptEnded()` posts `{ source: 'sinners', type: 'end' }` when next is pressed after the last step of X. Action ids are listed in README "The sin bridge".
- **Clicker controls** (talk controls): `presenter.ts` (state + script) and `listenForClicker()` in `index.ts` (keys). No on-screen UI: the backoffice stays vanilla, the fallback is walking to the laptop. There used to be an on-screen presenter bar and voice control; both were removed after a trial run, so don't bring them back.
  - One capture-phase `keydown` listener on `window`, `preventDefault` + `stopPropagation`, hot even with an input focused (exhibit workspaces autofocus their name field), auto-repeat ignored. PageDown/ArrowRight = `presenter.forward()`; PageUp/ArrowLeft/Escape = swallowed, do nothing (Kaspar's call: back must never undo a fix); `.` = `dot()`; fallback `1` = `next()`, `2` = `nextTab()`, `3` = `dot()`, `4` = reload, `0` = `reset()`.
  - `forward()` = one beat. Off the Board: `dot()` (return: straight to the Board, from anywhere). On the Board, per active tab: `TAB_EXHIBITS[tab]` is a list; a plain URL at position k comes right before step k, `{ url, at: n }` once n fix steps are done (so an exhibit can be the evidence after a fix) → remaining steps → `nextTab()`; on X with all steps done it posts `{ source: 'sinners', type: 'end' }` (`scriptEnded()` in `bridge.ts`, again on every further press) so the deck takes the clicker back. X's step waits for its ✨ overlay and reload before it finishes, so `absolved` always reaches the deck before `end`. One exhibit = the old order (exhibit, return, fixes, next tab, Kaspar's choice). I shows a page's document type with its property 'Inherited from' a composition, then after Fold In the same page again: the property is the type's own. II shows the document type root as Clean left it (its own folders), then after Auto categorize the same page with the four folders. III: data type → Organize → the data types in their folders → translation section → Group all → the translation section again, grouped → media collection → Pretend ✨. IX: content → Seek Root Sanctuary → content again (the new root). VII exhibits `megaMenu.cshtml` in the partial view editor (unique `megaMenu%dot%cshtml`, URL-encoded), VIII the seeded "Form submissions" collection (fixed key `DemoSinSeeder.FormSubmissionsKey`).
  - **Spotlights**: an exhibit can carry `highlight` (`spotlight.ts`: a selector, or `{ selector, text, label, all, expand, pad }`; `treeItem('Data Types', { expand: true })` is a tree item by its name, opened). On an exhibit page the first `forward()` lights it (`_lit`, false again on every page load) and the next one returns to the Board; an exhibit without one returns on the first. `dot()` (the blank button) always returns at once. The ring is a popover (top layer: Umbraco's modals are `<dialog>`s, no z-index gets above them) and looks for its target through every shadow root. One exhibit refuses first: on the Welcome dashboard (IX's Content page, first visit) `refuse()` in `haunt.ts` takes the first three presses (`REFUSALS`, whatever the feed holds: the first two turn one card each, the third turns all that are left): each makes every text on the page say NO for 0.9 s (text nodes' `.data`, put back) and turns one news card (the review, the pawn, the photo and its rabbit); with no card left to turn (or none at all: no news feed, eggs off, sin level 0) the press lights the ring. Match tree items by the `label` ATTRIBUTE: `haunt.ts` changes the `label` property for its whispers and must never touch a name a spotlight uses. The deck has the same ring for its own cards (`decks/umbracommandments/components/spotlight.js`): change the look in both.
  - **The landing** (`penance-dashboard.element.ts`, `descent.ts`): a Board that mounts on a page not yet in an Abyss theme (the first time in a demo; back from an exhibit the page arrives in the theme it left in, `keepSpookyTheme`) and finds sins shows a lie first: ten green ticks, 0 sins, "Righteous", panes hidden (`_landing = 'pure'`, `PURE_BEAT` ms from the moment every part has counted). Then `descend()`: the page flickers dark and red and shakes, a wall of fire comes up, and behind it the theme is set and the real numbers shown (the tally counts up, the verdict slams). The clicker is held meanwhile (`presenter.hold(host, on)`). It posts `{ type: 'hell' }` (bridge `hellArrived()`) when it first puts an Abyss theme on, instantly or after the fall: the deck starts its film grain on that. Not with `?debug`, not during a fast-forward, not on a clean site.
  - **Mock mice** (`pointer.ts`): a `PresenterStep` can say what a person would click (`clicks: () => Element[]`, the buttons in its pane). `presenter.next()` shows pointers flying to them and clicking (yellow halo, ripple, the button flashes; up to 6 at once, e.g. I's two Fold Ins and three Blesses, V's five Blesses, III's six Groups, II's dropdowns), then runs the step. Nothing is really clicked. A target off screen is scrolled to inside its own scroll box first, and back afterwards: never with `scrollIntoView`, which also scrolled the deck around the iframe. Not during a fast-forward.
  - **Fast-forward (the talk's save-me)**: `sessionStorage['sinners-fast-forward'] = '8'` (set by the deck when opened with `?ff=8`, which `npm run dkfestival -- --demo 8` does) makes the dashboard, once every part has counted, call `presenter.fastForward('VIII', sinsLeft)`: every earlier commandment's exhibits count as shown and its fix steps run in order if it still has sins; presses are ignored (`_busy`), a banner says so, and it ends on VIII with the key removed. A step that reloads the page is survived (the key is still there, the indices are persisted).
  - `dot()` on the Board shows the tab's next unshown exhibit (the last one again once all were shown) and counts it, so a manual `.`/`3` exhibit isn't repeated by the clicker. `next()`/`forward()` ignore presses while a step is still running (`_busy`).
  - `registerSteps(tabId, host, steps, part = 'main')` and `onNextTab(host, fn)` take the registering element; at run time the presenter uses the most recent registration whose host `isConnected`, in case the backoffice builds a dashboard twice and throws one copy away. A tab's script is its parts' steps in `TAB_PARTS` order (III: data-types, dictionary, media; VI: aliases, keys — keys has no step, Clean's keys are clean).
  - State (active tab, step indices, exhibits shown per tab) persists in sessionStorage (`sinners-presenter-state`) so full-page exhibit round-trips resume; the dashboard prefers the persisted tab over its first-sinful-tab auto-jump. `0` clears it and sets `sinners-forget-pretences`, which makes the media element `POST forget-pretences` before it loads (the pretence is server-side now).
  - **Inside the talk's deck** (can-present, `decks/umbracommandments`): the backoffice runs as a same-origin iframe through the deck's dev-server proxy (http://localhost:5180/umbraco). The deck sets `<html data-sinners-keys="off">` in the iframe while the clicker belongs to the deck; `listenForClicker` then ignores every key. At DEMO TIME the deck sets it `on` and forwards the clicker into the iframe. The 18.2.1 site's local `appsettings.Development.json` needs `Security:BackOfficeHost = http://localhost:5180` (OpenIddict rejects the proxied redirect_uri otherwise; direct login on :44343 may break while it's set), `Global:TimeOut = 1.00:00:00` and `Security:KeepUserLoggedIn = true` (the default 20-minute timeout ends the session mid-talk).
  - **Always logged in** (`Middleware/AutoLoginMiddleware.cs`, added by `AutoLoginComposer` as an Umbraco pipeline filter at `PrePipeline`, so Program.cs stays untouched for Rule IV): when `Sinners:AutoLoginEmail` is set, the environment is Development and the request comes from this machine (loopback, which includes the deck's Vite proxy), a GET of `/umbraco/login` signs that user in with `IBackOfficeSignInManager.SignInAsync(user, isPersistent: true)` and redirects to its `ReturnUrl` (local URLs only). The OpenIddict authorize endpoint then issues the code as after a normal login. Signing out works but signs you straight back in. The 18.2.1 test site sets it to `admin@example.com` in its local `appsettings.Development.json`. Verified: a cookie-less client goes authorize → login → authorize → `oauth_complete?code=…` with no credentials; a browser signed out via `/umbraco/management/api/v1/security/back-office/signout` lands back in the backoffice as admin.
  - **Sin status for the deck** (`Middleware/SinStatusMiddleware.cs`, same pipeline filter and same guard as the auto-login: Development + loopback): `GET /umbraco/sinners/status` → `{ commandments: [{ number, title, sins, pretended, blessed }] × 10, total }`, `no-store`, 503 before the install is done. `SinStatusService` computes it, `SinStatusCache` (singleton) keeps it 1.5 s; `[InvalidateSinStatus]` on the controller drops the cache after every non-GET Sinners call. VII's Views scan has its own 2 s cache. Cold ~0.3 s, cached ~20 ms.
  - Scripted API access for verification: the auto-login also works for curl. authorize (PKCE, `redirect_uri=http://localhost:5180/umbraco/oauth_complete`) → login → authorize gives `code=[redacted]` (the real code is in a cookie); POST it to `/security/back-office/token` with the same cookie jar, then call with `Authorization: Bearer [redacted]` + the jar. On Git Bash, strip `\r` from `openssl base64` output. `Security:AllowConcurrentLogins` is false, so a scripted login signs an open backoffice out (it auto-logs back in on reload).
  - Verifying in a hidden/background browser pane: rendering is throttled and a step can run before the commandment has loaded its data (it then finds nothing to fix). Force a frame (screenshot) and wait for the tab to render before pressing next.
- Build: `npm run build` in `Umbraco.Community.Sinners.Extension/`. The Backend project runs it after its own build when the Extension has its `node_modules`; without them it uses the committed `ui/dist.js` as it is (so a clone, and the talk's repository, build with .NET alone).
- `reset.ps1` reads and writes the site's project files through .NET as UTF-8, never `Get-Content` / `Set-Content`: reset by Windows PowerShell 5.1 and PowerShell 7 in turn, the 18.2.1 csproj had one dash in a comment re-encoded on every reset and grew to 330 MB.

### Spell checking (Rule VI)
- Package: `WeCantSpell.Hunspell` 7.0.1
- Dictionary files: `Dictionaries/en_US.aff` + `Dictionaries/en_US.dic` as `<EmbeddedResource>` in the .csproj
- Loaded once via `HunspellDictionary` static class (`Lazy<WordList>`, thread-safe). Both `AliasAuditService` and `TranslationAuditService` use `HunspellDictionary.EnUs`.
- `HunspellDictionary.TechAllowList` contains common tech terms (`umbraco`, `html`, `seo`, `api`, etc.) that skip the dictionary check.

## The Ten UmbraCommandments (implementation status)

The talk's numbering (Oct 2026). It differs from `commandments.md` / `gospel.md` on purpose; Kaspar updates those himself — don't touch them.

| # | Rule | What the Board audits / fixes |
|---|------|--------|
| I | Content is not composable | BlockList/BlockGrid/RichText on compositions — Fold In / Bless |
| II | Four content types: Page, Block, Data, Composition | Classify all content types, enforce root folder naming |
| III | The root is bare, and a folder is only a folder | Data types at root (auto-organize) + media at root (✨ pretend) + dotted dictionary keys at root (group under a folder-only parent) |
| IV | Compose in your IComposer, not Program.cs | No saved variable, no non-standard middleware/endpoints — one-click cleanse |
| V | A production site runs in production mode | Scan appsettings for 5 required settings — Bless |
| VI | Thy names: aliases English camelCase; translation keys PascalCase, dot-separated | Hunspell audit of content type aliases and dictionary keys — Bless |
| VII | Views render; they don't search | Grep `Views/**/*.cshtml` — Confess |
| VIII | Umbraco is not your database | Warehouses and log tables — Exodus |
| IX | A root node is not a rendering node | No root content node may bear a template — Seek Root Sanctuary |
| X | uSync when not on Umbraco Cloud | uSync/Deploy in the csproj — ✨ pretend (a real csproj injection) |

### Blessings (I, V, VI)
All Bless decisions live in `BlessingStore` (singleton): a JSON file, `Sinners:BlessingsPath` (default `sinners.blessings.json` in the content root), sections `I.compositionProperties` (`"compositionAlias.propertyAlias"`), `V.settings`, `VI.aliases`, `VI.translationKeys`. Written pretty-printed, all sections always present, values sorted ordinally, LF + trailing newline, so `git diff` reads well on stage; re-read when its write time changes. The `Sinners*Blessing` DB tables are still created by the migrations but no longer used. reset.ps1 deletes the file.

### Pretences and confessions
`PenanceStateStore` (singleton) keeps server-side demo state in `umbraco/Data/Sinners/penance-state.json` (wiped by the reset): the root media keys pretended away (III; the pretence holds while root media is exactly that set), whether X's ✨ injected uSync (`pretended` in the status while uSync is in the csproj), and VII's confessed hit signatures.

### Rule I detail
Surfaces compositions that expose BlockList, BlockGrid, or RichText. For each sinful property:
- **Fold In**: moves the property from the composition directly onto every page type that uses it, preserving all content values via a 4-step tmp-alias dance.
- **Bless**: marks a property as intentionally composable (persisted in the blessings file); chip turns green, property still shows, fold-in still offered.
- **Empty compositions**: doc types with zero property types (e.g. post-fold-in) are listed in a sub-section with a Delete button. Only shown if a composition is classified as "Composition" in Rule II. Does NOT contribute to the status badge count (it's a cleanup helper, not a rule violation).

#### Fold-in algorithm
All four steps run in ONE transaction (`TypeWriteScope.Begin()`, completed at the end; a step that fails returns without completing, so nothing is kept).
1. Add `{alias}_fold_tmp` to each page type in the same group (matching group type) as the original, with the original's description, sort order, mandatory/validation settings, variations and label position
2. Copy content values from `{alias}` → `{alias}_fold_tmp` for every node (culture-aware)
3. Remove `{alias}` from the composition
4. Rename `{alias}_fold_tmp` → `{alias}` on each page type (property type ID unchanged, data stays intact)

Content nodes are saved as drafts only — published nodes need manual re-publish.

#### The deadlock (why `TypeWriteScope` and the status gate exist)
On 2026-11-12 Fold In hung the whole site in a rehearsal run: 0 % CPU, every request waiting, for good. `dotnet-stack report -p <pid>` showed it: the fold-in thread was inside `ContentTypeService.UpdateAsync` (database write transaction open) waiting for `FullDataSetRepositoryCachePolicy._getAllLock`; Examine's background re-index of the content Fold In had just saved held that lock and waited for the database (SQLite with `Cache=Shared`: a reader waits on the writer's table locks). A content type save empties the shared all-content-types cache entry in the middle of its transaction and then reads the types again; any thread that notices the empty entry first takes the lock and queries, and that is the end. It needs a thread reading content types at that moment: most likely right after a restart without a reset (Examine starts cold, so its re-index is still running when the next type write comes).
- `TypeWriteScope.Begin()`: fills the content/media/member type caches, then opens a scope with `RepositoryCacheMode.Scoped`. The save empties the scope's own cache, the shared one stays filled, nobody else needs the lock; notifications (Examine, cache refreshers) only go out after the commit. Use it for any new fix that saves content types AND content.
- `SinStatusCache.BeginWrite/EndWrite` (`InvalidateSinStatusAttribute`): while a non-GET Sinners call runs, `/umbraco/sinners/status` hands out its last count instead of counting: the 2 s polls read content types too.
- II (Auto categorize) and IX (Seek Root Sanctuary) still save content types one call at a time in Umbraco's default cache mode; they have the status gate only. Not seen to hang, but the same shape: wrap them the same way if one ever does.
- Do NOT remove `Cache=Shared` from the site's connection string on 18.2.1, even though the CMS does exactly that from 18.3.0/17.8.0 on (#23960). Tried: after a restart the cache instruction job sat in a SQLite busy loop ("Cache instruction sync did not complete within 00:01:00").
- If the site ever hangs again: `dotnet-stack report -p <site pid>` (installed as a global tool) before killing it; the stacks name the two parties.

### Rule III detail (three parts, one count)
- **Data types**: auto-moves data types at root (`ParentId == -1`) into folders. Built-in data types (`Id < 0`) are included. With `DatatypePrefix` config: `/<prefix>/<datatype-alias>/<name>`; without: `/Umbraco/<datatype-alias>/<name>`. Uses `IDataTypeContainerService.CreateAsync` + `IDataTypeService.MoveAsync`.
- **Dictionary** (`translation-audit` with `mode="grouping"`): finds root-level items with dot-notation keys that share a prefix (e.g. `Article.By` + `Article.On` → suggests creating an `Article` parent, which holds no translations: a folder is only a folder). Children keep their full key after move. One sin per suggested group (Clean has 6); the clicker step groups them all in one beat.
- **Media** (`root-media`): non-folder media at the media root. No real fix: `POST pretend-root-media` stores the keys, ✨. After a reset the seeder has put three there (fixed keys `DemoSinSeeder.FinalFinalKey`/`BrochureKey`/`LogoKey`): Image "final-final-v2.jpg" (a generated JPEG), File "Brochure 2019.pdf" (a one-page PDF), Image "logo" (a PNG), so III counts 3 media sins.

### Rule VI detail (two parts, one count)
Checks every content type alias is valid camelCase (`^[a-z][a-zA-Z0-9]*$`) and every dictionary `ItemKey` is PascalCase per `.`-separated segment (`^[A-Z][a-zA-Z0-9]*$`; PascalCase, NOT camelCase, on purpose), both made of recognized English words (Hunspell, tech allowlist) after splitting on case boundaries. Per-alias and per-key blessings in the blessings file. Clean's only sinner is `sEOControls` ("eo"); its keys are all clean, so only the alias part has a clicker step.

### Rule VII detail
`ViewConfessionService` greps `Views/**/*.cshtml` under the content root for `.Descendants(` / `.Descendants<T>(`, `DescendantsOrSelf(` / `DescendantsOrSelf<T>(` and `@inject IContentService` (optionally fully qualified); one sin per matching line per pattern. Before confession the Board only shows the count per file; **Confess** (`POST confess`) stores each hit's signature (`file|pattern|trimmed line text`, so moving code doesn't unconfess it, editing the line does) and then shows file, line and code. Confessed hits don't count. After a reset: 4 sins (3 in the planted `megaMenu.cshtml`, 1 in Clean's own `Partials/authors.cshtml`).

### Rule VIII detail
`ExodusService`: two grouped SQL queries over `umbracoNode`/`umbracoContent`/`umbracoContentVersion` (documents, not trashed): parents with more than `Sinners:ExodusChildThreshold` (500) children of one content type ("warehouse"), nodes with more than `Sinners:ExodusVersionThreshold` (100) versions ("versions"). One sin per finding. **Exodus** (`POST exodus`) writes `<alias>.json` (all children with properties) and `<alias>.versions.json` (every version) to `Sinners:ExodusPath` (default `umbraco/Data/sinners-exodus`, never overwrites: `-2`, `-3`…), then deletes the children (`Delete` per node in one ambient scope; `DeleteOfType` measured slower) and deletes every version except the current draft and the published one. The container and the counter node stay. ~6.5 s for the seeded 600 + 119 with per-node deletes on SQLite.
- `DemoSinSeeder` (`UmbracoApplicationStartedNotification`, background task): only with `Sinners:SeedSins`, in Development, when the node `FormSubmissionsKey` doesn't exist. First III's root media (three items, uploaded like the backoffice does: `ITemporaryFileService.CreateAsync` + `IMediaEditingService.CreateAsync` with `{ temporaryFileId }`; images generated with ImageSharp, skipped per item if its key exists), then VIII: creates doc types `formSubmission`, `visitorCounter`, `formSubmissions` (collection, allowed at root) in the root `Data` folder, a root "Form submissions" node with threshold + 100 submissions (saved in batches of 100 in one scope) and a "Visitor counter" inside it saved + published threshold + 20 times. ~20 s on a first boot. The Umbraco `ContentVersionCleanupJob` keeps all versions for 7 days by default, so the counter survives until the talk if the reset is within a week.

### Rule IX detail (Library era — Umbraco 18)
Checks whether any root content node is *renderable*: sinner if the node has a template assigned (`TemplateId`), or its content type has a `DefaultTemplate` or any `AllowedTemplates`. Repository classification is no longer involved.
- **Error**: any root node that beareth a template
- **Seek Root Sanctuary** button:
  1. Finds or creates a root-level "Pages" folder, then a "Roots" subfolder, in Document Types
  2. Creates a `siteRoot` content type (name "SiteRoot", `icon-globe`, `AllowedAsRoot = true`, `IsElement = false`, no template) in `Pages/Roots` — or updates an existing one
  3. Adds all template-bearing root content types as `AllowedContentTypes` on SiteRoot
  4. Classifies `siteRoot` as "Page" in `SinnersDocTypeClassification`
  5. Removes `AllowedAsRoot` from the template-bearing root content types
  6. One sanctuary per site: for every template-bearing root node, creates and publishes a `siteRoot` node ("Site", or "Site: {name}" when there are several; reused if it already exists), moves the node under it with `IContentService.Move` (descendants follow, stays published), and sorts the sanctuary into the node's old place among the roots
  7. If the site has no hostnames at all (it was found by being the first root), gives the first moved node the relative domain `/` (default language, or its wildcard culture), so it keeps answering at `/` on any host (:44343 and the deck's :5180 proxy alike). Nodes with hostnames keep them: domains belong to the node, not its position
- After the action IX counts 0. Clean's views find the home page with `AncestorOrSelf<Home>()`, so they keep working one level down (the planted `megaMenu.cshtml` uses `Root()`, but nothing renders it)
- Content type creation uses `contentTypeService.CreateAsync` + `MoveAsync` to place it in the folder
- Endpoint: `POST seek-root-sanctuary` (renamed from `seek-repository-sanctuary`)

### Rule X detail
Inspects the project's `.csproj` file (found via `IWebHostEnvironment.ContentRootPath`) for a `PackageReference Include="uSync"` entry.
- Clean: uSync reference found
- Error: no uSync reference — schema is unversioned
- Edge case: no `.csproj` found at content root → shows a neutral warning, not an error (badge = ok)
- Read-only — no automated fix; user installs the NuGet package manually

### Rule corrections vs original spec
- **Rule I**: Surface and fix compositions that *contain* a complex editor — not block adding them. Reason: blocking would prevent loading the existing backoffice.
- **Rule III**: Auto-move data type to folder — don't warn, just fix.
- **Rule V**: Umbraco already has a Live Environment health check — add as a reminder on the Penance board only, don't implement from scratch.
- **Media at root** (old VIII, now part of III): no automated fix, user moves media manually (or pretends).

## DB tables

| Table | Key | Purpose | Migration |
|---|---|---|---|
| `SinnersDocTypeClassification` | `ContentTypeAlias` | Manual + auto classifications for Rule II | v1 |
| `SinnersBlessing` | `Id` (auto-increment) | Unused since blessings moved to the JSON file (was Rule I) | v2 |
| `SinnersAliasBlessing` | `Id` (auto-increment) | Unused (was Rule VI aliases) | v3 |
| `SinnersTranslationBlessing` | `Id` (auto-increment) | Unused (was translation keys) | v4 |
| `SinnersProductionSettingBlessing` | `Id` (auto-increment) | Unused (was Rule V) | v5 |

Migration plan: `SinnersMigrationPlan` chains v1 → v5. Only v1 is still read; the blessing tables stay so existing sites migrate cleanly.

## Root folder mapping (Rule II auto-categorize)
The Four Sacred Types (Umbraco 18's Library owns shared content now, so Repository/RepositoryItem are gone; legacy rows with those classifications are surfaced as unclassified and skipped by auto-categorize):
| Classification | Expected root folder |
|---|---|
| Page | Pages |
| Block | Blocks |
| Data | Data |
| Composition | Compositions |
