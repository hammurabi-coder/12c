import { caesars } from './caesars.js';

/**
 * @param {string} slug
 * @returns {number}
 */
export function getCaesarIndexBySlug(slug) {
  return caesars.findIndex((caesar) => caesar.slug === slug);
}

/**
 * @param {string} slug
 * @returns {{
 *   currentCaesarIndex: number,
 *   currentCaesar: import('$lib/types').Caesar | null,
 *   prevCaesar: import('$lib/types').Caesar | null,
 *   nextCaesar: import('$lib/types').Caesar | null
 * }}
 */
export function getCaesarContext(slug) {
  const currentCaesarIndex = getCaesarIndexBySlug(slug);

  if (currentCaesarIndex === -1) {
    return {
      currentCaesarIndex,
      currentCaesar: null,
      prevCaesar: null,
      nextCaesar: null
    };
  }

  return {
    currentCaesarIndex,
    currentCaesar: caesars[currentCaesarIndex],
    prevCaesar: caesars[currentCaesarIndex - 1] ?? null,
    nextCaesar: caesars[currentCaesarIndex + 1] ?? null
  };
}
