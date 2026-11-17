# Umbraco.Community.Sinners — Package Specification

> ⚠️ **Historical document.** This is the original confession — what we *promised* to build
> before the code, Umbraco 18, and common sense had their say. Preserved unedited as a
> monument to planning. Where reality diverged:
>
> - The **six sacred types became four** — Umbraco 18's Library took the Repositories and
>   Repository Items, and they ascended (see `commandments.md` §2).
> - **Rule 9 changed religions**: instead of demanding Repositories at root, the root now
>   simply *shall not render* — no root node may bear a template.
> - **Rule 1** doesn't block composition saves; it surfaces sinful compositions and offers
>   a value-preserving **fold-in** instead. Blocking would have prevented the backoffice
>   from loading, which even we considered too much enforcement.
> - The environment guard, the `Sinners` config section, rule severity levels, the
>   creation-time classification modal, and the save-notification handlers were never
>   built. The Penance Board dashboard ate the whole design.
> - Targets Umbraco 17/18, not 17.
>
> The spec is what we confessed we would do. The code is what we did. Classic.

## Overview

Sinners is a development-time package for Umbraco that enforces opinionated architectural rules via notification handlers, startup health checks, and a backoffice audit dashboard. It is explicitly a development tool and should no-op entirely when not running in the Development environment.

The package ships with all rules set to `Error` by default. Rules can be downgraded to `Warning` or disabled entirely via configuration. Rule 1 (composition removal) is the sole exception — it cannot be downgraded below `Error` without an explicit opt-out key in configuration.

---

## Environment Guard

At registration time, the package checks `IHostEnvironment.IsDevelopment()`. If the environment is not Development, all handlers, health checks, and backoffice extensions are skipped entirely. The package is safe to leave in production dependencies but will do nothing.

```csharp
builder.Services.AddUmbracoCommunity().AddSinners(); // safe anywhere
```

---

## Configuration

```json
{
  "Sinners": {
    "Rules": {
      "CompositionRemoval": "Error",
      "DocTypeClassification": "Error",
      "DataTypeFolderStructure": "Error",
      "AliasLanguageAndCasing": "Error",
      "DictionaryKeyFormat": "Error",
      "MediaAtRoot": "Error",
      "ContentAtRoot": "Error",
      "ProductionReadiness": "Warning"
    },
    "AllowCompositionRemoval": false
  }
}
```

Valid values for each rule: `Error`, `Warning`, `None`.

`AllowCompositionRemoval` is the only escape hatch for rule 1. Setting it to `true` degrades the block to a warning. This key exists to be deliberately inconvenient to set.

---

## Rule Implementations

### Rule 1 — Composition Removal (`CompositionRemoval`)

**Handler:** `ContentTypeSavingNotification`

On every content type save, compare the incoming composition list against the currently persisted composition list for that content type. If a composition has been removed, inspect the removed composition's property types for any Block List or Block Grid editors.

If a block content property is found on the removed composition, cancel the notification and surface an error toast.

This rule cannot be set to `Warning` or `None` via the `Rules` config. The only way to soften it is `AllowCompositionRemoval: true`, which degrades it to a warning toast. The error message should make clear that this is intentional and how to override it.

**Error message:** "Sinners: You are removing a composition that contains block content properties. This will permanently delete content across all nodes using this document type. This cannot be undone. If you are certain, set Sinners:AllowCompositionRemoval to true in your appsettings."

---

### Rule 2 — Document Type Classification (`DocTypeClassification`)

**Mechanism:** Custom database table + backoffice modal on content type creation.

#### Database Table: `SinnersDocTypeClassification`

| Column | Type | Notes |
|---|---|---|
| ContentTypeAlias | varchar | PK |
| Classification | varchar | Page, Block, Data, Composition, Repository, RepositoryItem |
| CreatedUtc | datetime | |
| UpdatedUtc | datetime | |

#### Backoffice Modal

When a new content type is created (intercepted via a custom backoffice extension on the content type editor), present a modal before the editor fully opens asking the developer to classify what they are building. The six types are presented with brief descriptions. The selection is persisted to the database table.

Classification is required — the modal cannot be dismissed without making a selection.

#### Downstream enforcement via `ContentTypeSavingNotification`

Once classification data exists, validate on every save:

- A **Block** must be an element type
- A **Data** type must be an element type
- A **Composition** must be an element type
- A **Page** must be a document type
- A **Repository** must be a document type
- A **Repository Item** must be a document type
- A **Composition** must not appear as a property editor in any block list or block grid
- A **Block** must not appear as a composition on any other content type

Surface violations according to the configured rule level.

---

### Rule 3 — Data Type Folder Structure (`DataTypeFolderStructure`)

**Handler:** `DataTypeSavedNotification`

Check if the saved data type's parent is the data type root container. If so, surface a violation — all custom data types must live inside at least one folder.

---

### Rule 4 — Composer vs Program.cs (`None` — not runtime enforceable)

This rule cannot be enforced at runtime. Candidate for a future Roslyn analyser shipped as a separate package: `Umbraco.Community.Sinners.Analysers`.

Not included in the initial release. Worth mentioning in the Penance dashboard as a known gap.

---

### Rule 5 — Production Readiness (`ProductionReadiness`)

