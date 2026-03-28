/**
 * Validates that a URL is a safe English Wikipedia article link.
 *
 * This is the single source of truth for URL validation — used by both the
 * SvelteKit runtime (biography-text.js) and the offline tooling scripts
 * (scripts/lib/wiki-link-validation.mjs).
 *
 * @param {string} url
 * @returns {boolean}
 */
export function isSafeWikipediaUrl(url) {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === 'https:' &&
      parsed.hostname === 'en.wikipedia.org' &&
      parsed.pathname.startsWith('/wiki/')
    );
  } catch {
    return false;
  }
}
