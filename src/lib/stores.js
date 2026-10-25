import { writable } from 'svelte/store';

/** Success threshold: owner-band lower bound that counts as "reached a real audience". Shared by every view. */
export const threshold = writable(100000);

/** Loaded dataset ({G, GEN, meta, summary}) or null until the page has fetched it. */
export const dataset = writable(null);
