// Wilson intervals describe binomial proportion uncertainty, not SteamSpy measurement error.
export function reachStats(games, threshold) {
  const n = games.length, hits = games.filter(g => g.lo >= threshold).length;
  if (!n) return { n: 0, hits: 0, rate: null, low: null, high: null };
  const rate = hits / n, z = 1.96, denominator = 1 + z * z / n;
  const center = (rate + z * z / (2 * n)) / denominator;
  const half = z * Math.sqrt(rate * (1 - rate) / n + z * z / (4 * n * n)) / denominator;
  return { n, hits, rate, low: Math.max(0, center - half), high: Math.min(1, center + half) };
}

export function peerGames(games, genre, band) {
  return games.filter(g => (genre === null || ((g.mask >> genre) & 1)) && (band === null || g.band === band));
}

export const LANGUAGE_GROUPS = [
  { label: '0 / unreported', test: g => g.lang <= 0 },
  { label: '1 language', test: g => g.lang === 1 },
  { label: '2–4 languages', test: g => g.lang >= 2 && g.lang <= 4 },
  { label: '5–9 languages', test: g => g.lang >= 5 && g.lang <= 9 },
  { label: '10+ languages', test: g => g.lang >= 10 }
];
