import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import { CONTENT_DIR, SUGGESTIONS_DIR } from './wiki-link-paths.mjs';
import { normalizeSuggestionUrl } from './wiki-link-suggestions.mjs';

export function collectApprovedLinks(suggestionsBySlug) {
  const allLinks = {};

  for (const [slug, suggestions] of Object.entries(suggestionsBySlug)) {
    for (const suggestion of suggestions) {
      if (suggestion.status !== 'approved' && suggestion.status !== 'edited') continue;

      const chapter = suggestion.chapter;
      const entity = suggestion.entity?.trim();
      const url = normalizeSuggestionUrl(suggestion);

      if (!entity || !url) continue;

      allLinks[slug] ??= {};
      allLinks[slug][chapter] ??= {};

      if (!allLinks[slug][chapter][entity]) {
        allLinks[slug][chapter][entity] = url;
      }
    }
  }

  return allLinks;
}

export function applyChapterWikiLinks(biography, chapterLinks) {
  const result = JSON.parse(JSON.stringify(biography));
  let changed = false;

  for (const section of result.sections) {
    const sectionLinks = chapterLinks[section.heading];
    if (!sectionLinks) continue;
    
    const nextLinks = { ...(section.wikiLinks || {}), ...sectionLinks };
    if (JSON.stringify(section.wikiLinks) !== JSON.stringify(nextLinks)) {
      section.wikiLinks = nextLinks;
      changed = true;
    }
  }

  return { biography: result, changed };
}

export function loadSuggestionsBySlug() {
  const suggestionsBySlug = {};
  const suggestionFiles = readdirSync(SUGGESTIONS_DIR).filter((file) =>
    file.endsWith('-wikipedia-suggestions.json')
  );

  for (const file of suggestionFiles) {
    const slug = file.replace('-wikipedia-suggestions.json', '');
    suggestionsBySlug[slug] = JSON.parse(readFileSync(join(SUGGESTIONS_DIR, file), 'utf8'));
  }

  return suggestionsBySlug;
}

export function patchBiographyFiles(allLinks) {
  let patched = 0;

  const contentFiles = readdirSync(CONTENT_DIR).filter(
    (file) => file.endsWith('.json') && file !== 'metadata.schema.json'
  );

  for (const file of contentFiles) {
    const slug = file.replace('.json', '');
    if (!allLinks[slug]) continue;

    const contentPath = join(CONTENT_DIR, file);
    const biography = JSON.parse(readFileSync(contentPath, 'utf8'));
    const { biography: nextBiography, changed } = applyChapterWikiLinks(biography, allLinks[slug]);

    if (!changed) continue;

    writeFileSync(contentPath, JSON.stringify(nextBiography, null, 2));
    patched++;
    console.log(`Patched: ${slug}`);
  }

  return patched;
}
