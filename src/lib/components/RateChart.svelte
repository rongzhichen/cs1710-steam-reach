<script>
  import { scaleLinear, format } from 'd3';
  import { fmt } from '$lib/data.js';
  let { rows, title, baseline = null, xLabel = 'Games reaching the selected owner threshold (%)', yLabel = 'Comparison group' } = $props();
  const percent = format('.1%');
  const height = $derived(rows.length * 52 + 96);
  const x = scaleLinear().domain([0, 1]).range([220, 700]);
</script>

<div class="rate-scroll">
  <svg class="rate-chart" viewBox="0 0 900 {height}" role="img" aria-label={title}>
    <title>{title}. Exact rates and counts are available in the table below.</title>
    <text x="205" y="17" text-anchor="end" font-weight="600">{yLabel}</text>
    <text x="716" y="17" font-weight="600">Rate · sample size (n)</text>
    <line x1={x(0)} x2={x(0)} y1="30" y2={height - 56} stroke="var(--fg2)" />
    <line x1={x(0)} x2={x(1)} y1={height - 56} y2={height - 56} stroke="var(--fg2)" />
    <text x={(x(0) + x(1)) / 2} y={height - 5} text-anchor="middle" font-weight="600">{xLabel}</text>
    {#each [0, .25, .5, .75, 1] as tick}
      <line x1={x(tick)} x2={x(tick)} y1="30" y2={height - 56} stroke="var(--line)" />
      <text x={x(tick)} y={height - 35} text-anchor="middle">{format('.0%')(tick)}</text>
    {/each}
    {#if baseline !== null}
      <line x1={x(baseline)} x2={x(baseline)} y1="30" y2={height - 56} stroke="var(--fg)" stroke-dasharray="4 4" />
    {/if}
    {#each rows as row, i}
      <g transform="translate(0,{i * 52 + 48})">
        <title>{row.label}: {row.n ? `${percent(row.rate)}; ${fmt(row.hits)} of ${fmt(row.n)} games; 95% Wilson interval ${percent(row.low)} to ${percent(row.high)}` : 'No matching games'}</title>
        <text x="205" y="4" text-anchor="end">{row.label}</text>
        {#if row.n}
          <rect x={x(0)} y="-12" width={x(row.rate) - x(0)} height="24" rx="3" fill={row.color ?? 'var(--sel)'} />
          <line x1={x(row.low)} x2={x(row.high)} y1="0" y2="0" stroke="var(--fg)" stroke-width="2" />
          <line x1={x(row.low)} x2={x(row.low)} y1="-5" y2="5" stroke="var(--fg)" />
          <line x1={x(row.high)} x2={x(row.high)} y1="-5" y2="5" stroke="var(--fg)" />
        {/if}
        <text x="716" y="4">{row.n ? percent(row.rate) : 'No data'} · n={fmt(row.n)}{row.n > 0 && row.n < 200 ? ' *' : ''}</text>
      </g>
    {/each}
  </svg>
</div>
<p class="note chart-scroll-hint">On a narrow screen, scroll the chart horizontally to see the rates and sample sizes, or open the table below.</p>
<details class="rate-data">
  <summary>View exact counts and intervals</summary>
  <div class="tscroll"><table>
    <thead><tr><th>Group</th><th>Reached threshold</th><th>Games</th><th>Rate</th><th>95% Wilson interval</th></tr></thead>
    <tbody>{#each rows as row}<tr><td>{row.label}</td><td>{fmt(row.hits)}</td><td>{fmt(row.n)}</td><td>{row.n ? percent(row.rate) : 'No data'}</td><td>{row.n ? `${percent(row.low)}–${percent(row.high)}` : '—'}</td></tr>{/each}</tbody>
  </table></div>
</details>
