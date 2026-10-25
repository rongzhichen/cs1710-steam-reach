# Migration: plain static site → SvelteKit

Branch `sveltekit-rebuild` replaces the vanilla `index.html` + `css/` + `js/` site with a
SvelteKit (Svelte 5, Vite, D3 7) app built as a fully static site. Nothing about the data,
the numbers or the design changed; every view was ported one to one.

## What moved where

| Before | After | Notes |
|---|---|---|
| `index.html` | `src/routes/+page.svelte` | Same sections, eyebrows, prose, callout, caveats, four steps, drafts, footer. `<span data-story>` became `<StoryNum k=… />`. |
| `index.html` `<head>` | `src/app.html` | Google Fonts link, charset, viewport. |
| `css/style.css` | `src/app.css` | Imported once in `src/routes/+layout.svelte`. Tokens, fonts, dark mode unchanged; only the unused `.viz-placeholder` rule was dropped. |
| `js/main.js` constants + loader | `src/lib/data.js` | Same `LOWS`, `LAB`, `MID`, `BANDS`, `TRAITS`, same column mapping, same `d3.randomLcg(42)` jitter. `loadData(base)` replaces `S.ready`. |
| `js/main.js` threshold state | `src/lib/stores.js` | `threshold` writable store; `dataset` store holds the loaded rows. |
| `js/main.js` tooltip | `src/lib/tip.js` | `showTip` / `hideTip`. |
| `js/story.js` `bars()` | `src/lib/bars.js` | Unchanged drawing code, takes an SVG element. |
| `js/story.js` sections 1–4 | `src/lib/components/StoryHook.svelte`, `StoryCounts.svelte`, `StoryGenre.svelte`, `StoryTraits.svelte` | Genre `<select>` lives in `StoryGenre.svelte`. |
| `js/story.js` `fillNumbers()` | `src/lib/components/StoryNum.svelte` | Reads `summary.json.story[k]`; the published value is the prerendered fallback. |
| `<select data-threshold>` (two copies) | `src/lib/components/ThresholdSelect.svelte` | Bound to the store, so both copies stay in sync. |
| `js/viz-drilldown.js` | `src/lib/components/ComparisonTool.svelte` | Bubbles and shelves are D3 inside `$effect`; crumb, trait tiles and the table are Svelte markup. |
| `js/viz-brush.js` | `src/lib/components/Explorer.svelte` | Canvas + `d3.brush` set up in `onMount`; `ResizeObserver` replaces the window resize listener. |
| `data/games.json`, `data/summary.json` | `static/data/` | Served at `/cs1710-steam-reach/data/…`. `pipeline/build_data.py --out` now defaults to `static/data`. |
| `drafts/index.html`, `drafts/img/` | `static/drafts/` | Served as plain static files. `static/drafts/style.css` is a symlink to `src/app.css`, resolved to a real file at build time. |
| `python3 -m http.server` | `npm run dev` / `npm run build` / `npm run preview` | See README. |
| GitHub Pages "deploy from branch" | `.github/workflows/deploy.yml` | Builds on push to `main` and publishes `build/` with `actions/deploy-pages`. |

New top-level files: `package.json`, `package-lock.json`, `svelte.config.js`, `vite.config.js`,
`jsconfig.json`, `.nvmrc`. Ignored: `node_modules/`, `.svelte-kit/`, `build/`.

## Behaviour notes

- The game rows are fetched in `onMount`, not in a `load` function, so the 4 MB of data is
  not inlined into the prerendered HTML. The prerendered page already shows every prose
  number (fallbacks equal the published values) and fills them from `summary.json` on load.
- `paths.base` is `/cs1710-steam-reach`, so the dev server serves the site at
  `http://localhost:5173/cs1710-steam-reach/` (the root URL 404s on purpose).
- `.claude/launch.json` (local, ignored) now has `site` = Vite dev server on 5173 and
  `site-preview` = `vite preview` of the built site on 4173.

## One-time GitHub setup

In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions.**
Until that is switched, Pages keeps serving the old root of `main`, which after this merge
no longer contains an `index.html`.

## Git commands

```bash
# review the branch
git status
git diff --stat main..sveltekit-rebuild

# commit everything on the branch (moves are already staged; this adds the new files)
git add -A
git commit -m "Rebuild the site in SvelteKit + D3, replacing the static index.html"

# bring it onto main and publish
git checkout main
git merge --no-ff sveltekit-rebuild
git push origin main

# then switch GitHub Pages to "GitHub Actions" (see above) and watch the Deploy workflow
```

To verify locally before pushing:

```bash
npm install
npm run build
npm run preview
# open http://localhost:4173/cs1710-steam-reach/
```
