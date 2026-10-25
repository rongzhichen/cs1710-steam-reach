# Data pipeline

`build_data.py` turns the raw Kaggle CSV into the two small JSON files the website loads.
The raw file is not committed (383 MB, above GitHub's limit). To rebuild:

```bash
# 1. Download games.csv from the Steam Games Dataset on Kaggle into dataset/
# 2. From the repository root:
python3 pipeline/build_data.py
```

It runs in a few seconds and prints an audit of the numbers quoted in the story.

## Inputs and outputs

| File | Role |
|---|---|
| `dataset/games.csv` | Raw input, 125,855 rows, 40 columns (header lists 39 names). |
| `data/games.json` | One compact row per eligible game (99,754 rows, about 3.9 MB). Loaded by the interactive views. |
| `data/summary.json` | Pre-aggregated tables and the canonical numbers the story quotes (about 30 KB). Loaded by the narrative sections. |

## Cleaning rules

1. **Header repair.** The CSV header has 39 names for 40 values. `DiscountDLC count` is split into `Discount` and `DLC count` so every later column lines up. Rows of the wrong width are skipped (none in the current file).
2. **Owner estimate required.** Games whose estimated-owner band is `0 - 0` have no SteamSpy estimate. They are excluded from every comparison and counted as `noEstimate` (24,579).
3. **Genre filter.** `Early Access` and `Free To Play` are store labels, not genres, and are removed from the genre list. The ten most common remaining genres (Indie, Casual, Action, Adventure, Simulation, Strategy, RPG, Sports, Racing, Massively Multiplayer) become a bitmask. Games in none of the ten, mostly utilities and software, are excluded and counted as `noGenre` (1,522). This is the rule the MS5 prototypes used, so the counts in the process book (99,754 eligible games, 8,703 successful) still hold.
4. **Reach and success.** Reach is the lower bound of the owner band. A game is successful when that bound is at least 100,000; the site can raise the threshold to 200k, 500k or 1M, so rows keep the raw bound and `summary.json` carries tables for all four thresholds.
5. **Reviews.** Positive-review share is computed only for games with at least 50 reviews. Others get `-1`, which the views treat as missing.
6. **Playtime.** Average lifetime playtime is converted from minutes to hours, rounded to one decimal.
7. **Languages and platforms.** Language count is the number of distinct entries in the parsed `Supported languages` list. Platform count is the number of true flags among Windows, Mac and Linux.
8. **Price bands.** Free, ($0, $5], ($5, $10], ($10, $20], ($20, $40], over $40.
9. **Names.** Kept only for games at or above 100,000 owners, because only the named-games tables use them. This keeps `games.json` small.

## `games.json` row format

`cols` gives the order: `name, price, ownerLow, genreMask, posPct, hours, platforms, languages, reviews, year, earlyAccess`. `genreMask` bit *i* is set when the game carries `genres[i]`.

## Canonical numbers

`summary.json.story` holds each number used in the storyboard together with its exact definition and denominator. Two of them resolve an inconsistency in the MS6 write-ups:

- The reach rate of the $20 to $40 shelf is **17.9%** on the 99,754 eligible games. The 16.9% quoted in one MS6 insight was computed before the genre filter, on 101,276 games. The storyboard's "about 18%" is the filtered figure.
- Inside RPG the same shelf reaches **22.4%**.

## Caveats carried into the site

Owner estimates are bands, not sales or active players. Prices are a snapshot. Multi-genre games are counted in every genre they carry, so genre totals overlap. Nothing here shows that changing a price or adding a feature causes greater reach.
