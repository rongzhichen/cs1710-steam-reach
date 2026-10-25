<script>
  // One <select> bound to the shared threshold store; every copy on the page stays in sync.
  import { threshold, dataset } from '$lib/stores.js';
  import { THRESHOLDS, fmt } from '$lib/data.js';
  let { label = 'Success means owner band lower bound ≥' } = $props();
  const opts = $derived($dataset?.summary?.thresholds ?? THRESHOLDS);
</script>

<label>{label}
  <select bind:value={$threshold} data-threshold>
    {#each opts as v}<option value={v}>{fmt(v)}</option>{/each}
  </select>
</label>
