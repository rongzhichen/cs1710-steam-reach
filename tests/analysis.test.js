import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { reachStats, peerGames, LANGUAGE_GROUPS } from '../src/lib/analysis.js';
import { BANDS } from '../src/lib/data.js';

const source = JSON.parse(readFileSync(new URL('../static/data/games.json', import.meta.url), 'utf8'));
const games = source.games.map(a => ({ lo: a[2], mask: a[3], band: BANDS.findIndex(b => b.t(a[1])), lang: a[7], plat: a[6], ea: a[10] }));

test('real-data baseline and published RPG example reconcile', () => {
  assert.equal(games.length, 99754);
  assert.equal(reachStats(games, 100000).hits, 8703);
  const peers = peerGames(games, source.genres.indexOf('RPG'), 3);
  assert.equal(peers.length, 2406);
  assert.equal(reachStats(peers, 100000).hits, 315);
  const final = peers.filter(g => g.lang >= 5 && g.plat === 1 && g.ea === 1);
  assert.equal(final.length, 122);
  assert.equal(reachStats(final, 100000).hits, 20);
});

test('language categories partition the eligible dataset without gaps or overlap', () => {
  for (const game of games) assert.equal(LANGUAGE_GROUPS.filter(group => group.test(game)).length, 1);
});

test('empty data differs from zero hits; Wilson boundary cases remain valid', () => {
  assert.equal(reachStats([], 100000).rate, null);
  const zero = reachStats([{ lo: 0 }], 100000);
  assert.equal(zero.rate, 0);
  assert(zero.high > 0.79 && zero.high < 0.80);
  const all = reachStats([{ lo: 100000 }], 100000);
  assert.equal(all.rate, 1);
  assert(all.low > 0.20 && all.low < 0.21);
  assert.equal(all.high, 1);
});

test('raising owner threshold cannot increase the count of qualifying peers', () => {
  const counts = [100000, 200000, 500000, 1000000].map(t => reachStats(games, t).hits);
  for (let i = 1; i < counts.length; i++) assert(counts[i] <= counts[i - 1]);
});
