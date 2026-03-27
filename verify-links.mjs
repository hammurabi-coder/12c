#!/usr/bin/env node
/**
 * verify-links.mjs
 *
 * For each wikiLink in the static/content/ JSON files, extracts the
 * surrounding Suetonius context, queries Wikipedia with "Suetonius"
 * appended to disambiguate, and compares the linked article vs the
 * suggested article. Outputs a markdown table and emails it.
 */

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import smtplib from 'smtplib';
import { MIMEText, MIMEMultipart } from 'mime';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php';
const CONTENT_DIR = join(__dirname, 'static', 'content');
const OUTPUT_PATH = join(__dirname, 'verify_links.md');

// ── Wikipedia helpers ───────────────────────────────────────────────────────────

async function wikipediaSearch(query) {
  const url = `${WIKIPEDIA_API}?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=1`;
  const resp = await fetch(url);
  const data = await resp.json();
  const hits = data?.query?.search ?? [];
  if (!hits.length) return null;
  return hits[0].title;
}

function extractTitleFromUrl(url) {
  if (!url) return '';
  return decodeURIComponent(url.split('/').pop().replace(/_/g, ' '));
}

// ── Context extraction ────────────────────────────────────────────────────────

function getContext(text, location, radius = 80) {
  const start = Math.max(0, location - radius);
  const end = Math.min(text.length, location + radius);
  let excerpt = text.slice(start, end).replace(/\n/g, ' ').replace(/\s+/g, ' ');
  if (start > 0) excerpt = '...' + excerpt;
  if (end < text.length) excerpt = excerpt + '...';
  return excerpt;
}

// ── Load all emperor data ─────────────────────────────────────────────────────

function loadAllEmperors() {
  const files = readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json'));
  const emperors = [];
  for (const file of files) {
    const slug = file.replace('.json', '');
    const data = JSON.parse(readFileSync(join(CONTENT_DIR, file), 'utf-8'));
    emperors.push({ slug, data });
  }
  return emperors;
}

function collectLinksWithContext(emperors) {
  const collected = new Map(); // name -> { url, contexts[], slug }

  for (const { slug, data } of emperors) {
    const allText = data.sections.map(s => s.en).join('\n');

    for (const section of data.sections) {
      const text = section.en;
      const wikiLinks = section.wikiLinks ?? {};

      for (const [name, url] of Object.entries(wikiLinks)) {
        if (!name || !url) continue;

        // Find all occurrences of name in the full emperor text
        const regex = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        let match;
        const contexts = [];
        while ((match = regex.exec(text)) !== null) {
          contexts.push(getContext(text, match.index));
        }

        if (!collected.has(name)) {
          collected.set(name, { url, contexts: [], slug });
        } else {
          // Merge contexts, keep unique
          const existing = collected.get(name);
          for (const ctx of contexts) {
            if (!existing.contexts.includes(ctx)) existing.contexts.push(ctx);
          }
        }
      }
    }
  }

  return collected;
}

// ── Markdown builder ──────────────────────────────────────────────────────────

function buildMarkdown(results) {
  const lines = [
    '# Suetonius Links — Disambiguation Verification\n',
    '*Powered by Wikipedia search with "Suetonius" appended for disambiguation*\n',
    '## How to read this\n',
    '- **Linked Article** = what we currently have in the JSON\n',
    '- **Suggested Article** = top Wikipedia result when searching "Name Suetonius" + context\n',
    '- **Match?** = ✓ if they agree, ✗ if they diverge\n',
    '---\n',
    '| Name | Context (first occurrence) | Linked Article | Suggested (Suetonius) | Match? |',
    '|-|<-|<-|<-|-:|',
  ];

  for (const r of results) {
    const ctx = r.context.length > 120 ? r.context.slice(0, 120) + '...' : r.context;
    lines.push(
      `| ${r.name} | ${ctx} | ${r.linkedTitle} | ${r.suggestedTitle} | ${r.match} |`
    );
  }

  const stats = {
    total: results.length,
    match: results.filter(r => r.match === '✓').length,
    mismatch: results.filter(r => r.match === '✗').length,
    uncertain: results.filter(r => r.match === '?').length,
  };

  lines.push(
    '\n## Summary\n',
    `- **Total unique links verified:** ${stats.total}`,
    `- **✓ Matches:** ${stats.match}`,
    `- **✗ Mismatches:** ${stats.mismatch}`,
    `- **? Uncertain:** ${stats.uncertain}`,
  );

  if (stats.mismatch > 0) {
    lines.push(
      '\n## Mismatches to review\n',
      ...results
        .filter(r => r.match === '✗')
        .map(r => `- **${r.name}** → currently "${r.linkedTitle}" but Wikipedia+Suetonius suggests "${r.suggestedTitle}"`)
    );
  }

  return lines.join('\n');
}

