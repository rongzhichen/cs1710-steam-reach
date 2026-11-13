import { writable } from 'svelte/store';

/** Success threshold: owner-band lower bound that counts as "reached a real audience". Shared by every view. */
export const threshold = writable(100000);

/** Loaded dataset ({G, GEN, meta, summary}) or null until the page has fetched it. */
export const dataset = writable(null);

// Shared peer selection links the comparison tool and the V2 views.
export const peerGenre = writable(null);
export const peerBand = writable(null);

// Peer-ladder conditions (V3: lifted out of PeerLab so a ladder can be linked by URL).
export const ladderFlags = writable({ lang: false, plat: false, ea: false });

// Explorer state that is worth sharing: brush extent as fractions of the plot area, highlighted
// genre and the visibility filter. The brush is stored as [x0, y0, x1, y1] in [0, 1], or null.
export const exploreState = writable({ brush: null, genre: null, show: 'all' });
