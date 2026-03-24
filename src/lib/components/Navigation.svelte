<script>
  let { caesars = [], currentCaesarIndex = 0, onSelect = () => {} } = $props();
</script>

<nav class="sticky top-0 z-50 border-b border-papyrus-dark bg-[#1a1208] pt-1 shadow-2xl">
  <!-- Italy Background Panorama -->
  <div
    class="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-10"
  >
    <!-- Simplified SVG of Italy -->
    <svg
      viewBox="0 0 500 600"
      class="h-[150%] w-auto translate-x-1/4 rotate-[15deg]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#C9A84C"
        d="M217 48c-4 13-11 25-18 36s-12 25-16 38-8 25-10 39-2 29-2 44v44l-4 44-7 44-11 43-15 41-17 39-18 35-18 30-17 25-14 18-11 10-7 2H54l-5-5-2-10 2-10 6-7 8-3 9-2h9l9 3 8 7 6 10 3 13 1 14v14l-1 14-3 13-6 11-8 8-10 5-11 2h-11l-10-3-9-7-6-11-3-14v-14l3-14 6-12 9-9 10-5 12-1h11l10 4 8 8 6 12 3 14v15l-3 14-6 13-9 10-10 5-12 1h-11l-10-5-8-9-6-13-3-15v-15l3-15 6-13 9-10 10-6 12-1h11l11 6 9 10 7 14 3 15v15l-3 15-7 14-9 11-11 6h-11l-11-7-9-10-7-14-3-16v-15l3-16 7-14 9-11 11-6h11l11 7 9 11 7 15 3 16v16l-3 16-7 15-9 11-11 7h-11l-12-8-9-11-7-15-3-17v-16l3-17 7-16 10-11 12-7h11z"
      />
    </svg>
  </div>

  <div class="scrollbar-hide relative flex h-[100px] gap-2 overflow-x-auto px-4">
    {#each caesars as caesar, i}
      <button
        onclick={() => onSelect(i)}
        aria-current={currentCaesarIndex === i ? 'page' : undefined}
        aria-label="View biography of {caesar.name}"
        class="group relative flex h-[88px] w-[76px] flex-shrink-0 flex-col items-center justify-end rounded-b-lg border-x border-b border-papyrus-dark bg-papyrus/95 shadow-lg transition-all duration-300 hover:h-[94px] hover:bg-white
          {currentCaesarIndex === i ? 'h-[96px] border-rubric/40 bg-white' : ''}"
      >
        <!-- Caesar Statue Silhouette -->
        <div
          class="absolute top-1 flex flex-col items-center opacity-40 transition-all duration-300 group-hover:opacity-100 {currentCaesarIndex ===
          i
            ? '-translate-y-1 scale-110 opacity-100'
            : ''}"
        >
          <svg viewBox="0 0 100 120" class="h-10 w-auto" xmlns="http://www.w3.org/2000/svg">
            <path
              fill={currentCaesarIndex === i ? '#8B3A3A' : '#2C2721'}
              d="M50 5c-12 0-20 8-20 20s5 15 5 15l-3 10-5 35h46l-5-35-3-10s5-3 5-15-8-20-20-20z"
            />
          </svg>
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
            {caesar.name.split(' ')[0]}
          </span>
        </div>
      </button>
    {/each}
  </div>
</nav>
