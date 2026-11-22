# Preparation plan: final TF project check

Meeting: Wednesday 2026-11-04, 15 minutes, all three members present.
Written 2026-11-03 from the current code on `main` (commit `41f7e6d`), the unit tests, and a
run-through of the deployed site. Every number here was read off the running page tonight.

The TF's brief has five parts: a working prototype, a five-minute demo, an account of what
changed, implementation questions aimed at individuals, and our own questions. This plan is
organised around those five parts, then ends with the rehearsal schedule.

---

## 1. How the fifteen minutes will probably go

| Minutes | What happens | Who leads |
|---|---|---|
| 0–1 | TF settles in, asks us to start | driver has the page loaded |
| 1–6 | Our demo, visitor's point of view | driver clicks, narrator talks |
| 6–12 | TF questions, directed at individuals by name | whoever is asked |
| 12–15 | Our questions, TF feedback, what remains | timekeeper raises them |

Assume the TF will interrupt the demo. When that happens, answer, then return to the view
you were on rather than restarting.

---

## 2. Ten minutes before the slot

The page is a static SvelteKit build. It only needs a dev server or the GitHub Pages copy.

1. Your dev server is already up on port 5173 (`vite dev --host 127.0.0.1`). Open
   http://127.0.0.1:5173/cs1710-steam-reach/ and reload once. Keep the terminal window open.
2. Open the deployed copy in a second tab as a fallback: https://rongzhichen.github.io/cs1710-steam-reach/.
   It was deployed from Jack's commit this afternoon and I confirmed it is identical to the local build.
3. Check the page has finished loading: the header should say **99,754** games and the Peer lab
   should read **8.7% · 8,703 of 99,754**. If it says "Loading…" for more than a few seconds,
   reload. If it shows the red "could not be loaded" line, switch to the other tab.
4. Put the controls in their starting state: threshold 100,000; no genre or shelf selected in
   the comparison tool; bubble size on "share of successful games"; Explore brush cleared;
   all three Peer-lab checkboxes off.
5. Have the editor open on the files in section 5, each on a separate tab.
6. Decide who drives the mouse and who watches the clock. The third person leads the
   "what changed" part.

---

## 3. The five-minute demo

### The story in one breath

A solo developer sees that most hit games on Steam are cheap, and concludes "price low".
But that counts where the hits are, not how often a game succeeds. Once you divide by the
right denominator, and then narrow to your own genre and price, the picture changes, and the
traits of your real peers differ from the store-wide profile. So the site gives you a tool to
build your own peer group, and then warns you that a smaller group is also a less certain one.

### Walkthrough

Each row is one view. Show the interaction first, then say the line. Do not read the page.

**Section 1, the hook (0:00).** Scroll to the large 85%.
Say: about 85 percent of games that reached 100,000 owners cost ten dollars or less, free
games included. That tells you where successful games sit, not how often a game on that shelf
succeeds.

**Section 2, counts mislead (0:30).** Point at the grey and blue bars for $0–5 and $20–40.
Say: among paid games, about 7 percent of the $0–5 shelf reaches 100k, against about 18
percent on the $20–40 shelf. The cheap shelf holds the most hits because it holds 61,000
games. We are not saying a higher price causes reach. Different teams make thirty-dollar games.

**Section 3, genre (0:55).** Use the dropdown: switch RPG to Action, then back to RPG.
Say: the baseline depends on genre. For RPG the $20–40 shelf reaches 100k about 22 percent of
the time, against 18 percent for all genres.

**Section 4, traits (1:15).** Point at the tiles.
Say: among successful RPGs at $10–20, 82 percent report six or more hours of average playtime,
against 47 percent of all successful games. Only a quarter ship on two or more platforms.
These are what successful peers look like, not instructions.

**Section 6, the comparison tool (1:35).** Hover the RPG bubble so the tooltip shows n and
the rate. Click RPG. Click the $10–20 shelf.
Say: pick a genre, then a shelf. Every number is shown next to the same number for all
successful games. The table lists the named peers. Bubble area is reach rate by default, so the
first thing a visitor sees is the rate, not the count.

**Explore (2:15).** Drag a box over the dense part of the scatter. Click the RPG bar on the
right. Click "Clear selection".
Say: each dot is a game, price against owner band. The brush recomputes the genre mix and the
traits for the selected games. Clicking a genre lights its dots and narrows the trait panel.
About 100,000 dots are drawn on a canvas, with SVG axes and a D3 brush on top.

**Peer lab, the new work (2:45).** Point out that RPG and $10–20 came along from the tool.
Tick "5+ languages", then "One platform", then "Early Access". Expand "View exact counts".
Say: this is the main addition since the last check. Each tick keeps only the games that pass
every condition so far. RPG at $10–20 starts at 315 of 2,406, about 13 percent. After all three
conditions we have 20 of 122, about 16 percent. The rate went up, but the interval widened to
roughly 11 to 24 percent and the page flags the group as small. A tighter comparison is not
automatically a better one.

