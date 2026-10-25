// Shared data loader, state and helpers. Each visualization module registers a
// render function with SteamReach.on('threshold', fn) and reads SteamReach.G / GEN.
(function () {
  const LOWS = [0, 20000, 50000, 100000, 200000, 500000, 1e6, 2e6, 5e6, 1e7, 2e7, 5e7, 1e8];
  const LAB = ['0–20k', '20–50k', '50–100k', '100–200k', '200–500k', '500k–1M', '1–2M', '2–5M', '5–10M', '10–20M', '20–50M', '50–100M', '100M+'];
  const MID = {}; LOWS.forEach((lo, i) => { MID[lo] = i + 1 < LOWS.length ? (lo + LOWS[i + 1]) / 2 : 1.5e8; });
  const BANDS = [{ k: 'Free', t: p => p === 0 }, { k: '$0–5', t: p => p > 0 && p <= 5 }, { k: '$5–10', t: p => p > 5 && p <= 10 },
                 { k: '$10–20', t: p => p > 10 && p <= 20 }, { k: '$20–40', t: p => p > 20 && p <= 40 }, { k: '>$40', t: p => p > 40 }];
  const TRAITS = [{ k: 'Reviews ≥ 80% positive', f: g => g.pos >= 80, rev: true }, { k: 'Avg playtime ≥ 6 h', f: g => g.hours >= 6 },
                  { k: '2+ platforms', f: g => g.plat >= 2 }, { k: '5+ languages', f: g => g.lang >= 5 }, { k: 'Early Access', f: g => g.ea === 1 }];

  const listeners = {};
  const S = window.SteamReach = {
    LOWS, LAB, MID, BANDS, TRAITS, G: [], GEN: [], meta: null, summary: null, thr: 100000,
    fmt: d3.format(',.0f'), pct: d3.format('.0%'),
    on(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); },
    emit(ev) { (listeners[ev] || []).forEach(fn => fn()); },
    setThreshold(v) { S.thr = +v; document.querySelectorAll('select[data-threshold]').forEach(s => { s.value = String(S.thr); }); S.emit('threshold'); },
    showTip(e, txt) { tip.textContent = txt; tip.style.opacity = 1; tip.style.left = (e.clientX + 12) + 'px'; tip.style.top = (e.clientY + 12) + 'px'; },
    hideTip() { tip.style.opacity = 0; },
  };
  const tip = document.createElement('div'); tip.className = 'tip'; document.body.appendChild(tip);

  // Any <select data-threshold> on the page drives the shared success threshold.
  document.addEventListener('change', e => { if (e.target.matches('select[data-threshold]')) S.setThreshold(e.target.value); });

  S.ready = Promise.all([fetch('data/games.json').then(r => r.json()), fetch('data/summary.json').then(r => r.json())])
    .then(([j, sum]) => {
      S.meta = j.meta; S.GEN = j.genres; S.summary = sum;
      const rnd = d3.randomLcg(42);
      // cols: name, price, ownerLow, genreMask, posPct, hours, platforms, languages, reviews, year, earlyAccess
      S.G = j.games.map(a => ({ name: a[0], price: a[1], lo: a[2], mask: a[3], pos: a[4], hours: a[5], plat: a[6], lang: a[7], rev: a[8], year: a[9], ea: a[10],
                                mid: MID[a[2]] || a[2], band: BANDS.findIndex(b => b.t(a[1])), bandIdx: LOWS.indexOf(a[2]), jit: rnd() - 0.5 }));
      document.querySelectorAll('[data-n-games]').forEach(el => { el.textContent = S.fmt(S.meta.N); });
      S.emit('data');
      return S;
    });
})();