// ── Email ─────────────────────────────────────────────────────────────────────

async function sendEmail(markdownContent, toEmail) {
  const msg = new MIMEMultipart();
  msg['Subject'] = 'Suetonius Links — Disambiguation Verification';
  msg['From'] = 'bushap5000@gmail.com';
  msg['To'] = toEmail;

  const body = (
    'Verification report attached. Check the Match column:\n'
    + '- ✓ = linked article matches Wikipedia+Suetonius disambiguation\n'
    + '- ✗ = mismatch, review needed\n'
    + '- ? = no suggestion found\n\n'
    + 'Run by your frontier model for a second opinion.\n'
    + 'Pay special attention to ✗ rows — those are likely wrong article picks.'
  );
  msg.attach(new MIMEText(body, 'plain'));

  const attachment = new MIMEText(markdownContent, 'markdown');
  attachment.addHeader('Content-Disposition', 'attachment', filename='verify_links.md');
  msg.attach(attachment);

  const GMAIL_USER = 'bushap5000@gmail.com';
  const GMAIL_APP_PASSWORD = 'chchmqtghfiptkte';

  const server = smtplib.SMTP('smtp.gmail.com', 587);
  server.setDebugLevel(0);
  server.connect();
  server.starttls();
  server.login(GMAIL_USER, GMAIL_APP_PASSWORD);
  server.sendMessage(msg);
  server.quit();

  console.log(`Email sent to ${toEmail}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Loading emperor data...');
  const emperors = loadAllEmperors();
  console.log(`Loaded ${emperors.length} emperors`);

  console.log('Collecting wikiLinks...');
  const collected = collectLinksWithContext(emperors);
  console.log(`Found ${collected.size} unique linked names`);

  const results = [];
  let i = 0;

  for (const [name, { url, contexts, slug }] of collected.entries()) {
    i++;
    const linkedTitle = extractTitleFromUrl(url);
    const context = contexts[0] ?? '';

    // Build search query: name + "Suetonius" + short context snippet
    const contextSnippet = context.replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
    const searchQuery = contextSnippet
      ? `${name} Suetonius ${contextSnippet}`
      : `${name} Suetonius`;

    console.log(`[${i}/${collected.size}] ${name} → searching "${searchQuery}"`);

    const suggestedTitle = await wikipediaSearch(searchQuery);

    let match = '?';
    if (suggestedTitle && linkedTitle) {
      const normLinked = linkedTitle.toLowerCase().replace(/\s*\(\w+\)/g, '').replace(/[_-]/g, ' ');
      const normSuggested = suggestedTitle.toLowerCase().replace(/\s*\(\w+\)/g, '').replace(/[_-]/g, ' ');
      match = normLinked === normSuggested ? '✓' : '✗';
    } else if (!suggestedTitle) {
      match = '? (no wiki suggestion)';
    }

    results.push({ name, context, linkedTitle, suggestedTitle: suggestedTitle || '(none)', match });
  }

  console.log('\nBuilding markdown...');
  const md = buildMarkdown(results);

  writeFileSync(OUTPUT_PATH, md);
  console.log(`Markdown saved to ${OUTPUT_PATH}`);

  const mismatches = results.filter(r => r.match === '✗').length;
  console.log(`\nResults: ${results.length} total, ${mismatches} mismatches`);

  if (mismatches > 0) {
    console.log('\nMismatches:');
    for (const r of results.filter(r => r.match === '✗')) {
      console.log(`  ✗ ${r.name}: linked "${r.linkedTitle}" vs suggested "${r.suggestedTitle}"`);
    }
  }

  console.log('\nSending email...');
  await sendEmail(md, 'shapiro.peter@gmail.com');
  console.log('Done.');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
