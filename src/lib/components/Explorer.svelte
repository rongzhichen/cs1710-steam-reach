<script>
  // Explore mode: brushable price-versus-owners canvas scatter with linked genre and trait panels.
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { threshold, dataset } from '$lib/stores.js';
  import { LOWS, LAB, TRAITS, fmt, pct, traitShare } from '$lib/data.js';
  import { showTip, hideTip } from '$lib/tip.js';
  import ThresholdSelect from './ThresholdSelect.svelte';

  const PMAX = 60, M = { l: 64, r: 14, t: 10, b: 34 };
  let show = $state('all');
  let genre = $state(null);
  let sel = $state(null);            // brushed games, or null when no brush
  let plotEl, canvas, overlay, genreSvg, traitSvg;
  let W = 0, H = 0, x, y, ctx, brush, ov, brushG;

  const GEN = $derived($dataset?.GEN ?? []);
  const visible = (g, thr) => show === 'all' || g.lo >= thr;
  const px = g => Math.min(g.price, PMAX);
  const yPos = g => y(g.bandIdx) + y.bandwidth() * (0.5 + g.jit * 0.9);

  // Build scales, axes and the brush for the current plot size.
  function setup() {
    if (!plotEl || !canvas) return;
    const box = plotEl.getBoundingClientRect(); W = box.width; H = box.height;
    if (!W) return;
    const dpr = window.devicePixelRatio || 1; canvas.width = W * dpr; canvas.height = H * dpr;
    ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    x = d3.scaleLinear().domain([0, PMAX]).range([M.l, W - M.r]);
    y = d3.scaleBand().domain(d3.range(LOWS.length)).range([H - M.b, M.t]).paddingInner(0.15);
    ov = d3.select(overlay).attr('viewBox', `0 0 ${W} ${H}`).html('');
    const ax = ov.append('g');
    ax.append('g').attr('transform', `translate(0,${H - M.b})`).call(d3.axisBottom(x).ticks(6).tickFormat(d => (d === PMAX ? '$60+' : '$' + d))).call(s => s.select('.domain').attr('stroke', 'var(--line)')).selectAll('line').attr('stroke', 'var(--line)');
    ax.append('g').attr('transform', `translate(${M.l},0)`).call(d3.axisLeft(y).tickFormat(i => LAB[i])).call(s => s.select('.domain').remove()).selectAll('line').remove();
    ax.selectAll('text').attr('fill', 'var(--fg2)').style('font-family', 'var(--mono)').style('font-size', '10px');
    ax.append('text').attr('x', W - M.r).attr('y', H - 4).attr('text-anchor', 'end').attr('fill', 'var(--muted)').text('price (USD, snapshot)');
    ax.append('text').attr('x', M.l).attr('y', M.t - 2).attr('fill', 'var(--muted)').text('estimated-owner band');
    ov.append('line').attr('class', 'thr').attr('x1', M.l).attr('x2', W - M.r).attr('stroke', 'var(--sel)').attr('stroke-dasharray', '5 4').attr('stroke-width', 1.5);
    ov.append('text').attr('class', 'thrl').attr('x', W - M.r).attr('text-anchor', 'end').attr('fill', 'var(--sel)').style('font-family', 'var(--mono)');
    brush = d3.brush().extent([[M.l, M.t], [W - M.r, H - M.b]]).on('brush end', brushed);
    brushG = ov.append('g').attr('class', 'brush').call(brush);
    ov.select('.brush .selection').attr('fill', 'var(--sel)').attr('fill-opacity', 0.08).attr('stroke', 'var(--sel)');
    sel = null;
    draw();
  }

  function draw() {
    const d = $dataset; if (!ctx || !d) return;
    const thr = $threshold;
    ctx.clearRect(0, 0, W, H);
    const col = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const cDot = col('--dot'), cHit = col('--hit'), cSel = col('--sel'), r = 1.4;
    const pass = (test, color, alpha) => {
      ctx.fillStyle = color; ctx.globalAlpha = alpha; ctx.beginPath();
      for (const g of d.G) { if (!visible(g, thr) || !test(g)) continue; ctx.moveTo(x(px(g)) + r, yPos(g)); ctx.arc(x(px(g)), yPos(g), r, 0, 6.283); }
      ctx.fill();
    };
    const inG = g => genre !== null && (g.mask >> genre) & 1;
    pass(g => g.lo < thr && !inG(g), cDot, 0.35);
    pass(g => g.lo >= thr && !inG(g), cHit, 0.55);
    pass(inG, cSel, 0.7);
    ctx.globalAlpha = 1;
    const ti = LOWS.indexOf(thr); const ly = y(ti) + y.bandwidth() + (y.step() - y.bandwidth()) / 2;
    ov.select('line.thr').attr('y1', ly).attr('y2', ly); ov.select('text.thrl').attr('y', ly - 4).text('success line ≥ ' + d3.format('.2~s')(thr));
  }

  function brushed({ selection }) {
    const d = $dataset; if (!d) return;
    if (!selection) { sel = null; return; }
    const [[x0, y0], [x1, y1]] = selection, thr = $threshold;
    sel = d.G.filter(g => visible(g, thr) && x(px(g)) >= x0 && x(px(g)) <= x1 && yPos(g) >= y0 && yPos(g) <= y1);
  }

  function clear() { if (brushG) brushG.call(brush.move, null); sel = null; genre = null; }

  onMount(() => {
    const ro = new ResizeObserver(() => { clearTimeout(t); t = setTimeout(setup, 150); });
    let t; ro.observe(plotEl);
    setup();
    return () => ro.disconnect();
  });

  // Redraw the canvas whenever the data, threshold, genre highlight or visibility filter changes.
  $effect(() => { void $dataset; void $threshold; void genre; void show; draw(); });
  // A visibility or threshold change invalidates the brushed set, so recompute it from the current brush.
  $effect(() => {
    void show; void $threshold; void $dataset;
    if (brushG && brushG.node()) { const s = d3.brushSelection(brushG.node()); if (s) brushed({ selection: s }); }
  });

  // Linked panels
  const panel = $derived.by(() => {
    const d = $dataset; if (!d) return null;
    const thr = $threshold;
    const set = sel ?? d.G.filter(g => visible(g, thr)), all = d.G;
    const okShare = set.length ? d3.mean(set, g => (g.lo >= thr ? 1 : 0)) : 0;
    const genres = d.GEN.map((name, i) => ({ i, name: name.replace('Massively Multiplayer', 'MMO'), s: set.length ? d3.mean(set, g => (g.mask >> i) & 1) : 0, b: d3.mean(all, g => (g.mask >> i) & 1) }));
    const tset = genre === null ? set : set.filter(g => (g.mask >> genre) & 1);
    const traits = TRAITS.map((t, i) => ({ i, k: t.k, s: traitShare(tset, t), b: traitShare(all, t) }));
    return { set, okShare, genres, traits };
  });

  $effect(() => {
    const p = panel; if (!p || !genreSvg || !traitSvg) return;
    const gsel = genre;
    const gx = d3.scaleLinear().domain([0, 1]).range([120, 400]); const gy = d3.scaleBand().domain(p.genres.map(q => q.i)).range([6, 256]).paddingInner(0.3);
    const svg = d3.select(genreSvg); const join = svg.selectAll('g.gbar').data(p.genres, q => q.i);
    const ent = join.enter().append('g').attr('class', 'gbar').attr('tabindex', 0).attr('role', 'button');
    ent.append('rect').attr('class', 'hit').attr('x', 0).attr('width', 420).attr('fill', 'transparent').attr('rx', 3);
    ent.append('text').attr('x', 112).attr('text-anchor', 'end').attr('dy', '.32em');
    ent.append('rect').attr('class', 'v').attr('x', gx(0)).attr('rx', 3);
    ent.append('line').attr('class', 'b').attr('stroke', 'var(--base)').attr('stroke-width', 2);
    ent.append('text').attr('class', 'n mono').attr('dy', '.32em');
    const toggle = q => { genre = genre === q.i ? null : q.i; };
    const all2 = ent.merge(join).attr('transform', q => `translate(0,${gy(q.i)})`)
      .on('click', (e, q) => toggle(q))
      .on('keydown', (e, q) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(q); } })
      .on('mousemove', (e, q) => showTip(e, `${q.name}\nselection ${pct(q.s)} · all games ${pct(q.b)}`)).on('mouseleave', hideTip);
    all2.select('rect.hit').attr('y', -3).attr('height', gy.bandwidth() + 6).attr('stroke', q => (gsel === q.i ? 'var(--sel)' : 'none')).attr('fill', q => (gsel === q.i ? 'var(--sel-soft)' : 'transparent'));
    all2.select('text').text(q => q.name).attr('y', gy.bandwidth() / 2).attr('font-weight', q => (gsel === q.i ? 600 : 400));
    all2.select('rect.v').attr('y', 0).attr('height', gy.bandwidth()).attr('width', q => Math.max(0, gx(q.s) - gx(0))).attr('fill', q => (gsel === q.i ? 'var(--sel)' : 'var(--hit)'));
    all2.select('line.b').attr('x1', q => gx(q.b)).attr('x2', q => gx(q.b)).attr('y1', -2).attr('y2', gy.bandwidth() + 2);
    all2.select('text.n').attr('x', q => gx(q.s) + 5).attr('y', gy.bandwidth() / 2).text(q => pct(q.s)).attr('fill', 'var(--fg2)');

    const ty = d3.scaleBand().domain(p.traits.map(q => q.i)).range([6, 134]).paddingInner(0.3); const tx = d3.scaleLinear().domain([0, 1]).range([160, 400]);
    const ts = d3.select(traitSvg); const tsel = ts.selectAll('g.tbar').data(p.traits, q => q.i);
    const tent = tsel.enter().append('g').attr('class', 'tbar');
    tent.append('text').attr('x', 152).attr('text-anchor', 'end').attr('dy', '.32em');
    tent.append('rect').attr('x', tx(0)).attr('rx', 3).attr('fill', 'var(--hit)');
    tent.append('line').attr('stroke', 'var(--base)').attr('stroke-width', 2);
    tent.append('text').attr('class', 'n mono').attr('dy', '.32em').attr('fill', 'var(--fg2)');
    const tall = tent.merge(tsel).attr('transform', q => `translate(0,${ty(q.i)})`).on('mousemove', (e, q) => showTip(e, `${q.k}\nselection ${pct(q.s)} · all games ${pct(q.b)}`)).on('mouseleave', hideTip);
    tall.select('text').text(q => q.k).attr('y', ty.bandwidth() / 2);
    tall.select('rect').attr('y', 0).attr('height', ty.bandwidth()).attr('width', q => Math.max(0, tx(q.s) - tx(0)));
    tall.select('line').attr('x1', q => tx(q.b)).attr('x2', q => tx(q.b)).attr('y1', -2).attr('y2', ty.bandwidth() + 2);
    tall.select('text.n').attr('x', q => tx(q.s) + 5).attr('y', ty.bandwidth() / 2).text(q => pct(q.s));
  });
