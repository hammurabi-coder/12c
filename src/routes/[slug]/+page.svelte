<script>
  import { fly, fade } from 'svelte/transition';

  import Navigation from '$lib/components/Navigation.svelte';
  import Header from '$lib/components/Header.svelte';
  import Biography from '$lib/components/Biography.svelte';
  import Footer from '$lib/components/Footer.svelte';

  /** @type {{ data: import('./$types').PageData }} */
  let { data } = $props();

  let currentLang = $state('en'); // 'en', 'la', 'both'
</script>

<svelte:head>
  <title>{data.currentCaesar.name} - The Twelve Caesars</title>
  <meta name="description" content={data.currentCaesar.tag} />
</svelte:head>

<div class="flex min-h-screen flex-col bg-tyrian font-marcellus text-ink">
  <!-- Header at the VERY top -->
  <div class="border-b border-papyrus-dark/20 bg-obsidian">
    <Header />
  </div>

  <Navigation items={data.navigationItems} />

  <div class="flex w-full flex-1 justify-center px-4 md:px-0">
    <div class="volumen-container">
      <main id="reader-top" class="relative flex-1 px-4 pb-24 md:px-10 lg:px-16">
        {#if data.caesarData}
          {#key data.slug}
            <div in:fly={{ y: 20, duration: 800, delay: 200 }} out:fade={{ duration: 200 }}>
              <Biography
                currentCaesar={data.currentCaesar}
                caesarData={data.caesarData}
                bind:currentLang
              />
            </div>
          {/key}
        {/if}
      </main>

      <Footer prevCaesar={data.prevCaesar} nextCaesar={data.nextCaesar} />
    </div>
  </div>
</div>
