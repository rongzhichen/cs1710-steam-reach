<script>
  // Peer lab: cumulative ladder, release-year cohorts and language support for the shared peer group.
  // V3 changes from the test session: colour keys on every chart, years with too few peers greyed,
  // a fit-to-data axis toggle, presets (including the ladder that inverts at 1M), a threshold-
  // sensitivity view, ladder conditions carried in the URL, and clearer wording on filter order.
  import { format } from 'd3';
  import { dataset, threshold, peerGenre, peerBand, ladderFlags } from '$lib/stores.js';
  import { BANDS, THRESHOLDS, fmt } from '$lib/data.js';
  import { reachStats, peerGames, LANGUAGE_GROUPS } from '$lib/analysis.js';
  import ThresholdSelect from './ThresholdSelect.svelte';
  import RateChart from './RateChart.svelte';
  import CopyLink from './CopyLink.svelte';

  const MIN_YEAR_N = 100;
  let fit = $state(false);
  const percent = format('.1%');
  const flags = $derived($ladderFlags);
  const setFlag = (k, v) => { $ladderFlags = { ...$ladderFlags, [k]: v }; };
  const peers = $derived(peerGames($dataset?.G ?? [], $peerGenre, $peerBand));
  const peerLabel = $derived(`${$peerGenre === null ? 'All genres' : $dataset?.GEN[$peerGenre]} · ${$peerBand === null ? 'all prices' : BANDS[$peerBand].k}`);
  const ladder = $derived.by(() => {
    let pool = $dataset?.G ?? [];
    const rows = [{ label: 'All eligible games', ...reachStats(pool, $threshold), color: 'var(--dot)' }];
    const steps = [
      [$peerGenre !== null, `+ ${$dataset?.GEN[$peerGenre]}`, g => (g.mask >> $peerGenre) & 1],
      [$peerBand !== null, `+ ${BANDS[$peerBand]?.k}`, g => g.band === $peerBand],
      [flags.lang, '+ 5 or more languages', g => g.lang >= 5],
      [flags.plat, '+ One platform only', g => g.plat === 1],
      [flags.ea, '+ Early Access', g => g.ea === 1]
    ];
    for (const [enabled, label, test] of steps) {
      if (enabled) { pool = pool.filter(test); rows.push({ label, ...reachStats(pool, $threshold) }); }
    }
    return { rows, pool, last: rows[rows.length - 1] };
  });
  // The same final peer group at every threshold on offer: does the conclusion survive moving the line?
  const sensitivityRows = $derived(THRESHOLDS.map(t => ({
    label: `${fmt(t)} owners${t === $threshold ? ' · current' : ''}`,
    ...reachStats(ladder.pool, t),
    color: t === $threshold ? 'var(--sel)' : 'var(--hit)'
  })));
  const cohortRows = $derived.by(() => {
    const years = [...new Set(($dataset?.G ?? []).map(g => g.year).filter(y => Number.isInteger(y) && y > 0))].sort((a, b) => a - b);
    const latest = years.at(-1);
    return years.filter(y => y >= latest - 11).map(y => {
      const s = reachStats(peers.filter(g => g.year === y), $threshold);
      const few = s.n < MIN_YEAR_N;
      return { label: `${y}${few ? ' · too few peers' : ''}`, ...s, color: few ? 'var(--miss)' : 'var(--hit)', muted: few };
    });
  });
  const languageRows = $derived(LANGUAGE_GROUPS.flatMap(group => [
    { label: `${group.label} · store`, ...reachStats(($dataset?.G ?? []).filter(group.test), $threshold), color: 'var(--dot)' },
    { label: `${group.label} · peers`, ...reachStats(peers.filter(group.test), $threshold) }
  ]));
  const examples = $derived(ladder.pool.filter(g => g.lo >= $threshold && g.name).sort((a, b) => b.lo - a.lo || b.rev - a.rev).slice(0, 6));
  function reset() { $peerGenre = null; $peerBand = null; $ladderFlags = { lang: false, plat: false, ea: false }; }
  function presetRpg() { const i = $dataset.GEN.indexOf('RPG'); $peerGenre = i; $peerBand = 3; $ladderFlags = { lang: true, plat: false, ea: false }; $threshold = 100000; }
  function presetInvert() { const i = $dataset.GEN.indexOf('RPG'); $peerGenre = i; $peerBand = 3; $ladderFlags = { lang: true, plat: true, ea: true }; $threshold = 1000000; }
  const xLabel = $derived(`Games reaching ${fmt($threshold)}+ owners (%)`);
</script>

