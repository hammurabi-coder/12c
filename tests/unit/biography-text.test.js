import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyWikiLinks,
  buildLinkedParagraphs,
  escapeHtml,
  isSafeWikipediaUrl,
  splitParagraphs
} from '../../src/lib/utils/biography-text.js';

test('splitParagraphs returns empty array for blank input', () => {
  assert.deepEqual(splitParagraphs('   '), []);
});

test('splitParagraphs splits on double newlines', () => {
  assert.deepEqual(splitParagraphs('One\n\nTwo'), ['One', 'Two']);
});

test('escapeHtml escapes HTML-significant characters', () => {
  assert.equal(escapeHtml('<tag> & text'), '&lt;tag&gt; &amp; text');
});

test('isSafeWikipediaUrl only allows https English Wikipedia article URLs', () => {
  assert.equal(isSafeWikipediaUrl('https://en.wikipedia.org/wiki/Augustus'), true);
  assert.equal(isSafeWikipediaUrl('http://en.wikipedia.org/wiki/Augustus'), false);
  assert.equal(isSafeWikipediaUrl('https://example.com/wiki/Augustus'), false);
  assert.equal(isSafeWikipediaUrl('javascript:alert(1)'), false);
});

test('applyWikiLinks escapes text before link insertion', () => {
  const result = applyWikiLinks('<Augustus>', {
    Augustus: 'https://en.wikipedia.org/wiki/Augustus'
  });

  assert.match(result, /&lt;<a href="https:\/\/en\.wikipedia\.org\/wiki\/Augustus"/);
  assert.doesNotMatch(result, /<script>/);
});

test('applyWikiLinks ignores unsafe URLs', () => {
  const result = applyWikiLinks('Augustus', {
    Augustus: 'javascript:alert(1)'
  });

  assert.equal(result, 'Augustus');
});

test('applyWikiLinks prefers longer overlapping entity names', () => {
  const result = applyWikiLinks('Julius Caesar defeated Caesar.', {
    'Julius Caesar': 'https://en.wikipedia.org/wiki/Julius_Caesar',
    Caesar: 'https://en.wikipedia.org/wiki/Caesar_(title)'
  });

  assert.match(result, /Julius Caesar<\/a> defeated /);
  assert.match(result, /href="https:\/\/en\.wikipedia\.org\/wiki\/Julius_Caesar"/);
  assert.match(result, /href="https:\/\/en\.wikipedia\.org\/wiki\/Caesar_\(title\)"/);
});

test('buildLinkedParagraphs returns linked paragraph HTML and respects disabled state', () => {
  const links = { Augustus: 'https://en.wikipedia.org/wiki/Augustus' };

  assert.deepEqual(buildLinkedParagraphs('Augustus\n\nRome', links), [
    '<a href="https://en.wikipedia.org/wiki/Augustus" class="wiki-link" target="_blank" rel="noopener noreferrer">Augustus</a>',
    'Rome'
  ]);

  assert.deepEqual(buildLinkedParagraphs('Augustus', links, { enabled: false }), ['Augustus']);
});
