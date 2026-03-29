<script>
  import { buildSectionMeta } from '$lib/utils/sections';
  import { applyWikiLinks } from '$lib/utils/biography-text';
  import BiographyHeader from './BiographyHeader.svelte';
  import BiographySection from './BiographySection.svelte';

  /** @type {{ currentCaesar: import('$lib/types').Caesar, caesarData: import('$lib/types').Biography | null, currentLang: string }} */
  let { currentCaesar, caesarData = null, currentLang = $bindable('en') } = $props();

  let wikiLinksEnabled = $state(true);



  const sectionMeta = $derived.by(() => {
    if (!caesarData) return [];

    return buildSectionMeta(caesarData.sections).map((section) => ({
      ...section,
      enParagraphs: section.enParagraphs.map((p) =>
        applyWikiLinks(p, section.wikiLinks, { enabled: wikiLinksEnabled })
      ),
      laParagraphs: section.laParagraphs.map((p) =>
        applyWikiLinks(p, section.wikiLinks, { enabled: wikiLinksEnabled })
      )
    }));
  });
</script>

<BiographyHeader {currentCaesar} bind:currentLang bind:wikiLinksEnabled />

{#if sectionMeta.length}
  <div class="space-y-16 pb-8">
    {#each sectionMeta as section}
      <BiographySection {section} {currentLang} />
    {/each}
  </div>
{/if}
