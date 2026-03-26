import { caesars } from '$lib/data/caesars';
import { getCaesarContext } from '$lib/data/caesar-context';
import { loadBiography } from '$lib/content/biographies';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').EntryGenerator} */
export function entries() {
  return caesars.map((c) => ({ slug: c.slug }));
}

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params }) {
  const { slug } = params;
  const context = getCaesarContext(slug);

  if (!context.currentCaesar) {
    throw error(404, 'Caesar not found');
  }

  const caesarData = await loadBiography(fetch, slug);

  return {
    caesarData,
    currentCaesar: context.currentCaesar,
    currentCaesarIndex: context.currentCaesarIndex,
    nextCaesar: context.nextCaesar,
    prevCaesar: context.prevCaesar,
    navigationItems: caesars.map((caesar) => ({
      caesar,
      isCurrent: caesar.slug === slug
    })),
    slug
  };
}
