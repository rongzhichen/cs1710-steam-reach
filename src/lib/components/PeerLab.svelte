<script>
  import { format } from 'd3';
  import { dataset, threshold, peerGenre, peerBand } from '$lib/stores.js';
  import { BANDS, fmt } from '$lib/data.js';
  import { reachStats, peerGames, LANGUAGE_GROUPS } from '$lib/analysis.js';
  import ThresholdSelect from './ThresholdSelect.svelte';
  import RateChart from './RateChart.svelte';

  let languages = $state(false), singlePlatform = $state(false), earlyAccess = $state(false);
  const percent = format('.1%');
  const peers = $derived(peerGames($dataset?.G ?? [], $peerGenre, $peerBand));
  const peerLabel = $derived(`${$peerGenre === null ? 'All genres' : $dataset?.GEN[$peerGenre]} · ${$peerBand === null ? 'all prices' : BANDS[$peerBand].k}`);
  const ladder = $derived.by(() => {
    let pool = $dataset?.G ?? [];
    const rows = [{ label: 'All eligible games', ...reachStats(pool, $threshold), color: 'var(--dot)' }];
    const steps = [
      [$peerGenre !== null, `+ ${$dataset?.GEN[$peerGenre]}`, g => (g.mask >> $peerGenre) & 1],
      [$peerBand !== null, `+ ${BANDS[$peerBand]?.k}`, g => g.band === $peerBand],
      [languages, '+ 5 or more languages', g => g.lang >= 5],
      [singlePlatform, '+ One platform', g => g.plat === 1],
      [earlyAccess, '+ Early Access', g => g.ea === 1]
    ];
    for (const [enabled, label, test] of steps) {
      if (enabled) { pool = pool.filter(test); rows.push({ label, ...reachStats(pool, $threshold) }); }
    }
    return { rows, pool, last: rows[rows.length - 1] };
  });
  const cohortRows = $derived.by(() => {
    const years = [...new Set(($dataset?.G ?? []).map(g => g.year).filter(y => Number.isInteger(y) && y > 0))].sort((a, b) => a - b);
    const latest = years.at(-1);
    return years.filter(y => y >= latest - 11).map(y => ({
      label: `${y}${y >= latest - 1 ? ' · newest cohort' : ''}`,
      ...reachStats(peers.filter(g => g.year === y), $threshold),
      color: y >= latest - 1 ? 'var(--sel)' : 'var(--hit)'
    }));
  });
  const languageRows = $derived(LANGUAGE_GROUPS.flatMap(group => [
    { label: `${group.label} · store`, ...reachStats(($dataset?.G ?? []).filter(group.test), $threshold), color: 'var(--dot)' },
    { label: `${group.label} · peers`, ...reachStats(peers.filter(group.test), $threshold) }
  ]));
  const examples = $derived(ladder.pool.filter(g => g.lo >= $threshold && g.name).sort((a, b) => b.lo - a.lo || b.rev - a.rev).slice(0, 6));
  function reset() { $peerGenre = null; $peerBand = null; languages = false; singlePlatform = false; earlyAccess = false; }
</script>

{#if $dataset}
  <div class="bar peer-controls">
    <label>Peer genre<select bind:value={$peerGenre}><option value={null}>All genres</option>{#each $dataset.GEN as genre, i}<option value={i}>{genre}</option>{/each}</select></label>
    <label>Peer price<select bind:value={$peerBand}><option value={null}>All prices</option>{#each BANDS as band, i}<option value={i}>{band.k}</option>{/each}</select></label>
    <ThresholdSelect label="Owner threshold" />
    <button onclick={reset}>Reset peer filters</button>
  </div>
  <p class="note">Genre and price stay in sync with the comparison tool above. These controls update all three views below; the opening story uses a fixed 100k threshold.</p>
  <div class="panel lab-panel" id="peer-ladder">
    <p class="eyebrow">Novel view · peer ladder</p>
    <h2>Describe your game. Watch the comparison change.</h2>
    <p>Each step keeps only games matching every condition so far. Add a condition to see both the reach rate and the number of remaining peers.</p>
    <div class="trait-toggles">
      <label><input type="checkbox" bind:checked={languages} /> 5+ languages</label>
      <label><input type="checkbox" bind:checked={singlePlatform} /> One platform</label>
      <label><input type="checkbox" bind:checked={earlyAccess} /> Early Access</label>
    </div>
    <div class="lab-result" aria-live="polite">
      <strong>{ladder.last.n ? percent(ladder.last.rate) : 'No matching games'}</strong>
      <span>{fmt(ladder.last.hits)} of {fmt(ladder.last.n)} matching games reach {fmt($threshold)} owners.</span>
      {#if ladder.last.n > 0 && ladder.last.n < 200}<span class="sample-warning">Small peer group: treat this comparison cautiously.</span>{/if}
    </div>
    <RateChart rows={ladder.rows} title="Cumulative peer ladder" baseline={ladder.rows[0].rate} yLabel="Cumulative peer filters" xLabel={`Games reaching ${fmt($threshold)}+ owners (%)`} />
    <p class="note">Dashed line = all eligible games. Whiskers = 95% Wilson intervals; * = fewer than 200 games. These intervals do not account for SteamSpy estimation error, missing games or selection bias. Filters use snapshot attributes, not necessarily launch-time choices; review sentiment and playtime are outcomes and are excluded.</p>
    <p class="note">Examples meeting the final filters and owner threshold, ordered by owner-band lower bound: {examples.length ? examples.map(g => g.name).join(' · ') : 'No named games meet this selection.'}</p>
  </div>
  <div class="panel lab-panel" id="launch-cohorts">
    <p class="eyebrow">Check the context · release year</p>
    <h2>Older games have had longer to find an audience</h2>
    <p>Compare recorded release-year groups within <strong>{peerLabel}</strong>. The newest two years in the dataset are highlighted. Recent or scheduled releases are not directly comparable to games that have been available for years.</p>
    <RateChart rows={cohortRows} title="Reach rate by release year" yLabel="Recorded release year" xLabel={`Games reaching ${fmt($threshold)}+ owners (%)`} />
    <p class="note">The last 12 release years represented in the dataset are shown, not the last 12 calendar years. Missing years and older releases are omitted here. Recorded years can include scheduled releases; this snapshot does not establish exact time on market. This is not a history of sales or evidence that player tastes changed. Trait checkboxes above affect only the peer ladder.</p>
  </div>
  <div class="panel lab-panel" id="localization">
    <p class="eyebrow">Check the context · language support</p>
    <h2>Does the language pattern hold among your peers?</h2>
    <p>Grey bars show the store; orange bars show <strong>{peerLabel}</strong> within the same language group. Counts keep tiny groups visible rather than hiding them behind a percentage.</p>
    <RateChart rows={languageRows} title="Language support: store versus selected peers" yLabel="Language group · population" xLabel={`Games reaching ${fmt($threshold)}+ owners (%)`} />
    <p class="note">A higher reach rate does not show that adding translations caused success. Budget, genre and game age can differ across groups; language support may have changed after launch. Zero or unreported language counts are shown separately.</p>
  </div>
{:else}
  <p class="loading">Loading peer comparisons…</p>
{/if}
