// Shared constants, formatters and the data loader. Mirrors the old js/main.js exactly:
// same compact-row column mapping, same owner bands, price bands, traits and jitter seed.
import * as d3 from 'd3';

export const LOWS = [0, 20000, 50000, 100000, 200000, 500000, 1e6, 2e6, 5e6, 1e7, 2e7, 5e7, 1e8];
export const LAB = ['0–20k', '20–50k', '50–100k', '100–200k', '200–500k', '500k–1M', '1–2M', '2–5M', '5–10M', '10–20M', '20–50M', '50–100M', '100M+'];
export const MID = {};
LOWS.forEach((lo, i) => { MID[lo] = i + 1 < LOWS.length ? (lo + LOWS[i + 1]) / 2 : 1.5e8; });

export const BANDS = [
  { k: 'Free', t: p => p === 0 }, { k: '$0–5', t: p => p > 0 && p <= 5 }, { k: '$5–10', t: p => p > 5 && p <= 10 },
  { k: '$10–20', t: p => p > 10 && p <= 20 }, { k: '$20–40', t: p => p > 20 && p <= 40 }, { k: '>$40', t: p => p > 40 }
];
export const TRAITS = [
  { k: 'Reviews ≥ 80% positive', f: g => g.pos >= 80, rev: true }, { k: 'Avg playtime ≥ 6 h', f: g => g.hours >= 6 },
  { k: '2+ platforms', f: g => g.plat >= 2 }, { k: '5+ languages', f: g => g.lang >= 5 }, { k: 'Early Access', f: g => g.ea === 1 }
];
export const THRESHOLDS = [100000, 200000, 500000, 1000000];

export const fmt = d3.format(',.0f');
export const pct = d3.format('.0%');

/**
 * Share of `set` meeting trait `tr`. Review-based traits only count games with a review share
 * (pos >= 0, i.e. at least 50 reviews). Returns 0 for an empty set.
 */
export function traitShare(set, tr) {
  const rel = tr.rev ? set.filter(g => g.pos >= 0) : set;
  return rel.length ? d3.mean(rel, g => (tr.f(g) ? 1 : 0)) : 0;
}

let cache = null;

/**
 * Load static/data/games.json and summary.json once and expand the compact rows.
 * @param {string} base  URL prefix (SvelteKit `base` path)
 * @returns {Promise<{G: object[], GEN: string[], meta: object, summary: object}>}
 */
export function loadData(base = '') {
  if (!cache) {
    cache = Promise.all([
      fetch(`${base}/data/games.json`).then(r => r.json()),
      fetch(`${base}/data/summary.json`).then(r => r.json())
    ]).then(([j, summary]) => {
      const rnd = d3.randomLcg(42);
      // cols: name, price, ownerLow, genreMask, posPct, hours, platforms, languages, reviews, year, earlyAccess
      const G = j.games.map(a => ({
        name: a[0], price: a[1], lo: a[2], mask: a[3], pos: a[4], hours: a[5], plat: a[6], lang: a[7], rev: a[8], year: a[9], ea: a[10],
        mid: MID[a[2]] || a[2], band: BANDS.findIndex(b => b.t(a[1])), bandIdx: LOWS.indexOf(a[2]), jit: rnd() - 0.5
      }));
      return { G, GEN: j.genres, meta: j.meta, summary };
    });
  }
  return cache;
}
