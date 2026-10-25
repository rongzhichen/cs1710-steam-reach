// Comparison tool (storyboard panel 6): genre bubbles -> price shelves -> trait tiles and named games.
// Ported from the MS5 Prototype A drill-down. Mounts into #tool.
(function () {
  const S = window.SteamReach, { BANDS, TRAITS, fmt, pct } = S;
  const state = { metric: 'mean', genre: null, band: null };
  const root = d3.select('#tool');
  const inGenre = g => state.genre === null || (g.mask >> state.genre & 1);
  const ok = g => g.lo >= S.thr;

  function render() { crumb(); bubbles(); shelves(); traits(); }

  function crumb() {
    const c = root.select('.crumb').html('');
    c.append('button').text('All genres').on('click', () => { state.genre = null; state.band = null; render(); });
    if (state.genre !== null) { c.append('span').text(' › '); c.append('b').text(S.GEN[state.genre]); }
    if (state.band !== null) { c.append('span').text(' › '); c.append('b').text(BANDS[state.band].k); }
    if (state.genre === null && state.band === null) c.append('span').text('  (nothing selected)').style('color', 'var(--muted)');
  }

  function bubbles() {
    const rows = S.GEN.map((name, i) => { const s = S.G.filter(g => g.mask >> i & 1); return { i, name, n: s.length, mean: d3.mean(s, g => g.mid), share: d3.mean(s, g => ok(g) ? 1 : 0) }; });
    const v = d => d[state.metric];
    const r = d3.scaleSqrt().domain([0, d3.max(rows, v)]).range([0, 52]);
    const x = d3.scalePoint().domain(rows.map(d => d.i)).range([60, 1000]);
    const svg = root.select('#dd-bubbles');
    const sel = svg.selectAll('g.bubble').data(rows, d => d.i);
    const ent = sel.enter().append('g').attr('class', 'bubble').attr('tabindex', 0).attr('role', 'button');
    ent.append('circle').attr('cy', 78).attr('fill', 'var(--hit-soft)').attr('stroke', 'var(--hit)').attr('stroke-width', 1.5);
    ent.append('text').attr('class', 'mono').attr('text-anchor', 'middle').attr('y', 82).attr('font-size', 12);
    ent.append('text').attr('class', 'lab').attr('text-anchor', 'middle').attr('y', 165).attr('font-size', 12);
    ent.append('line').attr('y1', 130).attr('y2', 150).attr('stroke', 'var(--line)');
    const toggle = d => { state.genre = state.genre === d.i ? null : d.i; state.band = null; render(); };
    const all = ent.merge(sel).attr('transform', d => `translate(${x(d.i)},0)`)
      .on('click', (e, d) => toggle(d))
      .on('keydown', (e, d) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(d); } })
      .on('mousemove', (e, d) => S.showTip(e, `${d.name}\nn = ${fmt(d.n)} games\nmean owner midpoint ${fmt(d.mean)}\nsuccessful ${pct(d.share)}`))
      .on('mouseleave', S.hideTip);
    all.select('circle').attr('r', d => Math.max(6, r(v(d))))
      .attr('fill', d => state.genre === d.i ? 'var(--sel-soft)' : 'var(--hit-soft)')
      .attr('stroke', d => state.genre === d.i ? 'var(--sel)' : 'var(--hit)')
      .attr('stroke-width', d => state.genre === d.i ? 3 : 1.5)
      .attr('opacity', d => state.genre === null || state.genre === d.i ? 1 : .45);
    all.select('text.mono').text(d => state.metric === 'mean' ? d3.format('.3~s')(d.mean) : pct(d.share));
    all.select('text.lab').text(d => d.name.replace('Massively Multiplayer', 'MMO')).attr('font-weight', d => state.genre === d.i ? 600 : 400).attr('fill', d => state.genre === d.i ? 'var(--sel)' : 'var(--fg)');
    all.select('line').attr('y1', d => 78 + Math.max(6, r(v(d))));
    const cap = 'Circle area = ' + (state.metric === 'mean' ? 'mean of estimated-owner band midpoints' : 'share of games meeting the success threshold');
    svg.selectAll('text.axis').data([0]).join('text').attr('class', 'axis').attr('x', 0).attr('y', 14).attr('font-size', 11).attr('fill', 'var(--muted)').text(cap);
  }

  function shelves() {
    root.select('#dd-q2').html(`Within <em>${state.genre === null ? 'all genres' : S.GEN[state.genre]}</em>, which price bands hold the largest share of successful games? <em>Click a shelf to list its traits.</em>`);
    const pool = S.G.filter(inGenre);
    const rows = BANDS.map((b, i) => { const s = pool.filter(g => g.band === i); const h = s.filter(ok).length; return { i, k: b.k, n: s.length, h, share: s.length ? h / s.length : 0 }; });
    const svg = root.select('#dd-shelves');
    const x = d3.scaleBand().domain(rows.map(d => d.i)).range([20, 1050]).paddingInner(.18);
    const sel = svg.selectAll('g.shelf').data(rows, d => d.i);
    const ent = sel.enter().append('g').attr('class', 'shelf').attr('tabindex', 0).attr('role', 'button');
    ent.append('rect').attr('class', 'bg').attr('x', -6).attr('y', 20).attr('rx', 5).attr('height', 225).attr('fill', 'transparent');
    ent.append('text').attr('class', 'k').attr('y', 40).attr('font-size', 14).attr('font-weight', 600);
    ent.append('text').attr('class', 'pc mono').attr('y', 62).attr('font-size', 13);
    ent.append('text').attr('class', 'n mono').attr('y', 236).attr('font-size', 11).attr('fill', 'var(--muted)');
    ent.append('g').attr('class', 'cells').attr('transform', 'translate(0,74)');
    const toggle = d => { state.band = state.band === d.i ? null : d.i; render(); };
    const all = ent.merge(sel).attr('transform', d => `translate(${x(d.i)},0)`)
      .on('click', (e, d) => toggle(d))
      .on('keydown', (e, d) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(d); } })
      .on('mousemove', (e, d) => S.showTip(e, `${d.k}\n${fmt(d.h)} of ${fmt(d.n)} games meet the threshold\n${pct(d.share)}`)).on('mouseleave', S.hideTip);
    all.select('rect.bg').attr('width', x.bandwidth() + 12).attr('fill', d => state.band === d.i ? 'var(--sel-soft)' : 'transparent').attr('stroke', d => state.band === d.i ? 'var(--sel)' : 'none');
    all.select('text.k').text(d => d.k).attr('fill', d => state.band === d.i ? 'var(--sel)' : 'var(--fg)');
    all.select('text.pc').text(d => d.n ? pct(d.share) + ' successful' : 'no games');
    all.select('text.n').text(d => `n = ${fmt(d.n)}`);
    const cw = (x.bandwidth() - 3 * 4) / 4, ch = 26;   // 20-cell stamp from the JL3 hand sketch: 4 wide, 5 tall
    all.select('g.cells').each(function (d) {
      const filled = Math.round(d.share * 20);
      const cells = d3.range(20).map(i => ({ i, on: i < filled, row: 4 - Math.floor(i / 4), col: i % 4 }));
      d3.select(this).selectAll('rect.cell').data(cells).join('rect').attr('class', 'cell').attr('rx', 3)
        .attr('x', k => k.col * (cw + 4)).attr('y', k => k.row * (ch + 4)).attr('width', cw).attr('height', ch)
        .attr('fill', k => k.on ? 'var(--hit)' : 'var(--miss)');
    });
    all.attr('opacity', d => state.band === null || state.band === d.i ? 1 : .5);
  }

  function traits() {
    const label = `${state.genre === null ? 'all genres' : S.GEN[state.genre]}${state.band === null ? ', all prices' : ', ' + BANDS[state.band].k}`;
    const set = S.G.filter(g => ok(g) && inGenre(g) && (state.band === null || g.band === state.band));
    const base = S.G.filter(ok);
    root.select('#dd-q3').html(`What do the <em>${fmt(set.length)} successful games</em> in <em>${label}</em> have in common?`);
    const t = root.select('#dd-traits').html('');
    TRAITS.forEach(tr => {
      const rel = tr.rev ? set.filter(g => g.pos >= 0) : set, relB = tr.rev ? base.filter(g => g.pos >= 0) : base;
      const s = rel.length ? d3.mean(rel, g => tr.f(g) ? 1 : 0) : 0, b = d3.mean(relB, g => tr.f(g) ? 1 : 0);
      const d = t.append('div').attr('class', 'trait');
      d.append('div').attr('class', 'n').text(rel.length ? pct(s) : '–');
      d.append('div').attr('class', 'l').text(tr.k);
      d.append('div').attr('class', 'd' + (s - b > 0.05 ? ' up' : '')).text(`all successful: ${pct(b)}`);
    });
    const top = set.sort((a, b) => b.lo - a.lo || b.rev - a.rev).slice(0, 12);
    const tbl = root.select('#dd-table').html('');
    if (!top.length) { tbl.append('tr').append('td').attr('class', 'empty').text('No successful games in this selection.'); return; }
    const hr = tbl.append('tr'); hr.append('th').text('Game'); hr.append('th').text('Price'); hr.append('th').text('Owners ≥');
    TRAITS.forEach(tr => hr.append('th').text(tr.k));
    top.forEach(g => {
      const r = tbl.append('tr'); r.append('td').text(g.name || '(unnamed)'); r.append('td').attr('class', 'mono').text(g.price ? '$' + g.price.toFixed(2) : 'Free'); r.append('td').attr('class', 'mono').text(d3.format('.2~s')(g.lo));
      TRAITS.forEach(tr => r.append('td').attr('class', 'c').append('span').attr('class', 'box' + (tr.f(g) ? ' on' : '')));
    });
  }

  S.ready.then(() => {
    root.select('.loading').remove();
    root.select('#dd-metric').on('change', e => { state.metric = e.target.value; render(); });
    render();
    S.on('threshold', render);
  });
})();
