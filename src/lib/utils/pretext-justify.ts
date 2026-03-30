/**
 * Pretext-based justified alignment utilities.
 *
 * Idea 4 — Single-language: sparse lines (fill < 80%) get explicit width
 *          so they're left-aligned instead of awkwardly justified.
 * Idea 5 — Bilingual: the shorter column inflates its lines via justified
 *          spacing to match the taller column's paragraph boundaries.
 */
import { browser } from '$app/environment';

// ---------------------------------------------------------------------------
// Pretext lazy-load
// ---------------------------------------------------------------------------

type LayoutLine = {
  text: string;
  width: number;
};

type PreparedHandle = object; // opaque

let _prepare: ((
  text: string,
  font: string,
  options?: object
) => PreparedHandle) | null = null;
let _layoutLines: ((
  prepared: PreparedHandle,
  maxWidth: number,
  lineHeight: number
) => {
  lines: LayoutLine[];
  height: number;
  lineCount: number;
}) | null = null;

async function ensureReady() {
  if (!browser || _prepare) return;
  const mod = await import('@chenglou/pretext');
  _prepare = mod.prepareWithSegments;
  _layoutLines = mod.layoutWithLines;
}

// ---------------------------------------------------------------------------
// DOM measurement helpers (mirror pretext-measure.ts)
// ---------------------------------------------------------------------------

function buildFontSpec(el: HTMLElement): string {
  const style = getComputedStyle(el);
  const size = parseFloat(style.fontSize);
  const family = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
  const weight = style.fontWeight === 'normal' ? '400' : style.fontWeight;
  return `${weight} ${size}px ${family}`;
}

function getLineHeightPx(el: HTMLElement): number {
  const style = getComputedStyle(el);
  const lh = style.lineHeight;
  if (lh.endsWith('px')) return parseFloat(lh);
  return parseFloat(lh) * parseFloat(style.fontSize);
}

function getContentWidth(el: HTMLElement): number {
  const style = getComputedStyle(el);
  const pl = parseFloat(style.paddingLeft) || 0;
  const pr = parseFloat(style.paddingRight) || 0;
  return Math.floor(el.clientWidth - pl - pr);
}

// ---------------------------------------------------------------------------
// Public types & constants
// ---------------------------------------------------------------------------

export type LineAnalysis = {
  lines: LayoutLine[];
  fillRatios: number[];
  avgFill: number;
};

export type ParagraphLayout = {
  lines: LineEntry[];
  inflationFactor: number;
};

export type LineEntry = {
  text: string;
  width: number;
  sparse: boolean;
  /** Inflated pixel width when bilingual inflation is active */
  inflatedWidth?: number;
};

export const SPARSE_THRESHOLD = 0.80;
export const LINE_WRAPPER_CLASS = 'ptx-line';
export const MAX_INFLATION = 1.35; // cap inflation to avoid absurdly wide lines

// ---------------------------------------------------------------------------
// Core analysis
// ---------------------------------------------------------------------------

/**
 * Analyze a paragraph's lines using Pretext.
 * Returns per-line data and fill statistics, or null on failure.
 */
export async function analyzeParagraph(
  el: HTMLElement
): Promise<LineAnalysis | null> {
  if (!browser) return null;
  await ensureReady();
  if (!_prepare || !_layoutLines) return null;

  const font = buildFontSpec(el);
  const lineHeight = getLineHeightPx(el);
  const maxWidth = getContentWidth(el);
  const text = el.textContent ?? '';

  try {
    const prepared = _prepare(text, font);
    const result = _layoutLines(prepared, maxWidth, lineHeight);

    const lines: LayoutLine[] = result.lines.map((l: LayoutLine) => ({
      text: l.text,
      width: l.width,
    }));

    const fillRatios = lines.map((l) => l.width / maxWidth);
    const avgFill =
      fillRatios.length > 0
        ? fillRatios.reduce((a, b) => a + b, 0) / fillRatios.length
        : 1;

    return { lines, fillRatios, avgFill };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Bilingual inflation (Idea 5)
// ---------------------------------------------------------------------------

/**
 * Compute per-paragraph inflation factors for bilingual column alignment.
 *
 * @param ownCounts      Line counts per paragraph in the column that inflates
 * @param partnerCounts  Line counts per paragraph in the partner column
 */
export function computeInflation(
  ownCounts: number[],
  partnerCounts: number[]
): Map<number, number> {
  const inflations = new Map<number, number>();

  for (
    let i = 0;
    i < Math.min(ownCounts.length, partnerCounts.length);
    i++
  ) {
    const own = ownCounts[i];
    const partner = partnerCounts[i];
    if (partner > own) {
      // Add 0.5 smoothing to avoid extreme ratios at low line counts
      const raw = (partner + 0.5) / (own + 0.5);
      inflations.set(i, Math.min(raw, MAX_INFLATION));
    }
    // if own >= partner: no inflation needed
  }

  return inflations;
}

// ---------------------------------------------------------------------------
// Build a ParagraphLayout from an HTMLElement with optional inflation
// ---------------------------------------------------------------------------

/**
 * Measure a single paragraph and return a reactive-ready layout structure.
 * @param el             The <p> element to measure
 * @param inflationFactor  Optional per-paragraph inflation multiplier (Idea 5)
 */
export async function measureParagraph(
  el: HTMLElement,
  inflationFactor = 1
): Promise<ParagraphLayout | null> {
  const analysis = await analyzeParagraph(el);
  if (!analysis) return null;

  const { lines, fillRatios } = analysis;

  const entries: LineEntry[] = lines.map((line, li) => {
    const sparse = fillRatios[li] < SPARSE_THRESHOLD;
    return {
      text: line.text,
      width: line.width,
      sparse,
      inflatedWidth:
        inflationFactor !== 1
          ? Math.round(line.width * inflationFactor)
          : undefined,
    };
  });

  return { lines: entries, inflationFactor };
}

/**
 * Measure all paragraphs in a column, applying per-paragraph inflation.
 */
export async function measureColumn(
  els: HTMLElement[],
  inflation?: Map<number, number>
): Promise<ParagraphLayout[]> {
  return Promise.all(
    els.map((el, i) => {
      const factor = inflation?.get(i) ?? 1;
      return measureParagraph(el, factor);
    })
  );
}
