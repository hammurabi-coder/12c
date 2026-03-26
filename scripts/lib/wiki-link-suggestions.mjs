import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import { CONTENT_DIR, SUGGESTIONS_DIR, WIKIPEDIA_BASE } from './wiki-link-paths.mjs';
import { ENTITY_PATTERNS, EXCLUDE, KNOWN_ARTICLES } from './wiki-link-catalog.mjs';
import { isSafeWikipediaUrl } from './wiki-link-validation.mjs';

export function listBiographySlugs() {
  return readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.replace('.json', ''));
}

export function loadBiography(slug) {
  return JSON.parse(readFileSync(join(CONTENT_DIR, `${slug}.json`), 'utf-8'));
}

export function readSuggestions(slug) {
  return JSON.parse(readFileSync(getSuggestionsPath(slug), 'utf-8'));
}

export function writeSuggestions(slug, suggestions) {
  writeFileSync(getSuggestionsPath(slug), JSON.stringify(suggestions, null, 2));
}

export function writeReview(slug, markdown) {
  writeFileSync(getReviewPath(slug), markdown);
}

export function getSuggestionsPath(slug) {
  return join(SUGGESTIONS_DIR, `${slug}-wikipedia-suggestions.json`);
}

export function getReviewPath(slug) {
  return join(SUGGESTIONS_DIR, `${slug}-wikipedia-review.md`);
}

export function getContext(text, location, radius = 100) {
  const start = Math.max(0, location - radius);
  const end = Math.min(text.length, location + radius);
  let excerpt = text.slice(start, end).replace(/\n/g, ' ').replace(/\s+/g, ' ');
  if (start > 0) excerpt = '...' + excerpt;
  if (end < text.length) excerpt = excerpt + '...';
  return excerpt;
}

export function extractEntities(text) {
  const found = [];

  for (const pattern of ENTITY_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;

    while ((match = regex.exec(text)) !== null) {
      const raw = match[0].trim();
      if (EXCLUDE.has(raw) || raw.length < 3) continue;
      if (!KNOWN_ARTICLES.has(raw)) continue;
      found.push({ name: raw, location: match.index });
    }
  }

  return found.sort((a, b) => a.location - b.location);
}

export function generateSuggestions(caesarData) {
  const chapterMap = new Map();

  for (const section of caesarData.sections) {
    const heading = section.heading;
    const text = section.en;
    const entities = extractEntities(text);

    if (!chapterMap.has(heading)) chapterMap.set(heading, new Map());

    for (const { name, location } of entities) {
      const wikiSlug = KNOWN_ARTICLES.get(name);
      if (!wikiSlug) continue;

      const url = `${WIKIPEDIA_BASE}${wikiSlug}`;
      const entryMap = chapterMap.get(heading);

      if (!entryMap.has(name)) {
        entryMap.set(name, {
          name,
          slug: wikiSlug,
          url,
          occurrences: [],
          status: 'pending'
        });
      }

      entryMap.get(name).occurrences.push({
        location,
        context: getContext(text, location)
      });
    }
  }

  const suggestions = [];

  for (const [chapter, entryMap] of chapterMap) {
    for (const entry of entryMap.values()) {
      suggestions.push({
        id: suggestions.length + 1,
        chapter,
        caesar: caesarData.metadata.name,
        entity: entry.name,
        slug: entry.slug,
        url: entry.url,
        occurrenceCount: entry.occurrences.length,
        contexts: entry.occurrences.slice(0, 3).map((occurrence) => occurrence.context),
        status: entry.status
      });
    }
  }

  return suggestions;
}

export function buildReviewMarkdown(slug, caesarData, suggestions) {
  const byChapter = new Map();

  for (const suggestion of suggestions) {
    if (!byChapter.has(suggestion.chapter)) byChapter.set(suggestion.chapter, []);
    byChapter.get(suggestion.chapter).push(suggestion);
  }

  let markdown = `# Wikipedia Link Suggestions: ${caesarData.metadata.name}\n\n`;
  markdown += `**Source:** ${caesarData.metadata.source}\n`;
  markdown += `**Suggestions:** ${suggestions.length} entities across ${byChapter.size} chapters\n`;
  markdown += `**Review file:** suggestions/${slug}-wikipedia-suggestions.json\n\n`;
  markdown += `---\n\n`;
  markdown += `## How to review\n\n`;
  markdown += `1. Open suggestions/${slug}-wikipedia-suggestions.json\n`;
  markdown += '2. For each entry set `status`: `approved` | `rejected` | `edited`\n';
  markdown += '3. For `edited`: add `"editedUrl": "https://en.wikipedia.org/wiki/Exact_Page"`\n';
  markdown += `4. Run: \`node scripts/suggest-wikipedia-links.mjs --caesar=${slug} --apply\`\n\n`;
  markdown += `---\n\n`;

  let entityNumber = 0;

  for (const [chapter, entries] of byChapter) {
    markdown += `## ${chapter}\n\n`;

    for (const suggestion of entries) {
      entityNumber++;
      markdown += `### ${entityNumber}. [${suggestion.entity}](${suggestion.url})\n`;
      markdown += `**Occurrences:** ${suggestion.occurrenceCount}\n`;
      markdown += `**Slug:** \`${suggestion.slug}\`\n`;
      markdown += `**Status:** \`${suggestion.status}\`\n\n`;

      for (const context of suggestion.contexts) {
        markdown += `> ${context}\n\n`;
      }
    }
  }

  return markdown;
}

export function normalizeSuggestionUrl(suggestion) {
  const candidateUrl = suggestion.status === 'edited' ? suggestion.editedUrl : suggestion.url;
  return isSafeWikipediaUrl(candidateUrl) ? candidateUrl : null;
}
