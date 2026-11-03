# Prototype II: implementation and demo notes

## What changed

The three V1 drafts now run on the cleaned game rows rather than hardcoded mock-up values:

- Peer ladder: cumulative genre, price, language, one-platform and Early Access filters, with reach rate, denominator, 95% Wilson interval and a small-group warning below 200 games.
- Release-year cohorts: the last 12 recorded release years in the dataset, filtered by peer genre and price. The newest two are highlighted. Recorded years may include scheduled releases, so this is not a longitudinal growth analysis.
- Language support: store and selected peers compared within five mutually exclusive language groups, including zero/unreported.

Genre and price are shared with the original comparison tool. Owner threshold is shared with the tool and scatter explorer as well. The introductory story intentionally remains at 100k and the peer lab explains that scope. Trait checkboxes affect only the cumulative ladder.

The bubble tool now defaults to reach rate, matching the story's central message. Data-load failures show an explicit message. New views include exact-count tables, keyboard-operable controls and horizontal chart scrolling on narrow screens. The original drafts remain in static/drafts as design history.

## Five-minute demonstration

1. 0:00–0:45: Show the opening 85% figure and explain why the location of successful games differs from the success rate within a price shelf.
2. 0:45–1:30: Compare genres and prices in the comparison tool. Select RPG and $10–20. Explain that owner-band lower bounds are not revenue or active users.
3. 1:30–3:00: Open Peer lab. The peer selection is already carried over. At 100k owners, RPG $10–20 has 315 qualifying games among 2,406 (13.1%). Add 5+ languages, one platform, then Early Access. The final group has 20 qualifying games among 122 (16.4%). Point out the shrinking denominator and wider interval, rather than interpreting this as a causal benefit of features.
4. 3:00–3:40: Move the owner threshold to 500k and show the linked updates. Explain that small groups may have no qualifying games, which differs from having no matching data.
5. 3:40–4:30: Show release-year and language-support comparisons. Explain snapshot timing, scheduled-release dates, confounding and post-launch changes.
6. 4:30–5:00: Show the exact-count table, describe the implementation and ask the TF a specific design question.

## Design choices to explain

- Svelte manages controls and shared stores; D3 supplies scales, formatting and the existing SVG/canvas interactions.
- Each ladder step filters the previous step, keeping denominators explicit. Review sentiment and playtime are outcomes and are not ladder filters.
- The compact data stores platform count, not platform identity. The implemented filter therefore says **One platform**, replacing the draft's unsupported **Windows only** label.
- Wilson intervals remain bounded at 0 and 1 and work for zero successes. They do not capture SteamSpy error or dataset selection bias; the data is not a random sample of every possible Steam game.
- No matching games is shown as **No data**, never as a zero success rate. All language groups together account for every eligible game.
- All new charts use a fixed 0–100% axis for stable comparison between filter states.

## Before the TF check

Update the team's actual process book with the iteration rationale and screenshots, and list only members who actually contributed. This file is supporting material, not a replacement for the process book. Every member should rehearse explaining the data loader, cumulative filters, shared stores and uncertainty calculation. Confirm the ZIP contents against the course's submission instructions.

## Local validation

Run `npm run build` and `node --test tests/analysis.test.js`. Open the local site and test genre/price changes, all three trait toggles, threshold changes, reset, and exact-count disclosure tables.
