<script>
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { caesars } from '$lib/data/caesars';
  import { base } from '$app/paths';

  // Components
  import Navigation from '$lib/components/Navigation.svelte';
  import Header from '$lib/components/Header.svelte';
  import Biography from '$lib/components/Biography.svelte';
  import Footer from '$lib/components/Footer.svelte';

  // Svelte 5 State (Runes)
  let currentCaesarIndex = $state(0);
  let currentLang = $state('en'); // 'en', 'la', 'both'
  let caesarData = $state(null);
  let loading = $state(false);

  // Derived state (Runes)
  let currentCaesar = $derived(caesars[currentCaesarIndex]);

  async function fetchCaesar(index) {
    if (loading && currentCaesarIndex === index && caesarData) return;
    loading = true;
    currentCaesarIndex = index;
    const name = caesars[index].slug;

    // Update URL Hash for deep-linking (Hyphenate for URL)
    const hash = name.replace(/ /g, '-');
    if (window.location.hash !== `#${hash}`) {
      window.location.hash = hash;
    }

    try {
      const response = await fetch(`${base}/content/${name}.json`);
      caesarData = await response.json();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error('Failed to load caesar:', e);
    } finally {
      loading = false;
    }
  }

  function handleHashChange() {
    const hash = window.location.hash.substring(1).replace(/-/g, ' ');
    const index = caesars.findIndex((c) => c.slug === hash);
    if (index !== -1 && index !== currentCaesarIndex) {
      fetchCaesar(index);
    }
  }

  onMount(() => {
    if (window.location.hash) {
      handleHashChange();
    } else {
      fetchCaesar(0);
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  });
</script>

<svelte:head>
  <title>{currentCaesar.name} - The Twelve Caesars</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-[#2D0B23] font-marcellus text-ink">
  <!-- Header at the VERY top -->
  <div class="border-b border-papyrus-dark/20 bg-[#1a1208] py-2">
    <Header />
  </div>

  <Navigation {caesars} {currentCaesarIndex} onSelect={fetchCaesar} />

  <!-- The "Scroll" Background - Imperially Framed -->
  <div class="flex w-full flex-1 justify-center px-4 md:px-0">
    <!-- Unrolling Transition Wrap -->
    <div class="volumen-container">
      <!-- Language Toggle (Moved inside the scroll area) -->
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
        {#if loading && !caesarData}
          <div transition:fade={{ duration: 300 }} class="py-20 text-center italic text-ink/40">
            Unrolling the life of {currentCaesar.name}...
          </div>
        {:else if caesarData}
          <div
            key={currentCaesar.slug}
            in:fly={{ y: 20, duration: 800, delay: 200 }}
            out:fade={{ duration: 200 }}
          >
            <Biography {currentCaesar} {caesarData} {currentLang} />
          </div>
        {/if}
      </main>

      <Footer {currentCaesar} />
    </div>
  </div>
</div>

<style>
  :global(body) {
    background-color: #2d0b23; /* Imperial Tyrian Purple */
    overflow-x: hidden;
  }
</style>
