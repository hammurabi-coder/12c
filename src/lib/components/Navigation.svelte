<script>
  export let caesars = [];
  export let currentCaesarIndex = 0;
  export let onSelect = () => {};
</script>

<nav
  class="scrollbar-hide sticky top-0 z-50 overflow-x-auto border-b border-papyrus-dark bg-[#1a1208] px-4 pt-1"
>
  <div class="flex h-[72px] min-w-[900px] items-start gap-2">
    {#each caesars as caesar, i}
      <button
        on:click={() => onSelect(i)}
        class="flex h-[58px] w-[72px] flex-shrink-0 flex-col items-center justify-center rounded-b-lg border-x border-b border-papyrus-dark bg-papyrus shadow-sm transition-all duration-200
          {currentCaesarIndex === i
          ? 'h-[64px] border-rubric/40 bg-white shadow-md'
          : 'hover:h-[62px] hover:bg-[#FAF8F5]'}"
      >
        <span
          class="mb-1 font-cinzel text-[10px] font-bold leading-none tracking-tighter {currentCaesarIndex ===
          i
            ? 'text-rubric'
            : 'text-ink/60'}"
        >
          {caesar.n}
        </span>
        <span
          class="w-full truncate px-1 text-center font-cinzel text-[8px] uppercase leading-none tracking-[1px] text-ink/80"
        >
          {caesar.name.split(' ')[0]}
        </span>
      </button>
    {/each}
  </div>
</nav>

<style>
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
