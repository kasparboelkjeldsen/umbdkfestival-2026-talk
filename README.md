# The 10 UmbraCommandments

The talk from Umbraco DK Festival 2026, by Kaspar Boel Kjeldsen: ten rules for building Umbraco
sites that are still pleasant to work on in five years. It ends in a live demo, where a real Umbraco
site that breaks all ten is absolved of its sins, one commandment at a time, from a dashboard in its
own backoffice.

This repository is the talk as it was given: the slides, the demo site and everything needed to run
both. The two projects it is made with live elsewhere and are still being worked on:

- **[can-present](https://github.com/kasparboelkjeldsen/can-present)**: the presentation engine. Talks
  on an infinite canvas, built with Vue and Vite.
- **[Umbraco.Community.Sinners](https://github.com/kasparboelkjeldsen/Umbraco.Community.Sinners)**: the
  Umbraco package behind the demo. Its Penance Board audits a site against the ten commandments and
  fixes what it finds.

## Just the slides

Open [`dist/umbracommandments.html`](dist/umbracommandments.html) in a browser. It is the whole deck
in one file, with nothing to install.

| Key | |
|---|---|
| → or Space | next |
| ← | back |
| O | overview: click a scene to jump to it |
| F | fullscreen |

The live Umbraco backoffice is not in that file. The cards it sat on say so.

## The slides with the live demo

You need [Node.js](https://nodejs.org) 22.12 or newer and the [.NET 10 SDK](https://dotnet.microsoft.com/download).
It was built and presented on Windows and has only been run there.

```bash
git clone https://github.com/kasparboelkjeldsen/umbdkfestival-2026-talk.git
cd umbdkfestival-2026-talk
npm install
npm run dkfestival
```

That starts the demo site and then the deck, and opens the deck at http://localhost:5180. The first
start takes a few minutes: it restores the NuGet packages, installs Umbraco on a SQLite database with
the [Clean starter kit](https://github.com/prjseal/Clean-Starter-Kit-for-Umbraco), and plants the
sins. Ctrl+C stops both.

- The backoffice logs you in by itself. This works on your own machine only, and the account is the
  one in `sinners/Umbraco/18.2.1/appsettings.Development.json`.
- In the demo scene the arrow keys drive the Penance Board instead of the deck. Escape gives them back.
- **R** resets everything, the site included: it goes back to maximum sin, which takes a minute or two.
  It runs `sinners/reset.ps1`, so PowerShell has to be allowed to run scripts.
- If the site stops at once for want of an HTTPS certificate, run `dotnet dev-certs https` and start again.
- `npm run dkfestival -- --demo 8` starts in the demo, at commandment VIII.
- It uses ports 5180 and 5181 (the deck) and 44343 and 8699 (the site).

## What is where

| | |
|---|---|
| `decks/umbracommandments/` | the talk: its scenes, the speaker notes (`notes.json`) and the brief |
| `engine/`, `scripts/` | can-present, as it was on the day |
| `sinners/` | Umbraco.Community.Sinners, as it was on the day |
| `sinners/Umbraco/18.2.1/` | the demo site: Umbraco 18.2.1 with the Clean starter kit and the package |
| `dist/umbracommandments.html` | the deck in one file |

Other commands: `npm run deck -- dev` runs the deck alone (http://localhost:5173), `npm run compile`
builds the one-file deck again.

## A warning about the package

Umbraco.Community.Sinners is a joke with working parts. It changes document types, moves media and
content, and rewrites files. Use it on a site you can throw away, such as the one in this repository.

## License

[MIT](LICENSE). Umbraco, the Clean starter kit and the other dependencies have their own licenses.
