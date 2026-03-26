import { caesars } from '$lib/data/caesars';
import { loadBiography } from '$lib/content/biographies';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').EntryGenerator} */
export function entries() {
  return caesars.map((c) => ({ slug: c.slug }));
}

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params }) {
  const { slug } = params;

  // Validate the slug
  if (!caesars.find((c) => c.slug === slug)) {
    throw error(404, 'Caesar not found');
  }

  const caesarData = await loadBiography(fetch, slug);

  return {
    caesarData,
    slug
  };
}