{#if $dataset}
  <div class="bar peer-controls">
    <label>Peer genre<select bind:value={$peerGenre}><option value={null}>All genres</option>{#each $dataset.GEN as genre, i}<option value={i}>{genre}</option>{/each}</select></label>
    <label>Peer price<select bind:value={$peerBand}><option value={null}>All prices</option>{#each BANDS as band, i}<option value={i}>{band.k}</option>{/each}</select></label>
    <ThresholdSelect label="Owner threshold" />
    <label><input type="checkbox" bind:checked={fit} /> Fit axis to data</label>
    <button onclick={reset}>Reset peer filters</button>
    <CopyLink />
  </div>
  <p class="note">Genre and price stay in sync with the comparison tool above. These controls update every view below; the opening story uses a fixed 100k threshold. The fixed 0–100% axis keeps filter states comparable; "Fit axis to data" zooms in but lets the scale move as you add conditions.</p>
  <p class="presets">Try a worked example: <button type="button" onclick={presetRpg}>RPG · $10–20 · 5+ languages at 100k</button> <button type="button" onclick={presetInvert}>The ladder that inverts: RPG · $10–20 · all three conditions at 1M</button></p>
  <div class="panel lab-panel" id="peer-ladder">
    <p class="eyebrow">Peer ladder · add one condition at a time</p>
    <h2>Describe your game. Watch the comparison change.</h2>
    <p>Each step keeps only games matching every condition so far. Add a condition to see both the reach rate and the number of remaining peers. Conditions are applied in the fixed order shown, whatever order you tick them, so only the final row is independent of ordering.</p>
    <div class="trait-toggles">
      <label><input type="checkbox" checked={flags.lang} onchange={e => setFlag('lang', e.currentTarget.checked)} /> 5+ languages</label>
      <label><input type="checkbox" checked={flags.plat} onchange={e => setFlag('plat', e.currentTarget.checked)} /> One platform only <span class="hint">(the opposite of the tool's "2+ platforms")</span></label>
      <label><input type="checkbox" checked={flags.ea} onchange={e => setFlag('ea', e.currentTarget.checked)} /> Early Access</label>
    </div>
    <div class="lab-result" aria-live="polite">
      <strong>{ladder.last.n ? percent(ladder.last.rate) : 'No matching games'}</strong>
      <span>{fmt(ladder.last.hits)} of {fmt(ladder.last.n)} matching games reach {fmt($threshold)} owners.</span>
      {#if ladder.last.n > 0 && ladder.last.n < 200}<span class="sample-warning">Small peer group: treat this comparison cautiously.</span>{/if}
    </div>
    <RateChart rows={ladder.rows} title="Cumulative peer ladder" baseline={ladder.rows[0].rate} yLabel="Cumulative peer filters" {xLabel} {fit}
      legend={[{ label: 'all eligible games', color: 'var(--dot)' }, { label: 'after each added condition', color: 'var(--sel)' }, { label: 'dashed line = all-games rate', color: 'var(--fg)' }]} />
    <p class="note">Whiskers = 95% Wilson intervals; * = fewer than 200 games. These intervals do not account for SteamSpy estimation error, missing games or selection bias. Filters use snapshot attributes, not necessarily launch-time choices; review sentiment and playtime are outcomes and are excluded.</p>
    <p class="note">Examples meeting the final filters and owner threshold, ordered by owner-band lower bound: {examples.length ? examples.map(g => g.name).join(' · ') : 'No named games meet this selection.'}</p>
  </div>
  <div class="panel lab-panel" id="sensitivity">
    <p class="eyebrow">Stress-test the line · threshold sensitivity</p>
    <h2>Does the conclusion survive moving the success line?</h2>
    <p>The final peer group of the ladder (<strong>{fmt(ladder.pool.length)} games</strong>, {peerLabel}{flags.lang ? ', 5+ languages' : ''}{flags.plat ? ', one platform' : ''}{flags.ea ? ', Early Access' : ''}) at every threshold the page offers. A pattern that holds at 100k and at 500k is one you can plan around; one that only exists at a single line is a feature of the line.</p>
    <RateChart rows={sensitivityRows} title="Reach rate of the current peer group at each threshold" yLabel="Success threshold" xLabel="Share of the peer group reaching the threshold (%)" {fit}
      legend={[{ label: 'other thresholds', color: 'var(--hit)' }, { label: 'current threshold', color: 'var(--sel)' }]} />
    <p class="note">Rates can only fall as the threshold rises, because the same games are counted against a higher line. Small groups can reach zero hits: "0.0%" with a wide whisker is a count of zero, not evidence of impossibility.</p>
  </div>
  <div class="panel lab-panel" id="launch-cohorts">
    <p class="eyebrow">Check the context · release year</p>
    <h2>Older games have had longer to find an audience</h2>
    <p>Compare recorded release-year groups within <strong>{peerLabel}</strong>. Years with fewer than {MIN_YEAR_N} peers are greyed and labelled, so the eye does not land on the least reliable rows first. Recent or scheduled releases are not directly comparable to games that have been available for years.</p>
    <RateChart rows={cohortRows} title="Reach rate by release year" yLabel="Recorded release year" {xLabel} {fit}
      legend={[{ label: `year with ${MIN_YEAR_N}+ peers`, color: 'var(--hit)' }, { label: `fewer than ${MIN_YEAR_N} peers`, color: 'var(--miss)' }]} />
    <p class="note">The last 12 release years represented in the dataset are shown, not the last 12 calendar years. Missing years and older releases are omitted here. Recorded years can include scheduled releases; this snapshot does not establish exact time on market. This is not a history of sales or evidence that player tastes changed. The ladder conditions above affect only the ladder and the sensitivity view.</p>
  </div>
  <div class="panel lab-panel" id="localization">
    <p class="eyebrow">Check the context · language support</p>
    <h2>Does the language pattern hold among your peers?</h2>
    <p>Grey bars show the store; orange bars show <strong>{peerLabel}</strong> within the same language group. Counts keep tiny groups visible rather than hiding them behind a percentage. Of the patterns we checked, this one held up best inside a peer group: across the store the rate rises from about 5% at one language to about 21% at ten or more, and inside RPG $10–20 peers from about 6% to about 31%.</p>
    <RateChart rows={languageRows} title="Language support: store versus selected peers" yLabel="Language group · population" {xLabel} {fit}
      legend={[{ label: 'all eligible games (store)', color: 'var(--dot)' }, { label: 'selected peers', color: 'var(--sel)' }]} />
    <p class="note">A higher reach rate does not show that adding translations caused success. Budget, genre and game age can differ across groups; language support may have changed after launch. Zero or unreported language counts are shown separately.</p>
  </div>
{:else}
  <p class="loading">Loading peer comparisons…</p>
{/if}
