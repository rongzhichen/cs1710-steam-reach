// Horizontal bar chart used by the story sections. rows: [{label, groups:[{v, cls}], note}].
import * as d3 from 'd3';
import { pct } from './data.js';

export function bars(svgEl, rows, opt = {}) {
  const W = 560, L = opt.left || 92, R = 60, rowH = rows[0].groups.length > 1 ? 44 : 30, pad = 8;
  const H = rows.length * rowH + pad * 2 + (opt.legend ? 22 : 0);
  const x = d3.scaleLinear().domain([0, opt.max || d3.max(rows, r => d3.max(r.groups, g => g.v)) * 1.08]).range([L, W - R]);
  const svg = d3.select(svgEl).attr('viewBox', `0 0 ${W} ${H}`).html('');
  const top = opt.legend ? 22 : 0;
  if (opt.legend) {
    const lg = svg.append('g').attr('transform', `translate(${L},12)`);
    opt.legend.forEach((t, i) => {
      const g = lg.append('g').attr('transform', `translate(${i * 190},0)`);
      g.append('rect').attr('width', 12).attr('height', 12).attr('y', -9).attr('rx', 2).attr('class', t.cls);
      g.append('text').attr('x', 17).attr('fill', 'var(--fg2)').text(t.label);
    });
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