**Threshold (3:40).** Change the Owner threshold in the Peer lab to 500,000, then back.
Say: the same 122 games, now 5 qualify, about 4 percent. The threshold is shared by the tool,
the explorer and the lab. The opening story stays at 100k on purpose so its argument does not
move under the reader.

**Release year (4:00).** Point at the two highlighted rows.
Say: this is context for the rate, not a sales history. Older games had longer to accumulate
owners. 2026 shows zero of 31, which is a real zero, not missing data.

**Language support (4:20).** Point at the 10+ languages pair.
Say: grey is the store, orange is our peer group, within the same language band. For 10 or
more languages it is 21 percent against 31 percent. An association, not evidence that adding
translations causes reach.

**Close (4:40).** Say: the narrative and every interaction are implemented. What remains is
wording, one display inconsistency, and the process book. Then hand over to the questions in
section 7.

### Numbers to have in your head

| Moment | Number |
|---|---|
| Hook | 85% of 100k+ games cost $10 or less |
| Counts | 7% ($0–5, paid) vs 18% ($20–40) |
| Genre | RPG $20–40: 22% vs 18% all genres |
| Traits | 82% vs 47% playtime; 25% vs 35% two platforms |
| Ladder start | 315 of 2,406 = 13.1% |
| Ladder end | 20 of 122 = 16.4%, interval 10.9%–24.0% |
| Threshold 500k | 5 of 122 = 4.1% |
| Store | 99,754 eligible games, 8,703 reach 100k = 8.7% |

---

## 4. What changed since the first check, and why

Say this as a story of three decisions, not a changelog.

**We turned the three drafts into real views.** At the first check the peer ladder, the
release-year cohorts and the language comparison were drawn mock-ups. They now run on the
cleaned game rows in the browser. Why: the TF asked for functional interactions, and the drafts
could not be tested against the data.

**We made the selections shared.** Genre and price chosen in the comparison tool carry into
the Peer lab, and the owner threshold is one value across every interactive view. Why: a
visitor should not have to describe their game twice, and the three views must be about the
same peer group or the comparison is meaningless.

**We put uncertainty on the page.** Every rate in the new views shows its denominator, a 95
percent Wilson interval, a warning under 200 games and an exact-count table. Why: the ladder
produces impressive percentages from tiny groups, and without the interval it would mislead in
exactly the way our story warns against.

Two smaller changes worth mentioning if asked:

- Bubble area now defaults to reach rate instead of mean owner midpoint, so the main
  encoding matches the main message.
- The draft's "Windows only" filter became "One platform". The compact data stores how many
  platforms a game supports, not which ones, so the original label could not be computed.

---

## 5. Implementation, explained along the data path

The TF may pick any member and any part. Learn this section as one chain.

### Raw CSV to JSON (`pipeline/build_data.py`)

- Input is the Kaggle Steam Games Dataset, about 383 MB and not committed. 125,855 rows.
- The header has 39 names for 40 columns because "DiscountDLC count" is really two fields.
  The script splits it so every later column lines up. Rows with the wrong width are skipped.
- Owner estimate is a band like "100000 - 200000". We keep the lower bound as `lo`. Games
  with the band "0 - 0" have no SteamSpy estimate and are dropped: 24,579 of them.
- "Early Access" and "Free To Play" are store labels, not genres. Early Access becomes a flag.
  The ten most common remaining genres become a bitmask; a game can hold several. Games in
  none of the ten (1,522, mostly software) are dropped. That leaves 99,754.
- Positive-review share is only computed for games with at least 50 reviews; others get -1.
  Playtime is converted from minutes to hours. Language count is the number of distinct
  entries in the parsed list. Platform count is how many of Windows, Mac, Linux are true.
- Names are only kept for games at or above 100k owners, to keep `games.json` small. Below
  that, the row carries an empty name.
- Output: `games.json` (one compact array per game plus metadata and the genre list) and
  `summary.json` (pre-aggregated tables per threshold and the exact story numbers with their
  definitions, so the page and the process book cannot drift apart).

### Browser loading (`src/lib/data.js`, `src/routes/+page.svelte`)

- The page is prerendered to static HTML. The rows are fetched in `onMount`, not in a load
  function, so four megabytes of data are never inlined into the HTML.
- `loadData` fetches both JSON files once and caches the promise. It expands each compact
  array into an object, adds the band midpoint, the price-band index, the owner-band index
  and a jitter value from a seeded random generator (seed 42) so the scatter looks the same
  on every load.
