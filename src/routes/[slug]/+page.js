import { caesars } from '$lib/data/caesars';
import { base } from '$app/paths';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params }) {
  const { slug } = params;

  // Validate the slug
  if (!caesars.find((c) => c.slug === slug)) {
    throw error(404, 'Caesar not found');
  }

  const response = await fetch(`${base}/content/${slug}.json`);
  const caesarData = await response.json();

  return {
    caesarData,
    slug
  };
}
