<script>
  // 2 · Counts versus rates: the same shelves, read as a proportion of each shelf.
  import { dataset } from '$lib/stores.js';
  import { bars } from '$lib/bars.js';
  import { fmt } from '$lib/data.js';
  let svg;
  $effect(() => {
    const t = $dataset?.summary?.byThreshold['100000'];
    if (!t || !svg) return;
    bars(svg, t.price.map(r => ({ label: r.key, groups: [{ v: r.shareOfSuccess, cls: 'b-dot' }, { v: r.rate, cls: 'b-hit' }], note: `n = ${fmt(r.n)}` })),
      { left: 110, legend: [{ label: 'share of all successful games', cls: 'b-dot' }, { label: 'reach rate inside the shelf', cls: 'b-hit' }] });
  });
</script>

<div class="story-chart"><svg bind:this={svg} id="c-counts"></svg></div>
