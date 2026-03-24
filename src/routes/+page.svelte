<script>
  import { onMount } from 'svelte';
  import { caesars } from '$lib/data/caesars';
  import { base } from '$app/paths';

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

  function formatText(text) {
    if (!text) return '';
    return text.split('\n\n').map(p => `<p class="mb-4">${p}</p>`).join('');
  }
</script>

<svelte:head>
  <title>The Twelve Caesars - Suetonius</title>
</svelte:head>

<div class="min-h-screen flex flex-col font-marcellus">
  <!-- Header -->
  <header class="bg-gradient-to-b from-[#1a1208] to-[#2e2210] border-b border-[#C9A84C] px-4 py-7 text-center">
    <div class="text-xs tracking-[6px] text-[#E8C97A]/60 mb-4 font-cinzel">
      ◆
    </div>
    <h1 class="text-[#E8C97A] font-cinzel font-bold tracking-[2px] text-2xl md:text-4xl uppercase">
      The Twelve Caesars
    </h1>
    <div class="text-[#E8C97A]/60 text-sm mt-3 font-cinzel tracking-[3px] uppercase">
      Suetonius · De Vita Caesarum · c. AD 121
    </div>
    <div class="italic text-[#E8C97A]/50 text-sm mt-2">
      Lives of the Emperors of Rome
    </div>
  </header>

  <!-- Timeline Navigation -->
  <nav class="bg-[#1a1208] border-b border-[#C9A84C]/25 overflow-x-auto px-6 py-0 scrollbar-hide">
    <div class="flex items-end min-w-[900px] h-[110px] relative">
      <div class="absolute bottom-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent"></div>
      
      {#each caesars as caesar, i}
        <button 
          on:click={() => fetchCaesar(i)}
          class="flex-1 flex flex-col items-center cursor-pointer py-2 relative group transition-transform duration-150 hover:-translate-y-1 {currentCaesarIndex === i ? 'active -translate-y-1' : ''}"
        >
          <span class="font-cinzel text-[9px] tracking-wide text-[#E8C97A]/55 whitespace-nowrap absolute top-1 transition-colors duration-150 group-hover:text-[#E8C97A] {currentCaesarIndex === i ? 'text-[#E8C97A]' : ''}">
            {caesar.name.split(' ')[0]}
          </span>
          <div class="w-3 h-3 rounded-full bg-[#1E160A] border-2 border-[#C9A84C] absolute bottom-6 transition-colors duration-150 z-10 group-hover:bg-[#C9A84C] {currentCaesarIndex === i ? 'bg-[#C9A84C]' : ''}"></div>
          <span class="font-cinzel text-[9px] italic text-[#C9A84C]/40 whitespace-nowrap absolute bottom-1">
            {caesar.n}
          </span>
        </button>
      {/each}
    </div>
  </nav>

  <!-- Controls -->
  <div class="flex items-center justify-between px-6 py-3 bg-[#2A1F0E] border-b border-[#C9A84C]/15 flex-wrap gap-2">
    <div class="font-cinzel text-[10px] tracking-[3px] text-[#E8C97A]/45">
      {currentCaesar.n} · {currentCaesar.name.toUpperCase()}
    </div>
    <div class="flex border border-[#C9A84C]/35 rounded overflow-hidden">
      <button 
        on:click={() => currentLang = 'en'}
        class="px-3.5 py-1 font-cinzel text-[10px] tracking-wide transition-all duration-150 {currentLang === 'en' ? 'bg-[#C9A84C]/20 text-[#E8C97A]' : 'text-[#E8C97A]/45 bg-transparent hover:bg-[#C9A84C]/10'}"
      >
        ENGLISH
      </button>
      <button 
        on:click={() => currentLang = 'la'}
        class="px-3.5 py-1 font-cinzel text-[10px] tracking-wide border-x border-[#C9A84C]/35 transition-all duration-150 {currentLang === 'la' ? 'bg-[#C9A84C]/20 text-[#E8C97A]' : 'text-[#E8C97A]/45 bg-transparent hover:bg-[#C9A84C]/10'}"
      >
        LATIN
      </button>
      <button 
        on:click={() => currentLang = 'both'}
        class="px-3.5 py-1 font-cinzel text-[10px] tracking-wide transition-all duration-150 {currentLang === 'both' ? 'bg-[#C9A84C]/20 text-[#E8C97A]' : 'text-[#E8C97A]/45 bg-transparent hover:bg-[#C9A84C]/10'}"
      >
        BOTH
      </button>
    </div>
  </div>

  <!-- Content -->
  <main class="flex-1 bg-[#F8F5EE] overflow-y-auto">
    {#if loading}
      <div class="p-8 italic text-[#7A6E5F] text-sm py-2">
        Fetching the Life of {currentCaesar.name} from Suetonius…
      </div>
    {:else if caesarData}
      <div class="p-8 pb-12 max-w-6xl mx-auto">
        <!-- Intro Hero -->
        <div class="flex items-end gap-8 mb-12 flex-wrap border-b border-[#C9A84C]/20 pb-8">
          <div class="flex-shrink-0 text-center">
            <!-- Simple SVG Bust Placeholder -->
            <svg viewBox="0 0 100 160" class="w-24 h-40 block mx-auto opacity-80" xmlns="http://www.w3.org/2000/svg">
              <rect x="15" y="140" width="70" height="18" rx="1" fill={currentCaesar.color} />
              <rect x="28" y="95" width="44" height="45" rx="2" fill={currentCaesar.color} opacity="0.8" />
              <ellipse cx="50" cy="68" rx="18" ry="22" fill={currentCaesar.color} opacity="0.9" />
              <path d="M33 56 Q36 48 44 50 Q50 45 56 50 Q64 48 67 56" stroke="#7A8B4A" stroke-width="2" fill="none" opacity=".7" />
            </svg>
            <div class="font-cinzel text-[9px] tracking-[3px] text-[#7A6E5F] text-center mt-1 border-t border-[#E8E2D5] pt-1 uppercase">
              {currentCaesar.latin}
            </div>
          </div>
          
          <div class="flex-1 min-w-[200px]">
            <div class="font-cinzel text-[11px] tracking-[4px] text-[#C9A84C] mb-1 uppercase">
              LIBER {currentCaesar.n}
            </div>
            <h2 class="font-cinzel font-bold text-[#2A1F0E] text-xl md:text-3xl leading-tight uppercase">
              {currentCaesar.name}
            </h2>
            <div class="italic text-[#7A6E5F] text-sm my-1">
              {currentCaesar.dates} · Reign: {currentCaesar.reign}
            </div>
            <div class="text-[#5C4F3A] leading-relaxed mt-3 text-lg">
              {currentCaesar.tag}
            </div>
          </div>
        </div>

        <!-- Chapters -->
        <div class="space-y-12">
          {#each caesarData.sections as section}
            <section class="mb-12">
              <h3 class="font-cinzel text-[12px] tracking-[2px] text-[#C9A84C] opacity-75 uppercase mb-6 border-b border-[#C9A84C]/10 pb-2">
                {section.heading}
              </h3>
              
              <div class="grid grid-cols-1 {currentLang === 'both' ? 'md:grid-cols-2' : ''} gap-10">
                {#if currentLang === 'en' || currentLang === 'both'}
                  <div>
                    {#if currentLang === 'both'}
                      <div class="font-cinzel text-[9px] tracking-[4px] text-[#C9A84C] opacity-60 uppercase mb-3">
                        English · Rolfe, 1914
                      </div>
                    {/if}
                    <div class="text-[#5C4F3A] leading-loose text-[16px] space-y-4">
                      {@html formatText(section.en)}
                    </div>
                  </div>
                {/if}
                
                {#if currentLang === 'la' || currentLang === 'both'}
                  <div>
                    {#if currentLang === 'both'}
                      <div class="font-cinzel text-[9px] tracking-[4px] text-[#C9A84C] opacity-60 uppercase mb-3">
                        Latin · Vulgata
                      </div>
                    {/if}
                    <div class="text-[#4a3e2d] leading-loose text-[16px] italic space-y-4">
                      {@html formatText(section.la)}
                    </div>
                  </div>
                {/if}
              </div>
            </section>
          {/each}
        </div>
      </div>
    {/if}
  </main>

  <!-- Footer -->
  <footer class="text-center py-16 px-8 border-t border-[#E8E2D5]/50 bg-[#1a1208]">
    <span class="font-cinzel text-[#C9A84C]/20 text-4xl block mb-3 select-none">SPQR</span>
    <p class="italic text-[#E8C97A]/30 text-sm font-cinzel">
      Digitized Scholarly Edition · Public Domain Texts
    </p>
  </footer>
</div>

<style>
  :global(.active) {
    transform: translateY(-4px);
  }
</style>
