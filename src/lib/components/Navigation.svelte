<script>
  import BustPortrait from '$lib/components/BustPortrait.svelte';
  import { getCaesarHref } from '$lib/utils/routes';

  /** @type {{ items: import('$lib/types').CaesarNavigationItem[] }} */
  let { items = [] } = $props();

  /** @type {HTMLDivElement | null} */
  let scrollContainer = $state(null);

  // Auto-scroll to keep the active caesar visible when navigating
  $effect(() => {
    if (!scrollContainer) return;
    const activeLink = scrollContainer.querySelector('[aria-current="page"]');
    if (activeLink) {
      activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  });
</script>

<nav class="sticky top-0 z-50 border-b border-papyrus-dark bg-tyrian pt-1 shadow-2xl">
  <div
    bind:this={scrollContainer}
    class="scrollbar-hide relative flex h-[100px] gap-2 overflow-x-auto px-4"
  >
    {#each items as item}
      <a
        href={getCaesarHref(item.caesar.slug)}
        aria-current={item.isCurrent ? 'page' : undefined}
        aria-label="View biography of {item.caesar.name}"
        class="group relative flex h-[88px] w-[76px] flex-shrink-0 flex-col items-center justify-end rounded-b-lg border-x border-b border-papyrus-dark bg-papyrus/95 shadow-lg transition-all duration-300 hover:h-[94px] hover:bg-white
          {item.isCurrent ? 'h-[96px] border-rubric/40 bg-white' : ''}"
      >
        <div
          class="absolute top-1 flex flex-col items-center opacity-70 transition-all duration-300 group-hover:scale-110 group-hover:opacity-100 {item.isCurrent
            ? '-translate-y-1 scale-110 opacity-100 shadow-md'
            : ''}"
        >
          <BustPortrait
            caesar={item.caesar}
            alt="Bust of {item.caesar.name}"
            frameClass="h-12 w-12 rounded-full border border-rubric/20"
            imageClass="grayscale transition-all duration-300 group-hover:grayscale-0 {item.isCurrent
              ? 'grayscale-0'
              : ''}"
          />
        </div>

        <div class="z-10 flex flex-col items-center pb-2">
          <span
            class="imperial-numeral mb-1 text-[10px] {item.isCurrent
              ? 'text-rubric'
              : 'text-ink/60'}"
          >
            {item.caesar.n}
          </span>
          <span
            class="imperial-label w-full truncate px-1 text-center text-[8px] leading-none text-ink/80"
          >
            {item.caesar.name}
          </span>
        </div>
      </a>
    {/each}
  </div>
</nav>
