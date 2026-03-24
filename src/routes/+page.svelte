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
    if (loading && currentCaesarIndex === index) return;
    loading = true;
    currentCaesarIndex = index;
    const name = caesars[index].slug;

    // Update URL Hash for deep-linking
    if (window.location.hash !== `#${name.replace(' ', '-')}`) {
      window.location.hash = name.replace(' ', '-');
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
    const hash = window.location.hash.substring(1).replace('-', ' ');
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
  <Navigation {caesars} {currentCaesarIndex} onSelect={fetchCaesar} />

  <!-- The "Scroll" Background - Imperially Framed -->
  <div class="flex w-full flex-1 justify-center px-4 md:px-0">
    <!-- Unrolling Transition Wrap -->
    <div
      class="relative flex min-h-screen w-full max-w-7xl flex-col border-x-[16px] border-double border-roller/40 bg-papyrus shadow-[0_0_100px_rgba(0,0,0,0.8)]"
    >
      <Header />

      <!-- Language Toggle -->
      <div class="mb-12 flex justify-center">
        <div class="flex rounded-sm border border-papyrus-dark/40 bg-papyrus-dark/20 p-1">
          {#each ['en', 'la', 'both'] as mode}
            <button
              onclick={() => (currentLang = mode)}
              class="px-5 py-1.5 font-cinzel text-[11px] font-bold uppercase tracking-widest transition-all
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
        {#if loading}
          <div transition:fade={{ duration: 300 }} class="py-20 text-center italic text-ink/40">
            Unrolling the life of {currentCaesar.name}...
          </div>
        {:else if caesarData}
          <!-- Unrolling Transition Effect -->
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
