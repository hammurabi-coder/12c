#!/usr/bin/env node
/**
 * apply-wikipedia-links.mjs
 * Reads approved suggestions JSON files and injects wikiLinks maps into
 * each biography's static/content/<slug>.json sections.
 *
 * wikiLinks is a map: entity_name → { url, contexts }
 * The Biography component uses this to render <a> tags over matching text.
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR  = join(__dirname, '../static/content');
const SUGGESTIONS_DIR = join(__dirname, '../suggestions');

function isSafeWikipediaUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname === 'en.wikipedia.org' && parsed.pathname.startsWith('/wiki/');
  } catch {
    return false;
  }
}

// ── Load all approved/edited links grouped by [slug][chapter][entity] ──────────
const allLinks = {};

const suggestionFiles = readdirSync(SUGGESTIONS_DIR)
  .filter(f => f.endsWith('-wikipedia-suggestions.json'));

for (const file of suggestionFiles) {
  const slug = file.replace('-wikipedia-suggestions.json', '');
  const raw = readFileSync(join(SUGGESTIONS_DIR, file), 'utf8');
  const suggestions = JSON.parse(raw);

  for (const entry of suggestions) {
    if (entry.status !== 'approved' && entry.status !== 'edited') continue;

    const chapter = entry.chapter;   // e.g. "Chapter 1"
    const entity  = entry.entity.trim();
    const url     = entry.url || entry.wikipedia_url;

    if (!entity || !url || !isSafeWikipediaUrl(url)) continue;

    allLinks[slug] ??= {};
    allLinks[slug][chapter] ??= {};
    // Take first approved URL per entity per chapter
    if (!allLinks[slug][chapter][entity]) {
      allLinks[slug][chapter][entity] = url;
    }
  }
}

// ── Patch each biography JSON ───────────────────────────────────────────────────
let patched = 0;

const contentFiles = readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json') && f !== 'metadata.schema.json');

for (const file of contentFiles) {
  const slug = file.replace('.json', '');
  if (!allLinks[slug]) continue;

  const contentPath = join(CONTENT_DIR, file);
  const raw = readFileSync(contentPath, 'utf8');
  const bio = JSON.parse(raw);

  let changed = false;
  for (const section of bio.sections) {
    const chapter = section.heading; // "Chapter 1", "Chapter 2", etc.
    if (allLinks[slug][chapter]) {
      section.wikiLinks = { ...allLinks[slug][chapter] };
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(contentPath, JSON.stringify(bio, null, 2));
    patched++;
    console.log(`Patched: ${slug}`);
  }
}

console.log(`\nDone — ${patched} biographies updated.`);
