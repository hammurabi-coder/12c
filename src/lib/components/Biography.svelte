<script>
  let { currentCaesar = {}, caesarData = null, currentLang = 'en' } = $props();

  function formatText(text) {
    if (!text) return '';
    return text
      .split('\n\n')
      .map((p) => `<p class="mb-6 indent-8 text-justify">${p}</p>`)
      .join('');
  }
</script>

<div class="mx-auto mb-16 max-w-4xl border-b border-rubric/10 pb-12">
  <div class="flex flex-col items-center gap-10 md:flex-row">
    <!-- Iconic Red Bust Representation -->
    <div
      class="group relative flex h-32 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-rubric/20 bg-rubric/5"
    >
      <svg
        viewBox="0 0 100 100"
        class="h-20 w-20 text-rubric opacity-80"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M50 20c-15 0-22 10-22 22 0 10 5 15 5 15l-5 25h44l-5-25s5-5 5-15c0-12-7-22-22-22z"
        />
      </svg>
      <div
        class="absolute inset-0 bg-gradient-to-t from-papyrus via-transparent to-transparent opacity-60"
      ></div>
    </div>

    <div>
      <div class="mb-2 font-cinzel text-xs font-bold tracking-[4px] text-rubric">
        LIBER {currentCaesar.n}
      </div>
      <h2 class="mb-3 font-cinzel text-3xl font-bold uppercase leading-none text-ink md:text-5xl">
        {currentCaesar.name}
      </h2>
      <div class="mb-4 font-cinzel text-sm uppercase italic tracking-wider text-ink/60">
        {currentCaesar.latin} · {currentCaesar.dates}
      </div>
      <p class="text-lg italic leading-relaxed text-ink/90">
        "{currentCaesar.tag}"
      </p>
    </div>
  </div>
</div>

<!-- Paginae Chapters -->
<div class="space-y-24">
  {#each caesarData.sections as section}
    <section class="chapter-content">
      <div class="mb-8 flex items-center gap-4">
        <span class="h-px flex-1 bg-rubric/10"></span>
        <h3
          class="whitespace-nowrap font-cinzel text-xs font-bold uppercase tracking-[5px] text-rubric"
        >
          {section.heading}
        </h3>
        <span class="h-px flex-1 bg-rubric/10"></span>
      </div>

      {#if currentLang === 'both'}
        <!-- Side-by-Side Aligned Paginae -->
        <div class="grid grid-cols-1 gap-12 md:grid-cols-2 lg:gap-20">
          <div>
            <div
              class="mb-4 text-center font-cinzel text-[10px] font-bold uppercase tracking-[3px] text-rubric/40"
            >
              English · Rolfe
            </div>
            <div class="text-lg leading-loose text-ink/90">
              {@html formatText(section.en)}
            </div>
          </div>
          <div class="rounded-sm border-l border-rubric/10 bg-black/[0.02] p-6">
            <div
              class="mb-4 text-center font-cinzel text-[10px] font-bold uppercase tracking-[3px] text-rubric/40"
            >
              Latin · Vulgata
            </div>
            <div class="text-lg italic leading-loose text-ink/70">
              {@html formatText(section.la)}
            </div>
          </div>
        </div>
      {:else}
        <!-- Single Language View (The classic Scroll aesthetic) -->
        <div class="mx-auto max-w-2xl text-lg leading-loose text-ink/95">
          {@html formatText(currentLang === 'en' ? section.en : section.la)}
        </div>
        {#if currentLang === 'la'}
          <div class="mt-4 text-center">
            <span class="font-cinzel text-[9px] uppercase italic tracking-widest text-rubric/30"
              >Latin Edition</span
            >
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
