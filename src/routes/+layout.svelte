<script>
  import '../app.css';
  let { children } = $props();
</script>

<a
  href="#reader-top"
  class="sr-only bg-rubric px-4 py-2 text-papyrus shadow-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[1000] focus:rounded focus:outline-none"
>
  Skip to content
</a>

{@render children()}
