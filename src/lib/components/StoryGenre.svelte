<script>
  // 3 · Genre changes the comparison: rate per shelf, all genres against one chosen genre.
  import { dataset } from '$lib/stores.js';
  import { bars } from '$lib/bars.js';
  import { fmt } from '$lib/data.js';
  let svg;
  let gi = $state(6); // RPG in the pipeline's genre order; corrected once the summary loads
  const genres = $derived($dataset?.summary?.genres ?? []);
  const name = $derived(genres[gi] ?? 'RPG');
  $effect(() => { const i = genres.indexOf('RPG'); if (i >= 0) gi = i; });
  $effect(() => {
    const sum = $dataset?.summary; if (!sum || !svg) return;
    const t = sum.byThreshold['100000'];
    bars(svg, sum.priceBands.map((b, i) => {
      const all = t.price[i], cell = t.genrePrice[gi][i];
      return { label: b, groups: [{ v: all.rate, cls: 'b-dot' }, { v: cell.n ? cell.hits / cell.n : 0, cls: 'b-sel' }], note: `${name}: n = ${fmt(cell.n)}` };
    }), { left: 130, legend: [{ label: 'all genres', cls: 'b-dot' }, { label: name, cls: 'b-sel' }] });
  });
</script>

<p class="src">Compare all genres with
  <select class="inline-select" id="c-genre-select" bind:value={gi}>
    {#each genres as g, i}<option value={i}>{g}</option>{/each}
  </select>
</p>
<div class="story-chart"><svg bind:this={svg} id="c-genre"></svg></div>
<p class="caption">Reach rate (owner band ≥ 100k) per price shelf, all genres against <span class="c-genre-name">{name}</span>. Games can carry several genres, so a game may count in more than one.</p>
