# Leonida Legend — GTA VI Trophy Guide & Tracker

[![GTA 6 Trophy Guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/ngadukun/leonida-legend-2/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/ngadukun/leonida-legend-2/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

A free, offline, single-page trophy guide and tracker for **Grand Theft Auto VI** on PlayStation 5 — built for the [make.fun GTA 6 trophy guide bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it does

- **All 55 official trophies** with their official names, descriptions and grades (1 Platinum, 2 Gold, 6 Silver, 46 Bronze), each with a guide written for this entry in its own words, citing its sources by name.
- **Tracker**: a checklist that saves progress in the browser (localStorage), with export to a JSON file and import back.
- **Filters**: by tier, by kind (story / side / collectible / combat / driving / activity), by text search, and a Hide earned toggle.
- **Spoiler setting**: hides the names and descriptions of story trophies until they are earned.
- **Roadmap to the Platinum**: a recommended order — missables first, then character strands, activities, the collectible sweep, the counted grind, and 100% completion.
- **Watch-outs**: the 8 missable trophies with what makes each one missable, plus a before-you-finish-the-story checklist.

## Run it offline

No build step, no accounts, no network — the app loads only its own files:

```sh
node serve.ts
# then open http://localhost:8080
```

Or serve `app/` with any static file server. Everything works with the network off.

## Files

- `app/index.html`, `app/style.css`, `app/app.js` — the guide and tracker (ES modules, system fonts only).
- `app/data/trophies.json` — the 55 trophies: official name, description and grade, kind, missable flag, and an own-words guide with cited sources for every trophy.
- `main.ts` — the hand-in program (Node 22, stdlib only): copies `app/` and `screenshots/` to the output dir and writes `dossier.json` via the vendored make.fun library. Run it with `MAKEFUN_OUTPUT_DIR=out node main.ts`.
- `serve.ts` — a tiny static server for local checks.
- `shots.json` — the four screenshot scenes (tracker, guide detail, roadmap, watch-outs).
- `screenshots/` — 4 screenshots of the app, the first by name being the cover:
  1. `1-tracker.jpg` — the checklist with trophy 17's guide open beside it
  2. `2-guide.jpg` — the guide detail for The Shootist (trophy 17)
  3. `3-roadmap.jpg` — the roadmap to the Platinum
  4. `4-watch.jpg` — the missable trophies and the pre-finale checklist

## Sources

Trophy names and descriptions are shown as PlayStation publishes them. Guides are this entry's own words, drawing on the named community guides: PowerPyx trophy guide, PlayStationTrophies.org, PSNProfiles, Exophase. Not affiliated with Rockstar Games or PlayStation.