</script>

<div class="bar">
  <ThresholdSelect label="Success line at owner band ≥" />
  <label>Show <select id="bx-show" bind:value={show}><option value="all">all games</option><option value="ok">successful only</option></select></label>
  <button id="bx-clear" onclick={clear}>Clear selection</button>
  <div class="status">
    {#if panel}
      {#if sel}selected <b>{fmt(panel.set.length)}</b> games · {pct(panel.okShare)} successful{:else}no brush: showing {fmt(panel.set.length)} games{/if}
    {/if}
  </div>
</div>
{#if !$dataset}<p class="loading">Loading…</p>{/if}
<div class="grid two">
  <div class="panel">
    <h3>Game-level scatter</h3>
    <p class="q">Price (x) against estimated-owner band (y). <em>Drag to brush a region.</em> Dots above the dashed line count as successful.</p>
    <div class="plot" id="bx-plot" bind:this={plotEl}><canvas id="bx-canvas" bind:this={canvas}></canvas><svg id="bx-overlay" bind:this={overlay}></svg></div>
    <div class="legend"><span style="--c:var(--dot)">below success line</span><span style="--c:var(--hit)">successful</span><span style="--c:var(--sel)">highlighted genre</span></div>
  </div>
  <div class="col">
    <div class="panel">
      <h3>Genre mix of the selection</h3>
      <p class="q">Share of selected games in each genre. The black tick is the same share across all games. <em>Click a bar to highlight the genre.</em></p>
      <svg bind:this={genreSvg} id="bx-genres" viewBox="0 0 420 262"></svg>
    </div>
    <div class="panel">
      <h3>Traits of the selection</h3>
      <p class="q" id="bx-tq">Share of <em>{genre === null ? 'selected games' : 'selected ' + GEN[genre] + ' games'}</em> meeting each condition, with the all-games tick for comparison.</p>
      <svg bind:this={traitSvg} id="bx-traits" viewBox="0 0 420 140"></svg>
      <p class="note">Games can carry several genres, so genre shares overlap. Review share only counts games with ≥50 reviews.</p>
    </div>
  </div>
</div>
