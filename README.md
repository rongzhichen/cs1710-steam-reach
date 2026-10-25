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
| `index.html` | The single-page site. Sections follow the six-panel MS6 storyboard. |
| `css/` | Site styles. |
| `js/` | One file per D3 visualization plus `main.js` for shared state. |
| `data/` | Small derived JSON files the site loads (built by the pipeline). |
| `pipeline/` | Python script that cleans the raw CSV and writes `data/`. |
| `drafts/` | The rendered drafts page and images for the views planned for V2. |
| `process-book/`, `outputs/` | Local only (ignored): process-book exports and screenshots, and earlier milestone work. |

The raw dataset is not committed (it is over GitHub's file-size limit). To rebuild
`data/`, download `games.csv` from Kaggle into `dataset/` and run:

```bash
python3 pipeline/build_data.py
```

## Running locally

Any static server works. From the repository root:

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080/.

## Definitions used throughout

- **Reach** is the lower bound of SteamSpy's estimated-owner band. It is not sales,
  revenue, or active players.
- **Successful / high reach** means that lower bound is at least 100,000 owners.
  The site lets you raise it to 200k, 500k, or 1M.
- Games with no owner estimate (the 0 to 0 band) are excluded from reach comparisons.
- Review sentiment uses only games with at least 50 reviews.
- Nothing on the site claims that changing price or adding features causes greater reach.
