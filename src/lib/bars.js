// Horizontal bar chart used by the story sections. rows: [{label, groups:[{v, cls}], note}].
// Marks are joined, not rebuilt, so a redraw can move the existing bars instead of replacing them.
//   opt.hold     draw the frame with empty bars (the chart has not been scrolled into view yet)
//   opt.animate  'reveal': bars grow from zero, row by row, and each later group waits opt.groupDelay ms,
//                so a second reading of the same shelves arrives after the first;
//                'update': bars slide from their current length to the new one.
import * as d3 from 'd3';
import { pct } from './data.js';
import { reducedMotion } from './reveal.js';

export function bars(svgEl, rows, opt = {}) {
  const W = 560, L = opt.left || 92, R = 60, rowH = rows[0].groups.length > 1 ? 44 : 30, pad = 8;
  const H = rows.length * rowH + pad * 2 + (opt.legend ? 22 : 0);
  const x = d3.scaleLinear().domain([0, opt.max || d3.max(rows, r => d3.max(r.groups, g => g.v)) * 1.08]).range([L, W - R]);
  const svg = d3.select(svgEl).attr('viewBox', `0 0 ${W} ${H}`);
  const top = opt.legend ? 22 : 0;
  const format = opt.format || pct;
  const mode = opt.hold || reducedMotion() ? null : opt.animate;
  const dur = mode === 'reveal' ? 750 : mode === 'update' ? 450 : 0;
  const delay = d => (mode === 'reveal' ? d.ri * 70 + d.k * (opt.groupDelay ?? 250) : 0);
  // Move a selection to its new attributes at once, or over `dur` when animating.
  const go = sel => (dur ? sel.transition().duration(dur).delay(delay).ease(d3.easeCubicOut) : sel.interrupt());

  svg.selectAll('g.key').data(opt.legend ? [0] : []).join('g').attr('class', 'key').attr('transform', `translate(${L},12)`)
    .selectAll('g').data(opt.legend || []).join(enter => {
      const g = enter.append('g'); g.append('rect').attr('width', 12).attr('height', 12).attr('y', -9).attr('rx', 2); g.append('text').attr('x', 17).attr('fill', 'var(--fg2)'); return g;
    }).attr('transform', (t, i) => `translate(${i * 190},0)`)
    .call(g => g.select('rect').attr('class', t => t.cls)).call(g => g.select('text').text(t => t.label));

  const row = svg.selectAll('g.row').data(rows).join(enter => {
    const g = enter.append('g').attr('class', 'row');
    g.append('text').attr('class', 'lab').attr('dy', '.32em').attr('text-anchor', 'end').attr('font-size', 12);
    g.append('text').attr('class', 'note mono').attr('text-anchor', 'end').attr('font-size', 10).attr('fill', 'var(--muted)');
    return g;
  }).attr('transform', (d, i) => `translate(0,${top + pad + i * rowH})`);
  row.select('text.lab').attr('x', L - 8).attr('y', rowH / 2).text(d => d.label);
  row.select('text.note').attr('x', L - 8).attr('y', rowH / 2 + 13).text(d => d.note ?? '');

  const n = rows[0].groups.length, bh = n > 1 ? 14 : 16, gap = 3;
  const y0 = k => rowH / 2 - (n * bh + (n - 1) * gap) / 2 + k * (bh + gap);
  const bar = row.selectAll('g.bar').data((d, ri) => d.groups.map((g, k) => ({ ...g, k, ri }))).join(enter => {
    const g = enter.append('g').attr('class', 'bar');
    g.append('rect').attr('x', x(0)).attr('width', 0).attr('rx', 2);
    g.append('text').attr('class', 'mono').attr('x', x(0) + 5).attr('dy', '.32em').attr('font-size', 11).attr('fill', 'var(--fg2)').attr('opacity', 0);
    return g;
  });
  go(bar.select('rect').attr('class', d => d.cls).attr('y', d => y0(d.k)).attr('height', bh))
    .attr('width', d => (opt.hold ? 0 : Math.max(0, x(d.v) - x(0))));
  go(bar.select('text').attr('y', d => y0(d.k) + bh / 2).text(d => format(d.v)))
    .attr('x', d => (opt.hold ? x(0) : x(d.v)) + 5).attr('opacity', opt.hold ? 0 : 1);

  svg.selectAll('line.rule').data(opt.rule != null ? [opt.rule] : []).join('line').attr('class', 'rule')
    .attr('x1', v => x(v)).attr('x2', v => x(v)).attr('y1', top + 2).attr('y2', H - 2).attr('stroke', 'var(--base)').attr('stroke-dasharray', '3 3');
}

/**
 * How a story chart should draw itself: empty until it has been scrolled into view, a staged reveal
 * the first time, and a smooth update after that (for example when the reader picks another genre).
 */
export function drawMode(seen, played) {
  return { hold: !seen, animate: !seen ? null : played ? 'update' : 'reveal' };
}
