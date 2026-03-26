<script>
  import { getBustUrl } from '$lib/utils/paths';
  import { buildSectionMeta } from '$lib/utils/sections';

  /** @type {{ currentCaesar: import('$lib/types').Caesar, caesarData: import('$lib/types').Biography | null, currentLang: string }} */
  let { currentCaesar, caesarData = null, currentLang = $bindable('en') } = $props();

  function getParagraphs(text) {
    if (!text || !text.trim()) return [];
    return text.split('\n\n');
  }

  function setLanguage(mode) {
    currentLang = mode;
  }

  const bustSrc = $derived(getBustUrl(currentCaesar.name));
  const sectionMeta = $derived(caesarData ? buildSectionMeta(caesarData.sections) : []);
</script>

<div class="mx-auto mb-12 max-w-5xl pt-8">
  <div class="reader-panel overflow-hidden">
    <div
      class="relative bg-gradient-to-br from-rubric/[0.08] via-transparent to-gold/10 px-6 py-8 md:px-10"
    >
      <div
        class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rubric/30 to-transparent"
      ></div>

      <div class="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
        <div
          class="group relative mx-auto flex h-48 w-48 items-center justify-center overflow-hidden rounded-sm border border-rubric/20 bg-rubric/5 shadow-xl"
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
            class="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-60"
          ></div>
        </div>

        <div class="text-center lg:text-left">
          <div class="imperial-label mb-2 text-rubric">LIBER {currentCaesar.n}</div>
          <h2 class="imperial-rubric mb-3 text-4xl leading-none md:text-6xl">
            {currentCaesar.name}
          </h2>
          <div class="imperial-label mb-3 lowercase italic tracking-wider text-ink/60">
            {currentCaesar.latin} · {currentCaesar.dates}
          </div>
          <p class="mx-auto max-w-3xl text-lg italic leading-relaxed text-ink/90 lg:mx-0">
            "{currentCaesar.tag}"
          </p>

          <div class="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <div
              class="flex flex-wrap rounded-full border border-papyrus-dark/40 bg-papyrus-dark/20 p-1"
            >
              {#each ['en', 'la', 'both'] as mode}
                <button
                  onclick={() => setLanguage(mode)}
                  class="imperial-label rounded-full px-4 py-2 text-[11px] transition-all {currentLang ===
                  mode
                    ? 'bg-papyrus text-rubric shadow-sm'
                    : 'text-ink/55 hover:text-ink'}"
                  aria-label="Switch to {mode === 'both'
                    ? 'Bilingual'
                    : mode === 'en'
                      ? 'English'
                      : 'Latin'} view"
                >
                  {mode === 'both' ? 'Bilingual' : mode === 'en' ? 'English' : 'Latin'}
                </button>
              {/each}
            </div>
            <a
              href={currentCaesar.wikipedia}
              target="_blank"
              rel="noopener noreferrer"
              class="reader-link"
            >
              <span>Wikipedia</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

{#if sectionMeta.length}
  <div class="space-y-16 pb-8">
    {#each sectionMeta as section}
      <section
        id={section.id}
        class="chapter-content scroll-mt-52 rounded-sm border border-rubric/10 bg-white/35 px-5 py-8 shadow-[0_24px_80px_rgba(44,39,33,0.07)] md:px-8 md:py-10"
      >
        <div class="mb-8 flex flex-col gap-4 border-b border-rubric/10 pb-5">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-4">
              <span class="imperial-numeral text-2xl text-rubric/35">
                {String(section.index + 1).padStart(2, '0')}
              </span>
              <div>
                <div class="imperial-label mb-1">Section</div>
                <h3 class="imperial-rubric text-xl md:text-2xl">{section.heading}</h3>
              </div>
            </div>

            <a href="#reader-top" class="reader-link">Top</a>
          </div>

          {#if currentLang === 'both'}
            <div
              class="grid gap-3 text-center text-xs uppercase tracking-[0.25em] text-rubric/55 lg:grid-cols-2"
            >
              <div class="rounded-full border border-rubric/10 bg-rubric/[0.04] px-4 py-2">
                English
              </div>
              <div class="rounded-full border border-rubric/10 bg-black/[0.03] px-4 py-2">
                Latin
              </div>
            </div>
          {/if}
        </div>

        {#if currentLang === 'both'}
          <div class="grid gap-6 lg:grid-cols-2 lg:gap-8">
            <article class="reader-panel px-5 py-5 md:px-7">
              <div class="imperial-label mb-4 text-rubric/60">English · Rolfe</div>
              <div class="reader-prose text-ink/92">
                {#each getParagraphs(section.en) as paragraph}
                  <p>{paragraph}</p>
                {/each}
              </div>
            </article>

            <article class="reader-panel border-rubric/8 bg-black/[0.025] px-5 py-5 md:px-7">
              <div class="imperial-label mb-4 text-rubric/55">Latin · Vulgata</div>
              <div class="reader-prose text-ink/78 italic">
                {#each getParagraphs(section.la) as paragraph}
                  <p>{paragraph}</p>
                {/each}
              </div>
            </article>
          </div>
        {:else}
          <article class="reader-panel mx-auto max-w-3xl px-5 py-6 md:px-8 md:py-8">
            <div class="reader-prose {currentLang === 'la' ? 'italic text-ink/80' : 'text-ink/94'}">
              {#each getParagraphs(currentLang === 'en' ? section.en : section.la) as paragraph}
                <p>{paragraph}</p>
              {/each}
            </div>

            {#if currentLang === 'la'}
              <div class="mt-6 text-center">
                <span class="imperial-label italic text-rubric/35">Latin Edition</span>
              </div>
            {/if}
          </article>
        {/if}
      </section>
    {/each}
  </div>
{/if}

<style>
  .chapter-content {
    break-inside: avoid-column;
  }

  .reader-prose {
    font-size: clamp(1.05rem, 1rem + 0.2vw, 1.14rem);
    line-height: 1.95;
  }

  .reader-prose p + p {
    margin-top: 1.15rem;
  }

  .reader-prose p {
    text-align: justify;
    text-indent: 1.9rem;
  }

  .reader-prose p:first-child {
    text-indent: 0;
  }
</style>
