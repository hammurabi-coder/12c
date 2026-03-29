<script>
  import BustPortrait from '$lib/components/BustPortrait.svelte';

  /** @type {{ currentCaesar: import('$lib/types').Caesar, currentLang: string, wikiLinksEnabled: boolean }} */
  let { currentCaesar, currentLang = $bindable(), wikiLinksEnabled = $bindable() } = $props();

  function setLanguage(mode) {
    currentLang = mode;
  }
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
          class="group relative mx-auto h-48 w-48 overflow-hidden rounded-sm border border-rubric/20 bg-rubric/5 shadow-xl"
        >
          <BustPortrait
            caesar={currentCaesar}
            alt="Classical bust representing {currentCaesar.name}"
            loading="eager"
            decoding="async"
            frameClass="h-full w-full"
            imageClass="grayscale-[0.2] transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0"
          />
          <div
            class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-60"
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
            <button
              onclick={() => (wikiLinksEnabled = !wikiLinksEnabled)}
              class="imperial-label rounded-full border px-4 py-2 text-[11px] transition-all {wikiLinksEnabled
                ? 'bg-rubric text-papyrus shadow-sm'
                : 'border-papyrus-dark/40 text-ink/55 hover:text-ink'}"
              aria-pressed={wikiLinksEnabled}
              aria-label="Toggle Wikipedia links"
            >
              {wikiLinksEnabled ? 'Links On' : 'Links Off'}
            </button>
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
