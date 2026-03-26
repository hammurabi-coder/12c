<script>
  import { fade, fly } from 'svelte/transition';
  import {
    buildSearchIndex,
    filterSearchResults,
    getSearchExcerpt,
    groupSearchResultsByCaesar
  } from '$lib/search';
  import { getCaesarHref } from '$lib/utils/routes';

  let { isOpen = $bindable(false) } = $props();

  let searchInput = $state('');
  let isIndexing = $state(false);
  let index = $state([]);
  let results = $derived(filterSearchResults(index, searchInput));
  let resultsByCaesar = $derived(groupSearchResultsByCaesar(results));

  async function ensureIndexed() {
    if (index.length > 0 || isIndexing) return;
    isIndexing = true;

    try {
      index = await buildSearchIndex(fetch);
    } catch (e) {
      console.error('Search indexing failed:', e);
    } finally {
      isIndexing = false;
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') isOpen = false;
  }

  // Trigger indexing on first focus/type
  $effect(() => {
    if (isOpen && searchInput.length > 0) {
      ensureIndexed();
    }
  });

  function focus(node) {
    node.focus();
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-[100] flex items-start justify-center bg-obsidian/90 pt-20 backdrop-blur-sm"
    onkeydown={handleKeydown}
    transition:fade={{ duration: 200 }}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="relative w-full max-w-3xl overflow-hidden rounded-sm border border-papyrus-dark/40 bg-papyrus shadow-2xl"
      transition:fly={{ y: -20, duration: 300 }}
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex items-center border-b border-papyrus-dark/40 p-4">
        <span class="mr-3 text-rubric/40">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg
          >
        </span>
        <input
          type="text"
          bind:value={searchInput}
          placeholder="Search the Twelve Caesars..."
          class="flex-1 bg-transparent font-marcellus text-xl outline-none placeholder:text-ink/30"
          use:focus
        />
        <button
          onclick={() => (isOpen = false)}
          class="ml-3 text-ink/40 hover:text-rubric"
          aria-label="Close search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
          >
        </button>
      </div>

      <div class="scrollbar-hide max-h-[60vh] overflow-y-auto p-4">
        {#if isIndexing}
          <div class="py-8 text-center italic text-ink/40">Indexing the corpus...</div>
        {:else if searchInput.length < 2}
          <div class="py-8 text-center">
            <div class="imperial-label mb-2">Search the Volume</div>
            <p class="text-xs text-ink/40">
              Type at least 2 characters to search names, headings, and texts.
            </p>
          </div>
        {:else if results.length === 0}
          <div class="py-8 text-center italic text-ink/40">
            No results found for "{searchInput}"
          </div>
        {:else}
          {#each Object.entries(resultsByCaesar) as [caesar, caesarResults]}
            <div class="mb-6">
              <div class="imperial-label mb-3 border-b border-rubric/10 pb-1">{caesar}</div>
              <div class="space-y-3">
                {#each caesarResults as result}
                  <a
                    href={getCaesarHref(result.slug)}
                    onclick={() => (isOpen = false)}
                    class="group block border-l-2 border-transparent pl-4 transition-all hover:border-rubric hover:bg-black/5"
                  >
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-bold uppercase tracking-wider text-rubric/60"
                        >{result.heading}</span
                      >
                      <span class="text-[8px] uppercase tracking-widest text-ink/30"
                        >({result.lang})</span
                      >
                    </div>
                    <p class="text-sm italic leading-relaxed text-ink/60 group-hover:text-ink">
                      {getSearchExcerpt(result.text, searchInput)}
                    </p>
                  </a>
                {/each}
              </div>
            </div>
          {/each}
        {/if}
      </div>

      <div
        class="border-t border-papyrus-dark/20 bg-papyrus-dark/10 px-4 py-2 text-[10px] uppercase tracking-widest text-ink/30"
      >
        ESC to close · {results.length} matches found
      </div>
    </div>
  </div>
{/if}
