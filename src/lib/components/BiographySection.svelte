<script>
  import { pretextMeasure } from '$lib/utils/pretext-measure';

  /** @type {{ section: any, currentLang: string }} */
  let { section, currentLang } = $props();

  let enHeight = $state(0);
  let laHeight = $state(0);
  let enReady = $state(false);
  let laReady = $state(false);

  // Both columns get the taller of the two heights
  let colHeight = $derived(Math.max(enHeight, laHeight));
  let bothReady = $derived(enReady && laReady);

  /** @param {CustomEvent} e */
  function handleEnHeight(e) {
    enHeight = e.detail.totalHeight;
    enReady = true;
  }

  /** @param {CustomEvent} e */
  function handleLaHeight(e) {
    laHeight = e.detail.totalHeight;
    laReady = true;
  }
</script>

<section
  id={section.id}
  class="chapter-content scroll-mt-52 rounded-sm border border-rubric/10 bg-white/35 px-5 py-8 shadow-[0_24px_80px_rgba(44,39,33,0.07)] md:px-8 md:py-10"
>
  <div class="mb-8 flex flex-col gap-4 border-b border-rubric/10 pb-5">
    <div class="flex items-center justify-between gap-4">
      <h3 class="imperial-rubric text-xl md:text-2xl">{section.heading}</h3>
      <a href="#reader-top" class="reader-link px-3" aria-label="Back to top" title="Back to top">
        <span aria-hidden="true">↑</span>
      </a>
    </div>
  </div>

  {#if currentLang === 'both'}
    <!-- EN + LAT side-by-side, equalized once both columns are measured -->
    <div class="grid gap-6 lg:grid-cols-2 lg:gap-8 items-start">
      <article
        class="reader-panel px-5 py-5 md:px-7"
        style={bothReady ? `min-height: ${colHeight}px` : ''}
        use:pretextMeasure={{ lang: 'en' }}
        on:pretext-height-en={handleEnHeight}
      >
        <div class="imperial-label mb-4 text-rubric/50">English · Rolfe</div>
        <div class="reader-prose text-ink/92">
          {#each section.enParagraphs as paragraph}
            <p>{@html paragraph}</p>
          {/each}
        </div>
      </article>

      <article
        class="reader-panel border-rubric/8 bg-black/[0.025] px-5 py-5 md:px-7"
        style={bothReady ? `min-height: ${colHeight}px` : ''}
        use:pretextMeasure={{ lang: 'la' }}
        on:pretext-height-la={handleLaHeight}
      >
        <div class="imperial-label mb-4 text-rubric/55">Latin</div>
        <div class="reader-prose text-ink/78 italic">
          {#each section.laParagraphs as paragraph}
            <p>{@html paragraph}</p>
          {/each}
        </div>
      </article>
    </div>
  {:else}
    <!-- Single-column: EN or LAT -->
    <article
      class="reader-panel mx-auto max-w-3xl px-5 py-6 md:px-8 md:py-8"
      use:pretextMeasure={{ lang: currentLang }}
      on:pretext-height-en={handleEnHeight}
    >
      <div class="reader-prose {currentLang === 'la' ? 'italic text-ink/80' : 'text-ink/94'}">
        {#each currentLang === 'en' ? section.enParagraphs : section.laParagraphs as paragraph}
          <p>{@html paragraph}</p>
        {/each}
      </div>
    </article>
  {/if}
</section>

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
