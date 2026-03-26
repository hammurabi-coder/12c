<script>
  import { getCaesarHref, getLibraryHref } from '$lib/utils/routes';

  /** @type {{ prevCaesar: import('$lib/types').Caesar | null, nextCaesar: import('$lib/types').Caesar | null }} */
  let { prevCaesar = null, nextCaesar = null } = $props();
</script>

<footer
  class="mt-auto border-t border-papyrus-dark/40 bg-gradient-to-b from-papyrus-dark/5 to-rubric/[0.04] px-6 py-12 md:px-10"
>
  <div class="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.4fr_1fr_1.4fr]">
    <div class="reader-panel px-5 py-5 text-center lg:text-left">
      <div class="imperial-label mb-3">Continue Reading</div>
      <div class="flex flex-wrap justify-center gap-3 lg:justify-start">
        <a href={getLibraryHref()} class="reader-link">Return to Library</a>
        <a href="#reader-top" class="reader-link">Back to Top</a>
      </div>
      <p class="mt-4 text-sm leading-relaxed text-ink/65">
        Move between emperors directly or return to the index without losing the current route shape
        used by the static deploy.
      </p>
    </div>

    <div class="reader-panel px-5 py-5 text-center">
      <div class="imperial-label mb-3">Colophon</div>
      <p class="text-xs leading-relaxed text-ink/50">
        Digitally transcribed for the modern era. Text source: Loeb Classical Library, 1913.
        Designed for static delivery and long-form reading.
      </p>
    </div>

    <div class="reader-panel px-5 py-5 text-center lg:text-right">
      <div class="imperial-label mb-3 text-rubric/50">Imperial Sequence</div>
      <div class="flex flex-wrap justify-center gap-3 lg:justify-end">
        {#if prevCaesar}
          <a href={getCaesarHref(prevCaesar.slug)} class="reader-link">
            <span aria-hidden="true">←</span>
            <span>{prevCaesar.name}</span>
          </a>
        {/if}
        {#if nextCaesar}
          <a href={getCaesarHref(nextCaesar.slug)} class="reader-link">
            <span>{nextCaesar.name}</span>
            <span aria-hidden="true">→</span>
          </a>
        {/if}
      </div>
    </div>
  </div>
</footer>
