import test from 'node:test';
import assert from 'node:assert/strict';

import { applyChapterWikiLinks, collectApprovedLinks } from '../../scripts/lib/wiki-link-apply.mjs';
import { extractEntities, generateSuggestions, normalizeSuggestionUrl } from '../../scripts/lib/wiki-link-suggestions.mjs';
import { isSafeWikipediaUrl } from '../../scripts/lib/wiki-link-validation.mjs';

test('isSafeWikipediaUrl accepts only https English Wikipedia article URLs', () => {
  assert.equal(isSafeWikipediaUrl('https://en.wikipedia.org/wiki/Augustus'), true);
  assert.equal(isSafeWikipediaUrl('http://en.wikipedia.org/wiki/Augustus'), false);
  assert.equal(isSafeWikipediaUrl('javascript:alert(1)'), false);
});

test('extractEntities filters unknown and excluded matches', () => {
  const entities = extractEntities('Augustus sailed to Rome with Magnus.');
  assert.deepEqual(
    entities.map((entity) => entity.name),
    ['Augustus', 'Rome']
  );
});

test('generateSuggestions groups duplicate entities per chapter', () => {
  const suggestions = generateSuggestions({
    metadata: { name: 'Augustus', source: 'Test' },
    sections: [
      {
        heading: 'Chapter 1',
        en: 'Augustus came to Rome. Augustus then left Rome.',
        la: ''
      }
    ]
  });

  assert.equal(suggestions.length, 2);
  assert.equal(suggestions.find((entry) => entry.entity === 'Augustus')?.occurrenceCount, 2);
  assert.equal(suggestions.find((entry) => entry.entity === 'Rome')?.occurrenceCount, 2);
});

test('normalizeSuggestionUrl prefers safe edited URLs and rejects unsafe ones', () => {
  assert.equal(
    normalizeSuggestionUrl({
      status: 'edited',
      editedUrl: 'https://en.wikipedia.org/wiki/Augustus',
      url: 'https://en.wikipedia.org/wiki/Rome'
    }),
    'https://en.wikipedia.org/wiki/Augustus'
  );

  assert.equal(
    normalizeSuggestionUrl({
      status: 'edited',
      editedUrl: 'javascript:alert(1)',
      url: 'https://en.wikipedia.org/wiki/Rome'
    }),
    null
  );
});

test('collectApprovedLinks keeps only approved safe links', () => {
  const approvedLinks = collectApprovedLinks({
    augustus: [
      {
        chapter: 'Chapter 1',
        entity: 'Augustus',
        status: 'approved',
        url: 'https://en.wikipedia.org/wiki/Augustus'
      },
      {
        chapter: 'Chapter 1',
        entity: 'Rome',
        status: 'edited',
        editedUrl: 'https://en.wikipedia.org/wiki/Rome',
        url: 'https://en.wikipedia.org/wiki/Roma'
      },
      {
        chapter: 'Chapter 1',
        entity: 'Unsafe',
        status: 'approved',
        url: 'javascript:alert(1)'
      }
    ]
  });

  assert.deepEqual(approvedLinks, {
    augustus: {
      'Chapter 1': {
        Augustus: 'https://en.wikipedia.org/wiki/Augustus',
        Rome: 'https://en.wikipedia.org/wiki/Rome'
      }
    }
  });
});

test('applyChapterWikiLinks adds chapter wikiLinks without mutating input', () => {
  const biography = {
    sections: [
      { heading: 'Chapter 1', en: 'Augustus', la: '' },
      { heading: 'Chapter 2', en: 'Rome', la: '' }
    ]
  };

  const { biography: nextBiography, changed } = applyChapterWikiLinks(biography, {
    'Chapter 1': {
      Augustus: 'https://en.wikipedia.org/wiki/Augustus'
    }
  });

  assert.equal(changed, true);
  assert.deepEqual(nextBiography.sections[0].wikiLinks, {
    Augustus: 'https://en.wikipedia.org/wiki/Augustus'
  });
  assert.equal(biography.sections[0].wikiLinks, undefined);
});
