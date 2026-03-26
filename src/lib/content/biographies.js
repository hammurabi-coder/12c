import { base } from '$app/paths';
import { error } from '@sveltejs/kit';

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

  return response.json();
}
