<script>
  import { getBustUrl } from '$lib/utils/paths';

  /** @type {{ currentCaesar: import('$lib/types').Caesar, caesarData: import('$lib/types').Biography | null, currentLang: string }} */
  let { currentCaesar, caesarData = null, currentLang = $bindable('en') } = $props();

  function getParagraphs(text) {
    if (!text || !text.trim()) return [];
    return text.split('\n\n');
  }

  // Bust image source
  const bustSrc = $derived(getBustUrl(currentCaesar.name));
</script>

<div class="mx-auto mb-16 max-w-4xl border-b border-rubric/10 pb-12">
  <div class="flex flex-col items-center gap-10 md:flex-row">
    <!-- Imperial Bust -->
    <div
      class="group relative flex h-48 w-48 flex-shrink-0 items-center justify-center overflow-hidden rounded-sm border border-rubric/20 bg-rubric/5 shadow-xl"
    >
      <img
        src={bustSrc}
        alt="Classical bust representing {currentCaesar.name}"
        width="192"
        height="192"
        loading="eager"
        decoding="async"
        class="h-full w-full object-contain grayscale-[0.2] transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0"
      />
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"
      ></div>
    </div>

    <div>
      <div class="imperial-label mb-2 text-rubric">
        LIBER {currentCaesar.n}
      </div>
      <h2 class="imperial-rubric mb-3 text-3xl leading-none md:text-5xl">
        {currentCaesar.name}
      </h2>
      <div class="imperial-label mb-4 lowercase italic tracking-wider text-ink/60">
        {currentCaesar.latin} · {currentCaesar.dates}
      </div>
      <p class="text-lg italic leading-relaxed text-ink/90">
        "{currentCaesar.tag}"
      </p>

      <!-- Wikipedia Link -->
      <div class="mt-4 flex justify-start">
        <a
          href={currentCaesar.wikipedia}
          target="_blank"
          rel="noopener noreferrer"
          class="imperial-label inline-flex items-center gap-2 rounded-sm border border-papyrus-dark/40 bg-papyrus-dark/20 px-5 py-2 text-ink/60 transition-all hover:border-rubric/40 hover:bg-papyrus hover:text-rubric"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.09.682-.218.682-.484 0-.236-.009-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .268.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"
            />
          </svg>
          Wikipedia
        </a>
      </div>

      <!-- Language Toggle -->
      <div class="mt-3 flex justify-center">
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
    </div>
  </div>
</div>

<!-- Paginae Chapters -->
{#if caesarData}
  <div class="space-y-24">
    {#each caesarData.sections as section}
      <section class="chapter-content">
        <div class="mb-8 flex items-center gap-4">
          <span class="h-px flex-1 bg-rubric/10"></span>
          <h3 class="imperial-label whitespace-nowrap text-rubric">
            {section.heading}
          </h3>
          <span class="h-px flex-1 bg-rubric/10"></span>
        </div>

        {#if currentLang === 'both'}
          <!-- Side-by-Side Aligned Paginae -->
          <div class="grid grid-cols-1 gap-12 md:grid-cols-2 lg:gap-20">
            <div>
              <div class="imperial-label mb-4 text-center">English · Rolfe</div>
              <div class="text-lg leading-loose text-ink/90">
                {#each getParagraphs(section.en) as p}
                  <p class="mb-6 text-justify indent-8">{p}</p>
                {/each}
              </div>
            </div>
            <div class="rounded-sm border-l border-rubric/10 bg-black/[0.02] p-6">
              <div class="imperial-label mb-4 text-center">Latin · Vulgata</div>
              <div class="text-lg italic leading-loose text-ink/70">
                {#each getParagraphs(section.la) as p}
                  <p class="mb-6 text-justify indent-8">{p}</p>
                {/each}
              </div>
            </div>
          </div>
        {:else}
          <!-- Single Language View (The classic Scroll aesthetic) -->
          <div class="mx-auto max-w-2xl text-lg leading-loose text-ink/95">
            {#each getParagraphs(currentLang === 'en' ? section.en : section.la) as p}
              <p class="mb-6 text-justify indent-8">{p}</p>
            {/each}
          </div>
          {#if currentLang === 'la'}
            <div class="mt-4 text-center">
              <span class="imperial-label italic text-rubric/30">Latin Edition</span>
            </div>
          {/if}
        {/if}
      </section>
    {/each}
  </div>
{/if}

<style>
  .chapter-content {
    break-inside: avoid-column;
  }
</style>
