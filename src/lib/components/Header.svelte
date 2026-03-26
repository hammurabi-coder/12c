<script>
  import Search from './Search.svelte';
  let searchOpen = $state(false);
</script>

<Search bind:isOpen={searchOpen} />

<header
  class="relative border-b border-papyrus-dark/40 bg-papyrus px-8 pb-4 pt-6 text-center shadow-md"
>
  <h1 class="imperial-rubric mb-2 text-3xl md:text-5xl">The Twelve Caesars</h1>
  <div class="font-marcellus text-sm italic text-ink/60">
    <div>Suetonius · c. AD 121</div>
    <div>De Vita Caesarum · Lives of the Emperors of Rome</div>
  </div>

  <!-- Global Search Trigger -->
  <div class="absolute right-4 top-1/2 -translate-y-1/2">
    <button
      onclick={() => (searchOpen = true)}
      class="flex h-10 w-10 items-center justify-center rounded-sm border border-papyrus-dark/40 bg-papyrus-dark/5 text-rubric/60 transition-all hover:bg-rubric hover:text-papyrus hover:shadow-md"
      aria-label="Search"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg
      >
    </button>
  </div>
</header>
