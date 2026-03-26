#!/usr/bin/env node

import { writeFileSync } from 'fs';
import { join } from 'path';

import { ensureSuggestionsDir, CONTENT_DIR } from './lib/wiki-link-paths.mjs';
import {
  buildReviewMarkdown,
  generateSuggestions,
  getReviewPath,
  getSuggestionsPath,
  listBiographySlugs,
  loadBiography,
  readSuggestions,
  writeReview,
  writeSuggestions
} from './lib/wiki-link-suggestions.mjs';
import { collectApprovedLinks, applyChapterWikiLinks } from './lib/wiki-link-apply.mjs';

// ─── CLI ─────────────────────────────────────────────────────────────────────

const args      = process.argv.slice(2);
const dryRun    = args.includes('--dry-run') || args.includes('--review');
const apply     = args.includes('--apply');
const noVerify  = args.includes('--no-verify');
const caesarArg = args.find(a => a.startsWith('--caesar='))?.split('=')[1];

ensureSuggestionsDir();

if (!caesarArg) {
  const slugs = listBiographySlugs();
  console.error(
    `Usage: node scripts/suggest-wikipedia-links.mjs --caesar=<slug> [--dry-run|--apply] [--no-verify]\nSlugs: ${slugs.join(', ')}`
  );
  process.exit(1);
}

const suggestionsPath = getSuggestionsPath(caesarArg);
const reviewPath = getReviewPath(caesarArg);

if (dryRun) {
  const caesarData = loadBiography(caesarArg);
  const suggestions = generateSuggestions(caesarData);
  writeSuggestions(caesarArg, suggestions);
  writeReview(caesarArg, buildReviewMarkdown(caesarArg, caesarData, suggestions));
  console.log(`Wrote ${suggestions.length} suggestions to:`);
  console.log(`  JSON: ${suggestionsPath}`);
  console.log(`  Review: ${reviewPath}`);
}

if (apply) {
  const caesarData = loadBiography(caesarArg);
  const suggestions = readSuggestions(caesarArg);
  const approvedLinks = collectApprovedLinks({ [caesarArg]: suggestions });
  const { biography: result } = applyChapterWikiLinks(caesarData, approvedLinks[caesarArg] ?? {});
  const outputPath = join(CONTENT_DIR, `${caesarArg}.json`);
  writeFileSync(outputPath, JSON.stringify(result, null, 2));

  const approved = suggestions.filter((s) => s.status === 'approved' || s.status === 'edited').length;
  const rejected = suggestions.filter((s) => s.status === 'rejected').length;
  const pending = suggestions.filter((s) => s.status === 'pending').length;

  console.log(`Applied ${approved} links, ${rejected} rejected, ${pending} unchanged`);
  console.log(`Output: ${outputPath}`);
}
