<script>
  // 4 · Comparable games have different traits: all successful vs successful RPG $10-20.
  // Computed from the game rows, because the summary only carries the two headline figures.
  import { dataset } from '$lib/stores.js';
  import { bars } from '$lib/bars.js';
  import { fmt, TRAITS, traitShare } from '$lib/data.js';
  let svg;
  $effect(() => {
    const d = $dataset; if (!d || !svg) return;
    const thr = 100000, rpg = d.summary.genres.indexOf('RPG');
    const succ = d.G.filter(g => g.lo >= thr), peer = succ.filter(g => (g.mask >> rpg) & 1 && g.band === 3);
    bars(svg, TRAITS.map(tr => ({ label: tr.k, groups: [{ v: traitShare(succ, tr), cls: 'b-dot' }, { v: traitShare(peer, tr), cls: 'b-sel' }] })),
      { left: 150, max: 1, legend: [{ label: `all successful games (${fmt(succ.length)})`, cls: 'b-dot' }, { label: `successful RPGs, $10–20 (${fmt(peer.length)})`, cls: 'b-sel' }] });
  });
</script>

<div class="story-chart"><svg bind:this={svg} id="c-traits"></svg></div>
