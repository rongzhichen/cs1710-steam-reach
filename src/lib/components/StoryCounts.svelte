<script>
  // 2 · Counts versus rates: the same shelves, read as a proportion of each shelf.
  import { dataset } from '$lib/stores.js';
  import { bars, drawMode } from '$lib/bars.js';
  import { inView } from '$lib/reveal.js';
  import { fmt } from '$lib/data.js';
  let svg;
  let seen = $state(false), played = false; // grow the bars in when the chart is first scrolled to
  $effect(() => {
    const t = $dataset?.summary?.byThreshold['100000'];
    if (!t || !svg) return;
    bars(svg, t.price.map(r => ({ label: r.key, groups: [{ v: r.shareOfSuccess, cls: 'b-dot' }, { v: r.rate, cls: 'b-hit' }], note: `n = ${fmt(r.n)}` })),
      { left: 110, legend: [{ label: 'share of all successful games', cls: 'b-dot' }, { label: 'reach rate inside the shelf', cls: 'b-hit' }],
        groupDelay: 1100, ...drawMode(seen, played) }); // grey counts first, blue rates a beat later
    if (seen) played = true;
  });
</script>

<div class="story-chart" use:inView={() => (seen = true)}><svg bind:this={svg} id="c-counts"></svg></div>
