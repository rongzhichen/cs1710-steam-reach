<script>
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { loadData, fmt } from '$lib/data.js';
  import { dataset, threshold, peerGenre, peerBand, ladderFlags, exploreState } from '$lib/stores.js';
  import { parseState, serializeState } from '$lib/urlState.js';
  import { replaceState } from '$app/navigation';
  import { reveal } from '$lib/reveal.js';
  import StoryNum from '$lib/components/StoryNum.svelte';
  import StoryHook from '$lib/components/StoryHook.svelte';
  import StoryCounts from '$lib/components/StoryCounts.svelte';
  import StoryFlip from '$lib/components/StoryFlip.svelte';
  import StoryGenre from '$lib/components/StoryGenre.svelte';
  import StoryTraits from '$lib/components/StoryTraits.svelte';
  import ComparisonTool from '$lib/components/ComparisonTool.svelte';
  import Explorer from '$lib/components/Explorer.svelte';
  import PeerLab from '$lib/components/PeerLab.svelte';
  let loadError = $state('');

  // Section navigation: stays in view while scrolling and marks the section being read.
  const NAV = [
    ['hook', '1 Setting'], ['counts', '2 Counts vs rates'], ['genre', '3 Your genre'], ['traits', '4 Your peers'], ['message', '5 Main message'],
    ['tool', '6 Compare'], ['explore', 'Explore'], ['next', 'Peer lab'], ['takeaways', 'Takeaways']
  ];
  let active = $state('');
  let navEl;
  $effect(() => {
    const a = active && navEl?.querySelector(`[href="#${active}"]`);
    if (a && navEl.scrollWidth > navEl.clientWidth) navEl.scrollTo({ left: a.offsetLeft - 16, behavior: 'smooth' });
  });

  // The game rows are fetched on the client, not in a load function, so the 4 MB of data is never
  // inlined into the prerendered HTML. The prose numbers below fall back to the published values.
  onMount(() => {
    loadData(base).then(d => dataset.set(d)).catch(() => { loadError = 'The game data could not be loaded. Please reload the page to try again.'; });
    // Shareable selections (V3): restore the stores from the query string, then mirror every change back.
    const init = parseState(location.search);
    threshold.set(init.threshold); peerGenre.set(init.genre); peerBand.set(init.band); ladderFlags.set(init.flags); exploreState.set(init.explore);
    let ready = false, timer;
    const unsub = [threshold, peerGenre, peerBand, ladderFlags, exploreState].map(st => st.subscribe(() => {
      if (!ready) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        const q = serializeState({ threshold: $threshold, genre: $peerGenre, band: $peerBand, flags: $ladderFlags, explore: $exploreState });
        if (q !== location.search) replaceState(location.pathname + q + location.hash, {});
      }, 150);
    }));
    ready = true;
    const io = new IntersectionObserver(es => { for (const e of es) if (e.isIntersecting) active = e.target.id; }, { rootMargin: '-25% 0px -70% 0px' });
    document.querySelectorAll('section[id]').forEach(el => io.observe(el));
    return () => { unsub.forEach(u => u()); io.disconnect(); };
  });
  const nGames = $derived(fmt($dataset?.meta?.N ?? 99754));
</script>

<svelte:head>
  <title>Steam Game Reach and Developer Decisions</title>
  <meta name="description" content="A data story for solo Steam developers: why reach rates among similar games beat counts of popular low-priced titles." />
</svelte:head>

