/**
 * @param {string | null | undefined} text
 * @returns {string[]}
 */
export function splitParagraphs(text) {
  if (!text || !text.trim()) return [];
  return text.split('\n\n');
}

/**
 * @param {string} text
 * @returns {string}
 */
export function escapeHtml(text) {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

/**
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

/**
 * @param {string} text
 * @param {Record<string, string>} [wikiLinks]
 * @param {{ enabled?: boolean }} [options]
 * @returns {string}
 */
export function applyWikiLinks(text, wikiLinks = {}, options = {}) {
  if (!text) return '';

  const safeText = escapeHtml(text);
  const safeEntries = Object.entries(wikiLinks).filter(
    ([entity, url]) => entity?.trim() && isSafeWikipediaUrl(url)
  );

  if (options.enabled === false || safeEntries.length === 0) return safeText;

  const entities = safeEntries.map(([entity]) => entity).sort((a, b) => b.length - a.length);

  let result = safeText;
  for (const entity of entities) {
    const url = wikiLinks[entity];
    const escaped = escapeHtml(entity).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<!<a[^>]*>)\\b(${escaped})\\b(?!</a>)`, 'g');
    result = result.replace(
      regex,
      `<a href="${url}" class="wiki-link" target="_blank" rel="noopener noreferrer">$1</a>`
    );
  }

  return result;
}

/**
 * @param {string | null | undefined} text
 * @param {Record<string, string>} [wikiLinks]
 * @param {{ enabled?: boolean }} [options]
 * @returns {string[]}
 */
export function buildLinkedParagraphs(text, wikiLinks = {}, options = {}) {
  return splitParagraphs(text).map((paragraph) => applyWikiLinks(paragraph, wikiLinks, options));
}
