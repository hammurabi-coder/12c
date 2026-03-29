import { base } from '$app/paths';
import { error } from '@sveltejs/kit';
import { biographySchema } from '$lib/data/schema';

/**
 * @param {string} slug
 * @returns {string}
 */
export function getBiographyContentUrl(slug) {
  return `${base}/content/${slug}.json`;
}

/**
 * @param {typeof fetch} fetcher
 * @param {string} slug
 */
export async function loadBiography(fetcher, slug) {
  const response = await fetcher(getBiographyContentUrl(slug));

  if (!response.ok) {
    throw error(response.status, `Could not load biography for ${slug}`);
  }

  const raw = await response.json();
  const parsed = biographySchema.safeParse(raw);

  if (!parsed.success) {
    console.error(`Validation failed for ${slug}`, parsed.error);
    throw error(500, `Invalid biography data for ${slug}`);
  }

  return parsed.data;
}
