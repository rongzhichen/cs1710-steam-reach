<script>
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { loadData, fmt } from '$lib/data.js';
  import { dataset } from '$lib/stores.js';
  import StoryNum from '$lib/components/StoryNum.svelte';
  import StoryHook from '$lib/components/StoryHook.svelte';
  import StoryCounts from '$lib/components/StoryCounts.svelte';
  import StoryGenre from '$lib/components/StoryGenre.svelte';
  import StoryTraits from '$lib/components/StoryTraits.svelte';
  import ComparisonTool from '$lib/components/ComparisonTool.svelte';
  import Explorer from '$lib/components/Explorer.svelte';

  // The game rows are fetched on the client, not in a load function, so the 4 MB of data is never
  // inlined into the prerendered HTML. The prose numbers below fall back to the published values.
  onMount(() => { loadData(base).then(d => dataset.set(d)); });
  const nGames = $derived(fmt($dataset?.meta?.N ?? 99754));
</script>

<svelte:head>
  <title>Steam Game Reach and Developer Decisions</title>
  <meta name="description" content="A data story for solo Steam developers: why reach rates among similar games beat counts of popular low-priced titles." />
</svelte:head>

<div class="wrap">
  <header>
    <p class="eyebrow">CS1710 · Steam Games Dataset · a data story for solo developers and small studios</p>
    <h1>Steam Game Reach and Developer Decisions</h1>
    <p class="lede">Most of what a developer hears about Steam comes from the games that made it. This page looks at all <span data-n-games>{nGames}</span> games with an owner estimate, asks which ones reached a real audience, and shows why comparing <em>rates among similar games</em> beats counting the famous cheap hits.</p>
    <nav class="toc">
      <a href="#hook">1 Setting</a><a href="#counts">2 Counts mislead</a><a href="#genre">3 Genre</a><a href="#traits">4 Traits</a><a href="#message">5 Aha</a><a href="#tool">6 Solution</a><a href="#explore">Explore</a><a href="#next">Next views</a>
    </nav>
  </header>

  <section id="hook">
    <p class="eyebrow">1 · Setting and hook</p>
    <h2>Does a low price mean greater reach?</h2>
    <p><strong>The setting.</strong> You are a solo developer or a team of a few people, deciding the genre, price, scope and languages of your next Steam game, with one shot at it. You know the hits in your genre. You have never seen the long tail of games that sold nothing, so your sense of what works is shaped by the games that survived. The first number we found speaks to exactly that instinct.</p>
    <p class="stat"><StoryNum k="hook_successfulCostAtMost10" fallback="85%" /></p>
    <p class="stat-l">of games that reached 100,000 owners cost $10 or less, free games included.</p>
    <p>Look only at the winners and the lesson writes itself: price low. Half of all successful games sit on the $0 to $5 shelf alone. But abundance on a shelf is not the same as a good chance of success on it. The question a developer should ask is not <em>where are the successful games</em> but <em>how often does a game like mine succeed</em>.</p>
    <StoryHook />
    <p class="caption">Share of the <StoryNum k="longTail_reach100k" as="n" fallback="99,754" />-game store's successful titles (owner band ≥ 100k) on each price shelf. Snapshot prices.</p>
  </section>

  <section id="counts">
    <p class="eyebrow">2 · Rising insight</p>
    <p class="curio">You ask: so I should price low?</p>
    <h2>Counts can give the wrong impression</h2>
    <p>Read each shelf as a proportion of itself and the picture flips. Among paid games, <StoryNum k="counts_rate_0_5" fallback="7%" /> of titles priced up to $5 reached 100,000 owners. On the $20 to $40 shelf the rate is <StoryNum k="counts_rate_20_40" fallback="18%" />. The cheap shelf holds the most successful games only because it holds <StoryNum k="counts_rate_0_5" as="n" fallback="61,319" /> games in total.</p>
    <StoryCounts />
    <p class="caption">Grey: where the successful games are, as a share of all successful games. Blue: the reach rate inside each shelf. Only <StoryNum k="longTail_reach100k" as="pct1" fallback="8.7%" /> of all games reach 100k, and <StoryNum k="longTail_under20k" fallback="75%" /> never pass 20,000 owners.</p>
    <div class="caveat">This does not mean raising a price raises reach. Pricier games are made by different teams with different budgets. It means the right comparison is a rate among comparable games, not a count of visible hits.</div>
  </section>

  <section id="genre">
    <p class="eyebrow">3 · Rising insight</p>
    <p class="curio">You ask: is the store-wide rate even my rate?</p>
    <h2>Genre changes the comparison</h2>
    <p>The store-wide rate is still the wrong baseline for one developer, because genres differ. Inside RPG, the $20 to $40 shelf reaches 100,000 owners <StoryNum k="genre_rate_rpg_20_40" fallback="22%" /> of the time against <StoryNum k="genre_rate_all_20_40" fallback="18%" /> across all genres. Pick a genre to see how its shelves compare with the store.</p>
    <StoryGenre />
  </section>

  <section id="traits">
    <p class="eyebrow">4 · Rising insight</p>
    <p class="curio">You ask: what do the games I would be compared with look like?</p>
    <h2>Comparable games have different traits</h2>
    <p>Once the peer group is right, what its successful games share also changes. Successful RPGs priced $10 to $20 report six or more hours of average playtime <StoryNum k="traits_hours6_rpg_10_20" fallback="82%" /> of the time, against <StoryNum k="traits_hours6_allSuccessful" fallback="47%" /> for all successful games. Only <StoryNum k="traits_platforms2_rpg_10_20" fallback="25%" /> of them ship on two or more operating systems, against <StoryNum k="traits_platforms2_allSuccessful" fallback="35%" /> overall. A developer who looked at the store-wide profile would budget for the wrong things.</p>
    <StoryTraits />
    <p class="caption">Share of successful games meeting each condition. Review share counts games with ≥ 50 reviews only. The same comparison for any genre and shelf is in the tool below.</p>
  </section>

  <section id="message">
    <p class="eyebrow">5 · Aha moment</p>
    <h2>Compare rates among relevant peers</h2>
    <div class="callout"><p>For solo Steam developers, ownership rates among similar games are more useful for pricing decisions than counts of popular low-priced titles.</p></div>
    <p>Low-priced games account for most high-ownership titles, but they do not have the highest proportion of games reaching our threshold. Genre and price together reveal differences in characteristics such as playtime and platform support. So the useful habit is to choose the games you would actually be compared with, and read proportions inside that group rather than success stories outside it.</p>
    <div class="caveat">What the data cannot say: owner estimates are bands from SteamSpy, not sales, revenue or active players, and prices are a snapshot. None of these associations show that changing a price or adding a feature will cause greater reach. The 100,000-owner line is a choice; the tool below lets you move it.</div>
  </section>

  <section id="tool">
    <p class="eyebrow">6 · Solution and next steps</p>
    <h2>Turn the story into a comparison tool</h2>
    <p class="lede">Pick a genre in the bubbles, then a price band on the shelves. Each click narrows the next view to the games a developer would actually compare against, and every number is shown next to the same number for all successful games.</p>
    <div class="steps">
      <div><b>1 · Choose your peers.</b> Pick the genre you are committing to and the price band you are considering, not the whole store.</div>
      <div><b>2 · Read the rate, not the count.</b> The shelf with the most successful games is rarely the shelf where a game most often succeeds.</div>
      <div><b>3 · Budget for what your peers share.</b> Check playtime, languages and platforms among successful peers before paying for a feature the store-wide profile suggests.</div>
      <div><b>4 · Stress-test the line.</b> Move the success threshold. A conclusion that holds at 100k and at 500k is one you can plan around.</div>
    </div>
    <ComparisonTool />
  </section>

  <section id="explore">
    <p class="eyebrow">Explore</p>
    <h2>Ask your own question of the whole store</h2>
    <p class="lede">Every dot is one game, placed by price and estimated-owner band. Drag a rectangle to select a region; the panels summarize the games inside it against the all-games baseline. Click a genre to light up its games.</p>
    <Explorer />
  </section>

  <section id="next">
    <p class="eyebrow">Next steps · views planned for V2</p>
    <h2>What comes next</h2>
    <p>Three views are drafted but not built. The first is the novel view: it turns the comparison tool into a ladder, so a developer can watch the base rate move as each trait of their own game is added, with the sample size and uncertainty in view. All three use real numbers from the pipeline. <a href="{base}/drafts/index.html">Open the full drafts page</a>.</p>
    <div class="drafts">
      <figure><img src="{base}/drafts/img/draft-a-peer-ladder.png" alt="Draft A, peer ladder: reach rate as traits are added one at a time, with confidence whiskers"><figcaption>Draft A · novel view · peer ladder</figcaption></figure>
      <figure><img src="{base}/drafts/img/draft-b-launch-cohorts.png" alt="Draft B, launch-year cohorts: reach rate by release year"><figcaption>Draft B · launch-year cohorts</figcaption></figure>
      <figure><img src="{base}/drafts/img/draft-c-localization.png" alt="Draft C, localization ladder: reach rate by language count, all games versus RPG $10 to $20"><figcaption>Draft C · localization ladder</figcaption></figure>
    </div>
  </section>

  <footer>
    <p class="eyebrow">Team</p>
    <p>Rongzhi Chen · Lawrence Liao · Jack (Changming) Liu · Harvard CS1710, Fall 2026</p>
    <p class="src">Data: <a href="https://www.kaggle.com/datasets/fronkongames/steam-games-dataset">Steam Games Dataset</a> (Kaggle; Steam API and SteamSpy), 125,855 games, of which 99,754 have an owner estimate and a genre. Code and pipeline: <a href="https://github.com/rongzhichen/cs1710-steam-reach">github.com/rongzhichen/cs1710-steam-reach</a>. Prototype V1, SvelteKit build.</p>
  </footer>
</div>
