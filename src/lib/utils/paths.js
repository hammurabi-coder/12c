import { base } from '$app/paths';

/**
 * Gets the URL for a Caesar's bust image.
 * @param {string} name - The uppercase name of the Caesar (e.g., 'JULIUS').
 * @returns {string} The full path to the bust image.
 */
export function getBustUrl(name) {
  if (!name) return '';
  return `${base}/content/busts/${name.toUpperCase()}.png`;
}
