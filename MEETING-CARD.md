# TF check card · 2026-11-04 · 15 minutes

One page to have open next to the browser. The full English plan with the demo script,
implementation walkthrough and question bank is [MEETING-PREP.md](MEETING-PREP.md); the
earlier bilingual notes are kept in MEETING-PREP-bilingual-old.md. Everything below was verified on
2026-11-03 against the committed code, the unit tests and the deployed site.

## Before the slot

- Your own dev server is already running: http://127.0.0.1:5173/cs1710-steam-reach/
  (started with `npm run dev -- --host 127.0.0.1`). Keep that terminal open.
- Backup, verified live and identical to the local build: https://rongzhichen.github.io/cs1710-steam-reach/
- Reload, then confirm the defaults: threshold 100,000 · nothing selected in the
  comparison tool · three Peer-lab boxes unchecked · bubble size = "share of successful games".
- Have open in the editor: `src/routes/+page.svelte`, `src/lib/data.js`, `src/lib/stores.js`,
  `src/lib/analysis.js`, `src/lib/components/PeerLab.svelte`, `pipeline/build_data.py`.
- One person drives, one keeps time. All three members must attend.

## Five sentences to know cold

1. Audience: solo Steam developers and small studios choosing who to compare against.
2. Story: compare reach *rates* within similar games, not counts of visible hits.
3. Reach = lower bound of the SteamSpy owner band. Not sales, revenue or active players.
4. Progress since check 1: the three drafts now run on real rows with shared genre, price
   and threshold, plus sample sizes and Wilson intervals.
5. Remaining: tighten wording, unify the empty-selection display, finish the process book.

## Demo script (5:00)

| Time | Where | Click | Say |
|---|---|---|---|
| 0:00 | Hook | scroll to 85% | 85% of games reaching 100k owners cost $10 or less. That says where the hits are, not how often a game like mine succeeds. |
| 0:30 | Counts mislead | point at $0–5 vs $20–40 | Same shelves, different denominator: 7% vs 18% reach rate. Not causal; different teams make $30 games. |
| 0:55 | Genre | dropdown RPG → Action → RPG | RPG on the $20–40 shelf: 22% vs 18% store-wide. The baseline depends on genre. |
| 1:15 | Traits | read tiles | Successful $10–20 RPGs: 82% report 6+ hours playtime vs 47% of all successful games. Observed traits, not a recipe. |
| 1:35 | Comparison tool | hover RPG bubble · click RPG · click $10–20 shelf | Tooltip shows n and rate. Shelves show rate and n. Tiles compare successful peers with all successful games. Table names them. |
| 2:15 | Explore | drag a box on the scatter · click RPG bar · Clear selection | Canvas for ~100k dots, SVG axes, D3 brush. Genre and trait panels update to the brushed games. |
| 2:45 | Peer lab | show RPG · $10–20 carried over · tick 5+ languages, One platform, Early Access · open "View exact counts" | 315 of 2,406 (13.1%) → 20 of 122 (16.4%). The denominator shrinks, the interval widens to 10.9–24.0%, and a small-group warning appears. |
| 3:40 | Peer lab | threshold → 500,000 → back to 100,000 | Same 122 games, 5 qualify (4.1%). Threshold is shared across the tools; the opening story stays at 100k. |
| 4:00 | Release year | point at 2025 and 2026 | Context, not a sales timeline. 2026 shows 0 of 31: a zero rate, which is different from No data. |
| 4:20 | Language | point at one store/peer pair | 10+ languages: 21% store vs 31% peers. An association, not proof that translations cause reach. |
| 4:40 | Wrap | — | Narrative and interactions are done. Left: wording, process book, one display inconsistency. Then ask our question. |

Numbers that must come out right: 85% · 7% vs 18% · 315 / 2,406 · 20 / 122 · 5 / 122.

## What changed since the first check

- The three static V1 drafts (peer ladder, release-year cohorts, language support) are now
  live views on the cleaned rows, not mock-ups.
- Genre and price are shared stores, so the comparison tool and the Peer lab stay in sync.
  The owner threshold is shared by every interactive tool.
