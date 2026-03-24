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
    return text.split('\n\n').map(p => `<p class="mb-6 indent-8 text-justify">${p}</p>`).join('');
  }
</script>

<svelte:head>
  <title>The Twelve Caesars - Suetonius</title>
</svelte:head>

<div class="min-h-screen flex flex-col font-marcellus bg-papyrus text-ink">
  
  <!-- Tituli: Parchment tags navigation -->
  <nav class="sticky top-0 z-50 bg-[#1a1208] border-b border-papyrus-dark overflow-x-auto scrollbar-hide pt-1 px-4">
    <div class="flex items-start min-w-[900px] h-[72px] gap-2">
      {#each caesars as caesar, i}
        <button 
          on:click={() => fetchCaesar(i)}
          class="flex-shrink-0 w-[72px] h-[58px] bg-papyrus border-x border-b border-papyrus-dark rounded-b-lg shadow-sm flex flex-col items-center justify-center transition-all duration-200 
            {currentCaesarIndex === i ? 'h-[64px] bg-white shadow-md border-rubric/40' : 'hover:h-[62px] hover:bg-[#FAF8F5]'}"
        >
          <span class="font-cinzel text-[10px] font-bold tracking-tighter leading-none mb-1 {currentCaesarIndex === i ? 'text-rubric' : 'text-ink/60'}">
            {caesar.n}
          </span>
          <span class="font-cinzel text-[8px] tracking-[1px] leading-none uppercase text-ink/80 text-center px-1 truncate w-full">
            {caesar.name.split(' ')[0]}
          </span>
        </button>
      {/each}
    </div>
  </nav>

  <!-- Umbilici: Scroll Rollers Effect Container -->
  <div class="flex-1 flex justify-center w-full px-4 md:px-0">
    <div class="w-full max-w-7xl border-x-[12px] border-double border-roller/30 min-h-screen bg-papyrus shadow-inner flex flex-col relative">
      
      <!-- Titulus Header -->
      <header class="pt-16 pb-12 px-8 text-center border-b border-papyrus-dark/40 mb-12">
        <h1 class="text-rubric font-cinzel font-bold tracking-[4px] text-3xl md:text-5xl uppercase mb-4">
          The Twelve Caesars
        </h1>
        <div class="text-ink/70 text-base font-cinzel tracking-[2px] uppercase">
          Suetonius · De Vita Caesarum · c. AD 121
        </div>
        <div class="italic text-ink/40 text-sm mt-3 font-marcellus">
          Lives of the Emperors of Rome
        </div>
      </header>

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
          <!-- Caesar Intro Section -->
          <div class="max-w-4xl mx-auto mb-16 border-b border-rubric/10 pb-12">
            <div class="flex flex-col md:flex-row items-center gap-10">
              <!-- Iconic Red Bust Representation -->
              <div class="w-32 h-32 flex-shrink-0 bg-rubric/5 border-2 border-rubric/20 rounded-full flex items-center justify-center relative overflow-hidden group">
                 <svg viewBox="0 0 100 100" class="w-20 h-20 text-rubric opacity-80" xmlns="http://www.w3.org/2000/svg">
                  <path fill="currentColor" d="M50 20c-15 0-22 10-22 22 0 10 5 15 5 15l-5 25h44l-5-25s5-5 5-15c0-12-7-22-22-22z" />
                </svg>
                <div class="absolute inset-0 bg-gradient-to-t from-papyrus via-transparent to-transparent opacity-60"></div>
              </div>

              <div>
                <div class="font-cinzel text-xs tracking-[4px] text-rubric mb-2 font-bold">LIBER {currentCaesar.n}</div>
                <h2 class="font-cinzel font-bold text-ink text-3xl md:text-5xl uppercase mb-3 leading-none">
                  {currentCaesar.name}
                </h2>
                <div class="font-cinzel text-sm italic text-ink/60 mb-4 tracking-wider uppercase">
                  {currentCaesar.latin} · {currentCaesar.dates}
                </div>
                <p class="text-lg leading-relaxed text-ink/90 italic">
                  "{currentCaesar.tag}"
                </p>
              </div>
            </div>
          </div>

          <!-- Paginae Chapters -->
          <div class="space-y-24">
            {#each caesarData.sections as section}
              <section class="chapter-content">
                <div class="flex items-center gap-4 mb-8">
                  <span class="h-px flex-1 bg-rubric/10"></span>
                  <h3 class="font-cinzel font-bold text-xs tracking-[5px] text-rubric uppercase whitespace-nowrap">
                    {section.heading}
                  </h3>
                  <span class="h-px flex-1 bg-rubric/10"></span>
                </div>
                
                {#if currentLang === 'both'}
                   <!-- Side-by-Side Aligned Paginae -->
                   <div class="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                      <div>
                        <div class="font-cinzel text-[10px] font-bold tracking-[3px] text-rubric/40 uppercase mb-4 text-center">English · Rolfe</div>
                        <div class="leading-loose text-lg text-ink/90">
                          {@html formatText(section.en)}
                        </div>
                      </div>
                      <div class="bg-black/[0.02] p-6 rounded-sm border-l border-rubric/10">
                        <div class="font-cinzel text-[10px] font-bold tracking-[3px] text-rubric/40 uppercase mb-4 text-center">Latin · Vulgata</div>
                        <div class="leading-loose text-lg text-ink/70 italic">
                          {@html formatText(section.la)}
                        </div>
                      </div>
                   </div>
                {:else}
                  <!-- Multi-Column Single Language View (The classic Scroll aesthetic) -->
                  <div class="columns-1 md:columns-2 lg:columns-3 gap-16 leading-loose text-lg text-ink/95">
                    {@html formatText(currentLang === 'en' ? section.en : section.la)}
                  </div>
                {if currentLang === 'la'}
                  <div class="mt-4 text-center">
                    <span class="font-cinzel text-[9px] tracking-widest text-rubric/30 uppercase italic">Latin Edition</span>
                  </div>
                {/if}
                {/if}
              </section>
            {/each}
          </div>
        {/if}
      </main>

      <!-- Footer Finis -->
      <footer class="text-center py-20 px-8 border-t border-papyrus-dark/40 bg-papyrus relative overflow-hidden">
        <div class="absolute inset-0 opacity-5 pointer-events-none select-none overflow-hidden flex items-center justify-center">
          <span class="font-cinzel text-[20vw] font-bold">SPQR</span>
        </div>
        <span class="font-cinzel text-rubric/10 text-6xl block mb-6 select-none leading-none">§</span>
        <p class="font-cinzel tracking-[4px] text-rubric/40 text-sm uppercase mb-2">
          Finis Libri {currentCaesar.n}
        </p>
        <p class="text-ink/30 text-xs italic">
          Digitized Scholarly Edition · Public Domain Texts
        </p>
      </footer>

    </div>
  </div>
</div>

<style>
  :global(body) {
    background-color: #1a1208;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .chapter-content {
    break-inside: avoid-column;
  }
</style>
