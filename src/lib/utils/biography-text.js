import { isSafeWikipediaUrl } from './wiki-validation.js';

// Re-export so existing consumers (e.g. unit tests) don't break
export { isSafeWikipediaUrl };

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
 * Apply wiki links to text that has ALREADY been escaped.
 * @param {string} safeText
 * @param {Record<string, string>} [wikiLinks]
 * @param {{ enabled?: boolean }} [options]
 * @returns {string}
 */
export function applyWikiLinks(safeText, wikiLinks = {}, options = {}) {
  if (!safeText) return '';

  const safeEntries = Object.entries(wikiLinks).filter(
    ([entity, url]) => entity?.trim() && isSafeWikipediaUrl(url)
  );

  if (options.enabled === false || safeEntries.length === 0) return safeText;

  // Sort longest first so multi-word entities (e.g. "Julius Caesar") are matched
  // before their shorter substrings (e.g. "Caesar")
  const entities = safeEntries.map(([entity]) => entity).sort((a, b) => b.length - a.length);

  // Track which entities have already been linked in this chapter (per applyWikiLinks call).
  // Each entity only gets linked on its FIRST occurrence across all paragraphs in the chapter.
  const linked = new Set();

  let result = safeText;
  for (const entity of entities) {
    const url = wikiLinks[entity];
    const escaped = escapeHtml(entity).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?!<a[^>]*>)\\b(${escaped})\\b(?!</a>)`, 'g');

    let replaced = false;
    result = result.replace(regex, (match) => {
      if (replaced || linked.has(entity)) return match;
      linked.add(entity);
      replaced = true;
      return `<a href="${url}" class="wiki-link" target="_blank" rel="noopener noreferrer">${match}</a>`;
    });
  }

  return result;
}

/**
 * Legacy wrapper: safely escapes and links text.
 * @param {string | null | undefined} text
 * @param {Record<string, string>} [wikiLinks]
 * @param {{ enabled?: boolean }} [options]
 * @returns {string[]}
 */
export function buildLinkedParagraphs(text, wikiLinks = {}, options = {}) {
  return splitParagraphs(text)
    .map(escapeHtml)
    .map((paragraph) => applyWikiLinks(paragraph, wikiLinks, options));
}
