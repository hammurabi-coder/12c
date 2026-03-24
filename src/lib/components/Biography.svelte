<script>
  export let currentCaesar = {};
  export let caesarData = null;
  export let currentLang = 'en';

  function formatText(text) {
    if (!text) return '';
    return text.split('\n\n').map(p => `<p class="mb-6 indent-8 text-justify">${p}</p>`).join('');
  }
</script>

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
        {#if currentLang === 'la'}
          <div class="mt-4 text-center">
            <span class="font-cinzel text-[9px] tracking-widest text-rubric/30 uppercase italic">Latin Edition</span>
          </div>
        {/if}
      {/if}
    </section>
  {/each}
</div>

<style>
  .chapter-content {
    break-inside: avoid-column;
  }
</style>
