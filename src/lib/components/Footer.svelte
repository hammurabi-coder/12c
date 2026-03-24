<script>
  let { currentCaesar = {} } = $props();
</script>

<footer
  class="relative overflow-hidden border-t border-papyrus-dark/40 bg-papyrus px-8 py-20 text-center"
>
  <div
    class="pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden opacity-5"
  >
    <span class="font-cinzel text-[20vw] font-bold">SPQR</span>
  </div>
  <span class="mb-6 block select-none font-cinzel text-6xl leading-none text-rubric/10">§</span>
  <p class="mb-2 font-cinzel text-sm uppercase tracking-[4px] text-rubric/40">
    Finis Libri {currentCaesar.n}
  </p>
  <p class="text-xs italic text-ink/30">Digitized Scholarly Edition · Public Domain Texts</p>
</footer>