<div class="wrap">
  {#if loadError}<p class="caveat" role="alert">{loadError}</p>{/if}
  <header>
    <p class="eyebrow">Steam Game Reach and Developer Decisions · a data story for solo developers and small studios</p>
    <h1>Most Steam hits are cheap. Most cheap games are not hits.</h1>
    <p class="lede">Most of what a developer hears about Steam comes from the games that made it. This page looks at all <span data-n-games>{nGames}</span> games with an owner estimate, including the long tail nobody talks about, and makes one argument: to judge a pricing plan, compare <em>reach rates among games like yours</em>, not counts of famous cheap hits.</p>
    <ol class="brief" aria-label="The story in three steps">
      <li><b>1 · The count</b> <StoryNum k="hook_successfulCostAtMost10" fallback="85%" /> of the games that reached 100,000 owners cost $10 or less. Read that way, cheap looks like the winning move.</li>
      <li><b>2 · The rate</b> Yet only <StoryNum k="counts_rate_0_5" fallback="7%" /> of paid games priced up to $5 get there, against <StoryNum k="counts_rate_20_40" fallback="18%" /> on the $20 to $40 shelf. The cheap shelf is the most crowded, not the most likely to reach an audience.</li>
      <li><b>3 · The habit</b> So read the reach rate among games like yours: same genre, same price shelf. Three tools at the end of the page do that for any game.</li>
    </ol>
  </header>

  <nav class="toc" aria-label="Sections of this page" bind:this={navEl}>
    {#each NAV as [id, label]}<a href="#{id}" class:active={active === id} aria-current={active === id ? 'true' : undefined}>{label}</a>{/each}
  </nav>

  <div class="part">
    <p class="eyebrow">Part 1 · The story</p>
    <p class="lede">Five short steps, from the number every developer hears to the comparison that is actually useful.</p>
  </div>

  <section id="hook">
    <p class="eyebrow">1 · The setting</p>
    <h2>Does a low price mean greater reach?</h2>
    <p>You are a solo developer or a team of a few people, deciding the genre, price, scope and languages of your next Steam game, with one shot at it. You know the hits in your genre. You have never seen the long tail of games that sold nothing, so your sense of what works is shaped by the games that survived. The first number we found speaks to exactly that instinct.</p>
    <p class="stat"><StoryNum k="hook_successfulCostAtMost10" fallback="85%" countUp /></p>
    <p class="stat-l">of games that reached 100,000 owners cost $10 or less, free games included.</p>
    <p>Look only at the winners and the lesson writes itself: price low. Half of all successful games sit on the $0 to $5 shelf alone.</p>
    <p class="fig-title">Where the successful games are</p>
    <StoryHook />
    <p class="caption">Share of the <StoryNum k="longTail_reach100k" as="n" fallback="99,754" />-game store's successful titles (owner band ≥ 100k) on each price shelf. Snapshot prices.</p>
    <p class="takeaway" use:reveal><b>So far</b>The chart shows where the successful games are. It does not show how often a game on each shelf succeeds, and abundance on a shelf is not the same as a good chance of success on it. The question to ask is not <em>where are the successful games</em> but <em>how often does a game like mine succeed</em>.</p>
    <p class="terms-h">Four words this page uses</p>
    <dl class="terms">
      <div><dt>Reach</dt><dd>The lower bound of SteamSpy's estimated-owner band. It is not sales, revenue or active players.</dd></div>
      <div><dt>Successful</dt><dd>Reach of 100,000 owners or more. That line is our choice, not a fact about games; the tools let you move it.</dd></div>
      <div><dt>Shelf</dt><dd>A price band: Free, $0 to $5, $5 to $10, $10 to $20, $20 to $40, or over $40.</dd></div>
      <div><dt>Reach rate</dt><dd>Successful games divided by all games in a group. The share of a shelf, a genre or a peer group that got there.</dd></div>
    </dl>
  </section>

  <section id="counts">
    <p class="eyebrow">2 · Counts versus rates</p>
    <p class="curio">You ask: so I should price low?</p>
    <h2>Counts can give the wrong impression</h2>
    <p>Read each shelf as a proportion of itself and the picture flips. Among paid games, <StoryNum k="counts_rate_0_5" fallback="7%" /> of titles priced up to $5 reached 100,000 owners. On the $20 to $40 shelf the rate is <StoryNum k="counts_rate_20_40" fallback="18%" />. The cheap shelf holds the most successful games only because it holds <StoryNum k="counts_rate_0_5" as="n" fallback="61,319" /> games in total.</p>
    <StoryFlip />
    <p class="fig-title">The same six shelves, read two ways</p>
    <StoryCounts />
    <p class="caption">Grey: where the successful games are, as a share of all successful games. Blue: the reach rate inside each shelf. Only <StoryNum k="longTail_reach100k" as="pct1" fallback="8.7%" /> of all games reach 100k, and <StoryNum k="longTail_under20k" fallback="75%" /> never pass 20,000 owners.</p>
    <p>Free games are a case of their own. <StoryNum k="counts_rate_free" fallback="16%" /> of the <StoryNum k="counts_rate_free" as="n" fallback="9,484" /> free games reach 100,000 owners, second only to the $20 to $40 shelf and more than double the $0 to $5 rate. Removing the price removes the barrier to trying a game, which is a different mechanism from whatever separates the paid shelves, so the story treats free as its own category rather than as the cheapest end of a price scale.</p>
    <p class="takeaway" use:reveal><b>Takeaway</b>The $0 to $5 shelf holds the most successful games and has the lowest reach rate of the six shelves. A count tells you where the hits are. A rate tells you how often a game gets there.</p>
    <div class="caveat">This does not mean raising a price raises reach. Pricier games are made by different teams with different budgets. It means the right comparison is a rate among comparable games, not a count of visible hits.</div>
  </section>

  <section id="genre">
    <p class="eyebrow">3 · Your genre</p>
    <p class="curio">You ask: is the store-wide rate even my rate?</p>
    <h2>Genre changes the comparison</h2>
    <p>The store-wide rate is still the wrong baseline for one developer, because genres differ. Inside RPG, the $20 to $40 shelf reaches 100,000 owners <StoryNum k="genre_rate_rpg_20_40" fallback="22%" /> of the time against <StoryNum k="genre_rate_all_20_40" fallback="18%" /> across all genres. Pick a genre to see how its shelves compare with the store.</p>
    <StoryGenre />
    <p class="takeaway" use:reveal><b>Takeaway</b>The store-wide rate is an average over genres that behave differently. Start from the rate inside your own genre.</p>
  </section>

  <section id="traits">
    <p class="eyebrow">4 · Your peers</p>
    <p class="curio">You ask: what do the games I would be compared with look like?</p>
    <h2>Comparable games have different traits</h2>
    <p>Once the peer group is right, what its successful games share also changes. Successful RPGs priced $10 to $20 report six or more hours of average playtime <StoryNum k="traits_hours6_rpg_10_20" fallback="82%" /> of the time, against <StoryNum k="traits_hours6_allSuccessful" fallback="47%" /> for all successful games. Only <StoryNum k="traits_platforms2_rpg_10_20" fallback="25%" /> of them ship on two or more operating systems, against <StoryNum k="traits_platforms2_allSuccessful" fallback="35%" /> overall. A developer who looked at the store-wide profile would budget for the wrong things.</p>
    <p class="fig-title">What successful games share: the whole store against one peer group</p>
    <StoryTraits />
    <p class="caption">Share of successful games meeting each condition. Review share counts games with ≥ 50 reviews only. The same comparison for any genre and shelf is in the tool below.</p>
    <p class="takeaway" use:reveal><b>Takeaway</b>There is no single profile of a successful game. It changes with genre and shelf, so read it from your peer group: the games that share both with yours.</p>
  </section>

  <section id="message">
    <p class="eyebrow">5 · The main message</p>
    <h2>Compare rates among relevant peers</h2>
    <div class="callout" use:reveal><p>For solo Steam developers, ownership rates among similar games are more useful for pricing decisions than counts of popular low-priced titles.</p></div>
    <p>Low-priced games account for most high-ownership titles, but they do not have the highest proportion of games reaching our threshold. Genre and price together reveal differences in characteristics such as playtime and platform support. So the useful habit is to choose the games you would actually be compared with, and read proportions inside that group rather than success stories outside it.</p>
    <div class="caveat">What the data cannot say: owner estimates are bands from SteamSpy, not sales, revenue or active players, and prices are a snapshot. None of these associations show that changing a price or adding a feature will cause greater reach. The 100,000-owner line is a choice; the tools below let you move it.</div>
  </section>

  <div class="part">
    <p class="eyebrow">Part 2 · Your turn</p>
    <p class="lede">The story used RPGs as its example. These three tools run the same comparison for any genre and price, and show how far to trust the answer.</p>
    <div class="routes">
      <a href="#tool" use:reveal><b>6 · Compare</b>Which shelf in my genre has the highest reach rate, and what do its successful games share?</a>
      <a href="#explore" use:reveal={120}><b>Explore</b>What does the whole store look like, one game at a time? Select any region and see who is in it.</a>
      <a href="#next" use:reveal={240}><b>Peer lab</b>How sure can I be? Add conditions, watch the sample shrink, and move the success line.</a>
    </div>
  </div>

  <section id="tool">
    <p class="eyebrow">6 · The comparison tool</p>
    <h2>Turn the story into a comparison tool</h2>
    <p class="lede">Pick a genre in the bubbles, then a price band on the shelves. Each click narrows the next view to the games a developer would actually compare against, and every number is shown next to the same number for all successful games. The selection is written into the page address, so a peer group can be sent as a link.</p>
    <ComparisonTool />
  </section>

  <section id="explore">
    <p class="eyebrow">Explore · the whole store, one dot per game</p>
    <h2>Ask your own question of the whole store</h2>
    <p class="lede">Every dot is one game, placed by price and estimated-owner band. Drag a rectangle to select a region; the panels summarize the games inside it against the all-games baseline. Click a genre to light up its games.</p>
    <Explorer />
  </section>

  <section id="next">
    <p class="eyebrow">Peer lab · how far to trust the comparison</p>
    <h2>A smaller peer group is not always a stronger answer</h2>
    <p class="lede">Build a peer group, see how its reach rate changes, then test it at every threshold and check release year and language support. Read the sample size alongside every rate: more specific comparisons can also be less certain.</p>
    <PeerLab />
  </section>

  <section id="takeaways">
    <p class="eyebrow">Takeaways</p>
    <h2>What to take with you</h2>
    <p class="lede">Most successful Steam games are cheap, and most cheap games are not successful. Both are true, and only the second one describes a game that has not launched yet. Four habits follow from it.</p>
    <div class="steps">
      <div use:reveal><b>1 · Choose your peers.</b> Pick the genre you are committing to and the price band you are considering, not the whole store.</div>
      <div use:reveal={120}><b>2 · Read the rate, not the count.</b> The shelf with the most successful games is rarely the shelf where a game most often succeeds.</div>
      <div use:reveal={240}><b>3 · Budget for what your peers share.</b> Check playtime, languages and platforms among successful peers before paying for a feature the store-wide profile suggests.</div>
      <div use:reveal={360}><b>4 · Stress-test the answer.</b> Move the success threshold and read the sample size. A conclusion that holds at 100k and at 500k, on more than a handful of games, is one you can plan around.</div>
    </div>
    <div class="caveat">Keep the limits in view. Reach here is an estimated-owner band, not sales or revenue; prices and features are a snapshot, not launch-day choices; and every figure on this page is an association. None of it shows that changing a price or adding a feature will cause greater reach.</div>
    <p class="src"><a href="#tool">Back to the comparison tool</a> · <a href="#hook">Read the story again</a></p>
  </section>

  <footer>
    <p class="eyebrow">Team</p>
    <p>Rongzhi Chen · Lawrence Liao · Jack (Changming) Liu · Harvard CS1710, Fall 2026</p>
    <p class="src">Data: <a href="https://www.kaggle.com/datasets/fronkongames/steam-games-dataset">Steam Games Dataset</a> (Kaggle; Steam API and SteamSpy), 125,855 games, of which 99,754 have an owner estimate and a genre. Code and pipeline: <a href="https://github.com/rongzhichen/cs1710-steam-reach">github.com/rongzhichen/cs1710-steam-reach</a>.</p>
  </footer>
</div>
