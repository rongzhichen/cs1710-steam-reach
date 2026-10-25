// Narrative sections 1-5. Each chart reads data/summary.json (threshold 100k, the story's
// definition) so every number on the page matches the process book. Section 4 computes its
// trait shares from the game rows, because the summary only carries the two headline figures.
(function () {
  const S = window.SteamReach, { pct, fmt } = S;
  const THR = '100000';

  // Fill every <span data-story="key"> with the matching storyboard number.
  function fillNumbers(story) {
    document.querySelectorAll('[data-story]').forEach(el => {
      const v = story[el.dataset.story]; if (!v) return;
      el.textContent = el.dataset.as === 'n' ? fmt(v.n) : el.dataset.as === 'pct1' ? d3.format('.1%')(v.value) : pct(v.value);
      el.title = v.definition + (v.n ? ` (n = ${fmt(v.n)})` : '');
    });
  }

  // Horizontal bars. rows: [{label, groups:[{v, cls}], note}], one or two bars per row.
  function bars(sel, rows, opt = {}) {
    const W = 560, L = opt.left || 92, R = 60, rowH = rows[0].groups.length > 1 ? 44 : 30, pad = 8;
    const H = rows.length * rowH + pad * 2 + (opt.legend ? 22 : 0);
    const x = d3.scaleLinear().domain([0, opt.max || d3.max(rows, r => d3.max(r.groups, g => g.v)) * 1.08]).range([L, W - R]);
    const svg = d3.select(sel).attr('viewBox', `0 0 ${W} ${H}`).html('');
    const top = opt.legend ? 22 : 0;
    if (opt.legend) {
      const lg = svg.append('g').attr('transform', `translate(${L},12)`);
      opt.legend.forEach((t, i) => { const g = lg.append('g').attr('transform', `translate(${i * 190},0)`); g.append('rect').attr('width', 12).attr('height', 12).attr('y', -9).attr('rx', 2).attr('class', t.cls); g.append('text').attr('x', 17).attr('fill', 'var(--fg2)').text(t.label); });
    }
    const row = svg.selectAll('g.row').data(rows).join('g').attr('class', 'row').attr('transform', (d, i) => `translate(0,${top + pad + i * rowH})`);
    row.append('text').attr('x', L - 8).attr('y', rowH / 2).attr('dy', '.32em').attr('text-anchor', 'end').attr('font-size', 12).text(d => d.label);
    const n = rows[0].groups.length, bh = n > 1 ? 14 : 16, gap = 3;
    row.each(function (d) {
      const g = d3.select(this);
      d.groups.forEach((grp, k) => {
        const y0 = rowH / 2 - (n * bh + (n - 1) * gap) / 2 + k * (bh + gap);
        g.append('rect').attr('class', grp.cls).attr('x', x(0)).attr('y', y0).attr('height', bh).attr('rx', 2).attr('width', Math.max(0, x(grp.v) - x(0)));
        g.append('text').attr('class', 'mono').attr('x', x(grp.v) + 5).attr('y', y0 + bh / 2).attr('dy', '.32em').attr('font-size', 11).attr('fill', 'var(--fg2)').text(opt.format ? opt.format(grp.v) : pct(grp.v));
      });
      if (d.note) g.append('text').attr('x', L - 8).attr('y', rowH / 2 + 13).attr('text-anchor', 'end').attr('font-size', 10).attr('fill', 'var(--muted)').attr('class', 'mono').text(d.note);
    });
    if (opt.rule != null) svg.append('line').attr('x1', x(opt.rule)).attr('x2', x(opt.rule)).attr('y1', top + 2).attr('y2', H - 2).attr('stroke', 'var(--base)').attr('stroke-dasharray', '3 3');
  }

  S.ready.then(() => {
    const sum = S.summary, t = sum.byThreshold[THR], story = sum.story;
    fillNumbers(story);

    // 1 · Hook: where the successful games sit, by count.
    bars('#c-hook', t.price.map(r => ({ label: r.key, groups: [{ v: r.shareOfSuccess, cls: 'b-hit' }], note: `${fmt(r.hits)} games` })),
      { format: pct, left: 110 });

    // 2 · Counts versus rates: the same shelves, read as a proportion of each shelf.
    bars('#c-counts', t.price.map(r => ({ label: r.key, groups: [{ v: r.shareOfSuccess, cls: 'b-dot' }, { v: r.rate, cls: 'b-hit' }], note: `n = ${fmt(r.n)}` })),
      { left: 110, legend: [{ label: 'share of all successful games', cls: 'b-dot' }, { label: 'reach rate inside the shelf', cls: 'b-hit' }] });

    // 3 · Genre changes the comparison: rate per shelf, all genres against one genre.
    const gsel = d3.select('#c-genre-select');
    gsel.selectAll('option').data(sum.genres).join('option').attr('value', (d, i) => i).text(d => d);
    gsel.property('value', sum.genres.indexOf('RPG'));
    const drawGenre = () => {
      const gi = +gsel.property('value'), name = sum.genres[gi];
      d3.selectAll('.c-genre-name').text(name);
      bars('#c-genre', sum.priceBands.map((b, i) => {
        const all = t.price[i], cell = t.genrePrice[gi][i];
        return { label: b, groups: [{ v: all.rate, cls: 'b-dot' }, { v: cell.n ? cell.hits / cell.n : 0, cls: 'b-sel' }], note: `${name}: n = ${fmt(cell.n)}` };
      }), { left: 130, legend: [{ label: 'all genres', cls: 'b-dot' }, { label: name, cls: 'b-sel' }] });
    };
    gsel.on('change', drawGenre); drawGenre();

    // 4 · Comparable games have different traits: all successful vs successful RPG $10-20.
    const thr = +THR, rpg = sum.genres.indexOf('RPG');
    const succ = S.G.filter(g => g.lo >= thr), peer = succ.filter(g => (g.mask >> rpg & 1) && g.band === 3);
    const share = (set, tr) => { const rel = tr.rev ? set.filter(g => g.pos >= 0) : set; return rel.length ? d3.mean(rel, g => tr.f(g) ? 1 : 0) : 0; };
    bars('#c-traits', S.TRAITS.map(tr => ({ label: tr.k, groups: [{ v: share(succ, tr), cls: 'b-dot' }, { v: share(peer, tr), cls: 'b-sel' }] })),
      { left: 150, max: 1, legend: [{ label: `all successful games (${fmt(succ.length)})`, cls: 'b-dot' }, { label: `successful RPGs, $10–20 (${fmt(peer.length)})`, cls: 'b-sel' }] });
  });
})();
