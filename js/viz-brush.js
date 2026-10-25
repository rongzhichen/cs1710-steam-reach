// Explore mode: brushable price-versus-owners scatter with linked genre and trait panels.
// Ported from the MS5 Prototype B. Mounts into #explore.
(function () {
  const S = window.SteamReach, { LOWS, LAB, TRAITS, fmt, pct } = S;
  const PMAX = 60, M = { l: 64, r: 14, t: 10, b: 34 };
  const root = d3.select('#explore');
  const state = { show: 'all', genre: null, sel: null };
  let W = 0, H = 0, x, y, cv, ctx, brush, ov;
  const visible = g => state.show === 'all' || g.lo >= S.thr;
  const px = g => Math.min(g.price, PMAX);
  const yPos = g => y(g.bandIdx) + y.bandwidth() * (0.5 + g.jit * 0.9);

  function setup() {
    const plot = root.select('#bx-plot').node();
    const box = plot.getBoundingClientRect(); W = box.width; H = box.height;
    if (!W) return;
    cv = root.select('#bx-canvas').node(); const dpr = window.devicePixelRatio || 1; cv.width = W * dpr; cv.height = H * dpr; ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    x = d3.scaleLinear().domain([0, PMAX]).range([M.l, W - M.r]);
    y = d3.scaleBand().domain(d3.range(LOWS.length)).range([H - M.b, M.t]).paddingInner(.15);
    ov = root.select('#bx-overlay').attr('viewBox', `0 0 ${W} ${H}`).html('');
    const ax = ov.append('g');
    ax.append('g').attr('transform', `translate(0,${H - M.b})`).call(d3.axisBottom(x).ticks(6).tickFormat(d => d === PMAX ? '$60+' : '$' + d)).call(s => s.select('.domain').attr('stroke', 'var(--line)')).selectAll('line').attr('stroke', 'var(--line)');
    ax.append('g').attr('transform', `translate(${M.l},0)`).call(d3.axisLeft(y).tickFormat(i => LAB[i])).call(s => s.select('.domain').remove()).selectAll('line').remove();
    ax.selectAll('text').attr('fill', 'var(--fg2)').style('font-family', 'var(--mono)').style('font-size', '10px');
    ax.append('text').attr('x', W - M.r).attr('y', H - 4).attr('text-anchor', 'end').attr('fill', 'var(--muted)').text('price (USD, snapshot)');
    ax.append('text').attr('x', M.l).attr('y', M.t - 2).attr('fill', 'var(--muted)').text('estimated-owner band');
    ov.append('line').attr('class', 'thr').attr('x1', M.l).attr('x2', W - M.r).attr('stroke', 'var(--sel)').attr('stroke-dasharray', '5 4').attr('stroke-width', 1.5);
    ov.append('text').attr('class', 'thrl').attr('x', W - M.r).attr('text-anchor', 'end').attr('fill', 'var(--sel)').style('font-family', 'var(--mono)');
    brush = d3.brush().extent([[M.l, M.t], [W - M.r, H - M.b]]).on('brush end', brushed);
    ov.append('g').attr('class', 'brush').call(brush);
    ov.select('.brush .selection').attr('fill', 'var(--sel)').attr('fill-opacity', .08).attr('stroke', 'var(--sel)');
    state.sel = null;
    draw(); panels();
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    const col = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const cDot = col('--dot'), cHit = col('--hit'), cSel = col('--sel'), r = 1.4;
    const pass = (test, color, alpha) => { ctx.fillStyle = color; ctx.globalAlpha = alpha; ctx.beginPath(); for (const g of S.G) { if (!visible(g) || !test(g)) continue; ctx.moveTo(x(px(g)) + r, yPos(g)); ctx.arc(x(px(g)), yPos(g), r, 0, 6.283); } ctx.fill(); };
    const inG = g => state.genre !== null && (g.mask >> state.genre & 1);
    pass(g => g.lo < S.thr && !inG(g), cDot, .35);
    pass(g => g.lo >= S.thr && !inG(g), cHit, .55);
    pass(inG, cSel, .7);
    ctx.globalAlpha = 1;
    const ti = LOWS.indexOf(S.thr); const ly = y(ti) + y.bandwidth() + (y.step() - y.bandwidth()) / 2;
    ov.select('line.thr').attr('y1', ly).attr('y2', ly); ov.select('text.thrl').attr('y', ly - 4).text('success line ≥ ' + d3.format('.2~s')(S.thr));
  }

  function brushed({ selection }) {
    if (!selection) { state.sel = null; panels(); return; }
    const [[x0, y0], [x1, y1]] = selection;
    state.sel = S.G.filter(g => visible(g) && x(px(g)) >= x0 && x(px(g)) <= x1 && yPos(g) >= y0 && yPos(g) <= y1);
    panels();
  }

  function panels() {
    const set = state.sel ?? S.G.filter(visible), all = S.G;
    root.select('.status').html(state.sel ? `selected <b>${fmt(set.length)}</b> games · ${pct(d3.mean(set, g => g.lo >= S.thr ? 1 : 0) || 0)} successful` : `no brush: showing ${fmt(set.length)} games`);
    const rows = S.GEN.map((name, i) => ({ i, name: name.replace('Massively Multiplayer', 'MMO'), s: set.length ? d3.mean(set, g => g.mask >> i & 1) : 0, b: d3.mean(all, g => g.mask >> i & 1) }));
    const gx = d3.scaleLinear().domain([0, 1]).range([120, 400]); const gy = d3.scaleBand().domain(rows.map(d => d.i)).range([6, 256]).paddingInner(.3);
    const svg = root.select('#bx-genres'); const sel = svg.selectAll('g.gbar').data(rows, d => d.i);
    const ent = sel.enter().append('g').attr('class', 'gbar').attr('tabindex', 0).attr('role', 'button');
    ent.append('rect').attr('class', 'hit').attr('x', 0).attr('width', 420).attr('fill', 'transparent').attr('rx', 3);
    ent.append('text').attr('x', 112).attr('text-anchor', 'end').attr('dy', '.32em');
    ent.append('rect').attr('class', 'v').attr('x', gx(0)).attr('rx', 3);
    ent.append('line').attr('class', 'b').attr('stroke', 'var(--base)').attr('stroke-width', 2);
    ent.append('text').attr('class', 'n mono').attr('dy', '.32em');
    const toggle = d => { state.genre = state.genre === d.i ? null : d.i; draw(); panels(); };
    const all2 = ent.merge(sel).attr('transform', d => `translate(0,${gy(d.i)})`)
      .on('click', (e, d) => toggle(d))
      .on('keydown', (e, d) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(d); } })
      .on('mousemove', (e, d) => S.showTip(e, `${d.name}\nselection ${pct(d.s)} · all games ${pct(d.b)}`)).on('mouseleave', S.hideTip);
    all2.select('rect.hit').attr('y', -3).attr('height', gy.bandwidth() + 6).attr('stroke', d => state.genre === d.i ? 'var(--sel)' : 'none').attr('fill', d => state.genre === d.i ? 'var(--sel-soft)' : 'transparent');
    all2.select('text').text(d => d.name).attr('y', gy.bandwidth() / 2).attr('font-weight', d => state.genre === d.i ? 600 : 400);
    all2.select('rect.v').attr('y', 0).attr('height', gy.bandwidth()).attr('width', d => Math.max(0, gx(d.s) - gx(0))).attr('fill', d => state.genre === d.i ? 'var(--sel)' : 'var(--hit)');
    all2.select('line.b').attr('x1', d => gx(d.b)).attr('x2', d => gx(d.b)).attr('y1', -2).attr('y2', gy.bandwidth() + 2);
    all2.select('text.n').attr('x', d => gx(d.s) + 5).attr('y', gy.bandwidth() / 2).text(d => pct(d.s)).attr('fill', 'var(--fg2)');
    const tset = state.genre === null ? set : set.filter(g => g.mask >> state.genre & 1);
    root.select('#bx-tq').html(`Share of <em>${state.genre === null ? 'selected games' : 'selected ' + S.GEN[state.genre] + ' games'}</em> meeting each condition, with the all-games tick for comparison.`);
    const tr = TRAITS.map((t, i) => { const rs = t.rev ? tset.filter(g => g.pos >= 0) : tset, rb = t.rev ? all.filter(g => g.pos >= 0) : all; return { i, k: t.k, s: rs.length ? d3.mean(rs, g => t.f(g) ? 1 : 0) : 0, b: d3.mean(rb, g => t.f(g) ? 1 : 0) }; });
    const ty = d3.scaleBand().domain(tr.map(d => d.i)).range([6, 134]).paddingInner(.3); const tx = d3.scaleLinear().domain([0, 1]).range([160, 400]);
    const ts = root.select('#bx-traits'); const tsel = ts.selectAll('g.tbar').data(tr, d => d.i);
    const tent = tsel.enter().append('g').attr('class', 'tbar');
    tent.append('text').attr('x', 152).attr('text-anchor', 'end').attr('dy', '.32em');
    tent.append('rect').attr('x', tx(0)).attr('rx', 3).attr('fill', 'var(--hit)');
    tent.append('line').attr('stroke', 'var(--base)').attr('stroke-width', 2);
    tent.append('text').attr('class', 'n mono').attr('dy', '.32em').attr('fill', 'var(--fg2)');
    const tall = tent.merge(tsel).attr('transform', d => `translate(0,${ty(d.i)})`).on('mousemove', (e, d) => S.showTip(e, `${d.k}\nselection ${pct(d.s)} · all games ${pct(d.b)}`)).on('mouseleave', S.hideTip);
    tall.select('text').text(d => d.k).attr('y', ty.bandwidth() / 2);
    tall.select('rect').attr('y', 0).attr('height', ty.bandwidth()).attr('width', d => Math.max(0, tx(d.s) - tx(0)));
    tall.select('line').attr('x1', d => tx(d.b)).attr('x2', d => tx(d.b)).attr('y1', -2).attr('y2', ty.bandwidth() + 2);
    tall.select('text.n').attr('x', d => tx(d.s) + 5).attr('y', ty.bandwidth() / 2).text(d => pct(d.s));
  }

  S.ready.then(() => {
    root.select('.loading').remove();
    setup();
    let t; window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(setup, 150); });
    root.select('#bx-show').on('change', e => { state.show = e.target.value; draw(); panels(); });
    root.select('#bx-clear').on('click', () => { ov.select('g.brush').call(brush.move, null); state.sel = null; state.genre = null; draw(); panels(); });
    S.on('threshold', () => { draw(); panels(); });
  });
})();