- If either fetch fails, the page shows a visible error line. The prose numbers fall back to
  the published values so the narrative still reads.

### Shared state (`src/lib/stores.js`)

Four Svelte stores: `threshold` (default 100,000), `dataset`, `peerGenre`, `peerBand`.
Everything else is local component state. The table below is the answer to "what is linked
to what".

| Control | Scope |
|---|---|
| Owner threshold select (three copies) | comparison tool, explorer, peer lab |
| Genre bubble, price shelf, peer lab selects | comparison tool and all three peer-lab views |
| Peer-lab checkboxes | ladder only |
| Explorer brush, genre bar, Show select | explorer only |
| Genre dropdown in section 3 | that one story chart |

Two deliberate limits: the opening story is fixed at 100k, and "Reset peer filters" clears
genre, price and checkboxes but leaves the threshold alone.

### Comparison tool (`ComparisonTool.svelte`)

- Bubbles are a D3 data join inside an `$effect` that reruns when the data, threshold, metric
  or selection changes. Radius uses a square-root scale so area encodes the metric.
- Choosing a genre clears the price band, because the shelves are recomputed for that genre.
- Each shelf is twenty cells; filled cells are the rate rounded to the nearest five percent.
  The exact rate is in the label and tooltip.
- Trait tiles and the top-12 table are plain Svelte markup over a `$derived` value. A tile is
  highlighted when the peer share exceeds the all-successful share by more than five points.
- Bubbles and shelves have `tabindex` and respond to Enter and Space.

### Explorer (`Explorer.svelte`)

- Dots are drawn on a canvas in three passes: below the line, above the line, highlighted
  genre. The canvas is scaled by `devicePixelRatio`. Prices above $60 are clamped to the
  right edge; the stored price is untouched.
- Axes, the dashed success line and the brush are SVG over the canvas.
- The brush handler tests each visible game's plotted x and y against the rectangle. The y
  position is the band plus the seeded jitter, so brushing is deterministic.
- A `ResizeObserver` rebuilds scales and the brush when the panel changes size, which also
  clears the selection. Changing threshold or the "Show" select re-evaluates the current
  brush rather than dropping it.
- The genre bars and trait bars are D3 joins fed by a `$derived` summary of the selected set.

### Peer lab (`PeerLab.svelte`, `analysis.js`, `RateChart.svelte`)

- The ladder is a loop over five possible steps: genre, price, 5+ languages, one platform,
  Early Access. Each enabled step filters the pool left by the previous one and records a
  row. Order is fixed; ticking boxes in a different order gives the same rows.
- `reachStats` returns n, hits, rate and a Wilson interval. An empty pool returns a null rate,
  which the chart renders as "No data". A pool with zero hits returns 0% and an interval.
- Release-year rows are the last twelve recorded years in the data for the current genre and
  price. Year zero (unparseable date) is dropped. The newest two years are highlighted.
- Language rows pair store and peers inside five mutually exclusive groups, including zero or
  unreported, so the groups partition the whole dataset.
- `RateChart` uses a fixed 0–100% axis so the bars do not rescale when filters change, draws
  whiskers for the interval, marks n under 200 with an asterisk, and exposes an exact-count
  table in a `details` element for keyboard and screen-reader users.

### Tests (`tests/analysis.test.js`, run with `node --test`)

Four tests, all passing tonight: the real counts (99,754; 8,703; 2,406; 315; 122; 20)
reconcile with the JSON; the language groups cover every game exactly once; empty data differs
from zero hits and the Wilson bounds behave at 0 and 1; raising the threshold never increases
the hit count.

### Edge cases you can name without being asked

- No matching games versus zero successes, handled differently on purpose.
- Fewer than 50 reviews: excluded from the review trait, not counted as negative.
- Games below 100k have no name in the data; the table prints "(unnamed)" if one ever appears.
- Genres overlap, so genre shares in the explorer do not sum to 100%.
- A brush that is active when the threshold changes is recomputed, not discarded.
- Fetch failure shows an error and leaves the narrative readable.

---

## 6. Question bank

Answers are in the words I would use. Make them your own, but keep the content.

**Data**

- *Where does the data come from?* A Kaggle dump of the Steam API and SteamSpy, about
  125,000 games. SteamSpy owner estimates are bands, not counts.
- *What is "reach"?* The lower bound of the owner band. We never call it sales or revenue.
- *What did you throw away, and does that bias anything?* Games with no owner estimate and
  games outside the ten genres. Yes, it biases coverage toward games SteamSpy tracks, and we
  say so on the page.
- *When was the data collected?* The JSON was built on 2026-10-25 from the Kaggle file. The
  Kaggle snapshot date needs to be checked at the source; do not guess it.

**Design**

