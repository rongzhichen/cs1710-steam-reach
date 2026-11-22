# Steam Game Reach and Developer Decisions

CS1710 group project. A data story for solo Steam developers and small studios,
built on the Steam Games Dataset (Kaggle, about 125,000 games from the Steam API
and SteamSpy).

**Main message.** For solo Steam developers, ownership rates among similar games
are more useful for pricing decisions than counts of popular low-priced titles.

## Team

- Rongzhi Chen (rongzhi_chen@fas.harvard.edu)
- Lawrence Liao (lawrence_liao@fas.harvard.edu)
- Jack (Changming) Liu (changming_liu@g.harvard.edu)

## Live site

GitHub Pages: https://rongzhichen.github.io/cs1710-steam-reach/

## Repository layout

| Path | What it holds |
|---|---|
| `src/routes/+page.svelte` | The single-page site. Part 1 is the story (the six-panel MS6 storyboard, each step ending in a takeaway); Part 2 is the three tools; a closing section restates the message. |
| `src/routes/+layout.svelte`, `+layout.js` | Global stylesheet import; marks every route as prerendered. |
| `src/app.css` | Design tokens (light and dark), fonts and all site styles. |
| `src/lib/data.js` | Data loader, compact-row column mapping, owner bands, price bands, traits, formatters. |
| `src/lib/stores.js` | The shared success-threshold store and the loaded dataset. |
| `src/lib/components/` | One Svelte + D3 component per view: four story charts, the count-versus-rate tiles (`StoryFlip.svelte`), `ComparisonTool.svelte`, `Explorer.svelte`, the threshold select and the prose-number span. |
| `static/data/` | Small derived JSON files the site loads (built by the pipeline). |
| `static/drafts/` | The rendered drafts page and images for the views planned for V2. |
| `pipeline/` | Python script that cleans the raw CSV and writes `static/data/`. |
| `.github/workflows/deploy.yml` | Builds the site and deploys it to GitHub Pages on every push to `main`. |
| `process-book/`, `outputs/` | Local only (ignored): process-book exports and screenshots, and earlier milestone work. |

The raw dataset is not committed (it is over GitHub's file-size limit). To rebuild
`static/data/`, download `games.csv` from Kaggle into `dataset/` and run:

```bash
python3 pipeline/build_data.py
```

## Running locally

Prototype II added three interactive peer-analysis views with shared genre, price,
and owner-threshold controls (see [PROTOTYPE-2.md](PROTOTYPE-2.md)). Prototype III
acts on the MS10 test sessions: small-sample guards and denominators in every view,
colour keys, shareable URL state (`?g=&p=&t=&f=&b=`), named games in the explorer,
a threshold-sensitivity panel and worked-example presets. Run
`node --test tests/analysis.test.js` to check the statistical edge cases and
published data counts.

The site is a SvelteKit app (Svelte 5, Vite, D3) built as a fully static site with
`@sveltejs/adapter-static`. It needs Node 20 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:5173/cs1710-steam-reach/ (the base path matches the GitHub
Pages project URL). To check the production build locally:

```bash
npm run build
npm run preview
```

The build lands in `build/`. Pushing to `main` runs the GitHub Actions workflow, which
builds the site and publishes `build/` to GitHub Pages.

## Definitions used throughout

- **Reach** is the lower bound of SteamSpy's estimated-owner band. It is not sales,
  revenue, or active players.
- **Successful / high reach** means that lower bound is at least 100,000 owners.
  The site lets you raise it to 200k, 500k, or 1M.
- Games with no owner estimate (the 0 to 0 band) are excluded from reach comparisons.
- Review sentiment uses only games with at least 50 reviews.
- Nothing on the site claims that changing price or adding features causes greater reach.
