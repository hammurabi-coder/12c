<script>
  import { base } from '$app/paths';
  import { caesars } from '$lib/data/caesars';
  let { currentCaesarIndex } = $props();

  let prevCaesar = $derived(currentCaesarIndex > 0 ? caesars[currentCaesarIndex - 1] : null);
  let nextCaesar = $derived(
    currentCaesarIndex < caesars.length - 1 ? caesars[currentCaesarIndex + 1] : null
  );
</script>

<footer class="mt-auto border-t border-papyrus-dark/40 bg-papyrus-dark/10 p-12">
  <div class="mx-auto flex max-w-4xl flex-col items-center justify-between gap-8 md:flex-row">
    <div class="text-center md:text-left">
      <div class="imperial-label mb-2">Navigation</div>
      <div class="flex gap-6">
        {#if prevCaesar}
          <a href="{base}/{prevCaesar.slug}" class="text-sm transition-colors hover:text-rubric">
            ← {prevCaesar.name}
          </a>
        {/if}
        {#if nextCaesar}
          <a href="{base}/{nextCaesar.slug}" class="text-sm transition-colors hover:text-rubric">
            {nextCaesar.name} →
          </a>
        {/if}
      </div>
    </div>

    <div class="text-center">
      <div class="imperial-label mb-2">Colophon</div>
      <p class="max-w-xs text-[10px] leading-relaxed text-ink/40">
        Digitally transcribed for the modern era. Text source: Loeb Classical Library, 1913. Typeset
        in Cinzel & Marcellus.
      </p>
    </div>

    <div class="text-center md:text-right">
      <div class="imperial-label mb-2 text-rubric/40">XII</div>
      <p class="text-[10px] uppercase tracking-imperial-sub text-ink/60">
        S.P.Q.R. Digital Edition
      </p>
    </div>
  </div>
</footer>