- Every new rate shows n, a 95% Wilson interval, a warning under 200 games and an exact-count table.
- Bubble size now defaults to reach rate so the main encoding matches the message.
- "Windows only" became "One platform": the compact data stores a platform count, not identity.

## Questions the TF will direct at individuals

- **How is data loaded?** A Python script repairs the CSV header (`DiscountDLC count` is one
  name for two values), derives fields and writes two JSON files. The browser fetches both once
  in `onMount`, expands compact rows, and uses precomputed summaries for the story charts.
  Fetching in `onMount` keeps 4 MB of rows out of the prerendered HTML.
- **What did you exclude?** 125,855 raw rows → drop 24,579 with no owner estimate (band 0–0)
  → drop 1,522 in none of the ten genres → 99,754 eligible games.
- **Why does 85% not contradict 7%?** 85% is P(price ≤ $10 | reached 100k), free included.
  7% is P(reached 100k | paid, ≤ $5). Different denominators.
- **How do linked views work?** Svelte writable stores: `threshold`, `dataset`, `peerGenre`,
  `peerBand`. Derived values recompute the groups; `$effect` blocks redraw the D3 views. The
  three checkboxes are local state in PeerLab. Explorer's brush and genre highlight are local too.
- **How is the ladder computed?** Start with all eligible games; each enabled step filters the
  previous pool; `reachStats` counts games with band lower bound ≥ threshold over pool size.
- **Why Wilson intervals?** Bounded in [0, 1], valid at 0 hits and all hits. They describe
  binomial uncertainty only, not SteamSpy error or selection bias. n < 200 is our caution rule,
  not a significance test.
- **Missing versus zero?** Empty pool → rate null → "No data". Nonempty pool with no hits → 0%
  with an interval. Example: 0/unreported languages among RPG $10–20 peers is No data; 2026 is 0/31.
- **Why Canvas plus SVG?** Canvas draws ~100k dots without 100k DOM nodes; SVG carries axes and
  the brush. The brush tests each visible game's plotted x/y; y is the band plus seeded jitter.
- **Why not filter on reviews or playtime in the ladder?** They are outcomes, not choices a
  developer makes before launch.
- **Limitations?** Snapshot data, estimated bands, excluded games, prices that may have changed,
  overlapping genres, studios of every size. Everything is descriptive.

## Be honest about these if asked

- Explorer's empty brush summary still shows 0% rather than No data; the new RateChart does it right.
- Filters update instantly. There are no animated transitions.
- Some page copy ("one shot", "budget for what peers share", "never pass 20,000") sounds more
  causal or permanent than the data supports. Rewording is on the list.
- `built=2026-10-25` is the date the JSON was generated, not the Kaggle snapshot date.
- The process book still needs the Prototype II rationale and screenshots.

## Code map

| Asked about | File |
|---|---|
| Page order, data entry, error message | `src/routes/+page.svelte` line 18 |
| CSV repair, exclusions, derived fields | `pipeline/build_data.py` `read_rows`, `parse_game` |
| Loader, compact columns, jitter seed 42 | `src/lib/data.js` |
| Shared state | `src/lib/stores.js` |
| Bubbles, shelves, trait tiles | `src/lib/components/ComparisonTool.svelte` |
| Canvas scatter and brush | `src/lib/components/Explorer.svelte` `setup`, `draw`, `brushed` |
| Cumulative ladder, cohorts, languages | `src/lib/components/PeerLab.svelte` |
| Wilson interval, peer filter | `src/lib/analysis.js` |
| Fixed 0–100% axis, No data, tables | `src/lib/components/RateChart.svelte` |
| Tests (4/4 pass) | `tests/analysis.test.js` |

## Two questions to ask the TF

1. Does the switch from "where the successful games are" to "reach rate inside the group"
   make the change of denominator clear enough to a first-time visitor?
2. Does the ladder convey the trade-off between a closer comparison and a smaller sample,
   or do the percentages still read as too certain?

## Suggested ownership (confirm tonight, everyone still learns all of it)

- Rongzhi: pipeline, data loader, stores, comparison tool, explorer.
- Jack: Peer lab, RateChart, analysis.js, tests (his commit of 2026-11-03).
- Lawrence: narrative sections, story charts, design rationale and limitations.
