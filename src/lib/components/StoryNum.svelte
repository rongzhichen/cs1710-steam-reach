<script>
  // A number quoted in the prose, filled from summary.json.story so text and charts cannot drift.
  // `as`: 'pct' (default), 'pct1' (one decimal) or 'n' (the denominator).
  import * as d3 from 'd3';
  import { dataset } from '$lib/stores.js';
  import { fmt, pct } from '$lib/data.js';
  let { k, as = 'pct', fallback = '' } = $props();
  const v = $derived($dataset?.summary?.story?.[k]);
  const text = $derived(!v ? fallback : as === 'n' ? fmt(v.n) : as === 'pct1' ? d3.format('.1%')(v.value) : pct(v.value));
  const title = $derived(v ? v.definition + (v.n ? ` (n = ${fmt(v.n)})` : '') : undefined);
</script>

<span data-story={k} data-as={as} {title}>{text}</span>
