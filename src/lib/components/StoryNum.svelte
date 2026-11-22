<script>
  // A number quoted in the prose, filled from summary.json.story so text and charts cannot drift.
  // `as`: 'pct' (default), 'pct1' (one decimal) or 'n' (the denominator).
  // `countUp`: the figure counts up from zero the first time it is scrolled into view (percentages only).
  import * as d3 from 'd3';
  import { dataset } from '$lib/stores.js';
  import { fmt, pct } from '$lib/data.js';
  import { inView, reducedMotion } from '$lib/reveal.js';
  let { k, as = 'pct', fallback = '', countUp = false } = $props();
  const v = $derived($dataset?.summary?.story?.[k]);
  const text = $derived(!v ? fallback : as === 'n' ? fmt(v.n) : as === 'pct1' ? d3.format('.1%')(v.value) : pct(v.value));
  const title = $derived(v ? v.definition + (v.n ? ` (n = ${fmt(v.n)})` : '') : undefined);

  let progress = $state(1); // 0 to 1 while counting; 1 shows the exact figure
  const target = $derived(v ? v.value : parseFloat(fallback) / 100);
  const shown = $derived(progress < 1 && as === 'pct' && Number.isFinite(target) ? pct(target * d3.easeCubicOut(progress)) : text);
  function run() {
    if (reducedMotion()) return;
    progress = 0;
    const timer = d3.timer(elapsed => { progress = Math.min(1, elapsed / 1200); if (progress >= 1) timer.stop(); });
  }
</script>

{#if countUp}
  <span data-story={k} data-as={as} {title} aria-label={text} use:inView={run}>{shown}</span>
{:else}
  <span data-story={k} data-as={as} {title}>{text}</span>
{/if}
