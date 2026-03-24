<script>
  import { onMount } from 'svelte';
  import { caesars } from '$lib/data/caesars';
  import { base } from '$app/paths';
  
  // Components
  import Navigation from '$lib/components/Navigation.svelte';
  import Header from '$lib/components/Header.svelte';
  import Biography from '$lib/components/Biography.svelte';
  import Footer from '$lib/components/Footer.svelte';

  let currentCaesarIndex = 0;
  let currentLang = 'en'; // 'en', 'la', 'both'
  let caesarData = null;
  let loading = false;

  $: currentCaesar = caesars[currentCaesarIndex];

  async function fetchCaesar(index) {
    loading = true;
    currentCaesarIndex = index;
    const name = caesars[index].slug;
    try {
      const response = await fetch(`${base}/content/${name}.json`);
      caesarData = await response.json();
    } catch (e) {
      console.error('Failed to load caesar:', e);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    fetchCaesar(0);
  });
</script>

<svelte:head>
  <title>The Twelve Caesars - Suetonius</title>
</svelte:head>

<div class="min-h-screen flex flex-col font-marcellus bg-papyrus text-ink">
  
  <Navigation 
    {caesars} 
    {currentCaesarIndex} 
    onSelect={fetchCaesar} 
  />

  <!-- Umbilici: Scroll Rollers Effect Container -->
  <div class="flex-1 flex justify-center w-full px-4 md:px-0">
    <div class="w-full max-w-7xl border-x-[12px] border-double border-roller/30 min-h-screen bg-papyrus shadow-inner flex flex-col relative">
      
      <Header />

      <!-- Language Toggle -->
      <div class="flex justify-center mb-12">
        <div class="flex bg-papyrus-dark/20 p-1 rounded-sm border border-papyrus-dark/40">
          {#each ['en', 'la', 'both'] as mode}
            <button 
              on:click={() => currentLang = mode}
              class="px-5 py-1.5 font-cinzel text-[11px] font-bold tracking-widest uppercase transition-all
                {currentLang === mode ? 'bg-papyrus text-rubric shadow-sm' : 'text-ink/50 hover:text-ink'}"
            >
              {mode === 'both' ? 'Bilingual' : mode === 'en' ? 'English' : 'Latin'}
            </button>
          {/each}
        </div>
      </div>

      <!-- Main Biography Scroll -->
      <main class="flex-1 px-8 md:px-16 pb-24">
        {#if loading}
          <div class="text-center py-20 italic text-ink/40">
            Unrolling the life of {currentCaesar.name}...
          </div>
        {:else if caesarData}
          <Biography 
            {currentCaesar} 
            {caesarData} 
            {currentLang} 
          />
        {/if}
      </main>

      <Footer {currentCaesar} />

    </div>
  </div>
</div>

<style>
  :global(body) {
    background-color: #1a1208;
  }
</style>
