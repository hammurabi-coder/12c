<script>
  import { base } from '$app/paths';
  import { caesars } from '$lib/data/caesars';
  import { getBustUrl } from '$lib/utils/paths';
  import Header from '$lib/components/Header.svelte';
</script>

<svelte:head>
  <title>The Twelve Caesars — Digital Edition</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-tyrian font-marcellus text-ink">
  <Header />

  <main class="flex flex-1 justify-center px-4 py-12 md:px-0">
    <div class="volumen-container max-w-6xl items-center px-8 py-16 md:px-16">
      <div class="mb-16 text-center">
        <div class="imperial-label mb-4">DE VITA CAESARUM</div>
        <h2 class="imperial-rubric mb-6 text-4xl md:text-6xl">The Twelve Caesars</h2>
        <p class="mx-auto max-w-2xl text-lg italic leading-relaxed text-ink/80">
          "For my part, I think that the most beautiful thing in the world is the history of Rome."
          <span class="mt-2 block text-sm uppercase not-italic tracking-widest text-rubric/60"
            >— C. Suetonius Tranquillus</span
          >
        </p>
      </div>

      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {#each caesars as caesar, i}
          <div style="animation-delay: {100 + i * 50}ms" class="fade-in-up">
            <a
              href="{base}/{caesar.slug}"
              class="group flex flex-col items-center rounded-sm border border-papyrus-dark/40 bg-white/50 p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl"
            >
              <div
                class="relative mb-4 h-32 w-32 overflow-hidden rounded-full border-2 border-rubric/20 bg-rubric/5 shadow-inner"
              >
                <img
                  src={getBustUrl(caesar.name)}
                  alt="Bust of {caesar.name}"
                  class="h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-110 group-hover:grayscale-0"
                />
              </div>

              <div class="imperial-numeral mb-1 text-rubric/40">{caesar.n}</div>
              <h3 class="imperial-rubric mb-1 text-xl">{caesar.name}</h3>
              <div class="mb-3 text-[10px] uppercase tracking-widest text-ink/40">
                {caesar.dates}
              </div>

              <p class="line-clamp-3 text-center text-xs italic leading-relaxed text-ink/60">
                "{caesar.tag}"
              </p>
            </a>
          </div>
        {/each}
      </div>

      <div class="mt-20 border-t border-rubric/10 pt-8 text-center">
        <div class="imperial-label text-[10px]">S.P.Q.R. Digital Edition · MMXXVI</div>
      </div>
    </div>
  </main>
</div>

<style>
  :global(.line-clamp-3) {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .fade-in-up {
    opacity: 0;
    animation: fadeInUp 0.8s ease-out forwards;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
