<script>
  // Comparison tool (storyboard panel 6): genre bubbles -> price shelves -> trait tiles and named games.
  // V3 changes from the test session: n on each bubble, a stamp that never rounds a real rate to zero
  // cells, a small-sample guard on the tiles, the ▲ marker, ARIA on every mark, a "best shelf" answer,
  // horizontal scrolling on narrow screens, and a copy-link button for the current peer group.
  import * as d3 from 'd3';
  import { threshold, dataset, peerGenre, peerBand } from '$lib/stores.js';
  import { BANDS, TRAITS, fmt, pct, traitShare } from '$lib/data.js';
  import { showTip, hideTip } from '$lib/tip.js';
  import ThresholdSelect from './ThresholdSelect.svelte';
  import CopyLink from './CopyLink.svelte';

  const SMALL = 200;
  let metric = $state('share');
  const genre = $derived($peerGenre);
  const band = $derived($peerBand);
  let bubbleSvg, shelfSvg;

  const GEN = $derived($dataset?.GEN ?? []);
  const inGenre = g => genre === null || (g.mask >> genre) & 1;
  const genreLabel = $derived(genre === null ? 'all genres' : GEN[genre]);

  function pickGenre(i) { $peerGenre = genre === i ? null : i; $peerBand = null; }
  function pickBand(i) { $peerBand = band === i ? null : i; }
  const key = (fn, d) => e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(d); } };
  const short = name => name.replace('Massively Multiplayer', 'MMO');

  // 1 · Genre bubbles. Area encodes the chosen metric (reach rate by default); n is printed on the face
  // because the test session showed that size was read as genre size.
  $effect(() => {
    const d = $dataset; if (!d || !bubbleSvg) return;
    const thr = $threshold, m = metric, sel = genre;
    const rows = d.GEN.map((name, i) => { const s = d.G.filter(g => (g.mask >> i) & 1); return { i, name, n: s.length, mean: d3.mean(s, g => g.mid), share: d3.mean(s, g => (g.lo >= thr ? 1 : 0)) }; });
    const v = r => r[m];
    const r = d3.scaleSqrt().domain([0, d3.max(rows, v)]).range([0, 52]);
    const x = d3.scalePoint().domain(rows.map(q => q.i)).range([60, 1000]);
    const svg = d3.select(bubbleSvg);
    const join = svg.selectAll('g.bubble').data(rows, q => q.i);
    const ent = join.enter().append('g').attr('class', 'bubble').attr('tabindex', 0).attr('role', 'button');
    ent.append('circle').attr('cy', 78).attr('fill', 'var(--hit-soft)').attr('stroke', 'var(--hit)').attr('stroke-width', 1.5);
    ent.append('text').attr('class', 'mono').attr('text-anchor', 'middle').attr('y', 78).attr('font-size', 12);
    ent.append('text').attr('class', 'mono nn').attr('text-anchor', 'middle').attr('y', 93).attr('font-size', 10).attr('fill', 'var(--fg2)');
    ent.append('text').attr('class', 'lab').attr('text-anchor', 'middle').attr('y', 165).attr('font-size', 12);
    ent.append('line').attr('y1', 130).attr('y2', 150).attr('stroke', 'var(--line)');
    const all = ent.merge(join).attr('transform', q => `translate(${x(q.i)},0)`)
      .attr('aria-pressed', q => String(sel === q.i))
      .attr('aria-label', q => `${q.name}: ${fmt(q.n)} games, ${pct(q.share)} reach the threshold${m === 'mean' ? `, typical owner estimate ${d3.format('.3~s')(q.mean)}` : ''}`)
      .on('click', (e, q) => pickGenre(q.i))
      .on('keydown', (e, q) => key(pickGenre, q.i)(e))
      .on('mousemove', (e, q) => showTip(e, `${q.name}\nn = ${fmt(q.n)} games\nreach rate ${pct(q.share)}\ntypical owner estimate ${d3.format('.3~s')(q.mean)}`))
      .on('mouseleave', hideTip);
    all.select('circle').attr('r', q => Math.max(6, r(v(q))))
      .attr('fill', q => (sel === q.i ? 'var(--sel-soft)' : 'var(--hit-soft)'))
      .attr('stroke', q => (sel === q.i ? 'var(--sel)' : 'var(--hit)'))
      .attr('stroke-width', q => (sel === q.i ? 3 : 1.5))
      .attr('opacity', q => (sel === null || sel === q.i ? 1 : 0.45));
    all.select('text.mono:not(.nn)').text(q => (m === 'mean' ? d3.format('.3~s')(q.mean) : pct(q.share)));
    all.select('text.nn').text(q => `n = ${fmt(q.n)}`);
    all.select('text.lab').text(q => short(q.name)).attr('font-weight', q => (sel === q.i ? 600 : 400)).attr('fill', q => (sel === q.i ? 'var(--sel)' : 'var(--fg)'));
    all.select('line').attr('y1', q => 78 + Math.max(6, r(v(q))));
    const cap = (m === 'mean' ? 'Circle area = typical owner estimate (mean of band midpoints).' : 'Circle area = reach rate, the share of the genre meeting the success threshold.') + ' Size does not encode the number of games; n is printed under each figure.';
    svg.selectAll('text.axis').data([0]).join('text').attr('class', 'axis').attr('x', 0).attr('y', 14).attr('font-size', 11).attr('fill', 'var(--muted)').text(cap);
  });

  // 2 · Price shelves (20-cell stamp from the JL3 hand sketch: 4 wide, 5 tall). Any non-zero rate keeps
  // at least one cell; the printed percentage carries the fine comparison.
  const shelfRows = $derived.by(() => {
    const d = $dataset; if (!d) return [];
    const thr = $threshold, gsel = genre;
    const pool = d.G.filter(g => gsel === null || (g.mask >> gsel) & 1);
    return BANDS.map((b, i) => { const s = pool.filter(g => g.band === i); const h = s.filter(g => g.lo >= thr).length; return { i, k: b.k, n: s.length, h, share: s.length ? h / s.length : 0 }; });
  });
  const best = $derived.by(() => {
    const rows = shelfRows.filter(r => r.n >= SMALL);
    if (!rows.length) return null;
    return rows.reduce((a, b) => (b.share > a.share ? b : a));
  });
  $effect(() => {
    const rows = shelfRows; if (!rows.length || !shelfSvg) return;
    const sel = band;
    const svg = d3.select(shelfSvg);
    const x = d3.scaleBand().domain(rows.map(q => q.i)).range([20, 1050]).paddingInner(0.18);
    const join = svg.selectAll('g.shelf').data(rows, q => q.i);
    const ent = join.enter().append('g').attr('class', 'shelf').attr('tabindex', 0).attr('role', 'button');
    ent.append('rect').attr('class', 'bg').attr('x', -6).attr('y', 20).attr('rx', 5).attr('height', 225).attr('fill', 'transparent');
    ent.append('text').attr('class', 'k').attr('y', 40).attr('font-size', 14).attr('font-weight', 600);
    ent.append('text').attr('class', 'pc mono').attr('y', 62).attr('font-size', 13);
    ent.append('text').attr('class', 'n mono').attr('y', 236).attr('font-size', 11).attr('fill', 'var(--muted)');
    ent.append('g').attr('class', 'cells').attr('transform', 'translate(0,74)');
    const all = ent.merge(join).attr('transform', q => `translate(${x(q.i)},0)`)
      .attr('aria-pressed', q => String(sel === q.i))
      .attr('aria-label', q => `${q.k}: ${fmt(q.h)} of ${fmt(q.n)} games meet the threshold, ${pct(q.share)}${q.n && q.n < SMALL ? ', small group' : ''}`)
      .on('click', (e, q) => pickBand(q.i))
      .on('keydown', (e, q) => key(pickBand, q.i)(e))
      .on('mousemove', (e, q) => showTip(e, `${q.k}\n${fmt(q.h)} of ${fmt(q.n)} games meet the threshold\n${pct(q.share)}${q.n && q.n < SMALL ? ' *' : ''}`))
      .on('mouseleave', hideTip);
    all.select('rect.bg').attr('width', x.bandwidth() + 12).attr('fill', q => (sel === q.i ? 'var(--sel-soft)' : 'transparent')).attr('stroke', q => (sel === q.i ? 'var(--sel)' : 'none'));
    all.select('text.k').text(q => q.k).attr('fill', q => (sel === q.i ? 'var(--sel)' : 'var(--fg)'));
    all.select('text.pc').text(q => (q.n ? pct(q.share) + ' successful' + (q.n < SMALL ? ' *' : '') : 'no games'));
    all.select('text.n').text(q => `n = ${fmt(q.n)}`);
    const cw = (x.bandwidth() - 3 * 4) / 4, ch = 26;
    all.select('g.cells').each(function (q) {
      const filled = q.share > 0 ? Math.max(1, Math.round(q.share * 20)) : 0;
      const cells = d3.range(20).map(i => ({ i, on: i < filled, row: 4 - Math.floor(i / 4), col: i % 4 }));
      d3.select(this).selectAll('rect.cell').data(cells).join('rect').attr('class', 'cell').attr('rx', 3)
        .attr('x', c => c.col * (cw + 4)).attr('y', c => c.row * (ch + 4)).attr('width', cw).attr('height', ch)
        .attr('fill', c => (c.on ? 'var(--hit)' : 'var(--miss)'));
    });
    all.attr('opacity', q => (sel === null || sel === q.i ? 1 : 0.5));
  });

  // 3 · Traits and named games, computed reactively and rendered by Svelte.
  const sets = $derived.by(() => {
    const d = $dataset; if (!d) return null;
    const thr = $threshold;
    const set = d.G.filter(g => g.lo >= thr && inGenre(g) && (band === null || g.band === band));
    const base = d.G.filter(g => g.lo >= thr);
    const tiles = TRAITS.map(tr => {
      const rel = tr.rev ? set.filter(g => g.pos >= 0) : set;
      const s = traitShare(set, tr), b = traitShare(base, tr);
      return { k: tr.k, has: rel.length > 0, n: rel.length, small: rel.length > 0 && rel.length < SMALL, s, b, up: s - b > 0.05 };
    });
    const top = [...set].sort((a, b) => b.lo - a.lo || b.rev - a.rev).slice(0, 12);
    return { set, tiles, top, small: set.length > 0 && set.length < SMALL };
  });
  const traitLabel = $derived(`${genreLabel}${band === null ? ', all prices' : ', ' + BANDS[band].k}`);
