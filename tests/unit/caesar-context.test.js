import test from 'node:test';
import assert from 'node:assert/strict';

import { getCaesarContext, getCaesarIndexBySlug } from '../../src/lib/data/caesar-context.js';

test('getCaesarIndexBySlug returns the matching sequence index', () => {
  assert.equal(getCaesarIndexBySlug('julius'), 0);
  assert.equal(getCaesarIndexBySlug('domitian'), 11);
});

test('getCaesarContext returns current, previous, and next caesars', () => {
  const context = getCaesarContext('augustus');

  assert.equal(context.currentCaesar?.name, 'Augustus');
  assert.equal(context.prevCaesar?.name, 'Julius');
  assert.equal(context.nextCaesar?.name, 'Tiberius');
});

test('getCaesarContext returns null neighbors at the bounds', () => {
  assert.equal(getCaesarContext('julius').prevCaesar, null);
  assert.equal(getCaesarContext('domitian').nextCaesar, null);
});

test('getCaesarContext returns nulls for an unknown slug', () => {
  const context = getCaesarContext('not-real');

  assert.equal(context.currentCaesarIndex, -1);
  assert.equal(context.currentCaesar, null);
  assert.equal(context.prevCaesar, null);
  assert.equal(context.nextCaesar, null);
});
