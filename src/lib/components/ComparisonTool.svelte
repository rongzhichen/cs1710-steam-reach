<script>
  // Comparison tool (storyboard panel 6): genre bubbles -> price shelves -> trait tiles and named games.
  import * as d3 from 'd3';
  import { threshold, dataset } from '$lib/stores.js';
  import { BANDS, TRAITS, fmt, pct, traitShare } from '$lib/data.js';
  import { showTip, hideTip } from '$lib/tip.js';
  import ThresholdSelect from './ThresholdSelect.svelte';

  let metric = $state('mean');
  let genre = $state(null);
  let band = $state(null);
  let bubbleSvg, shelfSvg;

  const GEN = $derived($dataset?.GEN ?? []);
  const inGenre = g => genre === null || (g.mask >> genre) & 1;
  const genreLabel = $derived(genre === null ? 'all genres' : GEN[genre]);

  function pickGenre(i) { genre = genre === i ? null : i; band = null; }
  function pickBand(i) { band = band === i ? null : i; }
  const key = (fn, d) => e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(d); } };

  // 1 · Genre bubbles
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
    ent.append('text').attr('class', 'mono').attr('text-anchor', 'middle').attr('y', 82).attr('font-size', 12);
    ent.append('text').attr('class', 'lab').attr('text-anchor', 'middle').attr('y', 165).attr('font-size', 12);
    ent.append('line').attr('y1', 130).attr('y2', 150).attr('stroke', 'var(--line)');
    const all = ent.merge(join).attr('transform', q => `translate(${x(q.i)},0)`)
      .on('click', (e, q) => pickGenre(q.i))
      .on('keydown', (e, q) => key(pickGenre, q.i)(e))
      .on('mousemove', (e, q) => showTip(e, `${q.name}\nn = ${fmt(q.n)} games\nmean owner midpoint ${fmt(q.mean)}\nsuccessful ${pct(q.share)}`))
      .on('mouseleave', hideTip);
    all.select('circle').attr('r', q => Math.max(6, r(v(q))))
      .attr('fill', q => (sel === q.i ? 'var(--sel-soft)' : 'var(--hit-soft)'))
      .attr('stroke', q => (sel === q.i ? 'var(--sel)' : 'var(--hit)'))
      .attr('stroke-width', q => (sel === q.i ? 3 : 1.5))
      .attr('opacity', q => (sel === null || sel === q.i ? 1 : 0.45));
    all.select('text.mono').text(q => (m === 'mean' ? d3.format('.3~s')(q.mean) : pct(q.share)));
    all.select('text.lab').text(q => q.name.replace('Massively Multiplayer', 'MMO')).attr('font-weight', q => (sel === q.i ? 600 : 400)).attr('fill', q => (sel === q.i ? 'var(--sel)' : 'var(--fg)'));
    all.select('line').attr('y1', q => 78 + Math.max(6, r(v(q))));
    const cap = 'Circle area = ' + (m === 'mean' ? 'mean of estimated-owner band midpoints' : 'share of games meeting the success threshold');
    svg.selectAll('text.axis').data([0]).join('text').attr('class', 'axis').attr('x', 0).attr('y', 14).attr('font-size', 11).attr('fill', 'var(--muted)').text(cap);
  });

  // 2 · Price shelves (20-cell stamp from the JL3 hand sketch: 4 wide, 5 tall)
  $effect(() => {
    const d = $dataset; if (!d || !shelfSvg) return;
    const thr = $threshold, sel = band, gsel = genre;
    const pool = d.G.filter(g => gsel === null || (g.mask >> gsel) & 1);
    const rows = BANDS.map((b, i) => { const s = pool.filter(g => g.band === i); const h = s.filter(g => g.lo >= thr).length; return { i, k: b.k, n: s.length, h, share: s.length ? h / s.length : 0 }; });
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
      .on('click', (e, q) => pickBand(q.i))
      .on('keydown', (e, q) => key(pickBand, q.i)(e))
      .on('mousemove', (e, q) => showTip(e, `${q.k}\n${fmt(q.h)} of ${fmt(q.n)} games meet the threshold\n${pct(q.share)}`))
      .on('mouseleave', hideTip);
    all.select('rect.bg').attr('width', x.bandwidth() + 12).attr('fill', q => (sel === q.i ? 'var(--sel-soft)' : 'transparent')).attr('stroke', q => (sel === q.i ? 'var(--sel)' : 'none'));
    all.select('text.k').text(q => q.k).attr('fill', q => (sel === q.i ? 'var(--sel)' : 'var(--fg)'));
    all.select('text.pc').text(q => (q.n ? pct(q.share) + ' successful' : 'no games'));
    all.select('text.n').text(q => `n = ${fmt(q.n)}`);
    const cw = (x.bandwidth() - 3 * 4) / 4, ch = 26;
    all.select('g.cells').each(function (q) {
      const filled = Math.round(q.share * 20);
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
      return { k: tr.k, has: rel.length > 0, s, b, up: s - b > 0.05 };
    });
    const top = [...set].sort((a, b) => b.lo - a.lo || b.rev - a.rev).slice(0, 12);
    return { set, tiles, top };
  });
  const traitLabel = $derived(`${genreLabel}${band === null ? ', all prices' : ', ' + BANDS[band].k}`);
</script>

<div class="bar">
  <ThresholdSelect />
  <label>Genre bubble size
    <select id="dd-metric" bind:value={metric}><option value="mean">mean owner midpoint</option><option value="share">share of successful games</option></select>
  </label>
  <div class="crumb">
    <button onclick={() => { genre = null; band = null; }}>All genres</button>
    {#if genre !== null}<span> › </span><b>{GEN[genre]}</b>{/if}
    {#if band !== null}<span> › </span><b>{BANDS[band].k}</b>{/if}
    {#if genre === null && band === null}<span style="color:var(--muted)">  (nothing selected)</span>{/if}
  </div>
</div>
{#if !$dataset}<p class="loading">Loading {fmt($dataset?.meta?.N ?? 99754)} games…</p>{/if}
<div class="grid">
  <div class="panel">
    <h3>1 · Genre reach</h3>
    <p class="q">Which genres reach the most owners? <em>Click a bubble to focus the views below on that genre.</em></p>
    <svg bind:this={bubbleSvg} id="dd-bubbles" viewBox="0 0 1060 190"></svg>
  </div>
  <div class="panel">
    <h3>2 · Price shelves</h3>
    <p class="q" id="dd-q2">Within <em>{genreLabel}</em>, which price bands hold the largest share of successful games? <em>Click a shelf to list its traits.</em></p>
    <svg bind:this={shelfSvg} id="dd-shelves" viewBox="0 0 1060 250"></svg>
  </div>
  <div class="panel">
    <h3>3 · Traits of the successful games</h3>
    {#if sets}
      <p class="q" id="dd-q3">What do the <em>{fmt(sets.set.length)} successful games</em> in <em>{traitLabel}</em> have in common?</p>
      <div class="traits" id="dd-traits">
        {#each sets.tiles as t}
          <div class="trait">
            <div class="n">{t.has ? pct(t.s) : '–'}</div>
            <div class="l">{t.k}</div>
            <div class="d" class:up={t.up}>all successful: {pct(t.b)}</div>
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
    <p class="note">Each tile shows the share of successful games in the current selection that meet the condition, and below it the same share among all successful games. Filled box = meets condition. Review share needs ≥50 reviews. Owner estimates are bands, not sales.</p>
  </div>
</div>