- *Why rates and bars rather than something fancier?* The whole argument is about
  denominators. A bar against a shared baseline makes the denominator visible; a count does not.
- *Why fixed 0–100% axes in the new charts?* So the bars do not rescale when filters change
  and the eye can compare states. The cost is that small rates look similar. We would like
  the TF's view on that.
- *Why a bubble chart for genres?* Ten categories, one number each, and the bubble doubles as
  the button that drives the rest of the tool.
- *Why is the opening story not linked to the threshold?* A narrative that changes its own
  evidence while you read it is not a narrative. The tools are where the reader experiments.

**Implementation**

- *How do the views talk to each other?* Four Svelte stores. Components derive their groups
  from them and redraw in effects. Nothing is passed by events.
- *Why D3 inside Svelte?* Svelte owns the DOM and the state; D3 supplies scales, formats,
  the brush and the canvas drawing loop. For the simpler charts, Svelte renders the SVG
  directly from data.
- *Why canvas for the scatter?* 100,000 SVG circles would be slow. Canvas draws them in
  three fills.
- *How is the ladder computed?* Sequential filtering of one pool, then hits over n at each
  step.
- *What is a Wilson interval and why that one?* A confidence interval for a proportion that
  stays inside 0 and 1 and works when hits are zero or equal to n. It describes sampling
  uncertainty only, not SteamSpy's own error.
- *Why no transitions?* Not implemented. Filters update instantly. We chose correctness and
  linking first.

**Progress**

- *What does not work yet?* Nothing is broken. The explorer's empty-brush summary shows 0%
  where the new charts would say "No data". Some copy on the page reads as advice rather than
  description. The process book is behind the code.
- *What would you do with another week?* Reword the causal-sounding lines, unify the
  no-data display, add short transitions, and write up the iteration in the process book.

---

## 7. Our questions for the TF

Ask the first two. Keep the third if time allows.

1. The story moves from "where the successful games are" to "the reach rate inside a group".
   Does the change of denominator land for a first-time visitor, or does it need a more
   explicit visual bridge?
2. In the ladder, the rate can rise while the interval widens. Does the current display make
   the trade-off between a closer comparison and a smaller sample clear, or do the percentages
   still look too confident?
3. The new charts keep a fixed 0–100% axis for comparability. Would you keep that, or
   rescale and accept that states become harder to compare?

---

## 8. Weak points, and how to talk about them

Do not hide these. Raising them first reads as judgement, not failure.

- **The language and trait charts invite causal reading.** The page says the opposite in
  the notes, but the headline copy ("budget for what your peers share") pushes the other way.
  Say the rewording is planned.
- **"Never pass 20,000 owners."** The data is a snapshot; a game in the lowest band today may
  move. Say "sit in the lowest band at the time of the snapshot".
- **Release-year rows mix released and scheduled dates.** The 2026 group is 31 games with
  zero hits, which is expected for games that have barely shipped.
- **The whole store is not the whole store.** 99,754 is the eligible set after exclusions.
- **Everyone in the data is a "peer".** The dataset has no studio size, so the peer group
  includes large studios too. The audience framing is about who the comparison is useful for,
  not a filter we applied.

---

## 9. Tonight's rehearsal

1. Confirm the slot time and link, and that all three can attend.
2. Assign driver, timekeeper and the "what changed" speaker.
3. Run the demo once against the clock. Cut whatever pushes past five minutes; the Peer lab
   and the threshold change are the parts that must survive.
4. Swap roles and run it again, with the other two interrupting with questions from section 6.
5. Each member explains, without notes, one component they did not write: the loader, the
   stores, the ladder, the brush.
6. Agree on honest answers to "who built what". The TF may ask.
7. Check the process book has at least the Prototype II rationale written, even if the
   screenshots come later.

Suggested primary areas, to confirm with the team: Rongzhi on the pipeline, loader, stores,
comparison tool and explorer; Jack on the Peer lab, RateChart, analysis and tests; Lawrence
on the narrative sections, story charts and the design and limitation arguments.

---

## 10. Verified tonight (2026-11-03)

- `node --test tests/analysis.test.js`: 4 of 4 pass.
- Deployed site: loads 99,754 games, identical markup to the local `build/`, deployed from
  commit `41f7e6d` by GitHub Actions.
- On the deployed site: genre dropdown, bubble and shelf clicks, tooltips, trait tiles and
  table; Peer lab inherits the selection; all three checkboxes give 20 of 122 with the
  10.9%–24.0% interval; threshold 500k gives 5 of 122; exact-count tables; scatter brush,
  genre highlight and trait panel; clear.
- Not verified: keyboard-only operation end to end, phone-width layout, behaviour when the
  JSON fetch fails, and a rebuild from the raw CSV.
