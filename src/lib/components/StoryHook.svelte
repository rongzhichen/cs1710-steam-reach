<script>
  // 1 · Hook: where the successful games sit, by count (threshold 100k, the story's definition).
  import { dataset } from '$lib/stores.js';
  import { bars, drawMode } from '$lib/bars.js';
  import { inView } from '$lib/reveal.js';
  import { fmt, pct } from '$lib/data.js';
  let svg;
  let seen = $state(false), played = false; // grow the bars in when the chart is first scrolled to
  $effect(() => {
    const t = $dataset?.summary?.byThreshold['100000'];
    if (!t || !svg) return;
    // Grey, not blue: the same bars return in the next chart, where blue is reserved for the rate.
    bars(svg, t.price.map(r => ({ label: r.key, groups: [{ v: r.shareOfSuccess, cls: 'b-dot' }], note: `${fmt(r.hits)} games` })),
      { format: pct, left: 110, legend: [{ label: 'share of all successful games', cls: 'b-dot' }], ...drawMode(seen, played) });
    if (seen) played = true;
  });
</script>

<div class="story-chart" use:inView={() => (seen = true)}><svg bind:this={svg} id="c-hook"></svg></div>
