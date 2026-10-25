<script>
  // 1 · Hook: where the successful games sit, by count (threshold 100k, the story's definition).
  import { dataset } from '$lib/stores.js';
  import { bars } from '$lib/bars.js';
  import { fmt, pct } from '$lib/data.js';
  let svg;
  $effect(() => {
    const t = $dataset?.summary?.byThreshold['100000'];
    if (!t || !svg) return;
    bars(svg, t.price.map(r => ({ label: r.key, groups: [{ v: r.shareOfSuccess, cls: 'b-hit' }], note: `${fmt(r.hits)} games` })), { format: pct, left: 110 });
  });
</script>

<div class="story-chart"><svg bind:this={svg} id="c-hook"></svg></div>
