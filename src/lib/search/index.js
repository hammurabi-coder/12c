import { caesars } from '$lib/data/caesars';
import { loadBiography } from '$lib/content/biographies';

/**
 * @typedef {{
 *   caesar: string,
 *   slug: string,
 *   heading: string,
 *   text: string,
 *   lang: 'English' | 'Latin'
 * }} SearchEntry
 */

/**
 * @param {typeof fetch} fetcher
 * @returns {Promise<SearchEntry[]>}
 */
export async function buildSearchIndex(fetcher) {
  const biographies = await Promise.all(
    caesars.map(async (caesar) => {
      const data = await loadBiography(fetcher, caesar.slug);

      return data.sections.flatMap((section) => [
        {
          caesar: caesar.name,
          slug: caesar.slug,
          heading: section.heading,
          text: section.en,
          lang: 'English'
        },
        {
          caesar: caesar.name,
          slug: caesar.slug,
          heading: section.heading,
          text: section.la,
          lang: 'Latin'
        }
      ]);
    })
  );

  return biographies.flat();
}

/**
 * @param {SearchEntry[]} entries
 * @param {string} query
 * @returns {SearchEntry[]}
 */
export function filterSearchResults(entries, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length < 2) return [];

  return entries.filter(
    (item) =>
      item.text.toLowerCase().includes(normalizedQuery) ||
      item.heading.toLowerCase().includes(normalizedQuery)
  );
}

/**
 * @param {SearchEntry[]} results
 * @returns {Record<string, SearchEntry[]>}
 */
export function groupSearchResultsByCaesar(results) {
  return results.reduce((acc, curr) => {
    if (!acc[curr.caesar]) acc[curr.caesar] = [];
    acc[curr.caesar].push(curr);
    return acc;
  }, {});
}

/**
 * @param {string} text
 * @param {string} query
 * @returns {string}
 */
export function getSearchExcerpt(text, query) {
  const matchIndex = text.toLowerCase().indexOf(query.toLowerCase());
  if (matchIndex === -1) return text.slice(0, 100) + '...';

  const start = Math.max(0, matchIndex - 40);
  const end = Math.min(text.length, matchIndex + 60);
  let excerpt = text.slice(start, end);

  if (start > 0) excerpt = '...' + excerpt;
  if (end < text.length) excerpt = excerpt + '...';

  return excerpt;
}
