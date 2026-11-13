// Share a selection by URL (V3, test-session item 14). Pure helpers so they can be unit tested;
// the page wires them to the stores and to history.replaceState.
import { THRESHOLDS } from './data.js';

const int = (v, max) => { if (v === null || v === '') return null; const n = Number(v); return Number.isInteger(n) && n >= 0 && n <= max ? n : null; };

/**
 * Parse query parameters into a state object. Unknown or malformed values fall back to defaults.
 * g = peer genre index, p = price band index, t = threshold, f = ladder flags (letters l, o, e),
 * b = brush fractions x0,y0,x1,y1, x = explorer genre, s = explorer show ('ok').
 */
export function parseState(search, nGenres = 10) {
  const q = new URLSearchParams(search);
  const thr = q.has('t') ? Number(q.get('t')) : 100000;
  const f = q.get('f') ?? '';
  let brush = null;
  if (q.has('b')) {
    const v = q.get('b').split(',').map(Number);
    if (v.length === 4 && v.every(n => Number.isFinite(n) && n >= 0 && n <= 1) && v[0] < v[2] && v[1] < v[3]) brush = v;
  }
  return {
    genre: int(q.get('g'), nGenres - 1),
    band: int(q.get('p'), 5),
    threshold: THRESHOLDS.includes(thr) ? thr : 100000,
    flags: { lang: f.includes('l'), plat: f.includes('o'), ea: f.includes('e') },
    explore: { brush, genre: int(q.get('x'), nGenres - 1), show: q.get('s') === 'ok' ? 'ok' : 'all' }
  };
}

/** Serialize state to a query string; defaults are omitted so the plain page URL stays clean. */
export function serializeState(s) {
  const q = new URLSearchParams();
  if (s.genre !== null && s.genre !== undefined) q.set('g', s.genre);
  if (s.band !== null && s.band !== undefined) q.set('p', s.band);
  if (s.threshold !== 100000) q.set('t', s.threshold);
  const f = (s.flags.lang ? 'l' : '') + (s.flags.plat ? 'o' : '') + (s.flags.ea ? 'e' : '');
  if (f) q.set('f', f);
  if (s.explore.brush) q.set('b', s.explore.brush.map(v => v.toFixed(3)).join(','));
  if (s.explore.genre !== null && s.explore.genre !== undefined) q.set('x', s.explore.genre);
  if (s.explore.show === 'ok') q.set('s', 'ok');
  const str = q.toString();
  return str ? '?' + str : '';
}
