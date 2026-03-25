<script>
  import { fly, fade } from 'svelte/transition';
  import { caesars } from '$lib/data/caesars';

  // Components
  import Navigation from '$lib/components/Navigation.svelte';
  import Header from '$lib/components/Header.svelte';
  import Biography from '$lib/components/Biography.svelte';
  import Footer from '$lib/components/Footer.svelte';

  /** @type {{ data: import('./$types').PageData }} */
  let { data } = $props();

  // Svelte 5 State (Runes) - Derived from SvelteKit Data
  let currentCaesarIndex = $derived(caesars.findIndex((c) => c.slug === data.slug));
  let currentLang = $state('en'); // 'en', 'la', 'both'
  let caesarData = $derived(data.caesarData);
  let currentCaesar = $derived(caesars[currentCaesarIndex]);
</script>

<svelte:head>
  <title>{currentCaesar.name} - The Twelve Caesars</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-tyrian font-marcellus text-ink">
  <!-- Header at the VERY top -->
  <div class="border-b border-papyrus-dark/20 bg-obsidian py-2">
    <Header />
  </div>

  <Navigation {caesars} {currentCaesarIndex} />

  <!-- The "Scroll" Background - Imperially Framed -->
  <div class="flex w-full flex-1 justify-center px-4 md:px-0">
    <div class="volumen-container">
      <!-- Language Toggle -->
      <div class="my-12 flex justify-center">
        <div class="flex rounded-sm border border-papyrus-dark/40 bg-papyrus-dark/20 p-1">
          {#each ['en', 'la', 'both'] as mode}
            <button
              onclick={() => (currentLang = mode)}
              class="imperial-label px-5 py-1.5 transition-all
                {currentLang === mode
                ? 'bg-papyrus text-rubric shadow-sm'
                : 'text-ink/50 hover:text-ink'}"
            >
              {mode === 'both' ? 'Bilingual' : mode === 'en' ? 'English' : 'Latin'}
            </button>
          {/each}
        </div>
      </div>

      <!-- Main Biography Scroll -->
      <main class="relative flex-1 px-8 pb-24 md:px-16">
        {#if caesarData}
          {#key data.slug}
            <div in:fly={{ y: 20, duration: 800, delay: 200 }} out:fade={{ duration: 200 }}>
              <Biography {currentCaesar} {caesarData} {currentLang} />
            </div>
          {/key}
        {/if}
      </main>

      <Footer {currentCaesar} {currentCaesarIndex} />
    </div>
  </div>
</div>
