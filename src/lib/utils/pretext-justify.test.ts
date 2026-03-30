import { describe, it, expect } from 'vitest';
import {
  computeInflation,
  SPARSE_THRESHOLD,
  MAX_INFLATION,
  LINE_WRAPPER_CLASS,
} from './pretext-justify';

describe('computeInflation', () => {
  it('returns no inflation when line counts match', () => {
    const result = computeInflation([5, 3, 4], [5, 3, 4]);
    expect(result.size).toBe(0);
  });

  it('inflates EN when LAT has more lines', () => {
    // EN=[6,7], LAT=[8,9] — ratios stay under 1.35 cap
    // raw: (8.5/6.5)=1.308, (9.5/7.5)=1.267
    const result = computeInflation([6, 7], [8, 9]);
    expect(result.get(0)).toBeCloseTo((8 + 0.5) / (6 + 0.5), 2);
    expect(result.get(1)).toBeCloseTo((9 + 0.5) / (7 + 0.5), 2);
  });

  it('inflates LAT when EN has more lines', () => {
    // LAT=[6,7], EN=[8,9] — ratios stay under 1.35 cap
    const result = computeInflation([6, 7], [8, 9]);
    expect(result.get(0)).toBeCloseTo((8 + 0.5) / (6 + 0.5), 2);
    expect(result.get(1)).toBeCloseTo((9 + 0.5) / (7 + 0.5), 2);
  });

  it('skips paragraphs with no deficit', () => {
    // own=[6,5,8], partner=[8,5,10]
    // p0: 8>6 → inflate p0; p1: 5===5 → skip; p2: 10>8 → inflate p2
    const result = computeInflation([6, 5, 8], [8, 5, 10]);
    expect(result.has(0)).toBe(true);
    expect(result.has(1)).toBe(false); // 5 === 5
    expect(result.has(2)).toBe(true);
  });

  it('caps inflation at MAX_INFLATION', () => {
    // EN has 1 line, LAT has 20 lines → raw = 20.5/1.5 ≈ 13.7, capped to 1.15
    const result = computeInflation([1], [20]);
    expect(result.get(0)).toBe(MAX_INFLATION);
  });

  it('handles empty arrays gracefully', () => {
    expect(computeInflation([], []).size).toBe(0);
  });

  it('handles mismatched array lengths — loops to shorter', () => {
    // own has 2, partner has 3 — only first 2 paragraphs considered
    const result = computeInflation([3, 4], [5, 6, 7]);
    expect(result.size).toBe(2);   // only 2 paragraphs considered
    expect(result.get(0)).toBeLessThanOrEqual(MAX_INFLATION);
    expect(result.get(1)).toBeLessThanOrEqual(MAX_INFLATION);
  });
});

describe('constants', () => {
  it('SPARSE_THRESHOLD is 0.80', () => {
    expect(SPARSE_THRESHOLD).toBe(0.8);
  });

  it('MAX_INFLATION is 1.35', () => {
    expect(MAX_INFLATION).toBe(1.35);
  });

  it('LINE_WRAPPER_CLASS is ptx-line', () => {
    expect(LINE_WRAPPER_CLASS).toBe('ptx-line');
  });
});
