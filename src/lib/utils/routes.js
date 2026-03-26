import { base } from '$app/paths';

/**
 * @param {string} slug
 * @returns {string}
 */
export function getCaesarHref(slug) {
  return `${base}/${slug}/`;
}

/**
 * @returns {string}
 */
export function getLibraryHref() {
  return `${base}/`;
}
