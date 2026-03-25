<script>
  import { page } from '$app/state';
  import { base } from '$app/paths';
</script>

<svelte:head>
  <title>{page.status} — The Twelve Caesars</title>
</svelte:head>

<div
  class="flex min-h-screen flex-col items-center justify-center bg-tyrian font-marcellus text-ink"
>
  <div class="volumen-container max-w-2xl items-center justify-center px-8 py-20 text-center">
    <div class="imperial-label mb-6 text-rubric/60">◆</div>

    <h1 class="imperial-rubric mb-4 text-5xl">{page.status}</h1>

    <p class="mb-2 font-cinzel text-xl font-bold uppercase tracking-imperial text-ink/70">
      {page.status === 404 ? 'Non Inventum' : 'Error'}
    </p>

    <p class="mx-auto mb-10 max-w-sm text-base leading-relaxed text-ink/60">
      {page.error?.message ?? 'An unexpected error occurred.'}
    </p>

    <a
      href="{base}/julius"
      class="imperial-label inline-block rounded-sm border border-rubric/30 bg-rubric/5 px-8 py-3 text-rubric/80 transition-all hover:bg-rubric/10 hover:text-rubric"
    >
      ← Return to Julius Caesar
    </a>

    <div class="mt-16 font-cinzel text-[10px] uppercase tracking-imperial-sub text-ink/20">
      S.P.Q.R. Digital Edition
    </div>
  </div>
</div>
