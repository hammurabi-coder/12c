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
 *
 * Uses a single left-to-right scan of the ORIGINAL text so that character
 * offsets for overlap checks are always stable and correct (no drift from
 * incremental HTML insertion).
 *
 * Each entity name is linked at most once — the first occurrence wins.
 * Longer entity names are matched before shorter ones that are substrings
 * (e.g. "Lucius Sulla" before "Sulla").
 *
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

  // Sort longest first so multi-word entities are matched before substrings.
  const entities = safeEntries
    .map(([entity]) => entity)
    .sort((a, b) => b.length - a.length);

  // Collect all matches: { entity, start, end, url, matchedText }
  const matches = [];
  for (const entity of entities) {
    const url = wikiLinks[entity];
    const escaped = escapeHtml(entity).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b(${escaped})\\b`, 'g');
    let regexMatch;
    while ((regexMatch = regex.exec(safeText)) !== null) {
      matches.push({
        entity,
        start: regexMatch.index,
        end: regexMatch.index + regexMatch[0].length,
        url,
        matchedText: regexMatch[0],
      });
    }
  }

  // Sort by start position. Ties (same start, different lengths) — longer first.
  matches.sort((a, b) => a.start - b.start || b.end - a.end);

  // Single left-to-right scan of original text.
  // linkedEnd tracks the furthest position consumed by a link — any match
  // whose start is strictly before this is inside a link and must be skipped.
  let linkedEnd = 0;
  const linked = new Set();
  let output = '';
  let mi = 0; // match index

  for (let pos = 0; pos < safeText.length; ) {
    // Advance linkedEnd past any matches we've skipped that ended before current pos
    while (linkedEnd > 0 && mi < matches.length && matches[mi].start < linkedEnd) {
      // This match overlaps a previously linked range — skip it
      linked.add(matches[mi].entity); // mark as handled even if not linked
      linkedEnd = Math.max(linkedEnd, matches[mi].end);
      mi++;
    }

    // If the current position is covered by a linked range, skip to its end
    if (pos < linkedEnd) {
      pos = linkedEnd;
      continue;
    }

    // Try to start a new link at current position
    if (mi < matches.length && matches[mi].start === pos) {
      const m = matches[mi];

      // Skip if already linked (first-occurrence wins, so subsequent occurrences
      // with the same start but different length are already handled by sort order)
      if (linked.has(m.entity)) {
        mi++;
        continue;
      }

      // This match starts at exactly pos and pos is not inside an existing link.
      // Safe to link.
      linked.add(m.entity);
      linkedEnd = m.end;
      output += `<a href="${m.url}" class="wiki-link" target="_blank" rel="noopener noreferrer">${m.matchedText}</a>`;
      pos = m.end;
      mi++;
    } else {
      // Plain character
      output += safeText[pos];
      pos++;
    }
  }

  return output;
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
