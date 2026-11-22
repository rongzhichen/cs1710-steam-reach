<script>
  // 2 · The flip in two tiles: the same two shelves read as a count share and as a rate.
  // Grey for the count share and blue for the rate, matching the chart underneath.
  import { dataset } from '$lib/stores.js';
  import { fmt, pct } from '$lib/data.js';
  const FALLBACK = [
    { key: '$0–5', n: 61319, rate: 0.0703, shareOfSuccess: 0.4951 },
    { key: '$20–40', n: 1577, rate: 0.1795, shareOfSuccess: 0.0325 }
  ];
  const rows = $derived.by(() => {
    const price = $dataset?.summary?.byThreshold?.['100000']?.price;
    return FALLBACK.map(f => price?.find(r => r.key === f.key) ?? f);
  });
</script>

<div class="flip">
  {#each rows as r}
    <div>
      <h3>{r.key} shelf · {fmt(r.n)} games</h3>
      <p class="row"><span class="v count">{pct(r.shareOfSuccess)}</span><span class="l">of all successful games sit on this shelf</span></p>
      <p class="row"><span class="v rate">{pct(r.rate)}</span><span class="l">of the games on this shelf are successful</span></p>
    </div>
  {/each}
</div>
