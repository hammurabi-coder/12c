<script>
  export let caesars = [];
  export let currentCaesarIndex = 0;
  export let onSelect = (index) => {};
</script>

<nav class="sticky top-0 z-50 bg-[#1a1208] border-b border-papyrus-dark overflow-x-auto scrollbar-hide pt-1 px-4">
  <div class="flex items-start min-w-[900px] h-[72px] gap-2">
    {#each caesars as caesar, i}
      <button 
        on:click={() => onSelect(i)}
        class="flex-shrink-0 w-[72px] h-[58px] bg-papyrus border-x border-b border-papyrus-dark rounded-b-lg shadow-sm flex flex-col items-center justify-center transition-all duration-200 
          {currentCaesarIndex === i ? 'h-[64px] bg-white shadow-md border-rubric/40' : 'hover:h-[62px] hover:bg-[#FAF8F5]'}"
      >
        <span class="font-cinzel text-[10px] font-bold tracking-tighter leading-none mb-1 {currentCaesarIndex === i ? 'text-rubric' : 'text-ink/60'}">
          {caesar.n}
        </span>
        <span class="font-cinzel text-[8px] tracking-[1px] leading-none uppercase text-ink/80 text-center px-1 truncate w-full">
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