</script>

<div class="bar">
  <ThresholdSelect />
  <label>Genre bubble size
    <select id="dd-metric" bind:value={metric}><option value="share">reach rate (share meeting the threshold)</option><option value="mean">typical owner estimate</option></select>
  </label>
  <div class="crumb">
    <button onclick={() => { $peerGenre = null; $peerBand = null; }}>All genres</button>
    {#if genre !== null}<span> › </span><b>{GEN[genre]}</b>{/if}
    {#if band !== null}<span> › </span><b>{BANDS[band].k}</b>{/if}
    {#if genre === null && band === null}<span style="color:var(--muted)">  (nothing selected)</span>{/if}
  </div>
  <CopyLink />
</div>
<p class="note scope-note">The threshold moves this tool, the explorer and the peer lab. The opening story is written at 100,000 owners and stays there. Your genre, shelf and threshold are also carried in the page address, so the link above reproduces this view.</p>
{#if !$dataset}<p class="loading">Loading {fmt($dataset?.meta?.N ?? 99754)} games…</p>{/if}
<div class="grid">
  <div class="panel">
    <h3>1 · Genre reach</h3>
    <p class="q">Which genres reach the most owners? <em>Click a bubble to focus the views below on that genre.</em></p>
    <div class="tool-scroll"><svg bind:this={bubbleSvg} id="dd-bubbles" viewBox="0 0 1060 190" role="group" aria-label="Genre bubbles"></svg></div>
  </div>
  <div class="panel">
    <h3>2 · Price shelves</h3>
    <p class="q" id="dd-q2">Within <em>{genreLabel}</em>, how often does a game on each shelf reach the threshold? <em>Click a shelf to list its traits.</em></p>
    <div class="tool-scroll"><svg bind:this={shelfSvg} id="dd-shelves" viewBox="0 0 1060 250" role="group" aria-label="Price shelves"></svg></div>
    {#if best}
      <p class="note answer" aria-live="polite">Highest reach rate in <em>{genreLabel}</em> among shelves with at least {SMALL} games: <b>{best.k}</b> at {pct(best.share)} ({fmt(best.h)} of {fmt(best.n)}). A rate, not a recommendation: pricier shelves hold different teams and budgets.</p>
    {/if}
    <p class="note">Each stamp shows the rate in 5-point cells; any non-zero rate keeps one cell, so read the printed percentage for close comparisons. * = fewer than {SMALL} games on the shelf.</p>
  </div>
  <div class="panel">
    <h3>3 · Traits of the successful games</h3>
    {#if sets}
      <p class="q" id="dd-q3">What {sets.set.length === 1 ? 'does' : 'do'} the <em>{fmt(sets.set.length)} successful {sets.set.length === 1 ? 'game' : 'games'}</em> in <em>{traitLabel}</em> have in common?</p>
      {#if sets.small}
        <p class="sample-banner" role="status"><b>Small peer group.</b> These tiles come from {fmt(sets.set.length)} {sets.set.length === 1 ? 'game' : 'games'}, so a few titles can move a share by many points. Shares marked * rest on fewer than {SMALL} games. The peer lab below shows the uncertainty as an interval.</p>
      {:else if !sets.set.length}
        <p class="sample-banner" role="status">No successful games in this selection at this threshold. That is a count of zero, not a rate of zero: try a wider shelf or a lower threshold.</p>
      {/if}
      <div class="traits" id="dd-traits">
        {#each sets.tiles as t}
          <div class="trait" class:small={t.small}>
            <div class="n">{t.has ? pct(t.s) + (t.small ? ' *' : '') : '–'}</div>
            <div class="l">{t.k}</div>
            <div class="d" class:up={t.up}>{t.up ? '▲ ' : ''}all successful: {pct(t.b)}</div>
          </div>
        {/each}
      </div>
      <div class="tscroll">
        <table id="dd-table">
          {#if !sets.top.length}
            <tbody><tr><td class="empty">No successful games in this selection.</td></tr></tbody>
          {:else}
            <thead><tr><th>Game</th><th>Price</th><th>Owners ≥</th>{#each TRAITS as tr}<th>{tr.k}</th>{/each}</tr></thead>
            <tbody>
              {#each sets.top as g}
                <tr>
                  <td>{g.name || '(unnamed)'}</td>
                  <td class="mono">{g.price ? '$' + g.price.toFixed(2) : 'Free'}</td>
                  <td class="mono">{d3.format('.2~s')(g.lo)}</td>
                  {#each TRAITS as tr}<td class="c"><span class="box" class:on={tr.f(g)}></span></td>{/each}
                </tr>
              {/each}
            </tbody>
          {/if}
        </table>
      </div>
    {:else}
      <p class="q" id="dd-q3"></p>
    {/if}
    <p class="note">Each tile shows the share of successful games in the current selection that meet the condition, and below it the same share among all successful games. ▲ marks a share at least 5 points above that baseline; * marks a share from fewer than {SMALL} games. Filled box = meets condition. Review share needs ≥50 reviews. Owner estimates are bands, not sales.</p>
  </div>
</div>
