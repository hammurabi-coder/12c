<script>
  import { getBustUrl } from '$lib/utils/paths';
  import { buildSectionMeta } from '$lib/utils/sections';

  /** @type {{ currentCaesar: import('$lib/types').Caesar, caesarData: import('$lib/types').Biography | null, currentLang: string }} */
  let { currentCaesar, caesarData = null, currentLang = $bindable('en') } = $props();

  let activeSectionId = $state('');
  let initializedFromHash = $state(false);

  function getParagraphs(text) {
    if (!text || !text.trim()) return [];
    return text.split('\n\n');
  }

  function setLanguage(mode) {
    currentLang = mode;
  }

  function jumpToSection(sectionId) {
    activeSectionId = sectionId;

    if (typeof document === 'undefined') return;

    const target = document.getElementById(sectionId);
    if (!target) return;

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (typeof history !== 'undefined') {
      history.replaceState(null, '', `#${sectionId}`);
    }
  }

  function trackSection(node) {
    if (typeof IntersectionObserver === 'undefined') {
      return {
        destroy() {}
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries[0]?.target?.id) {
          activeSectionId = visibleEntries[0].target.id;
        }
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0.2, 0.4, 0.65]
      }
    );

    observer.observe(node);

    return {
      destroy() {
        observer.disconnect();
      }
    };
  }

  const bustSrc = $derived(getBustUrl(currentCaesar.name));
  const sectionMeta = $derived(caesarData ? buildSectionMeta(caesarData.sections) : []);
  const activeSection = $derived(
    sectionMeta.find((section) => section.id === activeSectionId) ?? sectionMeta[0] ?? null
  );
  const activeSectionIndex = $derived(
    activeSection ? sectionMeta.findIndex((section) => section.id === activeSection.id) : -1
  );
  const previousSection = $derived(
    activeSectionIndex > 0 ? sectionMeta[activeSectionIndex - 1] : null
  );
  const nextSection = $derived(
    activeSectionIndex >= 0 && activeSectionIndex < sectionMeta.length - 1
      ? sectionMeta[activeSectionIndex + 1]
      : null
  );

  $effect(() => {
    if (!sectionMeta.length) {
      activeSectionId = '';
      initializedFromHash = false;
      return;
    }

    if (!initializedFromHash && typeof window !== 'undefined' && window.location.hash) {
      const hashSectionId = window.location.hash.slice(1);
      if (sectionMeta.some((section) => section.id === hashSectionId)) {
        activeSectionId = hashSectionId;
        initializedFromHash = true;
        return;
      }
    }

    const hasActiveSection = sectionMeta.some((section) => section.id === activeSectionId);
    if (!hasActiveSection) {
      activeSectionId = sectionMeta[0].id;
    }

    initializedFromHash = true;
  });
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

          <div class="mt-6 grid gap-4 text-sm text-ink/75 md:grid-cols-3">
            <div class="reader-panel px-4 py-3">
              <div class="imperial-label mb-2">Reader Mode</div>
              <p class="leading-relaxed">
                {currentLang === 'both'
                  ? 'Parallel reading with English on the left and Latin on the right.'
                  : currentLang === 'la'
                    ? 'Latin-only reading with the original text emphasized.'
                    : 'English-only reading with a calmer single-column pace.'}
              </p>
            </div>
            <div class="reader-panel px-4 py-3">
              <div class="imperial-label mb-2">Structure</div>
              <p class="leading-relaxed">
                {sectionMeta.length} section{sectionMeta.length === 1 ? '' : 's'} with anchored navigation
                and active reading position.
              </p>
            </div>
            <div class="reader-panel px-4 py-3">
              <div class="imperial-label mb-2">External</div>
              <a
                href={currentCaesar.wikipedia}
                target="_blank"
                rel="noopener noreferrer"
                class="reader-link justify-center lg:justify-start"
              >
                <span>Open Wikipedia</span>
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <div class="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <span class="imperial-label text-rubric/60">Mode</span>
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
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

{#if sectionMeta.length}
  <div class="sticky top-[11.25rem] z-40 mb-10">
    <div class="reader-panel border-rubric/15 bg-papyrus/90 px-4 py-4 shadow-lg backdrop-blur">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div class="imperial-label mb-1">Reading Position</div>
            <div class="text-sm text-ink/70">
              <span class="font-semibold text-ink">{activeSection?.heading ?? 'Overview'}</span>
              {#if activeSection}
                <span class="ml-2 text-ink/45">
                  {activeSection.index + 1} / {sectionMeta.length}
                </span>
              {/if}
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <a href="#reader-top" class="reader-link">Back to top</a>
            {#if previousSection}
              <button class="reader-link" onclick={() => jumpToSection(previousSection.id)}>
                <span aria-hidden="true">←</span>
                <span>{previousSection.heading}</span>
              </button>
            {/if}
            {#if nextSection}
              <button class="reader-link" onclick={() => jumpToSection(nextSection.id)}>
                <span>{nextSection.heading}</span>
                <span aria-hidden="true">→</span>
              </button>
            {/if}
          </div>
        </div>

        <div class="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
          <label class="imperial-label flex items-center gap-3 text-rubric/60">
            <span>Jump to section</span>
            <select
              class="min-w-0 rounded-full border border-rubric/15 bg-white/70 px-4 py-2 text-sm normal-case tracking-normal text-ink outline-none transition-colors focus:border-rubric/40"
              bind:value={activeSectionId}
              onchange={(event) => jumpToSection(event.currentTarget.value)}
              aria-label="Jump to section"
            >
              {#each sectionMeta as section}
                <option value={section.id}>{section.heading}</option>
              {/each}
            </select>
          </label>

          <div class="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
            {#each sectionMeta as section}
              <a
                href={'#' + section.id}
                onclick={(event) => {
                  event.preventDefault();
                  jumpToSection(section.id);
                }}
                class="imperial-label shrink-0 rounded-full border px-4 py-2 text-[11px] transition-all {activeSectionId ===
                section.id
                  ? 'border-rubric/45 bg-rubric text-papyrus shadow-sm'
                  : 'border-rubric/15 bg-white/50 text-ink/60 hover:border-rubric/35 hover:text-rubric'}"
              >
                {section.heading}
              </a>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if sectionMeta.length}
  <div class="space-y-16 pb-8">
    {#each sectionMeta as section}
      <section
        id={section.id}
        use:trackSection
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

        <div
          class="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-rubric/10 pt-5"
        >
          {#if section.index > 0}
            <button
              class="reader-link"
              onclick={() => jumpToSection(sectionMeta[section.index - 1].id)}
            >
              <span aria-hidden="true">←</span>
              <span>{sectionMeta[section.index - 1].heading}</span>
            </button>
          {:else}
            <span class="imperial-label text-rubric/25">Beginning of text</span>
          {/if}

          {#if section.index < sectionMeta.length - 1}
            <button
              class="reader-link"
              onclick={() => jumpToSection(sectionMeta[section.index + 1].id)}
            >
              <span>{sectionMeta[section.index + 1].heading}</span>
              <span aria-hidden="true">→</span>
            </button>
          {:else}
            <span class="imperial-label text-rubric/25">Final section</span>
          {/if}
        </div>
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
