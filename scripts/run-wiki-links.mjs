#!/usr/bin/env node
/**
 * run-wiki-links.mjs
 * Auto-approve + apply new Wikipedia link suggestions for one or more Caesar slugs.
 * Usage: node run-wiki-links.mjs <slug> [slug2 ...]
 */
import { spawnSync } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const cwd = process.cwd();
const CONTENT_DIR = join(cwd, 'docs', 'content');
const SUGGESTIONS_DIR = join(cwd, 'suggestions');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node run-wiki-links.mjs <slug> [slug2 ...]');
  process.exit(1);
}

const slugs = args;

function run(cmd) {
  const parts = cmd.split(' ');
  const res = spawnSync(parts[0], parts.slice(1), {
    cwd,
    encoding: 'utf-8',
    stdio: 'pipe'
  });
  return res;
}

const results = [];

for (const slug of slugs) {
  const suggestionsPath = join(SUGGESTIONS_DIR, `${slug}-wikipedia-suggestions.json`);

  // Step 1: generate suggestions
  console.log(`[${slug}] Generating suggestions...`);
  const suggest = run(`node scripts/suggest-wikipedia-links.mjs --caesar=${slug} --dry-run`);
  if (suggest.status !== 0) {
    console.error(`[${slug}] suggest failed: ${suggest.stderr}`);
    results.push({ slug, status: 'error', note: 'suggest failed' });
    continue;
  }

  // Step 2: load suggestions and auto-approve anything not rejected
  let suggestions;
  try {
    suggestions = JSON.parse(readFileSync(suggestionsPath, 'utf-8'));
  } catch {
    console.warn(`[${slug}] No suggestions file — skipping`);
    results.push({ slug, status: 'skipped', note: 'no suggestions' });
    continue;
  }

  const approvedCount = suggestions.filter(s => s.status === 'pending').length;
  suggestions = suggestions.map(s =>
    s.status === 'pending' ? { ...s, status: 'approved' } : s
  );
  writeFileSync(suggestionsPath, JSON.stringify(suggestions, null, 2));
  console.log(`[${slug}] Approved ${approvedCount} pending suggestions`);

  // Step 3: apply
  console.log(`[${slug}] Applying approved links...`);
  const apply = run(`node scripts/suggest-wikipedia-links.mjs --caesar=${slug} --apply`);
  if (apply.status !== 0) {
    console.error(`[${slug}] apply failed: ${apply.stderr}`);
    results.push({ slug, status: 'error', note: 'apply failed' });
    continue;
  }

  const output = apply.stdout.trim();
  console.log(`[${slug}] ${output}`);
  results.push({ slug, status: 'ok', approved: approvedCount });
}

console.log('\n=== Summary ===');
for (const r of results) {
  if (r.status === 'ok') {
    console.log(`  ${r.slug}: ${r.approved} links approved + applied`);
  } else {
    console.log(`  ${r.slug}: ${r.status} — ${r.note || ''}`);
  }
}