**Mechanism:** `IHealthCheck` implementation, surfaced in the Umbraco health check dashboard and in the Penance dashboard.

Umbraco 17 ships with a formal `RuntimeMode` concept. The correct production configuration is `Umbraco:CMS:Runtime:Mode` set to `Production` in `appsettings.Production.json`. When set, Umbraco itself enforces several prerequisites at startup via `IRuntimeModeValidationService` — so Sinners does not need to re-implement those checks. Instead, Sinners checks that the groundwork is in place for production mode to actually be reachable.

Check for the existence of `appsettings.Production.json` and validate the following keys are present and correctly set within it:

- `Umbraco:CMS:Runtime:Mode` — must be `Production`
- `Umbraco:CMS:WebRouting:UmbracoApplicationUrl` — must be a valid non-empty URL
- `Umbraco:CMS:Global:UseHttps` — must be `true`
- `Umbraco:CMS:ModelsBuilder:ModelsMode` — must be `Nothing`
- `Umbraco:CMS:Hosting:Debug` — must be `false`

Additionally check that `appsettings.Development.json` (or `appsettings.json`) has `Umbraco:CMS:Runtime:Mode` set to either `BackofficeDevelopment` or `Development`, not `Production` — running production mode locally is not what this file is for.

Note: the application being built with `--configuration Release` and Razor views compiled at publish time are also production mode prerequisites, but these are not inspectable at runtime. Surface a static informational note in the Penance dashboard reminding developers of these build-time requirements.

This rule defaults to `Warning` as the production config file may legitimately live outside the repository or be injected via environment variables in the deployment pipeline.

---

### Rule 6 — Alias Language and Casing (`AliasLanguageAndCasing`)

**Handler:** `ContentTypeSavingNotification`, `DataTypeSavedNotification`, `MediaTypeSavedNotification`

Validate that the alias matches `^[a-z][a-zA-Z0-9]*$` (camelCase, ASCII only). Surface a violation if the alias contains non-ASCII characters or does not start with a lowercase letter.

Optionally: run the alias tokens against a simple non-English character heuristic (presence of æ, ø, å or common Danish suffixes) and surface a more specific message.

---

### Rule 7 — Dictionary Key Format (`DictionaryKeyFormat`)

**Handler:** `DictionaryItemSavingNotification`

Validate:
- Key matches `^([A-Z][a-zA-Z0-9]*\.)+[A-Z][a-zA-Z0-9]*$` (PascalCase segments separated by dots)
- If the item has no parent (i.e. it is a folder-level key), it must have no translation values set

---

### Rule 8 — Media at Root (`MediaAtRoot`)

**Handler:** `MediaSavingNotification`

Check if the saved media item's parent is the media root. If so, surface a violation — all media must live inside a folder.

---

### Rule 9 — Content at Root (`ContentAtRoot`)

**Handler:** `ContentSavingNotification`

Check if the saved content node's parent is the content root. If so, look up the content type alias in the `SinnersDocTypeClassification` table. If the classification is not `Repository`, surface a violation.

If no classification exists for the content type, surface a warning regardless of rule level — unclassified root nodes are always suspicious.

---

### Rule 10 — uSync Not Installed (`USyncNotInstalled`)

**Mechanism:** Startup check via `IHealthCheck` or `INotificationAsyncHandler<UmbracoApplicationStartingNotification>`.

Check if uSync is registered in the service collection or if the uSync configuration section exists in `appsettings.json`. If neither is present, surface a violation.

Also check if Umbraco Cloud / Umbraco Deploy is detected — if so, skip this check entirely as Deploy supersedes uSync.

---

## Penance Dashboard

A new tree node in the Settings section of the Umbraco backoffice labelled **Penance**.

### Purpose

Penance runs a full audit of the existing Umbraco installation against all configured rules and presents a summary of violations. This is the "run it on a legacy project and see how bad it is" feature.

### Audit Checks

| Check | Source |
|---|---|
| Unclassified document types | `SinnersDocTypeClassification` vs all content types |
| Data types at root | Data type container inspection |
| Aliases failing casing/language rules | All content type, data type and media type aliases |
| Dictionary keys failing format rules | Full dictionary tree traversal |
| Media at root | Media root children |
| Content at root that isn't a Repository | Content root children + classification lookup |
| Production readiness config | appsettings file inspection |
| uSync presence | Service registration check |

### UI

The dashboard presents violations grouped by rule, each with:
- Rule name and commandment number
- Severity (Error / Warning)
- List of offending items with links where possible (content types link to the content type editor, media items link to the media section, etc.)
- A brief description of why this is a violation and what to do about it

A summary at the top shows total errors and warnings with a pass/fail indicator. The goal is to make it immediately obvious how sinful a given installation is.


## Notes for Implementation

- Target Umbraco 17
- The backoffice modal and Penance dashboard are Lit/Web Component extensions registered via the Umbraco package manifest
- Database migrations use `PackageMigrationBase` via `IPackageMigrationPlan`
- Rule level enforcement should be centralised in a `SinnersViolationService` that takes a rule level and either throws a cancellation, logs a warning, or no-ops — handlers should not implement this logic themselves
- All user-facing messages should be prefixed with "Sinners:" for easy identification in logs and toasts
