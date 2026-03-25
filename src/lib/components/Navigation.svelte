<script>
  import { base } from '$app/paths';
  import { getBustUrl } from '$lib/utils/paths';

  /** @type {{ caesars: import('$lib/types').Caesar[], currentCaesarIndex: number }} */
  let { caesars, currentCaesarIndex = 0 } = $props();
</script>

<nav class="sticky top-0 z-50 border-b border-papyrus-dark bg-obsidian pt-1 shadow-2xl">
  <div class="scrollbar-hide relative flex h-[100px] gap-2 overflow-x-auto px-4">
    {#each caesars as caesar, i}
      <a
        href="{base}/{caesar.slug}"
        aria-current={currentCaesarIndex === i ? 'page' : undefined}
        aria-label="View biography of {caesar.name}"
        class="group relative flex h-[88px] w-[76px] flex-shrink-0 flex-col items-center justify-end rounded-b-lg border-x border-b border-papyrus-dark bg-papyrus/95 shadow-lg transition-all duration-300 hover:h-[94px] hover:bg-white
          {currentCaesarIndex === i ? 'h-[96px] border-rubric/40 bg-white' : ''}"
      >
        <!-- Caesar Statue Silhouette -->
        <div
          class="absolute top-1 flex flex-col items-center opacity-70 transition-all duration-300 group-hover:scale-110 group-hover:opacity-100 {currentCaesarIndex ===
          i
            ? '-translate-y-1 scale-110 opacity-100 shadow-md'
            : ''}"
        >
          <img
            src={getBustUrl(caesar.name)}
            alt="Bust of {caesar.name}"
            width="48"
            height="48"
            loading="lazy"
            decoding="async"
            class="h-12 w-12 rounded-full border border-rubric/20 object-cover grayscale transition-all duration-300 group-hover:grayscale-0 {currentCaesarIndex ===
            i
              ? 'grayscale-0'
              : ''}"
          />
        </div>

        <div class="z-10 flex flex-col items-center pb-2">
          <span
            class="imperial-numeral mb-1 text-[10px] {currentCaesarIndex === i
              ? 'text-rubric'
              : 'text-ink/60'}"
          >
            {caesar.n}
          </span>
          <span
            class="imperial-label w-full truncate px-1 text-center text-[8px] leading-none text-ink/80"
          >
            {caesar.name}
          </span>
        </div>
      </a>
    {/each}
  </div>
</nav>
